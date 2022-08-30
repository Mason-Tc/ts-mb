define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var echarts = require("echarts");
	var com = require("computer");
	require("jquery");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("f2");
	require("light");
	require("moment");
	var fixTable = require("fixed-left-header-table");
	require("../../../js/common/common.js");

	var ws = null;
	var awaiting = null;

	var beginMonth = moment().subtract(11, 'months').format('YYYY-MM');
	var endMonth = moment().format('YYYY-MM');

	var beginDate = moment().startOf('month').format('YYYY-MM-DD');
	var endDate = moment().endOf('month').format('YYYY-MM-DD');
	var dtPicker1 = new mui.DtPicker({
		"type": "date",
		"value": beginDate
	});
	var dtPicker2 = new mui.DtPicker({
		"type": "date",
		"value": endDate
	});

	//下拉刷新对象
	//	var pullRefresh = null;

	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#warehouseScrollDiv').scroll({
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
	var screenHeight = getClientHeight();

	fixTable.setTable1(0, "", false);

	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.filterConditions.beginDate = beginDate;
		globalVue.filterConditions.endDate = endDate;
		globalVue.sortColumn = globalVue.sortColumns[0];
		globalVue.getWarehouseList();
		globalVue.globalDoQuery();

		var backDefault = m.back;

		function detailBack() {
			if(awaiting) {
				awaiting.close();
			}
			if(offCanvasQuery.isShown("right")) {
				globalVue.hideOffCanvaQuery();
			} else
				backDefault();
		}
		m.back = detailBack;

	});

	var globalVue = new Vue({
		el: "#off-canvas",
		data: {
			realNumTotalForSummaryStr: '0家', //客户总数
			realWeightTotalForSummaryStr: '0吨', //客户库存
			turnoverRateSort: 'desc', //周转率
			enterWeightSort: 'desc', //入库量
			outWeightSort: 'desc', //出库量
			tpWeightSort: 'desc', //吞吐量
			balanceSort: 'desc', //结算金额
			finalWeightSort: 'desc',//期末结存量
			sortColumn: '',
			sortColumns: ["周转率", "入库量", "出库量", "吞吐量", "结算金额", "期末结存量"],
			selectedMtxs: {},
			warehouseList: [], // 可选仓库列表
			filterConditions: { // 筛选条件
				warehouseId: '', // 仓库ID
				warehouse: '', // 仓库名称
				ownerName: '', // 客户名称
				beginDate: '',
				endDate: '',
			},
			summaryList: []
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
					self.filterConditions.beginDate = selectItems.value;
					$('.tap-time').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				});
			},
			pickEndDate: function() {
				var self = this;
				dtPicker2.show(function(selectItems) {
					self.filterConditions.endDate = selectItems.value;
					$('.tap-time').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				});
			},
			globalDoQuery: function(ishideCanva) {
				var self = this;
				self.summaryQuery();
				if(ishideCanva)
					self.hideOffCanvaQuery();
			},
			/**
			 * 
			 * @param {Object} $event
			 * @param {Object} status 具体条件(0 当月; 1 近3月; 2 近6月;)
			 */
			selectDate: function($event, status) {
				var self = this;
				var selectedObj = $(event.currentTarget);
				$('.tap-time').each(function() {
					var obj = $(this);
					obj.removeClass('time-selected');
				});
				selectedObj.addClass('time-selected');
				if(status == 0) {
					self.filterConditions.beginDate = moment().startOf('month').format('YYYY-MM-DD');
					self.filterConditions.endDate = moment().endOf('month').format('YYYY-MM-DD');
				} else if(status == 1) {
					self.filterConditions.beginDate = moment().subtract(3, 'months').format('YYYY-MM-DD');
					self.filterConditions.endDate = moment().format('YYYY-MM-DD');
				} else if(status == 2) {
					self.filterConditions.beginDate = moment().subtract(6, 'months').format('YYYY-MM-DD');
					self.filterConditions.endDate = moment().format('YYYY-MM-DD');
				}
				dtPicker1 = new mui.DtPicker({
					"type": "date",
					"value": self.filterConditions.beginDate
				});
				dtPicker2 = new mui.DtPicker({
					"type": "date",
					"value": self.filterConditions.endDate
				});
			},
			/**
			 * 根据查询参数查询
			 * @param {Function} callback
			 */
			summaryQuery: function(callback) {
				var self = this;
				if(window.plus) {
					awaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				var apiUrl = app.api_url + '/api/CustomerAnalyzeApi/list?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						warehouseIds: self.filterConditions.warehouseId,
						ownerName: self.filterConditions.ownerName,
						beginDate: self.filterConditions.beginDate,
						endDate: self.filterConditions.endDate
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(awaiting) {
							awaiting.close();
						}
						//						alert(JSON.stringify(data));
						if(data) {
							self.summaryList = data.customerList;
							self.realNumTotalForSummaryStr = data.ownerCount ? (data.ownerCount + '家') : '0家';
							self.realWeightTotalForSummaryStr = data.TpWeightTotal ? (data.TpWeightTotal + '吨') : '0吨';
							if(self.summaryList != null && self.summaryList.length > 0) {
								m.each(self.summaryList, function(index, item) {
									if(item) {
										var idx = index + 1;
										//										var ownerName = item.ownerName ? (idx + '.' + item.ownerName) : '';
										var ownerName = item.ownerName ? item.ownerName : '';
										item.ownerNameShow = ownerName;
										item.ownerNameShowAbb = buildAbbreviation(ownerName, 7, 4, 4);
									}
								});
							}
						}
						if(typeof callback === "function") {
							callback();
						}
					},
					error: function(xhr, type, errorThrown) {
						if(awaiting) {
							awaiting.close();
						}
						if(typeof callback === "function") {
							callback();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			getWarehouseList: function() {
				var self = this;
				var apiUrl = app.api_url + '/api/sysBusinessBasis/warehouseInfos1?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					dataType: 'json', //服务器返回json格式数据
					type: 'GET', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					async: false,
					success: function(data) {
						self.warehouseList = data;
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
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
				var warehouseIds = [];
				if(selectedObj.hasClass("warehouseA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
//						eval('delete globalVue.selectedMtxs.' + cpsId);
//						Vue.delete(self.selectedMtxs, 0);
					} else {
						selectedObj.addClass('selectedTD');
//						Vue.set(self.selectedMtxs, 0, {
//							id: cpsId,
//							name: selectedObj.text(),
//							tagId: selectedObj.attr('id')
//						});
					}
				} else {}
				$('.selectedTD').each(function() {
					var obj = $(this);
					if(obj.hasClass("warehouseA")) {
//						if(selectedObj.hasClass("warehouseA")) {
//							obj.removeClass('selectedTD');
//							warehouseId = selectedObj.attr('mtxId');
//							selectedObj.addClass('selectedTD');
//						} else {
//							warehouseId = obj.attr('mtxId');
//						}
						warehouseIds.push(obj.attr('mtxId'));
					}
				});
				self.filterConditions.warehouseId = warehouseIds ? warehouseIds.join(',') : '';
				console.log('warehouseIds=' + self.filterConditions.warehouseId);
			},
			resetFilter: function() {
				var self = this;
				self.filterConditions.warehouseId = '';
				self.filterConditions.warehouse = '';
				self.filterConditions.ownerName = '';
				$('.tap-time').each(function() {
					var obj = $(this);
					obj.removeClass('time-selected');
				});
				$('#td_curr_day').addClass('time-selected');
				self.filterConditions.beginDate = beginDate;
				self.filterConditions.endDate = endDate;
				self.selectedMtxs = {};
				$('.selectedTD').each(function() {
					var obj = $(this);
					obj.removeClass('selectedTD');
				});
			},
			complete: function() {
				var self = this;
				self.globalDoQuery(true);
			},
			openDetailPage: function($event, item) {
//				var self = this;
//				m.openWindow({
//					id: 'customer-analysis-detail',
//					"url": '../html/customer-analysis-detail.html',
//					show: {
//						aniShow: 'pop-in'
//					},
//					waiting: {
//						autoShow: true
//					},
//					extras: {
//						//自定义扩展参数，可以用来处理页面间传值
//						warehouseId: item.warehouseId, //仓库id
//						ownerId: item.ownerId, //客户Id
//						ownerName: item.ownerName //客户名称       
//					}
//				});
			},
			openBalancePage: function($event, item) {
				var self = this;
				if(!item.settlementMoney || item.settlementMoney == 0) {
					m.toast('当前客户没有相关数据');
					return;
				}
				m.openWindow({
					id: 'settlement-analysis',
					"url": '../../settlement-analysis/html/settlement-analysis-detail.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						//自定义扩展参数，可以用来处理页面间传值
						sourcePage: 'customer-analysis',
						model: 2,
						warehouseId: (!item.warehouseId || item.warehouseId == 'undefined' ? '' : item.warehouseId),
						spenderId: item.ownerId,
						topText: item.ownerName + '趋势分析',
						beginDate: beginMonth,
						endDate: endMonth
					}
				});
			},
			doTurnoverRateSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.turnoverRate < y.turnoverRate) {
						return -1;
					} else if(x.turnoverRate > y.turnoverRate) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.turnoverRate < y.turnoverRate) {
						return 1;
					} else if(x.turnoverRate > y.turnoverRate) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[0];
				if(self.turnoverRateSort === 'desc') {
					self.turnoverRateSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.turnoverRateSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			},
			doEnterWeightSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.periodEnterWeight < y.periodEnterWeight) {
						return -1;
					} else if(x.periodEnterWeight > y.periodEnterWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.periodEnterWeight < y.periodEnterWeight) {
						return 1;
					} else if(x.periodEnterWeight > y.periodEnterWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[1];
				if(self.enterWeightSort === 'desc') {
					self.enterWeightSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.enterWeightSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			},
			doOutputWeightSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.periodOutputWeight < y.periodOutputWeight) {
						return -1;
					} else if(x.periodOutputWeight > y.periodOutputWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.periodOutputWeight < y.periodOutputWeight) {
						return 1;
					} else if(x.periodOutputWeight > y.periodOutputWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[2];
				if(self.outWeightSort === 'desc') {
					self.outWeightSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.outWeightSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			},
			doFinalWeightSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.finalWeight < y.finalWeight) {
						return -1;
					} else if(x.finalWeight > y.finalWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.finalWeight < y.finalWeight) {
						return 1;
					} else if(x.finalWeight > y.finalWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[5];
				if(self.finalWeightSort === 'desc') {
					self.finalWeightSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.finalWeightSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			},
			doSpotGoodsTpWeightSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.spotGoodsTpWeight < y.spotGoodsTpWeight) {
						return -1;
					} else if(x.spotGoodsTpWeight > y.spotGoodsTpWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.spotGoodsTpWeight < y.spotGoodsTpWeight) {
						return 1;
					} else if(x.spotGoodsTpWeight > y.spotGoodsTpWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[3];
				if(self.tpWeightSort === 'desc') {
					self.tpWeightSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.tpWeightSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			},
			doBalanceSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.settlementMoney < y.settlementMoney) {
						return -1;
					} else if(x.settlementMoney > y.settlementMoney) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.settlementMoney < y.settlementMoney) {
						return 1;
					} else if(x.settlementMoney > y.settlementMoney) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[4];
				if(self.balanceSort === 'desc') {
					self.balanceSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.balanceSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			}
		}
	});

	function getClientHeight() {
		var clientHeight = 0;
		if(document.body.clientHeight && document.documentElement.clientHeight) {
			var clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
		} else {
			var clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
		}
		return clientHeight;
	}

});