define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("../../../js/common/common.js");

	var waiting = null;

	m.init();

	m.plusReady(function() {
		var currView = plus.webview.currentWebview();
		inputVue.pageSourceId = currView.pageSourceId;
		inputVue.processType = currView.processType;
		inputVue.bridgeCraneItem = currView.bridgeCraneItem;

		inputVue.loadData();
	});

	var inputVue = new Vue({
		el: "#body_input_dialog",
		data: {
			pageSourceId: '',
			title: '',
			processType: 0, //0:add 1:update
			bridgeCraneId: '',
			bridgeCraneName: '',
			bridgeCraneDesc: '',
			bridgeCraneItem: ''
		},
		methods: {
			loadData: function() {
				var self = this;
				self.title = '行车信息';
				self.bridgeCraneId = self.bridgeCraneItem ? self.bridgeCraneItem.id : '';
				self.bridgeCraneName = self.bridgeCraneItem ? self.bridgeCraneItem.bridgeCraneName : '';
				self.bridgeCraneDesc = self.bridgeCraneItem ? self.bridgeCraneItem.bridgeCraneDesc : '';
			},
			cancel: function() {
				var self = this;
				var sourcePage = plus.webview.getWebviewById(self.pageSourceId);
				if(sourcePage) {
					m.fire(sourcePage, "closeMask");
				}
			},
			confirm: function() {
				var self = this;
				if(!isNotBlank(self.bridgeCraneName)) {
					alert('请输入行车名称');
					return;
				}
				var sourcePage = plus.webview.getWebviewById(self.pageSourceId);
				self.bridgeCraneItem.bridgeCraneName = self.bridgeCraneName;
				self.bridgeCraneItem.bridgeCraneDesc = self.bridgeCraneDesc;
				if(app.debug) {
					console.log(JSON.stringify(self.bridgeCraneItem));
				}
				if(sourcePage) {
					m.fire(sourcePage, "updateBridgeCraneList", {
						processType: self.processType,
						bridgeCraneItem: self.bridgeCraneItem
					});
				}
			}
		}
	});

	m.back = function() {
		inputVue.cancel();
	}

	return inputVue;
});