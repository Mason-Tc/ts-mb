define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var $=require("zepto");
    var checkPhoneButton = document.getElementById('checkPhone');
    var errorButton = document.getElementById('error');
	m.init({
		statusBarBackground: '#f7f7f7',
		swipeBack:true //启用右滑关闭功能

	});
	
	function hide(objid){
   		 document.getElementById(objid).style.display="none";
	}
	
	function show(objid){
	    document.getElementById(objid).style.display="block";
	}

	function checkPhone(phone){
		if(!(/^1\d{10}$/.test(phone))){
			show('error');
			return false;
		}else{
			hide('error');
		}
		return true;
	}
	
	function toUpdatePassword(randomCode,token,phone) {
		
		m.openWindow({
			id: 'update-password',
			"url": './update-password.html',
			extras:{
		        randomCode:randomCode,
		        token:token,
		        phone:phone
		    },
			show: {
				aniShow: 'pop-in'
			},
			waiting: {
				autoShow: true
			}
		});

	}
	
	
	function getSmsRandomCode(phone) {
		$("#checkPhone").attr({"disabled":"disabled"});
		m.ajax(app.api_url + '/api/wms/user/getSmsRandomCode', {
			data: {
				'phone': phone,
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 120000, //超时时间设置为2分钟；
			success: function(data) {
				$("#checkPhone").removeAttr("disabled");
				if(data.success){
					//服务器返回响应，根据响应结果，分析验证码是否发送成功；
					toUpdatePassword(data.randomCode,data.token,phone);
				}else{
					m.toast(data.msg);
				}
			},
			error: function(xhr, type, errorThrown) {
			}
		});
	}
	
    checkPhoneButton.addEventListener('click',function(event) {
    	var phone = document.getElementById('phone').value;
		if(checkPhone(phone)){
			getSmsRandomCode(phone);
			}
		}
    )
  



});