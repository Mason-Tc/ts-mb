define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require('jquery');
	require('./f2.js');
	var inventoryExpVue = new Vue({
		el: '#iteminventoryexp',
		data: {
			localinWarehoueID: '',
			inventoryWeight: 0,
			structurelist: [],
			inventoryAuth:app.user.isPrivilege('warehouse:online:inventory:api'),
		},
		methods: {
			/**
			 * 
			 * @param {Object} params
			 * @param {Object} callback
			 */
			/*query: function(params, callback){
				var self = this;
				m.ajax(app.api_url + '/api/exponentReportApi/inventoryExponent', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						self.inventoryWeight = data.inventoryWeight;
						self.structurelist = data.list;
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
			},*/
			
			/**
			 * 库存指数查询
			 * @param {Object} warehouseID 仓库ID
			 */ 
			/*inventoryExpQuery: function(warehouseID) {
				if(warehouseID === this.localinWarehoueID) {
					return;
				} else {
					this.query({
						'warehouseID': warehouseID
					}, function(){});
					this.localWarehouseID = warehouseID;
				}
			},*/
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
			}
		}
	});
	
	return inventoryExpVue;
});