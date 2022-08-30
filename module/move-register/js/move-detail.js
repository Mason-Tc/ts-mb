define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("../../../js/common/common.js");

	m.init();
	var ws = null;
	var waiting = null;
	m('#div_basic_info_scroll').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	m('#div_cost_scroll').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	var slider = m("#slider").slider();
	slider.setStopped(true); //禁止滑动

	m.plusReady(function() {
		if(window.plus) {
			waiting = plus.nativeUI.showWaiting('加载中...');
		}
		var ws = plus.webview.currentWebview();
		detailVue.moveKey = ws.moveKey;
		detailVue.initShow();

		var backDefault = m.back;

		function detailBack() {
			if(waiting) {
				waiting.close();
			}
			backDefault();
		}
		m.back = detailBack;
	});

	var detailVue = new Vue({
		el: '#div_detail',
		data: {
			moveKey: '',
			moveCodeStr: '',
			contractFit: '',
			detailsInfo: [],
			accountDueDetailList: [],
			materielList: []
		},
		methods: {
			initShow: function() {
				var self = this;
				var apiUrl = app.api_url + '/api/proMoveApi/detail?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: self.moveKey
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 20000, //超时时间设置为10秒；
					success: function(data) {
						if(waiting) {
							waiting.close();
						}
						//						if(app.debug) {
						//							console.log(JSON.stringify(data));
						//						}
						if(data) {
							self.detailsInfo = data.proMove;
							if(self.detailsInfo) {
								self.moveCodeStr = "移库详情(" + self.detailsInfo.moveCode + ")";
								self.contractFit = self.detailsInfo.contractFit;
								self.accountDueDetailList = self.detailsInfo.accountDueDetailList;
								if(app.debug) {
									console.log(JSON.stringify(self.accountDueDetailList));
								}
								if(self.accountDueDetailList && self.accountDueDetailList.length > 0) {
									m.each(self.accountDueDetailList, function(index, itm) {
										if(itm) {
											itm.spenderName = self.detailsInfo.spenderName;
										}
									});
								}
							}
							self.materielList = data.moveList;
							if(app.debug) {
								console.log(JSON.stringify(self.materielList));
							}
							if(self.materielList && self.materielList.length > 0) {
								m.each(self.materielList, function(index, item) {
									if(item) {
										var warehouseInfo = "";
										if(item.newWarehousePlace && item.storeyNo) {
											warehouseInfo = item.newWarehousePlace + "/" + item.storeyNo;
										} else if(item.newWarehousePlace && !item.storeyNo) {
											warehouseInfo = item.newWarehousePlace;
										} else if(!item.newWarehousePlace && item.storeyNo) {
											warehouseInfo = item.storeyNo;
										} else if(!item.newWarehousePlace && !item.storeyNo) {
											warehouseInfo = "";
										}
										item.warehouseInfo = warehouseInfo;
										item.moveInfo = (item.moveNum ? item.moveNum : '0') + item.moveNumUnitDesc + "/" + (item.moveWeight ? item.moveWeight : '0') + item.moveWeightUnitDesc;
									}
								});
							}
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
			onItemSliderClick: function($event, index) {
				var self = this;
				event.stopPropagation();
				slider.gotoItem(index);
			},
			close: function() {
				m.back();
			}
		}
	});

});