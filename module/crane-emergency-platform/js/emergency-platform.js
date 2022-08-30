define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	
	require("layui");
	var layer = null;
	layui.use(['layer'], function() {
		layer = layui.layer;
	});
	var $ = require("zepto");
	require("../../../js/common/common.js");
	
	m.init();

	m.plusReady(function() {
		var swaiting = null;
		var twaiting = null;
		var dataPullRefresh = null;
		
		var slider = m("#slider").slider();
		
		var globalVue = new Vue({
			el: '#off-canvas',
			data: {
				carPlateNo:'',
				platformId:'',
				warehouseList: [],
				platformList: [],
				dataPage: {
					dataList: [],
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"warehouseId": app.getUser().warehouse.id, //仓库ID
						
					}
				}
			},
			methods: {
				// 处理告警
				toHandle:function(item){
					layer.open({
						type: 1,
						shade: 0.3,
						title: "验证处理",
						content:'<div style="color: dimgray;margin-top: 60px;font-size: 16px;text-align: center;">请确认是否通过数字月台车牌验证！</div>',
						area: ['400px', '220px'],
						btn: ['取 消','确 定'],
						cancel: function(index) {
						 	return true;
						},
						yes:function(index, layero){
							layer.close(index);
						},
						btn2:function(index, layero){
							swaiting = plus.nativeUI.showWaiting('处理中...');
							item.createBy='';
							item.updateBy='';
							m.ajax(app.api_url + '/api/rowcar/checkCarNoOk?_t=' + new Date().getTime(), {
								data: item,
								dataType: 'json', //服务器返回json格式数据
								type: 'post', //HTTP请求类型
								success: function(res) {
									if(swaiting) {
										swaiting.close();
									}
									if(res.status){
										globalVue.complete();
									}
									layer.msg(res.msg);
								},
								error: function(xhr, type, errorThrown) {
									if(swaiting) {
										swaiting.close();
									}
									layer.msg("网络异常，请重新试试");
								}
							});
						}
					});
				},
				
			
				getWarehouseConditions: function() {
					var self = this;
					//获取基础数据 品名 材质 规格 产地
					m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
						self.warehouseList = data.warehouseList;
					});
				},
				getPlatformList:function(){
					var self=this;
					m.ajax(app.api_url + '/api/rowcar/getPlatformList?_t=' + new Date().getTime(), {
						data: {"warehouseId": self.dataPage.filterConditions.warehouseId},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						success: function(res) {
							self.platformList=res;
						}
					});
				},
				complete: function() {
					var self = this;
					self.doDataListQuery({
						"carPlateNo": globalVue.carPlateNo,
						"platformId": globalVue.platformId,
						"pageNo": 1,
						"pageSize": 10,
						"warehouseId": self.dataPage.filterConditions.warehouseId
					}, function() {
						dataPullRefresh.endPulldownToRefresh();
						dataPullRefresh.scrollTo(0, 0, 0);
					});
				},
				doDataListQuery: function(params, callback) {
					var self = this;
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					m.ajax(app.api_url + '/api/rowcar/getCarCheckList?_t=' + new Date().getTime(), {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						success: function(res) {
							if(swaiting) {
								swaiting.close();
							}
							globalVue.dataPage.dataList=res;
							
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if(swaiting) {
								swaiting.close();
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
				
				/**
				下拉查询
				*/
				pullDownQuery: function() {
					var self = this;
					self.dataPage.pageNo = 1;
					//						self.dataPage.pageSize = 10;
					self.complete();
				},
				/**
				 * 上拉查询
				 */
				pullUpQuery: function() {
					var self = this;
					if(self.dataPage.pageNo < self.dataPage.totalPage) {
						self.dataPage.pageNo++;
						self.doDataListQuery({
							"carPlateNo": globalVue.globalVue,
							"platformId": globalVue.platformId,
							"pageNo": globalVue.dataPage.pageNo,
							"pageSize": globalVue.dataPage.pageSize,
							"warehouseId": self.dataPage.filterConditions.warehouseId
						}, function() {
							dataPullRefresh.endPullupToRefresh();
						});
					} else {
						dataPullRefresh.endPullupToRefresh(true);
						window.setTimeout(function() {
							dataPullRefresh.disablePullupToRefresh();
						}, 1500);
					}
				}
			},
			filters: {
			    formatTimer: function(value) {
				  if(value){
					  let date = new Date(value);
					  let y = date.getFullYear();
					  let MM = date.getMonth() + 1;
					  MM = MM < 10 ? "0" + MM : MM;
					  let d = date.getDate();
					  d = d < 10 ? "0" + d : d;
					  let h = date.getHours();
					  h = h < 10 ? "0" + h : h;
					  let m = date.getMinutes();
					  m = m < 10 ? "0" + m : m;
					  let s = date.getSeconds();
					  s = s < 10 ? "0" + s : s;
					  return y + "-" + MM + "-" + d + " " + h + ":" + m;
				  }else{
					  return '';
				  }
			    }
			  }
		});
		
		dataPullRefresh = m('#div_list .public-list').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.pullDownQuery();
				}
			},
			up: {
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				callback: function() {
					var self = this;
					globalVue.pullUpQuery();
				}
			}
		});
		
		globalVue.getWarehouseConditions();
		globalVue.getPlatformList();
		globalVue.complete();
	});

	
});