define(function(require, module, exports) {
	var m = require("mui");
	require("mui-zoom");
	require("mui-previewimage");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	//	var cameraJs = require("../js/camera.js");
	var cameraJs = require("../../common/camera/js/camera.js");
	require("../../../js/common/common.js");

	m.init();

	m.plusReady(function() {
		var ws = null;
		var waiting = null;
		var swaiting = null;
		var twaiting = null;
		
		var pdaModel = app.pdaModel;
		var materialListHight;
		
		m('#div_basic_info_scroll').scroll({
			deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		
		//	var outTimePicker = new m.DtPicker({
		//		"type": "datetime",
		//		value: '2018-08-18 18:18'
		//	});
		
		var outTimePicker = new m.DtPicker({
			"type": "datetime"
		});
		var paymentModePicker = new m.PopPicker();
		var spenderPicker = new m.PopPicker();
		
		var nativeWebview, imm, InputMethodManager;
		
		var slider = m("#slider").slider();
		slider.setStopped(true); //禁止滑动
		
		mui.ready(function() {
				materialListHight = $('#div_basic_info').height();
			});
		
			var detailVue = new Vue({
				el: '#body_outing_details',
				data: {
					outingKey: '',
					sendId: '', //发货单ID
					sendCode: '', //发货单号
					outputDate: '', // 出库日期
					ladingCode: '', // 提单号
					ownerId: '', // 货主单位ID
					ownerName: '', //货主单位
					spenderId: '', // 结算单位ID
					spenderName: '', //结算单位
					paymentModeId: '', //结算方式ID
					paymentMode: '', //结算方式
					carPlateNo: '', // 车牌号
					warehouseId: '', // 仓库ID
					totalInfo: '', //物料总计显示
					isBatchAdd: app.getUser().isPrivilege('warehouse:outing:batchadd:api'),
					//			isBatchAdd: true,
					isMaterielSelectShow: false,
					selectedMateriel: null,
					attacheFileIds_1: "",
					isPDA: false,
					materialList: [], //物料信息List
					spenderList: [], //结算单位List
					attachFile: [],
					imageFiles: [],
					files: [],
					coverUrls: [],
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
						self.isMaterielSelectShow = self.isBatchAdd;
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
									self.sendId = data.sendId;
									self.sendCode = data.sendCode;
									self.outputDate = data.outputDate;
									self.ladingCode = data.ladingCode;
									self.ownerId = data.ownerId;
									self.ownerName = data.ownerName;
									self.spenderId = data.spenderId;
									self.spenderName = data.spenderName;
									self.paymentModeId = data.paymentMode;
									self.paymentMode = data.paymentModeStr;
									self.carPlateNo = data.carPlateNo;
									self.warehouseId = data.warehouseId;
									self.materialList = data.detailList;
									if(self.materialList && self.materialList.length > 0) {
										m.each(self.materialList, function(index, item) {
											if(item) {
												item.id = "";
												item.realPickInfo = (item.realNum ? item.realNum : '0') + item.realNumUnitDesc + "/" + (item.realWeight ? item.realWeight : '0') + item.realWeightUnitDesc;
												item.cbxId = item.isFromInventory == '0' ? (item.sendDetailId + '_' + index) : (item.inventoryId + '_' + index);
											}
										});
										self.buildTotalInfo();
									}
									if(app.debug) {
										console.log(JSON.stringify(data));
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
						});
					},
					getAttachFile: function() {
						var self = this;
						if(app.debug) {
							var getOutputAttachFileUrl = app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime() + "&busiType=pro_output" + "&busiId=" + (self.outingKey + "#1") + "&token=" + app.getToken();
							console.log("getOutputAttachFileUrl:" + getOutputAttachFileUrl);
						}
						m.ajax(app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime(), {
							data: {
								busiType: 'pro_output',
								busiId: self.outingKey + "#1",
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
									var coverUrls = [];
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
											if(isNotBlank(data[i].baidudocId)){
												var jsonData = JSON.parse(data[i].baidudocInfo);
												if(jsonData.status == "PUBLISHED") {
													coverUrls.push(jsonData.coverUrl);
												}else{
													coverUrls.push("../../../images/file.jpg");
												}
											}else{
												coverUrls.push("../../../images/file.jpg");
											}
										}
									}
									self.imageFiles = imageFiles;
									//							alert(JSON.stringify(self.imageFiles));
									self.files = files;
									self.coverUrls = coverUrls;
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
					pickOutTime: function() {
						var self = this;
						outTimePicker = new m.DtPicker({
							value: detailVue.outputDate
						});
						outTimePicker.show(function(selectItems) {
							self.outputDate = selectItems.value;
							//					$('#txt_scanner').focus();
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
							//					$('#txt_scanner').focus();
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
					scanner: function(qRCode) {
						var self = this;
						if(qRCode) {
							if(app.debug) {
								console.log("qRCode:" + qRCode);
							}
							if(self.materialList && self.materialList.length > 0) {
								if(window.plus) {
									swaiting = plus.nativeUI.showWaiting('处理中...');
								}
								var includeIds = "";
								m.each(self.materialList, function(index, item) {
									if(item) {
										if(item.inventoryId)
											includeIds += item.inventoryId + ',';
									}
								});
								var apiUrl = app.api_url + '/api/proOutput/getScanDetail?_t=' + new Date().getTime();
								m.ajax(apiUrl, {
									data: {
										sendId: self.sendId,
										materialCode: qRCode,
										includeIds: includeIds
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
											var idx = -1;
											var uId = data.isFromInventory == '0' ? data.sendDetailId : data.inventoryId;
											m.each(self.materialList, function(index, itm) {
												if(itm) {
													var id = itm.isFromInventory == '0' ? itm.sendDetailId : itm.inventoryId;
													if(uId == id)
														idx = index;
												}
											});
											if(idx != -1) {
												var currIsScan = self.materialList[idx].isScan;
												if(currIsScan == "0") {
													//																																	self.materialList[idx].isScan = data.isScan;
													//																																	self.materialList[idx].realNum = data.realNum;
													//																																	self.materialList[idx].realWeight = data.realWeight;
													//																																	self.materialList[idx].realPickInfo = (self.materialList[idx].realNum ? self.materialList[idx].realNum : '0') + self.materialList[idx].realNumUnitDesc + "/" + (self.materialList[idx].realWeight ? self.materialList[idx].realWeight : '0') + self.materialList[idx].realWeightUnitDesc;
													plus.device.beep(2);
													var nItem = self.materialList[idx];
													nItem.isScan = data.isScan;
													nItem.realNum = data.realNum;
													nItem.realWeight = data.realWeight;
													nItem.realPickInfo = (nItem.realNum ? nItem.realNum : '0') + nItem.realNumUnitDesc + "/" + (nItem.realWeight ? nItem.realWeight : '0') + nItem.realWeightUnitDesc;
													if(app.debug) {
														console.log(nItem.realPickInfo);
													}
													self.materialList.splice(idx, 1, nItem);
													$('#spn_' + nItem.cbxId).text(nItem.realPickInfo);
													$('#ul_' + nItem.cbxId).removeClass();
													$('#ul_' + nItem.cbxId).addClass(nItem.isScan == '1' ? 'uibga' : 'uibg');
													self.buildTotalInfo();
													//											if(plus.device.model == pdaModel)
													//												$('#div_basic_info').height(materialListHight);
												} else {
													plus.device.beep(4);
													alert("该物料已扫码，无需进行重复扫码！");
												}
											}
										} else {
											plus.device.beep(4);
											alert("该物资不在发货单，无法出库！");
										}
		//								if(plus.device.model == pdaModel) {
		//									$('#div_basic_info').height(materialListHight + 200);
		//									materialListHight = materialListHight + 150;
		//								}
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
						} else {
							alert("无法识别的条码，请重试！");
						}
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
					onMaterielCBoxChange: function($event, item) {
						var self = this;
						event.stopPropagation();
						var isChecked = $('#' + item.cbxId).prop("checked");
						if(isChecked)
							self.selectedMateriel = item;
						else
							self.selectedMateriel = null;
						var objId = item.cbxId;
						$("[name=cbx]:checkbox").each(function() {
							var currId = $(this).attr('id');
							if(currId != objId)
								$(this).prop("checked", false);
						});
						setFocusForScanner();
					},
					batchAdd: function() {
						var self = this;
						if(!self.selectedMateriel) {
							alert('请先选择一条物料明细！');
							//					setTimeout("$('#txt_scanner').focus();",100);
							setFocusForScanner();
							return;
						}
						var excludeIds = "";
						if(self.materialList && self.materialList.length > 0) {
							m.each(self.materialList, function(index, item) {
								if(item) {
									if(item.inventoryId)
										excludeIds += item.inventoryId + ',';
								}
							});
						}
						m.openWindow({
							id: 'batch-add',
							url: '../html/batch-add.html',
							show: {
								aniShow: 'pop-in'
							},
							waiting: {
								autoShow: true
							},
							extras: {
								"ownerId": self.ownerId,
								"warehouseId": self.warehouseId,
								"materielDetail": self.selectedMateriel,
								"excludeIds": excludeIds
							}
						});
					},
					batchAddMaterials: function(materialList) {
						var self = this;
						var newList = materialList;
						if(newList && newList.length > 0) {
							m.each(newList, function(index, item) {
								if(item) {
									item.realPickInfo = (item.realNum ? item.realNum : '0') + item.realNumUnitDesc + "/" + (item.realWeight ? item.realWeight : '0') + item.realWeightUnitDesc;
									item.cbxId = item.isFromInventory == '0' ? (item.sendDetailId + '_' + index) : (item.inventoryId + '_' + index);
								}
							});
							if(app.debug) {
								console.log("materialList:" + JSON.stringify(newList));
							}
							self.materialList = self.materialList.concat(newList);
						}
						if(app.debug) {
							console.log("curr materialList:" + JSON.stringify(self.materialList));
						}
						self.buildTotalInfo();
						setFocusForScanner();
					},
					updateMaterialRealPickInfo: function(materialDetails) {
						var self = this;
						if(self.materialList && self.materialList.length > 0 && materialDetails) {
							var idx = -1;
							var uId = materialDetails.isFromInventory == '0' ? materialDetails.sendDetailId : materialDetails.inventoryId;
							m.each(self.materialList, function(index, itm) {
								if(itm) {
									var id = itm.isFromInventory == '0' ? itm.sendDetailId : itm.inventoryId;
									if(uId == id)
										idx = index;
								}
							});
							if(idx != -1) {
								self.materialList.splice(idx, 1, materialDetails);
		//						if(plus.device.model == pdaModel)
		//							$('#div_basic_info').height(materialListHight);
								self.buildTotalInfo();
							}
						}
						setFocusForScanner();
					},
					buildTotalInfo: function() {
						var self = this;
						if(self.materialList && self.materialList.length > 0) {
							var totalNum = 0;
							var totalWeight = 0.0;
							var realNumUnitDesc = "";
							var realWeightUnitDesc = "";
							m.each(self.materialList, function(index, itm) {
								if(itm) {
									realNumUnitDesc = itm.realNumUnitDesc;
									realWeightUnitDesc = itm.realWeightUnitDesc;
									var realNumUnit = itm.realNum ? parseInt(itm.realNum) : 0;
									var realWeight = itm.realWeight ? parseFloat(itm.realWeight) : 0;
									totalNum += realNumUnit;
									totalWeight += realWeight;
								}
							});
							var totalWeightStr = isDecimal(totalWeight) ? totalWeight.toFixed(3) : totalWeight;
							self.totalInfo = "合计：" + totalNum + realNumUnitDesc + "/" + totalWeightStr + realWeightUnitDesc;
						} else {
							self.totalInfo = "合计：0件/0吨";
						}
					},
					deleteItem: function($event, item) {
						var self = this;
						event.stopPropagation();
						if(self.materialList && self.materialList.length > 0) {
							plus.nativeUI.confirm('确定要删除此条记录？', function(f) {
								if(f.index == 0) {
									//							var dIndex = self.materialList.indexOf(item);
									//							if(dIndex > -1) {
									//								self.materialList.splice(dIndex, 1);
									//							}
		
									var idx = -1;
									var dId = item.isFromInventory == '0' ? item.sendDetailId : item.inventoryId;
									m.each(self.materialList, function(index, itm) {
										if(itm) {
											var id = itm.isFromInventory == '0' ? itm.sendDetailId : itm.inventoryId;
											if(dId == id)
												idx = index;
										}
									});
									var currHight = $('#li_' + item.cbxId).height();
									//							alert(materialListHight+ "|" + currHight);
									if(idx != -1) {
										self.materialList.splice(idx, 1);
		//								if(plus.device.model == pdaModel)
		//									$('#div_basic_info').height(materialListHight - currHight);
										self.buildTotalInfo();
									}
								} else {
		
								}
								setFocusForScanner();
							}, '提示', ['是', '否']);
						}
					},
					toInput: function($event, inputType, inputValue) {
						var self = this;
						event.stopPropagation();
						inputDialogClass.showInputDialog(ws, {
							width: '100%',
							height: '50%',
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
					submit: function() {
						var self = this;
						if(window.plus) {
							twaiting = plus.nativeUI.showWaiting('加载中...');
						}
						var inventoryIds = [];
						var ladingDetailIds = [];
						var sendDetailIds = [];
						var outputNums = [];
						var outputWeights = [];
						var realNums = [];
						var realWeights = [];
						var isFromInventorys = [];
						var isScans = [];
						m.each(self.materialList, function(index, itm) {
							if(itm) {
								inventoryIds.push(itm.inventoryId ? itm.inventoryId : '');
								ladingDetailIds.push(itm.ladingDetailId ? itm.ladingDetailId : '');
								sendDetailIds.push(itm.sendDetailId ? itm.sendDetailId : '');
								outputNums.push(itm.outputNum ? itm.outputNum : 0);
								outputWeights.push(itm.outputWeight ? itm.outputWeight : 0);
								realNums.push(itm.realNum ? itm.realNum : 0);
								realWeights.push(itm.realWeight ? itm.realWeight : 0);
								isFromInventorys.push(itm.isFromInventory ? itm.isFromInventory : '0');
								isScans.push(itm.isScan ? itm.isScan : '0');
							}
						});
						var apiUrl = app.api_url + '/api/proOutput/save?_t=' + new Date().getTime();
						m.ajax(apiUrl, {
							data: {
								sendId: self.sendId,
								sendCode: self.sendCode, //发货单号
								outputDate: self.outputDate,
								ladingCode: self.ladingCode,
								ownerId: self.ownerId,
								ownerName: self.ownerName,
								spenderId: self.spenderId, // 结算单位ID
								spenderName: self.spenderName, //结算单位
								paymentMode: self.paymentModeId,
								carPlateNo: self.carPlateNo,
								warehouseId: self.warehouseId,
								//						detailList: JSON.stringify(self.materialList)
								//						inventoryId: JSON.stringify(inventoryIds)
								inventoryId: inventoryIds.join(','),
								ladingDetailId: ladingDetailIds.join(','),
								sendDetailId: sendDetailIds.join(','),
								outputNum: outputNums.join(','),
								outputWeight: outputWeights.join(','),
								realNum: realNums.join(','),
								realWeight: realWeights.join(','),
								isFromInventory: isFromInventorys.join(','),
								isScan: isScans.join(','),
								attacheFileIds_1: self.attacheFileIds_1
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 20000, //超时时间设置为10秒；
							success: function(data) {
								if(twaiting) {
									twaiting.close();
								}
								if(data) {
									if(app.debug) {
										console.log(JSON.stringify(data));
									}
									if(data.status) {
										var listView = plus.webview.getWebviewById('warehouse-outing');
										m.fire(listView, "refreshOutputList", {});
										m.back();
									} else {
										m.toast(data.msg);
										setFocusForScanner();
									}
								}
							},
							error: function(xhr, type, errorThrown) {
								if(twaiting) {
									twaiting.close();
								}
								if(app.debug) {
									console.log(xhr + "|" + type + "|" + errorThrown);
								}
								m.toast("网络异常，请重新试试");
							}
						});
					},
					onSubmitClick: function() {
						var self = this;
						if(!isNotBlank(self.ladingCode)) {
							alert('请输入提单号');
							setFocusForScanner();
							return;
						}
						if(!isNotBlank(self.carPlateNo)) {
							alert('请输入车牌号');
							setFocusForScanner();
							return;
						}
						if(!self.materialList || self.materialList.length < 1) {
							alert('请添加需要出库的物料明细！');
							setFocusForScanner();
							return;
						}
						if(m.os.android) {
							var noScannerList = [];
							m.each(self.materialList, function(index, itm) {
								if(itm) {
									if(itm.isScan == '0') {
										noScannerList.push(index + 1);
									}
								}
							});
							if(noScannerList && noScannerList.length > 0) {
								var noScannerStr = noScannerList.join('、');
								var msg = "第" + noScannerStr + "条没扫码确认，是否继续出库？";
								plus.nativeUI.confirm(msg, function(f) {
									if(f.index == 0) {
										self.submit();
									} else {
		
									}
									setFocusForScanner();
								}, '提示', ['继续', '取消']);
							} else {
								self.submit();
							}
						} else {
							self.submit();
						}
					}
				}
			});
		
			$('#txt_scanner').focus();
			$('#txt_scanner').bind('keyup', function(event) {
				if(event.keyCode == "13") {
					var qrCode = $('#txt_scanner').val();
					$('#txt_scanner').val("");
					detailVue.scanner(qrCode);
				}
			});
			//	document.onkeydown = function(event) {
			//		var e = event || window.event;
			//		if(e && e.keyCode == 13) { //回车键的键值为13
			//        	var a = $('#txt_scanner').val();
			//          $('#txt_scanner').val("");
			//          alert(a);
			//		}
			//	};
		
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
		
			function backFromMask() {
				inputDialogClass.closeMask();
				setFocusForScanner();
		//		if(plus.device.model == pdaModel)
		//			$('#div_basic_info').height(materialListHight);
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
				task.addData("busiType", "pro_output");
				if(detailVue.outingKey) {
					task.addData("busiId", detailVue.outingKey + "#1");
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
				task.addData("busiType", "pro_output");
				if(detailVue.outingKey) {
					task.addData("busiId", detailVue.outingKey + "#1");
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
		
			document.addEventListener("closeMask", function(e) {
				backFromMask();
			}, false);
		
			document.addEventListener("inputConfirm", function(e) {
				if(e.detail.inputType == 1) {
					detailVue.ladingCode = e.detail.inputValue;
				} else if(e.detail.inputType == 2) {
					detailVue.carPlateNo = e.detail.inputValue;
				}
				backFromMask();
			}, false);
		
			document.addEventListener("updateMaterialRealPickInfo", function(e) {
				detailVue.updateMaterialRealPickInfo(e.detail.materialDetails);
			}, false);
		
			document.addEventListener("batchAddMaterials", function(e) {
				detailVue.batchAddMaterials(e.detail.materialList);
			}, false);
		
			document.addEventListener("scanner", function(e) {
				detailVue.scanner(e.detail.qRCode);
			}, false);
		
			document.addEventListener("comeBack", function() {
				setFocusForScanner();
			}, false);
		
		
		//		alert( "Device: " + plus.device.model + "|" + "Vendor: " + plus.device.vendor);
		if(window.plus) {
			waiting = plus.nativeUI.showWaiting('加载中...');
		}
		ws = plus.webview.currentWebview();
		detailVue.outingKey = ws.outingKey;
		detailVue.isPDA = plus.device.model == pdaModel;
		detailVue.getAttachFile();
		detailVue.getSpenderList();
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
			if(waiting) {
				waiting.close();
			}
			if(swaiting) {
				swaiting.close();
			}
			if(twaiting) {
				twaiting.close();
			}
			backDefault();
		}
		m.back = detailBack;

		//设置footer绝对位置
		document.getElementById('nav_footer').style.top = (plus.display.resolutionHeight - 45) + "px";
	});

});