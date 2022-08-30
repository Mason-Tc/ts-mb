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
	var pullRefresh = null;
	var sourcePage = '';

	m.init();

	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.006, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
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

	var slider = m("#slider").slider();
	slider.setStopped(true);

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
	fixTable.setTable1(0, "1", false);
	fixTable.setTable1(0, "2", false);

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		sourcePage = ws.sourcePage;
		globalVue.filterConditions.beginMonth = beginMonth;
		globalVue.filterConditions.endMonth = endMonth;
		globalVue.warehouseSortColumn = globalVue.warehouseSortColumns[1];
		globalVue.ownerSortColumn = globalVue.ownerSortColumns[1];
		globalVue.projectSortColumn = globalVue.projectSortColumns[1];
		globalVue.getWarehouseList();
		if(sourcePage == 'customer-analysis') {
			globalVue.onItemSliderClick(null, 1);
		} else {
			globalVue.warehouseQuery();
		}

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
			currTabIndex: 0,
			totalNumForWarehouseStr: '0元',
			totalWeightForWarehouseStr: '0吨',
			averageMoneyForWarehouse: 0,
			averageWeightForWarehouse: 0,
			totalNumForOwnerStr: '0元',
			totalWeightForOwnerStr: '0吨',
			averageMoneyForOwner: 0,
			averageWeightForOwner: 0,
			totalNumForProjectStr: '0元',
			totalWeightForProjectStr: '0吨',
			averageMoneyForProject: 0,
			averageWeightForProject: 0,
			weightSortForWarehouse: 'desc',
			moneySortForWarehouse: 'desc',
			weightSortForOwner: 'desc',
			moneySortForOwner: 'desc',
			weightSortForProject: 'desc',
			moneySortForProject: 'desc',
			warehouseSortColumn: '',
			warehouseSortColumns: ["结算量", "结算金额", "趋势分析"],
			ownerSortColumn: '',
			ownerSortColumns: ["结算量", "结算金额", "趋势分析"],
			projectSortColumn: '',
			projectSortColumns: ["结算量", "结算金额", "趋势分析"],
			selectedMtxs: {},
			warehouseList: [], // 可选仓库列表
			filterConditions: { // 筛选条件
				warehouseId: '', // 仓库ID
				beginMonth: '',
				endMonth: ''
			},
			warehouseTrendList: [],
			warehouseDetailList: [],
			ownerTrendList: [],
			ownerDetailList: [],
			projectTrendList: [],
			projectDetailList: []
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
						warehouseIds.push(obj.attr('mtxId'));
					}
				});
				self.filterConditions.warehouseId = warehouseIds ? warehouseIds.join(',') : '';
				console.log('warehouseIds=' + self.filterConditions.warehouseId);
			},
			/**
			 * @param {Object} $event
			 * @param {Object} type 0:时间 1：月份
			 * @param {Object} status 具体条件(结合type 0,0 当月; 0,1 近30天; 0,2 近60天; 1,0 近6个月; 1,1 近12个月)
			 */
			selectDate: function($event, type, status) {
				var self = this;
				var selectedObj = $(event.currentTarget);
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
			},
			resetFilter: function() {
				var self = this;
				self.filterConditions.warehouseId = '';
				self.selectedMtxs = {};
				$('.selectedTD').each(function() {
					var obj = $(this);
					obj.removeClass('selectedTD');
				});
			},
			complete: function() {
				var self = this;
				if(self.currTabIndex == 0) {
					////按仓库
					self.warehouseQuery();
				} else if(self.currTabIndex == 1) {
					////按客户
					self.ownerQuery();
				} else if(self.currTabIndex == 2) {
					////按项目
					self.projectQuery();
				}
				slider.gotoItem(self.currTabIndex);
				self.hideOffCanvaQuery();
			},
			openDetailPage: function($event, type, item) {
				var self = this;
				var extras = {};
				if(type == 1) {
					extras = {
						model: 1,
						warehouseId: item.warehouseId,
						topText: item.warehouseShortName + '趋势分析',
						beginDate: self.filterConditions.beginMonth,
						endDate: self.filterConditions.endMonth
					};
				} else if(type == 2) {
					extras = {
						model: 2,
						warehouseId: self.filterConditions.warehouseId,
						spenderId: item.spenderId,
						topText: item.spenderName + '趋势分析',
						beginDate: self.filterConditions.beginMonth,
						endDate: self.filterConditions.endMonth
					};
				} else if(type == 3) {
					extras = {
						model: 3,
						warehouseId: self.filterConditions.warehouseId,
						topText: item.spendItemName + '趋势分析',
						spendItemName: item.spendItemName,
						beginDate: self.filterConditions.beginMonth,
						endDate: self.filterConditions.endMonth
					};
				}
				m.openWindow({
					id: 'settlement-analysis-detail',
					"url": '../html/settlement-analysis-detail.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: extras
				});
			},
			/**
			 * 
			 * @param {Object} model 1-按仓库
			 * @param {Object} callback
			 */
			warehouseQuery: function(callback) {
				var self = this;
				if(window.plus) {
					awaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				self.totalNumForWarehouseStr = '';
				self.totalWeightForWarehouseStr = '';
				self.averageMoneyForWarehouse = 0;
				self.averageWeightForWarehouse = 0;
				self.warehouseDetailList = [];
				self.warehouseTrendList = [];
				//				if(app.debug) {
				//					console.log("beginTime:" + moment().format('YYYY-MM-DD HH:mm:ss'));
				//				}
				var apiUrl = app.api_url + '/api/settlement/proSettlementApi/settlementAnalysis?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						model: 1,
						warehouseId: self.filterConditions.warehouseId,
						beginDate: self.filterConditions.beginMonth,
						endDate: self.filterConditions.endMonth
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						//						if(app.debug) {
						//							console.log("endTime:" + moment().format('YYYY-MM-DD HH:mm:ss'));
						//						}
						if(awaiting) {
							awaiting.close();
						}
						//						alert(JSON.stringify(data));
						if(data) {
							self.totalNumForWarehouseStr = data.totalSettlementMoney ? data.totalSettlementMoney + '元' : '0元';
							self.totalWeightForWarehouseStr = data.totalSettlementWeight ? data.totalSettlementWeight + '吨' : '0吨';
							self.averageMoneyForWarehouse = data.averageSettlementMoney;
							self.averageWeightForWarehouse = data.averageSettlementWeight;
							self.warehouseTrendList = data.trendList;
							self.warehouseDetailList = data.detailList;
							if(self.warehouseDetailList && self.warehouseDetailList.length > 0) {
								m.each(self.warehouseDetailList, function(index, item) {
									if(item) {
										var idx = index + 1;
										//										var warehouseNameShow = item.warehouseShortName ? (idx + '.' + item.warehouseShortName) : '';
										var warehouseNameShow = item.warehouseShortName ? item.warehouseShortName : '';
										item.warehouseNameShow = warehouseNameShow;
										item.warehouseNameShowAbb = buildAbbreviation(warehouseNameShow, 18, 8, 5);
									}
								});
							}
							var settlementWeightArray = []; //结算量
							var settlementMoneyArray = []; //结算金额
							var monthArray = [];
							if(self.warehouseTrendList && self.warehouseTrendList.length > 0) {
								m.each(self.warehouseTrendList, function(index, item) {
									if(item) {
										settlementWeightArray.push(item.settlementWeight);
										settlementMoneyArray.push(item.settlementMoney);
										monthArray.push(item.month);
									}
								});
							}
							var currContainer = document.getElementById('div_warehouse_chart');
							currContainer.style.width = window.innerWidth + 'px';
							currContainer.style.height = (window.innerHeight / 1.8) + 'px';
							currContainer.style.top = '25px';
							currContainer.style.paddingBottom = '8px';
							var currChart = this.echarts.init(currContainer, 'light');
							option = {
								color: ['#3398DB'],
								title: {
									show: true,
									//									text: '费用结算',
									text: '',
									subtext: ''
								},
								tooltip: {
									trigger: 'axis',
									axisPointer: {
										type: 'cross',
										label: {
											backgroundColor: '#283b56'
										}
									}
								},
								legend: {
									data: ['结算量', '结算金额']
								},
								toolbox: {
									show: false,
									feature: {
										dataView: {
											readOnly: false
										},
										restore: {},
										saveAsImage: {}
									}
								},
								grid: {
									left: '1%',
									right: '3%',
									top: '12%',
									bottom: '8%',
									height: '52%',	
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
									},
									{
										type: 'category',
										//										data: monthArray,
										boundaryGap: true,
										axisTick: {
											alignWithLabel: true,
											interval: 0
										},
										axisLabel: {
											interval: 0,
											rotate: 45
										}
									}
								],
								yAxis: [{
									type: 'value',
									scale: true,
									name: '结算金额',
									boundaryGap: true,
									axisTick: {
										alignWithLabel: true,
										interval: 0
									},
									axisLabel: {
										interval: 0,
										rotate: 45
									}
								}, {
									type: 'value',
									scale: true,
									name: '结算量'
								}],
								series: [{
										name: '结算金额',
										type: 'bar',
										xAxisIndex: 0,
										yAxisIndex: 0,
										barWidth: '68%',
										data: settlementMoneyArray
									},
									{
										name: '结算量',
										type: 'line',
										xAxisIndex: 0,
										yAxisIndex: 1,
										data: settlementWeightArray
									}
								]
							};
							currChart.setOption(option);
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
			/**
			 * 
			 * @param {Object} model 2-按客户
			 * @param {Object} callback
			 */
			ownerQuery: function(callback) {
				var self = this;
				if(window.plus) {
					awaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				self.totalNumForOwnerStr = '';
				self.totalWeightForOwnerStr = '';
				self.ownerDetailList = [];
				var apiUrl = app.api_url + '/api/settlement/proSettlementApi/settlementAnalysis?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						model: 2,
						warehouseId: self.filterConditions.warehouseId,
						beginDate: self.filterConditions.beginMonth,
						endDate: self.filterConditions.endMonth
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(awaiting) {
							awaiting.close();
						}
						//												alert(JSON.stringify(data));
						if(data) {
							self.totalNumForOwnerStr = data.totalSettlementMoney ? data.totalSettlementMoney + '元' : '0元';
							self.totalWeightForOwnerStr = data.totalSettlementWeight ? data.totalSettlementWeight + '吨' : '0吨';
							self.averageMoneyForOwner = data.averageSettlementMoney;
							self.averageWeightForOwner = data.averageSettlementWeight;
							self.ownerTrendList = data.trendList;
							self.ownerDetailList = data.detailList;
							if(self.ownerDetailList && self.ownerDetailList.length > 0) {
								m.each(self.ownerDetailList, function(index, item) {
									if(item) {
										var idx = index + 1;
										//										var spenderNameShow = item.spenderName ? (idx + '.' + item.spenderName) : '';
										var spenderNameShow = item.spenderName ? item.spenderName : '';
										item.spenderNameShow = spenderNameShow;
										item.spenderNameShowAbb = buildAbbreviation(spenderNameShow, 5, 3, 2);
									}
								});
							}

							var settlementWeightArray = []; //结算量
							var settlementMoneyArray = []; //结算金额
							var monthArray = [];
							if(self.ownerTrendList && self.ownerTrendList.length > 0) {
								m.each(self.ownerTrendList, function(index, item) {
									if(item) {
										settlementWeightArray.push(item.settlementWeight);
										settlementMoneyArray.push(item.settlementMoney);
										monthArray.push(item.month);
									}
								});
							}
							var currContainer = document.getElementById('div_owner_chart');
							currContainer.style.width = window.innerWidth + 'px';
							currContainer.style.height = (window.innerHeight / 1.8) + 'px';
							currContainer.style.top = '25px';
							currContainer.style.paddingBottom = '8px';
							var currChart = this.echarts.init(currContainer, 'light');
							option = {
								color: ['#3398DB'],
								title: {
									show: true,
									//									text: '费用结算',
									text: '',
									subtext: ''
								},
								tooltip: {
									trigger: 'axis',
									axisPointer: {
										type: 'cross',
										label: {
											backgroundColor: '#283b56'
										}
									}
								},
								legend: {
									data: ['结算量', '结算金额']
								},
								toolbox: {
									show: false,
									feature: {
										dataView: {
											readOnly: false
										},
										restore: {},
										saveAsImage: {}
									}
								},
								grid: {
									left: '1%',
									right: '3%',
									top: '12%',
									bottom: '8%',
									height: '52%',	
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
									},
									{
										type: 'category',
										//										data: monthArray,
										boundaryGap: true,
										axisTick: {
											alignWithLabel: true,
											interval: 0
										},
										axisLabel: {
											interval: 0,
											rotate: 45
										}
									}
								],
								yAxis: [{
									type: 'value',
									scale: true,
									name: '结算金额',
									boundaryGap: true,
									axisTick: {
										alignWithLabel: true,
										interval: 0
									},
									axisLabel: {
										interval: 0,
										rotate: 45
									}
								}, {
									type: 'value',
									scale: true,
									name: '结算量'
								}],
								series: [{
										name: '结算金额',
										type: 'bar',
										xAxisIndex: 0,
										yAxisIndex: 0,
										barWidth: '68%',
										data: settlementMoneyArray
									},
									{
										name: '结算量',
										type: 'line',
										xAxisIndex: 0,
										yAxisIndex: 1,
										data: settlementWeightArray
									}
								]
							};
							currChart.setOption(option);
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
			/**
			 * 
			 * @param {Object} model 3-按项目
			 * @param {Object} callback
			 */
			projectQuery: function(callback) {
				var self = this;
				if(window.plus) {
					awaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				self.totalNumForProjectStr = '';
				self.totalWeightForProjectStr = '';
				self.projectDetailList = [];
				var apiUrl = app.api_url + '/api/settlement/proSettlementApi/settlementAnalysis?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						model: 3,
						warehouseId: self.filterConditions.warehouseId,
						beginDate: self.filterConditions.beginMonth,
						endDate: self.filterConditions.endMonth
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(awaiting) {
							awaiting.close();
						}
						//												alert(JSON.stringify(data));
						if(data) {
							self.totalNumForProjectStr = data.totalSettlementMoney ? data.totalSettlementMoney + '元' : '0元';
							self.totalWeightForProjectStr = data.totalSettlementWeight ? data.totalSettlementWeight + '吨' : '0吨';
							self.averageMoneyForProject = data.averageSettlementMoney;
							self.averageWeightForProject = data.averageSettlementWeight;
							self.projectTrendList = data.trendList;
							self.projectDetailList = data.detailList;
							if(self.projectDetailList && self.projectDetailList.length > 0) {
								m.each(self.projectDetailList, function(index, item) {
									if(item) {
										var idx = index + 1;
										var projectName = item.spendItemName ? item.spendItemName : '';
										//										var projectNameShow = projectName ? (idx + '.' + projectName) : '';
										var projectNameShow = projectName ? projectName : '';
										item.projectNameShow = projectNameShow;
										item.projectNameShowAbb = buildAbbreviation(projectNameShow, 5, 3, 2);
									}
								});
							}

							var settlementWeightArray = []; //结算量
							var settlementMoneyArray = []; //结算金额
							var monthArray = [];
							if(self.projectTrendList && self.projectTrendList.length > 0) {
								m.each(self.projectTrendList, function(index, item) {
									if(item) {
										settlementWeightArray.push(item.settlementWeight);
										settlementMoneyArray.push(item.settlementMoney);
										monthArray.push(item.month);
									}
								});
							}
							var currContainer = document.getElementById('div_projcet_chart');
							currContainer.style.width = window.innerWidth + 'px';
							currContainer.style.height = (window.innerHeight / 1.8) + 'px';
							currContainer.style.top = '25px';
							currContainer.style.paddingBottom = '8px';
							var currChart = this.echarts.init(currContainer, 'light');
							option = {
								color: ['#3398DB'],
								title: {
									show: true,
									//									text: '费用结算',
									text: '',
									subtext: ''
								},
								tooltip: {
									trigger: 'axis',
									axisPointer: {
										type: 'cross',
										label: {
											backgroundColor: '#283b56'
										}
									}
								},
								legend: {
									data: ['结算量', '结算金额']
								},
								toolbox: {
									show: false,
									feature: {
										dataView: {
											readOnly: false
										},
										restore: {},
										saveAsImage: {}
									}
								},
								grid: {
									left: '1%',
									right: '3%',
									top: '12%',
									bottom: '8%',
									height: '52%',	
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
									},
									{
										type: 'category',
										//										data: monthArray,
										boundaryGap: true,
										axisTick: {
											alignWithLabel: true,
											interval: 0
										},
										axisLabel: {
											interval: 0,
											rotate: 45
										}
									}
								],
								yAxis: [{
									type: 'value',
									scale: true,
									name: '结算金额',
									boundaryGap: true,
									axisTick: {
										alignWithLabel: true,
										interval: 0
									},
									axisLabel: {
										interval: 0,
										rotate: 45
									}
								}, {
									type: 'value',
									scale: true,
									name: '结算量'
								}],
								series: [{
										name: '结算金额',
										type: 'bar',
										xAxisIndex: 0,
										yAxisIndex: 0,
										barWidth: '68%',
										data: settlementMoneyArray
									},
									{
										name: '结算量',
										type: 'line',
										xAxisIndex: 0,
										yAxisIndex: 1,
										data: settlementWeightArray
									}
								]
							};
							currChart.setOption(option);
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
			onItemSliderClick: function($event, index) {
				var self = this;
				if(event)
					event.stopPropagation();
				if(self.currTabIndex == index)
					return;
				slider.refresh();
				self.resetFilter();
				if(index == 0) {
					////按仓库
					self.warehouseQuery();
				} else if(index == 1) {
					////按客户
					self.ownerQuery();
				} else if(index == 2) {
					////按项目
					self.projectQuery();
				}
				self.currTabIndex = index;
				slider.gotoItem(index);
			},
			sortByWeightForWarehouse: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.warehouseDetailList == null || self.warehouseDetailList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.settlementWeight < y.settlementWeight) {
						return -1;
					} else if(x.settlementWeight > y.settlementWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.settlementWeight < y.settlementWeight) {
						return 1;
					} else if(x.settlementWeight > y.settlementWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.warehouseSortColumn = self.warehouseSortColumns[0];
				if(self.weightSortForWarehouse === 'desc') {
					self.weightSortForWarehouse = 'asc';
					self.warehouseDetailList = self.warehouseDetailList.sort(asc);
				} else {
					self.weightSortForWarehouse = 'desc';
					self.warehouseDetailList = self.warehouseDetailList.sort(desc);
				}
				swaiting.close();
			},
			sortByMoneyForWarehouse: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.warehouseDetailList == null || self.warehouseDetailList.length < 1) {
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
				self.warehouseSortColumn = self.warehouseSortColumns[1];
				if(self.moneySortForWarehouse === 'desc') {
					self.moneySortForWarehouse = 'asc';
					self.warehouseDetailList = self.warehouseDetailList.sort(asc);
				} else {
					self.moneySortForWarehouse = 'desc';
					self.warehouseDetailList = self.warehouseDetailList.sort(desc);
				}
				swaiting.close();
			},
			sortByWeightForOwner: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.ownerDetailList == null || self.ownerDetailList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.settlementWeight < y.settlementWeight) {
						return -1;
					} else if(x.settlementWeight > y.settlementWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.settlementWeight < y.settlementWeight) {
						return 1;
					} else if(x.settlementWeight > y.settlementWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.ownerSortColumn = self.ownerSortColumns[0];
				if(self.weightSortForOwner === 'desc') {
					self.weightSortForOwner = 'asc';
					self.ownerDetailList = self.ownerDetailList.sort(asc);
				} else {
					self.weightSortForOwner = 'desc';
					self.ownerDetailList = self.ownerDetailList.sort(desc);
				}
				swaiting.close();
			},
			sortByMoneyForOwner: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.ownerDetailList == null || self.ownerDetailList.length < 1) {
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
				self.ownerSortColumn = self.ownerSortColumns[1];
				if(self.moneySortForOwner === 'desc') {
					self.moneySortForOwner = 'asc';
					self.ownerDetailList = self.ownerDetailList.sort(asc);
				} else {
					self.moneySortForOwner = 'desc';
					self.ownerDetailList = self.ownerDetailList.sort(desc);
				}
				swaiting.close();
			},
			sortByWeightForProject: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.projectDetailList == null || self.projectDetailList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.settlementWeight < y.settlementWeight) {
						return -1;
					} else if(x.settlementWeight > y.settlementWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.settlementWeight < y.settlementWeight) {
						return 1;
					} else if(x.settlementWeight > y.settlementWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.projectSortColumn = self.projectSortColumns[0];
				if(self.weightSortForProject === 'desc') {
					self.weightSortForProject = 'asc';
					self.projectDetailList = self.projectDetailList.sort(asc);
				} else {
					self.weightSortForProject = 'desc';
					self.projectDetailList = self.projectDetailList.sort(desc);
				}
				swaiting.close();
			},
			sortByMoneyForProject: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.projectDetailList == null || self.projectDetailList.length < 1) {
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
				self.projectSortColumn = self.projectSortColumns[1];
				if(self.moneySortForProject === 'desc') {
					self.moneySortForProject = 'asc';
					self.projectDetailList = self.projectDetailList.sort(asc);
				} else {
					self.moneySortForProject = 'desc';
					self.projectDetailList = self.projectDetailList.sort(desc);
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