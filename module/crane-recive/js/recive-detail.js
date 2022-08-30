define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	

	var swaiting = null;
	var twaiting = null;
	var dataPullRefresh = null;
	

	
	slider.setStopped(true); //禁止滑动
	
	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.doDetailQuery(ws.id);
		
		var backDefault = m.back;
		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			if(twaiting) {
				twaiting.close();
			}
			
		}
		m.back = detailBack;
	});

	var globalVue = new Vue({
		el: '#off-canvas',
		data: {
			id: ""
			
		},
		methods: {
			doDetailQuery: function(id) {
				var self = this;
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('处理中...');
				}
				m.ajax(app.api_url + '/craneApi/recive/detail?_t=' + new Date().getTime(), {
					data: {id:id},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 5000, //超时时间设置为60秒； 
					success: function(res) {
						if(swaiting) {
							swaiting.close();
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
			saveRecive:function(){
				var self = this;
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('处理中...');
				}
				m.ajax(app.api_url + '/craneApi/recive/save?_t=' + new Date().getTime(), {
					data: {id:id},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 5000, //超时时间设置为60秒； 
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						
						
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			}
			
		}
	});

});