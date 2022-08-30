define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("jquery");
	require("../../../js/common/common.js");

	m.init();

	m.plusReady(function() {
		var ws = null;
		var swaiting = null;
		var twaiting = null;
		
		m('#div_cost_scroll').scroll({
			deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		
		var detailVue = new Vue({
			el: '#div_detail',
			data: {
				warehouseId: '', // 仓库ID
				//			isBatchAdd: app.getUser().isPrivilege('outing:pick:batchadd'),
				isBatchAdd: true,
				tempBridgeCraneJsonStr: '',
				tempBridgeCraneInfo: [],
				bridgeCraneList: []
			},
			methods: {
				initShow: function() {
					var self = this;
					self.getBridgeCrane(true);
				},
				getBridgeCrane: function(isShowWaiting) {
					var self = this;
					if(!isNotBlank(self.warehouseId)) {
						alert("仓库为空，请返回至排号登记页面获取相关信息后再查看配置行车数据!");
						return;
					}
					//获取行车信息
					if(window.plus && isShowWaiting) {
						swaiting = plus.nativeUI.showWaiting('加载中...');
					}
					var apiUrl = app.api_url + '/api/SysBridgeCrane/list?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							warehouseId: self.warehouseId
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							if(swaiting) {
								swaiting.close();
							}
							if(app.debug) {
								console.log(JSON.stringify(data));
							}
							if(data.msg) {
								alert("请输入正确的发货单号，点击查询并获取相关信息后再查看配置行车数据!");
							} else {
								self.bridgeCraneList = data.bridgeCraneList;
								if(self.bridgeCraneList && self.bridgeCraneList.length > 0) {
									m.each(self.bridgeCraneList, function(index, item) {
										if(item) {
											item.processId = 'li_' + index;
										}
									});
									self.tempBridgeCraneJsonStr = JSON.stringify(self.bridgeCraneList[0]);
								} else {
									self.tempBridgeCraneJsonStr = "{\"id\":\"\",\"isNewRecord\":false,\"officeId\":\"1\",\"createBy\":{\"id\":\"\",\"isNewRecord\":false,\"officeId\":\"1\",\"userStatus\":\"1\",\"initPassw\":0,\"roleNames\":\"\",\"cstmrTypeDesc\":\"未知类型\",\"isAdmin\":false,\"admin\":false},\"createDate\":\"\",\"updateBy\":{\"id\":\"\",\"isNewRecord\":false,\"officeId\":\"1\",\"userStatus\":\"1\",\"initPassw\":0,\"roleNames\":\"\",\"cstmrTypeDesc\":\"未知类型\",\"isAdmin\":false,\"admin\":false},\"updateDate\":\"\",\"bridgeCraneName\":\"\",\"bridgeCraneDesc\":\"\",\"processId\":\"li_0\",\"warehouseId\":\"\"}";
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
				/**
				 * 
				 * @param {Object} $event
				 * @param {Object} item
				 * @param {Object} processType 0:add 1:update
				 */
				toEdit: function($event, item, processType) {
					var self = this;
					event.stopPropagation();
					if(processType == 0) {
						self.tempBridgeCraneInfo = JSON.parse(self.tempBridgeCraneJsonStr);
						self.tempBridgeCraneInfo.id = '';
						self.tempBridgeCraneInfo.warehouseId = self.warehouseId;
						self.tempBridgeCraneInfo.bridgeCraneName = '';
						self.tempBridgeCraneInfo.bridgeCraneDesc = '';
					}
					inputDialogClass.showInputDialog(ws, {
						width: '100%',
						height: '88%',
						top: '100',
						scrollIndicator: 'none',
						scalable: false,
						popGesture: 'none'
					}, {
						pageSourceId: ws.id,
						bridgeCraneItem: (processType == 0 ? self.tempBridgeCraneInfo : item),
						processType: processType
					}, function() {
						inputDialogClass.closeMask();
					});
				},
				/**
				 * 
				 * @param {Object} $event
				 * @param {Object} item
				 */
				deleteItem: function($event, item) {
					var self = this;
					event.stopPropagation();
					plus.nativeUI.confirm('确定要删除此条记录？', function(f) {
						if(f.index == 0) {
							if(!isNotBlank(item.id)) {
								var dIndex = self.bridgeCraneList.indexOf(item);
								if(dIndex > -1) {
									self.bridgeCraneList.splice(dIndex, 1);
								}
								if(self.bridgeCraneList && self.bridgeCraneList.length > 0) {
									m.each(self.bridgeCraneList, function(index, item) {
										if(item) {
											item.processId = 'li_' + index;
										}
									});
								}
							} else {
								if(window.plus) {
									twaiting = plus.nativeUI.showWaiting('处理中...');
								}
								var apiUrl = app.api_url + '/api/SysBridgeCrane/isDel?_t=' + new Date().getTime();
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
										if(data) {
											if(app.debug) {
												console.log(JSON.stringify(data));
											}
											if(data.status) {
												var dIndex = self.bridgeCraneList.indexOf(item);
												if(dIndex > -1) {
													self.bridgeCraneList.splice(dIndex, 1);
												}
												if(self.bridgeCraneList && self.bridgeCraneList.length > 0) {
													m.each(self.bridgeCraneList, function(index, item) {
														if(item) {
															item.processId = 'li_' + index;
														}
													});
												}
											} else {
												m.toast(data.msg);
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
						} else {
		
						}
					}, '提示', ['是', '否']);
				},
				updateBridgeCraneList: function(processType, bridgeCraneItem) {
					var self = this;
					if(app.debug)
						console.log(JSON.stringify(bridgeCraneItem));
					if(processType == 0) {
						if(!self.bridgeCraneList || self.bridgeCraneList.length < 1) {
							self.bridgeCraneList = [];
						}
						self.bridgeCraneList.unshift(bridgeCraneItem);
						if(self.bridgeCraneList && self.bridgeCraneList.length > 0) {
							m.each(self.bridgeCraneList, function(index, item) {
								if(item) {
									item.processId = 'li_' + index;
								}
							});
						}
					} else {
						var uIndex = -1;
						if(self.bridgeCraneList && self.bridgeCraneList.length > 0) {
							m.each(self.bridgeCraneList, function(index, item) {
								if(item) {
									if(item.processId == bridgeCraneItem.processId)
										uIndex = index;
								}
							});
						}
						if(uIndex > -1) {
							self.bridgeCraneList.splice(uIndex, 1, bridgeCraneItem);
						}
					}
				},
				editSave: function() {
					var self = this;
					if(!isNotBlank(self.warehouseId)) {
						alert("仓库为空，请返回至排号登记页面获取相关信息后再查看配置行车数据!");
						return;
					}
					if(!self.bridgeCraneList || self.bridgeCraneList.length < 1) {
						alert('请配置行车数据!');
						return;
					}
					var ids = []; //行车id数组
					var bridgeCraneNames = []; //行车名称数组
					var bridgeCraneDescs = []; //行车说明数组
					m.each(self.bridgeCraneList, function(index, item) {
						if(item) {
							ids.push(item.id ? item.id : '');
							bridgeCraneNames.push(item.bridgeCraneName ? item.bridgeCraneName : '');
							bridgeCraneDescs.push(item.bridgeCraneDesc ? item.bridgeCraneDesc : '');
						}
					});
					var isError = false;
					var msg = "";
					if(bridgeCraneNames && bridgeCraneNames.length > 0) {
						for(var i = 0; i < bridgeCraneNames.length; i++) {
							var currItem = bridgeCraneNames[i];
							if(!currItem) {
								isError = true;
								msg = "行车名称为必填字段,请输入后提交";
								break;
							}
						}
					} else {
						isError = true;
						msg = "行车名称为必填字段,请输入后提交";
					}
					if(isError) {
						alert(msg);
						return;
					}
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					var apiUrl = app.api_url + '/api/SysBridgeCrane/save?_t=' + new Date().getTime();
					if(app.debug){
						console.log("ids:" + JSON.stringify(ids.join(',')) + "|bridgeCraneNames:" + JSON.stringify(bridgeCraneNames.join(',')) + "|bridgeCraneDescs:" + JSON.stringify(bridgeCraneDescs.join(',')));
					}
					m.ajax(apiUrl, {
						data: {
							warehouseId: self.warehouseId,
							ids: ids.join(','),
							bridgeCraneNames: bridgeCraneNames.join(','),
							bridgeCraneDescs: bridgeCraneDescs.join(',')
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							if(swaiting) {
								swaiting.close();
							}
							if(data) {
								if(app.debug) {
									console.log(JSON.stringify(data));
								}
								if(data.status) {
									//								var listView = plus.webview.getWebviewById('move-register');
									//								m.fire(listView, "refreshEnteringList", {});
									m.back();
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
				submit: function() {
					var self = this;
					self.editSave();
				}
			}
		});
		
		document.addEventListener("updateBridgeCraneList", function(e) {
			detailVue.updateBridgeCraneList(e.detail.processType, e.detail.bridgeCraneItem);
			inputDialogClass.closeMask();
		}, false);
		
		document.addEventListener("closeMask", function(e) {
			inputDialogClass.closeMask();
		}, false);
		
		
		ws = plus.webview.currentWebview();
		detailVue.warehouseId = ws.warehouseId;
		detailVue.initShow();

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

		//设置footer绝对位置
		document.getElementById('nav_footer').style.top = (plus.display.resolutionHeight - 40) + "px";
	});


});