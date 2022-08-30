define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");

	m.plusReady(function() {
		//设置权限数组数据
		/*m.getJSON(app.api_url + "/api/fl/user/getUserForMb?_t=" + new Date().getTime(), {
			token: app.getToken()
		}, function(data) {
			if(data) {
				app.setUser({
					'flUserId': data.id,
					'flUserName': data.userName,
					'flUserCompanyId': (data.company ? data.company.id : ''), //fl系统用户公司id
					'flUserCompanyName': (data.company ? data.company.companyName : ''), //fl系统用户公司名字
					'flUserDepId': (data.sysDep ? data.sysDep.id : ''), //fl系统用户部门id
					'flUserDepName': (data.sysDep ? data.sysDep.depName : ''), //fl系统用户部门名字
				});
			}
		});*/
		//设置fl字典数据
		m.getJSON(app.api_url + "/api/fl/dict/getListAllDicts?_t=" + new Date().getTime(),
			function(data) {
				if (data) {
					var rs = [];
					for (var i = 0; i < data.length; i++) {
						rs.push({
							'label': data[i].label,
							'value': data[i].value,
							'type': data[i].type
						});
					}
					app.setFlDictListData(rs);
				}
			});
		//设置权限数组数据
		/*m.getJSON(app.api_url + "/api/fl/user/getPrivilegeList?_t=" + new Date().getTime(), {
			token: app.getToken()
		}, function(data) {
			if(data) {
				var rs = [];
				for(var i = 0; i < data.length; i++) {
					rs.push({
						'name': data[i].name,
						'permission': data[i].permission
					});
				}
				app.setUser({
					'privilegeList': rs
				});
			}
		});*/
		
		//	// 监听下载任务状态 
		function onStateChanged(download, status) {
			if (download.state == 4 && status == 200) {
				// 下载完成 
				plus.nativeUI.confirm("有新版本更新安装。", function(event) {
					var index = event.index;
					if (index === 0) {
						plus.runtime.install(apk_path); // 安装下载的apk文件
					}
				}, "提示", ['确定', '取消']);
			}
		}
		
		// 创建下载任务
		function createDownloadAndInstall(url) {
			//		var dtask = plus.downloader.createDownload(app.api_url + url);
			//		dtask.addEventListener("statechanged", onStateChanged, false);
			//		dtask.start();
			var dtask = plus.downloader.createDownload(app.api_url + url, {}, function(d, status) {
				if (status == 200) { // 下载成功
					apk_path = d.filename;
					dtask.addEventListener("statechanged", onStateChanged, false);
				} else { //下载失败
					//alert( "Download failed: " + status ); 
				}
			});
			dtask.start();
		}
		
		function downloadAndInstall() {
			m.getJSON(app.api_url + "/api/fl/appUpdate/checkUpdate?_t=" + new Date().getTime(), {
				version: plus.runtime.version
			}, function(data) {
				if (data.isUpdate) {
					if (m.os.plus && m.os.android) {
						plus.nativeUI.confirm("有新版本更新安装。", function(event) {
							var index = event.index;
							if (index === 0) {
								var dtask = plus.downloader.createDownload(app.api_url + data.downloadUrl, {}, function(d, status) {
									if (status == 200) { // 下载成功
										var path = d.filename;
										plus.runtime.install(path); // 安装下载的apk文件
									} else { //下载失败
										//alert( "Download failed: " + status ); 
									}
								});
								dtask.start();
							}
						}, "提示", ['确定', '取消']);
					} else if (m.os.plus && m.os.iphone) {
						plus.nativeUI.confirm("App Store应用市场有新版可以更新。", function(event) {
							var index = event.index;
							if (index === 0) {
								plus.runtime.openURL(data.downloadUrl);
							}
						}, "提示", ['确定', '取消']);
					}
				}
			});
		}
		
		function delWgt() {
			plus.runtime.getProperty(plus.runtime.appid, function(info) {
				var appVersion = info.version;
				var plateformType = m.os.plus ? m.os.android ? "0" : m.os.iphone ? "1" : "" : "";
				m.ajax(app.api_url + "/api/sys/checkOnlineUpdate?_t=" + new Date().getTime(), {
					data: {
						version: appVersion,
						plateformType: plateformType
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if (app.debug)
							console.log(JSON.stringify(data));
						if (!data.isUpdate) {
							// alert(1)
							plus.io.resolveLocalFileSystemURL("_doc/update/", function(entry) {
								//读取这个目录对象
								var directoryReader = entry.createReader();
								//读取这个目录下的所有文件
								directoryReader.readEntries(function(entries) {
									//如果有才操作
									for (i = 0; i < entries.length; i++) {
										if (entries[i].name.indexOf('.wgt') != -1) {
											var path_url = "_doc/update/" + entries[i].name;
											entry.removeRecursively(function(path_url) {
												console.log('删除成功回调')
												//删除成功回调
											}, function(e) {
												//错误信息
												console.log(e.message);
											})
										}
									}
								}, function(e) {
									console.log('读取文件失败：' + e.message)
								})
							}, function(e) {
								console.log('读取目录失败：' + e.message)
							});
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			});
		}
		
		
		
		// if(app.isCheckUpdate){
		// 	//升级包检测
		// 	window.setTimeout(function(){
		// 		downloadAndInstall();
		// 	},20000);
		// }	

		delWgt();
	});
})
