define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("../../../js/common/common.js");

	var outingDetailsView = null;
	var ws = null;

	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		detailVue.materialDetails = ws.materialDetails;
		detailVue.initShow();
		
		outingDetailsView = plus.webview.getWebviewById('outing-details');

		var backDefault = m.back;
		function detailBack() {
			m.fire(outingDetailsView, "comeBack", {});
			backDefault();
		}
		m.back = detailBack;
		
		//设置footer绝对位置
		document.getElementById('nav_footer').style.top = (plus.display.resolutionHeight - 45) + "px";
	});

//	$("#txt_real_num").blur(function() {
//		if(!isPositiveInteger($("#txt_real_num").val())) {
//			alert('实提数量数据格式不正确，请输入非零正整数');
//			return;
//		}
//	});
//
//	$("#txt_real_weight").blur(function() {
//		if(!isValidResNum($("#txt_real_weight").val(), 'weight')) {
//			alert('实提重量数据格式不正确，格式为正整数、小数（保留小数点后三位）');
//			return;
//		}
//	});

	var detailVue = new Vue({
		el: '#body_material_details',
		data: {
			materialDesc: '',
			realNum: '', //实提数量
			realWeight: '', //实提重量
			materialDetails: [] //物料明细
		},
		methods: {
			initShow: function() {
				var self = this;
				if(self.materialDetails) {
					self.realNum = self.materialDetails.realNum ? self.materialDetails.realNum : '0';
					self.realWeight = self.materialDetails.realWeight ? self.materialDetails.realWeight : '0';
				}
			},
			submit: function() {
				var self = this;
				if(!isPositiveInteger(self.realNum)) {
					alert('实提数量数据格式不正确，请输入非零正整数');
					return;
				}
				if(!isValidResNum(self.realWeight, 'weight')) {
					alert('实提重量数据格式不正确，格式为正整数、小数（保留小数点后三位）');
					return;
				}
				self.materialDetails.realNum = self.realNum;
				self.materialDetails.realWeight = self.realWeight;
				self.materialDetails.realPickInfo = self.materialDetails.realNum + self.materialDetails.realNumUnitDesc + "/" + self.materialDetails.realWeight + self.materialDetails.realWeightUnitDesc;
//				var outingDetailsView = plus.webview.getWebviewById('outing-details');
				m.fire(outingDetailsView, "updateMaterialRealPickInfo", {
					//					newRealNum: self.realNum,
					//					newRealWeight: self.realWeight,
					materialDetails: self.materialDetails
				});
				m.back();
			}
		}
	});

});