define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var echarts = require('echarts');
	var inventoryExponentVue = require('./warehouse-inventory-exponent.js');
	var inOutputExponentVue = require('./warehouse-io-exponent.js');
	var distributionVue = require('./warehouse-distribution.js');

	/*(function initData(){
		var gallery = mui('.mui-slider');
		if(distributAuth){
			gallery.slider().gotoItem(0);
		}else if(inventoryAuth){
			gallery.slider().gotoItem(1);
		}else if(ioAuth){
			gallery.slider().gotoItem(2);
		}
		
	})();*/
	m.init();	
	
	
	/**
	 * 
	 */
	m.plusReady(function() {
		var distributAuth=app.getUser().isPrivilege('warehouse:online:distribut:api');
		var inventoryAuth=app.getUser().isPrivilege('warehouse:online:inventory:api');
		var ioAuth=app.getUser().isPrivilege('warehouse:online:io:api');
		
		var prosLen = 4;
		var menuSliderControl = new Vue({
			el: "#menuSliderControl",
			data: {
				distributAuth:distributAuth,
				inventoryAuth:inventoryAuth,
				ioAuth:ioAuth,
			}
		});
		
		function switchTab(event){
			if(event.detail){
			if(event.detail.slideNumber === 0 &&distributAuth) {
				distributionVue.initMap();
			} else if(event.detail.slideNumber === 1&&inventoryAuth) {
				inventoryExponentVue.inventoryExponentQuery();
			} else if(event.detail.slideNumber === 2 && ioAuth) {
				inOutputExponentVue.inOutputExpoentQuery();
			} else {
		
			}}
		}
		/**
		 * 页签切换事件监听
		 */
		document.querySelector('#slider').addEventListener('slide', switchTab);
		
		
		var gallery = mui('.mui-slider');
		var e={};
		if(distributAuth){
			e={detail:{slideNumber:0}}
			gallery.slider().gotoItem(0);
		}else if(inventoryAuth){
			e={detail:{slideNumber:1}}
			gallery.slider().gotoItem(1);
		}else if(ioAuth){
			e={detail:{slideNumber:2}}
			gallery.slider().gotoItem(2);
		}
		switchTab(e);
	});

});