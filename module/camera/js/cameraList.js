define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var j = require("jquery");
	require("moment");
	var ztcamera = require("./ztcamera.js");
	require("../../../js/common/common.js");
	var $ = require("zepto");
	m.init();


	var cameraListVue = new Vue({
		el: '#app',
		data: {
			currIndex: 0,
			warehouseId: '',
			partitionId:'',//当前区域id
			whsList: [],
			cameraList: []
		},
		computed:{
			curPartitionList:function(){
				var list = [];
				for(var i = 0;i< this.whsList.length;i++){
					var whs = this.whsList[i];
					if(this.warehouseId == whs.id){
						return whs.partitionList;
					}
				}
				return list;
			},
			onLineCount:function(){
				var onLinesCount = 0;
				this.cameraList.forEach(item=>{
					if (item.onLineStatus == '1'){
						onLinesCount++;
					}
				}); 
				return onLinesCount;
			},
			cameraCountShow:function(){
				return this.onLinesCount + '/' + this.cameraList.length;
			}
		},
		methods: {
		
			
			initList:function () {
				
				var self = this;
				m.ajax(app.api_url + '/api/camera/warehousePartition/list', {
					data: {},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
							
							if(data.length > 0){
								data.forEach(w=>{
									w.selected = false;
									w.partitionList.forEach(p=>{
										p.selected = false;
									});
								});
								data[0].selected = true;
								data[0].partitionList[0].selected = true;
								self.warehouseId = data[0].id;
								self.partitionId = data[0].partitionList[0].id;
							}
							self.whsList = data;
							self.getCameraList2(self.warehouseId,self.partitionId);
					},
					error: function(xhr, type, errorThrown) {
						debugger;
						if (app.debug) {
							console.log(xhr + "|" + type + "|" + errorThrown);
						}
						//						m.toast("网络异常，请重新试试");
					}
				});
				
			},
		
			getCameraList3:function(partitionId){
				this.getCameraList2(this.warehouseId,partitionId);
			},
			getCameraList2:function(warehouseId,partitionId){
				
				if(partitionId === '4') {
					$('#div_av_short_list').hide();
					$('#div_av_list').hide();
					$('#div_av_middle_list').show();
				}else if(partitionId === '5') {
					$('#div_av_short_list').hide();
					$('#div_av_middle_list').hide();
					$('#div_av_list').show();
				}else {
					$('#div_av_middle_list').hide();
					$('#div_av_list').hide();
					$('#div_av_short_list').show();
				}
				
				this.warehouseId = warehouseId;
				this.partitionId = partitionId;
				
				this.whsList.forEach(w=>{
					w.selected = false;
					if(w.id == warehouseId){
						w.selected = true;
					}
					w.partitionList.forEach(p=>{
						p.selected = false;
						if(p.id == partitionId  ){
							p.selected = true;
						}
					});
				});
				var waiting = plus.nativeUI.showWaiting();
				var params = {
					'warehouseId':warehouseId,
					'partitionId':partitionId
				};
				var self = this;
				var apiUrl = app.api_url + '/api/camera/userCamera/list';
				m.ajax(apiUrl, {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						
						if (waiting) {
							waiting.close();
						}
						
						 var desc = function(x, y) {
							if (x.onLineStatus < y.onLineStatus) {
								return 1;
							} else if (x.onLineStatus > y.onLineStatus) {
								return -1;
							} else {
								return 0;
							}
						}
						data = data.sort(desc);						
						data.forEach(item=>{
							var newName = item.cameraName;
							item.onLineStatusShow = item.onLineStatus == '1' ? '在线' : '离线';
							newName = buildAbbreviation(newName, 17, 9, 9);
							item.cameraNameShow = newName;
						});
						self.cameraList = data;
						
					},
					error: function(xhr, type, errorThrown) {
						if (waiting) {
							waiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			openControlling: function() {
				ztcamera.openControlling();
			},
			
			openCamera: function(cameraName,cameraIndexCode) {
				var self = this;
				var nowClickTime = moment();
				if (!lastClickTime) {
					// if (onLineStatus == '0')
					// 	return;
					plus.io.resolveLocalFileSystemURL('_documents', function(entry) {
						if(m.os.ios){
							self.openCameraIos(cameraName,cameraIndexCode);
						}else{
							ztcamera.startCamera(cameraName,cameraIndexCode);
						}
					}, function(e) {});
					lastClickTime = moment();
				} else {
					if (nowClickTime.diff(lastClickTime) > 2000) {
						// if (onLineStatus == '0')
						// 	return;
						plus.io.resolveLocalFileSystemURL('_documents', function(entry) {
							debugger;
							if(m.os.ios){
								self.openCameraIos(cameraName,cameraIndexCode);
							}else{
								ztcamera.startCamera(cameraName,cameraIndexCode);
							}
						}, function(e) {});
						lastClickTime = moment();
					} else {
						//						alert("请勿重复提交");
					}
				}
			},
			openCameraIos:function(cameraName,cameraIndexCode){
				var waiting = plus.nativeUI.showWaiting();
				var apiUrl = app.api_url + '/api/isc/getPreviewURL';
				m.ajax(apiUrl, {
					data: {
						'cameraIndexCode':cameraIndexCode
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if (waiting) {
							waiting.close();
						}
						if(data.code == 0){
							var url = data.data.url;
							plus.htvedio.playVedio(url,cameraName,function(rs){							
									console.log(JSON.stringify(rs));
								},function(e){
									alert(e);
							});
						}else{
							m.toast(data.message);
						}
					},
					error: function(xhr, type, errorThrown) {
						if (waiting) {
							waiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			}
		},
		//		init: function() {
		//			initList();
		//		}
	});


	var lastClickTime = null;
	mui('#searchWhs .mui-scroll-wrapper').scroll({
		deceleration: 0.001, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: true
	});

	mui('#div_av_list').scroll({
		//		deceleration: 0.1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: true
	});
	mui('#div_av_middle_list').scroll({
		//		deceleration: 0.1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: true
	});

	m.plusReady(function() {
		var ws = plus.webview.currentWebview();	
		cameraListVue.initList();

	});


	document.addEventListener("refreshList", function(e) {
		initList();
	}, false);

	return cameraListVue;
});