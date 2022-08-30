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
	var ztPlugins = require("../../common/plugins/js/plugins.js");

	var ws = null;
	var swaiting = null;
	var twaiting = null;
	var dataPullRefresh = null;
	var layer = null;
	var slider = m("#slider").slider();
	//	var beginDate = moment().format('YYYY-MM-DD 00:00');
	//	var endDate = moment().format('YYYY-MM-DD 23:59');
	var beginDate = "";
	var endDate = "";

	m('#printList .public-list').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#ownerScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#warehouseScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#warehousePlaceScrollDiv').scroll({
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

	var dtPicker1 = new m.DtPicker({
		"type": "datetime",
		"value": beginDate
	});
	var dtPicker2 = new m.DtPicker({
		"type": "datetime",
		"value": endDate
	});

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.isPDA = plus.device.model == app.pdaModel;
		globalVue.printPage.filterConditions.beginDate = beginDate;
		globalVue.printPage.filterConditions.endDate = endDate;
		globalVue.getOwnerList();
		globalVue.getWarehouseConditions();
		globalVue.doDataListQuery({
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
			headTitle: '标签打印',
			labelTotalShow: '0条',
			conditions: {},
			selectedMtxs: {},
			ownerList: [],
			warehouseList: [],
			warehousePlaceList: [],
			selectedPendingList: [],
			printList: [],
			printPage: {
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0, //总条数
				orderBy: 1, //排序类型(1 按时间,2按货主,3按品名)
				filterConditions: { // 筛选条件
					"packageNo": "", //捆包号
					"materialCode": "", //货物编号 
					"enterCode": "", //入库单
					"ownerId": "", // 货主ID
					"warehouseId": "", //仓库ID
					"warehousePlaceId": "", //库位ID
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
			pickBeginDate: function() {
				var self = this;
				dtPicker1.show(function(selectItems) {
					self.printPage.filterConditions.beginDate = selectItems.value;
					$('.tap-time').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				});
			},
			pickEndDate: function() {
				var self = this;
				dtPicker2.show(function(selectItems) {
					self.printPage.filterConditions.endDate = selectItems.value;
					$('.tap-time').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				});
			},
			/**
			 * 
			 * @param {Object} $event
			 * @param {Object} type 0:当天; 1:近3天; 2:近一周;
			 */
			selectDate: function($event, type) {
				var self = this;
				var selectedObj = $(event.currentTarget);
				$('.tap-time').each(function() {
					var obj = $(this);
					obj.removeClass('time-selected');
				});
				selectedObj.addClass('time-selected');
				if(type == 0) {
					self.printPage.filterConditions.beginDate = moment().format('YYYY-MM-DD 00:00');
					self.printPage.filterConditions.endDate = moment().format('YYYY-MM-DD 23:59');
				} else if(type == 1) {
					self.printPage.filterConditions.beginDate = moment().subtract(3, 'day').format('YYYY-MM-DD 00:00');
					self.printPage.filterConditions.endDate = moment().format('YYYY-MM-DD 23:59');
				} else if(type == 2) {
					self.printPage.filterConditions.beginDate = moment().subtract(7, 'day').format('YYYY-MM-DD 00:00');
					self.printPage.filterConditions.endDate = moment().format('YYYY-MM-DD 23:59');
				}
				dtPicker1 = new mui.DtPicker({
					"type": "datetime",
					"value": self.printPage.filterConditions.beginDate
				});
				dtPicker2 = new mui.DtPicker({
					"type": "datetime",
					"value": self.printPage.filterConditions.endDate
				});
			},
			getOwnerList: function() {
				var self = this;
				//获取客户信息 基础数据
				m.getJSON(app.api_url + '/api/sysBusinessBasis/customerInfo?customerType=2', function(data) {
					if(app.debug) {
						console.log("getOwnerList:" + JSON.stringify(data));
					}
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
				self.printPage.filterConditions.ownerId = ownerId;
				self.printPage.filterConditions.warehouseId = warehouseId;
				self.printPage.filterConditions.warehousePlaceId = warehousePlaceId;
				console.log('ownerId=' + self.printPage.filterConditions.ownerId + ',warehouseId=' + self.printPage.filterConditions.warehouseId + ',warehousePlaceId=' + self.printPage.filterConditions.warehousePlaceId);
			},
			removeSltMtx: function(evnet, type, id) {
				var selectedObj = $(event.currentTarget);
				var fireOnThis = document.getElementById(selectedObj.attr("tagId"));
				m.trigger(fireOnThis, 'tap');
			},
			resetFilter: function() {
				var self = this;
				self.printPage.filterConditions.packageNo = '';
				self.printPage.filterConditions.materialCode = '';
				self.printPage.filterConditions.enterCode = '';
				self.printPage.filterConditions.ownerId = '';
				self.printPage.filterConditions.warehouseId = '';
				self.printPage.filterConditions.warehousePlaceId = '';
				self.printPage.filterConditions.warehouseId = '';
				self.printPage.filterConditions.beginDate = '';
				self.printPage.filterConditions.endDate = '';
				self.selectedMtxs = {};
				self.selectDate(null, -1);
				//				$('#td_curr_day').addClass('time-selected');
				$('.selectedTD').each(function() {
					var obj = $(this);
					obj.removeClass('selectedTD');
				});
				setFocusForScanner();
			},
			complete: function() {
				var self = this;
				//				alert(self.printPage.filterConditions.warehouseId);
				self.doDataListQuery({
					"pageNo": 1,
					"pageSize": 10,
					"packageNo": self.printPage.filterConditions.packageNo,
					"materialCode": self.printPage.filterConditions.materialCode,
					"enterCode": self.printPage.filterConditions.enterCode,
					"ownerId": self.printPage.filterConditions.ownerId,
					"warehouseId": self.printPage.filterConditions.warehouseId,
					"warehousePlaceId": self.printPage.filterConditions.warehousePlaceId,
					"beginDate": self.printPage.filterConditions.beginDate,
					"endDate": self.printPage.filterConditions.endDate,
					"orderBy": self.printPage.orderBy
				}, function() {
					self.resetSelectedPendingList();
					dataPullRefresh.scrollTo(0, 0, 0);
				});
				self.hideOffCanvaQuery();
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
							if(itm.warehouseId != item.warehouseId) {
								isDiff = true;
							}
						}
					});
				}
				if(isChecked) {
					if(isDiff) {
						layer.open({
							title: false,
							content: '提示: 请选择同一仓库资源。当前所选的物料信息与之前所选不同，是否清除之前选项?',
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
						if(self.selectedPendingList.length == self.printList.length) {
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
					m.each(self.printList, function(index, itm) {
						if(itm) {
							if(itm.warehouseId != tmpWarehouseId) {
								isDiff = true;
							}
						}
					});
				} else {
					var tmpWarehouseId = self.printList[0].warehouseId;
					var tmpOwnerId = self.printList[0].ownerId;
					var tmpBrandId = self.printList[0].brandId;
					m.each(self.printList, function(index, itm) {
						if(itm) {
							if(itm.warehouseId != tmpWarehouseId) {
								isDiff = true;
							}
						}
					});
				}
				if(isChecked) {
					if(isDiff) {
						layer.open({
							title: false,
							content: '提示: 请选择同一仓库资源！',
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
						m.each(self.printList, function(index, itm) {
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
					self.labelTotalShow = self.selectedPendingList.length + "条";
				} else {
					self.labelTotalShow = "0条";
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
				if(self.printList && self.printList.length > 0) {
					m.each(self.printList, function(index, item) {
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
			refreshQueueList: function() {
				var self = this;
				self.doDataListQuery({
					//			"pageNo": 1,
					//			"pageSize": 10,
					"packageNo": self.printPage.filterConditions.packageNo,
					"materialCode": self.printPage.filterConditions.materialCode,
					"enterCode": self.printPage.filterConditions.enterCode,
					"ownerId": self.printPage.filterConditions.ownerId,
					"warehouseId": self.printPage.filterConditions.warehouseId,
					"warehousePlaceId": self.printPage.filterConditions.warehousePlaceId,
					"beginDate": self.printPage.filterConditions.beginDate,
					"endDate": self.printPage.filterConditions.endDate,
					"orderBy": self.printPage.orderBy
				}, function() {
					self.resetSelectedPendingList();
					dataPullRefresh.scrollTo(0, 0, 0);
					dataPullRefresh.refresh(true);
				});
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
								if(data.scanResultFlag == '1') {
									plus.device.beep(4);
									alert("您目前没有对该物料的数据权限！");
									return;
								}
								self.resetFilter();
								self.doDataListQuery({
									"pageNo": 1,
									"pageSize": 10,
									"packageNo": '',
									"materialCode": data.materialCode,
									"enterCode": '',
									"ownerId": '',
									"warehouseId": '',
									"warehousePlaceId": '',
									"beginDate": '',
									"endDate": '',
									"orderBy": self.printPage.orderBy
								}, function() {
									//									m.toast("加载成功!");
									dataPullRefresh.endPulldownToRefresh();
									dataPullRefresh.scrollTo(0, 0, 100);
									if(self.printPage.totalPage > 1) {
										dataPullRefresh.refresh(true);
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
			/**
			 * 
			 * @param {Object} $event
			 * @param {Object} orderBy 1:按时间 2:按货主 3:按品名
			 */
			onItemSortClick: function($event, orderBy) {
				var self = this;
				event.stopPropagation();
				self.printPage.orderBy = orderBy;
				//				slider.refresh();
				//				self.resetFilter();
				//				$('#li_warehouse').removeClass();
				//				$('#li_warehouse').addClass('mui-table-view-cell mui-collapse mui-active');
				self.doDataListQuery({
					//					"pageNo": 1,
					//					"pageSize": 10,
					"packageNo": self.printPage.filterConditions.packageNo,
					"materialCode": self.printPage.filterConditions.materialCode,
					"enterCode": self.printPage.filterConditions.enterCode,
					"ownerId": self.printPage.filterConditions.ownerId,
					"warehouseId": self.printPage.filterConditions.warehouseId,
					"warehousePlaceId": self.printPage.filterConditions.warehousePlaceId,
					"beginDate": self.printPage.filterConditions.beginDate,
					"endDate": self.printPage.filterConditions.endDate,
					"orderBy": self.printPage.orderBy
				}, function() {
					self.resetSelectedPendingList();
					dataPullRefresh.scrollTo(0, 0, 0);
				});
			},
			printLabel: function($event) {
				var self = this;
				event.stopPropagation();
				if(!self.selectedPendingList || self.selectedPendingList.length < 1) {
					alert('请选择要打印标签的物料');
					setFocusForScanner();
					return;
				}
				if(app.debug) {
					console.log("printLabel:" + JSON.stringify(self.selectedPendingList));
				}
				ztPlugins.printLabel(3, JSON.stringify(self.selectedPendingList));
			},
			/*
			 * 获取列表
			 */
			doDataListQuery: function(params, callback) {
				var self = this;
				//				alert(JSON.stringify(params));
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('加载中...');
				}
				m.ajax(app.api_url + '/api/proReceiving/invtList?_t=' + new Date().getTime(), {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					//timeout: 10000, //超时时间设置为10秒； 
					success: function(data) {
						if(app.debug) {
							console.log("doDataListQuery:" + JSON.stringify(data));
						}
						if(data) {
							self.printPage.pageNo = data.pageNo;
							self.printPage.pageSize = data.pageSize;
							self.printPage.totalListCount = data.count;
							self.printPage.totalPage = data.totalPage;
							if(self.printPage.pageNo == 1) {
								self.printList = data.list;
							} else {
								self.printList = self.printList.concat(data.list);
							}
							if(self.printList && self.printList.length > 0) {
								m.each(self.printList, function(index, item) {
									if(item) {
										item.cbxId = 'cbx_' + item.id + '_' + index;
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
							if(app.debug) {
								console.log("printList:" + JSON.stringify(self.printList));
							}
						}
						if(typeof callback === "function") {
							callback();
						}
						setFocusForScanner();
						if(swaiting) {
							swaiting.close();
						}
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
				self.printPage.pageNo = 1;
				self.printPage.pageSize = 10;
				self.doDataListQuery({
					"pageNo": self.printPage.pageNo,
					"pageSize": self.printPage.pageSize,
					"packageNo": self.printPage.filterConditions.packageNo,
					"materialCode": self.printPage.filterConditions.materialCode,
					"enterCode": self.printPage.filterConditions.enterCode,
					"ownerId": self.printPage.filterConditions.ownerId,
					"warehouseId": self.printPage.filterConditions.warehouseId,
					"warehousePlaceId": self.printPage.filterConditions.warehousePlaceId,
					"beginDate": self.printPage.filterConditions.beginDate,
					"endDate": self.printPage.filterConditions.endDate,
					"orderBy": self.printPage.orderBy
				}, function() {
					m.toast("加载成功!");
					self.resetSelectedPendingList();
					dataPullRefresh.endPulldownToRefresh();
					dataPullRefresh.scrollTo(0, 0, 0);
					if(self.printPage.totalPage > 1) {
						dataPullRefresh.refresh(true);
					}
				});
			},
			/**
			 * 上拉查询
			 */
			pullUpQuery: function(id) {
				var self = this;
				if(self.printPage.pageNo < self.printPage.totalPage) {
					self.printPage.pageNo++;
					self.doDataListQuery({
						"pageNo": self.printPage.pageNo,
						"packageNo": self.printPage.filterConditions.packageNo,
						"materialCode": self.printPage.filterConditions.materialCode,
						"enterCode": self.printPage.filterConditions.enterCode,
						"ownerId": self.printPage.filterConditions.ownerId,
						"warehouseId": self.printPage.filterConditions.warehouseId,
						"warehousePlaceId": self.printPage.filterConditions.warehousePlaceId,
						"beginDate": self.printPage.filterConditions.beginDate,
						"endDate": self.printPage.filterConditions.endDate,
						"orderBy": self.printPage.orderBy
					}, function() {
						dataPullRefresh.endPullupToRefresh();
						self.resetPendingListChecked();
						self.buildTotalInfo();
					});
				} else {
					dataPullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						dataPullRefresh.disablePullupToRefresh();
					}, 1500);
				}
			}
		}
	});

	dataPullRefresh = m('#printList .public-list').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				globalVue.pullDownQuery("printList");
			}
		},
		up: {
			contentrefresh: '正在加载...',
			contentnomore: '没有更多数据了',
			callback: function() {
				var self = this;
				globalVue.pullUpQuery("printList");
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

	document.addEventListener("refreshQueueList", function(e) {
		globalVue.doDataListQuery({
			//			"pageNo": 1,
			//			"pageSize": 10,
			"packageNo": self.printPage.filterConditions.packageNo,
			"materialCode": self.printPage.filterConditions.materialCode,
			"enterCode": self.printPage.filterConditions.enterCode,
			"ownerId": self.printPage.filterConditions.ownerId,
			"warehouseId": self.printPage.filterConditions.warehouseId,
			"warehousePlaceId": self.printPage.filterConditions.warehousePlaceId,
			"beginDate": self.printPage.filterConditions.beginDate,
			"endDate": self.printPage.filterConditions.endDate,
			"orderBy": self.printPage.orderBy
		}, function() {
			dataPullRefresh.scrollTo(0, 0, 0);
			dataPullRefresh.refresh(true);
		});
	}, false);

	return globalVue;
});