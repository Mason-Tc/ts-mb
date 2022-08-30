define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");

	var aboutVue = new Vue({
		el: '#about-detail',
		data: {
			version: '',
			innerVersion: ''
		}
	});
	m.plusReady(function() {
		aboutVue.version = plus.runtime.version;
		aboutVue.innerVersion = plus.runtime.innerVersion;
		plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
			//appid属性
			var wgtStr = "appid:" + wgtinfo.appid;
			//version属性
			wgtStr += "<br/>version:" + wgtinfo.version;
			//name属性
			wgtStr += "<br/>name:" + wgtinfo.name;
			//description属性
			wgtStr += "<br/>description:" + wgtinfo.description;
			//author属性
			wgtStr += "<br/>author:" + wgtinfo.author;
			//email属性
			wgtStr += "<br/>email:" + wgtinfo.email;
			//licence属性
			wgtStr += "<br/>license:" + wgtinfo.license;
			//licensehref属性
			wgtStr += "<br/>licensehref:" + wgtinfo.licensehref;
			//features 属性
			wgtStr += "<br/>features:" + wgtinfo.features;
			console.log(wgtStr);
		});
	});
});