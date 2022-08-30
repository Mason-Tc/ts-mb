define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("layui");
	// var $ = require("zepto");
	var $ = require("jquery");
	require("../../../js/common/common.js");
	
	var select2 = require("select2");
	
	var allOptionObject = {id: -1, text: '全部'}; 
	
	function formatState(state) {
	    var $state = $(
		  '<span style="font-size: 14px;border-bottom:1px solid #DCDCDC;display: block;">' + state.text + '</span>'
	    );
	    return $state;
	}
	
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
		
		
	
	
	var swaiting;
	var layerIndex;
	var globalVue = new Vue({
			el: '#off-canvas',
			data: {
				conditions: {
					specificationId: '' // 规格id
				},
				selectedMtxs: {},
				warehouseList: [],
				basicDatas: {}, // 品名 材质 规格 产地基础数据
				dataPage: {
					dataList: [],
					detailData:{},
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"carPlateNo": "", //车牌号
						"warehouseId": app.getUser().warehouse.id //仓库ID
						//"beginDate": "", //开始时间
						//"endDate": "" //结束时间
					}
				}
			},
			methods: {
				checkWork:function(listItem){
					// debugger
					let sta=listItem.status;
					if(sta=='151' || sta=='152' || sta=='154'){
						layer.msg("作业中的任务不能领取");
						return;
					}
					
					// 跳转室外入库页面
					 m.openWindow({
						id: 'outsideout-work',
						"url": '../../crane-outside-out/html/outsideout-work.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {'taskId':listItem.id}
					});
					
					
					// m.ajax(app.api_url + '/api/rowcar/getOutsideSendData?_t=' + new Date().getTime(), {
					// 	data: {taskId:listItem.id},
					// 	dataType: 'json', //服务器返回json格式数据
					// 	type: 'post', //HTTP请求类型
					// 	timeout: 10000, //超时时间设置为60秒； 
					// 	success: function(res) {
					// 		debugger
					// 		let errorMsg=res.errorMsg;
					// 		if(errorMsg&&errorMsg.length>0){
					// 			layer.msg(errorMsg);
					// 		}else{
					// 			// 跳转室外入库页面
					// 			 m.openWindow({
					// 				id: 'outsideout-work',
					// 				"url": '../../crane-outside-out/html/outsideout-work.html',
					// 				show: {
					// 					aniShow: 'pop-in'
					// 				},
					// 				waiting: {
					// 					autoShow: true
					// 				},
					// 				extras: {'proReceiving':res}
					// 			});
					// 		}
					// 	},
					// 	error: function(xhr, type, errorThrown) {
					// 		if(swaiting) {
					// 			swaiting.close();
					// 		}
					// 		m.toast("网络异常，请重新试试");
					// 	}
					// });
				},
				
				getWarehouseConditions: function() {
					var self = this;
					//获取基础数据 品名 材质 规格 产地
					m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
						self.warehouseList = data.warehouseList;
					});
				},
				
				complete: function() {
					// debugger
					var self = this;
					var queryParams = {
						"pageNo": 1,
						"pageSize": 10,
						"carPlateNo": self.dataPage.filterConditions.carPlateNo,
						"warehouseId": self.dataPage.filterConditions.warehouseId
					};
					if(self.conditions.specificationId !== "-1") {
						queryParams.specificationId = self.conditions.specificationId;
					}
					self.doDataListQuery(queryParams, function() {
						dataPullRefresh.scrollTo(0, 0, 0);
					});
				},
				doDataListQuery: function(params, callback) {
					var self = this;
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					m.ajax(app.api_url + '/api/rowcar/getOutsideOutputList?_t=' + new Date().getTime(), {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒； 
						success: function(res) {
							// debugger
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
				getBasicInfo: function() { // 获取 品名 材质 规格 产地 基础数据
					var self = this;
					m.getJSON(app.api_url + '/api/sysBusinessBasis/materialConditions?_t=' + new Date().getTime(), function(data) {
						// debugger
						self.basicDatas = data;
						
						data.specificationList.unshift(allOptionObject);
						$('.q-specification').select2({ // 规格
							templateResult: formatState,
							data: data.specificationList
						});
						
						// 规格选中事件
						$(".q-specification").on("select2:select", function(e) {			
							self.conditions.specificationId = e.params.data.id;
						});
						
						
					});
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
		
		doRefresh=function(){
			globalVue.complete();
		}
		
		globalVue.getWarehouseConditions();
		globalVue.doDataListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"carPlateNo": globalVue.dataPage.filterConditions.carPlateNo,
			"warehouseId": globalVue.dataPage.filterConditions.warehouseId
		});
		
		globalVue.getBasicInfo();
		
	});

})