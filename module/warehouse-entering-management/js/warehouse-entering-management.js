define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("layui");
	require("../../../js/common/common.js");
	var ztPlugins = require("../../common/plugins/js/plugins.js");

	m.init();

	m.plusReady(function() {
		var swaiting = null;
		var twaiting = null;
		var pendingListPullRefresh = null;
		var receivedPullRefresh = null;
		var layer = null;
		var slider = m("#slider").slider();
		
		slider.setStopped(true); //禁止滑动
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		
		var globalVue = new Vue({
			el: '#enteringList',
			data: {
				headTitle: '收货登记列表',
				totalInfo: '0件/0吨',
				isCompleteConfirm: app.getUser().isPrivilege('warehouse:entering:complete:confirm'),
				isReceivingRegister: app.getUser().isPrivilege('warehouse:entering:receiving:register'),
				//			isPrintLabel: app.getUser().isPrivilege('warehouse:entering:register:print'),
				//			isCompleteConfirm: true,
				//			isReceivingRegister: true,
				isPrintLabel: true,
				selectedPendingList: [],
				pendingPage: {
					pendingList: [],
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"packageNo": "",
						"carNo": "", // 车船号
						"ownerId": "", // 货主ID
						"ownerName": "", //货主单位名称
						"forecastCode": "", // 预报单号
						"brandId": "", // 品名ID
						"brandName": "", // 品名
						"beginDate": "", //开始时间
						"endDate": "" //结束时间
					},
				},
				receivedPage: {
					receivedList: [],
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"receivingCode": "", // 收货单号
						"brandId": "", // 品名ID
						"brandName": "", // 品名
						"ownerId": "", // 货主ID
						"ownerName": "", //货主单位名称
						"receivingStart": "", //收货日期输入框前
						"receivingEnd": "" //收货日期输入框后
					},
				}
			},
			methods: {
				printLabel: function($event, item) {
					var self = this;
					event.stopPropagation();
					if(item) {
						//					plus.bluetooth.openBluetoothAdapter({
						//						success: function(e) {
						//							if(app.debug)
						//								console.log('open bluetooth success: ' + JSON.stringify(e));
						//							ztPlugins.printLabel(1, JSON.stringify(item));
						//						},
						//						fail: function(e) {
						//							if(app.debug)
						//								console.log('open bluetooth failed: ' + JSON.stringify(e));
						//						}
						//					});
						if(window.plus) {
							twaiting = plus.nativeUI.showWaiting('处理中...');
						}
						var apiUrl = app.api_url + '/api/proReceiving/detail?_t=' + new Date().getTime();
						m.ajax(apiUrl, {
							data: {
								id: item.id
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 20000, //超时时间设置为10秒；
							success: function(data) {
								if(twaiting) {
									twaiting.close();
								}
								if(app.debug)
									console.log("printLabel:" + JSON.stringify(data));
								if(data) {
									if(data.detailList && data.detailList.length > 0) {
										if(app.debug)
											console.log("printLabel materielList:" + JSON.stringify(data.detailList));
										ztPlugins.printLabel(1, JSON.stringify(data.detailList));
									}
								}
							},
							error: function(xhr, type, errorThrown) {
								if(twaiting) {
									twaiting.close();
								}
								if(app.debug) {
									console.log(xhr + "|" + type + "|" + errorThrown);
								}
								m.toast("网络异常，请重新试试");
							}
						});
					}
				},
				testApp: function(appMsg) {
					alert(appMsg);
				},
				processListItem: function($event, status, id) { // status(0:待收货列表|1:已收货列表)
					var self = this;
					event.stopPropagation();
					if(status == 0) {
						layer.open({
							title: false,
							content: '提示: 确认未收到货?',
							btn: ['确认', '取消'],
							yes: function(index, layero) {
								//按钮【确认】的回调
								var apiUrl = app.api_url + '/api/proReceiving/receiveConfirm?_t=' + new Date().getTime();
								m.ajax(apiUrl, {
									data: {
										id: id
									},
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									timeout: 20000, //超时时间设置为10秒；
									success: function(data) {
										if(data) {
											if(app.debug) {
												console.log(JSON.stringify(data));
											}
											if(data.status) {
												self.doPendingListQuery({
													"pageNo": 1,
													"pageSize": 10,
													"packageNo": self.pendingPage.filterConditions.packageNo,
													"carNo": self.pendingPage.filterConditions.carNo,
													"forecastCode": self.pendingPage.filterConditions.forecastCode,
													"ownerId": self.pendingPage.filterConditions.ownerId,
													"brandId": self.pendingPage.filterConditions.brandId,
													"beginDate": self.pendingPage.filterConditions.beginDate,
													"endDate": self.pendingPage.filterConditions.endDate
												}, function() {
													pendingListPullRefresh.scrollTo(0, 0, 100);
													pendingListPullRefresh.refresh(true);
													var idx = -1;
													if(self.selectedPendingList && self.selectedPendingList.length > 0) {
														m.each(self.selectedPendingList, function(index, itm) {
															if(itm) {
																if(itm.id == id) {
																	idx = index;
																}
															}
														});
													}
													if(idx != -1)
														self.selectedPendingList.splice(idx, 1);
													self.resetPendingListChecked();
													self.buildTotalInfo();
												});
											} else {
												m.toast(data.msg);
											}
										}
									},
									error: function(xhr, type, errorThrown) {
										if(app.debug) {
											console.log(xhr + "|" + type + "|" + errorThrown);
										}
										m.toast("网络异常，请重新试试");
									}
								});
								layer.closeAll();
							},
							btn2: function(index, layero) {
								//按钮【取消】的回调
							},
							cancel: function() {
								//右上角关闭回调
							}
						});
					} else if(status == 1) {
						layer.open({
							title: false,
							content: '提示：删除后无法恢复，请确认!',
							btn: ['确认', '取消'],
							yes: function(index, layero) {
								//按钮【确认】的回调
								var apiUrl = app.api_url + '/api/proReceiving/cancel?_t=' + new Date().getTime();
								m.ajax(apiUrl, {
									data: {
										id: id
									},
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									timeout: 20000, //超时时间设置为10秒；
									success: function(data) {
										if(data) {
											if(app.debug) {
												console.log(JSON.stringify(data));
											}
											if(data.status) {
												self.doReceivedListQuery({
													"pageNo": 1,
													"pageSize": 10,
													"receivingCode": self.receivedPage.filterConditions.receivingCode,
													"brandId": self.receivedPage.filterConditions.brandId,
													"ownerId": self.receivedPage.filterConditions.ownerId,
													"receivingStart": self.receivedPage.filterConditions.receivingStart,
													"receivingEnd": self.receivedPage.filterConditions.receivingEnd,
												}, function() {
													receivedPullRefresh.scrollTo(0, 0, 100);
													receivedPullRefresh.refresh(true);
												});
											} else {
												m.toast(data.msg);
											}
										}
									},
									error: function(xhr, type, errorThrown) {
										if(app.debug) {
											console.log(xhr + "|" + type + "|" + errorThrown);
										}
										m.toast("网络异常，请重新试试");
									}
								});
								layer.closeAll();
							},
							btn2: function(index, layero) {
								//按钮【取消】的回调
							},
							cancel: function() {
								//右上角关闭回调
							}
						});
					}
				},
				onItemSliderClick: function($event, index) {
					var self = this;
					event.stopPropagation();
					slider.gotoItem(index);
				},
				onListCBoxChange: function($event, item) {
					if(app.debug) {
						console.log('onListCBoxChange item:' + JSON.stringify(item));
					}
					var self = this;
					event.stopPropagation();
					var objId = item.cbxId;
					var isChecked = $('#' + item.cbxId).prop("checked");
					var idx = -1;
					var isDiff = false;
					var isExisted = false;
					if(self.selectedPendingList && self.selectedPendingList.length > 0) {
						m.each(self.selectedPendingList, function(index, itm) {
							if(itm) {
								if(itm.id == item.id) {
									idx = index;
									isExisted = true;
								}
								if(itm.forecastId != item.forecastId) {
									isDiff = true;
								}
							}
						});
					}
					if(isChecked) {
						if(isDiff) {
							layer.open({
								title: false,
								content: '提示: 当前所选的预报物料信息与之前所选不同，是否清除之前选项?',
								area: ['100px', '140px'],
								btn: ['是', '否'],
								yes: function(index, layero) {
									//按钮【是】的回调
									self.selectedPendingList = [];
									$("[name=cbx]:checkbox").each(function() {
										var currId = $(this).attr('id');
										if(currId != objId)
											$(this).prop("checked", false);
									});
									self.selectedPendingList.push(item);
									self.buildTotalInfo();
									layer.closeAll();
								},
								btn2: function(index, layero) {
									//按钮【否】的回调
									$('#' + item.cbxId).prop("checked", false);
								},
								cancel: function() {
									//右上角关闭回调
									$('#' + item.cbxId).prop("checked", false);
								}
							});
						} else {
							if(!isExisted)
								self.selectedPendingList.push(item);
							if(self.selectedPendingList.length == self.pendingPage.pendingList.length) {
								$("#cbx_all").prop("checked", true);
							}
						}
					} else {
						$("#cbx_all").prop("checked", false);
						if(idx != -1) {
							self.selectedPendingList.splice(idx, 1);
						}
					}
					if(app.debug) {
						console.log(JSON.stringify(self.selectedPendingList));
					}
					self.buildTotalInfo();
				},
				onCBoxAllChange: function($event) {
					var self = this;
					event.stopPropagation();
					var isChecked = $('#cbx_all').prop("checked");
					var isDiff = false;
					if(self.pendingPage.pendingList && self.pendingPage.pendingList.length > 0) {
						var tmpForecastId = self.pendingPage.pendingList[0].forecastId;
						m.each(self.pendingPage.pendingList, function(index, itm) {
							if(itm) {
								if(itm.forecastId != tmpForecastId) {
									isDiff = true;
								}
							}
						});
					}
					if(isChecked) {
						if(isDiff) {
							layer.open({
								title: false,
								content: '提示: 当前列表含不同入库预报物料信息，请选择同一入库预报物料信息，谢谢！',
								area: ['100px', '140px'],
								btn: ['确认'],
								yes: function(index, layero) {
									//按钮【确认】的回调
									$("#cbx_all").prop("checked", false);
									layer.closeAll();
								},
								cancel: function() {
									//右上角关闭回调
									$("#cbx_all").prop("checked", false);
								}
							});
						} else {
							$("[name=cbx]:checkbox").each(function() {
								$(this).prop("checked", true);
							});
							$("#cbx_all").prop("checked", true);
							self.selectedPendingList = [];
							m.each(self.pendingPage.pendingList, function(index, itm) {
								if(itm) {
									self.selectedPendingList.push(itm);
								}
							});
						}
					} else {
						$("[name=cbx]:checkbox").each(function() {
							$(this).prop("checked", false);
						});
						$("#cbx_all").prop("checked", false);
						self.selectedPendingList = [];
					}
					self.buildTotalInfo();
				},
				onTitleClick: function($event, item) {
					var self = this;
					event.stopPropagation();
					var isChecked = $('#' + item.cbxId).prop("checked");
					$('#' + item.cbxId).prop("checked", !isChecked);
					self.onListCBoxChange(event, item);
				},
				buildTotalInfo: function() {
					var self = this;
					if(self.selectedPendingList && self.selectedPendingList.length > 0) {
						var totalNum = 0;
						var totalWeight = 0.0;
						var numUnitDesc = "";
						var weightUnitDesc = "";
						m.each(self.selectedPendingList, function(index, itm) {
							if(itm) {
								numUnitDesc = itm.numUnitDesc;
								weightUnitDesc = itm.weightUnitDesc;
								var numUnit = itm.num ? parseInt(itm.num) : 0;
								var weight = itm.weight ? parseFloat(itm.weight) : 0;
								totalNum += numUnit;
								totalWeight += weight;
							}
						});
						var totalWeightStr = isDecimal(totalWeight) ? totalWeight.toFixed(3) : totalWeight;
						self.totalInfo = totalNum + numUnitDesc + "/" + totalWeightStr + weightUnitDesc;
					} else {
						self.totalInfo = "0件/0吨";
					}
				},
				resetSelectedPendingList: function() {
					var self = this;
					self.selectedPendingList = [];
					$("#cbx_all").prop("checked", false);
					self.buildTotalInfo();
				},
				resetPendingListChecked: function() {
					var self = this;
					if(self.pendingPage.pendingList && self.pendingPage.pendingList.length > 0) {
						m.each(self.pendingPage.pendingList, function(index, item) {
							if(item) {
								var isChecked = false;
								if(self.selectedPendingList && self.selectedPendingList.length > 0) {
									m.each(self.selectedPendingList, function(index, itm) {
										if(itm) {
											if(itm.id == item.id) {
												isChecked = true;
											}
										}
									});
								}
								item.isChecked = isChecked;
							}
						});
					}
				},
				/*
				 * 打开对应的查询页面
				 */
				openQueryHTML: function(id) {
					var self = this;
					if(id == 'pendingListQuery') {
						m.openWindow({
							id: 'pending-list-query',
							url: '../html/pending-list-query.html',
							show: {
								aniShow: 'pop-in'
							},
							waiting: {
								autoShow: true
							},
							extras: {
								"filterConditions": {
									"packageNo": self.pendingPage.filterConditions.packageNo,
									"carNo": self.pendingPage.filterConditions.carNo,
									"forecastCode": self.pendingPage.filterConditions.forecastCode,
									"ownerId": self.pendingPage.filterConditions.ownerId,
									"ownerName": self.pendingPage.filterConditions.ownerName,
									"brandId": self.pendingPage.filterConditions.brandId,
									"brandName": self.pendingPage.filterConditions.brandName,
									"beginDate": self.pendingPage.filterConditions.beginDate,
									"endDate": self.pendingPage.filterConditions.endDate
								}
							}
						});
					} else if(id == 'receivedListQuery') {
						m.openWindow({
							id: 'received-list-query',
							url: '../html/received-list-query.html',
							show: {
								aniShow: 'pop-in'
							},
							waiting: {
								autoShow: true
							},
							extras: {
								"filterConditions": {
									"receivingCode": self.receivedPage.filterConditions.receivingCode,
									"ownerId": self.receivedPage.filterConditions.ownerId,
									"ownerName": self.receivedPage.filterConditions.ownerName,
									"brandId": self.receivedPage.filterConditions.brandId,
									"brandName": self.receivedPage.filterConditions.brandName,
									"receivingStart": self.receivedPage.filterConditions.receivingStart,
									"receivingEnd": self.receivedPage.filterConditions.receivingEnd
								}
							}
						});
					}
				},
				/*
				 * 收货登记
				 */
				openReceivingRegisterHTML: function() {
					var self = this;
					var idArray = [];
					var isDiff = false;
					if(app.debug) {
						console.log('selectedPendingList:' + JSON.stringify(self.selectedPendingList));
					}
					if(self.selectedPendingList && self.selectedPendingList.length > 0) {
						var tmpForecastId = self.selectedPendingList[0].forecastId;
						m.each(self.selectedPendingList, function(index, itm) {
							if(itm) {
								idArray.push(itm.id);
								if(itm.forecastId != tmpForecastId) {
									isDiff = true;
								}
							}
						});
					}
					if(isDiff) {
						layer.open({
							title: false,
							content: '提示: 当前列表含不同入库预报物料信息，请选择同一入库预报物料信息，谢谢！',
							area: ['100px', '140px'],
							btn: ['确认'],
							yes: function(index, layero) {
								//按钮【确认】的回调
								layer.closeAll();
							},
							cancel: function() {
								//右上角关闭回调
							}
						});
					} else {
						if(!app.getUser().warehouse) {
							layer.open({
								title: false,
								content: '提示: 当前账号没有归属仓库，请联系管理员进行添加，谢谢！',
								area: ['100px', '140px'],
								btn: ['确认'],
								yes: function(index, layero) {
									//按钮【确认】的回调
									layer.closeAll();
								},
								cancel: function() {
									//右上角关闭回调
								}
							});
							return;
						}
						if(window.plus) {
							swaiting = plus.nativeUI.showWaiting('处理中...');
						}
						if(app.debug) {
							console.log('idArray:' + JSON.stringify(idArray));
						}
						var forecastDetailIds = (!idArray || idArray.length < 1) ? "" : idArray.join(',');
						var apiUrl = app.api_url + '/api/proReceiving/newForm?_t=' + new Date().getTime();
						m.ajax(apiUrl, {
							data: {
								forecastDetailIds: forecastDetailIds
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 20000, //超时时间设置为10秒；
							success: function(data) {
								if(swaiting) {
									swaiting.close();
								}
								if(data) {
									if(data.errorMsg && data.errorMsg.toUpperCase() == 'OK') {
										m.openWindow({
											id: 'receiving-register',
											url: '../html/receiving-register.html',
											show: {
												aniShow: 'pop-in'
											},
											waiting: {
												autoShow: true
											},
											extras: {
												"type": 0, //0:收货登记; 1:改单
												"forecastDetailID": tmpForecastId,
												"receivingDetails": data
											}
										});
									} else {
										m.toast(data.msg);
									}
								}
							},
							error: function(xhr, type, errorThrown) {
								if(swaiting) {
									swaiting.close();
								}
								if(app.debug) {
									console.log(xhr + "|" + type + "|" + errorThrown);
								}
								m.toast("网络异常，请重新试试");
							}
						});
					}
				},
				/*
				 * 改单
				 */
				openModifyListEditHTML: function($event, item) {
					var self = this;
					event.stopPropagation();
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					var apiUrl = app.api_url + '/api/proReceiving/updateForm?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							id: item.id
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							if(swaiting) {
								swaiting.close();
							}
							if(data) {
								if(data.errorMsg && data.errorMsg.toUpperCase() == 'OK') {
									m.openWindow({
										id: 'receiving-register',
										url: '../html/receiving-register.html',
										show: {
											aniShow: 'pop-in'
										},
										waiting: {
											autoShow: true
										},
										extras: {
											"type": 1, //0:收货登记; 1:改单
											"receivingDetails": data
										}
									});
								} else {
									m.toast(data.msg);
								}
							}
						},
						error: function(xhr, type, errorThrown) {
							if(swaiting) {
								swaiting.close();
							}
							if(app.debug) {
								console.log(xhr + "|" + type + "|" + errorThrown);
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
				/*
				 * 打开收货单详情页面receive-list-detail
				 */
				openReceiveListDetailHTML: function(id) {
					var self = this;
					m.openWindow({
						id: 'receive-list-detail',
						url: '../html/receive-list-detail.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
							"enteringKey": id
						}
					});
				},
				/*
				 * 获取待收货的数据
				 */
				doPendingListQuery: function(params, callback) {
					var self = this;
					m.ajax(app.api_url + '/api/proReceiving/toReceiveList', {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						//timeout: 10000, //超时时间设置为10秒；
						success: function(data) {
							if(app.debug) {
								console.log("doPendingListQuery:" + JSON.stringify(data));
							}
							self.pendingPage.pageNo = data.pageNo;
							self.pendingPage.pageSize = data.pageSize;
							self.pendingPage.totalListCount = data.count;
							self.pendingPage.totalPage = data.totalPage;
							if(self.pendingPage.pageNo == 1) {
								self.pendingPage.pendingList = data.list;
							} else {
								self.pendingPage.pendingList = self.pendingPage.pendingList.concat(data.list);
							}
							if(self.pendingPage.pendingList && self.pendingPage.pendingList.length > 0) {
								m.each(self.pendingPage.pendingList, function(index, item) {
									if(item) {
										item.cbxId = 'cbx_' + item.id + '_' + index;
										item.itemTotal = (item.num ? item.num : '0') + item.numUnitDesc + "/" + (item.weight ? item.weight : '0') + item.weightUnitDesc;
									}
								});
							}
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							m.toast("网络异常，请重新试试");
						}
					});
				},
				/*
				 * 获取已收货的数据
				 */
				doReceivedListQuery: function(params, callback) {
					var self = this;
					m.ajax(app.api_url + '/api/proReceiving/receivedList', {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						//timeout: 10000, //超时时间设置为10秒； 
						success: function(data) {
							if(app.debug)
								console.log("doReceivedListQuery:" + JSON.stringify(data));
							self.receivedPage.pageNo = data.pageNo;
							self.receivedPage.pageSize = data.pageSize;
							self.receivedPage.totalListCount = data.count;
							self.receivedPage.totalPage = data.totalPage;
							if(self.receivedPage.pageNo == 1) {
								self.receivedPage.receivedList = data.list;
							} else {
								self.receivedPage.receivedList = self.receivedPage.receivedList.concat(data.list);
							}
							if(self.receivedPage.receivedList && self.receivedPage.receivedList.length > 0) {
								m.each(self.receivedPage.receivedList, function(index, item) {
									if(item) {
										item.realInfo = (item.realNumTotal ? item.realNumTotal : '0') + "件/" + (item.realWeightTotal ? item.realWeightTotal : '0') + "吨";
									}
								});
							}
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							m.toast("网络异常，请重新试试");
						}
					});
				},
				/**
				下拉查询
				*/
				pullDownQuery: function(id) {
					var self = this;
					switch(id) {
						case "pendingList":
							self.pendingPage.pageNo = 1;
							//						self.pendingPage.pageSize = 10;
							self.doPendingListQuery({
								"pageNo": self.pendingPage.pageNo,
								//							"pageSize": self.pendingPage.pageSize,
								"packageNo": self.pendingPage.filterConditions.packageNo,
								"carNo": self.pendingPage.filterConditions.carNo,
								"forecastCode": self.pendingPage.filterConditions.forecastCode,
								"ownerId": self.pendingPage.filterConditions.ownerId,
								"brandId": self.pendingPage.filterConditions.brandId,
								"beginDate": self.pendingPage.filterConditions.beginDate,
								"endDate": self.pendingPage.filterConditions.endDate
							}, function() {
								m.toast("加载成功!");
								self.resetSelectedPendingList();
								pendingListPullRefresh.endPulldownToRefresh();
								pendingListPullRefresh.scrollTo(0, 0, 0);
								if(self.pendingPage.totalPage > 1) {
									pendingListPullRefresh.refresh(true);
								}
							});
							break;
						case "receivedList":
							self.receivedPage.pageNo = 1;
							//						self.receivedPage.pageSize = 10;
							self.doReceivedListQuery({
								"pageNo": self.receivedPage.pageNo,
								//							"pageSize": self.receivedPage.pageSize,
								"receivingCode": self.receivedPage.filterConditions.receivingCode,
								"ownerId": self.receivedPage.filterConditions.ownerId,
								"brandId": self.receivedPage.filterConditions.brandId,
								"receivingStart": self.receivedPage.filterConditions.receivingStart,
								"receivingEnd": self.receivedPage.filterConditions.receivingEnd
							}, function() {
								m.toast("加载成功!");
								receivedPullRefresh.endPulldownToRefresh();
								receivedPullRefresh.scrollTo(0, 0, 0);
								if(self.receivedPage.totalPage > 1) {
									receivedPullRefresh.refresh(true);
								}
							});
							break;
					}
				},
				/**
				 * 上拉查询
				 */
				pullUpQuery: function(id) {
					var self = this;
					switch(id) {
						case "pendingList":
							if(self.pendingPage.pageNo < self.pendingPage.totalPage) {
								self.pendingPage.pageNo++;
								self.doPendingListQuery({
									"pageNo": self.pendingPage.pageNo,
									"packageNo": self.pendingPage.filterConditions.packageNo,
									"carNo": self.pendingPage.filterConditions.carNo,
									"forecastCode": self.pendingPage.filterConditions.forecastCode,
									"ownerId": self.pendingPage.filterConditions.ownerId,
									"brandId": self.pendingPage.filterConditions.brandId,
									"beginDate": self.pendingPage.filterConditions.beginDate,
									"endDate": self.pendingPage.filterConditions.endDate
								}, function() {
									pendingListPullRefresh.endPullupToRefresh();
									self.resetPendingListChecked();
									self.buildTotalInfo();
								});
							} else {
								pendingListPullRefresh.endPullupToRefresh(true);
								window.setTimeout(function() {
									pendingListPullRefresh.disablePullupToRefresh();
								}, 1500);
							}
							break;
						case "receivedList":
							if(self.receivedPage.pageNo < self.receivedPage.totalPage) {
								self.receivedPage.pageNo++;
								self.doReceivedListQuery({
									"pageNo": self.receivedPage.pageNo,
									"receivingCode": self.receivedPage.filterConditions.receivingCode,
									"ownerId": self.receivedPage.filterConditions.ownerId,
									"brandId": self.receivedPage.filterConditions.brandId,
									"receivingStart": self.receivedPage.filterConditions.receivingStart,
									"receivingEnd": self.receivedPage.filterConditions.receivingEnd
								}, function() {
									receivedPullRefresh.endPullupToRefresh();
								});
							} else {
								receivedPullRefresh.endPullupToRefresh(true);
								window.setTimeout(function() {
									receivedPullRefresh.disablePullupToRefresh();
								}, 1500);
							}
							break;
					}
		
				}
			}
		});
		
		mui('#pendingList .public-list').scroll({
			deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		mui('#receivedList .public-list').scroll({
			deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		
		pendingListPullRefresh = m('#pendingList .public-list').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.pullDownQuery("pendingList");
				}
			},
			up: {
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				callback: function() {
					var self = this;
					globalVue.pullUpQuery("pendingList");
				}
			}
		});
		receivedPullRefresh = m('#receivedList .public-list').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.pullDownQuery("receivedList");
				}
			},
			up: {
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				callback: function() {
					var self = this;
					globalVue.pullUpQuery("receivedList");
				}
			}
		});
		
		document.addEventListener("refreshEnteringList", function(e) {
			globalVue.doPendingListQuery({
				"pageNo": 1,
				"pageSize": 10,
				"packageNo": globalVue.pendingPage.filterConditions.packageNo,
				"carNo": globalVue.pendingPage.filterConditions.carNo,
				"forecastCode": globalVue.pendingPage.filterConditions.forecastCode,
				"ownerId": globalVue.pendingPage.filterConditions.ownerId,
				"brandId": globalVue.pendingPage.filterConditions.brandId,
				"beginDate": globalVue.pendingPage.filterConditions.beginDate,
				"endDate": globalVue.pendingPage.filterConditions.endDate
			}, function() {
				globalVue.resetSelectedPendingList();
				pendingListPullRefresh.scrollTo(0, 0, 0);
				pendingListPullRefresh.refresh(true);
			});
			globalVue.doReceivedListQuery({
				"pageNo": 1,
				"pageSize": 10,
				"receivingCode": globalVue.receivedPage.filterConditions.receivingCode,
				"brandId": globalVue.receivedPage.filterConditions.brandId,
				"ownerId": globalVue.receivedPage.filterConditions.ownerId,
				"receivingStart": globalVue.receivedPage.filterConditions.receivingStart,
				"receivingEnd": globalVue.receivedPage.filterConditions.receivingEnd,
			}, function() {
				receivedPullRefresh.scrollTo(0, 0, 0);
				receivedPullRefresh.refresh(true);
			});
			slider.gotoItem(1);
		}, false);
		
		// return globalVue;
		
		
		globalVue.doPendingListQuery({
			"pageNo": 1,
			"pageSize": 10
		});
		globalVue.doReceivedListQuery({
			"pageNo": 1,
			"pageSize": 10
		});

		var backDefault = m.back;

		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			if(twaiting) {
				twaiting.close();
			}
			backDefault();
		}
		m.back = detailBack;

		window.addEventListener("getPendingListFilterVal", function(e) {
			console.log("父页面得到的值:" + JSON.stringify(e.detail));
			globalVue.pendingPage.filterConditions.packageNo = e.detail.packageNo;
			globalVue.pendingPage.filterConditions.carNo = e.detail.carNo;
			globalVue.pendingPage.filterConditions.forecastCode = e.detail.forecastCode;
			globalVue.pendingPage.filterConditions.ownerId = e.detail.ownerId;
			globalVue.pendingPage.filterConditions.ownerName = e.detail.ownerName;
			globalVue.pendingPage.filterConditions.brandId = e.detail.brandId;
			globalVue.pendingPage.filterConditions.brandName = e.detail.brandName;
			globalVue.pendingPage.filterConditions.beginDate = e.detail.beginDate;
			globalVue.pendingPage.filterConditions.endDate = e.detail.endDate;
			globalVue.doPendingListQuery({
				"pageNo": 1,
				"pageSize": 10,
				"packageNo": globalVue.pendingPage.filterConditions.packageNo,
				"carNo": globalVue.pendingPage.filterConditions.carNo,
				"forecastCode": globalVue.pendingPage.filterConditions.forecastCode,
				"ownerId": globalVue.pendingPage.filterConditions.ownerId,
				"brandId": globalVue.pendingPage.filterConditions.brandId,
				"beginDate": globalVue.pendingPage.filterConditions.beginDate,
				"endDate": globalVue.pendingPage.filterConditions.endDate
			}, function() {
				globalVue.resetSelectedPendingList();
				pendingListPullRefresh.scrollTo(0, 0, 0);
				pendingListPullRefresh.refresh(true);
			});
		});

		window.addEventListener("getReceivedListFilterVal", function(e) {
			console.log("父页面得到的值:" + JSON.stringify(e.detail));
			globalVue.receivedPage.filterConditions.receivingCode = e.detail.receivingCode;
			globalVue.receivedPage.filterConditions.ownerId = e.detail.ownerId;
			globalVue.receivedPage.filterConditions.ownerName = e.detail.ownerName;
			globalVue.receivedPage.filterConditions.brandId = e.detail.brandId;
			globalVue.receivedPage.filterConditions.brandName = e.detail.brandName;
			globalVue.receivedPage.filterConditions.receivingStart = e.detail.receivingStart;
			globalVue.receivedPage.filterConditions.receivingEnd = e.detail.receivingEnd;
			globalVue.doReceivedListQuery({
				"pageNo": 1,
				"pageSize": 10,
				"receivingCode": globalVue.receivedPage.filterConditions.receivingCode,
				"brandId": globalVue.receivedPage.filterConditions.brandId,
				"ownerId": globalVue.receivedPage.filterConditions.ownerId,
				"receivingStart": globalVue.receivedPage.filterConditions.receivingStart,
				"receivingEnd": globalVue.receivedPage.filterConditions.receivingEnd,
			}, function() {
				receivedPullRefresh.scrollTo(0, 0, 0);
				receivedPullRefresh.refresh(true);
			});
		});
	});


});