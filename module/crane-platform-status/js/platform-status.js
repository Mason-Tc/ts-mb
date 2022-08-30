define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("layui");
	var layer = null;
	layui.use(['layer'], function() {
		layer = layui.layer;
	});
	var $ = require("zepto");
	require("../../../js/common/common.js");

	m.init();

	m.plusReady(function() {
		var swaiting = null;
		
		var globalVue = new Vue({
			el: '#off-canvas',
			data: {
				warehouseList: [],
				dataPage: {
					dataList: [],
					filterConditions: { // 筛选条件
						"warehouseId": app.getUser().warehouse.id //仓库ID
					}
				}
			},
			methods: {
				complete:function(){
					globalVue.getPlatUpdateList();
				},
				getPlatUpdateList:function(){
					swaiting = plus.nativeUI.showWaiting('请稍候...');
					m.ajax(app.api_url + '/api/rowcar/getPlatUpdateList?_t=' + new Date().getTime(), {
						data: {warehouseId:globalVue.dataPage.filterConditions.warehouseId},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						success: function(res) {
							if(swaiting) {
								swaiting.close();
							}
							globalVue.dataPage.dataList=res;
							setTimeout(function(){
								let dl=globalVue.dataPage.dataList;
								for(let i=0;i<dl.length;i++){
									globalVue.dataPage.dataList[i].createBy='';
									globalVue.dataPage.dataList[i].updateBy='';
									let callId=dl[i].id+'isOpenCall';
									let cameraId=dl[i].id+'cameraId';
									// 叫号状态
									document.getElementById(callId).addEventListener("click",function(event){
										  if($("#"+callId).hasClass('mui-active')){
											 //$("#"+callId).removeClass('mui-active')
											//console.log("你关闭了开关"); 
											 globalVue.dataPage.dataList[i].isOpenCall=0;
										  }else{
											 //$("#"+callId).addClass('mui-active')
											 globalVue.dataPage.dataList[i].isOpenCall=1;
											//console.log("你启动了开关");
										  }
										  globalVue.setPlatCallStatus(globalVue.dataPage.dataList[i]);
										  
									});
									// 相机状态
									document.getElementById(cameraId).addEventListener("click",function(event){
										  if($("#"+cameraId).hasClass('mui-active')){
											 //$("#"+cameraId).removeClass('mui-active')
											 globalVue.dataPage.dataList[i].status=0;
										  }else{
											// $("#"+cameraId).addClass('mui-active')
											 globalVue.dataPage.dataList[i].status=1;
										  }
										globalVue.setPlatCameraStatus(globalVue.dataPage.dataList[i]);
									})
								}
							},2000)
						},
						error: function(xhr, type, errorThrown) {
							if(swaiting) {
								swaiting.close();
							}
							m.toast("网络异常，请重新试试");
						}
					})
				},
				getWarehouseConditions: function() {
					var self = this;
					//获取基础数据 品名 材质 规格 产地
					m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
						self.warehouseList = data.warehouseList;
					});
				},
				// 设置 月台相机 启用停用状态 
				setPlatCameraStatus:function(item){
					swaiting = plus.nativeUI.showWaiting('处理中...');
					m.ajax(app.api_url + '/api/rowcar/setPlatCameraStatus?_t=' + new Date().getTime(), {
						data: item,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						success: function(res) {
							if(swaiting) {
								swaiting.close();
							}
							layer.msg(res.msg);
						},
						error: function(xhr, type, errorThrown) {
							if(swaiting) {
								swaiting.close();
							}
							layer.msg("网络异常，请重新试试")
							//m.toast("网络异常，请重新试试");
						}
					})
				},
				// 设置 月台叫号 启用停用状态 
				setPlatCallStatus:function(item){
					m.ajax(app.api_url + '/api/rowcar/setPlatCallStatus?_t=' + new Date().getTime(), {
						data: item,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						success: function(res) {
							if(swaiting) {
								swaiting.close();
							}
							layer.msg(res.msg);
						},
						error: function(xhr, type, errorThrown) {
							if(swaiting) {
								swaiting.close();
							}
							layer.msg("网络异常，请重新试试")
							//m.toast("网络异常，请重新试试");
						}
					})
				}
				
			}
		});
		
		globalVue.getWarehouseConditions();
		globalVue.getPlatUpdateList();
	});


});