define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("jquery");
	require("moment");
	require("layui");
	require("../../../js/common/common.js");

	var ws = null;
	var swaiting = null;
	var twaiting = null;
//	var queuePullRefresh = null;
	var layer = null;
	var slider = m("#slider").slider();
	var beginDate = moment().format('YYYY-MM-DD 00:00');
	var endDate = moment().format('YYYY-MM-DD 23:59');

	m('#queueList .public-list').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#warehouseScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	// 右侧查询框
	var offCanvasQuery = m("#off-canvas").offCanvas();
	var mask = m.createMask(function() {
		if(offCanvasQuery.isShown("right")) {
			offCanvasQuery.close();
			$('#searchVue').hide();
			mask.close();
		}
	}, 'contentDiv');

	slider.setStopped(true); //禁止滑动
	layui.use(['layer'], function() {
		layer = layui.layer;
	});

	var nativeWebview, imm, InputMethodManager;

	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.isPDA = plus.device.model == app.pdaModel;
		globalVue.getWarehouseConditions();
		globalVue.doQueueListQuery({
//			"pageNo": 1,
//			"pageSize": 10
		});

		if(plus.device.model == app.pdaModel) {
			//监听mask关闭，在其点击事件里将焦点归还至获取二维码的文本框
			m("body").on("tap", ".mui-backdrop", function() {
				setFocusForScanner();
			});
		}

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

	var globalVue = new Vue({
		el: '#off-canvas',
		data: {
			isPDA: false,
			headTitle: '排队登记',
			queueTotalShow: '0人',
			conditions: {},
			selectedMtxs: {},
			warehouseList: [],
			queueList: [],
			queuePage: {
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0, //总条数
				orderType: 1, //排序类型（1按排号，2按时间，3按类型)
				filterConditions: { // 筛选条件
					"warehouseId": "", //仓库ID
					"carPlateNo": "", //车牌号
					"ladingCode": "", //提单号
					"businessType": "" //业务类型 1:出库 2:入库
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
				mask.show();
			},
			/**
			 * 隐藏查询框
			 */
			hideOffCanvaQuery: function() {
				if(offCanvasQuery.isShown("right")) {
					offCanvasQuery.close();
					mask.close();
				}
				$('#searchVue').hide();
				setFocusForScanner();
			},
			getWarehouseConditions: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
					self.conditions = data;
				});
			},
			changeBusinessType: function(businessType) {
				var self = this;
				self.queuePage.filterConditions.businessType = businessType;
			},
			anyCall: function($event, phoneNum) {
				var self = this;
				event.stopPropagation();
				if(!isNotBlank(phoneNum)) {
					return;
				}
				plus.device.dial(phoneNum, true);
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
				var warehouseId = '';
				if(selectedObj.hasClass("warehouseA")) {
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
				} else {}
				$('.selectedTD').each(function() {
					var obj = $(this);
					if(obj.hasClass("warehouseA")) {
						if(selectedObj.hasClass("warehouseA")) {
							obj.removeClass('selectedTD');
							warehouseId = curId;
							selectedObj.addClass('selectedTD');
						} else {
							warehouseId = obj.attr('mtxId');
							if(selectedObj.hasClass("warehouseA")) {
								warehouseId = '';
							}
						}
					}
				});
				self.queuePage.filterConditions.warehouseId = warehouseId;
				console.log('warehouseId=' + self.queuePage.filterConditions.warehouseId);
			},
			removeSltMtx: function(evnet, type, id) {
				var selectedObj = $(event.currentTarget);
				var fireOnThis = document.getElementById(selectedObj.attr("tagId"));
				m.trigger(fireOnThis, 'tap');
			},
			resetFilter: function() {
				var self = this;
				self.queuePage.filterConditions.warehouseId = '';
				self.queuePage.filterConditions.carPlateNo = '';
				self.queuePage.filterConditions.ladingCode = '';
				self.queuePage.filterConditions.businessType = '';
				self.selectedMtxs = {};
				$('.selectedTD').each(function() {
					var obj = $(this);
					obj.removeClass('selectedTD');
				});
				setFocusForScanner();
			},
			complete: function() {
				var self = this;
//				alert(self.queuePage.filterConditions.warehouseId);
				self.doQueueListQuery({
//					"pageNo": 1,
//					"pageSize": 10,
					"warehouseId": self.queuePage.filterConditions.warehouseId,
					"businessType": self.queuePage.filterConditions.businessType,
					"carPlateNo": self.queuePage.filterConditions.carPlateNo,
					"ladingCode": self.queuePage.filterConditions.ladingCode,
					"orderType": self.queuePage.orderType
				}, function() {
//					queuePullRefresh.scrollTo(0, 0, 0);
				});
				self.hideOffCanvaQuery();
			},
			scannerQRCode: function() {
				var self = this;
				m.openWindow({
					id: 'read-qrcode',
					url: '../../barcode/html/read-qrcode.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						source: ws.id
					}
				});
			},
			scanner: function(qRCodeStr) {
				var self = this;
//				qRCodeStr = 'http://10.124.24.139:8880/a/wechat/queue/queueView?sendCode=FH1811120480';
				var qRCode = '';
				if(!qRCodeStr){
					plus.device.beep(4);
					alert("无法识别的条码，请重试！");
					setFocusForScanner();
					return;
				}
				qRCode = qRCodeStr.substring((qRCodeStr.lastIndexOf('=') + 1), qRCodeStr.length);
				if(qRCode) {
					if(app.debug) {
						console.log('qRCode:' + JSON.stringify(qRCode));
					}
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					var apiUrl = app.api_url + '/api/proQueue/scanForm?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							sendCode: qRCode
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
									console.log('scanner data:' + JSON.stringify(data));
								}
								if(data.msg) {
									plus.device.beep(4);
									alert(data.msg);
									return;
								}
								plus.device.beep(2);
								self.openEditHTML(0, data.proQueue);
							} else {
								plus.device.beep(4);
								alert("无效条码！");
								setFocusForScanner();
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
				} else {
					plus.device.beep(4);
					alert("无法识别的条码，请重试！");
					setFocusForScanner();
				}
			},
			processListItem: function($event, id) {
				var self = this;
				event.stopPropagation();
				layer.open({
					title: false,
					content: '提示：确认要作废该条记录吗?',
					btn: ['确认', '取消'],
					yes: function(index, layero) {
						//按钮【确认】的回调
						var apiUrl = app.api_url + '/api/proQueue/cancel?_t=' + new Date().getTime();
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
										self.doQueueListQuery({
//											"pageNo": 1,
//											"pageSize": 10,
											"warehouseId": self.queuePage.filterConditions.warehouseId,
											"businessType": self.queuePage.filterConditions.businessType,
											"carPlateNo": self.queuePage.filterConditions.carPlateNo,
											"ladingCode": self.queuePage.filterConditions.ladingCode,
											"orderType": self.queuePage.orderType
										}, function() {
//											queuePullRefresh.scrollTo(0, 0, 100);
//											queuePullRefresh.refresh(true);
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
			},
			onItemSortClick: function($event, orderType) {
				var self = this;
				event.stopPropagation();
				self.queuePage.orderType = orderType;
				//				slider.refresh();
				//				self.resetFilter();
				//				$('#li_warehouse').removeClass();
				//				$('#li_warehouse').addClass('mui-table-view-cell mui-collapse mui-active');
				self.doQueueListQuery({
//					"pageNo": 1,
//					"pageSize": 10,
					"warehouseId": self.queuePage.filterConditions.warehouseId,
					"businessType": self.queuePage.filterConditions.businessType,
					"carPlateNo": self.queuePage.filterConditions.carPlateNo,
					"ladingCode": self.queuePage.filterConditions.ladingCode,
					"orderType": self.queuePage.orderType
				}, function() {
//					queuePullRefresh.scrollTo(0, 0, 0);
				});
			},
			openEditHTML: function(processType, item) { //processType 操作类型 0:扫码新增;1:手工新增;2:修改;
				var self = this;
				if(processType == 1) {
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					var apiUrl = app.api_url + '/api/proQueue/form?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							if(swaiting) {
								swaiting.close();
							}
							if(data) {
								if(data.msg) {
									alert(data.msg);
									return;
								}
								m.openWindow({
									id: 'queue-register-edit',
									url: '../html/queue-register-edit.html',
									show: {
										aniShow: 'pop-in'
									},
									waiting: {
										autoShow: true
									},
									extras: {
										"processType": processType, //操作类型 0:扫码新增;1:手工新增;2:修改;
										"queueItem": item
									}
								});
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
				} else if(processType == 2) {
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					var apiUrl = app.api_url + '/api/proQueue/editForm?_t=' + new Date().getTime();
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
								if(data.msg) {
									alert(data.msg);
									return;
								}
								m.openWindow({
									id: 'queue-register-edit',
									url: '../html/queue-register-edit.html',
									show: {
										aniShow: 'pop-in'
									},
									waiting: {
										autoShow: true
									},
									extras: {
										"processType": processType, //操作类型 0:扫码新增;1:手工新增;2:修改;
										"queueItem": data.proQueue
									}
								});
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
				} else {
					m.openWindow({
						id: 'queue-register-edit',
						url: '../html/queue-register-edit.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
							"processType": processType, //操作类型 0:扫码新增;1:手工新增;2:修改;
							"queueItem": item
						}
					});
				}
			},
			/*
			 * 获取列表
			 */
			doQueueListQuery: function(params, callback) {
				var self = this;
//				alert(JSON.stringify(params));
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('处理中...');
				}
				m.ajax(app.api_url + '/api/proQueue/list?_t=' + new Date().getTime(), {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					//timeout: 10000, //超时时间设置为10秒； 
					success: function(data) {
						if(swaiting) {
							swaiting.close();
						}
						if(app.debug) {
							console.log("doQueueListQuery:" + JSON.stringify(data));
						}
						if(data) {
							self.queueTotalShow = data.queueTotal ? data.queueTotal + "人" : "0人";
							//							alert("queueBusinessType:" + JSON.stringify(data.queueBusinessType));
							//							alert("enterBusinessStatus:" + JSON.stringify(data.enterBusinessStatus));
//							self.queuePage.pageNo = data.pageNo;
//							self.queuePage.pageSize = data.pageSize;
//							self.queuePage.totalListCount = data.count;
//							self.queuePage.totalPage = data.totalPage;
//							if(self.queuePage.pageNo == 1) {
//								self.queueList = data.queueList;
//							} else {
//								self.queueList = self.queueList.concat(data.queueList);
//							}
							self.queueList = data.queueList;
							if(self.queueList && self.queueList.length > 0) {
								m.each(self.queueList, function(index, item) {
									if(item) {
										item.queueCodeInfo = item.queueCode;
										if(item.businessType == "1") {
											item.queueCodeInfo = item.bridgeCraneName ? (item.queueCode + "/" + item.bridgeCraneName) : item.queueCode;
											item.ladingInfo = (!item.sendNumTotal && !item.sendWeightTotal) ? "0件/0吨" : (item.sendNumTotal && !item.sendWeightTotal) ? (item.sendNumTotal + "件/0吨") : (!item.sendNumTotal && item.sendWeightTotal) ? ("0件/" + item.sendWeightTotal + "吨") : (item.sendNumTotal + "件/" + item.sendWeightTotal + "吨");
											item.ladingCodeInfo = (!item.ladingCode && !item.sendCode) ? "" : (item.ladingCode && !item.sendCode) ? item.ladingCode : (!item.ladingCode && item.sendCode) ? item.sendCode : (item.ladingCode + "/" + item.sendCode);
										} else if(item.businessType == "2") {
											item.valideDateInfo = item.valideDateFrom + "-" + item.valideDateTo;
										}
									}
								});
							}
							if(app.debug) {
								console.log("queueList:" + JSON.stringify(self.queueList));
						}
						}
						if(typeof callback === "function") {
							callback();
						}
						setFocusForScanner();
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			/**
			下拉查询
			*/
			pullDownQuery: function(id) {
				var self = this;
				self.queuePage.pageNo = 1;
				//						self.queuePage.pageSize = 10;
				self.doQueueListQuery({
//					"pageNo": self.queuePage.pageNo,
					//							"pageSize": self.queuePage.pageSize,
					"warehouseId": self.queuePage.filterConditions.warehouseId,
					"businessType": self.queuePage.filterConditions.businessType,
					"carPlateNo": self.queuePage.filterConditions.carPlateNo,
					"ladingCode": self.queuePage.filterConditions.ladingCode,
					"orderType": self.queuePage.orderType
				}, function() {
					m.toast("加载成功!");
					queuePullRefresh.endPulldownToRefresh();
					queuePullRefresh.scrollTo(0, 0, 0);
					if(self.queuePage.totalPage > 1) {
						queuePullRefresh.refresh(true);
					}
				});
			},
			/**
			 * 上拉查询
			 */
			pullUpQuery: function(id) {
				var self = this;
				if(self.queuePage.pageNo < self.queuePage.totalPage) {
					self.queuePage.pageNo++;
					self.doQueueListQuery({
						"pageNo": self.queuePage.pageNo,
						"warehouseId": self.queuePage.filterConditions.warehouseId,
						"businessType": self.queuePage.filterConditions.businessType,
						"carPlateNo": self.queuePage.filterConditions.carPlateNo,
						"ladingCode": self.queuePage.filterConditions.ladingCode,
						"orderType": self.queuePage.orderType
					}, function() {
						queuePullRefresh.endPullupToRefresh();
					});
				} else {
					queuePullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						queuePullRefresh.disablePullupToRefresh();
					}, 1500);
				}
			}
		}
	});

//	queuePullRefresh = m('#queueList .public-list').pullRefresh({
//		down: {
//			contentrefresh: '加载中...',
//			callback: function() {
//				globalVue.pullDownQuery("queueList");
//			}
//		},
//		up: {
//			contentrefresh: '正在加载...',
//			contentnomore: '没有更多数据了',
//			callback: function() {
//				var self = this;
//				globalVue.pullUpQuery("queueList");
//			}
//		}
//	});

	$('#txt_scanner').focus();
	$('#txt_scanner').bind('keyup', function(event) {
		if(event.keyCode == "13") {
			var qrCode = $('#txt_scanner').val();
			$('#txt_scanner').val("");
			globalVue.scanner(qrCode);
		}
	});

	var initNativeObjects = function() {
		if(mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var Context = plus.android.importClass("android.content.Context");
			InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
		}
	};

	var showSoftInput = function() {
		var nativeWebview = plus.webview.currentWebview().nativeInstanceObject();
		if(mui.os.android) {
			//当前webview获得焦点
			plus.android.importClass(nativeWebview);
			nativeWebview.requestFocus();
		}
		setTimeout(function() {
			//此处可写具体逻辑设置获取焦点的input
			var inputElem = document.getElementById('txt_scanner');
			inputElem.focus();
			imm.hideSoftInputFromWindow(nativeWebview.getWindowToken(), 0);
		}, 100);
	};

	function setFocusForScanner() {
		if(plus.device.model == app.pdaModel) {
			initNativeObjects();
			showSoftInput();
		}
	}
	
	document.addEventListener("scanner", function(e) {
		globalVue.scanner(e.detail.qRCode);
	}, false);

	document.addEventListener("refreshQueueList", function(e) {
		globalVue.doQueueListQuery({
//			"pageNo": 1,
//			"pageSize": 10,
			"warehouseId": globalVue.queuePage.filterConditions.warehouseId,
			"businessType": globalVue.queuePage.filterConditions.businessType,
			"carPlateNo": globalVue.queuePage.filterConditions.carPlateNo,
			"ladingCode": globalVue.queuePage.filterConditions.ladingCode,
			"orderType": globalVue.queuePage.orderType
		}, function() {
//			queuePullRefresh.scrollTo(0, 0, 0);
//			queuePullRefresh.refresh(true);
		});
	}, false);
});