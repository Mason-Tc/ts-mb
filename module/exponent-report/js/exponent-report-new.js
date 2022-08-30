define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var echarts = require('echarts');
	var com = require("computer");
	require('jquery');
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require('./f2.js');
	require('./light.js');
	var fixTable = require("fixed-left-header-table");
	require("../../../js/common/Date.js");
	require("../../../js/common/common.js");

	m.plusReady(function() {
		
		m('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		var inventoryAuth = app.getUser().isPrivilege('exponent:report:inventory:api');
		var customerAuth = app.getUser().isPrivilege('exponent:report:customer:api');
		var ioAuth = app.getUser().isPrivilege('exponent:report:io:api');
		var cameraAuth = app.getUser().isPrivilege('camera:sysUserCamera:api:list');
		// 右侧查询框
		var offCanvasQuery = m("#off-canvas").offCanvas();
		
		var swaiting = null;
		
		fixTable.setTable(92, "");
		fixTable.setTable(132, "1");
		fixTable.setTable(132, "2");
		fixTable.setTable(132, "3");
		
		// var mask = m.createMask(function() {
		// 	if(offCanvasQuery.isShown("right")) {
		// 		//offCanvasQuery.refresh();
		// 		offCanvasQuery.close();
		// 		mask.close();
		
		// 	}
		// }, 'contentDiv');
		var screenHeight = getClientHeight();
		
		var slider = m("#slider").slider();
		var periodSlider = m("#periodSlider").slider();
		var dtPicker1 = new mui.DtPicker({
			"type": "date",
			"value": getCurrentMonthFirst().formatDate('yyyy-MM-dd')
		});
		var dtPicker2 = new mui.DtPicker({
			"type": "date",
			"value": getCurrentMonthLast().formatDate('yyyy-MM-dd')
		});
		
		var globalVue = new Vue({
			el: "#off-canvas",
			data: {
				exponentType: 0,
				warehouseName: '', // 已选仓库名称
				warehouseList: [], // 可选仓库列表
				warehouseID: '', // 已选仓库ID
				ownerName: '', // 客户名称
				periodType: 0, // 出入库指数日期类型，1：今日；2：本月；3：本年
				inventoryAuth: inventoryAuth,
				customerAuth: customerAuth,
				ioAuth: ioAuth,
				cameraAuth:cameraAuth,
				localinWarehoueID: '',
				inventoryWeight: 0,
				structurelist: [],
				localWarehouseID: '',
				localOwnerName: '',
				inventorySort: 'desc',
				ratioSort: 'desc',
				cstmrSortColumn: '',
				cstmrSortColumns: ["库存量（吨）", "占比"],
				cstmrListDivStyle: 'height: ' + (screenHeight - 170) + 'px;',
				ioListDivStyle: 'height: ' + (screenHeight - 160) + 'px;',
				// 客户指数数据
				customerExpPage: {
					totalPage: 1,
					pageSize: 9999,
					pageNo: 1,
					list: [],
					totalInventoryWeight: 0
				},
				// 出入库指数数据
				ioExpDayPage: {
					totalPage: 1,
					pageSize: 9999,
					pageNo: 1,
					list: [],
					totalEnterWeight: 0,
					totalOutputWeight: 0,
					totalThroughputWeight: 0
				},
				// 出入库指数数据
				ioExpMonPage: {
					totalPage: 1,
					pageSize: 9999,
					pageNo: 1,
					list: [],
					totalEnterWeight: 0,
					totalOutputWeight: 0,
					totalThroughputWeight: 0
				},
				ioExpYearPage: {
					totalPage: 1,
					pageSize: 9999,
					pageNo: 1,
					list: [],
					totalEnterWeight: 0,
					totalOutputWeight: 0,
					totalThroughputWeight: 0
				},
				ioExpPage: {
					totalPage: 1,
					pageSize: 9999,
					pageNo: 1,
					beginDate: '',
					endDate: '',
					list: [],
					totalEnterWeight: 0,
					totalOutputWeight: 0,
					totalThroughputWeight: 0
				}
			},
			methods: {
				/**
				 * 打开查询框
				 */
				showOffExponentQuery: function() {
					offCanvasQuery.show();
					// mask.show();
				},
		
				/**
				 * 隐藏查询框
				 */
				hideOffCanvaQuery: function() {
					if(offCanvasQuery.isShown("right")) {
						//offCanvasQuery.refresh();
						offCanvasQuery.close();
						// mask.close();
					}
				},
				searchDoQuery: function(event) {
					if(event.keyCode == 13) {
						this.globalDoQuery(this.warehouseID, this.warehouseName);
						return false;
					}
				},
				/*
				 * 查询指数分析报表
				 */
				globalDoQuery: function(warehouseID, warehouseName) {
					$("#ownerName").blur();
					this.warehouseID = warehouseID;
					this.warehouseName = warehouseName;
					//				alert(this.warehouseID + "|" + this.warehouseName + "|" + this.exponentType)
					if(this.exponentType === 0 && inventoryAuth) {
						// 库存指数
		
						//					this.initReport(warehouseID);
						this.ivtReport(warehouseID);
					} else if(this.exponentType === 1 && customerAuth) {
		
						// 客户指数
						this.customerExpQuery(this.warehouseID, this.ownerName);
					} else if(this.exponentType === 2 && ioAuth) {
						// 出入库指数
						//					if(this.periodType === 0) {
						//						this.dayInoutputExpQuery(this.warehouseID);
						//					} else if(this.periodType === 1) {
						//						this.monthInoutputExpQuery(this.warehouseID);
						//					} else if(this.periodType === 2) {
						//						this.yearInoutputExpQuery(this.warehouseID);
						//					}
						this.ioExpDoQuery(this.warehouseID);
					}
					this.hideOffCanvaQuery();
				},
				ivtReport: function(warehouseID) {
					if(warehouseID === this.localinWarehoueID) {
						return;
					} else {
						var self = this;
						m.ajax(app.api_url + '/api/exponentReportApi/inventoryExponent', {
							data: {
								'warehouseID': warehouseID
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 10000, //超时时间设置为10秒；
							success: function(jsonData) {
								if(jsonData.inventoryWeight == null) {
									self.inventoryWeight = '0吨';
									jsonData.list = []
								} else {
									self.inventoryWeight = jsonData.inventoryWeight + '吨';
								}
								var container = document.getElementById('pieChart');
								container.style.width = window.innerWidth + 'px';
								container.style.height = (window.innerHeight / 1.7) + 'px';
								var myChart = this.echarts.init(container, 'light');
								var handleData = [];
								var handleName = [];
								var otherData = {
									name: "其他"
								}
								var otherWeight = Number(jsonData.inventoryWeight);
								$.each(jsonData.list, function(i, obj) {
									otherWeight = accSub(otherWeight, obj.ratio);
									var item = {
										name: obj.materialName,
										value: obj.ratio
									};
		
									handleData.push(item);
									handleName.push(obj.materialName);
								});
								if(otherWeight > 0) {
									handleName.push(otherData.name);
									otherData.value = otherWeight;
									handleData.push(otherData);
								}
		
								option = {
									title: {
										text: '',
										subtext: '',
										left: 'right'
									},
									tooltip: {
										trigger: 'item',
										formatter: "{b} : {c}吨 ({d}%)"
									},
									legend: {
										// orient: 'vertical',
										top: 'bottom',
										bottom: 10,
										left: 'center',
										data: handleName //['西凉', '益州','兖州','荆州','幽州']
									},
									series: [{
										type: 'pie',
										radius: '65%',
										center: ['50%', '45%'],
										selectedMode: 'single',
										data: handleData,
										itemStyle: {
											emphasis: {
												shadowBlur: 10,
												shadowOffsetX: 0,
												shadowColor: 'rgba(0, 0, 0, 0.5)'
											}
										}
									}]
								};
								myChart.setOption(option);
							}
						})
					}
				},
				toCstmrIvntDetail: function(customerId, warehouseId) {
					var self = this;
					var cstmrList = [];
					for(var i = 0; i < self.customerExpPage.list.length; i++) {
		
						if(self.customerExpPage.list[i].id == customerId) {
							cstmrList.unshift(self.customerExpPage.list[i]);
						} else {
							cstmrList.push(self.customerExpPage.list[i]);
						}
					}
					//				console.log(JSON.stringify(cstmrList))
					m.openWindow({
						id: 'warehouse-online',
						"url": 'cstmrIvntDetail.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
							'cstmrId': customerId,
							'warehouseId': warehouseId,
							'cstmrList': cstmrList,
						}
					});
				},
				initReport: function(warehouseID) {
					if(warehouseID === this.localinWarehoueID) {
						return;
					} else {
						var self = this;
						m.ajax(app.api_url + '/api/exponentReportApi/inventoryExponent', {
							data: {
								'warehouseID': warehouseID
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 10000, //超时时间设置为10秒；
							success: function(jsonData) {
								if(jsonData.inventoryWeight == null) {
									self.inventoryWeight = 0;
									jsonData.list = []
								} else {
									self.inventoryWeight = jsonData.inventoryWeight;
								}
								self.structurelist = jsonData.list;
								var handleData = [];
								$.each(jsonData.list, function(i, obj) {
									var item = {
										name: obj.materialName + ' ' + obj.ratio.toFixed(2) + '%',
										percent: obj.ratio
									};
									handleData.push(item);
								});
								var chart = new F2.Chart({
									id: 'mountNode',
									width: window.innerWidth,
									height: window.innerWidth > window.innerHeight ? window.innerHeight - 54 : window.innerWidth * 0.707,
									pixelRatio: window.devicePixelRatio
								});
								chart.coord('polar', {
									transposed: true,
									/* endAngle: 2 * Math.PI,
									startAngle: Math.PI / 2, */
									endAngle: 3 * Math.PI,
									startAngle: 3 * Math.PI / 2,
									innerRadius: 0.3
								});
		
								chart.source(handleData.reverse(), {
									percent: {
										max: 100
									}
								});
								chart.axis('name', {
									grid: {
										lineDash: null,
										type: 'arc'
									},
									line: null,
									label: {
										fontSize: 10,
										fontWeight: 'bold'
									}
								});
								chart.axis('percent', false);
								chart.tooltip(true);
								chart.tooltip({
									offsetX: 100, // x 方向的偏移
									offsetY: 16, // y 方向的偏移
									triggerOn: 'touchstart', // tooltip 出现的触发行为，可自定义，用法同 legend 的 triggerOn
									showTitle: true, // 是否展示标题，默认不展示
									background: {
										radius: 2,
										padding: [6, 10]
									} // tooltip 内容框的背景样式
								});
								chart.interval().position('name*percent').color('percent', '#BAE7FF-#1890FF-#0050B3');
		
								chart.render();
		
							},
							error: function(xhr, type, errorThrown) {
								m.toast("网络异常，请重新试试");
							}
						});
					}
				},
				/*
				 * 格式化占比
				 */
				format: function(ratio) {
					return ratio.toFixed(2) + "%";
				},
				/**
				 * 根据查询参数查询
				 * @param {Object} params 查询参数
				 * @param {Function} callback
				 */
				cstmrQuery: function(params, callback) {
					var self = this;
					m.ajax(app.api_url + '/api/exponentReportApi/customerExponents', {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						success: function(data) {
							//如果查询第一页，就将所有数据清空
							if(self.customerExpPage.pageNo === 1) {
								self.customerExpPage.totalPage = data.totalPage;
								self.customerExpPage.list = data.list;
							} else {
								self.customerExpPage.totalPage = data.totalPage;
								self.customerExpPage.list = self.customerExpPage.list.concat(data.list);
							}
							//计算总计值
							self.customerExpPage.totalInventoryWeight = 0;
							if(self.customerExpPage.list != null && self.customerExpPage.list.length > 0) {
								for(var i = 0; i < self.customerExpPage.list.length; i++) {
									if(self.customerExpPage.list[i].ownerName){
										self.customerExpPage.list[i].ownerNameAbb = buildAbbreviation(self.customerExpPage.list[i].ownerName,10,6,3);
									}
									if(self.customerExpPage.list[i].inventoryWeight) {
										self.customerExpPage.totalInventoryWeight = com.accAdd(self.customerExpPage.totalInventoryWeight, self.customerExpPage.list[i].inventoryWeight);
									}
								}
							} else {
								self.customerExpPage.totalInventoryWeight = 0;
							}
		
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if(typeof callback === "function") {
								callback();
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
		
				doQuery: function(warehouseID, ownerName, callback) {
					this.cstmrQuery({
						'pageNo': this.customerExpPage.pageNo,
						'pageSize': this.customerExpPage.pageSize,
						'warehouseID': warehouseID,
						'ownerName': ownerName
					}, callback);
				},
				/*
				 * 查询客户指数
				 */
				customerExpQuery: function(warehouseID, ownerName) {
					if(this.localWarehouseID === warehouseID && this.localOwnerName === ownerName) {
						return;
					} else {
						this.localWarehouseID = warehouseID;
						this.localOwnerName = ownerName;
						this.customerExpPage.pageNo = 1;
						var self = this;
						this.doQuery(warehouseID, ownerName, function() {
		
						});
					}
				},
				/**
				 * 
				 * @param {Object} params
				 * @param {Object} callback
				 */
				dayQuery: function(params, callback) {
					var self = this;
					m.ajax(app.api_url + '/api/exponentReportApi/ioExponents', {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						success: function(data) {
							//如果查询第一页，就将所有数据清空
							if(self.ioExpDayPage.pageNo === 1) {
								self.ioExpDayPage.totalPage = data.totalPage;
								self.ioExpDayPage.list = data.list;
							} else {
								self.ioExpDayPage.totalPage = data.totalPage;
								self.ioExpDayPage.list = self.ioExpDayPage.list.concat(data.list);
							}
		
							//计算总计值
							console.log(JSON.stringify(self.ioExpDayPage.list));
							self.ioExpDayPage.totalEnterWeight = 0;
							self.ioExpDayPage.totalOutputWeight = 0;
							self.ioExpDayPage.totalThroughputWeight = 0;
							if(self.ioExpDayPage.list != null && self.ioExpDayPage.list.length > 0) {
								for(var i = 0; i < self.ioExpDayPage.list.length; i++) {
									if(self.ioExpDayPage.list[i].enterWeight) {
										self.ioExpDayPage.totalEnterWeight = com.accAdd(self.ioExpDayPage.totalEnterWeight, self.ioExpDayPage.list[i].enterWeight);
									}
									if(self.ioExpDayPage.list[i].outputWeight) {
										self.ioExpDayPage.totalOutputWeight = com.accAdd(self.ioExpDayPage.totalOutputWeight, self.ioExpDayPage.list[i].outputWeight);
									}
									if(self.ioExpDayPage.list[i].throughputWeight) {
										self.ioExpDayPage.totalThroughputWeight = com.accAdd(self.ioExpDayPage.totalThroughputWeight, self.ioExpDayPage.list[i].throughputWeight);
									}
								}
							} else {
								self.ioExpDayPage.totalEnterWeight = 0;
								self.ioExpDayPage.totalOutputWeight = 0;
								self.ioExpDayPage.totalThroughputWeight = 0;
							}
		
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if(typeof callback === "function") {
								callback();
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
		
				/**
				 * 
				 * @param {Object} warehouseID
				 * @param {Object} callback
				 */
				dayDoQuery: function(warehouseID, callback) {
					this.dayQuery({
						'pageNo': this.ioExpDayPage.pageNo,
						'pageSize': this.ioExpDayPage.pageSize,
						'warehouseID': warehouseID,
						'periodType': '0'
					}, callback);
				},
				/*
				 *  查询出入库指数
				 */
				dayInoutputExpQuery: function(warehouseID) {
					this.localioWarehouseID = warehouseID;
					this.ioExpDayPage.pageNo = 1;
					var self = this;
					this.dayDoQuery(warehouseID, function() {
		
					});
				},
				/**
				 * 
				 * @param {Object} params
				 * @param {Object} callback
				 */
				monthQuery: function(params, callback) {
					var self = this;
					m.ajax(app.api_url + '/api/exponentReportApi/ioExponents', {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						success: function(data) {
							//如果查询第一页，就将所有数据清空
							if(self.ioExpMonPage.pageNo === 1) {
								self.ioExpMonPage.totalPage = data.totalPage;
								self.ioExpMonPage.list = data.list;
							} else {
								self.ioExpMonPage.totalPage = data.totalPage;
								self.ioExpMonPage.list = self.ioExpMonPage.list.concat(data.list);
							}
		
							//计算总计值
							/*console.log(JSON.stringify(self.ioExpMonPage.list));*/
							self.ioExpMonPage.totalEnterWeight = 0;
							self.ioExpMonPage.totalOutputWeight = 0;
							self.ioExpMonPage.totalThroughputWeight = 0;
							if(self.ioExpMonPage.list.length) {
								for(var i = 0; i < self.ioExpMonPage.list.length; i++) {
									if(self.ioExpMonPage.list[i].enterWeight) {
										self.ioExpMonPage.totalEnterWeight = com.accAdd(self.ioExpMonPage.totalEnterWeight, self.ioExpMonPage.list[i].enterWeight);
									}
									if(self.ioExpMonPage.list[i].outputWeight) {
										self.ioExpMonPage.totalOutputWeight = com.accAdd(self.ioExpMonPage.totalOutputWeight, self.ioExpMonPage.list[i].outputWeight);
									}
									if(self.ioExpMonPage.list[i].throughputWeight) {
										self.ioExpMonPage.totalThroughputWeight = com.accAdd(self.ioExpMonPage.totalThroughputWeight, self.ioExpMonPage.list[i].throughputWeight);
									}
								}
							} else {
								self.ioExpMonPage.totalEnterWeight = 0;
								self.ioExpMonPage.totalOutputWeight = 0;
								self.ioExpMonPage.totalThroughputWeight = 0;
							}
		
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if(typeof callback === "function") {
								callback();
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
		
				/**
				 * 
				 * @param {Object} warehouseID
				 * @param {Object} callback
				 */
				monthDoQuery: function(warehouseID, callback) {
					this.monthQuery({
						'pageNo': this.ioExpMonPage.pageNo,
						'pageSize': this.ioExpMonPage.pageSize,
						'warehouseID': warehouseID,
						'periodType': '1'
					}, callback);
				},
				/*
				 *  查询出入库指数
				 */
				monthInoutputExpQuery: function(warehouseID) {
					this.localioWarehouseID = warehouseID;
					this.ioExpMonPage.pageNo = 1;
					var self = this;
					this.monthDoQuery(warehouseID, function() {
		
					});
				},
				/**
				 * 
				 * @param {Object} params
				 * @param {Object} callback
				 */
				yearQuery: function(params, callback) {
					var self = this;
					m.ajax(app.api_url + '/api/exponentReportApi/ioExponents', {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						success: function(data) {
							//如果查询第一页，就将所有数据清空
							if(self.ioExpYearPage.pageNo === 1) {
								self.ioExpYearPage.totalPage = data.totalPage;
								self.ioExpYearPage.list = data.list;
							} else {
								self.ioExpYearPage.totalPage = data.totalPage;
								self.ioExpYearPage.list = self.ioExpYearPage.list.concat(data.list);
							}
		
							//计算总计值
							/*console.log(JSON.stringify(self.ioExpYearPage.list));*/
							self.ioExpYearPage.totalEnterWeight = 0;
							self.ioExpYearPage.totalOutputWeight = 0;
							self.ioExpYearPage.totalThroughputWeight = 0;
							if(self.ioExpYearPage.list.length) {
								for(var i = 0; i < self.ioExpYearPage.list.length; i++) {
									if(self.ioExpYearPage.list[i].enterWeight) {
										self.ioExpYearPage.totalEnterWeight = com.accAdd(self.ioExpYearPage.totalEnterWeight, self.ioExpYearPage.list[i].enterWeight);
									}
									if(self.ioExpYearPage.list[i].outputWeight) {
										self.ioExpYearPage.totalOutputWeight = com.accAdd(self.ioExpYearPage.totalOutputWeight, self.ioExpYearPage.list[i].outputWeight);
									}
									if(self.ioExpYearPage.list[i].throughputWeight) {
										self.ioExpYearPage.totalThroughputWeight = com.accAdd(self.ioExpYearPage.totalThroughputWeight, self.ioExpYearPage.list[i].throughputWeight);
									}
								}
							} else {
								self.ioExpYearPage.totalEnterWeight = 0;
								self.ioExpYearPage.totalOutputWeight = 0;
								self.ioExpYearPage.totalThroughputWeight = 0;
							}
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if(typeof callback === "function") {
								callback();
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
		
				/**
				 * 
				 * @param {Object} warehouseID
				 * @param {Object} callback
				 */
				doYearQuery: function(warehouseID, callback) {
					this.yearQuery({
						'pageNo': this.ioExpYearPage.pageNo,
						'pageSize': this.ioExpYearPage.pageSize,
						'warehouseID': warehouseID,
						'periodType': '2'
					}, callback);
				},
				/*
				 *  查询出入库指数
				 */
				yearInoutputExpQuery: function(warehouseID) {
					this.localioWarehouseID = warehouseID;
					this.ioExpYearPage.pageNo = 1;
					var self = this;
					this.doYearQuery(warehouseID, function() {
		
					});
				},
				ioExpQuery: function(params, callback) {
					var self = this;
					m.ajax(app.api_url + '/api/exponentReportApi/ioExponents', {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						success: function(data) {
							//如果查询第一页，就将所有数据清空
							if(self.ioExpPage.pageNo === 1) {
								self.ioExpPage.totalPage = data.totalPage;
								self.ioExpPage.list = data.list;
							} else {
								self.ioExpPage.totalPage = data.totalPage;
								self.ioExpPage.list = self.ioExpPage.list.concat(data.list);
							}
		
							//计算总计值
							console.log(JSON.stringify(self.ioExpPage.list));
							self.ioExpPage.totalEnterWeight = 0;
							self.ioExpPage.totalOutputWeight = 0;
							self.ioExpPage.totalThroughputWeight = 0;
							if(self.ioExpPage.list != null && self.ioExpPage.list.length > 0) {
								for(var i = 0; i < self.ioExpPage.list.length; i++) {
									if(self.ioExpPage.list[i].ownerName){
										self.ioExpPage.list[i].ownerNameAbb = buildAbbreviation(self.ioExpPage.list[i].ownerName,10,6,3);
									}
									if(self.ioExpPage.list[i].enterWeight) {
										self.ioExpPage.totalEnterWeight = com.accAdd(self.ioExpPage.totalEnterWeight, self.ioExpPage.list[i].enterWeight);
									}
									if(self.ioExpPage.list[i].outputWeight) {
										self.ioExpPage.totalOutputWeight = com.accAdd(self.ioExpPage.totalOutputWeight, self.ioExpPage.list[i].outputWeight);
									}
									if(self.ioExpPage.list[i].throughputWeight) {
										self.ioExpPage.totalThroughputWeight = com.accAdd(self.ioExpPage.totalThroughputWeight, self.ioExpPage.list[i].throughputWeight);
									}
								}
							} else {
								self.ioExpPage.totalEnterWeight = 0;
								self.ioExpPage.totalOutputWeight = 0;
								self.ioExpPage.totalThroughputWeight = 0;
							}
		
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if(typeof callback === "function") {
								callback();
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
		
				/**
				 * 
				 * @param {Object} warehouseID
				 * @param {Object} callback
				 */
				ioExpDoQuery: function(warehouseID, callback) {
					this.ioExpQuery({
						'pageNo': this.ioExpPage.pageNo,
						'pageSize': this.ioExpPage.pageSize,
						'warehouseID': warehouseID,
						'beginDate': this.ioExpPage.beginDate,
						'endDate': this.ioExpPage.endDate
					}, callback);
				},
				seachIoExp: function(warehouseID, callback) {
					this.ioExpDoQuery(this.warehouseID);
				},
				pickBeginDate: function() {
					var self = this;
					dtPicker1.show(function(selectItems) {
						self.ioExpPage.beginDate = selectItems.value;
						self.currentSelectedBtnIndex = null;
					})
				},
				pickEndDate: function() {
					var self = this;
					dtPicker2.show(function(selectItems) {
						self.ioExpPage.endDate = selectItems.value;
						self.currentSelectedBtnIndex = null;
					})
				},
				onItemSliderClick: function($event, index) {
					var self = this;
					event.stopPropagation();
					self.exponentType = index;
					self.globalDoQuery(self.warehouseID, self.warehouseName);
					slider.gotoItem(index);
				},
				toCamera: function($event) {
					var self = this;
					event.stopPropagation();
					if(!cameraAuth){
						alert("您没有视频监控相关权限，如有需求请联系管理员。");
						return;
					}
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					var apiUrl = app.api_url + '/api/camera/warehousePartition/list?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							if(swaiting) {
								swaiting.close();
							}
							if(data && data.length > 0) {
								var matchingItem = null;
								m.each(data, function(index, item) {
									if(item) {
										if(self.warehouseID == item.id) {
											matchingItem = item;
										}
									}
								});
								if(matchingItem && matchingItem.cameraCnt != 0) {
									m.openWindow({
										id: 'cameraList',
										url: '../../camera/html/cameraList_back.html',
										show: {
											aniShow: 'pop-in'
										},
										waiting: {
											autoShow: true
										},
										extras: {
											'isShow': true,
											'backIconShow': true,
											'warehouseId': self.warehouseID
										}
									});
								} else {
									m.toast("该仓库无视频观看，请先接入视频信号！");
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
				onItemPeriodSliderClick: function($event, index) {
					var self = this;
					event.stopPropagation();
					self.periodType = index;
					self.globalDoQuery(self.warehouseID, self.warehouseName);
					periodSlider.gotoItem(index);
				},
				cstmrInventorySort: function($event) {
					var self = this;
					event.stopPropagation();
					if(self.customerExpPage.list == null || self.customerExpPage.list.length < 1) {
						return;
					}
					var swaiting = plus.nativeUI.showWaiting("");
					//升序
					var asc = function(x, y) {
						//按客户数
						if(x.inventoryWeight < y.inventoryWeight) {
							return -1;
						} else if(x.inventoryWeight > y.inventoryWeight) {
							return 1;
						} else {
							return 0;
						}
					}
					//降序
					var desc = function(x, y) {
						//按客户数
						if(x.inventoryWeight < y.inventoryWeight) {
							return 1;
						} else if(x.inventoryWeight > y.inventoryWeight) {
							return -1;
						} else {
							return 0;
						}
					}
					self.cstmrSortColumn = self.cstmrSortColumns[0];
					if(self.inventorySort === 'desc') {
						self.inventorySort = 'asc';
						self.customerExpPage.list = self.customerExpPage.list.sort(asc);
					} else {
						self.inventorySort = 'desc';
						self.customerExpPage.list = self.customerExpPage.list.sort(desc);
					}
					swaiting.close();
				},
				cstmrRatioSort: function($event) {
					var self = this;
					event.stopPropagation();
					if(self.customerExpPage.list == null || self.customerExpPage.list.length < 1) {
						return;
					}
					var swaiting = plus.nativeUI.showWaiting("");
					//升序
					var asc = function(x, y) {
						//按客户数
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
						//按客户数
						if(x.ratio < y.ratio) {
							return 1;
						} else if(x.ratio > y.ratio) {
							return -1;
						} else {
							return 0;
						}
					}
					self.cstmrSortColumn = self.cstmrSortColumns[1];
					if(self.ratioSort === 'desc') {
						self.ratioSort = 'asc';
						self.customerExpPage.list = self.customerExpPage.list.sort(asc);
					} else {
						self.ratioSort = 'desc';
						self.customerExpPage.list = self.customerExpPage.list.sort(desc);
					}
					swaiting.close();
				}
			}
		});
		
		function accSub(arg1, arg2) {
			var r1, r2, m, n;
			try {
				r1 = arg1.toString().split(".")[1].length;
			} catch(e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split(".")[1].length;
			} catch(e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
			n = (r1 >= r2) ? r1 : r2;
			return((arg1 * m - arg2 * m) / m).toFixed(n);
		}
		
		function getClientHeight() {
			var clientHeight = 0;
			if(document.body.clientHeight && document.documentElement.clientHeight) {
				var clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
			} else {
				var clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
			}
			return clientHeight;
		}
		
		
		globalVue.ioExpPage.beginDate = getCurrentMonthFirst().formatDate('yyyy-MM-dd');
		globalVue.ioExpPage.endDate = getCurrentMonthLast().formatDate('yyyy-MM-dd');
		var indexStat = {}; //存放从Index-stat页面传来的参数
		indexStat.warehouseId = plus.webview.currentWebview().indexStatParam.warehouseId;
		if(plus.webview.currentWebview().indexStatParam.methods == 'extrasOpenCustomerExponent') {
			indexStat.warehouseShortName = plus.webview.currentWebview().indexStatParam.warehouseShortName;
			indexStat.gotoIndex = plus.webview.currentWebview().indexStatParam.gotoIndex;
		}
		console.log(indexStat.warehouseId + "|" + plus.webview.currentWebview().indexStatParam.warehouseShortName);
		/*console.log(JSON.stringify(indexStat));*/

		/*onItemSliderClick: function($event, index) {
				var self = this;
				event.stopPropagation();
				self.exponentType = index;
				self.globalDoQuery(self.warehouseID, self.warehouseName);
				slider.gotoItem(index);
			}*/
		/*app.getUser().warehouse.id = indexStat.id;
		app.getUser().warehouse.warehouseName = indexStat.warehouseShortName;*/
		slider.setStopped(true); //禁止滑动
		periodSlider.setStopped(true); //禁止滑动

		document.getElementsByClassName('mui-inner-wrap')[0].addEventListener('drag', function(event) {　　
			event.stopPropagation();
		});

		document.getElementById('munuScrollDiv').addEventListener('hidden', function(event) {
			// mask.close();
		});
		m.ajax(app.api_url + '/api/exponentReportApi/findWarehouse', {
			dataType: 'json', //服务器返回json格式数据
			type: 'GET', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			async: false,
			success: function(data) {
				globalVue.warehouseList = data;
				for(var i = 0; i < data.length; i++) {
					if(data[i].id === globalVue.warehouseID) {
						globalVue.warehouseName = data[i].warehouseShortName;
					}
				}
			},
			error: function(xhr, type, errorThrown) {
				m.toast("网络异常，请重新试试");
			}
		});
		if(!indexStat.warehouseId) {
			if(globalVue.warehouseList.length > 0) {
				globalVue.warehouseID = globalVue.warehouseList[0].id;
				globalVue.warehouseName = globalVue.warehouseList[0].warehouseShortName;
				globalVue.globalDoQuery(globalVue.warehouseID, globalVue.warehouseName);
			}
		} else {
			globalVue.warehouseID = indexStat.warehouseId;
			globalVue.warehouseName = indexStat.warehouseShortName;
			globalVue.globalDoQuery(globalVue.warehouseID, globalVue.warehouseName);
			globalVue.exponentType = indexStat.gotoIndex;
			slider.gotoItem(indexStat.gotoIndex);
			if(indexStat.gotoIndex == 1) {
				globalVue.customerExpQuery(globalVue.warehouseID, globalVue.ownerName);
			}
			/*else if(indexStat.gotoIndex == 2) {
				globalVue.yearInoutputExpQuery(globalVue.warehouseID);
			}*/

		}
	});


});