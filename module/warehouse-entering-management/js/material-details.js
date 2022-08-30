define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("../../../js/common/common.js");

	var receivingView = null;
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
		detailVue.bindBasicData();
		detailVue.initShow();
		
		receivingView = plus.webview.getWebviewById('receiving-register');

		var backDefault = m.back;
		function detailBack() {
			m.fire(receivingView, "comeBack", {});
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
			type: -1, //0:收货登记;1:改单;
			materialType: -1, //0:新增;1:修改;2:展示
			warehouseId: '',
			brandId: '', // 品名ID	
			brandName: '', //品名
			textureId: '', // 材质ID
			textureName: '', //材质
			specificationId: '', // 规格ID
			specificationName: '', //规格
			placesteelId: '', // 产地ID
			placesteelName: '', //产地
			packageNo: '', // 捆包号
			receivableNum: 0, // 应收数量
			receivableNumUnitDesc: '件', // 应收数量单位
			receivableWeight: 0, // 应收重量
			receivableWeightUnitDesc: '吨', // 应收重量单位
			realNum: 0, // 实收数量
			realNumUnitDesc: '件', // 实收数量单位
			realWeight: 0, // 实收重量
			realWeightUnitDesc: '吨', // 实收重量单位
			warehousePlaceId: '', // 库位ID
			warehousePlaceName: '', // 库位
			storeyNo: '', // 层号
			carNo: '', // 车船号
			countWeightMode: '', // 计量方式（数据字典）
			countWeightModeDesc: '', // 计量方式
			materialDetails: [], //物料明细
			brandList: [],
			textureMap: {},
			textureList: [],
			specificationList: [],
			placesteelList: [],
			warehousePlaceList: [],
			countWeightModeList: [{
					value: '01',
					text: '理计'
				},
				{
					value: '02',
					text: '磅计'
				},
				{
					value: '03',
					text: '抄码'
				}
			]
		},
		methods: {
			initShow: function() {
				var self = this;
				if(self.materialDetails) {
					self.brandId = self.materialDetails.brandId; // 品名ID	
					self.brandName = self.materialDetails.brandName; //品名
					self.textureId = self.materialDetails.textureId; // 材质ID
					self.textureName = self.materialDetails.textureName; //材质
					self.specificationId = self.materialDetails.specificationId; // 规格ID
					self.specificationName = self.materialDetails.specificationName; //规格
					self.placesteelId = self.materialDetails.placesteelId; // 产地ID
					self.placesteelName = self.materialDetails.placesteelName; //产地
					var materialDesc = self.materialDetails.materialDesc;
					if(materialDesc) {
						var materialDescAry = materialDesc.split(' ');
						self.brandName = materialDescAry[0] ? materialDescAry[0] : '';
						self.specificationName = materialDescAry[1] ? materialDescAry[1] : '';
						self.textureName = materialDescAry[2] ? materialDescAry[2] : '';
						self.placesteelName = materialDescAry[3] ? materialDescAry[3] : '';
					}
					self.packageNo = self.materialDetails.packageNo; // 捆包号
					self.receivableNum = self.materialDetails.receivableNum; // 应收数量
					self.receivableNumUnitDesc = self.materialDetails.receivableNumUnitDesc; // 应收数量单位
					self.receivableWeight = self.materialDetails.receivableWeight; // 应收重量
					self.receivableWeightUnitDesc = self.materialDetails.receivableWeightUnitDesc; // 应收重量单位
					self.realNum = self.materialDetails.realNum; // 实收数量
					self.realNumUnitDesc = self.materialDetails.realNumUnitDesc; // 实收数量单位
					self.realWeight = self.materialDetails.realWeight; // 实收重量
					self.realWeightUnitDesc = self.materialDetails.realWeightUnitDesc; // 实收重量单位
					self.warehousePlaceId = self.materialDetails.warehousePlaceId; // 库位ID
					self.warehousePlaceName = self.materialDetails.warehousePlaceName; // 库位
					self.storeyNo = self.materialDetails.storeyNo; // 层号
					self.carNo = self.materialDetails.carNo; // 车船号
					self.countWeightMode = self.materialDetails.countWeightMode; // 计量方式（数据字典）
					self.countWeightModeDesc = self.materialDetails.countWeightModeDesc; // 计量方式
				}
			},
			bindBasicData: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/sysBusinessBasis/materialConditions', function(data) {
					//										alert(JSON.stringify(data))
					if(data) {
						self.textureMap = data.textureMap;
						//						self.textureList = eval('data.textureMap._' + self.brandId);
						//						alert(JSON.stringify(self.textureList));
						var brandList = data.brandList;
						if(brandList && brandList.length > 0) {
							for(var i = 0; i < brandList.length; i++) {
								self.brandList.push({
									"text": brandList[i].text,
									"id": brandList[i].id
								});
							}
						}
						var specificationList = data.specificationList;
						if(specificationList && specificationList.length > 0) {
							for(var i = 0; i < specificationList.length; i++) {
								self.specificationList.push({
									"text": specificationList[i].text,
									"id": specificationList[i].id
								});
							}
						}
						var placesteelList = data.placesteelList;
						if(placesteelList && placesteelList.length > 0) {
							for(var i = 0; i < placesteelList.length; i++) {
								self.placesteelList.push({
									"text": placesteelList[i].text,
									"id": placesteelList[i].id
								});
							}
						}
					}
				});
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
				if(id == 'brandList') {
					$("#brandList.select-box").css({
						display: 'block'
					});
				} else if(id == 'textureList') {
					$("#textureList.select-box").css({
						display: 'block'
					});
				} else if(id == 'specificationList') {
					$("#specificationList.select-box").css({
						display: 'block'
					});
				} else if(id == 'placesteelList') {
					$("#placesteelList.select-box").css({
						display: 'block'
					});
				} else if(id == 'warehousePlaceList') {
					$("#warehousePlaceList.select-box").css({
						display: 'block'
					});
				} else if(id == 'countWeightModeList') {
					$("#countWeightModeList.select-box").css({
						display: 'block'
					});
				}
				$(".cyq_mask").css({
					visibility: 'visible'
				});
			},
			hideSelectBox: function(id, isSure) {
				var self = this;
				if(id == 'brandList') {
					//					if(isSure) {
					//						self.brandId = self.in_brandId;
					//						self.brandName = self.in_brandName;
					//					}
					$("#brandList.select-box").css({
						display: 'none'
					});
				} else if(id == 'textureList') {
					$("#textureList.select-box").css({
						display: 'none'
					});
				} else if(id == 'specificationList') {
					$("#specificationList.select-box").css({
						display: 'none'
					});
				} else if(id == 'placesteelList') {
					$("#placesteelList.select-box").css({
						display: 'none'
					});
				} else if(id == 'warehousePlaceList') {
					$("#warehousePlaceList.select-box").css({
						display: 'none'
					});
				} else if(id == 'countWeightModeList') {
					$("#countWeightModeList.select-box").css({
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
			pickBrand: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.brandId = item.id;
				self.brandName = item.text;
				self.textureId = '';
				self.textureName = '';
				self.textureList = eval('self.textureMap._' + self.brandId);
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('brandList', false);
			},
			pickTexture: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.textureId = item.id;
				self.textureName = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('textureList', false);
			},
			pickSpecification: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.specificationId = item.id;
				self.specificationName = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('specificationList', false);
			},
			pickPlacesteel: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.placesteelId = item.id;
				self.placesteelName = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('placesteelList', false);
			},
			pickWarehousePlace: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.warehousePlaceId = item.id;
				self.warehousePlaceName = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('warehousePlaceList', false);
			},
			pickCountWeightMode: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.countWeightMode = item.value;
				self.countWeightModeDesc = item.text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('countWeightModeList', false);
			},
			submit: function() {
				var self = this;
				if(!isNotBlank(self.brandId)) {
					alert('请选择品名');
					return;
				}
				if(!isNotBlank(self.textureId)) {
					alert('请选择材质');
					return;
				}
				if(!isNotBlank(self.specificationId)) {
					alert('请选择规格');
					return;
				}
				if(!isNotBlank(self.placesteelId)) {
					alert('请选择产地');
					return;
				}
				if(!isNotBlank(self.packageNo)) {
					alert('请填写捆包号');
					return;
				}
				if(!isPositiveInteger(self.receivableNum)) {
					alert('应收数量数据格式不正确，请输入非零正整数');
					return;
				}
				if(!isValidResNum(self.receivableWeight, 'weight')) {
					alert('应收重量数据格式不正确，格式为正整数、小数（保留小数点后三位）');
					return;
				}
				if(!isPositiveInteger(self.realNum)) {
					alert('实收数量数据格式不正确，请输入非零正整数');
					return;
				}
				if(!isValidResNum(self.realWeight, 'weight')) {
					alert('实收重量数据格式不正确，格式为正整数、小数（保留小数点后三位）');
					return;
				}
				if(!isNotBlank(self.warehousePlaceId)) {
					alert('请选择库位');
					return;
				}
				if(!isNotBlank(self.carNo)) {
					alert('请填写车船号');
					return;
				}
				if(!isNotBlank(self.countWeightMode)) {
					alert('请选择计量方式');
					return;
				}
				if(self.materialType == 0){
					self.materialDetails.id = '';
					self.materialDetails.forecastDetailId = '';
					self.materialDetails.isReceived = '0';
				}
				self.materialDetails.brandId = self.brandId;
				self.materialDetails.brandName = self.brandName;
				self.materialDetails.textureId = self.textureId;
				self.materialDetails.textureName = self.textureName;
				self.materialDetails.specificationId = self.specificationId;
				self.materialDetails.specificationName = self.specificationName;
				self.materialDetails.placesteelId = self.placesteelId;
				self.materialDetails.placesteelName = self.placesteelName;
				self.materialDetails.materialDesc = self.brandName + ' ' + self.textureName + ' ' + self.specificationName + ' ' + self.placesteelName;
				self.materialDetails.packageNo = self.packageNo; // 捆包号
				self.materialDetails.receivableNum = self.receivableNum; // 应收数量
				self.materialDetails.receivableWeight = self.receivableWeight; // 应收重量
				self.materialDetails.realNum = self.realNum; // 实收数量
				self.materialDetails.realWeight = self.realWeight; // 实收重量
				self.materialDetails.realPickInfo = self.materialDetails.realNum + self.materialDetails.realNumUnitDesc + "/" + self.materialDetails.realWeight + self.materialDetails.realWeightUnitDesc;
				self.materialDetails.warehousePlaceId = self.warehousePlaceId; // 库位ID
				self.materialDetails.warehousePlaceName = self.warehousePlaceName; // 库位
				self.materialDetails.storeyNo = self.storeyNo; // 层号
				self.materialDetails.carNo = self.carNo; // 车船号
				self.materialDetails.countWeightMode = self.countWeightMode; // 计量方式（数据字典）
				self.materialDetails.countWeightModeDesc = self.countWeightModeDesc; // 计量方式
				console.log(JSON.stringify(self.materialDetails))
//				var receivingView = plus.webview.getWebviewById('receiving-register');
				m.fire(receivingView, "updateMaterialList", {
					type: self.type,
					materialType: self.materialType,
					materialDetail: self.materialDetails
				});
				m.back();
			}
		}
	});

});