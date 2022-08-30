define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var $=require("zepto");

    m.plusReady(function() {
		var modify = document.getElementById('modify');
		var randomCode =null;
		var token = null;
		var phone = null;
		var newPassword =null;
		
		modify.addEventListener("click",function(){
				var oldPassword = $("#old-password").val();
				var password1 = $("#new-password").val();
				var password2 = $("#new-confirm-password").val();
				if(checkNewPassword(password1,password2)){
					modifyPassword(oldPassword,password1);
				}
			});
			function checkOldPassword(password,callback){
			     var waiting = plus.nativeUI.showWaiting("修改中...", {
					back: 'transmit'
				});
			
				m.ajax(app.api_url + '/api/fl/user/checkOldPwd', {
					data: {
						'password': password
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 120000, //超时时间设置为10秒；
					success: function(data) {
						//服务器返回响应，根据响应结果，分析是否登录成功；
						waiting.close();
						flag = data;
						if(!flag){
							show('error1');
						}else{
							callback(password);
						}
					},
					error: function(xhr, type, errorThrown) {
						waiting.close();
						m.toast("网络异常，请重新试试");
					}
				});
		//		m.getJSON(app.api_url + '/api/checkOldPwd?password='+password+'_t=' + new Date().getTime(), function(data) {
		//			flag = data;
		//		});
			return flag;
			}
			function checkNewPassword(password1,password2){
				if(password1 == "" || password2 == "" || password1 != password2){
					plus.nativeUI.alert("请确保两次新密码不为空且相同！");
					return false;
				}else{
					if(password1.length<7){
						plus.nativeUI.alert("请确保新密码长度不小于8！");
						return false;
					}else{
						return true;
					}
				}
			}
			function modifyPassword(oldPassword,newPassword){
				var waiting = plus.nativeUI.showWaiting("修改中...", {
					back: 'transmit'
				});
				m.ajax(app.api_url + '/api/fl/user/modifyPwd', {
					data: {
						'oldPassword': oldPassword,
						'newPassword': newPassword
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 120000, //超时时间设置为10秒；
					success: function(data) {
						//服务器返回响应，根据响应结果，分析是否登录成功；
						waiting.close();
						if(data.success){
							plus.nativeUI.alert(data.msg,function(e){
								app.setUser({
									'userName': app.getUser().userName,
									'password': '',
									autoLogin:true
							});
								toLogin()
							});
						}else{
							plus.nativeUI.alert(data.msg);
						}
						
					},
					error: function(xhr, type, errorThrown) {
						waiting.close();
						m.toast("网络异常，请重新试试");
					}
				});
			}
			function toLogin(){
				//清空密码
				app.getUser().password='';
				app.getUser().autoLogin = false;
				app.setUser(app.getUser());
				m.openWindow({
					id: 'login',
					"url": '../../login/html/login.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: false
					}
				});
				window.setTimeout(function(){
					var wvs = plus.webview.all();
		            for (var i = 0, len = wvs.length; i < len; i++) {
		                if (wvs[i].getURL().indexOf("login.html") != -1) {
		                    continue;
		                }
		                wvs[i].close();
		              }
				},1000);
			}
		
		
	    var self = plus.webview.currentWebview();
		randomCode = self.randomCode;
		token = self.token;
	});
	
	m.init({
		statusBarBackground: '#f7f7f7'

	});
//	
//	function hide(objid){
// 		 document.getElementById(objid).style.display="none";
//	}
//	
//	function show(objid){
//	    document.getElementById(objid).style.display="block";
//	}

});