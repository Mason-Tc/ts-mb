define(function(require, module, exports) {
		var m = require("mui");
		var app = require("app");
		function uploadFile(busiType, busiId,callback) {
				//var busiType = "customer";
				//var busiId = 'customer2_' + naturalId + "_" + setUploadDetailId;
				var params = {
					'busiType':busiType, 
					'busiId':busiId
				};
				plus.nativeUI.actionSheet({
					title: "上传照片",
					cancel: "取消",
					buttons: [{
						title: "拍照上传"
					}, {
						title: "从相册选择"
					}]
				}, function(e) {
					if(e.index == 1) {
						uploadCapurteImage(params,callback);
					} else if(e.index == 2) {
						uploadPickGallery(params,callback);
					}
				});
			}
			//拍照上传
			function uploadCapurteImage(params, callback) {
				plus.nativeUI.toast("开始拍照：");
				var cmr = plus.camera.getCamera();
				cmr.captureImage(function(p) {
					plus.io.resolveLocalFileSystemURL(p, function(entry) {
						var listFiles = [];
						listFiles.push(entry);
						uploadFileAction(params,listFiles,callback);
					}, function(e) {
						m.alert("读取拍照文件错误：" + e.message);
					});
				}, function(e) {
					//没有拍时就不提示什么了
					//m.alert("失败：" + e.message);
				}, {
					filename: "_doc/camera/",
					index: 1
				});
			}
			// 从相册添加文件
			function uploadPickGallery(params, callback) {
				plus.gallery.pick(function(p) {
					var listFiles = [];
					if(p.files) {
						listFiles.concat(p.files)
					} else {
						listFiles.push(p);
					}
					uploadFileAction(params,listFiles, callback);
				}, {
					filter: 'image',
					multiple: true,
					filename: '_doc/camera/',
					maximum: 3,
					system: false,
					//selected:lfs,
					onmaxed: function() {
						plus.nativeUI.alert("最多选择5张图片。")
					}
				});
			}
			function uploadFileAction(params,listFiles, callback) {
				var waiting = plus.nativeUI.showWaiting("上传中...", {
					back: 'none'
				});
				var task = plus.uploader.createUpload(app.api_url + "/api/fl/file/uploadFiles", {
						method: "POST",
						timeout: 0
					},
					function(t, status) { //上传完成
						waiting.close();
						if(status == 200) {
							var data = JSON.parse(t.responseText);
							//上传成功
							if(data.success) {
								plus.nativeUI.toast("上传成功");
								//1、处理返回来的数据
								for(var i = 0; i < data.list.length; i++) {
									var urlPath = app.api_url + data.list[i].fullFilePath;
									data.list[i].fullFilePath = urlPath;
								}
								//执行回调
								if(typeof callback === 'function'){
									callback(data.list);
								}
							} else { //上传失败，如文件太大等
								plus.nativeUI.alert("上传失败,失败原因：" + data.msg);
							}
						} else {
							plus.nativeUI.alert("上传失败");
						}
					}
				);
				//追加参数
				for(var p in params){
					task.addData(p, params[p]);
				}
				
				for(var i = 0; i < listFiles.length; i++) {
					var f = listFiles[i];
					if(typeof f === 'string') {
						task.addFile(f, {
							key: f
						});
					} else {
						task.addFile(f.toLocalURL(), {
							key: f.name
						});
					}
				}
				task.start();
			}
			
			//删除附件
			function removeFile(fileId,callback) {
				plus.nativeUI.confirm("你确认删除?", function(e) {
					if(e.index == 0) {
						var waiting = plus.nativeUI.showWaiting("删除中...", {
							back: 'transmit'
						});
						m.ajax(app.api_url + '/api/fl/file/deleteFile?_t' + new Date().getTime(), {
							data: {
								'fileId': fileId
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							success: function(data) {
								waiting.close();
								if(data.success) {
									m.toast("删除成功");
									if(typeof callback === 'function'){
										callback();
									}
								} else {
									m.toast("删除失败");
								}

							},
							error: function(xhr, type, errorThrown) {
								waiting.close();
								m.toast("网络异常，删除失败。");
							}
						});
					}
				}, "删除附件", ["确认", "取消"]);
		}
		
		return {
			"uploadFile":uploadFile,
			"removeFile":removeFile
		}
});
