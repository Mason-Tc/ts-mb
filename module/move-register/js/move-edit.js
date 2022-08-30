define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("jquery");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("moment");
	require("../../../js/common/common.js");

	m.init();
	var ws = null;
	var swaiting = null;

	var pdaModel = app.pdaModel;
	var materielListHight;

	m('#div_basic_info_scroll').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	m('#div_cost_scroll').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	var nowTime = moment().format('YYYY-MM-DD HH:mm');
	var moveDatePicker = new m.DtPicker({
		"type": "datetime",
		"value": nowTime
	});
	var ownerNamePicker = new m.PopPicker();
	var paymentModePicker = new m.PopPicker();
	var warehousePicker = new m.PopPicker();
	var spenderPicker = new m.PopPicker();
	var contractOwnerPicker = new m.PopPicker();
	var nativeWebview, imm, InputMethodManager;

	var slider = m("#slider").slider();
	slider.setStopped(true); //禁止滑动

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		detailVue.type = ws.type;
		detailVue.moveDetails = ws.moveDetails;
		if(app.debug) {
			console.log('detailVue.moveDetails:' + JSON.stringify(detailVue.moveDetails));
		}
		detailVue.forecastDetailID = ws.forecastDetailID;
		detailVue.isFullNew = ws.isFullNew;
		detailVue.moveDate = nowTime;
		detailVue.isPDA = plus.device.model == pdaModel;
		detailVue.getOwnerList();
		detailVue.getSpenderList();
		detailVue.getWarehouseList();
		detailVue.initShow();
		if(detailVue.type == '0'){
			detailVue.getContractOwnerList();
		}
		
		if(plus.device.model == pdaModel) {
			//监听选择器的"取消"按钮，在其点击事件里将焦点归还至获取二维码的文本框
			m("body").on("tap", ".mui-dtpicker-header > button", function() {
				setFocusForScanner();
			});
			m("body").on("tap", ".mui-poppicker-header > button", function() {
				setFocusForScanner();
			});
		}

		var backDefault = m.back;

		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			backDefault();
		}
		m.back = detailBack;

		//设置footer绝对位置
		document.getElementById('nav_footer').style.top = (plus.display.resolutionHeight - 40) + "px";
	});

	var detailVue = new Vue({
		el: '#div_detail',
		data: {
			type: -1,
			moveId: '',
			isFullNew: false,
			warehouseId: '', // 仓库ID
			warehouseName: '',
			moveCode: '', // 移库单号
			moveDate: '', // 移库日期
			contractFit: '0',
			ownerId: '', // 货主单位ID
			ownerName: '', //货主单位
			spenderId: '', // 结算单位ID
			spenderName: '', //结算单位
			paymentModeId: '', //结算方式ID
			paymentMode: '', //结算方式
			contractOwnerId: '', //计费合同id
			contractOwnerName: '',	//计费合同
			brandId: '',
			reason: '', // 移库原因
			//			totalStr: '(0/0)',
			totalWht: '',
			totalStr: '(扫码添加)',
			totalInfo: '合计: 0件/0吨', //物料总计显示
			//			isBatchAdd: app.getUser().isPrivilege('outing:pick:batchadd'),
			isBatchAdd: true,
			isPDA: false,
			forecastDetailID: '',
			tempMaterielJsonStr: '',
			tempMaterielInfo: [],
			tempCostJsonStr: '',
			tempCostInfo: [],
			moveDetails: [],
			accountDueDetailList: [],
			ownerNameList: [],
			materielList: [], //物料信息List
			spenderList: [], //结算单位List
			warehouseList: [],
			contractOwnerList: [], //计费合同List
			priceModeList: [], //计价方式
			priceTemplateList: [], //管理费模板计价方式
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
				if(self.moveDetails) {
					if(app.debug) {
						console.log(JSON.stringify(self.moveDetails));
					}
					//					alert(JSON.stringify(self.moveDetails));
					if(self.moveDetails.proMove) {
						//						alert(JSON.stringify(self.moveDetails.proMove));
						self.contractFit = self.moveDetails.proMove.contractFit ? self.moveDetails.proMove.contractFit : '0';
						self.accountDueDetailList = (!self.moveDetails.proMove.accountDueDetailList || self.moveDetails.proMove.accountDueDetailList.length < 1) ? [] : self.moveDetails.proMove.accountDueDetailList;
						//						alert("accountDueDetailList:" +JSON.stringify(self.accountDueDetailList));
						self.moveId = self.type == 0 ? '' : self.moveDetails.proMove.id;
						self.warehouseId = self.moveDetails.proMove.warehouseId;
						self.warehouseName = self.moveDetails.proMove.warehouseShortName;
						self.getContractOwnerList();
						self.moveCode = self.moveDetails.proMove.moveCode;
						self.moveDate = self.moveDetails.proMove.moveDate;
						self.ownerId = self.moveDetails.proMove.ownerId;
						self.ownerName = self.moveDetails.proMove.ownerName;
						self.spenderId = self.moveDetails.proMove.spenderId ? self.moveDetails.proMove.spenderId : '';
						self.spenderName = self.moveDetails.proMove.spenderName;
						//判断结算单位是否需关联计费合同单位
						var apiUrl = app.api_url + '/api/sysBusinessBasis/isContractOwner?id= '+ self.spenderId +'&warehouseId=' + self.warehouseId + '&billDate=' + self.moveDate;
						m.ajax(apiUrl, {
							dataType: 'json', //服务器返回json格式数据
							type: 'GET', //HTTP请求类型
							timeout: 10000, //超时时间设置为10秒；
							async: false,
							success: function(data) {
								if(data == '0'){
									// 返回值为“0”表明需切换计费合同值为结算单位id
									self.contractOwnerId = self.spenderId;
									self.contractOwnerName = self.spenderName;
									contractOwnerPicker.pickers[0].setSelectedValue(self.contractOwnerName);
								}
							},
							error: function(xhr, type, errorThrown) {
								m.toast("网络异常，请重新试试");
							}
						});
						self.paymentModeId = self.moveDetails.proMove.paymentMode ? self.moveDetails.proMove.paymentMode : '2';
						self.paymentMode = self.moveDetails.proMove.paymentModeStr ? self.moveDetails.proMove.paymentModeStr : '月结';
						self.reason = self.moveDetails.proMove.reason;
					}
					if(self.moveDetails.priceModeList && self.moveDetails.priceModeList.length > 0) {
						m.each(self.moveDetails.priceModeList, function(index, item) {
							self.priceModeList.push({
								"text": item.label,
								"value": item.value
							});
						});
					}
					if(self.moveDetails.priceTemplateList && self.moveDetails.priceTemplateList.length > 0) {
						m.each(self.moveDetails.priceTemplateList, function(index, item) {
							self.priceTemplateList.push({
								"text": item.label,
								"value": item.value
							});
						});
					}
					self.materielList = self.moveDetails.moveList;
					if(app.debug) {
						console.log("initShow materielList:" + JSON.stringify(self.materielList));
					}
					if(self.materielList && self.materielList.length > 0) {
						self.tempMaterielJsonStr = JSON.stringify(self.materielList[0]);
						m.each(self.materielList, function(index, item) {
							if(item) {
								item.processId = 'li_' + index;
								if(self.type == 0) {
									item.inventoryId = item.id;
									item.oldWarehousePlaceId = item.warehousePlaceId;
									item.oldWarehousePlace = item.warehousePlace;
									item.newWarehousePlaceId = "";
									item.newWarehousePlace = "";
									item.warehouseInfo = "";
									item.supplyNum = item.num;
									item.supplyWeight = item.weight;
									item.moveNum = "";
									item.moveWeight = "";
									item.moveNumUnitDesc = "件";
									item.moveWeightUnitDesc = "吨";
									item.moveInfo = "";
								} else {
									item.inventoryId = item.newInventoryId;
									//									var warehouseInfo = "";
									//									if(item.newWarehousePlace && item.storeyNo) {
									//										warehouseInfo = item.newWarehousePlace + "/" + item.storeyNo;
									//									} else if(item.newWarehousePlace && !item.storeyNo) {
									//										warehouseInfo = item.newWarehousePlace;
									//									} else if(!item.newWarehousePlace && item.storeyNo) {
									//										warehouseInfo = item.storeyNo;
									//									} else if(!item.newWarehousePlace && !item.storeyNo) {
									//										warehouseInfo = "";
									//									}
									item.warehouseInfo = !item.newWarehousePlace ? "" : item.newWarehousePlace;
									item.moveInfo = (item.moveNum ? item.moveNum : '0') + item.moveNumUnitDesc + "/" + (item.moveWeight ? item.moveWeight : '0') + item.moveWeightUnitDesc;
								}
							}
						});
					} else {
						self.tempMaterielJsonStr = "{\"id\":\"\",\"isNewRecord\":false,\"officeId\":\"2\",\"remarks\":\"\",\"createBy\":{\"id\":\"\",\"isNewRecord\":false,\"officeId\":\"\",\"userName\":\"\",\"userStatus\":\"\",\"initPassw\":0,\"admin\":false,\"cstmrTypeDesc\":\"未知类型\",\"roleNames\":\"\",\"isAdmin\":false},\"createDate\":\"2018-11-09 16:01:30\",\"updateBy\":{\"id\":\"921\",\"isNewRecord\":false,\"officeId\":\"\",\"userStatus\":\"\",\"initPassw\":0,\"admin\":false,\"cstmrTypeDesc\":\"未知类型\",\"roleNames\":\"\",\"isAdmin\":false},\"updateDate\":\"2018-11-09 16:01:30\",\"materialDesc\":\"\",\"brandId\":\"\",\"textureId\":\"\",\"specificationId\":\"\",\"placesteelId\":\"\",\"receivableNum\":0,\"receivableNumUnit\":\"01\",\"receivableWeight\":0,\"receivableWeightUnit\":\"01\",\"realNum\":0,\"realNumUnit\":\"01\",\"realWeight\":0,\"realWeightUnit\":\"01\",\"countWeightMode\":\"\",\"carNo\":\"\",\"packageNo\":\"\",\"printNum\":0,\"brandName\":\"\",\"forecastDetailId\":\"\",\"isReceived\":\"0\",\"receivableNumUnitDesc\":\"件\",\"receivableWeightUnitDesc\":\"吨(t)\",\"countWeightModeDesc\":\"\",\"realNumUnitDesc\":\"件\",\"realWeightUnitDesc\":\"吨(t)\",\"processId\":\"li_0\",\"realPickInfo\":\"0件/0吨(t)\",\"textureName\":\"\",\"specificationName\":\"\",\"placesteelName\":\"\",\"warehousePlaceId\":0,\"warehousePlaceName\":\"\",\"storeyNo\":\"\"}";
					}
					if(self.accountDueDetailList && self.accountDueDetailList.length > 0) {
						self.tempCostJsonStr = JSON.stringify(self.accountDueDetailList[0]);
						//						alert('self.tempCostJsonStr:'+JSON.stringify(self.tempCostJsonStr));
						m.each(self.accountDueDetailList, function(index, item) {
							if(item) {
								item.spenderId = self.spenderId;
								item.spenderName = self.spenderName;
								item.processId = 'li_' + index;
							}
						});
					} else {
						self.tempCostJsonStr = "{\"id\":\"\",\"isNewRecord\":false,\"officeId\":\"\",\"remarks\":\"\",\"createBy\":{\"id\":\"\",\"isNewRecord\":false,\"officeId\":\"\",\"userStatus\":\"\",\"initPassw\":0,\"admin\":false,\"isAdmin\":false,\"cstmrTypeDesc\":\"\",\"roleNames\":\"\"},\"createDate\":\"\",\"updateBy\":{\"id\":\"\",\"isNewRecord\":false,\"officeId\":\"\",\"userStatus\":\"\",\"initPassw\":0,\"admin\":false,\"isAdmin\":false,\"cstmrTypeDesc\":\"\",\"roleNames\":\"\"},\"updateDate\":\"\",\"accountDueId\":0,\"spendItemId\":0,\"spendItemName\":\"\",\"spendTemplate\":\"\",\"spenderId\":\"\",\"ownerId\":\"\",\"paymentMode\":\"\",\"inventoryId\":\"\",\"brandId\":\"\",\"brandName\": \"\",\"textureId\":\"\",\"textureName\":\"\",\"specificationId\":\"\",\"specificationName\":\"\",\"placesteelId\":\"\",\"placesteelName\":\"\",\"warehousePlaceType\":\"\",\"carNo\":\"\",\"priceMode\":\"\",\"businessNum\":0,\"businessWeight\":0,\"settlementWeight\":0,\"unitPrice\":0,\"detailMoney\":0,\"isAuto\":0,\"status\":\"\",\"paymentModeDesc\":\"\",\"transportModeDesc\":\"\",\"statusDesc\":\"\",\"priceModeDesc\":\"\",\"processId\":\"li_0\"}";
					}
					self.buildTotalInfo();
				}
			},
			initSpenderInfo: function() {
				var self = this;
				if(!self.spenderId && self.ownerId) {
					if(self.spenderList && self.spenderList.length > 0) {
						m.each(self.spenderList, function(index, item) {
							if(item) {
								if(item.text == self.ownerName) {
									self.spenderId = item.value;
									self.spenderName = item.text;
								}
							}
						});
					}
				}
			},
			onItemSliderClick: function($event, index) {
				var self = this;
				event.stopPropagation();
				slider.gotoItem(index);
				setFocusForScanner();
			},
			getOwnerList: function() {
				var self = this;
				m.getJSON(app.api_url + '/api/sysBusinessBasis/customerInfo?customerType=2', function(data) {
					for(var i = 0; i < data.length; i++) {
						self.ownerNameList.push({
							"value": data[i].id,
							"text": data[i].text
						});
					}
				});
			},
			getSpenderList: function() {
				var self = this;
				m.getJSON(app.api_url + '/api/sysBusinessBasis/customerInfo?customerType=1', function(data) {
					for(var i = 0; i < data.length; i++) {
						self.spenderList.push({
							"value": data[i].id,
							"text": data[i].text
						});
					}
					//					setTimeout(self.initSpenderInfo(), 100);
					self.initSpenderInfo();
				});
			},
			getWarehouseList: function() {
				var self = this;
				var apiUrl = app.api_url + '/api/sysBusinessBasis/warehouseInfos1?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					dataType: 'json', //服务器返回json格式数据
					type: 'GET', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					async: false,
					success: function(data) {
						for(var i = 0; i < data.length; i++) {
							self.warehouseList.push({
								"value": data[i].id,
								"text": data[i].text
							});
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			},
			getContractOwnerList: function(){
				var self = this;
				if(!isNotBlank(self.warehouseId)){
					return;
				}
				//清空选项
				self.contractOwnerList = [];
				var apiUrl = app.api_url + '/api/sysBusinessBasis/getContractOwnerJson?warehouseId=' + self.warehouseId + '&billDate=' + self.moveDate;
				m.ajax(apiUrl, {
					dataType: 'json', //服务器返回json格式数据
					type: 'GET', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					async: false,
					success: function(data) {
						for(var i = 0; i < data.length; i++) {
							self.contractOwnerList.push({
								"value": data[i].id,
								"text": data[i].text
							});
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			},
			pickMoveDate: function() {
				var self = this;
				if(self.type == 0) {
					moveDatePicker = new m.DtPicker({
						value: detailVue.moveDate
					});
					moveDatePicker.show(function(selectItems) {
						self.moveDate = selectItems.value;
						setFocusForScanner();
						//移库时间变更时清除并重新获取计费合同
						self.getContractOwnerList();
					});
				}
			},
			pickOwnerName: function() {
				var self = this;
				var originalOwner = self.ownerId;
				if(self.type == 0) {
					ownerNamePicker.setData(self.ownerNameList);
					ownerNamePicker.pickers[0].setSelectedValue(self.ownerId);
					ownerNamePicker.show(function(selectItems) {
						self.ownerName = selectItems[0].text;
						self.ownerId = selectItems[0].value;
						self.spenderId = '';
						self.spenderName = '';
						self.warehouseId = '';
						self.warehouseName = '';
						self.initSpenderInfo();
						if(originalOwner != selectItems[0].value)
							self.materielList = [];
						setFocusForScanner();
					});
				}
			},
			pickSpender: function() {
				var self = this;
				spenderPicker.setData(self.spenderList);
				spenderPicker.pickers[0].setSelectedValue(self.spenderId);
				spenderPicker.show(function(selectItems) {
				self.spenderName = selectItems[0].text;
				self.spenderId = selectItems[0].value;
				//判断结算单位是否需关联计费合同单位
				var apiUrl = app.api_url + '/api/sysBusinessBasis/isContractOwner?id= '+ self.spenderId +'&warehouseId=' + self.warehouseId + '&billDate=' + self.moveDate;
				m.ajax(apiUrl, {
					dataType: 'json', //服务器返回json格式数据
					type: 'GET', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					async: false,
					success: function(data) {
						if(data == '0'){
							// 返回值为“0”表明需切换计费合同值为结算单位id
							self.contractOwnerId = self.spenderId;
							self.contractOwnerName = self.spenderName;
							contractOwnerPicker.pickers[0].setSelectedValue(self.contractOwnerName);
						}else{
							self.contractOwnerId = '';
							self.contractOwnerName = '';
							contractOwnerPicker.pickers[0].setSelectedValue(self.contractOwnerName);
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
					if(self.accountDueDetailList && self.accountDueDetailList.length > 0) {
						m.each(self.accountDueDetailList, function(index, item) {
							if(item) {
								item.spenderId = self.spenderId;
								item.spenderName = self.spenderName;
								$('#spn_' + item.processId).text(item.spenderName);
							}
						});
					}
					setFocusForScanner();
				});
			},
			pickPaymentMode: function() {
				var self = this;
				if(!isNotBlank(self.warehouseId)){
					alert("请选择仓库！");
					return;
				}
				paymentModePicker.setData(self.paymentModeList);
				paymentModePicker.pickers[0].setSelectedValue(self.paymentModeId);
				paymentModePicker.show(function(selectItems) {
					self.paymentMode = selectItems[0].text;
					self.paymentModeId = selectItems[0].value;
					setFocusForScanner();
				});
			},
			pickWarehouse: function() {
				var self = this;
				var originalWarehouse = self.warehouseId;
				warehousePicker.setData(self.warehouseList);
				warehousePicker.pickers[0].setSelectedValue(self.warehouseId);
				if(self.type == 0) {
					warehousePicker.show(function(selectItems) {
						self.warehouseId = selectItems[0].value;
						self.warehouseName = selectItems[0].text;
						//仓库变更时清除并重新获取计费合同
						self.getContractOwnerList();
						if(originalWarehouse != selectItems[0].value)
							self.materielList = [];
						setFocusForScanner();
					});
				}
			},
			pickContractOwner: function() {
				var self = this;
				//仓库变更时重新获取计费合同
				contractOwnerPicker.setData(self.contractOwnerList);
				contractOwnerPicker.pickers[0].setSelectedValue(self.contractOwnerName);
				contractOwnerPicker.show(function(selectItems) {
					self.contractOwnerId = selectItems[0].value;
					self.contractOwnerName = selectItems[0].text;
					setFocusForScanner();
				});
			},
			buildTotalInfo: function() {
				var self = this;
				if(self.materielList && self.materielList.length > 0) {
					var totalNum = 0;
					var totalWeight = 0.0;
					var moveNumUnitDesc = "";
					var moveWeightUnitDesc = "";
					var receivedCount = 0;
					m.each(self.materielList, function(index, itm) {
						if(itm) {
							//							if(itm.isReceived == '1') {
							//								receivedCount++;
							//							}
							//							if(self.type == 0) {
							//								moveNumUnitDesc = itm.numUnitDesc;
							//								moveWeightUnitDesc = itm.weightUnitDesc;
							//								var realNumUnit = itm.num ? parseInt(itm.num) : 0;
							//								var realWeight = itm.weight ? parseFloat(itm.weight) : 0;
							//								totalNum = com.accAdd(totalNum, realNumUnit);
							//								totalWeight = com.accAdd(totalWeight, realWeight);
							//							} else {
							//								moveNumUnitDesc = itm.moveNumUnitDesc;
							//								moveWeightUnitDesc = itm.moveWeightUnitDesc;
							//								var realNumUnit = itm.moveNum ? parseInt(itm.moveNum) : 0;
							//								var realWeight = itm.moveWeight ? parseFloat(itm.moveWeight) : 0;
							//								totalNum = com.accAdd(totalNum, realNumUnit);
							//								totalWeight = com.accAdd(totalWeight, realWeight);
							//							}
							moveNumUnitDesc = itm.moveNumUnitDesc;
							moveWeightUnitDesc = itm.moveWeightUnitDesc;
							var realNumUnit = itm.moveNum ? parseInt(itm.moveNum) : 0;
							var realWeight = itm.moveWeight ? parseFloat(itm.moveWeight) : 0;
							totalNum = com.accAdd(totalNum, realNumUnit);
							totalWeight = com.accAdd(totalWeight, realWeight);
						}
					});
					var totalWeightStr = isDecimal(totalWeight) ? totalWeight.toFixed(3) : totalWeight;
					self.totalWht = totalWeightStr;
					//					self.totalStr = "(" + receivedCount + "/" + self.materielList.length + ")";
					self.totalInfo = "合计：" + totalNum + moveNumUnitDesc + "/" + totalWeightStr + moveWeightUnitDesc;
				} else {
					//					self.totalStr = "(0/0)";
					self.totalInfo = "合计：0件/0吨";
				}
			},
			toMaterialInfoPage: function($event, item, type) {
				var self = this;
				event.stopPropagation();
				if(type == 0) {
					self.tempMaterielInfo = JSON.parse(self.tempMaterielJsonStr);
					self.tempMaterielInfo.id = '';
					self.tempMaterielInfo.remarks = '';
					self.tempMaterielInfo.createDate = '';
					self.tempMaterielInfo.updateDate = '';
					self.tempMaterielInfo.receivingId = '';
					self.tempMaterielInfo.materialDesc = '';
					self.tempMaterielInfo.brandId = '';
					self.tempMaterielInfo.brandName = '';
					self.tempMaterielInfo.textureId = '';
					self.tempMaterielInfo.specificationId = '';
					self.tempMaterielInfo.placesteelId = '';
					self.tempMaterielInfo.receivableNum = '';
					self.tempMaterielInfo.receivableNumUnit = '01';
					self.tempMaterielInfo.receivableWeight = '';
					self.tempMaterielInfo.receivableWeightUnit = '01';
					self.tempMaterielInfo.realNum = '';
					self.tempMaterielInfo.realNumUnit = '01';
					self.tempMaterielInfo.realWeight = '';
					self.tempMaterielInfo.realWeightUnit = '01';
					self.tempMaterielInfo.countWeightMode = '';
					self.tempMaterielInfo.materialNo = '';
					self.tempMaterielInfo.carNo = '';
					self.tempMaterielInfo.packageNo = '';
					self.tempMaterielInfo.warehousePlaceId = '';
					self.tempMaterielInfo.warehousePlaceName = '';
					self.tempMaterielInfo.storeyNo = '';
					self.tempMaterielInfo.isReceived = '0';
					self.tempMaterielInfo.countWeightModeDesc = '';
					self.tempMaterielInfo.receivableNumUnitDesc = '件';
					self.tempMaterielInfo.realNumUnitDesc = '件';
					self.tempMaterielInfo.receivableWeightUnitDesc = '吨(t)';
					self.tempMaterielInfo.realWeightUnitDesc = '吨(t)';
					//					self.tempMaterielInfo.processId = 'li_0';
					//					self.tempMaterielInfo.realPickInfo = self.tempMaterielInfo.realNum + self.tempMaterielInfo.realNumUnitDesc + "/" + self.tempMaterielInfo.realWeight + self.tempMaterielInfo.realWeightUnitDesc;
					//										alert(JSON.stringify(self.tempMaterielInfo));
				}
				m.openWindow({
					id: 'material-details',
					url: '../html/material-details.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						"type": self.type, //0:移库登记;1:改单;
						"materialType": type, //0:新增;1:修改;
						"warehouseId": self.warehouseId,
						"materialDetails": (type == 0 ? self.tempMaterielInfo : item)
					}
				});
			},
			toCostInfoPage: function($event, item, type) {
				var self = this;
				event.stopPropagation();
				//				alert(JSON.stringify(item));
				if(type == 0) {
					self.tempCostInfo = JSON.parse(self.tempCostJsonStr);
					self.tempCostInfo.id = '';
					self.tempCostInfo.accountDueId = '';
					self.tempCostInfo.createDate = '';
					self.tempCostInfo.updateDate = '';
					self.tempCostInfo.spendItemId = '';
					self.tempCostInfo.spendItemName = '';
					self.tempCostInfo.spendTemplate = '';
					self.tempCostInfo.spenderId = self.spenderId;
					self.tempCostInfo.spenderName = self.spenderName;
					self.tempCostInfo.ownerId = '';
					self.tempCostInfo.paymentMode = '';
					self.tempCostInfo.inventoryId = '';
					self.tempCostInfo.brandId = '';
					self.tempCostInfo.brandName = '';
					self.tempCostInfo.textureId = '';
					self.tempCostInfo.textureName = '';
					self.tempCostInfo.specificationId = '';
					self.tempCostInfo.specificationName = '';
					self.tempCostInfo.placesteelId = '';
					self.tempCostInfo.placesteelName = '';
					self.tempCostInfo.warehousePlaceType = '';
					self.tempCostInfo.carNo = '';
					self.tempCostInfo.priceMode = '';
					self.tempCostInfo.businessNum = '';
					self.tempCostInfo.businessWeight = '';
					self.tempCostInfo.settlementWeight = '';
					self.tempCostInfo.unitPrice = '';
					self.tempCostInfo.detailMoney = '';
					self.tempCostInfo.isAuto = '';
					self.tempCostInfo.status = '';
					self.tempCostInfo.paymentModeDesc = '';
					self.tempCostInfo.transportModeDesc = '';
					self.tempCostInfo.statusDesc = '';
					self.tempCostInfo.priceModeDesc = '';
				} else {
					item.spenderId = self.spenderId;
					item.spenderName = self.spenderName;
				}
				m.openWindow({
					id: 'cost-details',
					url: '../html/cost-details.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						"type": self.type, //0:移库登记;1:改单;
						"costType": type, //0:新增;1:修改;
						"totalWht": self.totalWht,
						"warehouseId": self.warehouseId,
						"priceModeList": self.priceModeList,
						"priceTemplateList": self.priceTemplateList,
						"costDetails": (type == 0 ? self.tempCostInfo : item)
					}
				});
			},
			toInput: function($event, inputType, inputValue) {
				var self = this;
				event.stopPropagation();
				inputDialogClass.showInputDialog(ws, {
					width: '100%',
					height: '88%',
					top: '100',
					scrollIndicator: 'none',
					scalable: false,
					popGesture: 'none'
				}, {
					pageSourceId: ws.id,
					inputType: inputType,
					inputValue: inputValue
				}, function() {
					setFocusForScanner();
					inputDialogClass.closeMask();
				});
			},
			scannerQRCode: function() {
				var self = this;
				m.openWindow({
					id: 'read-qrcode',
					url: '../../barcode/html/read-qrcode.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						source: ws.id
					}
				});
			},
			scanner: function(qRCode) {
				var self = this;
				if(qRCode) {
					var warehouseId = self.warehouseId ? self.warehouseId : '';
					var ownerId = self.ownerId ? self.ownerId : '';
					var brandId = (!self.materielList || self.materielList.length < 1) ? '' : !self.materielList[0] ? '' : self.materielList[0].brandId;
					if(app.debug) {
						console.log("warehouseId:" + warehouseId + "|ownerId:" + ownerId + "|brandId:" + brandId + "|qRCode:" + qRCode);
					}
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					var apiUrl = app.api_url + '/api/proMoveApi/addMaterial?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							materialCode: qRCode
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
									console.log('scanner data:' + JSON.stringify(data));
								}
								//								if(ownerId && ownerId != "undefined" && (data.warehouseId != warehouseId || data.ownerId != ownerId || data.brandId != brandId)) {
								//									plus.device.beep(4);
								//									alert("添加资源需为相同仓库、相同货主、相同品名！");
								//									return;
								//								}
								if(data.scanResultFlag == '1') {
									plus.device.beep(4);
									alert("您目前没有对该物料的数据权限！");
									return;
								}
								var supplyNum = data.supplyNum ? data.supplyNum : 0;
								var supplyWeight = data.supplyWeight ? data.supplyWeight : 0;
								if(supplyNum <= 0 && supplyWeight <= 0) {
									plus.device.beep(4);
									alert("该物料已被锁货！");
									return;
								}
								if(self.materielList && self.materielList.length > 0) {
									var fOwnerId = self.materielList[0].ownerId;
									var fWarehouseId = self.materielList[0].warehouseId;
									var fBrandId = self.materielList[0].brandId;
									if(data.warehouseId != fWarehouseId || data.ownerId != fOwnerId || data.brandId != fBrandId) {
										plus.device.beep(4);
										alert("添加资源需为相同仓库、相同货主、相同品名！");
										return;
									}
									var tempMateriels = [];
									var firstItem = [];
									var isExisted = false;
									m.each(self.materielList, function(index, itm) {
										if(itm) {
											if(itm.inventoryId == data.id) {
												isExisted = true;
											}
										}
									});
									if(isExisted) {
										plus.device.beep(4);
										alert("该物料已存在于移库列表中，无需进行重复扫码！");
									} else {
										firstItem = data;
										firstItem.inventoryId = firstItem.id;
										firstItem.oldWarehousePlaceId = firstItem.warehousePlaceId;
										firstItem.oldWarehousePlace = firstItem.warehousePlace;
										firstItem.newWarehousePlaceId = "";
										firstItem.newWarehousePlace = "";
										firstItem.warehouseInfo = "";
										firstItem.supplyNum = firstItem.num;
										firstItem.supplyWeight = firstItem.weight;
										firstItem.moveNum = "";
										firstItem.moveWeight = "";
										firstItem.moveNumUnitDesc = "件";
										firstItem.moveWeightUnitDesc = "吨";
										firstItem.moveInfo = "";
										tempMateriels.push(firstItem);
										m.each(self.materielList, function(index, iem) {
											if(iem) {
												if(iem.inventoryId != firstItem.inventoryId) {
													tempMateriels.push(iem);
												}
											}
										});
										if(tempMateriels && tempMateriels.length > 0) {
											self.materielList = [];
											m.each(tempMateriels, function(index, im) {
												if(im) {
													im.processId = 'li_' + index;
													self.materielList.push(im);
												}
											});
										}
										if(app.debug) {
											console.log('self.materielList:' + JSON.stringify(self.materielList));
										}
										plus.device.beep(2);
										self.buildTotalInfo();
									}
								} else {
									if(self.isFullNew) {
										if(isNotBlank(self.ownerId) && isNotBlank(self.warehouseId) && (data.ownerId != self.ownerId || data.warehouseId != self.warehouseId)) {

											plus.device.beep(4);
											alert("添加资源需为相同仓库、相同货主、相同品名！");
											return;

										} else if(isNotBlank(self.ownerId) && !isNotBlank(self.warehouseId) && data.ownerId != self.ownerId) {
											plus.device.beep(4);
											alert("添加资源需为相同仓库、相同货主、相同品名！");
											return;
										}
										self.ownerId = data.ownerId;
										self.ownerName = data.owner;
										self.warehouseId = data.warehouseId;
										self.warehouseName = data.warehouse;
										self.initSpenderInfo();
										self.isFullNew = false;
									} else {
										if(isNotBlank(self.ownerId) && isNotBlank(self.warehouseId) && (data.ownerId != self.ownerId || data.warehouseId != self.warehouseId)) {

											plus.device.beep(4);
											alert("添加资源需为相同仓库、相同货主、相同品名！");
											return;

										} else if(isNotBlank(self.ownerId) && !isNotBlank(self.warehouseId) && data.ownerId != self.ownerId) {
											plus.device.beep(4);
											alert("添加资源需为相同仓库、相同货主、相同品名！");
											return;
										}
										if(!self.warehouseId) {
											self.warehouseId = data.warehouseId;
											self.warehouseName = data.warehouse;
										}
									}
									self.materielList = [];
									data.processId = 'li_0';
									data.inventoryId = data.id;
									data.oldWarehousePlaceId = data.warehousePlaceId;
									data.oldWarehousePlace = data.warehousePlace;
									data.newWarehousePlaceId = "";
									data.newWarehousePlace = "";
									data.warehouseInfo = "";
									data.supplyNum = data.num;
									data.supplyWeight = data.weight;
									data.moveNum = "";
									data.moveWeight = "";
									data.moveNumUnitDesc = "件";
									data.moveWeightUnitDesc = "吨";
									data.moveInfo = "";
									self.materielList.push(data);
									plus.device.beep(2);
									self.buildTotalInfo();
								}
							} else {
								plus.device.beep(4);
								alert("找不到与此编码对应的物料信息！");
							}
							//							if(plus.device.model == pdaModel) {
							//								$('#div_basic_info').height(materielListHight + 200);
							//								materielListHight = materielListHight + 150;
							//							}
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
				} else {
					plus.device.beep(4);
					alert("无法识别的条码，请重试！");
				}
			},
			updateMaterialList: function(type, materialType, materialDetail) {
				var self = this;
				console.log(JSON.stringify(materialDetail));
				if(materialType == 0) {
					//										alert(1)
					if(!self.materielList || self.materielList.length < 1) {
						self.materielList = [];
					}
					self.materielList.push(materialDetail);
					if(self.materielList && self.materielList.length > 0) {
						m.each(self.materielList, function(index, item) {
							if(item) {
								item.processId = 'li_' + index;
							}
						});
					}
				} else {
					var uIndex = -1;
					if(self.materielList && self.materielList.length > 0) {
						m.each(self.materielList, function(index, item) {
							if(item) {
								if(item.processId == materialDetail.processId)
									uIndex = index;
							}
						});
					}
					if(uIndex > -1) {
						self.materielList.splice(uIndex, 1, materialDetail);
					}
					//					if(plus.device.model == pdaModel) {
					//						if(self.materielList) {
					//							if(self.materielList.length > 1) {
					//								$('#div_basic_info').height(materielListHight + 400);
					//								materielListHight = materielListHight + 150;
					//							} else {
					//								$('#div_basic_info').height(materielListHight + 200);
					//								materielListHight = materielListHight + 150;
					//							}
					//						} else {
					//
					//						}
					//
					//					}
				}
				self.buildTotalInfo();
				setFocusForScanner();
			},
			updateCostList: function(type, costType, costDetail) {
				var self = this;
				console.log(JSON.stringify(costDetail));
				if(costType == 0) {
					if(!self.accountDueDetailList || self.accountDueDetailList.length < 1) {
						self.accountDueDetailList = [];
					}
					self.accountDueDetailList.push(costDetail);
					if(self.accountDueDetailList && self.accountDueDetailList.length > 0) {
						m.each(self.accountDueDetailList, function(index, item) {
							if(item) {
								item.processId = 'li_' + index;
							}
						});
					}
				} else {
					var uIndex = -1;
					if(self.accountDueDetailList && self.accountDueDetailList.length > 0) {
						m.each(self.accountDueDetailList, function(index, item) {
							if(item) {
								if(item.processId == costDetail.processId)
									uIndex = index;
							}
						});
					}
					if(uIndex > -1) {
						self.accountDueDetailList.splice(uIndex, 1, costDetail);
					}
					//					if(plus.device.model == pdaModel) {
					//						if(self.accountDueDetailList) {
					//							if(self.accountDueDetailList.length > 1) {
					//								$('#div_basic_info').height(materielListHight + 400);
					//								materielListHight = materielListHight + 150;
					//							} else {
					//								$('#div_basic_info').height(materielListHight + 200);
					//								materielListHight = materielListHight + 150;
					//							}
					//						} else {
					//
					//						}
					//
					//					}
				}
				setFocusForScanner();
			},
			/**
			 * 
			 * @param {Object} $event
			 * @param {Object} item
			 * @param {Object} type 0:删除物料; 1:删除费用;
			 */
			deleteItem: function($event, item, type) {
				var self = this;
				event.stopPropagation();
				plus.nativeUI.confirm('确定要删除此条记录？', function(f) {
					if(f.index == 0) {
						if(type == 0) {
							var dIndex = self.materielList.indexOf(item);
							if(dIndex > -1) {
								self.materielList.splice(dIndex, 1);
							}
							if(self.materielList && self.materielList.length > 0) {
								m.each(self.materielList, function(index, item) {
									if(item) {
										item.processId = 'li_' + index;
									}
								});
							}
							self.buildTotalInfo();
						} else {
							var dIndex = self.accountDueDetailList.indexOf(item);
							if(dIndex > -1) {
								self.accountDueDetailList.splice(dIndex, 1);
							}
							if(self.accountDueDetailList && self.accountDueDetailList.length > 0) {
								m.each(self.accountDueDetailList, function(index, item) {
									if(item) {
										item.processId = 'li_' + index;
									}
								});
							}
						}
					} else {

					}
					setFocusForScanner();
				}, '提示', ['是', '否']);
			},
			onRadioClick: function($event, contractFit) {
				var self = this;
				event.stopPropagation();
				self.contractFit = contractFit;
			},
			openMaterialDetailsHTML: function() {
				m.openWindow({
					id: 'materialDetails',
					url: '../html/material-details.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			addSave: function() {
				var self = this;
				if(!isNotBlank(self.moveDate)) {
					alert('请选择移库时间');
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.ownerId)) {
					alert('请选择货主单位');
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.spenderId)) {
					alert('请选择结算单位');
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.paymentModeId)) {
					alert('请选择结算方式');
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.warehouseId)) {
					alert('请选择仓库');
					setFocusForScanner();
					return;
				}
				if(!self.materielList || self.materielList.length < 1) {
					alert('请添加物料');
					setFocusForScanner();
					return;
				}
				var moveNums = [];
				var moveWeights = [];
				var inventoryIds = [];
				var supplyNums = [];
				var supplyWeights = [];
				var newWarehousePlaceIds = [];
				var storeyNos = [];
				var countWeightModes = [];
				var detailRemarks = [];
				var spendItemNames = [];
				var paymentModes = [];
				var brandIds = [];
				var brandNames = [];
				var priceModes = [];
				var settlementWeights = [];
				var unitPrices = [];
				var detailMoneys = [];
				var spendTemplates = []; //费用模板类型
				m.each(self.materielList, function(index, item) {
					if(item) {
						moveNums.push(item.moveNum ? item.moveNum : '0');
						moveWeights.push(item.moveWeight ? item.moveWeight : '0');
						inventoryIds.push(item.id);
						supplyNums.push(item.supplyNum ? item.supplyNum : '0');
						supplyWeights.push(item.supplyWeight ? item.supplyWeight : '0');
						newWarehousePlaceIds.push(item.newWarehousePlaceId ? item.newWarehousePlaceId : '');
						storeyNos.push(item.storeyNo ? item.storeyNo : '');
						countWeightModes.push(item.countWeightMode ? item.countWeightMode : '');
						detailRemarks.push(item.remarks ? item.remarks : '');
					}
				});
				if(self.accountDueDetailList && self.accountDueDetailList.length > 0) {
					m.each(self.accountDueDetailList, function(index, itm) {
						if(itm) {
							spendItemNames.push(itm.spendItemName ? itm.spendItemName : '');
							paymentModes.push(itm.paymentMode ? itm.paymentMode : '0');
							brandIds.push(itm.brandId ? itm.brandId : '');
							brandNames.push(itm.brandName ? itm.brandName : '');
							priceModes.push(itm.priceMode ? itm.priceMode : '0');
							settlementWeights.push(itm.settlementWeight ? itm.settlementWeight : 0);
							unitPrices.push(itm.unitPrice ? itm.unitPrice : 0);
							detailMoneys.push(itm.detailMoney ? itm.detailMoney : 0);
							spendTemplates.push(itm.spendTemplate ? itm.spendTemplate : '');
						}
					});
				}
				var isError = false;
				var msg = "";
				if(newWarehousePlaceIds && newWarehousePlaceIds.length > 0) {
					for(var i = 0; i < newWarehousePlaceIds.length; i++) {
						var currItem = newWarehousePlaceIds[i];
						if(!currItem) {
							isError = true;
							msg = "物料信息中,新库位为必填字段,请输入后提交";
							break;
						}
					}
				} else {
					isError = true;
					msg = "物料信息中,新库位为必填字段,请输入后提交";
				}
				if(moveNums && moveNums.length > 0) {
					for(var i = 0; i < moveNums.length; i++) {
						var currItem = moveNums[i];
						if(!currItem) {
							isError = true;
							msg = "物料信息中,移库数量为必填字段,请输入后提交";
							break;
						}
					}
				} else {
					isError = true;
					msg = "物料信息中,移库数量为必填字段,请输入后提交";
				}
				if(moveWeights && moveWeights.length > 0) {
					for(var i = 0; i < moveWeights.length; i++) {
						var currItem = moveWeights[i];
						if(!currItem) {
							isError = true;
							msg = "物料信息中,移库重量为必填字段,请输入后提交";
							break;
						}
					}
				} else {
					isError = true;
					msg = "物料信息中,移库重量为必填字段,请输入后提交";
				}
				if(isError) {
					alert(msg);
					return;
				}
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('加载中...');
				}
				//				alert(self.contractFit);
				var apiUrl = app.api_url + '/api/proMoveApi/save?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						moveDate: self.moveDate,
						ownerId: self.ownerId,
						spenderId: self.spenderId,
						paymentMode: self.paymentModeId,
						warehouseId: self.warehouseId,
						contractOwnerId: self.contractOwnerId,
						reason: self.reason ? self.reason : '',
						contractFit: self.contractFit,
						moveNum: moveNums.join(','),
						moveWeight: moveWeights.join(','),
						inventoryId: inventoryIds.join(','),
						supplyNum: supplyNums.join(','),
						supplyWeight: supplyWeights.join(','),
						newWarehousePlaceId: newWarehousePlaceIds.join(','),
						storeyNo: (!storeyNos || storeyNos.length < 1) ? null : (storeyNos.length == 1 && !isNotBlank(storeyNos[0])) ? null : storeyNos.join(','),
						countWeightMode: countWeightModes.join(','),
						detailRemarks: detailRemarks.join(','),
						spendItemNames: spendItemNames.join(','),
						paymentModes: paymentModes.join(','),
						brandIds: brandIds.join(','),
						brandNames: brandNames.join(','),
						priceModes: priceModes.join(','),
						settlementWeights: settlementWeights.join(','),
						unitPrices: unitPrices.join(','),
						detailMoneys: detailMoneys.join(','),
						spendTemplates: spendTemplates.join(',')
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
								var listView = plus.webview.getWebviewById('move-register');
								m.fire(listView, "refreshEnteringList", {});
								m.back();
							} else {
								m.toast(data.msg);
								setFocusForScanner();
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
						setFocusForScanner();
					}
				});
			},
			editSave: function() {
				var self = this;
				if(!isNotBlank(self.spenderId)) {
					alert('请选择结算单位');
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.paymentModeId)) {
					alert('请选择结算方式');
					setFocusForScanner();
					return;
				}
				if(!self.materielList || self.materielList.length < 1) {
					alert('请添加物料');
					setFocusForScanner();
					return;
				}
				var moveDetailids = [];
				var isDels = [];
				var moveNums = [];
				var moveWeights = [];
				var supplyNums = [];
				var supplyWeights = [];
				var newWarehousePlaceIds = [];
				var storeyNos = [];
				var countWeightModes = [];
				var detailRemarks = [];
				var spendItemNames = [];
				var paymentModes = [];
				var brandIds = [];
				var brandNames = [];
				var priceModes = [];
				var settlementWeights = [];
				var unitPrices = [];
				var detailMoneys = [];
				var spendTemplates = []; //费用模板类型
				m.each(self.materielList, function(index, item) {
					if(item) {
						moveDetailids.push(item.id);
						moveNums.push(item.moveNum ? item.moveNum : '0');
						moveWeights.push(item.moveWeight ? item.moveWeight : '0');
						supplyNums.push(item.supplyNum ? item.supplyNum : '0');
						supplyWeights.push(item.supplyWeight ? item.supplyWeight : '0');
						newWarehousePlaceIds.push(item.newWarehousePlaceId ? item.newWarehousePlaceId : '');
						storeyNos.push(item.storeyNo ? item.storeyNo : '');
						countWeightModes.push(item.countWeightMode ? item.countWeightMode : '');
						detailRemarks.push(item.remarks ? item.remarks : '');
					}
				});
				if(self.accountDueDetailList && self.accountDueDetailList.length > 0) {
					m.each(self.accountDueDetailList, function(index, itm) {
						if(itm) {
							spendItemNames.push(itm.spendItemName ? itm.spendItemName : '');
							paymentModes.push(itm.paymentMode ? itm.paymentMode : '0');
							brandIds.push(itm.brandId ? itm.brandId : '');
							brandNames.push(itm.brandName ? itm.brandName : '');
							priceModes.push(itm.priceMode ? itm.priceMode : '0');
							settlementWeights.push(itm.settlementWeight ? itm.settlementWeight : 0);
							unitPrices.push(itm.unitPrice ? itm.unitPrice : 0);
							detailMoneys.push(itm.detailMoney ? itm.detailMoney : 0);
							spendTemplates.push(itm.spendTemplate ? itm.spendTemplate : '');
						}
					});
				}
				var isError = false;
				var msg = "";
				if(newWarehousePlaceIds && newWarehousePlaceIds.length > 0) {
					for(var i = 0; i < newWarehousePlaceIds.length; i++) {
						var currItem = newWarehousePlaceIds[i];
						if(!currItem) {
							isError = true;
							msg = "物料信息中,新库位为必填字段,请输入后提交";
							break;
						}
					}
				} else {
					isError = true;
					msg = "物料信息中,新库位为必填字段,请输入后提交";
				}
				if(moveNums && moveNums.length > 0) {
					for(var i = 0; i < moveNums.length; i++) {
						var currItem = moveNums[i];
						if(!currItem) {
							isError = true;
							msg = "物料信息中,移库数量为必填字段,请输入后提交";
							break;
						}
					}
				} else {
					isError = true;
					msg = "物料信息中,移库数量为必填字段,请输入后提交";
				}
				if(moveWeights && moveWeights.length > 0) {
					for(var i = 0; i < moveWeights.length; i++) {
						var currItem = moveWeights[i];
						if(!currItem) {
							isError = true;
							msg = "物料信息中,移库重量为必填字段,请输入后提交";
							break;
						}
					}
				} else {
					isError = true;
					msg = "物料信息中,移库重量为必填字段,请输入后提交";
				}
				if(isError) {
					alert(msg);
					return;
				}
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('加载中...');
				}
				//				alert(self.contractFit);
				var apiUrl = app.api_url + '/api/proMoveApi/edit?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						moveId: self.moveId,
						spenderId: self.spenderId,
						contractOwnerId: self.contractOwnerId,
						paymentMode: self.paymentModeId,
						reason: self.reason ? self.reason : '',
						contractFit: self.contractFit,
						moveDetailid: moveDetailids.join(','),
						moveNum: moveNums.join(','),
						moveWeight: moveWeights.join(','),
						supplyNum: supplyNums.join(','),
						supplyWeight: supplyWeights.join(','),
						newWarehousePlaceId: newWarehousePlaceIds.join(','),
						storeyNo: (!storeyNos || storeyNos.length < 1) ? null : (storeyNos.length == 1 && !isNotBlank(storeyNos[0])) ? null : storeyNos.join(','),
						countWeightMode: countWeightModes.join(','),
						detailRemarks: detailRemarks.join(','),
						spendItemNames: spendItemNames.join(','),
						paymentModes: paymentModes.join(','),
						brandIds: brandIds.join(','),
						brandNames: brandNames.join(','),
						priceModes: priceModes.join(','),
						settlementWeights: settlementWeights.join(','),
						unitPrices: unitPrices.join(','),
						detailMoneys: detailMoneys.join(','),
						spendTemplates: spendTemplates.join(',')
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
								var listView = plus.webview.getWebviewById('move-register');
								m.fire(listView, "refreshEnteringList", {});
								m.back();
							} else {
								m.toast(data.msg);
								setFocusForScanner();
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
						setFocusForScanner();
					}
				});
			},
			submit: function() {
				var self = this;
				if(self.type == 0)
					self.addSave();
				else
					self.editSave();
			}
		}
	});

	m.ready(function() {
		materielListHight = $('#div_basic_info').height();
	});

	$('#txt_scanner').focus();
	$('#txt_scanner').bind('keyup', function(event) {
		if(event.keyCode == "13") {
			var qrCode = $('#txt_scanner').val();
			$('#txt_scanner').val("");
			detailVue.scanner(qrCode);
		}
	});

	var initNativeObjects = function() {
		if(mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var Context = plus.android.importClass("android.content.Context");
			InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
		}
		//		else {
		//			nativeWebview = plus.webview.currentWebview().nativeInstanceObject();
		//		}
	};

	var showSoftInput = function() {
		var nativeWebview = plus.webview.currentWebview().nativeInstanceObject();
		if(mui.os.android) {
			//当前webview获得焦点
			plus.android.importClass(nativeWebview);
			nativeWebview.requestFocus();
			//			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
			//			imm.hideSoftInputFromWindow(nativeWebview.getWindowToken(),0);
		}
		//		else {
		//			nativeWebview.plusCallMethod({
		//				"setKeyboardDisplayRequiresUserAction": false
		//			});
		//		}
		setTimeout(function() {
			//此处可写具体逻辑设置获取焦点的input
			var inputElem = document.getElementById('txt_scanner');
			inputElem.focus();
			imm.hideSoftInputFromWindow(nativeWebview.getWindowToken(), 0);
		}, 100);
	};

	function setFocusForScanner() {
		if(app.debug) {
			console.log("plus.device.model:" + plus.device.model + "|pdaModel:" + pdaModel);
		}
		if(plus.device.model == pdaModel) {
			initNativeObjects();
			showSoftInput();
		}
	}

	function backFromMask() {
		inputDialogClass.closeMask();
		setFocusForScanner();
		//		if(plus.device.model == pdaModel)
		//			$('#div_basic_info').height(materialListHight);
	}

	document.addEventListener("closeMask", function(e) {
		backFromMask();
	}, false);

	document.addEventListener("inputConfirm", function(e) {
		if(e.detail.inputType == 1) {
			detailVue.reason = e.detail.inputValue;
		}
		backFromMask();
	}, false);

	document.addEventListener("updateMaterialList", function(e) {
		detailVue.updateMaterialList(e.detail.type, e.detail.materialType, e.detail.materialDetail);
	}, false);

	document.addEventListener("updateCostList", function(e) {
		detailVue.updateCostList(e.detail.type, e.detail.costType, e.detail.costDetail);
	}, false);

	document.addEventListener("scanner", function(e) {
		detailVue.scanner(e.detail.qRCode);
	}, false);

	document.addEventListener("comeBack", function() {
		setFocusForScanner();
	}, false);

});