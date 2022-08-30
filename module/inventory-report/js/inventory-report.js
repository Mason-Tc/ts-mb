define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require('moment');
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");

	m('#warehouseScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	var offCanvasQuery = m("#off-canvas").offCanvas();
	var mask = m.createMask(function() {
		if(offCanvasQuery.isShown("right")) {
			offCanvasQuery.close();
			$('#searchVue').hide();
			mask.close();
		}
	}, 'contentDiv');

	var swaiting = null;
	var dataListPullRefresh = null;

	var beginDate = moment().subtract(1, 'months').format('YYYY-MM-DD');
	var endDate = moment().format('YYYY-MM-DD');
	var dtPicker1 = new mui.DtPicker({
		"type": "date",
		"value": beginDate
	});
	var dtPicker2 = new mui.DtPicker({
		"type": "date",
		"value": endDate
	});

	m.init();

	m.plusReady(function() {
		globalVue.getWarehouseConditions();
		console.log("pageNo:" + globalVue.dataPage.pageNo +
			"|beginDate:" + globalVue.dataPage.filterConditions.beginDate +
			"|endDate:" +
			globalVue.dataPage.filterConditions.endDate +
			"|warehouseId:" + globalVue.dataPage.filterConditions.warehouseId);
		globalVue.doDataListQuery({
			"pageNo": 1,
			"pageSize": 10
		});
		globalVue.dataPage.filterConditions.beginDate = beginDate;
		globalVue.dataPage.filterConditions.endDate = endDate;

		var backDefault = m.back;

		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			backDefault();
		}
		m.back = detailBack;
	});

	var globalVue = new Vue({
		el: '#off-canvas',
		data: {
			conditions: {},
			selectedMtxs: {},
			warehouseList: [],
			warehousePlaceList: [],
			dataPage: {
				dataList: [],
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0, //总条数
				filterConditions: { // 筛选条件
					"warehouseId": "",
					"beginDate": "",
					"endDate": ""
				}
			}
		},
		methods: {
			/**
			 * 打开查询框
			 */
			showOffExponentQuery: function() {
				offCanvasQuery.show();
				$('#searchVue').show();
				mask.show();
			},
			/**
			 * 隐藏查询框
			 */
			hideOffCanvaQuery: function() {
				if(offCanvasQuery.isShown("right")) {
					offCanvasQuery.close();
					mask.close();
				}
				$('#searchVue').hide();
			},
			pickBeginDate: function() {
				var self = this;
				dtPicker1.show(function(selectItems) {
					self.dataPage.filterConditions.beginDate = selectItems.value;
				})
			},
			pickEndDate: function() {
				var self = this;
				dtPicker2.show(function(selectItems) {
					self.dataPage.filterConditions.endDate = selectItems.value;
				})
			},
			getWarehouseConditions: function() {
				var self = this;
				var apiUrl = app.api_url + '/api/proInventoryApi/warehouseConditions?_t=' + new Date().getTime();
				m.getJSON(apiUrl, function(data) {
					self.conditions = data;
				});
			},
			searchIvntDetail: function(evt, curId) {
				var self = this;
				var selectedObj;
				if(evt != null) {
					selectedObj = $(evt.currentTarget);
					var cpsId = selectedObj.attr("class").substring(0, selectedObj.attr("class").indexOf(" ")) + selectedObj.attr("mtxId");
				} else {
					selectedObj = $(null);
				}
				var warehouseId = '',
					warehousePlaceId = '';
				if(selectedObj.hasClass("warehouseA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
						eval('delete globalVue.selectedMtxs.' + cpsId);
						Vue.delete(self.selectedMtxs, 0);
					} else {
						selectedObj.addClass('selectedTD');
						Vue.set(self.selectedMtxs, 0, {
							id: cpsId,
							name: selectedObj.text(),
							tagId: selectedObj.attr('id')
						});
					}
				} else {}
				$('.selectedTD').each(function() {
					var obj = $(this);
					if(obj.hasClass("warehouseA")) {
						if(selectedObj.hasClass("warehouseA")) {
							obj.removeClass('selectedTD');
							warehouseId = selectedObj.attr('mtxId');
							selectedObj.addClass('selectedTD');
						} else {
							warehouseId = obj.attr('mtxId');
						}
					}
				});
				self.dataPage.filterConditions.warehouseId = warehouseId;
				console.log('warehouseId=' + self.dataPage.filterConditions.warehouseId);
			},
			resetFilter: function() {
				var self = this;
				self.dataPage.filterConditions.beginDate = '';
				self.dataPage.filterConditions.endDate = '';
				self.dataPage.filterConditions.warehouseId = '';
				self.selectedMtxs = {};
				$('.selectedTD').each(function() {
					var obj = $(this);
					obj.removeClass('selectedTD');
				});
			},
			complete: function() {
				var self = this;
				self.dataPage.pageNo = 1;
				self.doDataListQuery({
					"pageNo": self.dataPage.pageNo,
					"beginDate": self.dataPage.filterConditions.beginDate,
					"endDate": self.dataPage.filterConditions.endDate,
					"warehouseId": self.dataPage.filterConditions.warehouseId
				}, function() {
					m.toast("加载成功!");
					dataListPullRefresh.endPulldownToRefresh();
					dataListPullRefresh.scrollTo(0, 0, 100);
					if(self.dataPage.totalPage > 1) {
						dataListPullRefresh.refresh(true);
					}
				});
				self.hideOffCanvaQuery();
			},
			openDetailPage: function(id) {
				var self = this;
				m.openWindow({
					id: 'inventory-report-detail',
					url: '../../inventory-report/html/inventory-report-detail.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						'inventoryReportId': id
					}
				});
			},
			/*
			 * 获取待出库的数据
			 */
			doDataListQuery: function(params, callback) {
				// debugger
				var self = this;
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				var apiUrl = app.api_url + '/api/proCheck/report/list?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(swaiting) {
							swaiting.close();
						}
						self.dataPage.pageNo = data.pageNo;
						self.dataPage.pageSize = data.pageSize;
						self.dataPage.totalListCount = data.count;
						self.dataPage.totalPage = data.totalPage;
						if(self.dataPage.pageNo == 1) {
							self.dataPage.dataList = data.list;
						} else {
							self.dataPage.dataList = self.dataPage.dataList.concat(data.list);
						}
						if(self.dataPage.dataList && self.dataPage.dataList.length > 0) {
							m.each(self.dataPage.dataList, function(index, item) {
								if(item) {
									item.titleInfo = item.checkSubject + "(" + item.checkCode + ")";
									item.rigtCount = "正常" + item.isRight + "条";
									item.errorCount = "异常" + item.isError + "条";
									if(item.checkedNum !== undefined && item.checkedNum !== null && item.checkedNum !== ''
										&& item.checkNumTotal !== undefined && item.checkNumTotal !== null && item.checkNumTotal !== '') {
										item.diffSum = (item.checkNumTotal > item.checkedNum ? (item.checkNumTotal - item.checkedNum) : (item.checkedNum - item.checkNumTotal));
									}else {
										item.diffSum = 0;
									}
								}
							});
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
			pullDownQuery: function(id) {
				var self = this;
				self.dataPage.pageNo = 1;
				self.doDataListQuery({
					"pageNo": self.dataPage.pageNo,
					"beginDate": self.dataPage.filterConditions.beginDate,
					"endDate": self.dataPage.filterConditions.endDate,
					"warehouseId": self.dataPage.filterConditions.warehouseId
				}, function() {
					m.toast("加载成功!");
					dataListPullRefresh.endPulldownToRefresh();
					dataListPullRefresh.scrollTo(0, 0, 100);
					if(self.dataPage.totalPage > 1) {
						dataListPullRefresh.refresh(true);
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
						"beginDate": self.dataPage.filterConditions.beginDate,
						"endDate": self.dataPage.filterConditions.endDate,
						"warehouseId": self.dataPage.filterConditions.warehouseId
					}, function() {
						dataListPullRefresh.endPullupToRefresh();
					});
				} else {
					dataListPullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						dataListPullRefresh.disablePullupToRefresh();
					}, 1500);
				}
			}
		}
	});

	function initHeight() {
		var windowHeight = $(window).height();
		$('body').height(windowHeight);
		$('#div_info_list').height(windowHeight - 90);
		$('#div_info_list .public-list').height(windowHeight - 100);
		$(window).resize(function() {
			var windowHeight = $(window).height();
			$('body').height(windowHeight);
			$('#div_info_list').height(windowHeight - 90);
			$('#div_info_list .public-list').height(windowHeight - 100);
		});
	}
	initHeight();
	mui('#div_info_list .public-list').scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	dataListPullRefresh = m('#div_info_list .public-list').pullRefresh({
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
});