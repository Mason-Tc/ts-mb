define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");

	var pendingListPullRefresh = null;
	var alreadyListPullRefresh = null;
	var slider = m("#slider").slider();
	slider.setStopped(true); //禁止滑动
	
	m.init();

	var globalVue = new Vue({
		el: '#div_inventory_list',
		data: {
			headTitle: '物资盘点',
			pendingPage: {
				pendingList: [],
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0 //总条数
			},
			alreadyPage: {
				alreadyList: [],
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0 //总条数
			}
		},
		methods: {
			onItemSliderClick: function($event, index) {
				var self = this;
				event.stopPropagation();
				slider.gotoItem(index);
			},
			doPendingListQuery: function(params, callback) {
				var self = this;
				m.ajax(app.api_url + '/api/proCheck/getCheckList', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					//timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						// debugger
						self.pendingPage.pageNo = data.pageNo;
						self.pendingPage.pageSize = data.pageSize;
						self.pendingPage.totalListCount = data.count;
						self.pendingPage.totalPage = data.totalPage;
						if(self.pendingPage.pageNo == 1) {
							self.pendingPage.pendingList = data.list;
						} else {
							self.pendingPage.pendingList = self.pendingPage.pendingList.concat(data.list);
						}
						if(self.pendingPage.pendingList && self.pendingPage.pendingList.length > 0){
							m.each(self.pendingPage.pendingList, function(index, item){
								if(item){
									item.checkTotalStr = (item.checkNumTotal ? item.checkNumTotal : 0 ) + "件/" + (item.checkWeightTotal ? item.checkWeightTotal : 0 ) + "吨";
									item.notCheckTotalStr = (item.totalNotCheckNum ? item.totalNotCheckNum : 0 ) + "件/" + (item.totalNotCheckWeight ? item.totalNotCheckWeight : 0 ) + "吨";
								}
							});
						}
						if(typeof callback === "function") {
							callback();
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			},
			doAlreadyListQuery: function(params, callback) {
				var self = this;
				m.ajax(app.api_url + '/api/proCheck/getCheckList', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					//timeout: 10000, //超时时间设置为10秒； 
					success: function(data) {
						self.alreadyPage.pageNo = data.pageNo;
						self.alreadyPage.pageSize = data.pageSize;
						self.alreadyPage.totalListCount = data.count;
						self.alreadyPage.totalPage = data.totalPage;
						if(self.alreadyPage.pageNo == 1) {
							self.alreadyPage.alreadyList = data.list;
						} else {
							self.alreadyPage.alreadyList = self.alreadyPage.alreadyList.concat(data.list);
						}
						if(self.alreadyPage.alreadyList && self.alreadyPage.alreadyList.length > 0){
							m.each(self.alreadyPage.alreadyList, function(index, item){
								if(item){
									item.checkTotalStr = (item.checkNumTotal ? item.checkNumTotal : 0 ) + "件/" + (item.checkWeightTotal ? item.checkWeightTotal : 0 ) + "吨";
									item.notCheckTotalStr = (item.totalNotCheckNum ? item.totalNotCheckNum : 0 ) + "件/" + (item.totalNotCheckWeight ? item.totalNotCheckWeight : 0 ) + "吨";
								}
							});
						}
						if(typeof callback === "function") {
							callback();
						}
						//						console.log(JSON.stringify(data));
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			},
			/**
			下拉查询
			*/
			pullDownQuery: function(id) {
				var self = this;
				switch(id) {
					case "pendingList":
						self.pendingPage.pageNo = 1;
						self.doPendingListQuery({
							"pageNo": self.pendingPage.pageNo,
							"qryType": 1
						}, function() {
							m.toast("加载成功!");
							pendingListPullRefresh.endPulldownToRefresh();
							pendingListPullRefresh.scrollTo(0, 0, 100);
							if(self.pendingPage.totalPage > 1) {
								pendingListPullRefresh.refresh(true);
							}
						});
						break;
					case "alreadyList":
						self.alreadyPage.pageNo = 1;
						self.doAlreadyListQuery({
							"pageNo": self.alreadyPage.pageNo,
							"qryType": 2
						}, function() {
							m.toast("加载成功!");
							alreadyListPullRefresh.endPulldownToRefresh();
							alreadyListPullRefresh.scrollTo(0, 0, 100);
							if(self.alreadyPage.totalPage > 1) {
								alreadyListPullRefresh.refresh(true);
							}
						});
						break;
				}
			},
			/**
			 * 上拉查询
			 */
			pullUpQuery: function(id) {
				var self = this;
				switch(id) {
					case "pendingList":
						if(self.pendingPage.pageNo < self.pendingPage.totalPage) {
							self.pendingPage.pageNo++;
							self.doPendingListQuery({
								"pageNo": self.pendingPage.pageNo,
								"qryType": 1
							}, function() {
								pendingListPullRefresh.endPullupToRefresh();
							});
						} else {
							pendingListPullRefresh.endPullupToRefresh(true);
							window.setTimeout(function() {
								pendingListPullRefresh.disablePullupToRefresh();
							}, 1500);
						}
						break;
					case "alreadyList":
						if(self.alreadyPage.pageNo < self.alreadyPage.totalPage) {
							self.alreadyPage.pageNo++;
							self.doAlreadyListQuery({
								"pageNo": self.alreadyPage.pageNo,
								"qryType": 2
							}, function() {
								alreadyListPullRefresh.endPullupToRefresh();
							});
						} else {
							alreadyListPullRefresh.endPullupToRefresh(true);
							window.setTimeout(function() {
								alreadyListPullRefresh.disablePullupToRefresh();
							}, 1500);
						}
						break;
				}

			},
			/**
			 * 跳转至盘点登记/单据详情
			 * @param {Object} type 类型(0:盘点登记; 1:单据详情)
			 * @param {Object} id 获取盘点信息要用到的key
			 */
			openDetail: function(type, id) {
				var self = this;
				var pageId = "inventory-register";
				var pageUrl = "../html/inventory-register.html";
				if(type == 1) {
					pageId = "inventory-detail";
					pageUrl = "../html/inventory-detail.html";
				}
				m.openWindow({
					id: pageId,
					url: pageUrl,
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						"inventoryKey": id
					}
				});
			}
		}
	});

	m.plusReady(function() {
		globalVue.doPendingListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"qryType": 1
		});
		globalVue.doAlreadyListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"qryType": 2
		});
	});

	function initHeight() {
		var windowHeight = $(window).height();
		$('body').height(windowHeight);
		$('#pendingList').height(windowHeight - 90);
		$('#pendingList .public-list').height(windowHeight - 90);
		$('#alreadyList').height(windowHeight - 90);
		$('#alreadyList .public-list').height(windowHeight - 90);
		$(window).resize(function() {
			var windowHeight = $(window).height();
			$('body').height(windowHeight);
			$('#pendingList').height(windowHeight - 90);
			$('#pendingList .public-list').height(windowHeight - 90);
			$('#alreadyList').height(windowHeight - 90);
			$('#alreadyList .public-list').height(windowHeight - 90);
		});
	}
	initHeight();
	mui('#pendingList .public-list').scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
	mui('#alreadyList .public-list').scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
	pendingListPullRefresh = m('#pendingList .public-list').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				globalVue.pullDownQuery("pendingList");
			}
		},
		up: {
			contentrefresh: '正在加载...',
			contentnomore: '没有更多数据了',
			callback: function() {
				var self = this;
				globalVue.pullUpQuery("pendingList");
			}
		}
	});
	alreadyListPullRefresh = m('#alreadyList .public-list').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				globalVue.pullDownQuery("alreadyList");
			}
		},
		up: {
			contentrefresh: '正在加载...',
			contentnomore: '没有更多数据了',
			callback: function() {
				var self = this;
				globalVue.pullUpQuery("alreadyList");
			}
		}
	});

	document.addEventListener("refreshAlreadyList", function(e) {
		globalVue.doPendingListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"qryType": 1
		}, function() {
			pendingListPullRefresh.scrollTo(0, 0, 100);
			pendingListPullRefresh.refresh(true);
		});
		globalVue.doAlreadyListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"qryType": 2
		}, function() {
			alreadyListPullRefresh.scrollTo(0, 0, 0);
			alreadyListPullRefresh.refresh(true);
		});
		slider.gotoItem(e.detail.itemIndx);
	}, false);
});