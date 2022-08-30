define(function(require, module, exports) {
	var m = require("mui");
	require("mui-zoom");
	require("mui-previewimage");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
//	var cameraJs = require("../../warehouse-outing-management/js/camera.js");
	require("../../../js/common/common.js");

	m.init();

	m.plusReady(function() {
		var ws = null;
			var waiting = null;
		//	mui('#div_basic_info .public-list').scroll({
		//		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		//		indicators: true
		//	});
		
		var slider = m("#slider").slider();
		slider.setStopped(true); //禁止滑动
		
		var detailVue = new Vue({
				el: '#receivingRegister',
				data: {
					enteringKey: '',
					receivingCodeStr: '',
					totalInfo: '',
					enteringDetails: [],
					materielList: [],
					attachFile: [],
					imageFiles: [],
					files: [],
					coverUrls: []
				},
				methods: {
					initShow: function() {
						var self = this;
						var apiUrl = app.api_url + '/api/proReceiving/detail?_t=' + new Date().getTime();
						m.ajax(apiUrl, {
							data: {
								id: self.enteringKey
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 20000, //超时时间设置为10秒；
							success: function(data) {
								if(waiting) {
									waiting.close();
								}
								console.log(JSON.stringify(data));
								self.enteringDetails = data;
								if(self.enteringDetails) {
									self.receivingCodeStr = "已收货详情(" + self.enteringDetails.receivingCode + ")";
									self.materielList = self.enteringDetails.detailList;
									if(self.materielList && self.materielList.length > 0) {
										var realNumUnitDesc = "";
										var realWeightUnitDesc = "";
										m.each(self.materielList, function(index, item) {
											if(item) {
												realNumUnitDesc = item.realNumUnitDesc;
												realWeightUnitDesc = item.realWeightUnitDesc;
												item.realReceivableInfo = (item.realNum ? item.realNum : '0') + item.realNumUnitDesc + "/" + (item.realWeight ? item.realWeight : '0') + item.realWeightUnitDesc;
											}
										});
										self.totalInfo = "合计：" + self.enteringDetails.realNumTotal + realNumUnitDesc + "/" + self.enteringDetails.realWeightTotal + realWeightUnitDesc;
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
					getAttachFile: function() {
						var self = this;
						if(app.debug) {
							var getAttachFileUrl = app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime() + "&busiType=pro_receiving" + "&busiId=" + (self.enteringKey + "#1") + "&token=" + app.getToken();
							console.log("getAttachFileUrl:" + getAttachFileUrl);
						}
						m.ajax(app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime(), {
							data: {
								busiType: 'pro_receiving',
								busiId: self.enteringKey + "#1",
								token: app.getToken()
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 20000, //超时时间设置为20秒；
							success: function(data) {
								if(data) {
									self.attachFile = data;
									var imageFiles = [];
									var files = [];
									var coverUrls = [];
									for(var i = 0; i < data.length; i++) {
										var fileExt = data[i].fileExt;
										var size = parseInt(data[i].fileSize);
										var k = 1000, // or 1024
											sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
										j = Math.floor(Math.log(size) / Math.log(k));
										data[i].fileSize = (size / Math.pow(k, j)).toPrecision(3) + ' ' + sizes[j];
										if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
											data[i].previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + data[i].id + '&token=' + app.getToken();
											data[i].fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + data[i].id + '&token=' + app.getToken();
											imageFiles.push(data[i]);
										} else {
											files.push(data[i]);
											if(isNotBlank(data[i].baidudocId)){
												var jsonData = JSON.parse(data[i].baidudocInfo);
												if(jsonData.status == "PUBLISHED") {
													coverUrls.push(jsonData.coverUrl);
												}else{
													coverUrls.push("../../../images/file.jpg");
												}
											}else{
												coverUrls.push("../../../images/file.jpg");
											}
										}
									}
									self.imageFiles = imageFiles;
									//							alert(JSON.stringify(self.imageFiles));
									self.files = files;
									self.coverUrls = coverUrls;
								}
							},
							error: function(xhr, type, errorThrown) {
								m.toast("网络异常，请重新试试");
							}
						});
					},
					openFile: function(fileId, baidudocId) {
						if(isNotBlank(baidudocId)){
							var self = this;
							var pageUrl = "../../attachFilePreview/html/read-document.html";
							m.openWindow({
								fileId: fileId,
								url: pageUrl,
								show: {
									aniShow: 'pop-in'
								},
								waiting: {
									autoShow: true
								},
								extras: {
									"fileId": fileId
								}
							});
						}else{
							var filePath = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&fileId=' + '' + fileId + '&token=' + app.getToken();
							if(app.debug) {
								console.log("RiskfilePath:" + filePath);
							}
							if(m.os.android) {
								plus.runtime.launchApplication({
									pname: "com.tencent.mtt",
									extra: {
										url: filePath
									}
								}, function(e) {
									plus.nativeUI.confirm('当前设备上找不到能打开此附件的应用，是否手动下载并安装相关应用？', function(f) {
										if(f.index == 0) {
											plus.runtime.openURL('http://mb.qq.com');
										} else {
							
										}
									}, '提示', ['是', '否']);
								});
							} else {
								plus.runtime.openURL(filePath, function(error) {
									m.toast("无法下载和打开此附件，请检查附件地址是否正确");
								}, '');
							}
						}
					},
					onItemSliderClick: function($event, index) {
						var self = this;
						event.stopPropagation();
						slider.gotoItem(index);
					},
					onMaterialItemClick: function($event, item) {
						var self = this;
						event.stopPropagation();
		//				m.openWindow({
		//					id: 'material-details',
		//					url: '../html/material-details.html',
		//					show: {
		//						aniShow: 'pop-in'
		//					},
		//					waiting: {
		//						autoShow: true
		//					},
		//					extras: {
		//						"materialDetails": item
		//					}
		//				});
					},
					close: function() {
						m.back();
					},
					getcoverUrl: function(index){
						var self = this;
						return self.coverUrls[index];
					}
				}
			});
			
			m.previewImage();
		
		
		
		
		m(".mui-switch")['switch']();
		if(window.plus) {
			waiting = plus.nativeUI.showWaiting('加载中...');
		}
		var ws = plus.webview.currentWebview();
		detailVue.enteringKey = ws.enteringKey;
		detailVue.getAttachFile();
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



});