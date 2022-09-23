define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("jquery")
	require("../../../js/common/common.js");
	require("../../../js/common/select2.full.js")
	function formatState(state) {
	    var $state = $(
		  '<div style="position: relative;z-index: 4;font-size: 13px;display: block;border-bottom: 1px solid #ebebeb;background: white;opacity: 1;padding: 10px 0 10px 15px;margin: 0;">' + state.text + '</div>'
	    )
	    return $state
	}
	function timestampToTime(timestamp) {
		var date = new Date(timestamp);
		var Y = date.getFullYear() + '-';
		var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1):date.getMonth()+1) + '-';
		var D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())+ ' ';
		var h = (date.getHours() < 10 ? '0'+date.getHours():date.getHours())+ ':';
		var m = (date.getMinutes() < 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
		var s = date.getSeconds() < 10 ? '0'+date.getSeconds():date.getSeconds();
		return Y+M+D+h+m+s;
	}
	var ws=null;
	m.plusReady(function() {
		console.log('————————————————————————————————————————————in')
	});
	var aboutVue = new Vue({
		el: '#app',
		data: {
		},
		methods:{
		}
	});
});