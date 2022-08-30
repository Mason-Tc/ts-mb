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
					globalVue.getDeviceList();
				},
				getDeviceList:function(){
					swaiting = plus.nativeUI.showWaiting('请稍候...');
					m.ajax(app.api_url + '/api/rowcar/getCraneList?_t=' + new Date().getTime(), {
						data: {warehouseId:globalVue.dataPage.filterConditions.warehouseId,},
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
									let idp=dl[i].id+'position';
									let idh=dl[i].id+'hang';
									// 定位状态
									document.getElementById(idp).addEventListener("click",function(event){
										  if($("#"+idp).hasClass('mui-active')){
											 //$("#"+idp).removeClass('mui-active')
											//console.log("你关闭了开关"); 
											 globalVue.dataPage.dataList[i].status=0;
										  }else{
											 //$("#"+idp).addClass('mui-active')
											 globalVue.dataPage.dataList[i].status=1;
											//console.log("你启动了开关");
										  }
										  globalVue.toHandle(globalVue.dataPage.dataList[i]);
										  
									});
									// 吊镑状态
									document.getElementById(idh).addEventListener("click",function(event){
										  if($("#"+idh).hasClass('mui-active')){
											 //$("#"+idh).removeClass('mui-active')
											//console.log("你关闭了开关");  
											 globalVue.dataPage.dataList[i].relStatus=0;
										  }else{
											 //$("#"+idh).addClass('mui-active')
											//console.log("你启动了开关");
											 globalVue.dataPage.dataList[i].relStatus=1;
										  }
										  globalVue.toHandle(globalVue.dataPage.dataList[i]);
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
				// 处理告警
				toHandle:function(item){
					swaiting = plus.nativeUI.showWaiting('处理中...');
					m.ajax(app.api_url + '/api/rowcar/saveCraneInfo?_t=' + new Date().getTime(), {
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
		globalVue.getDeviceList();
	});

	
});