define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");

	m.init();

	m.plusReady(function() {
		var ws = null;
		var waiting = null;
		mui('#div_basic_info .public-list').scroll({
			deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: true
		});
		
		var outTimePicker = new m.DtPicker({
			"type": "datetime"
		});
		var ownerNamePicker = new m.PopPicker();
		var transportNamePicker = new m.PopPicker();
		var paymentModePicker = new m.PopPicker();
		var transportModePicker = new m.PopPicker();
		var spenderPicker = new m.PopPicker();
		
		
		
		var slider = m("#slider").slider();
		slider.setStopped(true); //禁止滑动
		
		var detailVue = new Vue({
			el: '#receivingRegister',
			data: {
				outingKey: '',
				sendCode: '', //发货单号
				receiveDate: '', // 出库日期
				ladingCode: '', // 提单号
				ownerId: '', // 货主单位ID
				ownerName: '', //货主单位
				spenderId: '', // 结算单位ID
				spenderName: '', //结算单位
				paymentModeId: '', //结算方式ID
				paymentMode: '', //结算方式
				transportId: '', // 运输单位ID
				transportName: '', //运输单位
				transportModeId: '', //运输方式ID
				transportMode: '', //运输方式
				carPlateNo: '', // 车牌号
				totalInfo: '合计: 12件/42吨', //物料总计显示
				//			isBatchAdd: app.getUser().isPrivilege('outing:pick:batchadd'),
				isBatchAdd: true,
				isMaterielSelected: false,
				isMaterielSelectShow: false,
				materielList: [], //物料信息List
				spenderList: [], //结算单位List
				imageFiles: [],
				paymentModeList: [{
						value: '1',
						text: '现结'
					},
					{
						value: '2',
						text: '月结'
					}
				],
				transportModeList: [],
				ownerNameList: [],
				transportNameList: []
			},
			methods: {
				toggleSwitch: function(e) {
					var $target = $(e.target);
					var isActive = $target.hasClass("mui-active");
					if(isActive){
					  $target.removeClass('mui-active');
					}else{
					  $target.addClass('mui-active');
					}
				},
				initShow: function() {
					var self = this;
					/*self.isMaterielSelectShow = self.isBatchAdd;
					var apiUrl = app.api_url + '/api/proOutput/form?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							id: self.outingKey
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							if(waiting) {
								waiting.close();
							}
							if(data) {
								self.sendCode = data.sendCode;
								self.receiveDate = data.receiveDate;
								self.ladingCode = data.ladingCode;
								self.ownerId = data.ownerId;
								self.ownerName = data.ownerName;
								self.spenderId = data.spenderId;
								self.spenderName = data.spenderName;
								self.paymentModeId = data.paymentMode;
								self.paymentMode = data.paymentModeStr;
								self.carPlateNo = data.carPlateNo;
								self.materielList = data.detailList;
								if(self.materielList && self.materielList.length > 0) {
									m.each(self.materielList, function(index, item) {
										if(item) {
											item.realPickInfo = (item.realNum ? item.realNum : '0') + item.realNumUnitDesc + "/" + (item.realWeight ? item.realWeight : '0') + item.realWeightUnitDesc;
										}
									});
								}
							}
		
						},
						error: function(xhr, type, errorThrown) {
							if(waiting) {
								waiting.close();
							}
							if(app.debug) {
								console.log(xhr + "|" + type + "|" + errorThrown);
							}
							m.toast("网络异常，请重新试试");
						}
					});*/
				},
				onItemSliderClick: function($event, index) {
					var self = this;
					event.stopPropagation();
					slider.gotoItem(index);
				},
				getSpenderList: function() {
					var self = this;
					/*m.getJSON(app.api_url + '/api/sysBusinessBasis/customerInfo?customerType=1', function(data) {
						for(var i = 0; i < data.length; i++) {
							self.spenderList.push({
								"text": data[i].text,
								"id": data[i].id
							});
						}
					});*/
				},
				pickReceiveTime: function() {
					var self = this;
					outTimePicker = new m.DtPicker({
						value: detailVue.receiveDate
					});
					outTimePicker.show(function(selectItems) {
						self.receiveDate = selectItems.value;
					});
				},
				pickOwnerName: function() {
					var self = this;
					ownerNamePicker.setData(self.ownerNameList);
					ownerNamePicker.pickers[0].setSelectedValue(self.ownerId);
					ownerNamePicker.show(function(selectItems) {
						self.ownerName = selectItems[0].text;
						self.ownerId = selectItems[0].id;
					})
				},
				pickTransportName: function() {
					var self = this;
					transportNamePicker.setData(self.transportNameList);
					transportNamePicker.pickers[0].setSelectedValue(self.transportId);
					transportNamePicker.show(function(selectItems) {
						self.transportName = selectItems[0].text;
						self.transportId = selectItems[0].id;
					})
				},
				pickSpender: function() {
					var self = this;
					spenderPicker.setData(self.spenderList);
					spenderPicker.pickers[0].setSelectedValue(self.spenderId);
					spenderPicker.show(function(selectItems) {
						self.spenderName = selectItems[0].text;
						self.spenderId = selectItems[0].id;
					})
				},
				pickPaymentMode: function() {
					var self = this;
					paymentModePicker.setData(self.paymentModeList);
					paymentModePicker.pickers[0].setSelectedValue(self.paymentModeId);
					paymentModePicker.show(function(selectItems) {
						self.paymentMode = selectItems[0].text;
						self.paymentModeId = selectItems[0].value;
					});
				},
				pickTransportMode: function() {
					var self = this;
					transportModePicker.setData(self.transportModeList);
					transportModePicker.pickers[0].setSelectedValue(self.transportModeId);
					transportModePicker.show(function(selectItems) {
						self.transportModeId = selectItems[0].value;
						self.transportMode = selectItems[0].text;
					});
				},
				onMaterialItemClick: function($event, item) {
					var self = this;
					event.stopPropagation();
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
							"materialDetails": item
						}
					});
				},
				openBatchAddHTML: function() {
					var self = this;
					m.openWindow({
						id: 'batchAdd',
						url: '../html/batch-add.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {
						}
					});
				},
				updateMaterialRealPickInfo: function(realNum, realWeight) {
					var self = this;
					alert(realNum + "|" + realWeight);
				},
				deleteItem: function($event, item) {
					var self = this;
					event.stopPropagation();
					plus.nativeUI.confirm('确定要删除此条记录？', function(f) {
						if(f.index == 0) {
							var dIndex = self.materielList.indexOf(item);
							if(dIndex > -1) {
								self.materielList.splice(dIndex, 1);
							}
						} else {
		
						}
						
					}, '提示', ['是', '否']);
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
						extras: {
						}
					});
				},
				submit: function() {
					var self = this;
		
				}
			}
		});
		
		document.addEventListener("updateMaterialRealPickInfo", function(e) {
			detailVue.updateMaterialRealPickInfo(e.detail.realNum, e.detail.realWeight);
		}, false);
		
		
		
		mui(".mui-switch")['switch']();
		/*if(window.plus) {
			waiting = plus.nativeUI.showWaiting('加载中...');
		}
		ws = plus.webview.currentWebview();
		detailVue.outingKey = ws.outingKey;
		detailVue.getSpenderList();
		detailVue.initShow();

		var backDefault = m.back;

		function detailBack() {
			if(waiting) {
				waiting.close();
			}
			backDefault();
		}
		m.back = detailBack;*/

		//设置footer绝对位置
		document.getElementById('nav_footer').style.top = (plus.display.resolutionHeight - 45) + "px";

	});


});