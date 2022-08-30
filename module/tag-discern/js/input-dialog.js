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
		inputVue.inputType = currView.inputType;
		inputVue.inputValue = currView.inputValue;

		inputVue.loadData();
	});

	var inputVue = new Vue({
		el: "#body_input_dialog",
		data: {
			pageSourceId: '',
			title: '',
			inputType: 1, // 1:车船号 2:备注
			inputPlaceHolder: '',
			inputValue: ''
		},
		methods: {
			loadData: function() {
				var self = this;
				self.title = self.inputType == 1 ? '车船号' : '备注';
				self.inputPlaceHolder = self.inputType == 1 ? '请输入车船号' : '请输入备注';
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
				var sourcePage = plus.webview.getWebviewById(self.pageSourceId);
				if(sourcePage) {
					m.fire(sourcePage, "inputConfirm", {
						inputType: self.inputType,
						inputValue: self.inputValue
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