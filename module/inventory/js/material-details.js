define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("../../../js/common/common.js");

	var inventoryRegisterView = null;
	var ws = null;
	var swaiting = null;

	m.init();

	m(".select-box .content").scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		//		indicators: false
	});

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		detailVue.warehouseId = ws.warehouseId;
		detailVue.materialDetails = ws.materialDetails;
		detailVue.bindBasicData();
		detailVue.initShow();

		inventoryRegisterView = plus.webview.getWebviewById('inventory-register');

		var backDefault = m.back;

		function detailBack() {
			m.fire(inventoryRegisterView, "comeBack", {});
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
			warehouseId: '',
			materialDesc: '',
			checkNum: '', //盘点数量
			checkWeight: '', //盘点重量
			checkWarehousePlaceId: '', // 库位ID
			checkWarehousePlaceName: '', // 库位
			warehousePlaceList: [],
			materialDetails: [] //物料明细
		},
		methods: {
			initShow: function() {
				var self = this;
				if(self.materialDetails) {
					self.checkNum = self.materialDetails.checkNum ? self.materialDetails.checkNum : self.materialDetails.num;
					self.checkWeight = self.materialDetails.checkWeight ? self.materialDetails.checkWeight : self.materialDetails.weight;
					self.checkWarehousePlaceId = self.materialDetails.checkWarehousePlaceId ? self.materialDetails.checkWarehousePlaceId : self.materialDetails.warehousePlaceId;
					self.checkWarehousePlaceName = 
					self.materialDetails.checkWarehousePlaceName ? self.materialDetails.checkWarehousePlaceName : self.materialDetails.warehousePlaceName;
				}
			},
			bindBasicData: function() {
				var self = this;
				//获取所有库位
				m.getJSON(app.api_url + '/api/sysBusinessBasis/placeInfos', {
					warehouseId: self.warehouseId
				}, function(data) {
					for(var i = 0; i < data.length; i++) {
						self.warehousePlaceList.push({
							"text": data[i].text,
							"id": data[i].id
						});
					}
				});
			},
			showSelectBox: function(id) {
				var self = this;
				if(id == 'warehousePlaceList') {
					$("#warehousePlaceList.select-box").css({
						display: 'block'
					});
				}
				$(".cyq_mask").css({
					visibility: 'visible'
				});
			},
			hideSelectBox: function(id, isSure) {
				var self = this;
				if(id == 'warehousePlaceList') {
					$("#warehousePlaceList.select-box").css({
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
			pickWarehousePlace: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.checkWarehousePlaceId = item.id;
				self.checkWarehousePlaceName = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('warehousePlaceList', false);
			},
			submit: function() {
				var self = this;
				if(!isPositiveInteger(self.checkNum)) {
					alert('盘点数量数据格式不正确，请输入非零正整数');
					return;
				}
				if(!isValidResNum(self.checkWeight, 'weight')) {
					alert('盘点重量数据格式不正确，格式为正整数、小数（保留小数点后三位）');
					return;
				}
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('加载中...');
				}
				var apiUrl = app.api_url + '/api/proCheck/updateDetail?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: self.materialDetails.id,
						warehouseId: self.warehouseId,
						checkNum: self.checkNum,
						checkWeight: self.checkWeight,
						checkWarehousePlaceId: self.checkWarehousePlaceId
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 20000, //超时时间设置为10秒；
					success: function(data) {
						if(swaiting) {
							swaiting.close();
						}
						if(data) {
							if(app.debug) {
								console.log(JSON.stringify(data));
							}
							if(data.status) {
								m.fire(inventoryRegisterView, "refreshInventoryRegister", {});
								m.back();
							} else {
								m.toast(data.msg);
							}
						}
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						if(app.debug) {
							console.log(xhr + "|" + type + "|" + errorThrown);
						}
						m.toast("网络异常，请重新试试");
					}
				});
			}
		}
	});

});