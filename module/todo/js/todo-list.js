define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("jquery");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("moment");
	require("layui");
//	require("../../../js/x2js/xml2json.js");
	require("../../../js/common/common.js");

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

	// 右侧查询框
	var offCanvasQuery = m("#off-canvas").offCanvas();
	var mask = m.createMask(function() {
		if(offCanvasQuery.isShown("right")) {
			offCanvasQuery.close();
			$('#searchVue').hide();
			mask.close();
		}
	}, 'contentDiv');

	slider.setStopped(true); //禁止滑动
	layui.use(['layer'], function() {
		layer = layui.layer;
	});
	
//	var x2js = new X2JS({
//  	attributePrefix : "$"
//	});

	m.init();

	m.plusReady(function() {
//		globalVue.testXML();
		globalVue.dataPage.filterConditions.beginDate = beginDate;
		globalVue.dataPage.filterConditions.endDate = endDate;
		globalVue.getWarehouseConditions();
		globalVue.doDataListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"beginDate": globalVue.dataPage.filterConditions.beginDate,
			"endDate": globalVue.dataPage.filterConditions.endDate
		});

		var backDefault = m.back;

		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			if(twaiting) {
				twaiting.close();
			}
			if(offCanvasQuery.isShown("right")) {
				globalVue.hideOffCanvaQuery();
			} else
				backDefault();
		}
		m.back = detailBack;
	});

	var globalVue = new Vue({
		el: '#off-canvas',
		data: {
			headTitle: '个人待办',
			conditions: {},
			selectedMtxs: {},
			warehouseList: [],
			dataPage: {
				dataList: [],
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0, //总条数
				filterConditions: { // 筛选条件
					"auditCode": "", //单据号
					"businessType": "", //业务类型  1物料审核，2客户审核
					"warehouseId": "", //仓库ID
					"beginDate": "", //开始时间
					"endDate": "" //结束时间
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
			getWarehouseConditions: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
					self.conditions = data;
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
//			testXML: function() {
//				var self = this;
//				m.ajax('../test.xml', {
//					data: {},
//					dataType: 'xml', //服务器返回xml格式数据
//					type: 'get', //HTTP请求类型
//					timeout: 60000, //超时时间设置为60秒； 
//					success: function(data) {
//      				var jsonObj = x2js.xml2json(data);
//						alert(JSON.stringify(jsonObj));
//					},
//					error: function(xhr, type, errorThrown) {
//						m.toast("网络异常，请重新试试");
//					}
//				});
//			},
			/**
			 * 
			 * @param {Object} $event
			 * @param {Object} type 0:当天; 1:近3天; 2:近一周;
			 */
			selectDate: function($event, type) {
				var self = this;
				var selectedObj = $(event.currentTarget);
				$('.tap-time').each(function() {
					var obj = $(this);
					obj.removeClass('time-selected');
				});
				selectedObj.addClass('time-selected');
				if(type == 0) {
					self.dataPage.filterConditions.beginDate = moment().format('YYYY-MM-DD 00:00');
					self.dataPage.filterConditions.endDate = moment().format('YYYY-MM-DD 23:59');
				} else if(type == 1) {
					self.dataPage.filterConditions.beginDate = moment().subtract(3, 'day').format('YYYY-MM-DD 00:00');
					self.dataPage.filterConditions.endDate = moment().format('YYYY-MM-DD 23:59');
				} else if(type == 2) {
					self.dataPage.filterConditions.beginDate = moment().subtract(7, 'day').format('YYYY-MM-DD 00:00');
					self.dataPage.filterConditions.endDate = moment().format('YYYY-MM-DD 23:59');
				}
				dtPicker1 = new mui.DtPicker({
					"type": "datetime",
					"value": self.dataPage.filterConditions.beginDate
				});
				dtPicker2 = new mui.DtPicker({
					"type": "datetime",
					"value": self.dataPage.filterConditions.endDate
				});
			},
			changeBusinessType: function(evt) {
				var self = this;
				var selectedObj;
				if(evt != null) {
					selectedObj = $(evt.currentTarget);
				} else {
					selectedObj = $(null);
				}
				var businessTypes = [];
				if(selectedObj.hasClass('business-selected')) {
					selectedObj.removeClass('business-selected');
				} else {
					selectedObj.addClass('business-selected');
				}
				$('.business-selected').each(function() {
					var obj = $(this);
					businessTypes.push(obj.attr('businesstype'));
				});
				self.dataPage.filterConditions.businessType = businessTypes ? businessTypes.join(',') : '';
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
				var warehouseIds = [];
				if(selectedObj.hasClass("warehouseA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
						//						eval('delete globalVue.selectedMtxs.' + cpsId);
						//						Vue.delete(self.selectedMtxs, 0);
					} else {
						selectedObj.addClass('selectedTD');
						//						Vue.set(self.selectedMtxs, 0, {
						//							id: cpsId,
						//							name: selectedObj.text(),
						//							tagId: selectedObj.attr('id')
						//						});
					}
				} else {}
				$('.selectedTD').each(function() {
					var obj = $(this);
					if(obj.hasClass("warehouseA")) {
						warehouseIds.push(obj.attr('mtxId'));
					}
				});
				self.dataPage.filterConditions.warehouseId = warehouseIds ? warehouseIds.join(',') : '';
				console.log('warehouseIds=' + self.dataPage.filterConditions.warehouseId);
			},
			removeSltMtx: function(evnet, type, id) {
				var selectedObj = $(event.currentTarget);
				var fireOnThis = document.getElementById(selectedObj.attr("tagId"));
				m.trigger(fireOnThis, 'tap');
			},
			resetFilter: function() {
				var self = this;
				self.dataPage.filterConditions.auditCode = '';
				self.dataPage.filterConditions.businessType = '';
				self.dataPage.filterConditions.warehouseId = '';
				self.dataPage.filterConditions.beginDate = beginDate;
				self.dataPage.filterConditions.endDate = endDate;
				self.selectedMtxs = {};
				self.selectDate(null, 1);
				$('#td_three_day').addClass('time-selected');
				$('.selectedTD').each(function() {
					var obj = $(this);
					obj.removeClass('selectedTD');
				});
				$('.business-selected').each(function() {
					var obj = $(this);
					obj.removeClass('business-selected');
				});
			},
			complete: function() {
				var self = this;
				self.doDataListQuery({
					"pageNo": 1,
					"pageSize": 10,
					"businessType": self.dataPage.filterConditions.businessType,
					"auditCode": self.dataPage.filterConditions.auditCode,
					"warehouseIds": self.dataPage.filterConditions.warehouseId,
					"beginDate": self.dataPage.filterConditions.beginDate,
					"endDate": self.dataPage.filterConditions.endDate
				}, function() {
					dataPullRefresh.scrollTo(0, 0, 0);
				});
				self.hideOffCanvaQuery();
			},
			openEditHTML: function(item) {
				var self = this;
				var pageId = 'customer-audit-details';
				var pageUrl = '../html/customer-audit-details.html';
				if(item.businessType == '1') {
					pageId = 'material-audit-details';
					pageUrl = '../html/material-audit-details.html';
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
						"materialOrCustomerBakItem": item
					}
				});
			},
			doDataListQuery: function(params, callback) {
				var self = this;
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('处理中...');
				}
				m.ajax(app.api_url + '/api/sys/MaterialOrCustomerBak/list?_t=' + new Date().getTime(), {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 60000, //超时时间设置为60秒； 
					success: function(data) {
						if(swaiting) {
							swaiting.close();
						}
						if(app.debug) {
							console.log("doDataListQuery:" + JSON.stringify(data));
						}
						self.dataPage.pageNo = data.list.pageNo;
						self.dataPage.pageSize = data.list.pageSize;
						self.dataPage.totalListCount = data.list.count;
						self.dataPage.totalPage = data.list.totalPage;
						if(self.dataPage.pageNo == 1) {
							self.dataPage.dataList = data.list.list;
						} else {
							self.dataPage.dataList = self.dataPage.dataList.concat(data.list.list);
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
					//							"pageSize": self.dataPage.pageSize,
					"businessType": self.dataPage.filterConditions.businessType,
					"auditCode": self.dataPage.filterConditions.auditCode,
					"warehouseIds": self.dataPage.filterConditions.warehouseId,
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
						"businessType": self.dataPage.filterConditions.businessType,
						"auditCode": self.dataPage.filterConditions.auditCode,
						"warehouseIds": self.dataPage.filterConditions.warehouseId,
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

	document.addEventListener("refreshDataList", function(e) {
		globalVue.doDataListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"businessType": globalVue.dataPage.filterConditions.businessType,
			"auditCode": globalVue.dataPage.filterConditions.auditCode,
			"warehouseIds": globalVue.dataPage.filterConditions.warehouseId,
			"beginDate": globalVue.dataPage.filterConditions.beginDate,
			"endDate": globalVue.dataPage.filterConditions.endDate
		}, function() {
			dataPullRefresh.scrollTo(0, 0, 0);
			dataPullRefresh.refresh(true);
		});
	}, false);
});