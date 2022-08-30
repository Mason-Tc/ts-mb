define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("jquery");
	require("moment");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("layui");
	require("../../../js/common/common.js");

	var swaiting = null;
	var twaiting = null;
	var contentListPullRefresh = null;
	var movedPullRefresh = null;
	var layer = null;
	var slider = m("#slider").slider();
	var beginDate = moment().format('YYYY-MM-DD 00:00');
	var endDate = moment().format('YYYY-MM-DD 23:59');

	m('#contentList .public-list').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#warehouseScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#placesteelScrollDiv').scroll({
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

	m.init();

	var dtPicker1 = new m.DtPicker({
		"type": "date",
		"value": beginDate
	});
	var dtPicker2 = new m.DtPicker({
		"type": "date",
		"value": endDate
	});

	m.plusReady(function() {
		globalVue.contentPage.filterConditions.beginDate = beginDate;
		globalVue.contentPage.filterConditions.endDate = endDate;
		globalVue.getWarehouseConditions();
		globalVue.getPlacesteelList();
		globalVue.doListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"beginDate": globalVue.contentPage.filterConditions.beginDate,
			"endDate": globalVue.contentPage.filterConditions.endDate
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
			headTitle: '吊牌识别',
			totalInfo: '0件/0吨',
			placesteelList: [],
			conditions: {},
			selectedMtxs: {},
			contentPage: {
				contentList: [],
				pageSize: 10,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0, //总条数
				filterConditions: { // 筛选条件
					"signsCode": "", //吊牌任务号
					"warehouseId": "", //仓库ID
					"placesteelId": "", //产地ID
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
			pickBeginDate: function() {
				var self = this;
				dtPicker1.show(function(selectItems) {
					self.contentPage.filterConditions.beginDate = selectItems.value + " 00:00";
					$('.tap-time').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				})
			},
			pickEndDate: function() {
				var self = this;
				dtPicker2.show(function(selectItems) {
					self.contentPage.filterConditions.endDate = selectItems.value + " 23:59";
					$('.tap-time').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				})
			},
			getWarehouseConditions: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
					self.conditions = data;
				});
			},
			getPlacesteelList: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/sysBusinessBasis/materialConditions', function(data) {
					//alert(JSON.stringify(data));
					if(data) {
						self.placesteelList = data.placesteelList;
//						if(placesteelList && placesteelList.length > 0) {
//							for(var i = 0; i < placesteelList.length; i++) {
//								self.placesteelList.push({
//									"text": placesteelList[i].text,
//									"id": placesteelList[i].id
//								});
//							}
//						}
					}
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
					placesteelId = '';
				if(selectedObj.hasClass("warehouseA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
						Vue.delete(self.selectedMtxs, 0);
					} else {
						selectedObj.addClass('selectedTD');
						Vue.set(self.selectedMtxs, 0, {
							id: cpsId,
							name: selectedObj.text(),
							tagId: selectedObj.attr('id')
						});
					}
				} else if(selectedObj.hasClass("placesteelA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
						eval('delete globalVue.selectedMtxs.' + cpsId);
						Vue.delete(self.selectedMtxs, 1);
					} else {
						selectedObj.addClass('selectedTD');
						Vue.set(self.selectedMtxs, 1, {
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
							warehouseId = curId;
							selectedObj.addClass('selectedTD');
						} else {
							warehouseId = obj.attr('mtxId');
						}
					} else if(obj.hasClass("placesteelA")) {
						if(selectedObj.hasClass("placesteelA")) {
							obj.removeClass('selectedTD');
							placesteelId = curId;
							selectedObj.addClass('selectedTD');
						} else {
							placesteelId = obj.attr('mtxId');
						}
					}
				});
				self.contentPage.filterConditions.warehouseId = warehouseId;
				self.contentPage.filterConditions.placesteelId = placesteelId;
				if(app.debug)
					console.log('warehouseId=' + self.contentPage.filterConditions.warehouseId + ',placesteelId=' + self.contentPage.filterConditions.placesteelId);
			},
			removeSltMtx: function(evnet, type, id) {
				var selectedObj = $(event.currentTarget);
				var fireOnThis = document.getElementById(selectedObj.attr("tagId"));
				m.trigger(fireOnThis, 'tap');
			},
			/**
			 * 
			 * @param {Object} $event
			 * @param {Object} type 0:当天; 1:近7天;
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
					self.contentPage.filterConditions.beginDate = moment().format('YYYY-MM-DD 00:00');
					self.contentPage.filterConditions.endDate = moment().format('YYYY-MM-DD 23:59');
				} else if(type == 1) {
					self.contentPage.filterConditions.beginDate = moment().subtract(7, 'day').format('YYYY-MM-DD 00:00');
					self.contentPage.filterConditions.endDate = moment().format('YYYY-MM-DD 23:59');
				}
				dtPicker1 = new mui.DtPicker({
					"type": "date",
					"value": self.contentPage.filterConditions.beginDate
				});
				dtPicker2 = new mui.DtPicker({
					"type": "date",
					"value": self.contentPage.filterConditions.endDate
				});
			},
			resetFilter: function() {
				var self = this;
				self.contentPage.filterConditions.signsCode = '';
				self.contentPage.filterConditions.warehouseId = '';
				self.contentPage.filterConditions.placesteelId = '';
				self.contentPage.filterConditions.beginDate = beginDate;
				self.contentPage.filterConditions.endDate = endDate;
				self.selectedMtxs = {};
				$('.selectedTD').each(function() {
					var obj = $(this);
					obj.removeClass('selectedTD');
				});
			},
			complete: function() {
				var self = this;
				self.doListQuery({
					"pageNo": 1,
					"pageSize": 10,
					"signsCode": self.contentPage.filterConditions.signsCode, // 吊牌任务号
					"warehouseId": self.contentPage.filterConditions.warehouseId, //仓库ID
					"placesteelId": self.contentPage.filterConditions.placesteelId, //产地ID
					"beginDate": self.contentPage.filterConditions.beginDate, //开始时间
					"endDate": self.contentPage.filterConditions.endDate //结束时间
				}, function() {
					contentListPullRefresh.scrollTo(0, 0, 0);
				});
				self.hideOffCanvaQuery();
			},
			processListItem: function($event, status, id) {
				// status(0:编辑|2:详情)
				var self = this;
				event.stopPropagation();
				if(status == 0) {
					m.openWindow({
						id: 'tag-discern-edit',
						url: '../html/tag-discern-edit.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
							"keyId": isNotBlank(id) ? id : ''
						}
					});
				} else if(status == 2) {
					m.openWindow({
						id: 'tag-discern-detail',
						url: '../html/tag-discern-detail.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
							"keyId": id
						}
					});
				}
			},
			/*
			 * 获取吊牌登记列表
			 */
			doListQuery: function(params, callback) {
				var self = this;
				if(window.plus) {
					twaiting = plus.nativeUI.showWaiting('加载中...');
				}
				m.ajax(app.api_url + '/api/proSigns/list', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					//timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(twaiting) {
							twaiting.close();
						}
						if(app.debug) {
							console.log("doListQuery:" + JSON.stringify(data));
						}
						if(data.proSigns){
							var nTotal = isNotBlank(data.proSigns.numTotal) ? data.proSigns.numTotal : "0";
							var wTotal = isNotBlank(data.proSigns.weightTotal) ? data.proSigns.weightTotal : "0";
							
							self.totalInfo = nTotal + "件/" + wTotal + "吨";
						}else{
							self.totalInfo = "0件/0吨";
						}
						self.contentPage.pageNo = data.pageList.pageNo;
						self.contentPage.pageSize = data.pageList.pageSize;
						self.contentPage.totalListCount = data.pageList.count;
						self.contentPage.totalPage = data.pageList.totalPage;
						if(self.contentPage.pageNo == 1) {
							self.contentPage.contentList = data.pageList.list;
						} else {
							self.contentPage.contentList = self.contentPage.contentList.concat(data.pageList.list);
						}
						if(self.contentPage.contentList && self.contentPage.contentList.length > 0) {
							m.each(self.contentPage.contentList, function(index, item) {
								if(item) {
									item.numTotal = isNotBlank(item.numTotal) ? item.numTotal : "0";
									item.weightTotal = isNotBlank(item.weightTotal) ? item.weightTotal : "0";
									item.totalInfo = item.numTotal + "件/" + item.weightTotal + "吨";
								}
							});
						}
						if(typeof callback === "function") {
							callback();
						}
					},
					error: function(xhr, type, errorThrown) {
						if(twaiting) {
							twaiting.close();
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
				self.contentPage.pageNo = 1;
				//						self.contentPage.pageSize = 10;
				self.doListQuery({
					"pageNo": self.contentPage.pageNo,
					//							"pageSize": self.contentPage.pageSize,
					"signsCode": self.contentPage.filterConditions.signsCode, // 吊牌任务号
					"warehouseId": self.contentPage.filterConditions.warehouseId, //仓库ID
					"placesteelId": self.contentPage.filterConditions.placesteelId, //产地ID
					"beginDate": self.contentPage.filterConditions.beginDate, //开始时间
					"endDate": self.contentPage.filterConditions.endDate //结束时间
				}, function() {
					m.toast("加载成功!");
					contentListPullRefresh.endPulldownToRefresh();
					contentListPullRefresh.scrollTo(0, 0, 0);
					if(self.contentPage.totalPage > 1) {
						contentListPullRefresh.refresh(true);
					}
				});
			},
			/**
			 * 上拉查询
			 */
			pullUpQuery: function() {
				var self = this;
				if(self.contentPage.pageNo < self.contentPage.totalPage) {
					self.contentPage.pageNo++;
					self.doListQuery({
						"pageNo": self.contentPage.pageNo,
						"signsCode": self.contentPage.filterConditions.signsCode, // 吊牌任务号
						"warehouseId": self.contentPage.filterConditions.warehouseId, //仓库ID
						"placesteelId": self.contentPage.filterConditions.placesteelId, //产地ID
						"beginDate": self.contentPage.filterConditions.beginDate, //开始时间
						"endDate": self.contentPage.filterConditions.endDate //结束时间
					}, function() {
						contentListPullRefresh.endPullupToRefresh();
					});
				} else {
					contentListPullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						contentListPullRefresh.disablePullupToRefresh();
					}, 1500);
				}
			}
		}
	});

	contentListPullRefresh = m('#contentList .public-list').pullRefresh({
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

	document.addEventListener("refreshTagDiscernList", function(e) {
		globalVue.doListQuery({
			"pageNo": 1,
			"pageSize": 10,
			"signsCode": globalVue.contentPage.filterConditions.signsCode, // 吊牌任务号
			"warehouseId": globalVue.contentPage.filterConditions.warehouseId, //仓库ID
			"placesteelId": globalVue.contentPage.filterConditions.placesteelId, //产地ID
			"beginDate": globalVue.contentPage.filterConditions.beginDate, //开始时间
			"endDate": globalVue.contentPage.filterConditions.endDate //结束时间
		}, function() {
			contentListPullRefresh.scrollTo(0, 0, 0);
			contentListPullRefresh.refresh(true);
		});
	}, false);
});