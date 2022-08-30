define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("jquery");
	require("../../../js/common/common.js");

	var editView = null;
	var ws = null;

	m.init();

	m(".select-box .content").scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		//		indicators: false
	});

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		detailVue.type = ws.type;
		detailVue.costType = ws.costType;
		detailVue.totalWht = ws.totalWht;
		detailVue.warehouseId = ws.warehouseId;
		detailVue.priceModeList = ws.priceModeList;
		detailVue.priceTemplateList = ws.priceTemplateList;
		detailVue.costDetails = ws.costDetails;
		detailVue.bindBasicData();
		detailVue.initShow();

		editView = plus.webview.getWebviewById('move-edit');

		var backDefault = m.back;

		function detailBack() {
			m.fire(editView, "comeBack", {});
			backDefault();
		}
		m.back = detailBack;

		//设置footer绝对位置
		document.getElementById('nav_footer').style.top = (plus.display.resolutionHeight - 45) + "px";
	});

	var detailVue = new Vue({
		el: '#body_cost_details',
		data: {
			type: -1, //0:移库登记;1:改单;
			costType: -1, //0:新增;1:修改;
			warehouseId: '',
			spendItemId: '', // 费用项目ID
			spendItemName: '', // 费用项目名称
			brandId: '', // 品名ID	
			brandName: '', //品名
			spenderId: '', //结算单位ID
			spenderName: '', //结算单位
			paymentMode: '', //结算方式ID
			paymentModeDesc: '', //结算方式
			priceMode: '', // 计价方式ID
			priceModeDesc: '', // 计价方式
			totalWht: '',
			settlementWeight: '', //结算量
			unitPrice: '', //单价
			detailMoney: '', //金额
			spendTemplate: '',//费用模板
			priceModeList: [], // 计价方式列表
			priceTemplateList: [],
			costDetails: [], //费用明细
			brandList: [], //品名列表
			spendItemList: [], //费用项目列表
			spenderList: [], //结算单位列表
			paymentModeList: [{
					value: '1',
					text: '现结'
				},
				{
					value: '2',
					text: '月结'
				}
			]
		},
		methods: {
			initShow: function() {
				var self = this;
				//				alert('costDetails:'+JSON.stringify(self.costDetails));
				if(self.costDetails) {
					self.spendItemId = self.costDetails.spendItemId;
					self.spendItemName = self.costDetails.spendItemName;
					self.brandId = self.costDetails.brandId;
					self.brandName = self.costDetails.brandName;
					self.spenderId = self.costDetails.spenderId;
					self.spenderName = self.costDetails.spenderName;
					self.paymentMode = self.costDetails.paymentMode ? self.costDetails.paymentMode : '2';
					self.paymentModeDesc = self.costDetails.paymentModeDesc ? self.costDetails.paymentModeDesc : '月结';
					self.spendTemplate = self.costDetails.spendTemplate;
					self.priceMode = self.costDetails.priceMode ? self.costDetails.priceMode : '1';
					self.priceModeDesc = self.costDetails.priceModeDesc ? self.costDetails.priceModeDesc : self.spendTemplate == '09' ? '每单' : '登记重量';
					self.settlementWeight = self.costDetails.settlementWeight ? self.costDetails.settlementWeight :  self.totalWht;
					self.unitPrice = self.costDetails.unitPrice;
					self.detailMoney = self.costDetails.detailMoney;
				}
			},
			bindBasicData: function() {
				var self = this;
				//获取费用项目
				m.getJSON(app.api_url + '/api/sysBusinessBasis/getSpendItemJson', function(data) {
					if(data && data.length > 0) {
						for(var i = 0; i < data.length; i++) {
							self.spendItemList.push({
								"text": data[i].spendItemName,
								"value": data[i].id
							});
						}
					}
				});
				//获取基础数据 品名
				m.getJSON(app.api_url + '/api/sysBusinessBasis/materialConditions', function(data) {
					if(data) {
						var brandList = data.brandList;
						if(brandList && brandList.length > 0) {
							for(var i = 0; i < brandList.length; i++) {
								self.brandList.push({
									"text": brandList[i].text,
									"value": brandList[i].id
								});
							}
						}
					}
				});
				//获取结算单位
				m.getJSON(app.api_url + '/api/sysBusinessBasis/customerInfo?customerType=1', function(data) {
					for(var i = 0; i < data.length; i++) {
						self.spenderList.push({
							"value": data[i].id,
							"text": data[i].text
						});
					}
				});
			},
			getSpendTemplate: function() {
				var self = this;
				var apiUrl = app.api_url + '/api/proMoveApi/getSpendTemplate?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: self.spendItemId
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 20000, //超时时间设置为10秒；
					success: function(data) {
						if(data){
							var oldSpendTemplate = self.spendTemplate;
							self.spendTemplate = data.spendTemplate;
//							alert(self.spendTemplate);
							if(self.spendTemplate == '09'){
								self.priceMode = '1';
								self.priceModeDesc = '每单';
							}else{
								self.priceMode = '1';
								self.priceModeDesc = '登记重量';
							}
							if(oldSpendTemplate != self.spendTemplate){
								self.settlementWeight = '';
								self.unitPrice = '';
							}
						}
					},
					error: function(xhr, type, errorThrown) {
						if(app.debug) {
							console.log(xhr + "|" + type + "|" + errorThrown);
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			showSelectBox: function(id) {
				var self = this;
				if(id == 'spendItemList') {
					$("#spendItemList.select-box").css({
						display: 'block'
					});
				} else if(id == 'brandList') {
					$("#brandList.select-box").css({
						display: 'block'
					});
				} else if(id == 'spenderList') {
					$("#spenderList.select-box").css({
						display: 'block'
					});
				} else if(id == 'paymentModeList') {
					$("#paymentModeList.select-box").css({
						display: 'block'
					});
				} else if(id == 'priceModeList') {
					$("#priceModeList.select-box").css({
						display: 'block'
					});
				}
				$(".cyq_mask").css({
					visibility: 'visible'
				});
			},
			hideSelectBox: function(id, isSure) {
				var self = this;
				if(id == 'spendItemList') {
					$("#spendItemList.select-box").css({
						display: 'none'
					});
				} else if(id == 'brandList') {
					$("#brandList.select-box").css({
						display: 'none'
					});
				} else if(id == 'spenderList') {
					$("#spenderList.select-box").css({
						display: 'none'
					});
				} else if(id == 'paymentModeList') {
					$("#paymentModeList.select-box").css({
						display: 'none'
					});
				} else if(id == 'priceModeList') {
					$("#priceModeList.select-box").css({
						display: 'none'
					});
				} else if(!id) {
					$(".select-box").css({
						display: 'none'
					});
				}
				$(".cyq_mask").css({
					visibility: 'hidden'
				});
			},
			pickSpendItem: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.spendItemId = item.value;
				self.spendItemName = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('spendItemList', false);
			},
			pickBrand: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.brandId = item.value;
				self.brandName = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('brandList', false);
			},
			pickSpender: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.spenderId = item.value;
				self.spenderName = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('spenderList', false);
			},
			pickPaymentMode: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.paymentMode = item.value;
				self.paymentModeDesc = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('paymentModeList', false);
			},
			pickPriceMode: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.priceMode = item.value;
				self.priceModeDesc = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('priceModeList', false);
			},
			submit: function() {
				var self = this;
				if(!isNotBlank(self.spendItemId)) {
					alert('请选择费用项目');
					return;
				}
				if(!isNotBlank(self.spenderId)) {
					alert('请选择结算单位');
					return;
				}
				if(!isNotBlank(self.paymentMode)) {
					alert('请选择结算方式');
					return;
				}
				if(!isNotBlank(self.priceMode)) {
					alert('请选择计价方式');
					return;
				}
				if(!isValidResNum(self.settlementWeight, 'weight')) {
					alert('结算量数据格式不正确，格式为正整数或小数（保留小数点后三位）');
					return;
				}
				if(!isValidResNum(self.unitPrice, 'price')) {
					alert('单价数据格式不正确，格式为正整数或小数（保留小数点后两位）');
					return;
				}
				if(!isValidResNum(self.detailMoney, 'price')) {
					alert('金额数据格式不正确，格式为正整数或小数（保留小数点后两位）');
					return;
				}
				//				if(self.costType == 0){
				//					self.costDetails.id = '';
				//					self.costDetails.forecastDetailId = '';
				//					self.costDetails.isReceived = '0';
				//				}
				self.costDetails.spendItemId = self.spendItemId;
				self.costDetails.spendItemName = self.spendItemName;
				self.costDetails.brandId = self.brandId;
				self.costDetails.brandName = self.brandName;
				self.costDetails.spenderId = self.spenderId;
				self.costDetails.spenderName = self.spenderName;
				self.costDetails.paymentMode = self.paymentMode;
				self.costDetails.paymentModeDesc = self.paymentModeDesc;
				self.costDetails.priceMode = self.priceMode;
				self.costDetails.priceModeDesc = self.priceModeDesc;
				self.costDetails.settlementWeight = self.settlementWeight;
				self.costDetails.unitPrice = self.unitPrice;
				self.costDetails.detailMoney = self.detailMoney;
				self.costDetails.spendTemplate = self.spendTemplate;
				if(app.debug) {
					console.log(JSON.stringify(self.costDetails));
				}
				m.fire(editView, "updateCostList", {
					type: self.type,
					costType: self.costType,
					costDetail: self.costDetails
				});
				m.back();
			}
		}
	});
	
	detailVue.$watch('spendItemId', function() {
		detailVue.getSpendTemplate();
	});

	detailVue.$watch('settlementWeight', function() {
		if(!isNumber(detailVue.settlementWeight) || !isNumber(detailVue.unitPrice)) {
			detailVue.detailMoney = '0';
			return;
		}
		detailVue.detailMoney = com.accMul(detailVue.settlementWeight, detailVue.unitPrice).toFixed(2);
	});

	detailVue.$watch('unitPrice', function() {
		if(!isNumber(detailVue.settlementWeight) || !isNumber(detailVue.settlementWeight)) {
			detailVue.detailMoney = '0';
			return;
		}
		detailVue.detailMoney = com.accMul(detailVue.settlementWeight, detailVue.unitPrice).toFixed(2);
	});

});