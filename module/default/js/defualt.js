define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");

	m.plusReady(function() {
		var appVersion = ''; //应用版本号
		var wgtInfo = appVersion = null;
		
		function initReady() {
			//if app.getToken() is exsit and not exsit autoLogin varible or autoLogin exsit  
			//but autoLogin is true
			//检测更新
			// downloadAndInstall();
		
			// plus.downloader.createDownload('https://book-store.cdn.bcebos.com/HtWms-product-test-v101.wgt', {filename:"_doc/update/"}, function(d,status){
			// 	if (status == 200) {
			// 		app.setWgt({
			// 			wgtPath: d.filename,
			// 			version: '',
			// 			msg: ''
			// 		});
			//     } else {  
			//     }  
			// }).start();	
		
			installWgt(function() {
				checkUpdate(function() {
					processLogin();
				});
			});
		}
		
		function processLogin() {
			if (app.getToken() && app.getUser().autoLogin) {
				//如果token 有效直接跳过登录
				m.ajax(app.api_url + "/api/check?_t=" + new Date().getTime(), {
					data: {
						token: app.getToken()
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 5000, //超时时间设置为10秒；
					success: function(data) {
						//如果token没有超时
						if (!data.tokenExpire) {
							toMain();
						} else {
							toLogin();
						}
					},
					error: function(xhr, type, errorThrown) {
						toLogin();
					}
				});
			} else {
				toLogin();
			}
		}
		
		function checkUpdate(cb) {
			plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
				appVersion = wgtinfo.version;
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
						var isUpdate = data.isUpdate;
						var isForce = data.isForce;
						if (data.updateType == 2 || (!isUpdate && !isForce)) {
							cb();
						} else if (data.updateType == 1 && (isUpdate || isForce)) {
							downloadAndInstall();
						} else {
							toLogin();
						}
					},
					error: function(xhr, type, errorThrown) {
						toLogin();
					}
				});
			});
		}
		
		function installWgt(cb) {
			if (wgtInfo && wgtInfo.version > appVersion && wgtInfo.wgtPath) {
				plus.runtime.install(wgtInfo.wgtPath, {
					force: true
				}, function() {
					app.setWgt({
						version: wgtInfo.version,
						msg: '',
						wgtPath: '',
						preVersion: appVersion
					});
					plus.runtime.restart();
				}, function(e) {
					app.setWgt({
						wgtPath: '',
						version: 0,
						msg: '',
						preVersion: appVersion
					});
					cb();
				});
			} else {
				cb();
			}
		}
		
		function downloadAndInstall() {
			console.log(app.api_url);
			var plateformType = m.os.plus ? m.os.android ? "0" : m.os.iphone ? "1" : "" : "";
			m.ajax(app.api_url + "/api/sys/checkVersionNumber?_t=" + new Date().getTime(), {
				data: {
					plateformType: plateformType
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 6000, //超时时间设置为6秒；
				async: false,
				success: function(data) {
					// alert(JSON.stringify(data))
					if (!data) {
						data = {};
						data.versionNumber = plus.runtime.version;
						data.isForceUpdate = false;
					}
					// alert(plus.runtime.version + "|" + data.versionNumber);
					var isUpdate = plus.runtime.version < data.versionNumber;
					//                var isUpdate = false;
					var isForce = data.isForceUpdate;
					if (app.getToken() && app.getUser().autoLogin && !isUpdate) {
						//如果token 有效直接跳过登录
						processLogin();
					} else
					if (isUpdate) {
						if (plateformType == '0') {
							if (isForce) { //强制更新
								plus.nativeUI.confirm("尊敬的用户：有新版本更新，请您务必更新后使用！", function(event) {
									var index = event.index;
									if (index === 0) {
										var waiting = null;
										if (window.plus) {
											waiting = plus.nativeUI.showWaiting('正在下载安装包，请稍等...', {
												back: 'transmit'
											});
										}
										var dtask = plus.downloader.createDownload(data.downloadUrl, {}, function(d, status) {
											// alert(JSON.stringify(d));
											//                        	alert(d.filename);
											if (status == 200) { // 下载成功
												waiting.close();
												var path = d.filename;
												// alert(JSON.stringify(path));
												plus.runtime.install(path); // 安装下载的apk文件
											} else { //下载失败
												waiting.close();
												//alert( "Download failed: " + status ); 
											}
										});
										dtask.start();
									}
								}, "提示", ['确定']);
							} else {
								plus.nativeUI.confirm("有新版本更新安装。", function(event) {
									var index = event.index;
									if (index === 0) {
										var waiting = null;
										if (window.plus) {
											waiting = plus.nativeUI.showWaiting('正在下载安装包，请稍等...', {
												back: 'transmit'
											});
										}
										var dtask = plus.downloader.createDownload(data.downloadUrl, {}, function(d, status) {
											if (status == 200) { // 下载成功
												waiting.close();
												var path = d.filename;
												plus.runtime.install(path); // 安装下载的apk文件
											} else { //下载失败
												//alert( "Download failed: " + status ); 
											}
										});
										dtask.start();
									} else {
										processLogin();
									}
								}, "提示", ['确定', '取消']);
							}
		
						} else if (plateformType == '1') {
							if (isForce) {
								plus.nativeUI.confirm("尊敬的用户：App Store应用市场有新版本更新，请您务必更新后使用！", function(event) {
									var index = event.index;
									if (index === 0) {
										plus.runtime.openURL(data.downloadUrl);
									}
								}, "提示", ['确定']);
							} else {
								plus.nativeUI.confirm("App Store应用市场有新版可以更新。", function(event) {
									var index = event.index;
									if (index === 0) {
										plus.runtime.openURL(data.downloadUrl);
									} else {
										processLogin();
									}
								}, "提示", ['确定', '取消']);
							}
		
						}
					} else {
						processLogin();
					}
				},
				error: function(xhr, type, errorThrown) {
					m.toast("网络异常，请稍后再试");
					toLogin();
				}
			});
		}
		
		function toLogin() {
			var loginView = m.openWindow({
				id: 'login',
				"url": '../../login/html/login.html',
				show: {
					autoShow: true, //页面loaded事件发生后自动显示，默认为true
				},
				waiting: {
					autoShow: false
				}
			});
			window.setTimeout(function() {
				var ws = plus.webview.currentWebview();
				ws.close();
			}, 3000);
		}
		
		function toMain() {
			/*	var mainView = m.openWindow({
					id: 'main',
					"url": '../../main/html/main.html',
					show: {
						 autoShow:false,//页面loaded事件发生后自动显示，默认为true
					},
					waiting: {
						autoShow: false
					}
				});*/
			var mainView = plus.webview.create("../../main/html/main.html", "main", {
		
			});
			window.setTimeout(function() {
				mainView.show();
				var ws = plus.webview.currentWebview();
				ws.close();
			}, 3000);
		
			// var mainView = plus.webview.create("../../crane-index/html/crane-index.html", "openCraneManage", {
		
			// });
			// window.setTimeout(function() {
			// 	mainView.show();
			// 	var ws = plus.webview.currentWebview();
			// 	ws.close();
			// }, 3000);
		}
		/**
		 * 重写mui.back()，什么都不执行，反之用户返回到入口页；
		 */
		m.back = function() {};
		
		wgtInfo = app.getWgt();
		plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
			appVersion = wgtinfo.version;
			initReady();
		});
		// initReady();
	});

});
