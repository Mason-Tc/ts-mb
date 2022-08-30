define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("moment");
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
		var beginDate = moment().subtract(3, 'day').format('YYYY-MM-DD 00:00');
		var endDate = moment().format('YYYY-MM-DD 23:59');
		var dtPicker1 = new mui.DtPicker({
			"type": "datetime",
			"value": beginDate
		});
		var dtPicker2 = new mui.DtPicker({
			"type": "datetime",
			"value": endDate
		});
		
		m('#div_list .public-list').scroll({
			deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		m('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		m('#warehouseScrollDiv').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		
		
		slider.setStopped(true); //禁止滑动
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		
		// 格式化时间
		Vue.filter("dateFilter", function(date, formatPattern){  
			return moment(date).format(formatPattern || "YYYY-MM-DD HH:mm:ss");  
		});
		
		var globalVue = new Vue({
			el: '#off-canvas',
			data: {
				
				warehouseList: [],
				dataPage: {
					dataList: [],
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"dispatchCode": "", //单据号
						"warehouseId": app.getUser().warehouse.id, //仓库ID
						"beginDate": "", //开始时间
						"endDate": "" //结束时间
					}
				}
			},
			methods: {
				// 跳转详情页面
				toDetail:function(id){
					m.openWindow({
						url: '../html/capacity-set.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
							"detailId": id
						}
					});
				},
				pickBeginDate: function() {
					var self = this;
					dtPicker1.show(function(selectItems) {
						self.dataPage.filterConditions.beginDate = selectItems.value;
						$('.tap-time').each(function() {
							var obj = $(this);
							obj.removeClass('time-selected');
						});
					});
				},
				pickEndDate: function() {
					var self = this;
					dtPicker2.show(function(selectItems) {
						self.dataPage.filterConditions.endDate = selectItems.value;
						$('.tap-time').each(function() {
							var obj = $(this);
							obj.removeClass('time-selected');
						});
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
						"dispatchCode": self.dataPage.filterConditions.dispatchCode,
						"warehouseId": self.dataPage.filterConditions.warehouseId,
						"beginDate": self.dataPage.filterConditions.beginDate,
						"endDate": self.dataPage.filterConditions.endDate
					}, function() {
						dataPullRefresh.scrollTo(0, 0, 0);
					});
				},
				doDataListQuery: function(params, callback) {
					var self = this;
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					m.ajax(app.api_url + '/api/dispatch/capacityAdjustList?_t=' + new Date().getTime(), {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒；
						success: function(res) {
							if(swaiting) {
								swaiting.close();
							}
							self.dataPage.pageNo = res.pageNo;
							self.dataPage.pageSize = res.pageSize;
							self.dataPage.totalListCount = res.count;
							self.dataPage.totalPage = res.totalPage;
							if(self.dataPage.pageNo == 1) {
								self.dataPage.dataList = res.list;
							} else {
								self.dataPage.dataList = self.dataPage.dataList.concat(res.list);
							}
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
					self.doDataListQuery({
						"pageNo": self.dataPage.pageNo,
						"dispatchCode": self.dataPage.filterConditions.dispatchCode,
						"warehouseId": self.dataPage.filterConditions.warehouseId,
						"beginDate": self.dataPage.filterConditions.beginDate,
						"endDate": self.dataPage.filterConditions.endDate
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
							"dispatchCode": self.dataPage.filterConditions.dispatchCode,
							"warehouseId": self.dataPage.filterConditions.warehouseId,
							"beginDate": self.dataPage.filterConditions.beginDate,
							"endDate": self.dataPage.filterConditions.endDate
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
		
		//执行刷新
		window.addEventListener('doRefresh', function(e){
		    globalVue.complete();
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
		
//		globalVue.testXML();
		globalVue.dataPage.filterConditions.beginDate = beginDate;
		globalVue.dataPage.filterConditions.endDate = endDate;
		globalVue.getWarehouseConditions();
		globalVue.doDataListQuery({
			"warehouseId": app.getUser().warehouse.id,
			"pageNo": 1,
			"pageSize": 10,
			"beginDate": globalVue.dataPage.filterConditions.beginDate,
			"endDate": globalVue.dataPage.filterConditions.endDate
		});
	});
	
});