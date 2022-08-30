define(function(require, module, exports) {
	var m = require("mui");
	require("mui-zoom");
	require("mui-previewimage");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("layui");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	var cameraJs = require("../../common/camera/js/camera.js");
	require("../../../js/common/common.js");
	var ztPlugins = require("../../common/plugins/js/plugins.js");

	m.init();

	m.plusReady(function() {
		var ws = null;
		var swaiting = null;
		
		var pdaModel = "PDT-90P";
		var materielListHight;
		
		m('#div_basic_info_scroll').scroll({
			deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		
		//	mui('#div_basic_info .public-list').scroll({
		//		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		//		indicators: true
		//	});
		//	mui(".mui-switch").switch().toggle();
		//	var outTimePicker = new m.DtPicker({
		//		"type": "datetime",
		//		value: '2018-08-18 18:18'
		//	});
		
		//	document.onkeydown = function(event) {
		//		var e = event || window.event;
		//		if(e && e.keyCode == 13) { //回车键的键值为13
		//        	var a = $('#txt_scanner').val();
		//          $('#txt_scanner').val("");
		//          alert(a);
		//		}
		//	};
		
		var outTimePicker = new m.DtPicker({
			"type": "datetime"
		});
		var ownerNamePicker = new m.PopPicker();
		var transportNamePicker = new m.PopPicker();
		var paymentModePicker = new m.PopPicker();
		var transportModePicker = new m.PopPicker();
		var spenderPicker = new m.PopPicker();
		
		var nativeWebview, imm, InputMethodManager;
		
		var slider = m("#slider").slider();
		slider.setStopped(true); //禁止滑动
		
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		
		var detailVue = new Vue({
			el: '#receivingRegister',
			data: {
				type: -1,
				receivedId: '',
				warehouseId: '', // 仓库ID
				receivingCode: '', // 收货单号
				receivingDate: '', // 收货日期
				ownerId: '', // 货主单位ID
				ownerName: '', //货主单位
				spenderId: '', // 结算单位ID
				spenderName: '', //结算单位
				paymentModeId: '', //结算方式ID
				paymentMode: '', //结算方式
				transporterId: '', // 运输单位ID
				transporterName: '', //运输单位
				transportModeId: '', //运输方式ID
				transportMode: '', //运输方式
				totalStr: '(0/0)',
				totalInfo: '合计: 0件/0吨', //物料总计显示
				//			isBatchAdd: app.getUser().isPrivilege('outing:pick:batchadd'),
				isBatchAdd: true,
				isPDA: false,
				attacheFileIds_1: '',
				forecastDetailID: '',
				tempMaterielJsonStr: '',
				tempMaterielInfo: [],
				receivingDetails: [],
				materielList: [], //物料信息List
				spenderList: [], //结算单位List
				ownerNameList: [],
				transportNameList: [],
				attachFile: [],
				imageFiles: [],
				files: [],
				paymentModeList: [{
						value: '1',
						text: '现结'
					},
					{
						value: '2',
						text: '月结'
					}
				],
				transportModeList: [{
						value: '01',
						text: '汽运'
					},
					{
						value: '02',
						text: '铁运'
					},
					{
						value: '03',
						text: '水运'
					}
				]
			},
			methods: {
				toggleSwitch: function(e, item) {
					var self = this;
					var $target = $(e.target);
					var isActive = $target.hasClass("mui-active");
					var isReceived = item.isReceived;
					if(isActive) {
						$target.removeClass('mui-active');
						item.isReceived = '0';
					} else {
						$target.addClass('mui-active');
						item.isReceived = '1';
					}
					self.buildTotalInfo();
					setFocusForScanner();
				},
				initShow: function() {
					var self = this;
					if(self.receivingDetails) {
						if(app.debug) {
							console.log(JSON.stringify(self.receivingDetails));
						}
						self.receivedId = self.type == 0 ? '' : self.receivingDetails.id;
						self.warehouseId = self.receivingDetails.warehouseId;
						self.receivingCode = self.receivingDetails.receivingCode;
						self.receivingDate = self.receivingDetails.receivingDate;
						self.ladingCode = self.receivingDetails.ladingCode;
						self.ownerId = self.receivingDetails.ownerId;
						self.ownerName = self.receivingDetails.ownerName;
						self.spenderId = self.receivingDetails.spenderId ? self.receivingDetails.spenderId : '';
						self.spenderName = self.receivingDetails.spenderName;
						self.paymentModeId = self.receivingDetails.paymentMode ? self.receivingDetails.paymentMode : '2';
						self.paymentMode = self.receivingDetails.paymentModeDesc ? self.receivingDetails.paymentModeDesc : '月结';
						self.transporterId = self.receivingDetails.transporterId; // 运输单位ID
						self.transporterName = self.receivingDetails.transporterName; //运输单位
						self.transportModeId = self.receivingDetails.transportMode; //运输方式ID
						self.transportMode = self.receivingDetails.transportModeDesc; //运输方式
						self.materielList = self.receivingDetails.detailList;
						if(app.debug) {
							console.log("initShow materielList:" + JSON.stringify(self.materielList));
						}
						if(self.materielList && self.materielList.length > 0) {
							self.tempMaterielJsonStr = JSON.stringify(self.materielList[0]);
							m.each(self.materielList, function(index, item) {
								if(item) {
									item.processId = 'li_' + index;
									item.realPickInfo = (item.realNum ? item.realNum : '0') + item.realNumUnitDesc + "/" + (item.realWeight ? item.realWeight : '0') + item.realWeightUnitDesc;
								}
							});
						} else {
							self.tempMaterielJsonStr = "{\"id\":\"146\",\"isNewRecord\":false,\"officeId\":\"2\",\"remarks\":\"\",\"createBy\":{\"id\":\"921\",\"isNewRecord\":false,\"officeId\":\"2\",\"userName\":\"\",\"userStatus\":\"1\",\"initPassw\":0,\"admin\":false,\"cstmrTypeDesc\":\"未知类型\",\"roleNames\":\"\",\"isAdmin\":false},\"createDate\":\"2018-11-09 16:01:30\",\"updateBy\":{\"id\":\"921\",\"isNewRecord\":false,\"officeId\":\"2\",\"userStatus\":\"1\",\"initPassw\":0,\"admin\":false,\"cstmrTypeDesc\":\"未知类型\",\"roleNames\":\"\",\"isAdmin\":false},\"updateDate\":\"2018-11-09 16:01:30\",\"materialDesc\":\"\",\"brandId\":\"\",\"textureId\":\"\",\"specificationId\":\"\",\"placesteelId\":\"\",\"receivableNum\":0,\"receivableNumUnit\":\"01\",\"receivableWeight\":0,\"receivableWeightUnit\":\"01\",\"realNum\":0,\"realNumUnit\":\"01\",\"realWeight\":0,\"realWeightUnit\":\"01\",\"countWeightMode\":\"\",\"carNo\":\"\",\"packageNo\":\"\",\"printNum\":0,\"brandName\":\"\",\"forecastDetailId\":\"\",\"isReceived\":\"0\",\"receivableNumUnitDesc\":\"件\",\"receivableWeightUnitDesc\":\"吨(t)\",\"countWeightModeDesc\":\"\",\"realNumUnitDesc\":\"件\",\"realWeightUnitDesc\":\"吨(t)\",\"processId\":\"li_0\",\"realPickInfo\":\"0件/0吨(t)\",\"textureName\":\"\",\"specificationName\":\"\",\"placesteelName\":\"\",\"warehousePlaceId\":0,\"warehousePlaceName\":\"\",\"storeyNo\":\"\"}";
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
				getAttachFile: function() {
					var self = this;
					if(app.debug) {
						var getAttachFileUrl = app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime() + "&busiType=pro_receiving" + "&busiId=" + (self.receivingDetails.id + "#1") + "&token=" + app.getToken();
						console.log("getAttachFileUrl:" + getAttachFileUrl);
					}
					m.ajax(app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime(), {
						data: {
							busiType: 'pro_receiving',
							busiId: (self.receivingDetails.id + "#1"),
							token: app.getToken()
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为20秒；
						success: function(data) {
							if(data) {
								self.attachFile = data;
								var imageFiles = [];
								var files = [];
								for(var i = 0; i < data.length; i++) {
									var fileExt = data[i].fileExt;
									var size = parseInt(data[i].fileSize);
									var k = 1000, // or 1024
										sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
									j = Math.floor(Math.log(size) / Math.log(k));
									data[i].fileSize = (size / Math.pow(k, j)).toPrecision(3) + ' ' + sizes[j];
									if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
										data[i].previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + data[i].id + '&token=' + app.getToken();
										data[i].fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + data[i].id + '&token=' + app.getToken();
										imageFiles.push(data[i]);
									} else {
										files.push(data[i]);
									}
								}
								self.imageFiles = imageFiles;
								//							alert(JSON.stringify(self.imageFiles));
								self.files = files;
							}
						},
						error: function(xhr, type, errorThrown) {
							m.toast("网络异常，请重新试试");
						}
					});
				},
				openFile: function(fileId) {
					var filePath = app.api_url + '' + 'api/sys/file/download?isOnLine=true&fileId=' + '' + fileId + '&token=' + app.getToken();
					if(app.debug) {
						console.log("RiskfilePath:" + filePath);
					}
					if(m.os.android) {
						plus.runtime.launchApplication({
							pname: "com.tencent.mtt",
							extra: {
								url: filePath
							}
						}, function(e) {
							plus.nativeUI.confirm('当前设备上找不到能打开此附件的应用，是否手动下载并安装相关应用？', function(f) {
								if(f.index == 0) {
									plus.runtime.openURL('http://mb.qq.com');
								} else {
		
								}
							}, '提示', ['是', '否']);
						});
					} else {
						plus.runtime.openURL(filePath, function(error) {
							m.toast("无法下载和打开此附件，请检查附件地址是否正确");
						}, '');
					}
				},
				delete: function(file, type) {
					var self = this;
					var id = file.id;
					if(type == 1) { //文件
						plus.nativeUI.confirm('是否删除此附件？', function(f) {
							if(f.index == 0) {
								m.ajax(app.api_url + '/api/sys/file/deleteFile?_t=' + new Date().getTime(), {
									data: {
										fileId: id,
										token: app.getToken()
									},
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									success: function(data) {
		
									},
									error: function(xhr, type, errorThrown) {
										m.toast("网络异常，请重新试试");
									}
								});
								var files = new Array();
								for(var i = 0; i < self.files.length; i++) {
									if(self.files[i].id != id) {
										files.push(self.files[i]);
									}
								}
								self.files = files;
							} else {
		
							}
						}, '提示', ['是', '否']);
					} else { //图片
						if(id) {
							////服务器
							m.ajax(app.api_url + '/api/sys/file/deleteFile?_t=' + new Date().getTime(), {
								data: {
									fileId: id,
									token: app.getToken()
								},
								dataType: 'json', //服务器返回json格式数据
								type: 'post', //HTTP请求类型
								success: function(data) {
		
								},
								error: function(xhr, type, errorThrown) {
									m.toast("网络异常，请重新试试");
								}
							});
							var imageFiles = new Array();
							var attacheFileIds1 = "";
							for(var i = 0; i < self.imageFiles.length; i++) {
								if(self.imageFiles[i].id != id) {
									imageFiles.push(self.imageFiles[i]);
									attacheFileIds1 += self.imageFiles[i].id + ',';
								}
							}
							self.attacheFileIds_1 = attacheFileIds1;
							self.imageFiles = imageFiles;
						} else {
							////本地
							plus.io.resolveLocalFileSystemURL(file.fileUrl, function(entry) {
									entry.remove(function(entry) {
										var imageFiles = new Array();
										for(var i = 0; i < self.imageFiles.length; i++) {
											if(self.imageFiles[i].fileUrl != file.fileUrl) {
												imageFiles.push(self.imageFiles[i]);
											}
										}
										self.imageFiles = imageFiles;
									}, function(e) {
										m.alert("删除图片失败：" + e.message);
									});
								},
								function(e) {
									//								m.alert("读取拍照文件错误：" + e.message);
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
				getTransportList: function() {
					var self = this;
					m.getJSON(app.api_url + '/api/sysBusinessBasis/customerInfo?customerType=3', function(data) {
						for(var i = 0; i < data.length; i++) {
							self.transportNameList.push({
								"value": data[i].id,
								"text": data[i].text
							});
						}
					});
				},
				pickReceiveTime: function() {
					var self = this;
					if(self.type == 0) {
						outTimePicker = new m.DtPicker({
							value: detailVue.receivingDate
						});
						outTimePicker.show(function(selectItems) {
							self.receivingDate = selectItems.value;
							setFocusForScanner();
						});
					}
				},
				pickOwnerName: function() {
					var self = this;
					if(self.type == 0) {
						ownerNamePicker.setData(self.ownerNameList);
						ownerNamePicker.pickers[0].setSelectedValue(self.ownerId);
						ownerNamePicker.show(function(selectItems) {
							self.ownerName = selectItems[0].text;
							self.ownerId = selectItems[0].value;
							setFocusForScanner();
						});
					}
				},
				pickTransportName: function() {
					var self = this;
					transportNamePicker.setData(self.transportNameList);
					transportNamePicker.pickers[0].setSelectedValue(self.transporterId);
					transportNamePicker.show(function(selectItems) {
						self.transporterId = selectItems[0].value;
						self.transporterName = selectItems[0].text;
						setFocusForScanner();
					});
				},
				pickSpender: function() {
					var self = this;
					spenderPicker.setData(self.spenderList);
					spenderPicker.pickers[0].setSelectedValue(self.spenderId);
					spenderPicker.show(function(selectItems) {
						self.spenderName = selectItems[0].text;
						self.spenderId = selectItems[0].value;
						setFocusForScanner();
					});
				},
				pickPaymentMode: function() {
					var self = this;
					paymentModePicker.setData(self.paymentModeList);
					paymentModePicker.pickers[0].setSelectedValue(self.paymentModeId);
					paymentModePicker.show(function(selectItems) {
						self.paymentMode = selectItems[0].text;
						self.paymentModeId = selectItems[0].value;
						setFocusForScanner();
					});
				},
				pickTransportMode: function() {
					var self = this;
					transportModePicker.setData(self.transportModeList);
					transportModePicker.pickers[0].setSelectedValue(self.transportModeId);
					transportModePicker.show(function(selectItems) {
						self.transportModeId = selectItems[0].value;
						self.transportMode = selectItems[0].text;
						setFocusForScanner();
					});
				},
				buildTotalInfo: function() {
					var self = this;
					if(self.materielList && self.materielList.length > 0) {
						var totalNum = 0;
						var totalWeight = 0.0;
						var realNumUnitDesc = "";
						var realWeightUnitDesc = "";
						var receivedCount = 0;
						m.each(self.materielList, function(index, itm) {
							if(itm) {
								if(itm.isReceived == '1') {
									receivedCount++;
								}
								realNumUnitDesc = itm.realNumUnitDesc;
								realWeightUnitDesc = itm.realWeightUnitDesc;
								var realNumUnit = itm.realNum ? parseInt(itm.realNum) : 0;
								var realWeight = itm.realWeight ? parseFloat(itm.realWeight) : 0;
								totalNum += realNumUnit;
								totalWeight += realWeight;
							}
						});
						var totalWeightStr = isDecimal(totalWeight) ? totalWeight.toFixed(3) : totalWeight;
						self.totalStr = "(" + receivedCount + "/" + self.materielList.length + ")";
						self.totalInfo = "合计：" + totalNum + realNumUnitDesc + "/" + totalWeightStr + realWeightUnitDesc;
					} else {
						self.totalStr = "(0/0)";
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
							"type": self.type, //0:收货登记;1:改单;
							"materialType": type, //0:新增;1:修改;2:展示
							"warehouseId": self.warehouseId,
							"materialDetails": (type == 0 ? self.tempMaterielInfo : item)
						}
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
					if(self.type == 1) {
						return;
					}
					if(qRCode) {
						var forecastId = !self.forecastDetailID ? "" : self.forecastDetailID;
						if(app.debug) {
							console.log("forecastId:" + forecastId + "|qRCode:" + qRCode);
						}
						if(!forecastId) {
							plus.device.beep(4);
							alert("当前物料没有关联的预报单，请关联后再试");
							return;
						}
						if(window.plus) {
							swaiting = plus.nativeUI.showWaiting('处理中...');
						}
						var apiUrl = app.api_url + '/api/proReceiving/scan?_t=' + new Date().getTime();
						m.ajax(apiUrl, {
							data: {
								forecastId: forecastId,
								barcode: qRCode
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
									if(self.materielList && self.materielList.length > 0) {
										var tempMateriels = [];
										var firstItem = [];
										var iCount = 0;
										m.each(self.materielList, function(index, itm) {
											if(itm) {
												//											if(itm.forecastDetailId == data.forecastId) {
												if(itm.materialCode == data.materialCode) {
													firstItem = itm;
												} else {
													iCount++;
												}
												//											} else {
												//
												//											}
											}
										});
										if(iCount >= self.materielList.length) {
											firstItem = data;
										}
										if(app.debug) {
											console.log('iCount:' + iCount + '|self.materielList.length:' + self.materielList.length);
											console.log('firstItem:' + JSON.stringify(firstItem));
										}
										if(firstItem.isReceived == '1') {
											plus.device.beep(4);
											alert("该物料已扫码，无需进行重复扫码！");
										} else {
											firstItem.isReceived = '1';
											tempMateriels.push(firstItem);
											m.each(self.materielList, function(index, iem) {
												if(iem) {
													if(iem.materialCode != firstItem.materialCode) {
														tempMateriels.push(iem);
													}
												}
											});
											if(tempMateriels && tempMateriels.length > 0) {
												self.materielList = [];
												m.each(tempMateriels, function(index, im) {
													if(im) {
														im.processId = 'li_' + index;
														im.realPickInfo = (im.realNum ? im.realNum : '0') + im.realNumUnitDesc + "/" + (im.realWeight ? im.realWeight : '0') + im.realWeightUnitDesc;
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
										self.materielList = [];
										//									if(data.forecastDetailId == forecastId) {
										data.processId = 'li_0';
										data.realPickInfo = (data.realNum ? data.realNum : '0') + data.realNumUnitDesc + "/" + (data.realWeight ? data.realWeight : '0') + data.realWeightUnitDesc;
										data.isReceived = '1';
										self.materielList.push(data);
										plus.device.beep(2);
										self.buildTotalInfo();
										//									} else {
										//										plus.device.beep(4);
										//										alert("此物料不存在于当前预报单中，无法收货！");
										//									}
									}
								} else {
									plus.device.beep(4);
									alert("此物料不存在于当前预报单中，无法收货！");
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
				//			openBatchAddHTML: function() {
				//				var self = this;
				//				m.openWindow({
				//					id: 'batchAdd',
				//					url: '../html/batch-add.html',
				//					show: {
				//						aniShow: 'pop-in'
				//					},
				//					waiting: {
				//						autoShow: true
				//					},
				//					extras: {}
				//				});
				//			},
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
				deleteItem: function($event, item) {
					var self = this;
					event.stopPropagation();
					plus.nativeUI.confirm('确定要删除此条记录？', function(f) {
						if(f.index == 0) {
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
		
						}
						setFocusForScanner();
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
						extras: {}
					});
				},
				printLabelComplete: function(){
					var listView = plus.webview.getWebviewById('warehouse-entering');
					m.fire(listView, "refreshEnteringList", {});
					m.back();
				},
				submit: function() {
					var self = this;
					if(!isNotBlank(self.receivingDate)) {
						alert('请选择收货时间');
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
					//				if(!isNotBlank(self.transporterId)) {
					//					alert('请选择运输单位');
					//					return;
					//				}
					if(!isNotBlank(self.transportModeId)) {
						alert('请选择运输方式');
						setFocusForScanner();
						return;
					}
					if(!self.materielList || self.materielList.length < 1) {
						alert('请添加物料');
						setFocusForScanner();
						return;
					}
					var detailIds = [];
					var sForecastDetailId = [];
					var brandIds = [];
					var textureIds = [];
					var specificationIds = [];
					var placesteelIds = [];
					var materialDescs = [];
					var receivableNums = [];
					var receivableWeights = [];
					var realNums = [];
					var realWeights = [];
					var countWeightModes = [];
					var carNos = [];
					var packageNos = [];
					var warehousePlaceIds = [];
					var storeyNos = [];
					var isReceiveds = [];
					m.each(self.materielList, function(index, item) {
						if(item) {
							detailIds.push(item.id ? item.id : '');
							sForecastDetailId.push(item.forecastDetailId ? item.forecastDetailId : '');
							brandIds.push(item.brandId ? item.brandId : '');
							textureIds.push(item.textureId ? item.textureId : '');
							specificationIds.push(item.specificationId ? item.specificationId : '');
							placesteelIds.push(item.placesteelId ? item.placesteelId : '');
							materialDescs.push(item.materialDesc ? item.materialDesc : '');
							receivableNums.push(item.receivableNum ? item.receivableNum : '0');
							receivableWeights.push(item.receivableWeight ? item.receivableWeight : '0');
							realNums.push(item.realNum ? item.realNum : '0');
							realWeights.push(item.realWeight ? item.realWeight : '0');
							countWeightModes.push(item.countWeightMode ? item.countWeightMode : '');
							carNos.push(item.carNo ? item.carNo : '');
							packageNos.push(item.packageNo ? item.packageNo : '');
							warehousePlaceIds.push(item.warehousePlaceId ? item.warehousePlaceId : '');
							storeyNos.push(item.storeyNo ? item.storeyNo : '');
							isReceiveds.push(item.isReceived);
						}
					});
					//				warehousePlaceIds.push("1");
					//				warehousePlaceIds.push("21");
					var isError = false;
					var msg = "";
					for(var i = 0; i < warehousePlaceIds.length; i++) {
						var currItem = warehousePlaceIds[i];
						if(!currItem) {
							isError = true;
							msg = "物料信息中,库位为必填字段,请输入后提交";
							break;
						}
					}
					if(isError) {
						alert(msg);
						return;
					}
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('加载中...');
					}
					var apiUrl = app.api_url + '/api/proReceiving/save?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							id: self.receivedId,
							warehouseId: self.warehouseId,
							receivingCode: self.receivingCode, //收货单号
							receivingDate: self.receivingDate,
							ownerId: self.ownerId,
							transporterId: self.transporterId ? self.transporterId : '',
							transportMode: self.transportModeId,
							spenderId: self.spenderId, // 结算单位ID
							paymentMode: self.paymentModeId,
							detailIds: self.type == 1 ? detailIds.join(',') : '',
							sForecastDetailId: sForecastDetailId.join(','),
							brandIds: brandIds.join(','),
							textureIds: textureIds.join(','),
							specificationIds: specificationIds.join(','),
							placesteelIds: placesteelIds.join(','),
							materialDescs: materialDescs.join(','),
							receivableNums: receivableNums.join(','),
							receivableWeights: receivableWeights.join(','),
							realNums: realNums.join(','),
							realWeights: realWeights.join(','),
							countWeightModes: countWeightModes.join(','),
							carNos: carNos.join(','),
							packageNos: packageNos.join(','),
							warehousePlaceIds: warehousePlaceIds.join(','),
							storeyNos: storeyNos.join(','),
							isReceiveds: isReceiveds.join(','),
							attacheFileIds_1: self.attacheFileIds_1
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
									var listView = plus.webview.getWebviewById('warehouse-entering');
									layer.open({
										title: false,
										content: '提示: 提交成功, 是否需要打印标签?',
										btn: ['打印', '不打印'],
										yes: function(index, layero) {
											ztPlugins.printLabel(2, JSON.stringify(self.materielList));
											layer.closeAll();
										},
										btn2: function(index, layero) {
											//按钮【取消】的回调
											m.fire(listView, "refreshEnteringList", {});
											m.back();
										},
										cancel: function() {
											//右上角关闭回调
										}
									});
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
			if(plus.device.model == pdaModel) {
				initNativeObjects();
				showSoftInput();
			}
		}
		
		$("#addFile").click(function() {
			plus.nativeUI.actionSheet({
				cancel: "取消",
				buttons: [{
					title: "拍照"
				}, {
					title: "手机相册"
				}]
			}, function(e) {
				if(e.index == 1) {
					cameraJs.capurteImage(function(url) {
						processPicture(url);
					});
				} else if(e.index == 2) {
					cameraJs.galleryImgs(function(e) {
						batchUpload(e.files, function(data) {});
					});
					//				galleryImgs();
				}
			});
		});
		
		var fileServer = app.api_url + '/api/sys/file';
		// 创建上传任务
		function createUpload(file, callback) {
			var waiting = plus.nativeUI.showWaiting("图片上传中...", {
				back: 'transmit'
			});
			var task = plus.uploader.createUpload(fileServer, {
					method: "POST",
					blocksize: 204800,
					priority: 100,
					timeout: 0
				},
				function(t, status) {
		
					// 上传完成
					waiting.close();
					if(status == 200) {
						var uf = JSON.parse(t.responseText);
						if(uf.length === 0) {
							console.log("没有上传文件");
							return;
						}
						var newFile = new Object();
						newFile.id = uf[0].fileId;
						detailVue.attacheFileIds_1 += newFile.id + ',';
						newFile.fileExt = 'jpg';
						newFile.fileSize = uf[0].fileSize;
						//					newFile.fileUrl = app.api_url + '' + 'api/sys/file/download?isOnLine=true&fileId=' + '' + newFile.id + '&token=' + app.getToken();
						newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id + '&token=' + app.getToken();
						newFile.fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id + '&token=' + app.getToken();
						detailVue.imageFiles.push(newFile);
		
						callback(t);
					} else {
						m.toast('图片上传失败,请重新上传');
					}
					return;
				}
			);
			task.addFile(file, {
				key: "upload"
			});
			task.addData("busiType", "pro_receiving");
			if(detailVue.receivingDetails.id) {
				task.addData("busiId", detailVue.receivingDetails.id + "#1");
			} else {
				task.addData("busiId", "");
			}
			task.start();
		}
		
		function batchUpload(file, callback) {
			var uploadWaiting = plus.nativeUI.showWaiting("图片上传中...", {
				back: 'transmit'
			});
			var task = plus.uploader.createUpload(app.api_url + '/api/sys/file/batchUploadImgs', {
					method: "POST",
					blocksize: 204800,
					priority: 100,
					timeout: 0
				},
				function(t, status) {
					uploadWaiting.close();
					// 上传完成			
					if(status == 200) {
						var uf = JSON.parse(t.responseText);
						console.log(JSON.stringify(uf));
						if(uf.length === 0) {
							console.log("没有上传文件");
							return;
						}
						var zm = 0;
						setTimeout(showImg, 350);
		
						function showImg() {
							var newFile = new Object();
							newFile.id = uf[zm].fileId;
							detailVue.attacheFileIds_1 += newFile.id + ',';
							newFile.fileExt = 'jpg';
							newFile.fileSize = uf[zm].fileSize;
							newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id + '&token=' + app.getToken();
							newFile.fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id + '&token=' + app.getToken();
							console.log("previewFileUrl:" + newFile.previewFileUrl);
							console.log("fileUrl:" + newFile.fileUrl);
							detailVue.imageFiles.push(newFile);
		
							callback(t);
							zm++;
							if(zm < uf.length) {
								setTimeout(showImg, 350);
							}
						}
					} else {
						m.toast('图片上传失败,请重新上传');
					}
				}
			);
			for(var i = 0; i < file.length; i++) {
				task.addFile(file[i], {
					key: file[i]
				});
			}
			task.addData("busiType", "pro_receiving");
			if(detailVue.receivingDetails.id) {
				task.addData("busiId", detailVue.receivingDetails.id + "#1");
			} else {
				task.addData("busiId", "");
			}
			task.start();
		}
		
		function compressAndUploadImg(entry) {
			if(app.debug) {
				console.log("compress:" + entry.toLocalURL());
			}
			plus.zip.compressImage({
				src: entry.toLocalURL(),
				dst: '_doc/' + entry.name,
				overwrite: true,
				quality: 100
			}, function(zip) {
				createUpload(zip.target, function(data) {
		
				});
			}, function(zipe) {
				m.toast('压缩失败！');
			});
		}
		
		// document.addEventListener('save-picture', function(event) {
		// 	var url = event.detail.target;
		// 	plus.io.resolveLocalFileSystemURL(url, function(entry) {
		// 			plus.nativeUI.confirm('立即上传或保存到手机相册？', function(f) {
		// 				if(f.index == 1) {
		// 					compressAndUploadImg(entry);
		// 				} else if(f.index == 0) {
		// 					plus.gallery.save(entry.fullPath, function() {
		// 						m.toast("保存图片到相册成功");
		// 					}, function(se) {
		// 						m.toast(se.message);
		// 					});
		// 				}
		// 			}, '提示', ['保存', '上传']);
		// 		},
		// 		function(e) {
		// 			m.alert("读取拍照文件错误：" + e.message);
		// 		});
		// }, false);
		
		function processPicture(url) {
			plus.io.resolveLocalFileSystemURL(url, function(entry) {
					plus.nativeUI.confirm('立即上传或保存到手机相册？', function(f) {
						if (f.index == 1) {
							compressAndUploadImg(entry);
						} else if (f.index == 0) {
							plus.gallery.save(entry.fullPath, function() {
								m.toast("保存图片到相册成功");
							}, function(se) {
								m.toast(se.message);
							});
						}
					}, '提示', ['保存', '上传']);
				},
				function(e) {
					m.alert("读取拍照文件错误：" + e.message);
				});
		}
		
		m.previewImage();
		
		document.addEventListener("updateMaterialList", function(e) {
			detailVue.updateMaterialList(e.detail.type, e.detail.materialType, e.detail.materialDetail);
		}, false);
		
		document.addEventListener("scanner", function(e) {
			detailVue.scanner(e.detail.qRCode);
		}, false);
		
		document.addEventListener("comeBack", function() {
			setFocusForScanner();
		}, false);
		
		// return detailVue;
		
		
		mui(".mui-switch")['switch']();
		//		if(window.plus) {
		//			waiting = plus.nativeUI.showWaiting('加载中...');
		//		}
		ws = plus.webview.currentWebview();
		detailVue.type = ws.type;
		detailVue.receivingDetails = ws.receivingDetails;
		if(app.debug) {
			console.log('detailVue.receivingDetails:' + JSON.stringify(detailVue.receivingDetails));
		}
		detailVue.forecastDetailID = ws.forecastDetailID;
		detailVue.isPDA = plus.device.model == pdaModel;
		detailVue.getAttachFile();
		detailVue.getSpenderList();
		detailVue.getOwnerList();
		detailVue.getTransportList();
		detailVue.initShow();

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

});