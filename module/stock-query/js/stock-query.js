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
	var fixTable = require("fixed-left-header-table");
	require("../../../js/common/common.js");

	var ws = null;
	var awaiting = null;
	var twaiting = null;

	//下拉刷新对象
	var pullRefresh = null;

	m.init();

	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.006, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	//	m('#div_item1').scroll({
	//		deceleration: 0.006, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	//		indicators: false
	//	});

	var screenHeight = getClientHeight();

	var slider = m("#slider").slider();
	slider.setStopped(true);

	fixTable.setTable1(0, "", false);
	fixTable.setTable1(0, "1", false);
	fixTable.setTable1(0, "2", false);

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.warehouseSortColumn = globalVue.warehouseSortColumns[0];
		globalVue.materielSortColumn = globalVue.materielSortColumns[0];
		globalVue.provinceSortColumn = globalVue.provinceSortColumns[0];
		globalVue.materielQuery();

		var backDefault = m.back;

		function detailBack() {
			if(awaiting) {
				awaiting.close();
			}
			if(twaiting) {
				twaiting.close();
			}
			backDefault();
		}
		m.back = detailBack;
	});

	var globalVue = new Vue({
		el: "#div_stock_query",
		data: {
			currTabIndex: 0,
			totalNumForWarehouseStr: '',
			totalWeightForWarehouseStr: '',
			totalNumForMaterielStr: '',
			totalWeightForMaterielStr: '',
			totalNumForProvinceStr: '',
			totalWeightForProvinceStr: '',
			numSortForWarehouse: 'desc',
			ratioSortForWarehouse: 'desc',
			numSortForMateriel: 'desc',
			ratioSortForMateriel: 'desc',
			numSortForProvince: 'desc',
			ratioSortForProvince: 'desc',
			warehouseSortColumn: '',
			warehouseSortColumns: ["库存量", "占比"],
			materielSortColumn: '',
			materielSortColumns: ["库存量", "占比"],
			provinceSortColumn: '',
			provinceSortColumns: ["库存量", "占比"],
			warehouseDataList: [],
			materielDataList: [],
			provinceDataList: []
		},
		methods: {
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
				self.warehouseDataList = [];
				//				if(app.debug) {
				//					console.log("beginTime:" + moment().format('YYYY-MM-DD HH:mm:ss'));
				//				}
				var apiUrl = app.api_url + '/api/proInventoryApi/inventoryQuery?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						model: 1
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
							self.totalNumForWarehouseStr = data.totalNum ? data.totalNum + '件' : '0件';
							self.totalWeightForWarehouseStr = data.totalWeight ? data.totalWeight + '吨' : '0吨';
							self.warehouseDataList = data.list;
							if(self.warehouseDataList && self.warehouseDataList.length > 0) {
								var warehouseWeightArray = [];
								var warehouseNameArray = [];
								m.each(self.warehouseDataList, function(index, item) {
									if(item) {
										var idx = index + 1;
										//										var warehouseNameShow = item.warehouseShortName ? (idx + '.' + item.warehouseShortName) : '';
										var warehouseNameShow = item.warehouseShortName ? item.warehouseShortName : '';
										item.warehouseNameShow = warehouseNameShow;
										item.warehouseNameShowAbb = buildAbbreviation(warehouseNameShow, 18, 8, 5);
										item.ratioShow = item.ratio ? item.ratio + '%' : '0%';
										if(index < 12) {
											warehouseNameArray.push(item.warehouseShortName ? item.warehouseShortName : '');
											warehouseWeightArray.push(item.weight);
										}
									}
								});

								var warehouseContainer = document.getElementById('div_warehouse_chart');
								warehouseContainer.style.width = window.innerWidth + 'px';
								warehouseContainer.style.height = (window.innerHeight / 1.2) + 'px';
								var warehouseChart = this.echarts.init(warehouseContainer, 'light');
								option = {
									title: {
										show: true,
										//										text: '吞吐量趋势'
										text: '',
										subtext: ''
									},
									tooltip: {
										trigger: 'axis',
										axisPointer: {
											type: 'shadow'
										}
									},
									grid: {
										left: '1%',
										right: '3%',
										top: '6%',
										bottom: '8%',
										height: '88%',
										containLabel: true
									},
									xAxis: {
										type: 'value',
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
									yAxis: {
										type: 'category',
										boundaryGap: true,
										triggerEvent: true,
										inverse: true,
										//										inverse: true,
										axisTick: {
											alignWithLabel: true,
											interval: 0
										},
										axisLabel: {
											clickable: true,
											interval: 0,
											rotate: 45,
											color: '#129BFF'
										},
										data: warehouseNameArray
									},
									series: [{
										name: '库存重量',
										type: 'bar',
										barWidth: '68%',
										//										label: {
										//											normal: {
										//												show: true,
										//												color: '#666',
										//												position: 'right'
										//											}
										//										},
										data: warehouseWeightArray
									}]
								};
								warehouseChart.setOption(option);
								warehouseChart.on('click', function(params) {
									if(params.componentType == "yAxis") {
										var warehouseId = '';
										m.each(self.warehouseDataList, function(index, item) {
											if(item) {
												if(item.warehouseShortName == params.value) {
													warehouseId = item.warehouseId;
												}
											}
										});
										self.openExponentPage(warehouseId, params.value);
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
			/**
			 * 
			 * @param {Object} model 2-按物料
			 * @param {Object} callback
			 */
			materielQuery: function(callback) {
				var self = this;
				if(window.plus) {
					awaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				self.totalNumForMaterielStr = '';
				self.totalWeightForMaterielStr = '';
				self.materielDataList = [];
				var apiUrl = app.api_url + '/api/proInventoryApi/inventoryQuery?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						model: 2
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
							self.totalNumForMaterielStr = data.totalNum ? data.totalNum + '件' : '0件';
							self.totalWeightForMaterielStr = data.totalWeight ? data.totalWeight + '吨' : '0吨';
							self.materielDataList = data.list;
							if(self.materielDataList && self.materielDataList.length > 0) {
								var ratioArray = [];
								var materielNameArray = [];
								m.each(self.materielDataList, function(index, item) {
									if(item) {
										var idx = index + 1;
										//										var materielNameShow = item.brandName ? (idx + '.' + item.brandName) : '';
										var materielNameShow = item.brandName ? item.brandName : '';
										item.materielNameShow = materielNameShow;
										item.materielNameShowAbb = buildAbbreviation(materielNameShow, 6, 3, 3);
										item.ratioShow = item.ratio ? item.ratio + '%' : '0%';
										if(index < 5) {
											materielNameArray.push(item.brandName ? item.brandName : '');
											var dataItem = {
												name: item.brandName,
												value: item.ratio
											};
											ratioArray.push(dataItem);
										}
									}
								});
								//								alert(JSON.stringify(materielNameArray));
								//								alert(JSON.stringify(ratioArray));
								var materielContainer = document.getElementById('div_materiel_chart');
								materielContainer.style.width = window.innerWidth + 'px';
								materielContainer.style.height = (window.innerHeight / 1.8) + 'px';
								var materielChart = this.echarts.init(materielContainer, 'light');
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
										formatter: "{b}: {c}%"
									},
									legend: {
										//									type: 'scroll',
										// orient: 'vertical',
										top: 'bottom',
										bottom: 10,
										left: 40,
										data: materielNameArray
									},
									grid: {
										left: '1%',
										right: '3%',
										top: '5%',
										bottom: '8%',
										height: '48%',
										containLabel: true
									},
									series: [{
										type: 'pie',
										radius: '60%',
										center: ['50%', '45%'],
										selectedMode: 'single',
										data: ratioArray,
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
								materielChart.setOption(option);
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
			/**
			 * 
			 * @param {Object} model 3-按省份
			 * @param {Object} callback
			 */
			provinceQuery: function(callback) {
				var self = this;
				if(window.plus) {
					awaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				self.totalNumForProvinceStr = '';
				self.totalWeightForProvinceStr = '';
				self.provinceDataList = [];
				var apiUrl = app.api_url + '/api/proInventoryApi/inventoryQuery?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						model: 3
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
							self.totalNumForProvinceStr = data.totalNum ? data.totalNum + '件' : '0件';
							self.totalWeightForProvinceStr = data.totalWeight ? data.totalWeight + '吨' : '0吨';
							self.provinceDataList = data.list;
							if(self.provinceDataList && self.provinceDataList.length > 0) {
								var provinceWeightArray = [];
								var provinceNameArray = [];
								m.each(self.provinceDataList, function(index, item) {
									if(item) {
										var idx = index + 1;
										var provinceName = item.province ? item.province.substring(0, 2) : '';
										//										var provinceNameShow = provinceName ? (idx + '.' + provinceName) : '';
										var provinceNameShow = provinceName ? provinceName : '';
										item.provinceNameShow = provinceNameShow;
										item.provinceNameShowAbb = buildAbbreviation(provinceNameShow, 18, 8, 5);
										item.ratioShow = item.ratio ? item.ratio + '%' : '0%';
										provinceNameArray.push(provinceName);
										provinceWeightArray.push(item.weight);
									}
								});

								var provinceContainer = document.getElementById('div_province_chart');
								provinceContainer.style.width = window.innerWidth + 'px';
								provinceContainer.style.height = (window.innerHeight / 1.3) + 'px';
								var provinceChart = this.echarts.init(provinceContainer, 'light');
								option = {
									title: {
										show: true,
										text: '',
										subtext: ''
									},
									tooltip: {
										trigger: 'axis',
										axisPointer: {
											type: 'shadow'
										}
									},
									grid: {
										left: '1%',
										right: '3%',
										top: '10%',
										bottom: '8%',
										height: '88%',
										containLabel: true
									},
									xAxis: {
										type: 'value',
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
									yAxis: {
										type: 'category',
										boundaryGap: true,
										inverse: true,
										axisTick: {
											alignWithLabel: true,
											interval: 0
										},
										axisLabel: {
											clickable: true,
											interval: 0,
											rotate: 45
										},
										data: provinceNameArray
									},
									series: [{
										name: '库存重量',
										type: 'bar',
										barWidth: '68%',
										//										label: {
										//											normal: {
										//												show: true,
										//												color: '#666',
										//												position: 'right'
										//											}
										//										},
										data: provinceWeightArray
									}]
								};
								provinceChart.setOption(option);
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
			onItemSliderClick: function($event, index) {
				var self = this;
				event.stopPropagation();
				if(self.currTabIndex == index)
					return;
				slider.refresh();
				if(index == 0) {
					////按仓库
					self.warehouseQuery();
				} else if(index == 1) {
					////按物料
					self.materielQuery();
				} else if(index == 2) {
					////按省份
					self.provinceQuery();
				}
				self.currTabIndex = index;
				slider.gotoItem(index);
			},
			sortByNumForWarehouse: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.warehouseDataList == null || self.warehouseDataList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.weight < y.weight) {
						return -1;
					} else if(x.weight > y.weight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.weight < y.weight) {
						return 1;
					} else if(x.weight > y.weight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.warehouseSortColumn = self.warehouseSortColumns[0];
				if(self.numSortForWarehouse === 'desc') {
					self.numSortForWarehouse = 'asc';
					self.warehouseDataList = self.warehouseDataList.sort(asc);
				} else {
					self.numSortForWarehouse = 'desc';
					self.warehouseDataList = self.warehouseDataList.sort(desc);
				}
				swaiting.close();
			},
			sortByRatioForWarehouse: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.warehouseDataList == null || self.warehouseDataList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.ratio < y.ratio) {
						return -1;
					} else if(x.ratio > y.ratio) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.ratio < y.ratio) {
						return 1;
					} else if(x.ratio > y.ratio) {
						return -1;
					} else {
						return 0;
					}
				}
				self.warehouseSortColumn = self.warehouseSortColumns[1];
				if(self.ratioSortForWarehouse === 'desc') {
					self.ratioSortForWarehouse = 'asc';
					self.warehouseDataList = self.warehouseDataList.sort(asc);
				} else {
					self.ratioSortForWarehouse = 'desc';
					self.warehouseDataList = self.warehouseDataList.sort(desc);
				}
				swaiting.close();
			},
			sortByNumForMateriel: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.materielDataList == null || self.materielDataList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.weight < y.weight) {
						return -1;
					} else if(x.weight > y.weight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.weight < y.weight) {
						return 1;
					} else if(x.weight > y.weight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.materielSortColumn = self.materielSortColumns[0];
				if(self.numSortForMateriel === 'desc') {
					self.numSortForMateriel = 'asc';
					self.materielDataList = self.materielDataList.sort(asc);
				} else {
					self.numSortForMateriel = 'desc';
					self.materielDataList = self.materielDataList.sort(desc);
				}
				swaiting.close();
			},
			sortByRatioForMateriel: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.materielDataList == null || self.materielDataList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.ratio < y.ratio) {
						return -1;
					} else if(x.ratio > y.ratio) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.ratio < y.ratio) {
						return 1;
					} else if(x.ratio > y.ratio) {
						return -1;
					} else {
						return 0;
					}
				}
				self.materielSortColumn = self.materielSortColumns[1];
				if(self.ratioSortForMateriel === 'desc') {
					self.ratioSortForMateriel = 'asc';
					self.materielDataList = self.materielDataList.sort(asc);
				} else {
					self.ratioSortForMateriel = 'desc';
					self.materielDataList = self.materielDataList.sort(desc);
				}
				swaiting.close();
			},
			sortByNumForProvince: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.provinceDataList == null || self.provinceDataList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.weight < y.weight) {
						return -1;
					} else if(x.weight > y.weight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.weight < y.weight) {
						return 1;
					} else if(x.weight > y.weight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.provinceSortColumn = self.provinceSortColumns[0];
				if(self.numSortForProvince === 'desc') {
					self.numSortForProvince = 'asc';
					self.provinceDataList = self.provinceDataList.sort(asc);
				} else {
					self.numSortForProvince = 'desc';
					self.provinceDataList = self.provinceDataList.sort(desc);
				}
				swaiting.close();
			},
			sortByRatioForProvince: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.provinceDataList == null || self.provinceDataList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.ratio < y.ratio) {
						return -1;
					} else if(x.ratio > y.ratio) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.ratio < y.ratio) {
						return 1;
					} else if(x.ratio > y.ratio) {
						return -1;
					} else {
						return 0;
					}
				}
				self.provinceSortColumn = self.provinceSortColumns[1];
				if(self.ratioSortForProvince === 'desc') {
					self.ratioSortForProvince = 'asc';
					self.provinceDataList = self.provinceDataList.sort(asc);
				} else {
					self.ratioSortForProvince = 'desc';
					self.provinceDataList = self.provinceDataList.sort(desc);
				}
				swaiting.close();
			},
			openExponentPage: function(warehouseId, warehouseName) {
				m.openWindow({
					id: 'exponent-report-new',
					"url": '../../exponent-report/html/exponent-report-new.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						//自定义扩展参数，可以用来处理页面间传值
						'indexStatParam': {
							'warehouseId': warehouseId,
							'warehouseShortName': warehouseName,
							'gotoIndex': 0,
							'methods': 'extrasOpenCustomerExponent'
						}
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