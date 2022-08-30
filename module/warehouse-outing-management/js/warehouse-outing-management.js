define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	m.init();

	var pendingListPullRefresh = null;
	var outputListPullRefresh = null;
	var slider = m("#slider").slider();
	slider.setStopped(true); //禁止滑动

	var globalVue = new Vue({
		el: '#waitOutWareList',
		data: {
			headTitle: '待出库列表',
			pendingPage: {
				pendingList: [
					/*{
						"sendCode": "FH1808080009",
						"sendDate": "2018-09-01 10:03",
						"ladingCode": "TD0009333",
						"ownerName": "湖南中拓",
						"carPlateNo": "湘A00998",
						"sendNumTotal": "4件",
						"sendWeightTotal": "9.2吨"
					},*/
				],
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0, //总条数
				filterConditions: { // 筛选条件
					"carPlateNo": "",
					"ladingCode": "",
					"ownerId": "",
					"ownerName": "",
					"beginDate": "",
					"endDate": ""
				},
			},
			outputPage: {
				outputList: [
					/*{
						"sendCode": "FH1808080009",
						"sendDate": "2018-09-01 10:03",
						"ladingCode": "TD0009333",
						"ownerName": "湖南中拓",
						"carPlateNo": "湘A00998",
						"realNumTotal": "4件",
						"realWeightTotal": "9.2吨"
					}*/
				],
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0, //总条数
				filterConditions: { // 筛选条件
					"carPlateNo": "",
					"ladingCode": "",
					"ownerId": "",
					"ownerName": "",
					"beginDate": "",
					"endDate": ""
				},
			}
		},
		methods: {
			onItemSliderClick: function($event, index) {
				var self = this;
				event.stopPropagation();
				if(index == 0) {
					self.headTitle = '待出库列表';
				} else if(index == 1) {
					self.headTitle = '已出库列表';
				}
				slider.gotoItem(index);
			},
			openQueryHTML: function(id) {
				var self = this;
				if(id == 'pendingListQuery') {
					m.openWindow({
						id: 'pendingListQuery',
						url: '../html/pending-list-query.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
							"filterConditions": {
								"carPlateNo": self.pendingPage.filterConditions.carPlateNo,
								"ladingCode": self.pendingPage.filterConditions.ladingCode,
								"ownerId": self.pendingPage.filterConditions.ownerId,
								"ownerName": self.pendingPage.filterConditions.ownerName,
								"beginDate": self.pendingPage.filterConditions.beginDate,
								"endDate": self.pendingPage.filterConditions.endDate
							}
						}
					});
				} else if(id == 'outputListQuery') {
					m.openWindow({
						id: 'outputListQuery',
						url: '../html/output-list-query.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
							"filterConditions": {
								"carPlateNo": self.outputPage.filterConditions.carPlateNo,
								"ladingCode": self.outputPage.filterConditions.ladingCode,
								"ownerId": self.outputPage.filterConditions.ownerId,
								"ownerName": self.outputPage.filterConditions.ownerName,
								"beginDate": self.outputPage.filterConditions.beginDate,
								"endDate": self.outputPage.filterConditions.endDate
							}
						}
					});
				}
			},
			/*
			 * 获取待出库的数据
			 */
			doPendingListQuery: function(params, callback) {
				var self = this;
				m.ajax(app.api_url + '/api/proOutput/pendingList', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					//timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						self.pendingPage.pageNo = data.pageNo;
						self.pendingPage.pageSize = data.pageSize;
						self.pendingPage.totalListCount = data.count;
						self.pendingPage.totalPage = data.totalPage;
						if(self.pendingPage.pageNo == 1) {
							self.pendingPage.pendingList = data.list;
						} else {
							self.pendingPage.pendingList = self.pendingPage.pendingList.concat(data.list);
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
			/*
			 * 获取已出库的数据
			 */
			doOutputListQuery: function(params, callback) {
				var self = this;
				m.ajax(app.api_url + '/api/proOutput/outputList', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					//timeout: 10000, //超时时间设置为10秒； 
					success: function(data) {
						self.outputPage.pageNo = data.pageNo;
						self.outputPage.pageSize = data.pageSize;
						self.outputPage.totalListCount = data.count;
						self.outputPage.totalPage = data.totalPage;
						if(self.outputPage.pageNo == 1) {
							self.outputPage.outputList = data.list;
						} else {
							self.outputPage.outputList = self.outputPage.outputList.concat(data.list);
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
							"carPlateNo": self.pendingPage.filterConditions.carPlateNo,
							"ladingCode": self.pendingPage.filterConditions.ladingCode,
							"ownerId": self.pendingPage.filterConditions.ownerId,
							"beginDate": self.pendingPage.filterConditions.beginDate,
							"endDate": self.pendingPage.filterConditions.endDate,
						}, function() {
							m.toast("加载成功!");
							pendingListPullRefresh.endPulldownToRefresh();
							pendingListPullRefresh.scrollTo(0, 0, 100);
							if(self.pendingPage.totalPage > 1) {
								pendingListPullRefresh.refresh(true);
							}
						});
						break;
					case "outputList":
						self.outputPage.pageNo = 1;
						self.doOutputListQuery({
							"pageNo": self.outputPage.pageNo,
							"carPlateNo": self.outputPage.filterConditions.carPlateNo,
							"ladingCode": self.outputPage.filterConditions.ladingCode,
							"ownerId": self.outputPage.filterConditions.ownerId,
							"beginDate": self.outputPage.filterConditions.beginDate,
							"endDate": self.outputPage.filterConditions.endDate,
						}, function() {
							m.toast("加载成功!");
							outputListPullRefresh.endPulldownToRefresh();
							outputListPullRefresh.scrollTo(0, 0, 100);
							if(self.outputPage.totalPage > 1) {
								outputListPullRefresh.refresh(true);
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
								"carPlateNo": self.pendingPage.filterConditions.carPlateNo,
								"ladingCode": self.pendingPage.filterConditions.ladingCode,
								"ownerId": self.pendingPage.filterConditions.ownerId,
								"beginDate": self.pendingPage.filterConditions.beginDate,
								"endDate": self.pendingPage.filterConditions.endDate,
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
					case "outputList":
						if(self.outputPage.pageNo < self.outputPage.totalPage) {
							self.outputPage.pageNo++;
							self.doOutputListQuery({
								"pageNo": self.outputPage.pageNo,
								"carPlateNo": self.outputPage.filterConditions.carPlateNo,
								"ladingCode": self.outputPage.filterConditions.ladingCode,
								"ownerId": self.outputPage.filterConditions.ownerId,
								"beginDate": self.outputPage.filterConditions.beginDate,
								"endDate": self.outputPage.filterConditions.endDate,
							}, function() {
								outputListPullRefresh.endPullupToRefresh();
							});
						} else {
							outputListPullRefresh.endPullupToRefresh(true);
							window.setTimeout(function() {
								outputListPullRefresh.disablePullupToRefresh();
							}, 1500);
						}
						break;
				}

			},
			/**
			 * 跳转至出库实提
			 * @param {Object} type 类型(0:待出库; 1:已出库)
			 * @param {Object} id 获取出库实提信息要用到的key
			 */
			openDetail: function(type, id) {
				var self = this;
				var pageId = "outing-details";
				var pageUrl = "../html/outing-details.html";
				if(type == 1) {
					pageId = "already-out-details";
					pageUrl = "../html/already-out-details.html";
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
						"outingKey": id
					}
				});
			}
		}
	});

	m.plusReady(function() {
		globalVue.doPendingListQuery({
			"pageNo": 1,
			"pageSize": 10
		});
		globalVue.doOutputListQuery({
			"pageNo": 1,
			"pageSize": 10
		});

		window.addEventListener("getPendingListFilterVal", function(e) {
			console.log("父页面得到的值:" + JSON.stringify(e.detail));
			globalVue.pendingPage.filterConditions.carPlateNo = e.detail.carPlateNo;
			globalVue.pendingPage.filterConditions.ladingCode = e.detail.ladingCode;
			globalVue.pendingPage.filterConditions.ownerId = e.detail.ownerId;
			globalVue.pendingPage.filterConditions.ownerName = e.detail.ownerName;
			globalVue.pendingPage.filterConditions.beginDate = e.detail.beginDate;
			globalVue.pendingPage.filterConditions.endDate = e.detail.endDate;
			globalVue.doPendingListQuery({
				"pageNo": 1,
				"pageSize": 10,
				"carPlateNo": globalVue.pendingPage.filterConditions.carPlateNo,
				"ladingCode": globalVue.pendingPage.filterConditions.ladingCode,
				"ownerId": globalVue.pendingPage.filterConditions.ownerId,
				"beginDate": globalVue.pendingPage.filterConditions.beginDate,
				"endDate": globalVue.pendingPage.filterConditions.endDate,
			}, function() {
				pendingListPullRefresh.scrollTo(0, 0, 100);
				pendingListPullRefresh.refresh(true);
			});
		});

		window.addEventListener("getOutputListFilterVal", function(e) {
			console.log("父页面得到的值:" + JSON.stringify(e.detail));
			globalVue.outputPage.filterConditions.carPlateNo = e.detail.carPlateNo;
			globalVue.outputPage.filterConditions.ladingCode = e.detail.ladingCode;
			globalVue.outputPage.filterConditions.ownerId = e.detail.ownerId;
			globalVue.outputPage.filterConditions.ownerName = e.detail.ownerName;
			globalVue.outputPage.filterConditions.beginDate = e.detail.beginDate;
			globalVue.outputPage.filterConditions.endDate = e.detail.endDate;
			globalVue.doOutputListQuery({
				"pageNo": 1,
				"pageSize": 10,
				"carPlateNo": globalVue.outputPage.filterConditions.carPlateNo,
				"ladingCode": globalVue.outputPage.filterConditions.ladingCode,
				"ownerId": globalVue.outputPage.filterConditions.ownerId,
				"beginDate": globalVue.outputPage.filterConditions.beginDate,
				"endDate": globalVue.outputPage.filterConditions.endDate,
			}, function() {
				outputListPullRefresh.scrollTo(0, 0, 100);
				outputListPullRefresh.refresh(true);
			});
		});
	});

	function initHeight() {
		var windowHeight = $(window).height();
		$('body').height(windowHeight);
		$('#pendingList').height(windowHeight - 90);
		$('#pendingList .public-list').height(windowHeight - 144);
		$('#outputList').height(windowHeight - 90);
		$('#outputList .public-list').height(windowHeight - 144);
		$(window).resize(function() {
			var windowHeight = $(window).height();
			$('body').height(windowHeight);
			$('#pendingList').height(windowHeight - 90);
			$('#pendingList .public-list').height(windowHeight - 144);
			$('#outputList').height(windowHeight - 90);
			$('#outputList .public-list').height(windowHeight - 144);
		});
	}
	initHeight();
	mui('#pendingList .public-list').scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
	mui('#outputList .public-list').scroll({
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
	outputListPullRefresh = m('#outputList .public-list').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				globalVue.pullDownQuery("outputList");
			}
		},
		up: {
			contentrefresh: '正在加载...',
			contentnomore: '没有更多数据了',
			callback: function() {
				var self = this;
				globalVue.pullUpQuery("outputList");
			}
		}
	});

	document.addEventListener("refreshOutputList", function(e) {
		globalVue.doPendingListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"carPlateNo": globalVue.pendingPage.filterConditions.carPlateNo,
			"ladingCode": globalVue.pendingPage.filterConditions.ladingCode,
			"ownerId": globalVue.pendingPage.filterConditions.ownerId,
			"beginDate": globalVue.pendingPage.filterConditions.beginDate,
			"endDate": globalVue.pendingPage.filterConditions.endDate,
		}, function() {
			pendingListPullRefresh.scrollTo(0, 0, 100);
			pendingListPullRefresh.refresh(true);
		});
		globalVue.doOutputListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"carPlateNo": globalVue.outputPage.filterConditions.carPlateNo,
			"ladingCode": globalVue.outputPage.filterConditions.ladingCode,
			"ownerId": globalVue.outputPage.filterConditions.ownerId,
			"beginDate": globalVue.outputPage.filterConditions.beginDate,
			"endDate": globalVue.outputPage.filterConditions.endDate,
		}, function() {
			outputListPullRefresh.scrollTo(0, 0, 0);
			outputListPullRefresh.refresh(true);
		});
		globalVue.headTitle = '已出库列表';
		slider.gotoItem(1);
	}, false);
});