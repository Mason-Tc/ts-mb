define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("moment");
	require("layui");
	require("../../../js/common/common.js");

	var ws = null;
	var waiting = null;
	var swaiting = null;
	var twaiting = null;
	
	m('#div_material_list .public-list').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	var slider = m("#slider").slider();
	slider.setStopped(true); //禁止滑动

	var layer = null;
	layui.use(['layer'], function() {
		layer = layui.layer;
	});
	
	var materialListPullRefresh = null;

	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		detailVue.keyId = ws.keyId;
		detailVue.initShow();

		var backDefault = m.back;

		function detailBack() {
			if(waiting) {
				waiting.close();
			}
			if(swaiting) {
				swaiting.close();
			}
			if(twaiting) {
				twaiting.close();
			}
			backDefault();
		}
		m.back = detailBack;

		//设置footer绝对位置
		document.getElementById('nav_footer').style.top = (plus.display.resolutionHeight - 45) + "px";
	});

	m.ready(function() {
//		materialListHight = $('#div_basic_info').height();
	});

	var detailVue = new Vue({
		el: '#body_content',
		data: {
			keyId: '', //主键(列表页带入)
			titleStr: '识别详情',
			totalStr: '',
			signsDate: '', // 时间
			warehouseName: '',
			placesteelName: '',
			brandName: '',
			ownerName: '',
			transportNo: '', // 车船号
			createBy: '', //制单人
			remarks: '', //备注
			numTotal: '0',
			weightTotal: '0',
			currPageSize: 0,
			detailPage: {
				materialList: [], //物料信息List
				pageSize: 50,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0 //总条数
			}
		},
		methods: {
			initShow: function(callback) {
				var self = this;
				if(window.plus) {
					waiting = plus.nativeUI.showWaiting('加载中...');
				}
				var apiUrl = app.api_url + '/api/proSigns/detail?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: self.keyId,
						pageNo: self.detailPage.pageNo,
						pageSize: self.detailPage.pageSize
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 20000, //超时时间设置为10秒；
					success: function(data) {
						if(waiting) {
							waiting.close();
						}
						if(app.debug) {
							console.log("initShow:" + JSON.stringify(data));
						}
						if(data) {
							self.warehouseName = isNotBlank(data.warehouseName) ? data.warehouseName : "";
							self.signsDate = isNotBlank(data.signsDate) ? data.signsDate : nowDate;
							self.createBy = !data.createBy ? "" : isNotBlank(data.createBy.userName) ? data.createBy.userName : "";
							self.brandName = isNotBlank(data.brandName) ? data.brandName : "";
							self.placesteelName = isNotBlank(data.placesteelName) ? data.placesteelName : "";
							self.ownerName = isNotBlank(data.ownerName) ? data.ownerName : "";
							self.transportNo = isNotBlank(data.transportNo) ? data.transportNo : "";
							self.remarks = isNotBlank(data.remarks) ? data.remarks : "";
							self.warehouseName = isNotBlank(data.warehouseName) ? data.warehouseName : "";
							self.numTotal = isNotBlank(data.numTotal) ? data.numTotal : "0";
							self.weightTotal = isNotBlank(data.weightTotal) ? data.weightTotal : "0";
							self.totalStr = "(" + self.numTotal + "件/" + self.weightTotal + "吨)";
							if(data.detailPage) {
								self.detailPage.pageNo = data.detailPage.pageNo;
								self.detailPage.pageSize = data.detailPage.pageSize;
								self.detailPage.totalListCount = data.detailPage.count;
								self.detailPage.totalPage = data.detailPage.totalPage;
								if(self.detailPage.pageNo == 1) {
									self.detailPage.materialList = data.detailPage.list;
								} else {
									self.detailPage.materialList = self.detailPage.materialList.concat(data.detailPage.list);
								}
								self.currPageSize = self.detailPage.pageNo * self.detailPage.pageSize;
								if(self.detailPage.materialList && self.detailPage.materialList.length > 0) {
									m.each(self.detailPage.materialList, function(index, item) {
										if(item) {
											item.signsInfo = (isNotBlank(item.num) ? item.num : '0') + "件/" + (isNotBlank(item.weight) ? item.weight : '0') + "吨";
										}
									});
								}
							}
						}
						if(typeof callback === "function") {
							callback();
						}
					},
					error: function(xhr, type, errorThrown) {
						if(waiting) {
							waiting.close();
						}
						if(app.debug) {
							console.log(xhr + "|" + type + "|" + errorThrown);
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
				self.detailPage.pageNo = 1;
				self.initShow(function() {
					m.toast("加载成功!");
					materialListPullRefresh.endPulldownToRefresh();
					materialListPullRefresh.scrollTo(0, 0, 100);
					if(self.detailPage.totalPage > 1) {
						materialListPullRefresh.refresh(true);
					}
				});
			},
			/**
			 * 上拉查询
			 */
			pullUpQuery: function() {
				var self = this;
				if(self.detailPage.pageNo < self.detailPage.totalPage) {
					self.detailPage.pageNo++;
					self.initShow(function() {
						materialListPullRefresh.endPullupToRefresh();
					});
				} else {
					materialListPullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						materialListPullRefresh.disablePullupToRefresh();
					}, 1500);
				}
			},
			close: function() {
				ws.close();
			}
		}
	});

	materialListPullRefresh = m('#div_material_list').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				detailVue.pullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			contentnomore: '没有更多数据了',
			callback: function() {
				detailVue.pullUpQuery();
			}
		}
	});
});