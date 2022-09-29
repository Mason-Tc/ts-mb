define(function(require, exports, module) {
	var debug = true;//是否开启调试

	// api 调用地址
	var api_url="http://10.124.26.42:8090";//dev环境
	// var api_url="http://10.124.24.229:8080/";//dev环境
	// var api_url="http://10.124.26.71:8084/";//dev环境
	// var api_url="http://192.168.0.57/";//test环境
	//  var api_url="http://10.124.169.156:8083/";//prod环境
    // var api_url="http://120.132.241.213/";//prod环境
	// var api_url="http://222.240.195.27:8888/";//test环境
	// var api_url="http://192.168.0.90:8080/";//stage环境
	
	// websocket地址
	var ws_url = "ws://10.124.26.42:8090/";//dev环境
	// var ws_url = "ws://10.124.24.229:8080//";//dev环境
	// var ws_url = "ws://10.124.26.71:8084//";//dev环境
	// var ws_url = "ws://192.168.0.57/";//test环境
	//var ws_url = "ws://10.124.169.156:8083/";//prod环境
	// var ws_url = "ws://120.132.241.213/";//prod环境
//	var ws_url = "ws://192.168.0.90:8080/";//stage环境
	//当前用户token
	
	var _token = '';
	var isCheckUpdate = true;//是否检测app版本
	var pdaModel = "PDT-90P";
	var user = {
		userName:'',//用户名(手机号)
		password:'',//密码
		warehouse:'',//用户所属仓库（可能为空
		autoLogin:true,//是否自动登录
		flUserId:'',//fl系统用户id
		userDisplayName:'',//系统用户显示名字
		flUserCompanyId:'',//fl系统用户公司id
		flUserCompanyName:'',//fl系统用户公司名字
		flUserDepId:'',//fl系统用户部门id
		flUserDepName:'',//fl系统用户部门名字
		privilegeList:[],//权限集合,
		//是否有privilegeName权限
		isPrivilege:function(privilegeName){
			for(var i=0;i<this.privilegeList.length;i++){
				if(privilegeName === this.privilegeList[i].permission){
					return true;
				}
			}
			return false;
		}
	};
	
	//wgt 版本更新
	var wgt ={
		wgtPath:'',
		version:'',
		preVersion:'',//升级前版本
	};
	
	//fl系统字典表数据列表
	var flDictList = [];
	
	function setToken(token){
		_token = token;
		plus.storage.setItem("token",_token);
	}
	
	function getToken(){
		if(_token){
			return _token;
		}
		_token  = plus.storage.getItem("token")
		return _token;
	}
	
	/**
	 * 获取当前用户
	 * @return {User}  user
	 */
	function getUser(){
		var tmp = null;
		this.user = user;
		tmp = plus.storage.getItem("crm_user");
		if(tmp){
			tmp = JSON.parse(tmp); 
			for(var p in tmp){
				this.user[p] = tmp[p];
			}
		}
		return this.user;
	}
	
	/**
	 * 设置当前用户
	 * @param {Object} user
	 */
	function setUser(us){
		if(!this.user){
			this.user = getUser();
		}
		for(var p in us){
			this.user[p] = us[p];
		}
		plus.storage.setItem("crm_user",JSON.stringify(this.user));
	}
	
	function setWgt(wgt){
		if(!this.wgt){
			this.wgt = getWgt();
		}
		for(var p in wgt){
			this.wgt[p] = wgt[p];
		}
		plus.storage.setItem("wgt",JSON.stringify(this.wgt));
	}
	
	function getWgt(){
		var tmp = null;
		this.wgt = wgt;
		tmp = plus.storage.getItem("wgt");
		if(tmp){
			tmp = JSON.parse(tmp); 
			for(var p in tmp){
				this.wgt[p] = tmp[p];
			}
		}
		return this.wgt;
	}
	
	/**
	 * 设置fl字典数据列表
	 * @param {Array} flDictListData
	 */
	function setFlDictListData(flDictListData){
		this.flDictLists  = flDictListData;
		window.localStorage.setItem("flDictListData",JSON.stringify(flDictListData));
	}
	
	/**
	 * 获取fl 字典对应type 对应value 的显示值
	 * @param {String} type
	 * @param {String} value
	 */
	function getFlDictDataLabel(type, value) {
		//如果没有字典数据,就从本地读取一次
		if(flDictList.length === 0){
			var tmp = null;
			try{
				tmp = JSON.parse(window.localStorage.getItem("flDictListData"));
				flDictList = (tmp === null?[{label:'',value:'',type:''}]:tmp);
			}catch(e){
				
			}
		}
		var label = ""
		for(var i = 0; i < flDictList.length; i++) {
			if(flDictList[i].type == type && flDictList[i].value == value) {
				label = flDictList[i].label;
				break;
			}
		}
		return label;
	}
	
	/**
	 * 获取fl 字典对应type 
	 * @param {String} type
	 */
	function getFlDictDataLabelList(type) {
		//如果没有字典数据,就从本地读取一次
		if(flDictList.length === 0){
			var tmp = null;
			try{
				tmp = JSON.parse(window.localStorage.getItem("flDictListData"));
				flDictList = (tmp === null?[{label:'',value:'',type:''}]:tmp);
			}catch(e){
				
			}
		}
		var list = [];
		for(var i = 0; i < flDictList.length; i++) {
			if(flDictList[i].type == type) {
				list.push(flDictList[i]);
			}
		}
		return list;
	}
	function getRootPath(){
		var wvs = plus.webview.all();
		if(wvs.length > 0){
			var url = wvs[0].getURL();
			var start = url.indexOf("/module");
			return url.substring(0,start);
		}
		return null;
	}
	
	return {
		'debug':debug,
		'isCheckUpdate':isCheckUpdate,
		'api_url':api_url,
		'ws_url':ws_url,
		'pdaModel': pdaModel,
		'setToken':setToken,
		'getToken':getToken,
		'setUser':setUser,
		'getUser':getUser,
		'setWgt': setWgt,
		'getWgt': getWgt,
		'setFlDictListData':setFlDictListData,
		'getFlDictDataLabel':getFlDictDataLabel,
		'getFlDictDataLabelList':getFlDictDataLabelList
	}
});