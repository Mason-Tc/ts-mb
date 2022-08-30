define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var echarts = require('echarts');
	require('jquery');
	require('./f2.js');
	require('./light.js');
	
	m.plusReady(function() {
		//	var customerExpVue = require("./customer-exponent.js");
		//	var ioExponentDayVue = require('./io-exponent-day.js');
		//	var ioExponentMonVue = require('./io-exponent-month.js');
		//	var ioExponetYearVue = require('./io-exponent-year.js');
		//	var inventoryExpVue = require('./inventory-exponent.js');
		//	m.init({ swipeBack: false });
			m('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			});
			console.log('先初始化')
			var inventoryAuth=app.getUser().isPrivilege('exponent:report:inventory:api');
			var customerAuth=app.getUser().isPrivilege('exponent:report:customer:api');
			var ioAuth=app.getUser().isPrivilege('exponent:report:io:api');
			// 右侧查询框
			var offCanvasQuery = m("#off-canvas").offCanvas();
			//下拉刷新对象
			var customerpullRefresh = null;
			//下拉刷新对象
			var itemfortodaypullRefresh = null;
			//下拉刷新对象
			var itemformonthpullRefresh = null;
			//下拉刷新对象
			var itemforyearpullRefresh = null;
			var mask = m.createMask(function(){
				if(offCanvasQuery.isShown("right")) {
					//offCanvasQuery.refresh();
					offCanvasQuery.close();
					mask.close();
					
				}
			},'contentDiv');
			var screenHeight = getClientHeight();
			
			var globalVue = new Vue({
				el: "#off-canvas",
				data: {
					exponentType: 0,
					warehouseName: '', // 已选仓库名称
					warehouseList: [], // 可选仓库列表
					warehouseID: '', // 已选仓库ID
					ownerName: '', // 客户名称
					periodType: 0, // 出入库指数日期类型，1：今日；2：本月；3：本年
					inventoryAuth:inventoryAuth,
					customerAuth:customerAuth,
					ioAuth:ioAuth,
					localinWarehoueID: '',
					inventoryWeight: 0,
					structurelist: [],
					localWarehouseID: '',
					localOwnerName: '',
					cstmrListDivStyle:'height: '+(screenHeight-170)+'px;',
					ioListDivStyle:'height: '+(screenHeight-160)+'px;',
					// 客户指数数据
					customerExpPage: {
						totalPage: 1,
						pageSize: 20,
						pageNo: 1,
						list: []
					},
					// 出入库指数数据
					ioExpDayPage: {
						totalPage: 1,
						pageSize: 20,
						pageNo: 1,
						list: []
					},
					// 出入库指数数据
					ioExpMonPage: {
						totalPage: 1,
						pageSize: 20,
						pageNo: 1,
						list: []
					},
					ioExpYearPage: {
						totalPage: 1,
						pageSize: 20,
						pageNo: 1,
						list: []
					}
					
				},
				methods: {
					/**
					 * 打开查询框
					 */
					showOffExponentQuery: function() {
						offCanvasQuery.show();
						mask.show();
					},
		
					/**
					 * 隐藏查询框
					 */
					hideOffCanvaQuery: function() {
						if(offCanvasQuery.isShown("right")) {
							//offCanvasQuery.refresh();
							offCanvasQuery.close();
							mask.close();
						}
					},
					searchDoQuery:function(event){
						if(event.keyCode==13){
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
						if(this.exponentType === 0 &&inventoryAuth) {
							// 库存指数
							
		//					this.initReport(warehouseID);
							this.ivtReport(warehouseID);
						} else if(this.exponentType === 1 &&customerAuth) {
							
							// 客户指数
							this.customerExpQuery(this.warehouseID, this.ownerName);
						} else if(this.exponentType === 2 &&ioAuth) {
							// 出入库指数
							if(this.periodType === 0) {
								this.dayInoutputExpQuery(this.warehouseID);
							} else if(this.periodType === 1) {
								this.monthInoutputExpQuery(this.warehouseID);
							} else if(this.periodType === 2) {
								this.yearInoutputExpQuery(this.warehouseID);
							}
						}
						this.hideOffCanvaQuery();
					},
					ivtReport:function(warehouseID){
						if(warehouseID === this.localinWarehoueID) {
							return;
						} else {
							var self = this;
							m.ajax(app.api_url + '/api/exponentReportApi/inventoryExponent', {
							data: {'warehouseID': warehouseID},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 10000, //超时时间设置为10秒；
							success: function(jsonData) {
								if(jsonData.inventoryWeight ==null){
									self.inventoryWeight = '0吨';
									jsonData.list=[]
								}else{
									self.inventoryWeight = jsonData.inventoryWeight+'吨';
								}
								var container= document.getElementById('pieChart');
								container.style.width = window.innerWidth+'px';
		    					container.style.height =( window.innerHeight/1.7)+'px';
								var myChart = this.echarts.init(container,'light');
								
								/*var weatherIcons = {
								    'Sunny': './data/asset/img/weather/sunny_128.png',
								    'Cloudy': './data/asset/img/weather/cloudy_128.png',
								    'Showers': './data/asset/img/weather/showers_128.png'
								};*/
								var handleData = [];
								var handleName=[];
								var otherData={name:"其他"}
								var otherWeight=Number(jsonData.inventoryWeight);
						        $.each(jsonData.list, function(i, obj) {
						        	otherWeight= accSub(otherWeight,obj.ratio);
						            var item = { name: obj.materialName ,value:obj.ratio  };
						            
						            handleData.push(item);
						            handleName.push(obj.materialName);
						        });
						        if(otherWeight>0){
						        	handleName.push(otherData.name);
						        	 otherData.value=otherWeight;
						        	 handleData.push(otherData);
						        }
						        
								option = {
								    title: {
								        text: '物料分布',
								        subtext: '',
								        left: 'right'
								    },
								    tooltip : {
								        trigger: 'item',
								        formatter: "{b} : {c}吨 ({d}%)"
								    },
								    legend: {
								        // orient: 'vertical',
								         top: 'bottom',
								        bottom: 10,
								        left: 'center',
								        data: handleName//['西凉', '益州','兖州','荆州','幽州']
								    },
								    series : 
								    [
								        {
								            type: 'pie',
								            radius : '65%',
								            center: ['50%', '45%'],
								            selectedMode: 'single',
								            data:handleData
		//						            [
		//						                {
		//						                    value:1548,
		//						                    name: '幽州',
		//						                    label: {
		//						                        normal: {
		//						                            formatter: [
		//						                                '{title|{b}}{abg|}',
		//						                                '  {weatherHead|天气}{valueHead|天数}{rateHead|占比}',
		//						                                '{hr|}',
		//						                                '  {Sunny|}{value|202}{rate|55.3%}',
		//						                                '  {Cloudy|}{value|142}{rate|38.9%}',
		//						                                '  {Showers|}{value|21}{rate|5.8%}'
		//						                            ].join('\n'),
		//						                            backgroundColor: '#eee',
		//						                            borderColor: '#777',
		//						                            borderWidth: 1,
		//						                            borderRadius: 4,
		//						                            rich: {
		//						                                title: {
		//						                                    color: '#eee',
		//						                                    align: 'center'
		//						                                },
		//						                                abg: {
		//						                                    backgroundColor: '#333',
		//						                                    width: '100%',
		//						                                    align: 'right',
		//						                                    height: 25,
		//						                                    borderRadius: [4, 4, 0, 0]
		//						                                },
		//						                                Sunny: {
		//						                                    height: 30,
		//						                                    align: 'left',
		//						                                    backgroundColor: {
		//						                                        image: weatherIcons.Sunny
		//						                                    }
		//						                                },
		//						                                Cloudy: {
		//						                                    height: 30,
		//						                                    align: 'left',
		//						                                    backgroundColor: {
		//						                                        image: weatherIcons.Cloudy
		//						                                    }
		//						                                },
		//						                                Showers: {
		//						                                    height: 30,
		//						                                    align: 'left',
		//						                                    backgroundColor: {
		//						                                        image: weatherIcons.Showers
		//						                                    }
		//						                                },
		//						                                weatherHead: {
		//						                                    color: '#333',
		//						                                    height: 24,
		//						                                    align: 'left'
		//						                                },
		//						                                hr: {
		//						                                    borderColor: '#777',
		//						                                    width: '100%',
		//						                                    borderWidth: 0.5,
		//						                                    height: 0
		//						                                },
		//						                                value: {
		//						                                    width: 20,
		//						                                    padding: [0, 20, 0, 30],
		//						                                    align: 'left'
		//						                                },
		//						                                valueHead: {
		//						                                    color: '#333',
		//						                                    width: 20,
		//						                                    padding: [0, 20, 0, 30],
		//						                                    align: 'center'
		//						                                },
		//						                                rate: {
		//						                                    width: 40,
		//						                                    align: 'right',
		//						                                    padding: [0, 10, 0, 0]
		//						                                },
		//						                                rateHead: {
		//						                                    color: '#333',
		//						                                    width: 40,
		//						                                    align: 'center',
		//						                                    padding: [0, 10, 0, 0]
		//						                                }
		//						                            }
		//						                        }
		//						                    }
		//						                },
		//						                {value:535, name: '荆州'},
		//						                {value:510, name: '兖州'},
		//						                {value:634, name: '益州'},
		//						                {value:735, name: '西凉'}
		//						            ]
		,
								            itemStyle: {
								                emphasis: {
								                    shadowBlur: 10,
								                    shadowOffsetX: 0,
								                    shadowColor: 'rgba(0, 0, 0, 0.5)'
								                }
								            }
								        }
								    ]
								};
								
								
								
								
								
								
								myChart.setOption(option);
								}
							})
						}
					},
					initReport:function(warehouseID){
						if(warehouseID === this.localinWarehoueID) {
							return;
						} else {
							var self = this;
							m.ajax(app.api_url + '/api/exponentReportApi/inventoryExponent', {
							data: {'warehouseID': warehouseID},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 10000, //超时时间设置为10秒；
							success: function(jsonData) {
								if(jsonData.inventoryWeight ==null){
									self.inventoryWeight = 0;
									jsonData.list=[]
								}else{
									self.inventoryWeight = jsonData.inventoryWeight;
								}
								self.structurelist = jsonData.list;
						        var handleData = [];
						        $.each(jsonData.list, function(i, obj) {
						            var item = { name: obj.materialName + ' ' + obj.ratio.toFixed(2) + '%', percent: obj.ratio };
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
						            startAngle: 3*Math.PI / 2,
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
						                padding: [ 6, 10 ]
						            } // tooltip 内容框的背景样式
						        });
						        // chart.guide().html({
						        //     position: ['螺纹钢', 68],
						        //     // html: '<div style="background: #50577D;font-size: 10px;color: #fff">68%</div>',
						        //     html: '<div style="background: #fff;font-size: 10px;color: #808080">68%</div>',
						        //     alignX: 'center',
						        //     alignY: 'bottom',
						        //     /* offsetY: 0,
						        //     offsetX: 18 */
						        //     offsetY: 6,
						        //     offsetX: -18
						        // });
						        // chart.guide().html({
						        //     position: ['线材', 12],
						        //     // html: '<div style="background: #50577D;font-size: 10px;color: #fff">12%</div>',
						        //     html: '<div style="background: #fff;font-size: 10px;color: #808080">12%</div>',
						        //     alignX: 'center',
						        //     alignY: 'bottom',
						        //     offsetY: 20,
						        //     offsetX: 14
						        // });
						
						        chart.interval().position('name*percent').color('percent', '#BAE7FF-#1890FF-#0050B3');
						
						        chart.render();
												
												
												
												
												
						},error: function(xhr, type, errorThrown) {
							m.toast("网络异常，请重新试试");
							}
						});
						}
					} ,
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
					下拉查询， 即第一页查询 
					*/
					pullDownQuery: function() {
						this.customerExpPage.pageNo = 1;
						var self = this;
						this.doQuery(this.localWarehouseID, this.localOwnerName, function() {
							customerpullRefresh.endPulldownToRefresh();
		//					customerpullRefresh.scrollTo(0, 0, 100);
							//if return totalPage greet zero enablePullupToRefresh
							if(self.customerExpPage.totalPage > 1) {
								customerpullRefresh.refresh(true);
							}
						});
					},
		
					/**
					 * 上拉查询，即第一页查询
					 */
					pullUpQuery: function() {
						if(this.customerExpPage.pageNo < this.customerExpPage.totalPage) {
							this.customerExpPage.pageNo++;
							this.doQuery(this.localWarehouseID, this.localOwnerName, function() {
								customerpullRefresh.endPullupToRefresh();
							});
						} else {
							customerpullRefresh.endPullupToRefresh(true);
		//					window.setTimeout(function() {
		//						customerpullRefresh.disablePullupToRefresh();
		//					}, 2000);
						}
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
								//if return totalPage greet zero enablePullupToRefresh
								if(self.customerExpPage.totalPage > 1) {
									customerpullRefresh.refresh(true);
								}
							});
						}
					},
					/**
					 * 
					 * @param {Object} params
					 * @param {Object} callback
					 */
					dayQuery: function(params, callback){
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
					下拉查询， 即第一页查询 
					*/
					dayPullDownQuery: function() {
						if(this.localioWarehouseID === ''){
							return;
						}
						this.ioExpDayPage.pageNo = 1;
						var self = this;
						this.dayDoQuery(this.localioWarehouseID, function() {
							itemfortodaypullRefresh.endPulldownToRefresh();
							itemfortodaypullRefresh.scrollTo(0, 0, 100);
							//if return totalPage greet zero enablePullupToRefresh
							if(self.ioExpDayPage.totalPage > 1) {
								itemfortodaypullRefresh.refresh(true);
							}
						});
					},
		
					/**
					 * 上拉查询，即第一页查询
					 */
					dayPullUpQuery: function() {
						if(this.localioWarehouseID === ''){
							itemfortodaypullRefresh.endPullupToRefresh();
							itemfortodaypullRefresh.disablePullupToRefresh();
							return;
						}
						if(this.ioExpDayPage.pageNo < this.ioExpDayPage.totalPage) {
							this.ioExpDayPage.pageNo++;
							this.dayDoQuery(this.localioWarehouseID, function() {
								itemfortodaypullRefresh.endPullupToRefresh();
							});
						} else {
							itemfortodaypullRefresh.endPullupToRefresh(true);
		//					window.setTimeout(function() {
		//						itemfortodaypullRefresh.disablePullupToRefresh();
		//					}, 2000);
						}
					},
		
					/*
					 *  查询出入库指数
					 */
					dayInoutputExpQuery: function(warehouseID) {
						this.localioWarehouseID = warehouseID;
							this.ioExpDayPage.pageNo = 1;
							var self = this;
							this.dayDoQuery(warehouseID, function(){
								itemfortodaypullRefresh.endPulldownToRefresh();
								//itemfortodaypullRefresh.scrollTo(0, 0, 100);
								//if return totalPage greet zero enablePullupToRefresh
								if(self.ioExpDayPage.totalPage > 1) {
									itemfortodaypullRefresh.refresh(true);
								}
							});
					},
					/**
					 * 
					 * @param {Object} params
					 * @param {Object} callback
					 */
					monthQuery: function(params, callback){
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
					下拉查询， 即第一页查询 
					*/
					monthPullDownQuery: function() {
						if(this.localioWarehouseID === ''){
							return;
						}
						this.ioExpMonPage.pageNo = 1;
						var self = this;
						this.monthDoQuery(this.localioWarehouseID, function() {
							itemformonthpullRefresh.endPulldownToRefresh();
							itemformonthpullRefresh.scrollTo(0, 0, 100);
							//if return totalPage greet zero enablePullupToRefresh
							if(self.ioExpMonPage.totalPage > 1) {
								itemformonthpullRefresh.refresh(true);
							}
						});
					},
		
					/**
					 * 上拉查询，即第一页查询
					 */
					monthPullUpQuery: function() {
						if(this.localioWarehouseID === ''){
							itemformonthpullRefresh.endPullupToRefresh();
							itemformonthpullRefresh.disablePullupToRefresh();
							return;
						}
						if(this.ioExpMonPage.pageNo < this.ioExpMonPage.totalPage) {
							this.ioExpMonPage.pageNo++;
							this.monthDoQuery(this.localioWarehouseID, function() {
								itemformonthpullRefresh.endPullupToRefresh();
							});
						} else {
							itemformonthpullRefresh.endPullupToRefresh(true);
		//					window.setTimeout(function() {
		//						itemformonthpullRefresh.disablePullupToRefresh();
		//					}, 2000);
						}
					},
		
					/*
					 *  查询出入库指数
					 */
					monthInoutputExpQuery: function(warehouseID) {
							this.localioWarehouseID = warehouseID;
							this.ioExpMonPage.pageNo = 1;
							var self = this;
							this.monthDoQuery(warehouseID, function(){
								itemformonthpullRefresh.endPulldownToRefresh();
								//if return totalPage greet zero enablePullupToRefresh
								if(self.ioExpMonPage.totalPage > 1) {
									itemformonthpullRefresh.refresh(true);
								}
							});
					},
					/**
					 * 
					 * @param {Object} params
					 * @param {Object} callback
					 */
					yearQuery: function(params, callback){
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
					下拉查询， 即第一页查询 
					*/
					yearPullDownQuery: function() {
						if(this.localioWarehouseID === ''){
							return;
						}
						this.ioExpYearPage.pageNo = 1;
						var self = this;
						this.doYearQuery(this.localioWarehouseID, function() {
							itemforyearpullRefresh.endPulldownToRefresh();
							itemforyearpullRefresh.scrollTo(0, 0, 100);
							//if return totalPage greet zero enablePullupToRefresh
							if(self.ioExpYearPage.totalPage > 1) {
								itemforyearpullRefresh.refresh(true);
							}
						});
					},
		
					/**
					 * 上拉查询，即第一页查询
					 */
					yearPullUpQuery: function() {
						if(this.localioWarehouseID === ''){
							itemforyearpullRefresh.endPullupToRefresh();
							itemforyearpullRefresh.disablePullupToRefresh();
							return;
						}
						if(this.ioExpYearPage.pageNo < this.ioExpYearPage.totalPage) {
							this.ioExpYearPage.pageNo++;
							this.doYearQuery(this.localioWarehouseID, function() {
								itemforyearpullRefresh.endPullupToRefresh();
							});
						} else {
							itemforyearpullRefresh.endPullupToRefresh(true);
		//					window.setTimeout(function() {
		//						itemforyearpullRefresh.disablePullupToRefresh();
		//					}, 2000);
						}
					},
		
					/*
					 *  查询出入库指数
					 */
					yearInoutputExpQuery: function(warehouseID) {
							this.localioWarehouseID = warehouseID;
							this.ioExpYearPage.pageNo = 1;
							var self = this;
							this.doYearQuery(warehouseID, function(){
								itemforyearpullRefresh.endPulldownToRefresh();
								//if return totalPage greet zero enablePullupToRefresh
								if(self.ioExpYearPage.totalPage > 1) {
									itemforyearpullRefresh.refresh(true);
								}
							});
					},
				}
			});
			
		//下拉刷新对象
		customerpullRefresh = m('#customerpullRefresh').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.pullDownQuery();
				}
			},
			up: {
				contentrefresh: '正在加载...',
				callback: function() {
					globalVue.pullUpQuery();
				}
			}
		});
		itemfortodaypullRefresh = m('#itemfortodaypullRefresh').pullRefresh({
			down: {
				auto: true,
				contentdown : "下拉可以刷新",//可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.dayPullDownQuery();
				}
			},
			up: {
				contentrefresh: '正在加载...',
				contentnomore : '没有更多数据了',//可选，请求完毕若没有更多数据时显示的提醒内容；
				callback: function() {
					globalVue.dayPullUpQuery();
				}
			}
		});
		itemformonthpullRefresh = m('#itemformonthpullRefresh').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.monthPullDownQuery();
				}
			},
			up: {
				contentrefresh: '正在加载...',
				callback: function() {
					globalVue.monthPullUpQuery();
				}
			}
		});
		itemforyearpullRefresh = m('#itemforyearpullRefresh').pullRefresh({
			down: {
				auto: true,
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.yearPullDownQuery();
				}
			},
			up: {
				contentrefresh: '正在加载...',
				callback: function() {
					globalVue.yearPullUpQuery();
				}
			}
		});
		/*
		 * 切换功能页签事件
		 */
		document.querySelector('#slider').addEventListener('slide', function(event) {
			if(event.detail){
			globalVue.exponentType = event.detail.slideNumber;
			globalVue.globalDoQuery(globalVue.warehouseID, globalVue.warehouseName);
			}
		});
		/*
		 * 切换出入库指数日期类型
		 */
		document.querySelector('#periodSlider').addEventListener('slide', function(event) {
			if(event.detail){
			globalVue.periodType = event.detail.slideNumber;
			globalVue.globalDoQuery(globalVue.warehouseID, globalVue.warehouseName);
			}
		});
		function accSub(arg1, arg2) {
		    var r1, r2, m, n;
		    try {
		        r1 = arg1.toString().split(".")[1].length;
		    }
		    catch (e) {
		        r1 = 0;
		    }
		    try {
		        r2 = arg2.toString().split(".")[1].length;
		    }
		    catch (e) {
		        r2 = 0;
		    }
		    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
		    n = (r1 >= r2) ? r1 : r2;
		    return ((arg1 * m - arg2 * m) / m).toFixed(n);
		}
		function getClientHeight()
		{
		  var clientHeight=0;
		  if(document.body.clientHeight&&document.documentElement.clientHeight)
		  {
		  var clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
		  }
		  else
		  {
		  var clientHeight = (document.body.clientHeight>document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
		  }
		  return clientHeight;
		}
		
		
		document.getElementsByClassName('mui-inner-wrap')[0].addEventListener('drag', function(event) {
		　　event.stopPropagation();
		});
		/*document.getElementById('off-canvas').addEventListener('shown',function (event) {
	    	mask.close();
		});
		document.getElementsByClassName('mui-off-canvas-right')[0].addEventListener('drag', function(event) {
		　　event.stopPropagation();
		});
		document.getElementsByClassName('mui-off-canvas-right')[0].addEventListener('drag', function(event) {
			if(offCanvasWrapper.offCanvas().isShown()){
				mask.close();
			}
		　　
		});*/
		document.getElementById('munuScrollDiv').addEventListener('hidden',function (event) {
			mask.close();
		});
		/* 滚动条加relative定位后滚动失效
		 var deceleration = mui.os.ios?0.003:0.0009;
		$('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: true, //是否显示滚动条
			deceleration:deceleration
		});*/
		m.ajax(app.api_url + '/api/exponentReportApi/findWarehouse', {
			dataType: 'json', //服务器返回json格式数据
			type: 'GET', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			async:false,
			success: function(data) {
				globalVue.warehouseList = data;
				for(var i = 0; i < data.length; i++) {
					if(data[i].id === globalVue.warehouseID) {
						globalVue.warehouseName = data[i].warehouseName;
					}
				}
			},
			error: function(xhr, type, errorThrown) {
				m.toast("网络异常，请重新试试");
			}
		});
		if(app.getUser().warehouse.id == null) {
			if(globalVue.warehouseList.length>0){
				globalVue.warehouseID=globalVue.warehouseList[0].id;
				globalVue.warehouseName=globalVue.warehouseList[0].warehouseName;
				globalVue.globalDoQuery(globalVue.warehouseID, globalVue.warehouseName);
			}
		} else {
			globalVue.warehouseID = app.getUser().warehouse.id;
			globalVue.warehouseName = app.getUser().warehouse.warehouseName;
			globalVue.globalDoQuery(globalVue.warehouseID, globalVue.warehouseName);
		}
	});


});