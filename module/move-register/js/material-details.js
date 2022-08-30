define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
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
		detailVue.materialType = ws.materialType;
		detailVue.warehouseId = ws.warehouseId;
		detailVue.materialDetails = ws.materialDetails;
		//		alert(JSON.stringify(detailVue.materialDetails));
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
		el: '#body_material_details',
		data: {
			type: -1, //0:移库登记;1:改单;
			materialType: -1, //0:新增;1:修改;
			warehouseId: '',
			materialDesc: '', //物料描述
			packageNo: '', // 捆包号
			supplyNum: '', // 原数量
			supplyNumUnitDesc: '件', // 原数量单位
			supplyWeight: '', // 原重量
			supplyWeightUnitDesc: '吨', // 原重量单位
			moveNum: '', // 移库数量
			moveNumUnitDesc: '件', // 移库数量单位
			moveWeight: '', // 移库重量
			moveWeightUnitDesc: '吨', // 移库重量单位
			oldWarehousePlaceId: '',
			oldWarehousePlace: '',
			newWarehousePlaceId: '',
			newWarehousePlace: '',
			storeyNo: '', // 层号
			materialDetails: [], //物料明细
			warehousePlaceList: []
		},
		methods: {
			initShow: function() {
				var self = this;
				if(self.materialDetails) {
					self.materialDesc = self.materialDetails.materialDesc;
					self.packageNo = self.materialDetails.packageNo; // 捆包号
					self.supplyNum = self.materialDetails.supplyNum;
					//					self.supplyNumUnitDesc = self.materialDetails.supplyNumUnitDesc; 
					self.supplyWeight = self.materialDetails.supplyWeight;
					//					self.supplyWeightUnitDesc = self.materialDetails.supplyWeightUnitDesc;
					self.moveNum = self.materialDetails.moveNum ? self.materialDetails.moveNum : self.supplyNum;
					self.moveNumUnitDesc = self.materialDetails.moveNumUnitDesc;
					self.moveWeight = self.materialDetails.moveWeight ? self.materialDetails.moveWeight : self.supplyWeight;
					self.moveWeightUnitDesc = self.materialDetails.moveWeightUnitDesc;
					self.oldWarehousePlaceId = self.materialDetails.oldWarehousePlaceId;
					self.oldWarehousePlace = self.materialDetails.oldWarehousePlace;
					self.newWarehousePlaceId = self.materialDetails.newWarehousePlaceId;
					self.newWarehousePlace = self.materialDetails.newWarehousePlace;
					self.storeyNo = self.materialDetails.storeyNo; // 层号
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
				self.newWarehousePlaceId = item.id;
				self.newWarehousePlace = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('warehousePlaceList', false);
			},
			submit: function() {
				var self = this;
//				if(!isNotBlank(self.packageNo)) {
//					alert('请填写捆包号');
//					return;
//				}
				if(!isPositiveInteger(self.moveNum)) {
					alert('移库数量数据格式不正确，请输入非零正整数');
					return;
				} else if(self.moveNum > self.supplyNum) {
					alert('移库数量不能大于原数量');
					return;
				}
				if(!isValidResNum(self.moveWeight, 'weight')) {
					alert('移库重量数据格式不正确，格式为正整数、小数（保留小数点后三位）');
					return;
				} else if(self.moveWeight > self.supplyWeight) {
					alert('移库重量不能大于原重量');
					return;
				}
				if(!isNotBlank(self.newWarehousePlaceId)) {
					alert('请选择新库位');
					return;
				}
				//				if(self.materialType == 0) {
				//					self.materialDetails.id = '';
				//					self.materialDetails.forecastDetailId = '';
				//				}
				self.materialDetails.packageNo = self.packageNo; // 捆包号
				self.materialDetails.supplyNum = self.supplyNum;
				self.materialDetails.supplyWeight = self.supplyWeight;
				self.materialDetails.moveNum = self.moveNum;
				self.materialDetails.moveWeight = self.moveWeight;
				self.materialDetails.moveInfo = self.materialDetails.moveNum + self.materialDetails.moveNumUnitDesc + "/" + self.materialDetails.moveWeight + self.materialDetails.moveWeightUnitDesc;
				self.materialDetails.newWarehousePlaceId = self.newWarehousePlaceId;
				self.materialDetails.newWarehousePlace = self.newWarehousePlace;
				self.materialDetails.storeyNo = self.storeyNo; // 层号
				if(app.debug) {
					console.log(JSON.stringify(self.materialDetails));
				}
				m.fire(editView, "updateMaterialList", {
					type: self.type,
					materialType: self.materialType,
					materialDetail: self.materialDetails
				});
				m.back();
			}
		}
	});

});