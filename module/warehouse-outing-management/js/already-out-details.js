define(function(require, module, exports) {
	var m = require("mui");
	require("mui-zoom");
	require("mui-previewimage");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	var cameraJs = require("../js/camera.js");
	require("../../../js/common/common.js");
	
	m.init();
	
	m.plusReady(function() {
		var ws = null;
		var waiting = null;
		var slider = m("#slider").slider();
		slider.setStopped(true); //禁止滑动
		
		var detailVue = new Vue({
				el: '#body_outing_details',
				data: {
					outingKey: '',
					totalInfo: '',
					outDetails: [],
					materielList: [],
					attachFile: [],
					imageFiles: [],
					files: [],
					coverUrls: []
				},
				methods: {
					initShow: function() {
						var self = this;
						var apiUrl = app.api_url + '/api/proOutput/detail?_t=' + new Date().getTime();
						m.ajax(apiUrl, {
							data: {
								id: self.outingKey
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 20000, //超时时间设置为10秒；
							success: function(data) {
								if(waiting) {
									waiting.close();
								}
								console.log(JSON.stringify(data));
								self.outDetails = data;
								if(self.outDetails) {
		//							self.outDetails = data.sendCode;
		//							self.outputDate = data.outputDate;
		//							self.ladingCode = data.ladingCode;
		//							self.ownerId = data.ownerId;
		//							self.ownerName = data.ownerName;
		//							self.spenderId = data.spenderId;
		//							self.spenderName = data.spenderName;
		//							self.paymentModeId = data.paymentMode;
		//							self.paymentMode = data.paymentModeStr;
		//							self.carPlateNo = data.carPlateNo;
									self.materielList = self.outDetails.detailList;
									if(self.materielList && self.materielList.length > 0) {
										var realNumUnitDesc = "";
										var realWeightUnitDesc = "";
										m.each(self.materielList, function(index, item) {
											if(item) {
												realNumUnitDesc = item.realNumUnitDesc;
												realWeightUnitDesc = item.realWeightUnitDesc;
												item.realPickInfo = (item.realNum ? item.realNum : '0') + item.realNumUnitDesc + "/" + (item.realWeight ? item.realWeight : '0') + item.realWeightUnitDesc;
											}
										});
										self.totalInfo = "合计：" + self.outDetails.realNumTotal + realNumUnitDesc + "/" + self.outDetails.realWeightTotal + realWeightUnitDesc;
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
							var getOutputAttachFileUrl = app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime() + "&busiType=pro_output" + "&busiId=" + (self.outingKey + "#1") + "&token=" + app.getToken();
							console.log("getOutputAttachFileUrl:" + getOutputAttachFileUrl);
						}
						m.ajax(app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime(), {
							data: {
								busiType: 'pro_output',
								busiId: self.outingKey + "#1",
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
					delete: function(file, type) {
						var self = this;
						var id = file.id;
						if(type == 1) { //文件
							plus.nativeUI.confirm('是否删除此附件？', function(f) {
								if(f.index == 0) {
									m.ajax(app.api_url + '/api/sys/file/deleteFile?_t=' + new Date().getTime(), {
										data: {
											fileId: id,
											token: app.getToken()
										},
										dataType: 'json', //服务器返回json格式数据
										type: 'post', //HTTP请求类型
										success: function(data) {
											
										},
										error: function(xhr, type, errorThrown) {
											m.toast("网络异常，请重新试试");
										}
									});
									var files = new Array();
									for(var i = 0; i < self.files.length; i++) {
										if(self.files[i].id != id) {
											files.push(self.files[i]);
										}
									}
									self.files = files;
								} else {
		
								}
							}, '提示', ['是', '否']);
						} else { //图片
							if(id) {
								////服务器
								m.ajax(app.api_url + '/api/sys/file/deleteFile?_t=' + new Date().getTime(), {
									data: {
										fileId: id,
										token: app.getToken()
									},
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									success: function(data) {
										
									},
									error: function(xhr, type, errorThrown) {
										m.toast("网络异常，请重新试试");
									}
								});
								var imageFiles = new Array();
								var attacheFileIds1 = "";
								for(var i = 0; i < self.imageFiles.length; i++) {
									if(self.imageFiles[i].id != id) {
										imageFiles.push(self.imageFiles[i]);
										attacheFileIds1 += self.imageFiles[i].id + ',';
									}
								}
								self.attacheFileIds_1 = attacheFileIds1;
								self.imageFiles = imageFiles;
							} else {
								////本地
								plus.io.resolveLocalFileSystemURL(file.fileUrl, function(entry) {
										entry.remove(function(entry) {
											var imageFiles = new Array();
											for(var i = 0; i < self.imageFiles.length; i++) {
												if(self.imageFiles[i].fileUrl != file.fileUrl) {
													imageFiles.push(self.imageFiles[i]);
												}
											}
											self.imageFiles = imageFiles;
										}, function(e) {
											m.alert("删除图片失败：" + e.message);
										});
									},
									function(e) {
										//								m.alert("读取拍照文件错误：" + e.message);
									});
							}
						}
					},
					onItemSliderClick: function($event, index) {
						var self = this;
						event.stopPropagation();
						slider.gotoItem(index);
					},
					close: function(){
						m.back();
					},
					getcoverUrl: function(index){
						var self = this;
						return self.coverUrls[index];
					}
				}
			});
		
		//	$("#addFile").click(function() {
		//		plus.nativeUI.actionSheet({
		//			cancel: "取消",
		//			buttons: [{
		//				title: "拍照"
		//			}, {
		//				title: "手机相册"
		//			}]
		//		}, function(e) {
		//			if(e.index == 1) {
		//				cameraJs.capurteImage();
		//			} else if(e.index == 2) {
		//				cameraJs.galleryImgs(function(e) {
		//					batchUpload(e.files, function(data) {});
		//				});
		//				//				galleryImgs();
		//			}
		//		});
		//	});
		//
		//	var fileServer = app.api_url + '/api/sys/file';
		//	// 创建上传任务
		//	function createUpload(file, callback) {
		//		var waiting = plus.nativeUI.showWaiting("图片上传中...", {
		//			back: 'transmit'
		//		});
		//		var task = plus.uploader.createUpload(fileServer, {
		//				method: "POST",
		//				blocksize: 204800,
		//				priority: 100,
		//				timeout: 0
		//			},
		//			function(t, status) {
		//
		//				// 上传完成
		//				waiting.close();
		//				if(status == 200) {
		//					var uf = JSON.parse(t.responseText);
		//					if(uf.length === 0) {
		//						console.log("没有上传文件");
		//						return;
		//					}
		//					var newFile = new Object();
		//					newFile.id = uf[0].fileId;
		//					detailVue.attacheFileIds_1 += newFile.id + ',';
		//					newFile.fileExt = 'jpg';
		//					newFile.fileSize = uf[0].fileSize;
		//					//					newFile.fileUrl = app.api_url + '' + 'api/sys/file/download?isOnLine=true&fileId=' + '' + newFile.id + '&token=' + app.getToken();
		//					newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id + '&token=' + app.getToken();
		//					newFile.fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id + '&token=' + app.getToken();
		//					detailVue.imageFiles.push(newFile);
		//
		//					callback(t);
		//				} else {
		//					m.toast('图片上传失败,请重新上传');
		//				}
		//				return;
		//			}
		//		);
		//		task.addFile(file, {
		//			key: "upload"
		//		});
		//		task.addData("busiType", "pro_output");
		//		if(detailVue.outingKey) {
		//			task.addData("busiId", detailVue.outingKey + "#1");
		//		} else {
		//			task.addData("busiId", "");
		//		}
		//		task.start();
		//	}
		//
		//	function batchUpload(file, callback) {
		//		var uploadWaiting = plus.nativeUI.showWaiting("图片上传中...", {
		//			back: 'transmit'
		//		});
		//		var task = plus.uploader.createUpload(app.api_url + '/api/sys/file/batchUploadImgs', {
		//				method: "POST",
		//				blocksize: 204800,
		//				priority: 100,
		//				timeout: 0
		//			},
		//			function(t, status) {
		//				uploadWaiting.close();
		//				// 上传完成			
		//				if(status == 200) {
		//					var uf = JSON.parse(t.responseText);
		//					console.log(JSON.stringify(uf));
		//					if(uf.length === 0) {
		//						console.log("没有上传文件");
		//						return;
		//					}
		//					var zm = 0;
		//					setTimeout(showImg, 350);
		//
		//					function showImg() {
		//						var newFile = new Object();
		//						newFile.id = uf[zm].fileId;
		//						detailVue.attacheFileIds_1 += newFile.id + ',';
		//						newFile.fileExt = 'jpg';
		//						newFile.fileSize = uf[zm].fileSize;
		//						newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id + '&token=' + app.getToken();
		//						newFile.fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id + '&token=' + app.getToken();
		//						detailVue.imageFiles.push(newFile);
		//
		//						callback(t);
		//						zm++;
		//						if(zm < uf.length) {
		//							setTimeout(showImg, 350);
		//						}
		//					}
		//				} else {
		//					m.toast('图片上传失败,请重新上传');
		//				}
		//			}
		//		);
		//		for(var i = 0; i < file.length; i++) {
		//			task.addFile(file[i], {
		//				key: file[i]
		//			});
		//		}
		//		task.addData("busiType", "pro_output");
		//		if(detailVue.outingKey) {
		//			task.addData("busiId", detailVue.outingKey + "#1");
		//		} else {
		//			task.addData("busiId", "");
		//		}
		//		task.start();
		//	}
		//
		//	function compressAndUploadImg(entry) {
		//		if(app.debug) {
		//			console.log("compress:" + entry.toLocalURL());
		//		}
		//		plus.zip.compressImage({
		//			src: entry.toLocalURL(),
		//			dst: '_doc/' + entry.name,
		//			overwrite: true,
		//			quality: 100
		//		}, function(zip) {
		//			createUpload(zip.target, function(data) {
		//
		//			});
		//		}, function(zipe) {
		//			m.toast('压缩失败！');
		//		});
		//	}
		//
		//	document.addEventListener('save-picture', function(event) {
		//		var url = event.detail.target;
		//		plus.io.resolveLocalFileSystemURL(url, function(entry) {
		//				plus.nativeUI.confirm('立即上传或保存到手机相册？', function(f) {
		//					if(f.index == 1) {
		//						compressAndUploadImg(entry);
		//					} else if(f.index == 0) {
		//						plus.gallery.save(entry.fullPath, function() {
		//							m.toast("保存图片到相册成功");
		//						}, function(se) {
		//							m.toast(se.message);
		//						});
		//					}
		//				}, '提示', ['保存', '上传']);
		//			},
		//			function(e) {
		//				m.alert("读取拍照文件错误：" + e.message);
		//			});
		//	}, false);
		
			m.previewImage();
		
		
		
		
		if(window.plus) {
			waiting = plus.nativeUI.showWaiting('加载中...');
		}
		var ws = plus.webview.currentWebview();
		detailVue.outingKey = ws.outingKey;
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