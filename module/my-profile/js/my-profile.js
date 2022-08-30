define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var logoutButton = document.getElementById('logout-btn');
	m.init({
		statusBarBackground: '#f7f7f7'
	});
	var myProfileVue = new Vue({
		el: "#user-info-detail",
		data: {
			version:'',
			userInfoData:{
				
			}
		},
		methods: {
			replaceMobileNum:function (phone){
				if(!phone){
					return "";
				}
				phone = phone.replace(/^(\d{4})\d{4}(\d+)/,"$1****$2");
            	return phone;
			},
			openMyVideoWindow: function() {
				m.openWindow({
					url: '../../my-profile/html/myVideo.html',
					id: 'myVideo',
					styles: {

					},
					extras: {

					},
					show: {
						autoShow: true //页面loaded事件发生后自动显示，默认为true
					},
					waiting: {
						autoShow: true, //自动显示等待框，默认为true
						title: '正在加载...' //等待对话框上显示的提示内容
					}
				});
			},
			openMyPictureWindow: function() {
				m.openWindow({
					url: '../../my-profile/html/myPicture.html',
					id: 'myPicture',
					styles: {

					},
					extras: {

					},
					show: {
						autoShow: true //页面loaded事件发生后自动显示，默认为true
					},
					waiting: {
						autoShow: false, //自动显示等待框，默认为true
						title: '正在加载...' //等待对话框上显示的提示内容
					}
				});
			},
			/*openAbout: function() {
				m.openWindow({
					url: '../../about/html/about.html',
					id: 'about',
					styles: {

					},
					extras: {

					},
					show: {
						autoShow: true //页面loaded事件发生后自动显示，默认为true
					},
					waiting: {
						autoShow: false, //自动显示等待框，默认为true
						title: '正在加载...' //等待对话框上显示的提示内容
					}
				});
			},
			
			openModifyPasswordWindow:function(){
				m.openWindow({
					url:'../../my-profile/html/modify-password.html',
					id:'modify-password',
					styles:{
						
					},
					extras:{
						
					},
					show: {
						autoShow: true //页面loaded事件发生后自动显示，默认为true
					},
					waiting: {
						autoShow: false, //自动显示等待框，默认为true
						title: '正在加载...' //等待对话框上显示的提示内容
					}
				});
			}*/
		}
	});

	function loadInfo() {
		m.getJSON(app.api_url + '/api/wms/user/getUser?_t=' + new Date().getTime(), function(data) {
			if(data) {
				myProfileVue.userInfoData = data;
			}
		});
	}

	loadInfo();

	function logout() {
		// 弹出提示信息对话框
		plus.nativeUI.actionSheet({
			title: "确认退出后，下次登录依然可以使用本账号",
			cancel: "取消",
			buttons: [{
				title: "确认"
			}]
		}, function(e) {
			if(e.index == 1) {
				// logout成功后，回到登陆页面
				var waiting = plus.nativeUI.showWaiting();
				var apiUrl = app.api_url + "/api/logout";
				m.ajax(apiUrl, {
					data: {
						'token':app.getToken()
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						debugger;
						if (waiting) {
							waiting.close();
						}
						//设置当前用户不自动登录
						app.setUser({
							autoLogin: false
						});
						
						if(data.code == "0") {
							toLogin();
						} else {
							m.alert(data.msg);
						}
						
					},
					error: function(xhr, type, errorThrown) {
						if (waiting) {
							waiting.close();
						}
						 m.toast("网络异常，请重新试试");
					}
				});
				/**
				m.getJSON(app.api_url + "/api/logout?_t=" + new Date().getTime(),{
					token: app.getToken()
				},function(data) {
						waiting.close();
						//设置当前用户不自动登录
						app.setUser({
							autoLogin: false
						});

						if(data.code == "0") {
							toLogin();
						} else {
							m.alert(data.msg);
						}
					});**/
			}

		});

	}

	function toLogin() {
		m.openWindow({
			id: 'login',
			"url": '../../login/html/login.html',
			show: {
				aniShow: 'pop-in'
			},
			extras: {

			},
			waiting: {
				autoShow: false
			}
		});
		window.setTimeout(function() {
			var wvs = plus.webview.all();
			for(var i = 0, len = wvs.length; i < len; i++) {
				var url = wvs[i].getURL()
				if(url && url.indexOf("login.html") != -1) {
					continue;
				}
				wvs[i].close();
			}
		}, 1000);
	}

	logoutButton.addEventListener('tap', function(event) {
		logout();
	});
	
	m.plusReady(function(){
		//加载版本号
		plus.runtime.getProperty( plus.runtime.appid, function ( wgtinfo ) {
			myProfileVue.version = wgtinfo.version;
		} );
	});
	
	// 用户协议
	document.getElementById("toUserProtocol").addEventListener('click', function(event) {
		m.openWindow({
			id: 'userProtocol',
			"url": '../../login/html/userProtocol.html'
		});
	});
	// 隐私协议
	document.getElementById("toPrivacyProtocol").addEventListener('click', function(event) {
		m.openWindow({
			id: 'privacyProtocol',
			"url": '../../login/html/privacyProtocol.html'
		});
	});
});