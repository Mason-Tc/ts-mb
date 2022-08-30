define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("zepto");
	require("layui");
	
	var layer;
	layui.use(['layer'], function() {
		layer  = layui.layer;
	});
	
	m.plusReady(function() {
		var swaiting = null;
		var waiting;
		var aboutVue = new Vue({
			el: '#guidance-screen-manage',
			data: {
				platformList: [],
				warehouseId: app.getUser().warehouse.id //仓库ID
		
			},
			methods: {
				resetScreen: function(platformName) { // 重置诱导屏
				
					let contentHtml = '<div style="height:120px;margin:40px 100px;line-height:30px;'+
					'text-align:center;font-size:16px;">' + '请确认是否重置，重置后将变成作业完成状态！' + '</div>';
						layer.open({
							type: 1,
							shade: 0.3,
							title: "提示",
							area:['400','150'],
							content: contentHtml,
							btn: ['取 消','确 定'],
							cancel: function(index) {
								return true;
							},
							// 取消按钮
							btn1:function(index, layero){
								layer.close(index);
							},
							// 确定按钮
							btn2: function(index) {
								debugger
								swaiting = plus.nativeUI.showWaiting('处理中...');
								
								m.ajax(app.api_url + '/api/rowcar/resetPlatformScreen?_t=' + new Date().getTime(), {
									data:{
										platformName: platformName
									},
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									timeout: 10000, //超时时间设置为60秒
									success: function(res) {
										if(swaiting) {
											swaiting.close();
										}
										layer.msg(res.msg);
										if(res.status){

										}
									},
									error: function(xhr, type, errorThrown) {
										if(swaiting) {
											swaiting.close();
										}
										layer.msg("网络异常，请重新试试");
									}
								});
					
							}
						});	
					
				},
				getPlatformList: function() {
					swaiting = plus.nativeUI.showWaiting('加载中...');
					
					var self=this;
					m.ajax(app.api_url + '/api/rowcar/getPlatformList?_t=' + new Date().getTime(), {
						data: {"warehouseId": self.warehouseId},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						success: function(res) {
							debugger
							if(swaiting) {
								swaiting.close();
							}
							self.platformList=res;
						},
						error: function(xhr, type, errorThrown) {
							if(swaiting) {
								swaiting.close();
							}
							layer.msg("网络异常，请重新试试");
						}
					});
					
					
				}
				
				
				
			}
		});
		
		aboutVue.getPlatformList();
	
		
	});
	

		
	
});
