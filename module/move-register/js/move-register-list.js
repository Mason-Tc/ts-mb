define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("jquery");
	require("moment");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("layui");
	require("../../../js/common/common.js");

	m.init();

	m.plusReady(function() {
		var swaiting = null;
		var twaiting = null;
		var pendingListPullRefresh = null;
		var movedPullRefresh = null;
		var layer = null;
		var slider = m("#slider").slider();
		var beginDate = moment().format('YYYY-MM-DD 00:00');
		var endDate = moment().format('YYYY-MM-DD 23:59');
		
		m('#pendingList .public-list').scroll({
			deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		m('#movedList .public-list').scroll({
			deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		m('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		m('#warehouseScrollDiv').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		m('#ownerScrollDiv').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		m('#warehousePlaceScrollDiv').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		
		// 右侧查询框
		var offCanvasQuery = m("#off-canvas").offCanvas();
		// var mask = m.createMask(function() {
		// 	if(offCanvasQuery.isShown("right")) {
		// 		offCanvasQuery.close();
		// 		$('#searchVue').hide();
		// 		mask.close();
		// 	}
		// }, 'contentDiv');
		
		slider.setStopped(true); //禁止滑动
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		
		var dtPicker1 = new m.DtPicker({
			"value": beginDate
		});
		var dtPicker2 = new m.DtPicker({
			"value": endDate
		});
		
		var globalVue = new Vue({
			el: '#off-canvas',
			data: {
				headTitle: '移库列表',
				totalInfo: '0件/0吨',
				exponentType: 0,
				//			isCompleteConfirm: app.getUser().isPrivilege('warehouse:entering:complete:confirm'),
				//			isReceivingRegister: app.getUser().isPrivilege('warehouse:entering:receiving:register'),
				//			isCompleteConfirm: true,
				isReceivingRegister: true,
				conditions: {},
				selectedMtxs: {},
				ownerList: [],
				warehouseList: [],
				warehousePlaceList: [],
				selectedPendingList: [],
				pendingPage: {
					pendingList: [],
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"packageNo": "", // 捆包号
						"materialCode": "", //货物编号
						"ownerId": "", // 货主ID
						"warehouseId": "", //仓库ID
						"warehousePlaceId": "" //库位ID
					}
				},
				movedPage: {
					movedList: [],
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"warehouseId": "", //仓库ID
						"beginDate": "", //开始时间
						"endDate": "" //结束时间
					}
				}
			},
			methods: {
				/**
				 * 打开查询框
				 */
				showOffExponentQuery: function() {
					offCanvasQuery.show();
					$('#searchVue').show();
					// mask.show();
				},
				/**
				 * 隐藏查询框
				 */
				hideOffCanvaQuery: function() {
					if(offCanvasQuery.isShown("right")) {
						offCanvasQuery.close();
						// mask.close();
					}
					$('#searchVue').hide();
				},
				pickBeginDate: function() {
					var self = this;
					dtPicker1.show(function(selectItems) {
						self.movedPage.filterConditions.beginDate = selectItems.value;
					})
				},
				pickEndDate: function() {
					var self = this;
					dtPicker2.show(function(selectItems) {
						self.movedPage.filterConditions.endDate = selectItems.value;
					})
				},
				getOwnerList: function() {
					var self = this;
					//获取客户信息 基础数据
					m.getJSON(app.api_url + '/api/sysBusinessBasis/customerInfo?customerType=2', function(data) {
						for(var i = 0; i < data.length; i++) {
							self.ownerList.push({
								"text": data[i].text,
								"id": data[i].id
							});
						}
					});
				},
				getWarehouseConditions: function() {
					var self = this;
					//获取基础数据 品名 材质 规格 产地
					m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
						self.conditions = data;
					});
				},
				searchIvntDetail: function(evt, curId) {
					var self = this;
					var selectedObj;
					if(evt != null) {
						selectedObj = $(evt.currentTarget);
						var cpsId = selectedObj.attr("class").substring(0, selectedObj.attr("class").indexOf(" ")) + selectedObj.attr("mtxId");
					} else {
						selectedObj = $(null);
					}
					var ownerId = '',
						warehouseId = '',
						warehousePlaceId = '';
					if(selectedObj.hasClass("ownerA")) {
						if(selectedObj.hasClass('selectedTD')) {
							selectedObj.removeClass('selectedTD');
							eval('delete globalVue.selectedMtxs.' + cpsId);
							Vue.delete(self.selectedMtxs, 0);
						} else {
							selectedObj.addClass('selectedTD');
							Vue.set(self.selectedMtxs, 0, {
								id: cpsId,
								name: selectedObj.text(),
								tagId: selectedObj.attr('id')
							});
						}
					} else if(selectedObj.hasClass("warehouseA")) {
						if(selectedObj.hasClass('selectedTD')) {
							selectedObj.removeClass('selectedTD');
							self.warehousePlaceList = [];
							Vue.delete(self.selectedMtxs, 1);
							Vue.delete(self.selectedMtxs, 2);
						} else {
							selectedObj.addClass('selectedTD');
							self.warehousePlaceList = eval('globalVue.conditions.warehousePlaceMap._' + selectedObj.attr('mtxId'));
							Vue.set(self.selectedMtxs, 1, {
								id: cpsId,
								name: selectedObj.text(),
								tagId: selectedObj.attr('id')
							});
							if(self.selectedMtxs["1"]) {
								Vue.delete(self.selectedMtxs, 2);
							}
						}
					} else if(selectedObj.hasClass("warehousePlaceA")) {
						if(selectedObj.hasClass('selectedTD')) {
							selectedObj.removeClass('selectedTD');
							eval('delete globalVue.selectedMtxs.' + cpsId);
							Vue.delete(self.selectedMtxs, 2);
						} else {
							selectedObj.addClass('selectedTD');
							Vue.set(self.selectedMtxs, 2, {
								id: cpsId,
								name: selectedObj.text(),
								tagId: selectedObj.attr('id')
							});
							if(selectedObj.hasClass("warehouseA")) {
								Vue.delete(self.selectedMtxs, 2);
							}
						}
					} else {}
					$('.selectedTD').each(function() {
						var obj = $(this);
						if(obj.hasClass("ownerA")) {
							if(selectedObj.hasClass("ownerA")) {
								obj.removeClass('selectedTD');
								ownerId = curId;
								selectedObj.addClass('selectedTD');
							} else {
								ownerId = obj.attr('mtxId');
								if(selectedObj.hasClass("ownerA")) {
									ownerId = '';
								}
							}
						} else if(obj.hasClass("warehouseA")) {
							if(selectedObj.hasClass("warehouseA")) {
								obj.removeClass('selectedTD');
								warehousePlaceId = '';
								warehouseId = curId;
								selectedObj.addClass('selectedTD');
							} else {
								warehouseId = obj.attr('mtxId');
							}
						} else if(obj.hasClass("warehousePlaceA")) {
							if(selectedObj.hasClass("warehousePlaceA")) {
								obj.removeClass('selectedTD');
								warehousePlaceId = curId;
								selectedObj.addClass('selectedTD');
							} else {
								warehousePlaceId = obj.attr('mtxId');
								if(selectedObj.hasClass("warehouseA")) {
									warehousePlaceId = '';
								}
							}
						}
					});
					self.pendingPage.filterConditions.ownerId = ownerId;
					self.pendingPage.filterConditions.warehouseId = warehouseId;
					self.pendingPage.filterConditions.warehousePlaceId = warehousePlaceId;
					console.log('ownerId=' + self.pendingPage.filterConditions.ownerId + ',warehouseId=' + self.pendingPage.filterConditions.warehouseId + ',warehousePlaceId=' + self.pendingPage.filterConditions.warehousePlaceId);
				},
				removeSltMtx: function(evnet, type, id) {
					var selectedObj = $(event.currentTarget);
					var fireOnThis = document.getElementById(selectedObj.attr("tagId"));
					m.trigger(fireOnThis, 'tap');
				},
				resetFilter: function() {
					var self = this;
					self.pendingPage.filterConditions.packageNo = '';
					self.pendingPage.filterConditions.materialCode = '';
					self.pendingPage.filterConditions.ownerId = '';
					self.pendingPage.filterConditions.warehouseId = '';
					self.pendingPage.filterConditions.warehousePlaceId = '';
					self.movedPage.filterConditions.warehouseId = '';
					self.movedPage.filterConditions.beginDate = beginDate;
					self.movedPage.filterConditions.endDate = endDate;
					self.selectedMtxs = {};
					$('.selectedTD').each(function() {
						var obj = $(this);
						obj.removeClass('selectedTD');
					});
				},
				complete: function() {
					var self = this;
					if(self.exponentType == 0) {
						self.doPendingListQuery({
							"pageNo": 1,
							"pageSize": 10,
							"packageNo": self.pendingPage.filterConditions.packageNo, // 捆包号
							"materialCode": self.pendingPage.filterConditions.materialCode, //货物编号
							"ownerId": self.pendingPage.filterConditions.ownerId, // 货主ID
							"warehouseId": self.pendingPage.filterConditions.warehouseId, //仓库ID
							"warehousePlaceId": self.pendingPage.filterConditions.warehousePlaceId //库位ID
						}, function() {
							self.resetSelectedPendingList();
							pendingListPullRefresh.scrollTo(0, 0, 0);
						});
					} else {
						self.doMovedListQuery({
							"pageNo": 1,
							"pageSize": 10,
							"warehouseId": self.movedPage.filterConditions.warehouseId,
							"beginDate": self.movedPage.filterConditions.beginDate,
							"endDate": self.movedPage.filterConditions.endDate
						}, function() {
							movedPullRefresh.scrollTo(0, 0, 0);
						});
					}
					self.hideOffCanvaQuery();
				},
				processListItem: function($event, status, id) { // status(0:物资列表|1:已移库列表)
					var self = this;
					event.stopPropagation();
					if(status == 0) {
		
					} else if(status == 1) {
						layer.open({
							title: false,
							content: '提示：确认要作废该条记录吗?',
							btn: ['确认', '取消'],
							yes: function(index, layero) {
								//按钮【确认】的回调
								var apiUrl = app.api_url + '/api/proMoveApi/cancel?_t=' + new Date().getTime();
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
												self.doMovedListQuery({
													"pageNo": 1,
													"pageSize": 10,
													"warehouseId": self.movedPage.filterConditions.warehouseId,
													"beginDate": self.movedPage.filterConditions.beginDate,
													"endDate": self.movedPage.filterConditions.endDate
												}, function() {
													movedPullRefresh.scrollTo(0, 0, 100);
													movedPullRefresh.refresh(true);
												});
												self.doPendingListQuery({
													"pageNo": self.pendingPage.pageNo,
													"packageNo": self.pendingPage.filterConditions.packageNo,
													"materialCode": self.pendingPage.filterConditions.materialCode, //货物编号
													"ownerId": self.pendingPage.filterConditions.ownerId, // 货主ID
													"warehouseId": self.pendingPage.filterConditions.warehouseId, //仓库ID
													"warehousePlaceId": self.pendingPage.filterConditions.warehousePlaceId //库位ID
												}, function() {
													if(self.selectedPendingList.length == self.pendingPage.pendingList.length) {
														$("#cbx_all").prop("checked", true);
													} else {
														$("#cbx_all").prop("checked", false);
													}
													pendingListPullRefresh.endPullupToRefresh();
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
					}
				},
				onItemSliderClick: function($event, index) {
					var self = this;
					event.stopPropagation();
					self.exponentType = index;
					slider.refresh();
					slider.gotoItem(index);
					self.resetFilter();
					$('#li_warehouse').removeClass();
					$('#li_warehouse').addClass('mui-table-view-cell mui-collapse mui-active');
				},
				onListCBoxChange: function($event, item) {
					if(app.debug) {
						console.log('onListCBoxChange item:' + JSON.stringify(item));
						console.log('cbxId:' + item.cbxId);
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
								if(!(itm.warehouseId == item.warehouseId && itm.ownerId == item.ownerId && itm.brandId == item.brandId)) {
									isDiff = true;
								}
							}
						});
					}
					if(isChecked) {
						if(isDiff) {
							layer.open({
								title: false,
								content: '提示: 移库资源需为相同仓库、相同货主、相同品名。当前所选的移库物料信息与之前所选不同，是否清除之前选项?',
								area: ['110px', '190px'],
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
					if(self.selectedPendingList && self.selectedPendingList.length > 0) {
						var tmpWarehouseId = self.selectedPendingList[0].warehouseId;
						var tmpOwnerId = self.selectedPendingList[0].ownerId;
						var tmpBrandId = self.selectedPendingList[0].brandId;
						m.each(self.pendingPage.pendingList, function(index, itm) {
							if(itm) {
								if(!(itm.warehouseId == tmpWarehouseId && itm.ownerId == tmpOwnerId && itm.brandId == tmpBrandId)) {
									isDiff = true;
								}
							}
						});
					} else {
						var tmpWarehouseId = self.pendingPage.pendingList[0].warehouseId;
						var tmpOwnerId = self.pendingPage.pendingList[0].ownerId;
						var tmpBrandId = self.pendingPage.pendingList[0].brandId;
						m.each(self.pendingPage.pendingList, function(index, itm) {
							if(itm) {
								if(!(itm.warehouseId == tmpWarehouseId && itm.ownerId == tmpOwnerId && itm.brandId == tmpBrandId)) {
									isDiff = true;
								}
							}
						});
					}
					if(isChecked) {
						if(isDiff) {
							layer.open({
								title: false,
								content: '提示: 移库资源需为相同仓库、相同货主、相同品名！',
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
						var totalWeight = 0;
						var numUnitDesc = "";
						var weightUnitDesc = "";
						m.each(self.selectedPendingList, function(index, itm) {
							if(itm) {
								numUnitDesc = itm.numUnitDesc;
								weightUnitDesc = itm.weightUnitDesc;
								var numUnit = itm.supplyNum ? parseInt(itm.supplyNum) : 0;
								var weight = itm.supplyWeight ? parseFloat(itm.supplyWeight) : 0;
								totalNum = com.accAdd(totalNum, numUnit);
								totalWeight = com.accAdd(totalWeight, weight);
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
				openReceivingRegisterHTML: function() {
					var self = this;
					var idArray = [];
					var isDiff = false;
					if(app.debug) {
						console.log('selectedPendingList:' + JSON.stringify(self.selectedPendingList));
					}
					if(self.selectedPendingList && self.selectedPendingList.length > 0) {
						var tmpWarehouseId = self.selectedPendingList[0].warehouseId;
						var tmpOwnerId = self.selectedPendingList[0].ownerId;
						var tmpBrandId = self.selectedPendingList[0].brandId;
						m.each(self.selectedPendingList, function(index, itm) {
							if(itm) {
								idArray.push(itm.id);
								if(!(itm.warehouseId == tmpWarehouseId && itm.ownerId == tmpOwnerId && itm.brandId == tmpBrandId)) {
									isDiff = true;
								}
							}
						});
					}
					if(isDiff) {
						layer.open({
							title: false,
							content: '提示: 移库资源需为相同仓库、相同货主、相同品名！',
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
						var includeIds = (!idArray || idArray.length < 1) ? "" : idArray.join(',');
						var apiUrl = app.api_url + '/api/proMoveApi/form?_t=' + new Date().getTime();
						m.ajax(apiUrl, {
							data: {
								ownerId: tmpOwnerId,
								warehouseId: tmpWarehouseId,
								includeIds: includeIds
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 20000, //超时时间设置为10秒；
							success: function(data) {
								if(swaiting) {
									swaiting.close();
								}
								if(data) {
									if(data.msg && data.msg.toUpperCase() == 'OK') {
										m.openWindow({
											id: 'move-edit',
											url: '../html/move-edit.html',
											show: {
												aniShow: 'pop-in'
											},
											waiting: {
												autoShow: true
											},
											extras: {
												"type": 0, //0:移库登记; 1:改单
												"isFullNew": (!self.selectedPendingList || self.selectedPendingList.length < 1),
												"moveDetails": data
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
					var apiUrl = app.api_url + '/api/proMoveApi/editForm?_t=' + new Date().getTime();
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
								if(data.msg && data.msg.toUpperCase() == 'OK') {
									m.openWindow({
										id: 'move-edit',
										url: '../html/move-edit.html',
										show: {
											aniShow: 'pop-in'
										},
										waiting: {
											autoShow: true
										},
										extras: {
											"type": 1, //0:收货登记; 1:改单
											"moveDetails": data
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
				 * 打开移库详情页面
				 */
				openMoveDetailHTML: function(id) {
					var self = this;
					m.openWindow({
						id: 'move-detail',
						url: '../html/move-detail.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
							"moveKey": id
						}
					});
				},
				/*
				 * 获取现货物资列表
				 */
				doPendingListQuery: function(params, callback) {
					var self = this;
					if(window.plus) {
						twaiting = plus.nativeUI.showWaiting('加载中...');
					}
					m.ajax(app.api_url + '/api/proMoveApi/list', {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						//timeout: 10000, //超时时间设置为10秒；
						success: function(data) {
							if(twaiting) {
								twaiting.close();
							}
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
										var warehouseInfo = "";
										if(item.warehousePlace && item.storeyNo) {
											warehouseInfo = item.warehousePlace + "/" + item.storeyNo;
										} else if(item.warehousePlace && !item.storeyNo) {
											warehouseInfo = item.warehousePlace;
										} else if(!item.warehousePlace && item.storeyNo) {
											warehouseInfo = item.storeyNo;
										} else if(!item.warehousePlace && !item.storeyNo) {
											warehouseInfo = "";
										}
										item.warehouseInfo = warehouseInfo;
										item.itemTotal = (item.supplyNum ? item.supplyNum : '0') + item.numUnitDesc + "/" + (item.supplyWeight ? item.supplyWeight : '0') + item.weightUnitDesc;
									}
								});
							}
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if(twaiting) {
								twaiting.close();
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
				/*
				 * 获取已移库列表
				 */
				doMovedListQuery: function(params, callback) {
					var self = this;
					m.ajax(app.api_url + '/api/proMoveApi/movedList', {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						//timeout: 10000, //超时时间设置为10秒； 
						success: function(data) {
							if(app.debug) {
								console.log("doMovedListQuery:" + JSON.stringify(data));
							}
							self.movedPage.pageNo = data.pageNo;
							self.movedPage.pageSize = data.pageSize;
							self.movedPage.totalListCount = data.count;
							self.movedPage.totalPage = data.totalPage;
							if(self.movedPage.pageNo == 1) {
								self.movedPage.movedList = data.list;
							} else {
								self.movedPage.movedList = self.movedPage.movedList.concat(data.list);
							}
							if(self.movedPage.movedList && self.movedPage.movedList.length > 0) {
								m.each(self.movedPage.movedList, function(index, item) {
									if(item) {
										item.reasonStr = item.reason ? buildAbbreviation(item.reason, 10, 10, 0) : "";
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
								"packageNo": self.pendingPage.filterConditions.packageNo, // 捆包号
								"materialCode": self.pendingPage.filterConditions.materialCode, //货物编号
								"ownerId": self.pendingPage.filterConditions.ownerId, // 货主ID
								"warehouseId": self.pendingPage.filterConditions.warehouseId, //仓库ID
								"warehousePlaceId": self.pendingPage.filterConditions.warehousePlaceId //库位ID
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
						case "movedList":
							self.movedPage.pageNo = 1;
							//						self.movedPage.pageSize = 10;
							self.doMovedListQuery({
								"pageNo": self.movedPage.pageNo,
								//							"pageSize": self.movedPage.pageSize,
								"warehouseId": self.movedPage.filterConditions.warehouseId,
								"beginDate": self.movedPage.filterConditions.beginDate,
								"endDate": self.movedPage.filterConditions.endDate
							}, function() {
								m.toast("加载成功!");
								movedPullRefresh.endPulldownToRefresh();
								movedPullRefresh.scrollTo(0, 0, 0);
								if(self.movedPage.totalPage > 1) {
									movedPullRefresh.refresh(true);
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
									"packageNo": self.pendingPage.filterConditions.packageNo, // 捆包号
									"materialCode": self.pendingPage.filterConditions.materialCode, //货物编号
									"ownerId": self.pendingPage.filterConditions.ownerId, // 货主ID
									"warehouseId": self.pendingPage.filterConditions.warehouseId, //仓库ID
									"warehousePlaceId": self.pendingPage.filterConditions.warehousePlaceId //库位ID
								}, function() {
									if(self.selectedPendingList.length == self.pendingPage.pendingList.length) {
										$("#cbx_all").prop("checked", true);
									} else {
										$("#cbx_all").prop("checked", false);
									}
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
						case "movedList":
							if(self.movedPage.pageNo < self.movedPage.totalPage) {
								self.movedPage.pageNo++;
								self.doMovedListQuery({
									"pageNo": self.movedPage.pageNo,
									"warehouseId": self.movedPage.filterConditions.warehouseId,
									"beginDate": self.movedPage.filterConditions.beginDate,
									"endDate": self.movedPage.filterConditions.endDate
								}, function() {
									movedPullRefresh.endPullupToRefresh();
								});
							} else {
								movedPullRefresh.endPullupToRefresh(true);
								window.setTimeout(function() {
									movedPullRefresh.disablePullupToRefresh();
								}, 1500);
							}
							break;
					}
				}
			}
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
		movedPullRefresh = m('#movedList .public-list').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.pullDownQuery("movedList");
				}
			},
			up: {
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				callback: function() {
					var self = this;
					globalVue.pullUpQuery("movedList");
				}
			}
		});
		
		document.addEventListener("refreshEnteringList", function(e) {
			globalVue.doPendingListQuery({
				"pageNo": 1,
				"pageSize": 10,
				"packageNo": globalVue.pendingPage.filterConditions.packageNo, // 捆包号
				"materialCode": globalVue.pendingPage.filterConditions.materialCode, //货物编号
				"ownerId": globalVue.pendingPage.filterConditions.ownerId, // 货主ID
				"warehouseId": globalVue.pendingPage.filterConditions.warehouseId, //仓库ID
				"warehousePlaceId": globalVue.pendingPage.filterConditions.warehousePlaceId //库位ID
			}, function() {
				globalVue.resetSelectedPendingList();
				pendingListPullRefresh.scrollTo(0, 0, 0);
				pendingListPullRefresh.refresh(true);
			});
			globalVue.doMovedListQuery({
				"pageNo": 1,
				"pageSize": 10,
				"warehouseId": globalVue.movedPage.filterConditions.warehouseId,
				"beginDate": globalVue.movedPage.filterConditions.beginDate,
				"endDate": globalVue.movedPage.filterConditions.endDate
			}, function() {
				movedPullRefresh.scrollTo(0, 0, 0);
				movedPullRefresh.refresh(true);
			});
			slider.gotoItem(1);
		}, false);
		
		
		globalVue.movedPage.filterConditions.beginDate = beginDate;
		globalVue.movedPage.filterConditions.endDate = endDate;
		globalVue.getOwnerList();
		globalVue.getWarehouseConditions();
		globalVue.doPendingListQuery({
			"pageNo": 1,
			"pageSize": 10
		});
		globalVue.doMovedListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"beginDate": globalVue.movedPage.filterConditions.beginDate,
			"endDate": globalVue.movedPage.filterConditions.endDate
		});

		var backDefault = m.back;

		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			if(twaiting) {
				twaiting.close();
			}
			if(offCanvasQuery.isShown("right")) {
				globalVue.hideOffCanvaQuery();
			} else
				backDefault();
		}
		m.back = detailBack;
	});


});