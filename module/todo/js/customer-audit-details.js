define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("../../../js/common/common.js");

	var listView = null;
	var ws = null;
	var swaiting = null;
	var twaiting = null;

	m.init();

	m(".select-box .content").scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		//		indicators: false
	});

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		detailVue.materialOrCustomerBakItem = ws.materialOrCustomerBakItem;
		//		alert(JSON.stringify(detailVue.materialOrCustomerBakItem));
		detailVue.initShow();

		listView = plus.webview.getWebviewById('todo-list');

		var backDefault = m.back;

		function detailBack() {
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

	var detailVue = new Vue({
		el: '#body_details',
		data: {
			key: '',
			businessType: '',
			processType: '', //操作类型 1：新增; 2：变更;
			title: '审核详情',
			processText: '',
			auditInfo: '',
			materialOrCustomerBakItem: [],
			dataItem: []
		},
		methods: {
			initShow: function() {
				var self = this;
				self.key = self.materialOrCustomerBakItem ? self.materialOrCustomerBakItem.id : '';
				self.businessType = self.materialOrCustomerBakItem ? self.materialOrCustomerBakItem.businessType : '';
				self.title = '审核详情' + ((self.materialOrCustomerBakItem && self.materialOrCustomerBakItem.auditCode) ? ("(" + self.materialOrCustomerBakItem.auditCode + ")") : '');
				self.processText = (self.materialOrCustomerBakItem && self.materialOrCustomerBakItem.auditTitle) ? self.materialOrCustomerBakItem.auditTitle : '';
				self.processType = !isNotBlank(self.materialOrCustomerBakItem.updateDesc) ? '1' : '2';
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('处理中...');
				}
				m.ajax(app.api_url + '/api/sys/MaterialOrCustomerBak/detail?_t=' + new Date().getTime(), {
					data: {
						id: self.key,
						businessType: self.businessType
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 60000, //超时时间设置为60秒； 
					success: function(data) {
						if(swaiting) {
							swaiting.close();
						}
						if(app.debug) {
							console.log("customerBakData:" + JSON.stringify(data));
						}
						if(data.msg) {
							alert(data.msg);
						} else {
							self.dataItem = data.sysCustomerBak;
							self.auditInfo = !self.dataItem ? '' : self.dataItem.auditInfo;
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
			edit: function(auditStatus) {
				var self = this;
				if(window.plus) {
					twaiting = plus.nativeUI.showWaiting('处理中...');
				}
				m.ajax(app.api_url + '/api/sys/MaterialOrCustomerBak/submit?_t=' + new Date().getTime(), {
					data: {
						id: self.key,
						businessType: self.businessType,
						auditStatus: auditStatus,
						auditInfo: self.auditInfo
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 60000, //超时时间设置为60秒； 
					success: function(data) {
						if(twaiting) {
							twaiting.close();
						}
						if(app.debug) {
							console.log("edit customerBakData:" + JSON.stringify(data));
						}
						if(!data.status) {
							alert(data.msg);
						} else {
							m.fire(listView, "refreshDataList");
							m.back();
						}
					},
					error: function(xhr, type, errorThrown) {
						if(twaiting) {
							twaiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			}
		}
	});

});