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
	var twaiting = null;

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

	$('#div_trend_pull_fresh').height(screenHeight - 90);

	var slider = m("#slider").slider();
	slider.setStopped(true);

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
	var beginMonth = moment().subtract(11, 'months').format('YYYY-MM');
	var endMonth = moment().format('YYYY-MM');
	var dtPicker11 = new mui.DtPicker({
		"type": "month",
		"value": beginMonth
	});
	var dtPicker22 = new mui.DtPicker({
		"type": "month",
		"value": endMonth
	});

	fixTable.setTable1(0, "", false);

	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.filterConditions.beginDate = beginDate;
		globalVue.filterConditions.endDate = endDate;
		globalVue.filterConditions.beginMonth = beginMonth;
		globalVue.filterConditions.endMonth = endMonth;
		globalVue.sortColumn = globalVue.sortColumns[0];
		globalVue.getWarehouseList();
		globalVue.globalDoQuery();

		var backDefault = m.back;

		function detailBack() {
			if(awaiting) {
				awaiting.close();
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
		el: "#off-canvas",
		data: {
			warehouseName: '', // 已选仓库名称
			warehouseID: '', // 已选仓库ID
			exponentType: 1,
			realNumTotalForSummaryStr: '0件', 
			realWeightTotalForSummaryStr: '0吨', 
			inStorageSort: 'desc',
			sortColumn: '',
			sortColumns: ["吞吐量", "占比", "环比增长率"],
			selectedMtxs: {},
			warehouseList: [], // 可选仓库列表
			filterConditions: { // 筛选条件
				warehouseId: '', // 仓库ID
				warehouse: '', // 仓库名称
				beginDate: '',
				endDate: '',
				beginMonth: '',
				endMonth: ''
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
			pickBeginMonth: function() {
				var self = this;
				dtPicker11.show(function(selectItems) {
					self.filterConditions.beginMonth = selectItems.value;
					$('.tap-month').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				});
			},
			pickEndMonth: function() {
				var self = this;
				dtPicker22.show(function(selectItems) {
					self.filterConditions.endMonth = selectItems.value;
					$('.tap-month').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				});
			},
			globalDoQuery: function(ishideCanva) {
				var self = this;
				if(self.exponentType == 0) {
					self.summaryQuery();
				} else {
					self.trendQuery();
				}
				if(ishideCanva)
					self.hideOffCanvaQuery();
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
				var apiUrl = app.api_url + '/api/throughput/throughputAnalysis?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						warehouseId: self.filterConditions.warehouseId,
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
						if(data) {
							self.realNumTotalForSummaryStr = data.totalThroughputNum ? (data.totalThroughputNum + '件') : '0件';
							self.realWeightTotalForSummaryStr = data.totalThroughputWeight ? (data.totalThroughputWeight + '吨') : '0吨';
							self.summaryList = data.throughputList;
							//												alert(JSON.stringify(self.summaryList));
							//计算总计值
							if(self.summaryList != null && self.summaryList.length > 0) {
								m.each(self.summaryList, function(index, item) {
									if(item) {
										var idx = index + 1;
										//									var warehouseName = item.warehouseShortName ? (idx + '.' + item.warehouseShortName) : '';
										var warehouseName = item.warehouseShortName ? item.warehouseShortName : '';
										item.warehouseNameShow = warehouseName;
										item.warehouseNameShowAbb = buildAbbreviation(warehouseName, 18, 8, 5);
										item.ratioShow = item.ratio ? (item.ratio + '%') : '0%';
										item.increaseRateShow = (item.increaseRate < 0 ? "" : "+") + item.increaseRate + "%";
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
			trendQuery: function(callback) {
				var self = this;
				if(window.plus) {
					twaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				var apiUrl = app.api_url + '/api/throughput/throughputTrend?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						warehouseId: self.filterConditions.warehouseId,
						beginDate: self.filterConditions.beginMonth,
						endDate: self.filterConditions.endMonth
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(twaiting) {
							twaiting.close();
						}
						//						alert(JSON.stringify(data))
						if(data) {
							var realWeightTotalArray = [];
							var monthArray = [];
							if(data.trendList && data.trendList.length > 0) {
								m.each(data.trendList, function(index, item) {
									if(item) {
										realWeightTotalArray.push(item.throughputWeight);
										monthArray.push(item.month);
									}
								});
								if(app.debug) {
									console.log(JSON.stringify(monthArray));
								}
								var inContainer = document.getElementById('div_month_chart');
								//																inContainer.style.width = window.innerWidth + 500+'px';
								inContainer.style.width = window.innerWidth + 'px';
								inContainer.style.height = (window.innerHeight / 1.8) + 'px';
								var inChart = this.echarts.init(inContainer, 'light');
								option = {
									//									color: ['#3398DB'],
									title: {
										show: true,
										//										text: '入库趋势'
										text: '',
										subtext: ''
									},
									tooltip: {
										trigger: 'axis',
										axisPointer: { // 坐标轴指示器，坐标轴触发有效
											type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
										}
									},
									grid: {
										left: '3%',
										right: '5%',
										bottom: '5%',
										top: '15%',
										height: '42%',
										containLabel: true
									},
									xAxis: [{
										type: 'category',
										data: monthArray,
										boundaryGap: true,
										axisTick: {
											alignWithLabel: true,
											interval: 0
										},
										axisLabel: {
											interval: 0,
											rotate: 45
										}
									}],
									yAxis: [{
										type: 'value'
									}],
									series: [{
										name: '吞吐量',
										type: 'bar',
										barWidth: '68%',
										//									label: {
										//										normal: {
										//											show: true,
										//											position: 'inside'
										//										}
										//									},
										data: realWeightTotalArray
									}]
								};
								inChart.setOption(option);
							}

							var dataItemArray = [];
							var brandNameArray = [];
							if(data.topBrandList && data.topBrandList.length > 0) {
								$('#div_materiel').show();
								m.each(data.topBrandList, function(index, item) {
									if(item) {
										var dataItem = {
											name: item.brandName,
											value: item.throughputWeight
										};
										dataItemArray.push(dataItem);
										brandNameArray.push(item.brandName);
									}
								});
								if(app.debug) {
									console.log(JSON.stringify(brandNameArray));
								}
								var inContainer = document.getElementById('div_materiel_chart');
								//																inContainer.style.width = window.innerWidth + 500+'px';
								inContainer.style.width = window.innerWidth + 'px';
								inContainer.style.height = (window.innerHeight / 2.8) + 'px';
								var inChart = this.echarts.init(inContainer, 'light');
								option = {
									title: {
										show: true,
										//									text: '费用项目占比',
										text: '',
										subtext: ''
										//									textStyle: {
										//										align: 'left'
										//									}
									},
									tooltip: {
										trigger: 'item',
										formatter: "{b}: {c} ({d}%)"
									},
									legend: {
										orient: 'vertical',
										x: 'right',
										top: 8,
										data: brandNameArray
									},
									series: [{
										name: '品名',
										type: 'pie',
										radius: ['50%', '70%'],
										avoidLabelOverlap: false,
										label: {
											normal: {
												show: false,
												position: 'center'
											},
											emphasis: {
												show: true,
												textStyle: {
													fontSize: '16',
													fontWeight: 'bold'
												}
											}
										},
										labelLine: {
											normal: {
												show: false
											}
										},
										data: dataItemArray
									}]
								};
								inChart.setOption(option);
							} else {
								$('#div_materiel').hide();
							}
						}
						if(typeof callback === "function") {
							callback();
						}
					},
					error: function(xhr, type, errorThrown) {
						if(twaiting) {
							twaiting.close();
						}
						if(typeof callback === "function") {
							callback();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			onItemSliderClick: function($event, index) {
				var self = this;
				event.stopPropagation();
				if(self.exponentType == index)
					return;
				slider.refresh();
				self.resetFilter();
				$('#li_warehouse').removeClass();
				$('#li_warehouse').addClass('mui-table-view-cell mui-collapse mui-active');
				self.exponentType = index;
				self.globalDoQuery(true);
				slider.gotoItem(index);
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
					var cpsId = selectedObj.attr("class").substring(0, selectedObj.attr("class").indexOf(" ")) + selectedObj.attr("mtxid");
				} else {
					selectedObj = $(null);
				}
				var warehouseIds = [];
				if(selectedObj.hasClass("warehouseA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
					} else {
						selectedObj.addClass('selectedTD');
					}
				} else {}
				$('.selectedTD').each(function() {
					var obj = $(this);
					if(obj.hasClass("warehouseA")) {
						warehouseIds.push(obj.attr('mtxid'));
					}
				});
				self.filterConditions.warehouseId = warehouseIds ? warehouseIds.join(',') : '';
				console.log('warehouseIds=' + self.filterConditions.warehouseId);
			},
			/**
			 * 
			 * @param {Object} $event
			 * @param {Object} type 0:时间 1：月份
			 * @param {Object} status 具体条件(结合type 0,0 当月; 0,1 近30天; 0,2 近60天; 1,0 近6个月; 1,1 近12个月)
			 */
			selectDate: function($event, type, status) {
				var self = this;
				var selectedObj = $(event.currentTarget);
				if(type == 0) {
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
				} else if(type == 1) {
					$('.tap-month').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
					selectedObj.addClass('time-selected');
					if(status == 0) {
						self.filterConditions.beginMonth = moment().subtract(5, 'months').format('YYYY-MM');
						self.filterConditions.endMonth = moment().format('YYYY-MM');
					} else if(status == 1) {
						self.filterConditions.beginMonth = moment().subtract(11, 'months').format('YYYY-MM');
						self.filterConditions.endMonth = moment().format('YYYY-MM');
					}
					dtPicker11 = new mui.DtPicker({
						"type": "month",
						"value": self.filterConditions.beginMonth
					});
					dtPicker22 = new mui.DtPicker({
						"type": "month",
						"value": self.filterConditions.endMonth
					});
				}
			},
			resetFilter: function() {
				var self = this;
				self.filterConditions.warehouseId = '';
				self.filterConditions.warehouse = '';
				$('.tap-time').each(function() {
					var obj = $(this);
					obj.removeClass('time-selected');
				});
				$('.tap-month').each(function() {
					var obj = $(this);
					obj.removeClass('time-selected');
				});
				$('#td_curr_day').addClass('time-selected');
				$('#td_month_12').addClass('time-selected');
				self.filterConditions.beginDate = moment().startOf('month').format('YYYY-MM-DD');
				self.filterConditions.endDate = moment().endOf('month').format('YYYY-MM-DD');
				self.filterConditions.beginMonth = moment().subtract(11, 'months').format('YYYY-MM');
				self.filterConditions.endMonth = moment().format('YYYY-MM');
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
			staInStorageSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.throughputWeight < y.throughputWeight) {
						return -1;
					} else if(x.throughputWeight > y.throughputWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.throughputWeight < y.throughputWeight) {
						return 1;
					} else if(x.throughputWeight > y.throughputWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[0];
				if(self.inStorageSort === 'desc') {
					self.inStorageSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.inStorageSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			}
		}
	});

	//	pullRefresh = m('#div_trend_pull_fresh').pullRefresh({
	//		down: {
	//			//			auto: true,
	//			contentrefresh: '加载中...',
	//			callback: function() {
	//				if(twaiting) {
	//					twaiting.close();
	//				}
	//				globalVue.trendQuery(function() {
	//					if(twaiting) {
	//						twaiting.close();
	//					}
	//					pullRefresh.endPulldownToRefresh();
	//					pullRefresh.scrollTo(0, 0, 500);
	//				});
	//			}
	//		}
	//	});

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