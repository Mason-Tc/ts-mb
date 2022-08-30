define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var echarts = require("echarts");
	var com = require("computer");
	require("jquery");
	require("f2");
	require("light");
	require("moment");
	require("../../../js/common/common.js");

	var ws = null;
	var awaiting = null;

	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	var screenHeight = getClientHeight();

	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
//		alert(ws.warehouseId + "|" + ws.ownerId + "|" +ws.ownerName);
		globalVue.warehouseId = ws.warehouseId;
		globalVue.ownerId = ws.ownerId;
		globalVue.ownerName = ws.ownerName;
		globalVue.title = ws.ownerName ? ("库存详情 (" + ws.ownerName + ")") : "库存详情";
		globalVue.summaryQuery();

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
		el: "#div_main_container",
		data: {
			title: '',
			warehouseId: '',
			ownerId: '',
			ownerName: '',
			realNumTotalForSummaryStr: '0件', //客户库存数
			realWeightTotalForSummaryStr: '0吨', //客户库存量
			summaryList: []
		},
		methods: {
			/**
			 * 根据查询参数查询
			 * @param {Function} callback
			 */
			summaryQuery: function(callback) {
				var self = this;
				if(window.plus) {
					awaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				var apiUrl = app.api_url + '/api/CustomerAnalyzeApi/detail?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						warehouseId: self.warehouseId,
						ownerId: self.ownerId,
						ownerName: self.ownerName
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(awaiting) {
							awaiting.close();
						}
						self.summaryList = data;
//						alert(JSON.stringify(self.summaryList));
						//计算总计值
						var realNumTotalSum = 0;
						var realWeightTotalSum = 0;
						var warehouseNameArray = [];
						var dataArray = [];
						if(self.summaryList != null && self.summaryList.length > 0) {
							m.each(self.summaryList, function(index, item) {
								if(item) {
									warehouseNameArray.push(item.warehouseShortName);
									var dataItem = {
										name: item.warehouseShortName,
										value: item.inventoryWeightSum,
										text: item.inventoryWeightSum + '吨'
									};
									dataArray.push(dataItem);
									var inventoryWeightSum = item.inventoryWeightSum ? item.inventoryWeightSum : 0;
									var inventoryNumSum = item.inventoryNumSum ? item.inventoryNumSum : 0;
									realNumTotalSum = com.accAdd(realNumTotalSum, inventoryNumSum);
									realWeightTotalSum = com.accAdd(realWeightTotalSum, inventoryWeightSum);
								}
							});
						}
						self.realNumTotalForSummaryStr = realNumTotalSum + '件';
						self.realWeightTotalForSummaryStr = realWeightTotalSum + '吨';
						
						var wsContainer = document.getElementById('div_inventory_chart');
								wsContainer.style.width = window.innerWidth + 'px';
								wsContainer.style.height = (window.innerHeight / 2) + 'px';
								var wsChart = this.echarts.init(wsContainer, 'light');
								option = {
									title: {
										show: true,
										text: '',
										subtext: ''
									},
									tooltip: {
										trigger: 'item',
										formatter: "{b}: {c} ({d}%)"
									},
									legend: {
										//									type: 'scroll',
										orient: 'vertical',
//										top: 'bottom',
//										bottom: 10,
//										left: 40,
										x: 'right',
										data: warehouseNameArray
									},
									series: [{
										type: 'pie',
										radius: '60%',
										center: ['40%', '55%'],
										selectedMode: 'single',
										data: dataArray,
										label: {
											position: 'outside'
										},
										labelLine: {
											//										length: 6,
											length2: 6
										},
										itemStyle: {
											emphasis: {
												shadowBlur: 10,
												shadowOffsetX: 0,
												shadowColor: 'rgba(0, 0, 0, 0.5)'
											}
										}
									}]
								};
								wsChart.setOption(option);
						
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