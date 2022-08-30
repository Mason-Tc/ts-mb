define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("zepto");
	require("mui-picker");
	require("mui-poppicker");
	
	m.init();
	require("layui");
	var layer;
	layui.use(['layer'], function() {
		layer  = layui.layer;
	});
	var picker = new mui.PopPicker();
	
	var backDefault;
	var swaiting = null;
	var ws=null;
	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		aboutVue.proReceiving=ws.proReceiving;
		aboutVue.detailList=aboutVue.proReceiving.detailList;
		
		aboutVue.getWarehouseConditions();
		
		// 重写返回功能
		backDefault = m.back;
		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			// 取消作业
			aboutVue.cancelOutsideReceiving();
			// 刷新列表
			let target = plus.webview.getWebviewById('outsideenter-list');
			target.reload(true);
			
			backDefault();
		}
		m.back = detailBack;
	})
	
	var aboutVue = new Vue({
		el: '#off-canvas',
		data: { 
			proReceiving:{},
			warehouseList:[],
			detailList:[]
		},
		methods:{
			// 出库作业完成确认
			sendConfirmComplete:function(){
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/outsideReceiveComplete?_t=' + new Date().getTime(), {
					data:{
						taskId:aboutVue.proReceiving.taskId,
						jsonData:JSON.stringify(aboutVue.detailList)
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
							// 刷新列表
							let target = plus.webview.getWebviewById('outsideenter-list');
							target.reload(true);
							backDefault();
						}
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg("网络异常，请重新试试");
					}
				});
			},
			toCancelOutsideReceiving:function(){
				m.back();
			},
			// 取消作业
			cancelOutsideReceiving:function(){
				m.ajax(app.api_url + '/api/rowcar/cancelOutsideReceiving?_t=' + new Date().getTime(), {
					data:{
						taskId:aboutVue.proReceiving.taskId,
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						//backDefault();
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg("网络异常，请重新试试");
					}
				}); 
			},
			selectSub:function(item){
				picker.show(function (selectItems) {
					item.subPlaceName=selectItems[0].text;
					item.subPlaceId=selectItems[0].id;
				})
			},
			getWarehouseConditions: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/sysBusinessBasis/subPlaceInfos', function(data) {
					self.warehouseList = data;
					picker.setData(data);
				});
			},
			// 起吊数量增1
			toAddNum:function(item){
				let v1=item.realNum;
				if(v1&&v1>0){
					item.realNum=parseInt(v1)+1;
				}else{
					item.realNum=1;
				}
			},
			// 起吊数量减一 
			toMinusNum:function(item){
				let v1=item.realNum;
				if(v1&&v1>0){
					item.realNum=parseInt(v1)-1;
				}
			}
		}
	});
	
});
	