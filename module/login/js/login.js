define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	require("./aes.js");
	//require("./login-canvas.js");
	var accountInput = document.getElementById('account');
	var passwordInput = document.getElementById('password');
	var loginButton = document.getElementById('login');
	var forgetPasswordButton = document.getElementById('forgetPassword');
	var deviceInfo = new Object(); //设备信息
	var osInfo = new Object(); //系统信息
	var appVersion = ''; //应用版本号
	var phoneType = ''; //手机类型
	var wgtInfo = null;

	m.init({
		statusBarBackground: '#f7f7f7'
	});
	m.plusReady(function() {
		var ws = plus.webview.currentWebview();
		wgtInfo = app.getWgt();
		deviceInfo = plus.device;
		osInfo = plus.os;
		plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
			appVersion = wgtinfo.version;
			var user = app.getUser();
			if (user) {
				accountInput.value = user.userName;
				passwordInput.value = user.password;
				if (appVersion > wgtInfo.preVersion && user.userName && user.password) {
					app.setWgt({
						preVersion: appVersion
					});
					if (app.getToken() && user.autoLogin) {
						doLogin();
					}

				}
			}
		});

		// if(app.user) {
		// 	accountInput.value = app.user.userName;
		// 	passwordInput.value = app.user.password;
		// }

		plus.screen.lockOrientation("portrait-primary");
		// close splash
		setTimeout(function() {
			//关闭 splash
			plus.navigator.closeSplashscreen();
		}, 600);

		var backButtonPress = 0;
		m.back = function(event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	});
	
	function encrypt(word){
		var key = CryptoJS.enc.Utf8.parse("abcdefgabcdefg12");
		var srcs = CryptoJS.enc.Utf8.parse(word);
		var encrypted = CryptoJS.AES.encrypt(srcs, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
		return encrypted.toString();
	}
	
	function toMain() {
		var waiting = plus.nativeUI.showWaiting(null, {
			'back': 'transmit'
		});
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
			waiting.close();
			mainView.show();
			var ws = plus.webview.currentWebview();
			ws.close();
		}, 3000);
	}

	function toForgetPassword() {
		m.openWindow({
			id: 'forget-password',
			"url": '../../forget-password/html/forget-password.html',
			show: {

			},
			waiting: {
				autoShow: true
			}
		});

	}

	function doLogin() {
		loginButton.setAttribute('disabled', 'disabled');
		// var waiting = plus.nativeUI.showWaiting();
		checked(function() {
			login(function() {
				// waiting.close();
			}, function() {
				// waiting.close();
				loginButton.removeAttribute('disabled');
			});
		}, function() {
			// waiting.close();
			loginButton.removeAttribute('disabled');
		});
	}

	function checked(cb, eb) {
		cb = cb || function() {};
		eb = eb || function() {};
		var plateformType = m.os.plus ? m.os.android ? "0" : m.os.iphone ? "1" : "" : "";
		// alert(appVersion + "|" + plateformType)
		m.ajax(app.api_url + "/api/sys/checkOnlineUpdate?_t=" + new Date().getTime(), {
			data: {
				version: appVersion,
				plateformType: plateformType
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 50000, //超时时间设置为10秒；
			success: function(data) {
				// alert(JSON.stringify(data));
				updateApp(data, cb, eb);
			},
			error: function(xhr, type, errorThrown) {
				m.toast("网络异常，请重新试试");
				eb();
			}
		});
	}

	function login(cb, eb) {
		var clientInfo = plus.push.getClientInfo();
		var pushClientId = clientInfo.clientid;
		var deviceId = plus.device.uuid;
		//		alert(pushClientId + "|" + deviceId+ "|"+deviceInfo.model+"|"+osInfo.name+"|"+appVersion)
		var waiting = plus.nativeUI.showWaiting();
		var pwd = encrypt(passwordInput.value)
		m.ajax(app.api_url + '/api/login', {
			data: {
				'userName': accountInput.value,
				'password': pwd,
				'pushClientId': pushClientId,
				'deviceId': deviceId,
				'deviceType': 'app',
				'phoneType': deviceInfo.model,
				'loginFrom': osInfo.name,
				'appVersion': appVersion
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 60000, //超时时间设置为10秒；
			success: function(res) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				waiting.close();
				if (typeof cb === 'function') {
					cb();
				}
				if (res.code == 0) {
					var data = res.data;
					app.setToken(data.token);
					app.setUser({
						userName: accountInput.value,
						password: passwordInput.value,
						warehouse: data.warehouse,
						userDisplayName: data.userDisplayName,
						privilegeList: data.privilegeList,
						autoLogin: true
					});
					toMain();
				} else {
					if (typeof eb === 'function') {
						eb();
					}
					if(data.msg.search('锁定')>=0){
						m.alert(data.msg)
					}else{
						m.toast(data.msg);
					}
				}
			},
			error: function(xhr, type, errorThrown) {
				waiting.close();
				if (typeof eb === 'function') {
					eb();
				}
				m.toast("网络异常，请重新试试");
			}
		});
	}

	function updateApp(data, cb, eb) {
		var isUpdate = data.isUpdate;
		var isForce = data.isForce || false;
		var downloadUrl = data.downloadUrl || '';
		cb = cb || function() {};
		eb = eb || function() {};
		if (data.updateType == 2) {
			cb();
			return;
		}
		if (!isUpdate && !isForce) {
			cb();
			return;
		}
		if (m.os.plus && m.os.android) {
			plus.nativeUI.confirm(data.msg || "尊敬的用户：有新版本更新，请您务必更新后使用！", function(event) {
				var index = event.index;
				if (index === 0) {
					eb();
					var waiting = null;
					if (window.plus) {
						waiting = plus.nativeUI.showWaiting('正在下载安装包，请稍等...', {
							back: 'transmit'
						});
					}
					var dtask = plus.downloader.createDownload(downloadUrl, {}, function(d, status) {
						// alert(JSON.stringify(d));
						// alert(d.filename);
						if (status == 200) { // 下载成功
							waiting.close();
							var path = d.filename;
							// alert(JSON.stringify(path));
							plus.runtime.install(path); // 安装下载的apk文件
						} else { //下载失败
							waiting.close();
							plus.downloader.clear();
							//alert( "Download failed: " + status ); 
						}
					});
					dtask.start();
				} else if (index == 1) {
					if (isForce === false && isUpdate == true) {
						cb();
					} else {
						eb();
					}
				}
			}, "提示", ['确定', '取消']);
		} else if (m.os.plus && m.os.iphone) {
			plus.nativeUI.confirm(data.msg || "尊敬的用户：App Store应用市场有新版本更新，请您务必更新后使用！", function(event) {
				var index = event.index;
				if (index === 0) {
					eb();
					plus.runtime.openURL(downloadUrl);
				} else if (index == 1) {
					if (isForce === false && isUpdate == true) {
						cb();
					} else {
						eb();
					}
				}
			}, "提示", ['确定', '取消']);
		}
	}

	function installWgt(cb) {
		if (wgtInfo.version > appVersion && wgtInfo.wgtPath) {
			var waiting = plus.nativeUI.showWaiting();
			plus.runtime.install(wgtInfo.wgtPath, {
				force: true
			}, function() {
				if (waiting) waiting.close();
				app.setWgt({
					wgtPath: '',
					version: wgtInfo.version,
					msg: '',
					preVersion: appVersion
				});
				// app.setUser({
				// 	toLogin: true
				// });
				plus.runtime.restart();
			}, function(e) {
				app.setWgt({
					wgtPath: '',
					version: 0,
					msg: '',
					preVersion: appVersion
				});
				if (waiting) waiting.close();
				cb();
			});
		} else {
			cb();
		}
	}

	loginButton.addEventListener('click', function(event) {
		installWgt(function() {
			doLogin();
		});
		// login();
	});
	forgetPasswordButton.addEventListener('click', function(event) {
		toForgetPassword();
	});

	// 用户协议
	document.getElementById("toUserProtocol").addEventListener('click', function(event) {
		m.openWindow({
			id: 'userProtocol',
			"url": '../html/userProtocol.html'
		});
	});
	// 隐私协议
	document.getElementById("toPrivacyProtocol").addEventListener('click', function(event) {
		m.openWindow({
			id: 'privacyProtocol',
			"url": '../html/privacyProtocol.html'
		});
	});

	//在android 平台需要，初始化body 样式高度和宽度，不然就会拉伸
	(function() {
		document.body.style.height = document.body.clientHeight + "px";
		document.body.style.width = document.body.clientWidth + "px";
	})();
});
