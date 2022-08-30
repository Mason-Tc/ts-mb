define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var echarts = require("echarts");
	var com = require("computer");
	require("jquery");
	require("moment");
	var fixTable = require("fixed-left-header-table");
	require("../../../js/common/common.js");

	var ws = null;
	var awaiting = null;

	m.init();

	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.006, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	var screenHeight = getClientHeight();

	fixTable.setTable1(0, "", false);

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.model = ws.model;
		globalVue.warehouseId = ws.warehouseId;
		globalVue.spenderId = ws.spenderId;
		globalVue.spendItemName = ws.spendItemName;
		globalVue.topText = ws.topText;
		globalVue.beginDate = ws.beginDate;
		globalVue.endDate = ws.endDate;
		globalVue.dataQuery();

		var backDefault = m.back;

		function detailBack() {
			if(awaiting) {
				awaiting.close();
			}
			backDefault();
		}
		m.back = detailBack;
	});

	var globalVue = new Vue({
		el: "#off-canvas",
		data: {
			model: 0,
			warehouseId: '',
			spenderId: '',
			spendItemName: '',
			beginDate: '',
			endDate: '',
			topText: '',
			sortColumns: ["结算量", "结算金额"],
			trendList: []
		},
		methods: {
			/**
			 * 
			 * @param {Object} model 1-按仓库 2-按客户 3-按项目
			 * @param {Object} callback
			 */
			dataQuery: function(callback) {
				var self = this;
				if(window.plus) {
					awaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				self.trendList = [];
				var params = {};
				if(self.model == 1) {
					params = {
						model: self.model,
						warehouseId: self.warehouseId,
						beginDate: self.beginDate,
						endDate: self.endDate
					};
				} else if(self.model == 2) {
					params = {
						model: self.model,
						warehouseId: self.warehouseId,
						spenderId: self.spenderId,
						beginDate: self.beginDate,
						endDate: self.endDate
					};
				} else if(self.model == 3) {
					params = {
						model: self.model,
						warehouseId: self.warehouseId,
						spendItemName: self.spendItemName,
						beginDate: self.beginDate,
						endDate: self.endDate
					};
				}
				var apiUrl = app.api_url + '/api/settlement/proSettlementApi/trendAnalysis?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(awaiting) {
							awaiting.close();
						}
						//												alert(JSON.stringify(data));
						if(data) {
							self.trendList = data.trendList;

							var settlementWeightArray = []; //结算量
							var settlementMoneyArray = []; //结算金额
							var monthArray = [];
							if(self.trendList && self.trendList.length > 0) {
								m.each(self.trendList, function(index, item) {
									if(item) {
										var idx = index + 1;
										var monthShow = item.month ? item.month : '';
										item.monthShow = monthShow;
										item.monthShowAbb = buildAbbreviation(monthShow, 18, 8, 5);
										settlementWeightArray.push(item.settlementWeight);
										settlementMoneyArray.push(item.settlementMoney);
										monthArray.push(item.month);
									}
								});
								var desc = function(x, y) {
									if(x.month < y.month) {
										return 1;
									} else if(x.month > y.month) {
										return -1;
									} else {
										return 0;
									}
								}
								self.trendList = self.trendList.sort(desc);
							}
							var currContainer = document.getElementById('div_canvas_chart');
							currContainer.style.width = window.innerWidth + 'px';
							currContainer.style.height = (window.innerHeight / 1.8) + 'px';
							currContainer.style.top = '3px';
							//							currContainer.style.paddingBottom = '5px';
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
									height: '220',	
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