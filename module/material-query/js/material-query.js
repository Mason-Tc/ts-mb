define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");

	m('#warehouseScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	m('#warehousePlaceScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	var offCanvasQuery = m("#off-canvas").offCanvas();
	var mask = m.createMask(function() {
		if(offCanvasQuery.isShown("right")) {
			offCanvasQuery.close();
			$('#searchVue').hide();
			mask.close();
		}
	}, 'contentDiv');

	var ws = null;
	var swaiting = null;
	var materialListPullRefresh = null;

	var nativeWebview, imm, InputMethodManager;

	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.isPDA = plus.device.model == app.pdaModel;
		globalVue.getWarehouseConditions();
		globalVue.doMaterialListQuery({
			"pageNo": 1,
			"pageSize": 10
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
			conditions: {},
			selectedMtxs: {},
			warehouseList: [],
			warehousePlaceList: [],
			materialPage: {
				materialList: [],
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0, //总条数
				filterConditions: { // 筛选条件
					"packageNo": "",
					"materialCode": "",
					"warehouseId": "",
					"warehousePlaceId": ""
				},
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
				var self = this;
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
			searchIvntDetail: function(evt, curId) {
				var self = this;
				var selectedObj;
				if(evt != null) {
					selectedObj = $(evt.currentTarget);
					var cpsId = selectedObj.attr("class").substring(0, selectedObj.attr("class").indexOf(" ")) + selectedObj.attr("mtxId");
				} else {
					selectedObj = $(null);
				}
				var warehouseId = '',
					warehousePlaceId = '';
				if(selectedObj.hasClass("warehouseA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
						self.warehousePlaceList = [];
						Vue.delete(self.selectedMtxs, 0);
						Vue.delete(self.selectedMtxs, 1);
					} else {
						selectedObj.addClass('selectedTD');
						self.warehousePlaceList = eval('globalVue.conditions.warehousePlaceMap._' + selectedObj.attr('mtxId'));
						Vue.set(self.selectedMtxs, 0, {
							id: cpsId,
							name: selectedObj.text(),
							tagId: selectedObj.attr('id')
						});
						if(self.selectedMtxs["1"]) {
							Vue.delete(self.selectedMtxs, 1);
						}
					}
				} else if(selectedObj.hasClass("warehousePlaceA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
						eval('delete globalVue.selectedMtxs.' + cpsId);
						Vue.delete(self.selectedMtxs, 1);
					} else {
						selectedObj.addClass('selectedTD');
						Vue.set(self.selectedMtxs, 1, {
							id: cpsId,
							name: selectedObj.text(),
							tagId: selectedObj.attr('id')
						});
						if(selectedObj.hasClass("warehouseA")) {
							Vue.delete(self.selectedMtxs, 1);
						}
					}
				} else {}
				$('.selectedTD').each(function() {
					var obj = $(this);
					if(obj.hasClass("warehouseA")) {
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
				self.materialPage.filterConditions.warehouseId = warehouseId;
				self.materialPage.filterConditions.warehousePlaceId = warehousePlaceId;
				console.log('warehouseId=' + self.materialPage.filterConditions.warehouseId + ',warehousePlaceId=' + self.materialPage.filterConditions.warehousePlaceId);
			},
			removeSltMtx: function(evnet, type, id) {
				var selectedObj = $(event.currentTarget);
				var fireOnThis = document.getElementById(selectedObj.attr("tagId"));
				m.trigger(fireOnThis, 'tap');
			},
			resetFilter: function() {
				var self = this;
				self.materialPage.filterConditions.packageNo = '';
				self.materialPage.filterConditions.materialCode = '';
				self.materialPage.filterConditions.warehouseId = '';
				self.materialPage.filterConditions.warehousePlaceId = '';
				self.warehousePlaceList = [];
				self.selectedMtxs = {};
				$('.selectedTD').each(function() {
					var obj = $(this);
					obj.removeClass('selectedTD');
				});
				setFocusForScanner();
			},
			complete: function() {
				var self = this;
				self.materialPage.pageNo = 1;
				self.doMaterialListQuery({
					"pageNo": self.materialPage.pageNo,
					"packageNo": self.materialPage.filterConditions.packageNo,
					"materialCode": self.materialPage.filterConditions.materialCode,
					"warehouseId": self.materialPage.filterConditions.warehouseId,
					"warehousePlaceId": self.materialPage.filterConditions.warehousePlaceId
				}, function() {
					m.toast("加载成功!");
					materialListPullRefresh.endPulldownToRefresh();
					materialListPullRefresh.scrollTo(0, 0, 100);
					if(self.materialPage.totalPage > 1) {
						materialListPullRefresh.refresh(true);
					}
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
			scanner: function(qRCode) {
				var self = this;
				if(qRCode) {
					if(app.debug) {
						console.log('qRCode:' + JSON.stringify(qRCode));
					}
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					var apiUrl = app.api_url + '/api/proMoveApi/addMaterial?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							materialCode: qRCode
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
								if(data.scanResultFlag == '1'){
									plus.device.beep(4);
									alert("您目前没有对该物料的数据权限！");
									return;
								}
								self.resetFilter();
								self.doMaterialListQuery({
									"pageNo": 1,
									"pageSize": 10,
									"packageNo": '',
									"materialCode": data.materialCode,
									"warehouseId": '',
									"warehousePlaceId": ''
								}, function() {
									m.toast("加载成功!");
									materialListPullRefresh.endPulldownToRefresh();
									materialListPullRefresh.scrollTo(0, 0, 100);
									if(self.materialPage.totalPage > 1) {
										materialListPullRefresh.refresh(true);
									}
								});
							} else {
								plus.device.beep(4);
								alert("找不到与此编码对应的物料信息！");
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
				}
			},
			/*
			 * 获取列表数据
			 */
			doMaterialListQuery: function(params, callback) {
				var self = this;
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				m.ajax(app.api_url + '/api/proInventoryApi/getInventoryList', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(swaiting) {
							swaiting.close();
						}
						if(app.debug) {
							console.log('doMaterialListQuery:' + JSON.stringify(data));
						}
						self.materialPage.pageNo = data.pageNo;
						self.materialPage.pageSize = data.pageSize;
						self.materialPage.totalListCount = data.count;
						self.materialPage.totalPage = data.totalPage;
						if(self.materialPage.pageNo == 1) {
							self.materialPage.materialList = data.list;
						} else {
							self.materialPage.materialList = self.materialPage.materialList.concat(data.list);
						}
						if(self.materialPage.materialList && self.materialPage.materialList.length > 0) {
							m.each(self.materialPage.materialList, function(index, item) {
								if(item) {
									var warehouseInfo = "";
									if(item.warehousePlace && item.storeyNo) {
										warehouseInfo = item.warehousePlace + "/" + item.storeyNo;
									} else if(item.warehousePlace && !item.storeyNo) {
										warehouseInfo = item.warehousePlace;
									} else if(!item.warehousePlace && !item.storeyNo) {
										warehouseInfo = item.storeyNo;
									}
									item.warehouseInfo = warehouseInfo;
									item.itemTotal = (item.num ? item.num : '0') + item.numUnitDesc + "/" + (item.weight ? item.weight : '0') + item.weightUnitDesc;
								}
							});
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
				self.materialPage.pageNo = 1;
				self.doMaterialListQuery({
					"pageNo": self.materialPage.pageNo,
					"packageNo": self.materialPage.filterConditions.packageNo,
					"materialCode": self.materialPage.filterConditions.materialCode,
					"warehouseId": self.materialPage.filterConditions.warehouseId,
					"warehousePlaceId": self.materialPage.filterConditions.warehousePlaceId
				}, function() {
					m.toast("加载成功!");
					materialListPullRefresh.endPulldownToRefresh();
					materialListPullRefresh.scrollTo(0, 0, 100);
					if(self.materialPage.totalPage > 1) {
						materialListPullRefresh.refresh(true);
					}
				});
			},
			/**
			 * 上拉查询
			 */
			pullUpQuery: function() {
				var self = this;
				if(self.materialPage.pageNo < self.materialPage.totalPage) {
					self.materialPage.pageNo++;
					self.doMaterialListQuery({
						"pageNo": self.materialPage.pageNo,
						"packageNo": self.materialPage.filterConditions.packageNo,
						"materialCode": self.materialPage.filterConditions.materialCode,
						"warehouseId": self.materialPage.filterConditions.warehouseId,
						"warehousePlaceId": self.materialPage.filterConditions.warehousePlaceId
					}, function() {
						materialListPullRefresh.endPullupToRefresh();
					});
				} else {
					materialListPullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						materialListPullRefresh.disablePullupToRefresh();
					}, 1500);
				}
			}
		}
	});

	function initHeight() {
		var windowHeight = $(window).height();
		$('body').height(windowHeight);
		$('#div_info_list').height(windowHeight - 90);
		$('#div_info_list .public-list').height(windowHeight - 100);
		$(window).resize(function() {
			var windowHeight = $(window).height();
			$('body').height(windowHeight);
			$('#div_info_list').height(windowHeight - 90);
			$('#div_info_list .public-list').height(windowHeight - 100);
		});
	}
	initHeight();
	mui('#div_info_list .public-list').scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	materialListPullRefresh = m('#div_info_list .public-list').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				globalVue.pullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			contentnomore: '没有更多数据了',
			callback: function() {
				var self = this;
				globalVue.pullUpQuery();
			}
		}
	});

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
});