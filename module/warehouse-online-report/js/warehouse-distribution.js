define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require('jquery');
	require('echarts');
	var eMap = require('./map.js')
	//下拉刷新对象
	/*var distributionPullRefresh = null;*/

	var distributionVue = new Vue({
		el: '#warehouseDistribution',
		data: {
			inventoryWeight: 0,
			// 出入库指数数据
			distributionPage: {
				totalPage: 1,
				pageSize: 20,
				pageNo: 1,
				distributionList: []
			}
		},
		methods: {
			/**
			 * 
			 * @param {Object} params
			 * @param {Object} callback
			 */
			query: function(params, callback) {
				var self = this;
				m.ajax(app.api_url + '/api/warehouseOnline/inventoryWeight', {
					dataType: 'json',
					type: 'post',
					timeout: 10000, //超时时间设置为10秒；W
					success: function(data) {
						self.inventoryWeight = data;
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
				
				m.ajax(app.api_url + '/api/warehouseOnline/inventoryExponent', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；W
					success: function(data) {
						//如果查询第一页，就将所有数据清空
						if(self.distributionPage.pageNo === 1) {
							self.distributionPage.totalPage = data.totalPage;
							self.distributionPage.distributionList = data.list;
						} else {
							self.distributionPage.totalPage = data.totalPage;
							self.distributionPage.distributionList = self.distributionPage.distributionList.concat(data.list);
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
			doQuery: function(callback) {
				this.query({
					'pageNo': this.distributionPage.pageNo,
					'pageSize': this.distributionPage.pageSize
				}, callback);
			},

			/*
			下拉查询， 即第一页查询 
			*/
			/*pullDownQuery: function() {
				this.distributionPage.pageNo = 1;
				var self = this;
				this.doQuery(function() {
					distributionPullRefresh.endPulldownToRefresh();
					distributionPullRefresh.scrollTo(0, 0, 100);
					//if return totalPage greet zero enablePullupToRefresh
					if(self.distributionPage.totalPage > 1) {
						distributionPullRefresh.refresh(true);
					}
				});
			},*/

			/**
			 * 上拉查询，即第一页查询
			 */
			/*pullUpQuery: function() {
				if(this.distributionPage.pageNo < this.distributionPage.totalPage) {
					this.distributionPage.pageNo++;
					this.doQuery(function() {
						distributionPullRefresh.endPullupToRefresh();
					});
				} else {
					distributionPullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						distributionPullRefresh.disablePullupToRefresh();
					}, 2000);
				}
			},*/

			/*
			 *  查询出入库指数
			 */
			/*distributionQuery: function() {
				this.distributionPage.pageNo = 1;
				var self = this;
				this.doQuery(function() {
					distributionPullRefresh.endPulldownToRefresh();
					distributionPullRefresh.scrollTo(0, 0, 100);
					//if return totalPage greet zero enablePullupToRefresh
					if(self.distributionPage.totalPage > 1) {
						distributionPullRefresh.refresh(true);
					}
				});
			},*/
			
			initMap:function initMap(){
				m.ajax(app.api_url + '/api/warehouseOnline/warehouseDistribution', {
					dataType: 'json',
					type: 'post',
					timeout: 10000, //超时时间设置为10秒；W
					success: function(jsonData) {
						eMap();
						var myChart = echarts.init(document.getElementById('mapDiv'));
				        var handleData = [];//处理ajax拿到的模拟值
				        var inventoryWeight = [];//存放所有仓库的重量
				        $.each(jsonData.warehouseList, function(i, obj) {
				            var item = [{ city:'杭州',name: '杭州', coord: [119.5313, 29.8773] }, { name:obj.warehouseName,city: obj.addressCity, value: obj.inventoryWeight, coord: [obj.longitude,obj.latitude] }]
				            handleData.push(item);
				            inventoryWeight.push(obj.inventoryWeight);
				        });
				        var symbolSizeArr = [14,16,18,20,22];//点的大小
				        var maxInventoryWeight =  Math.max.apply(Math, inventoryWeight);
				        var minInventoryWeight = Math.min.apply(Math, inventoryWeight);
				        var balance=maxInventoryWeight-minInventoryWeight
				        
				        
				        var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';
				
				        var convertData = function (data) {
				            var res = [];
				            for (var i = 0; i < data.length; i++) {
				                var dataItem = data[i];
				                res.push({
				                    fromName: dataItem[0].name,
				                    toName: dataItem[1].city,
				                    coords: [dataItem[0].coord, dataItem[1].coord]
				                });
				            }
				            return res;
				        };
				
				        var color = ['#5972cc', '#ffa022', '#46bee9'];
				        var series = [];
				        [['杭州', handleData]].forEach(function (item, i) {
				            series.push({//线和白点
				                name: item[0],
				                type: 'lines',
				                zlevel: 1,
				                effect: {
				                    show: true,
				                    period: 4,
				                    trailLength: 0.7,
				                    color: '#fff',
				                    symbolSize: 3
				                },
				                lineStyle: {
				                    normal: {
				                        color: color[i],
				                        width: 0,
				                        curveness: 0.2
				                    }
				                },
				                data: convertData(item[1])
				            },
				            {//箭头和飞机 
				                name: item[0],
				                type: 'lines',
				                zlevel: 2,
				                symbol: ['none', 'arrow'],
				                symbolSize: 6,
				                effect: {
				                    show: true,
				                    period: 4,
				                    trailLength: 0,
				                    symbol: planePath,
				                    symbolSize: 10
				                },
				                lineStyle: {
				                    normal: {
				                        color: color[i],
				                        width: 0.5,
				                        opacity: 0.6,
				                        curveness: 0.2
				                    }
				                },
				                data: convertData(item[1])
				            },
				            {//其他城市的点
				                name: item[0],
				                type: 'effectScatter',
				                coordinateSystem: 'geo',
				                zlevel: 2,
				                tooltip:{
				                    formatter: function (params) {
				                        return params.data.warehouseName + ": " + params.data.value[2] + "吨";
				                    }
				                },
				                showEffectOn: 'emphasis',
				                rippleEffect: {
				                    brushType: 'stroke'
				                },
				                label: {
				                    normal: {
				                        show: true,
				                        position: 'bottom',
				                        formatter: '{b}'
				                    }
				                },
				                symbolSize: function (val) {//val为每一个渲染的点的[经度，纬度，库存重量]
				                    var num = (val[2]-minInventoryWeight) / balance;
				                    var i = 0;
				                    if (num>=0 && num<1/5) {
				                        i = 0;
				                    } else if(num >= 1/5 && num < 2 / 5){
				                        i = 1;
				                    } else if (num >= 2/5 && num < 3 / 5) {
				                        i = 2;
				                    } else if (num >= 3/5 && num < 4 / 5) {
				                        i = 3;
				                    } else {
				                        i = 4;
				                    }
				                    return symbolSizeArr[i];
				                },
				                itemStyle: {
				                    normal: {
				                        color: color[i]
				                    }
				                },
				                data: item[1].map(function (dataItem) {
				                    return {
				                    	warehouseName: dataItem[1].name,
				                        name: dataItem[1].name,
				                        value: dataItem[1].coord.concat([dataItem[1].value])
				                    };
				                })
				            },
				            {//杭州的点
				                name: item[0],
				                type: 'effectScatter',
				                coordinateSystem: 'geo',
				                zlevel: 2,
				                tooltip: {
				                    formatter: function (params) {
				                        return params.data.name;
				                    }
				                },
				                label: {
				                    normal: {
				                        show: true,
				                        position: 'bottom',
				                        formatter: '{b}'
				                    }
				                },
				                symbolSize: 10,
				                itemStyle: {
				                    normal: {
				                        color: color[i]
				                    }
				                },
				                data: [
				                    {
				                        name: "杭州",
				                        value: item[1][0][0].coord.concat([50])
				                    }
				                ]
				            });
				        });
				
				        var option = {
				            backgroundColor: '#e9f0ff',
				            title: {
				                text: '总仓库数 ' + jsonData.warehouseList.length + ' 家',
				                subtext: '总库存 ' + jsonData.totalWeight + ' 吨',
				                left: 'center',
				                textStyle: {
				                    color: '#5067b8',
				                    fontSize: 22
				                },
				                subtextStyle: {
				                    color: '#5067b8',
				                    fontSize: 20
				                   
				                },
				                padding: 10,
				                top: 36,
				                borderWidth: 0,
				                borderColor: '#fff'
				            },
				            tooltip: {
				                trigger: 'item',
				                formatter: '从杭州出发'
				            },
				            /*legend: {
				                orient: 'vertical',
				                top: 'bottom',
				                left: 'right',
				                data: ['杭州'],
				                textStyle: {
				                    color: '#fff'
				                },
				                selectedMode: 'single'
				            },*/
				            geo: {
				                map: 'china',
				                label: {
				                    emphasis: {
				                        show: false
				                    }
				                },
				                roam: true,
				                itemStyle: {
				                    normal: {
				                        areaColor: '#d4e1fc',
				                        borderColor: '#fff'
				                    },
				                    emphasis: {
				                        areaColor: '#d4e1fc'
				                    }
				                },
				                zoom: 1.8
				            },
				            series: series
				        };
				        //--------------
				        myChart.setOption(option);
				        $(window).on('resize', function() {
				            myChart.resize();
				        });
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			}
		}
	});

	/*distributionPullRefresh = m('#distributionPullRefresh').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				distributionVue.pullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			callback: function() {
				distributionVue.pullUpQuery();
			}
		}
	});*/

	return distributionVue;
});