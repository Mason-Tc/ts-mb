define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue2");
	require("./init-data.js");
	//tab 选项集合
	var tabItems = document.querySelectorAll(".mui-bar-tab>.mui-tab-item");
	var menuBar = new Vue({
		el:'#menu-bar',
		data:{
			cameraAuth:false,
			exponentAuth:false,
			whsOnlineAuth:false,
		},
		methods:{
			/*toCameraListBackHtml: function(){
				m.openWindow({
					id: 'cameraList_back',
					"url": '../../camera/html/cameraList_back.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						//自定义扩展参数，可以用来处理页面间传值
						'cameraListBackParam': {
							showBackIcon: false
						}
					}
				});
			}*/
		}
	});

	//mui初始化
	m.init();
	//要创建的子页面
	var subpages = [];
	var subpageStyle = {
		top: '0px',
		bottom: '56px'
	};
	var aniShow = {};
	var checkLoginIntervel = null;
	for(var i = 0; i < tabItems.length; i++) {
		var href = tabItems[i].getAttribute("href");
		subpages.push(href);
	}

	if(window.plus) {
		initReady();
	} else {
		m.plusReady(function() {
			initReady();
		});
	}

	/**
	 * plus 加载后执行方法
	 * 创建子页面，首个选项卡页面显示，其它均隐藏；
	 */
	function initReady() {
		menuBar.cameraAuth = app.getUser().isPrivilege('camera:sysUserCamera:api:list');
		menuBar.exponentAuth =app.getUser().isPrivilege('exponent:report:api');
		menuBar.whsOnlineAuth =app.getUser().isPrivilege('warehouse:online:api');
		
		proccessBack();
		createSubPage();
		//关闭 splash
		plus.navigator.closeSplashscreen();
		document.addEventListener("netchange", onNetChange, false);
		//在ios平台，这个事件是在应用切换到前台是触发的
		document.addEventListener("pause", function(){
			//stopCheckLogin();
			document.removeEventListener("netchange",onNetChange);
		}, false);
		document.addEventListener("resume", function(){
			//startCheckLogin();
			document.addEventListener("netchange", onNetChange, false);
		}, false);
		initPush();
	}
	/**
	 * 创建子界面
	 */
	function createSubPage() {
		var self = plus.webview.currentWebview();
		for(var i = subpages.length - 1; i >= 0; i--) {
			//如果没有创建
			if(!plus.webview.getWebviewById(subpages[i])) {
				var sub = plus.webview.create(subpages[i], subpages[i], subpageStyle);
				self.append(sub);
			}
		}
		//showMainAndCloseLogin();
	}
	
	function initPush(){
		plus.push.addEventListener("click", function(msg) {
			// 分析msg.payload处理业务逻辑
			var payload = null;
			//收到ios平台推送信息
			if(msg.aps){
				//alert is ios plaform self define data
				payload = msg.msg.aps.alert.payload;
			}else{
				//self create msg payload is object
				payload = msg.payload;
			}
			//m.alert("You clicked: " +payload);
			//console.log(payload);
		}, false);
		// 监听在线消息事件
		plus.push.addEventListener("receive", function(msg) {
			//android 平台msg.payload为String类型,ios则不会
			if(typeof msg.payload === 'string'){
				msg.payload = JSON.parse(msg.payload);
			}
			plus.push.createMessage(msg.payload.content,JSON.stringify(msg.payload), {
				title:msg.payload.title
			});
		}, false);
	}
	
	/**
	 * init main page and close login page
	 */
	function showMainAndCloseLogin() {
		window.setTimeout(function() {
			plus.nativeUI.closeWaiting();
			var ws = plus.webview.currentWebview();
			ws.show();
			var loginView = getLoginWebView();
			if(loginView) {
				loginView.close();
			}
		}, 1500);
	}

	/**
	 * 处理后退
	 */
	function proccessBack() {
		var backButtonPress = 0;
		m.back = function(event) {
			backButtonPress++;
			if(backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	}
	/**
	 * 检测网络正常
	 */
	function onNetChange() {
		var nt = plus.networkinfo.getCurrentType();
		switch(nt) {
			case plus.networkinfo.CONNECTION_ETHERNET:
			case plus.networkinfo.CONNECTION_WIFI:
				m.toast("切换到wifi网络!");
				break;
			case plus.networkinfo.CONNECTION_CELL2G:
			case plus.networkinfo.CONNECTION_CELL3G:
			case plus.networkinfo.CONNECTION_CELL4G:
				m.toast("切换到移动网络!");
				break;
			default:
				m.toast("无网络，请检查网络配置!");
				break;
		}
	}
	

	//当前激活选项
	var activeTab = subpages[0];
	//选项卡点击事件
	m('.mui-bar-tab').on('tap', 'a', function(e) {
		var targetTab = this.getAttribute('href');
		if(targetTab == activeTab) {
			return;
		}
		var ws = plus.webview.getWebviewById(targetTab);
		//显示目标选项卡
		//若为iOS平台或非首次显示，则直接显示
		if(mui.os.ios || aniShow[targetTab]) {
			ws.show();
		} else {
			//否则，使用fade-in动画，且保存变量
			var temp = {};
			temp[targetTab] = "true";
			aniShow = m.extend(aniShow, temp);
			ws.show("fade-in", 300);
		}
		m.fire(ws, "tab-active");
		m.fire(ws, "refreshList");
		//隐藏当前;
		plus.webview.hide(activeTab);
		//更改当前活跃的选项卡
		activeTab = targetTab;
		//use mui default add  and remove active tab 
		m.targets.tab = this;
	});

	function checkLogin() {
		//如果token 有效直接跳过登录
		m.getJSON(app.api_url + "/api/check?_t=" + new Date().getTime(), {
			token: app.getToken()
		}, function(data) {
			//如果token没有超时
			if(data.tokenExpire) {
				window.clearInterval(checkLoginIntervel);
				if(data.msg) {
					m.alert(data.msg, function() {
						toLogin();
					}, "提示", "确定");
				} else {
					toLogin();
				}
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
			waiting: {
				autoShow: true
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

	function getLoginWebView() {
		var loginView = null;
		var wvs = plus.webview.all();
		for(var i = 0, len = wvs.length; i < len; i++) {
			var url = wvs[i].getURL()
			if(url && url.indexOf("login.html") != -1) {
				loginView = wvs[i];
				break;
			}
		}
		return loginView;
	}
	//ios平台应用切换到后台时，定时任务是不会执行，但android平台是会一直执行的
	//checkLoginIntervel = window.setInterval(checkLogin, 4000);

	function startCheckLogin() {
		checkLoginIntervel = window.setInterval(checkLogin, 4000);
	}

	function stopCheckLogin() {
		window.clearInterval(checkLoginIntervel);
	}
	
	/**
	 * 跳车到指定tab url
	 * @param {String} url
	 */
	function toTab(url) {
		console.log('toTab1')
		var index = 0;
		for(var i = 0; i < subpages.length; i++) {
			if(url === subpages[i]) {
				index = i;
				break;
			}
		}
		m.trigger(tabItems[index], 'tap');
		
		/*var freshView= plus.webview.getWebviewById(url);
		console.log('triger')
		m.fire(freshView, "refreshList", {});*/
		
	}
	
	return {
		'toTab': toTab
	}
});