define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("layui");
	var $ = require("zepto");
	require("../../../js/common/common.js");
	
	m.init();

	m.plusReady(function() {
		var swaiting = null;
		var twaiting = null;
		var dataPullRefresh = null;
		var layer = null;
		var slider = m("#slider").slider();
		
		slider.setStopped(true); //禁止滑动
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		
		var layerIndex;
		var globalVue = new Vue({
			el: '#off-canvas',
			data: {
				conditions: {},
				selectedMtxs: {},
				warehouseList: [],
				dataPage: {
					dataList: [],
					detailData:{},
					realNum:[],
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"ladingCode": "", //提单号
						"carPlateNo": "", //车牌号
						"warehouseId": app.getUser().warehouse.id //仓库ID
						//"beginDate": "", //开始时间
						//"endDate": "" //结束时间
					}
				}
			},
			methods: {
				reToHang:function(listItem){
					let pfList=[];
					let pfIds=listItem.platformIds.split(",");
					let pfNames=listItem.platformNameStr.split(",");
					for(let i=0;i<pfIds.length;i++){
						let tempMap={};
						tempMap.id=pfIds[i];
						tempMap.name=pfNames[i];
						pfList.push(tempMap);
					}
					listItem.pfList=pfList;
					// 跳转重新计重页面
					 m.openWindow({
						id: 'reweighting',
						"url": '../../crane-balance-diff/html/reweighting.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {'task':listItem}
					});
				},
				
				getWarehouseConditions: function() {
					var self = this;
					//获取基础数据 品名 材质 规格 产地
					m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
						self.warehouseList = data.warehouseList;
					});
				},
				
				complete: function() {
					var self = this;
					self.doDataListQuery({
						"pageNo": 1,
						"pageSize": 10,
						"ladingCode": self.dataPage.filterConditions.ladingCode,
						"carPlateNo": self.dataPage.filterConditions.carPlateNo,
						"warehouseId": self.dataPage.filterConditions.warehouseId
					}, function() {
						dataPullRefresh.scrollTo(0, 0, 0);
					});
				},
				doDataListQuery: function(params, callback) {
					var self = this;
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					m.ajax(app.api_url + '/api/rowcar/getWarningTaskList?_t=' + new Date().getTime(), {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒； 
						success: function(res) {
							if(swaiting) {
								swaiting.close();
							}
							if(app.debug) {
								console.log("doDataListQuery:" + JSON.stringify(res));
							}
							self.dataPage.dataList=res;
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
				// 多个提单号换行显示
				showText:function(loadCode){
					if(loadCode.indexOf(",")>0){
						return loadCode.replace(/,/g,'\r\n');
					}else{
						return loadCode;
					}
				},
				/**
				下拉查询
				*/
				pullDownQuery: function() {
					var self = this;
					self.dataPage.pageNo = 1;
					//						self.dataPage.pageSize = 10;
					self.doDataListQuery({
						"pageNo": self.dataPage.pageNo,
						"ladingCode": self.dataPage.filterConditions.ladingCode,
						"carPlateNo": self.dataPage.filterConditions.carPlateNo,
						"warehouseId": self.dataPage.filterConditions.warehouseId
					}, function() {
						m.toast("加载成功!");
						dataPullRefresh.endPulldownToRefresh();
						dataPullRefresh.scrollTo(0, 0, 0);
						if(self.dataPage.totalPage > 1) {
							dataPullRefresh.refresh(true);
						}
					});
				},
				/**
				 * 上拉查询
				 */
				pullUpQuery: function() {
					var self = this;
					if(self.dataPage.pageNo < self.dataPage.totalPage) {
						self.dataPage.pageNo++;
						self.doDataListQuery({
							"pageNo": self.dataPage.pageNo,
							"ladingCode": self.dataPage.filterConditions.ladingCode,
							"carPlateNo": self.dataPage.filterConditions.carPlateNo,
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
		
		
		//globalVue.dataPage.filterConditions.beginDate = beginDate;
		//globalVue.dataPage.filterConditions.endDate = endDate;
		globalVue.getWarehouseConditions();
		globalVue.doDataListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"ladingCode": globalVue.dataPage.filterConditions.ladingCode,
			"carPlateNo": globalVue.dataPage.filterConditions.carPlateNo,
			"warehouseId": globalVue.dataPage.filterConditions.warehouseId
		});
	});

});