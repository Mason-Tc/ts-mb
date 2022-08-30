define(function(require, module, exports) {
	var m = require("mui");
	require("mui-zoom");
	require("mui-previewimage");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("layui");
	var cameraJs = require("../../common/camera/js/camera.js");
	require("../../../js/common/common.js");

	m.init();

	m.plusReady(function() {
		var ws = null;
		var waiting = null;
		var swaiting = null;
		var twaiting = null;
		
		var pdaModel = "PDT-90P";
		
		var materialListHight;
		
		var nativeWebview, imm, InputMethodManager;
		
		var slider = m("#slider").slider();
		slider.setStopped(true); //禁止滑动
		
		var layer = null;
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		
		var materialListPullRefresh = null;
		
		mui.ready(function() {
			materialListHight = $('#div_basic_info').height();
		});
		
		var detailVue = new Vue({
			el: '#body_inventory_register',
			data: {
				inventoryKey: '', //主键(列表页带入)
				warehouseId: '',
				checkCodeStr: '', // 盘点单据号
				checkCode: '', // 盘点单号
				checkNumTotal: '', // 原总件数
				numTotal: '',
				checkType: '', // 盘点类型(1 明盘 2 暗盘)
				warehouseName: '', // 仓库名
				checkDate: '', // 盘点日期
				checkSubject: '', // 盘点主题
				totalCheck: '', // 已盘点总记录数
				createBy: '', //制单人
				totalStr: '',
				attacheFileIds_1: "",
				isPDA: false,
				attachFile: [],
				imageFiles: [],
				files: [],
				coverUrls: [],
				currPageSize: 0,
				detailPage: {
					materialList: [], //物料信息List
					pageSize: 50,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0 //总条数
				}
			},
			methods: {
				initShow: function(callback) {
					var self = this;
					if (window.plus) {
						waiting = plus.nativeUI.showWaiting('加载中...');
					}
					var apiUrl = app.api_url + '/api/proCheck/checkDetail?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							id: self.inventoryKey,
							pageNo: self.detailPage.pageNo,
							pageSize: self.detailPage.pageSize
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							// debugger
							if (waiting) {
								waiting.close();
							}
							if (app.debug) {
								console.log("initShow:" + JSON.stringify(data));
							}
							if (data) {
								self.warehouseId = data.warehouseId;
								// self.checkCodeStr = "盘点登记(" + data.checkCode + ")";
								self.checkCodeStr = "盘点登记";
								self.checkCode = data.checkCode; // 盘点单号
								self.checkNumTotal = data.checkNumTotal; // 原总件数
								self.numTotal = data.numTotal;
								self.checkType = data.checkType; // 盘点类型
								self.warehouseName = data.warehouseName; // 仓库
								self.checkDate = data.checkDate;
								self.checkSubject = data.checkSubject;
								self.createBy = !data.createBy ? "" : data.createBy.userName ? data.createBy.userName : "";
								self.totalCheck = data.totalCheck;
								self.detailPage.pageNo = data.mergePage.pageNo;
								self.detailPage.pageSize = data.mergePage.pageSize;
								self.detailPage.totalListCount = data.mergePage.count;
								self.detailPage.totalPage = data.mergePage.totalPage;
								if (self.detailPage.pageNo == 1) {
									self.detailPage.materialList = data.mergePage.list;
								} else {
									self.detailPage.materialList = self.detailPage.materialList.concat(data.mergePage.list);
								}
								self.currPageSize = self.detailPage.pageNo * self.detailPage.pageSize;
								if (self.detailPage.materialList && self.detailPage.materialList.length > 0) {
									var inventoryedNumTotal = 0; // 已盘点件数总数
									m.each(self.detailPage.materialList, function(index, item) {
										if (item) {
											item.cbxId = item.id + '_' + index;
											item.inventoryInfo = (item.checkNum ? item.checkNum : '0') + item.numUnitStr + "/" + (item.checkWeight ?
												item.checkWeight : '0') + item.weightUnitStr;
												
											if(item.checkStatus === '1' && item.checkNum !== undefined) { // 已盘点
												inventoryedNumTotal += item.checkNum; // 盘点件数
											}
											
										}
									});
									self.totalStr = "(" + inventoryedNumTotal + "/" + self.numTotal + "件)";
									
									var compare = function(obj1, obj2) {
										var date1 = new Date(obj1.updateDate);
										var date2 = new Date(obj2.updateDate);
										
										if(obj1.checkStatus === "1" && obj2.checkStatus !== "1") {
											return 1;
										}else if(obj1.checkStatus !== "1" && obj2.checkStatus === "1") {
											return -1;
										}else if(obj1.checkStatus === "1" && obj2.checkStatus === "1") {
											if(date1 > date2) {
												return 1;
											}else if(date1 < date2) {
												return -1;
											}else {
												return 0;
											}
										}else {
											if(date1 > date2) {
												return -1;
											}else if(date1 < date2) {
												return 1;
											}else {
												return 0;
											}
										}
										
									};
									
									self.detailPage.materialList.sort(compare);
									
									
								}
								
								
								
								
							}
							if (typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if (waiting) {
								waiting.close();
							}
							if (app.debug) {
								console.log(xhr + "|" + type + "|" + errorThrown);
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
				refreshShow: function() {
					var self = this;
					if (window.plus) {
						waiting = plus.nativeUI.showWaiting('加载中...');
					}
					var apiUrl = app.api_url + '/api/proCheck/checkDetail?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							id: self.inventoryKey,
							pageNo: 1,
							pageSize: 50
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							// debugger
							if (waiting) {
								waiting.close();
							}
							if (app.debug) {
								console.log("refreshShow:" + JSON.stringify(data));
							}
							if (data) {
								self.warehouseId = data.warehouseId;
								// self.checkCodeStr = "盘点登记(" + data.checkCode + ")";
								self.checkCodeStr = "盘点登记";
								self.checkCode = data.checkCode; // 盘点单号
								self.checkNumTotal = data.checkNumTotal; // 原总件数
								self.numTotal = data.numTotal;
								self.checkType = data.checkType; // 盘点类型
								self.warehouseName = data.warehouseName; // 仓库
								self.checkDate = data.checkDate;
								self.checkSubject = data.checkSubject;
								self.createBy = !data.createBy ? "" : data.createBy.userName ? data.createBy.userName : "";
								self.totalCheck = data.totalCheck;
								//							self.detailPage.pageNo = data.detailPage.pageNo;
								//						self.detailPage.pageSize = data.detailPage.pageSize;
								//							self.detailPage.totalListCount = data.detailPage.count;
								//							self.detailPage.totalPage = data.detailPage.totalPage;
								self.detailPage.materialList = data.mergePage.list;
								if (self.detailPage.materialList && self.detailPage.materialList.length > 0) {
									var inventoryedNumTotal = 0; // 已盘点件数总数
									m.each(self.detailPage.materialList, function(index, item) {
										if (item) {
											item.cbxId = item.id + '_' + index;
											item.inventoryInfo = (item.checkNum ? item.checkNum : '0') + item.numUnitStr + "/" + (item.checkWeight ?
												item.checkWeight : '0') + item.weightUnitStr;
												
											if(item.checkStatus === '1' && item.checkNum !== undefined) { // 已盘点
												inventoryedNumTotal += item.checkNum; // 盘点件数
											}
											
										}
									});
									self.totalStr = "(" + inventoryedNumTotal + "/" + self.numTotal + "件)";
								}
							}
						},
						error: function(xhr, type, errorThrown) {
							if (waiting) {
								waiting.close();
							}
							if (app.debug) {
								console.log(xhr + "|" + type + "|" + errorThrown);
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
				// 实收数量增1
				toAddNum:function(index) {
					// debugger
					var id = detailVue.detailPage.materialList[index].id;
					var targetDom = $("#hangNum" + id);
					let v1 = targetDom.val();
					if(v1&&v1.length>0){
						targetDom.val(parseInt(v1)+1);
						// detailVue.detailPage.materialList[index].checkNum = parseInt(v1)+1;
					}else{
						targetDom.val(1);
						// detailVue.detailPage.materialList[index].checkNum = 1;
					}
				},
				// 实收数量减一 
				toMinusNum:function(index) {
					// debugger
					var id = detailVue.detailPage.materialList[index].id;
					var targetDom = $("#hangNum" + id);
					var v1 = targetDom.val();
					if(v1&&v1.length>0){
						if(parseInt(v1)>1){
							targetDom.val(parseInt(v1)-1);
							// detailVue.detailPage.materialList[index].checkNum = parseInt(v1)-1;
						}
					}
				},
				// 已盘/未盘提交处理
				saveDetail: function(item) {
					// debugger
					var apiUrl = app.api_url + '/api/proCheck/updateDetail?_t=' + new Date().getTime();
					
					// var checkStatusValue;
					var postData;
					var checkNumValue = $('#hangNum' + item.id).val();
					var checkDescValue = $('#checkDescInput' + item.id).val();
					if(checkNumValue === undefined || checkNumValue === null || checkNumValue === '') {
						m.toast("盘点件数为空");
						return;
					}
					
					var re = /^\d*$/;
					if(!re.test(checkNumValue)) {
						m.toast("盘点件数只能为零或正整数");
						return;
					}
					
					if(item.checkStatus === '0') {
						// checkStatusValue = '1';
						postData = {
							id: item.id,
							checkStatus: '1',
							checkNum: checkNumValue,
							checkDesc: checkDescValue
						};
					}else {
						// checkStatusValue = '0';
						postData = {
							id: item.id,
							checkStatus: '0',
							checkNum: checkNumValue,
							checkDesc: checkDescValue
						};
					}
					
					// return;
					swaiting = plus.nativeUI.showWaiting('处理中...');
					m.ajax(apiUrl, {
						data: postData,
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
								location.reload();
								// if(data.status) {
								// 	m.fire(inventoryRegisterView, "refreshInventoryRegister", {});
								// 	m.back();
								// } else {
								// 	m.toast(data.msg);
								// }
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
				},
				getAttachFile: function() {
					var self = this;
					if (app.debug) {
						var getInventoryAttachFileUrl = app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime() +
							"&busiType=pro_check" + "&busiId=" + (self.inventoryKey + "#1") + "&token=" + app.getToken();
						console.log("getInventoryAttachFileUrl:" + getInventoryAttachFileUrl);
					}
					m.ajax(app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime(), {
						data: {
							busiType: 'pro_check',
							busiId: self.inventoryKey + "#1",
							token: app.getToken()
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为20秒；
						success: function(data) {
							if (data) {
								self.attachFile = data;
								var imageFiles = [];
								var files = [];
								var coverUrls = [];
								for (var i = 0; i < data.length; i++) {
									var fileExt = data[i].fileExt;
									var size = parseInt(data[i].fileSize);
									var k = 1000, // or 1024
										sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
									j = Math.floor(Math.log(size) / Math.log(k));
									data[i].fileSize = (size / Math.pow(k, j)).toPrecision(3) + ' ' + sizes[j];
									if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
										data[i].previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + data[i].id +
											'&token=' + app.getToken();
										data[i].fileUrl = app.api_url + '' +
											'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + data[
												i].id + '&token=' + app.getToken();
										imageFiles.push(data[i]);
									} else {
										files.push(data[i]);
										if (isNotBlank(data[i].baidudocId)) {
											var jsonData = JSON.parse(data[i].baidudocInfo);
											if (jsonData.status == "PUBLISHED") {
												coverUrls.push(jsonData.coverUrl);
											} else {
												coverUrls.push("../../../images/file.jpg");
											}
										} else {
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
				openFile: function(fileId, baidudocId) {
					if (isNotBlank(baidudocId)) {
						var self = this;
						var pageUrl = "../../attachFilePreview/html/read-document.html";
						m.openWindow({
							fileId: fileId,
							url: pageUrl,
							show: {
								aniShow: 'pop-in'
							},
							waiting: {
								autoShow: true
							},
							extras: {
								"fileId": fileId
							}
						});
					} else {
						var filePath = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&fileId=' + '' + fileId + '&token=' +
							app.getToken();
						if (app.debug) {
							console.log("RiskfilePath:" + filePath);
						}
						if (m.os.android) {
							plus.runtime.launchApplication({
								pname: "com.tencent.mtt",
								extra: {
									url: filePath
								}
							}, function(e) {
								plus.nativeUI.confirm('当前设备上找不到能打开此附件的应用，是否手动下载并安装相关应用？', function(f) {
									if (f.index == 0) {
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
					}
				},
				delete: function(file, type) {
					var self = this;
					var id = file.id;
					if (type == 1) { //文件
						plus.nativeUI.confirm('是否删除此附件？', function(f) {
							if (f.index == 0) {
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
								for (var i = 0; i < self.files.length; i++) {
									if (self.files[i].id != id) {
										files.push(self.files[i]);
									}
								}
								self.files = files;
							} else {
		
							}
						}, '提示', ['是', '否']);
					} else { //图片
						if (id) {
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
							for (var i = 0; i < self.imageFiles.length; i++) {
								if (self.imageFiles[i].id != id) {
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
										for (var i = 0; i < self.imageFiles.length; i++) {
											if (self.imageFiles[i].fileUrl != file.fileUrl) {
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
					if (qRCode) {
						if (app.debug) {
							console.log("qRCode:" + qRCode);
						}
						if (self.detailPage.materialList && self.detailPage.materialList.length > 0) {
							//						var curId = "";
							//						var curInventoryId = "";
							//						m.each(self.detailPage.materialList, function(index, item) {
							//							if(item) {
							//								if(item.materialCode == qRCode) {
							//									curId = item.id;
							//									curInventoryId = item.inventoryId;
							//								}
							//							}
							//						});
							////alert(curId + "|" + curInventoryId);
							//						if(!curId) {
							//							plus.device.beep(4);
							//							alert("扫码错误或此条码不在当前盘点任务中，请重试！");
							//							return;
							//						}
							if (window.plus) {
								swaiting = plus.nativeUI.showWaiting('处理中...');
							}
							var apiUrl = app.api_url + '/api/proCheck/updateDetail?_t=' + new Date().getTime();
							m.ajax(apiUrl, {
								data: {
									//								id: curId,
									//								inventoryId: curInventoryId
									checkId: self.inventoryKey,
									materialCode: qRCode
								},
								dataType: 'json', //服务器返回json格式数据
								type: 'post', //HTTP请求类型
								timeout: 20000, //超时时间设置为10秒；
								success: function(data) {
									if (swaiting) {
										swaiting.close();
									}
									if (data) {
										if (app.debug) {
											console.log(JSON.stringify(data));
										}
										if (data.status) {
											if (data.other == '1') {
												plus.device.beep(2);
											} else if (data.other == '2') {
												plus.device.beep(4);
												alert("扫码错误或此条码不在当前盘点任务中，请重试！");
											}
										} else {
											plus.device.beep(4);
											alert("扫码错误或此条码不在当前盘点任务中，请重试！");
										}
									} else {
										plus.device.beep(4);
										alert("无法识别的条码，请重试！");
									}
									self.pullDownQuery();
								},
								error: function(xhr, type, errorThrown) {
									if (swaiting) {
										swaiting.close();
									}
									if (app.debug) {
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
							"warehouseId": self.warehouseId,
							"materialDetails": item
						}
					});
				},
				updateMaterialRealPickInfo: function(materialDetails) {
					var self = this;
					if (self.detailPage.materialList && self.detailPage.materialList.length > 0 && materialDetails) {
						var idx = -1;
						var uId = materialDetails.isFromInventory == '0' ? materialDetails.sendDetailId : materialDetails.inventoryId;
						m.each(self.detailPage.materialList, function(index, itm) {
							if (itm) {
								var id = itm.isFromInventory == '0' ? itm.sendDetailId : itm.inventoryId;
								if (uId == id)
									idx = index;
							}
						});
						if (idx != -1) {
							self.detailPage.materialList.splice(idx, 1, materialDetails);
							if (plus.device.model == pdaModel)
								$('#div_basic_info').height(materialListHight);
						}
					}
					setFocusForScanner();
				},
				submit: function() {
					// debugger
					var self = this;
					// return;
					if (window.plus) {
						twaiting = plus.nativeUI.showWaiting('加载中...');
					}
					var apiUrl = app.api_url + '/api/proCheck/submit?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							id: self.inventoryKey, //盘点ID
							status: '4', //状态(3:暂存，4:已完成)
							attacheFileIds_1: self.attacheFileIds_1 //附件
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							if (twaiting) {
								twaiting.close();
							}
							if (data) {
								if (app.debug) {
									console.log(JSON.stringify(data));
								}
								if (data.status) {
									var listView = plus.webview.getWebviewById('inventory-list');
									m.fire(listView, "refreshAlreadyList", {
										itemIndx: 1
									});
									m.back();
								} else {
									if(data.msg !== undefined) {
										m.toast(data.msg);
									}else {
										m.toast("提交失败!");
									}
									
									setFocusForScanner();
								}
							}
						},
						error: function(xhr, type, errorThrown) {
							if (twaiting) {
								twaiting.close();
							}
							if (app.debug) {
								console.log(xhr + "|" + type + "|" + errorThrown);
							}
							m.toast("网络异常，请重新试试");
							setFocusForScanner();
						}
					});
				},
				onTemporaryClick: function() {
					var self = this;
					var tipContent;
					for (var i = 0; i < detailVue.detailPage.materialList.length; i++) {
						var item = detailVue.detailPage.materialList[i];
						
						var checkNumValue = $('#hangNum' + item.id).val();
						var re = /^\d*$/;
						if(!re.test(checkNumValue)) {
							layer.alert("第" + (i+1) + "行盘点件数只能为零或正整数");
							return;
						}
						
						var targetDom = $("#hangNum" + item.id);
						var v1 = targetDom.val();
						if((v1 !== undefined && v1 !== null && v1 !== '') && (item.checkStatus === '0')) {
							tipContent = "第" + (i+1) + "行有物料明细已盘点，请标注已盘，继续提交，则未标注已盘的盘点信息不保存！";
							break;
						}
					}
					
					if(tipContent !== undefined) {
						layer.open({
							title: false,
							content: tipContent,
							btn: ['确认', '取消'],
							yes: function(index, layero) {
								//按钮【确认】的回调
								self.temporarySubmit();
								layer.closeAll();
							},
							btn2: function(index, layero) {
								//按钮【取消】的回调
								setFocusForScanner();
							},
							cancel: function() {
								//右上角关闭回调
								setFocusForScanner();
							}
						});
					}else {
						self.temporarySubmit();
					}

					
				},
				temporarySubmit: function() {
					// debugger
					var self = this;
					if (window.plus) {
						twaiting = plus.nativeUI.showWaiting('加载中...');
					}
					
					var apiUrl = app.api_url + '/api/proCheck/submit?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							id: self.inventoryKey, //盘点ID
							status: '3', //状态(3:暂存，4:已完成)
							attacheFileIds_1: self.attacheFileIds_1 //附件
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							// debugger
							if (twaiting) {
								twaiting.close();
							}
							if (data) {
								if (app.debug) {
									console.log(JSON.stringify(data));
								}
								
								if(data.status) {
									var listView = plus.webview.getWebviewById('inventory-list');
									m.fire(listView, "refreshAlreadyList", {
										itemIndx: 0
									});
									m.back();
								}else {
									if(data.msg !== undefined) {
										m.toast(data.msg);
									}else {
										m.toast("提交失败!");
									}
									
									setFocusForScanner();
								}
								
								// if (data.status) {

								// } else {
								// 	m.toast(data.msg);
								// 	setFocusForScanner();
								// }
							}
						},
						error: function(xhr, type, errorThrown) {
							if (twaiting) {
								twaiting.close();
							}
							if (app.debug) {
								console.log(xhr + "|" + type + "|" + errorThrown);
							}
							m.toast("网络异常，请重新试试");
							setFocusForScanner();
						}
					});
				},
				onSubmitClick: function() {	
					var self = this;
					var tipContent = '确认完成此次盘点?';
					for (var i = 0; i < detailVue.detailPage.materialList.length; i++) {
						var item = detailVue.detailPage.materialList[i];
						
						var checkNumValue = $('#hangNum' + item.id).val();
						var re = /^\d*$/;
						if(!re.test(checkNumValue)) {
							layer.alert("第" + (i+1) + "行盘点件数只能为零或正整数");
							return;
						}
						
						var targetDom = $("#hangNum" + item.id);
						var v1 = targetDom.val();
						if((v1 !== undefined && v1 !== null && v1 !== '') && (item.checkStatus === '0')) {
							tipContent = "第" + (i+1) + "行有物料明细已盘点，请标注已盘，继续提交，则未标注已盘的盘点信息不保存！";
							break;
						}
					}
					
					layer.open({
						title: false,
						content: tipContent,
						btn: ['确认', '取消'],
						yes: function(index, layero) {
							//按钮【确认】的回调
							self.submit();
							layer.closeAll();
						},
						btn2: function(index, layero) {
							//按钮【取消】的回调
							setFocusForScanner();
						},
						cancel: function() {
							//右上角关闭回调
							setFocusForScanner();
						}
					});
		
				},
				getcoverUrl: function(index) {
					var self = this;
					return self.coverUrls[index];
				},
				/**
				下拉查询
				*/
				pullDownQuery: function() {
					var self = this;
					self.detailPage.pageNo = 1;
					self.initShow(function() {
						m.toast("加载成功!");
						materialListPullRefresh.endPulldownToRefresh();
						materialListPullRefresh.scrollTo(0, 0, 100);
						if (self.detailPage.totalPage > 1) {
							materialListPullRefresh.refresh(true);
						}
					});
				},
				/**
				 * 上拉查询
				 */
				pullUpQuery: function() {
					var self = this;
					if (self.detailPage.pageNo < self.detailPage.totalPage) {
						self.detailPage.pageNo++;
						self.initShow(function() {
							materialListPullRefresh.endPullupToRefresh();
						});
					} else {
						materialListPullRefresh.endPullupToRefresh(true);
						window.setTimeout(function() {
							materialListPullRefresh.disablePullupToRefresh();
						}, 1500);
					}
				}
			}
		});
		
		materialListPullRefresh = m('#div_material_list').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					detailVue.pullDownQuery();
				}
			},
			up: {
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				callback: function() {
					detailVue.pullUpQuery();
				}
			}
		});
		
		$('#txt_scanner').focus();
		$('#txt_scanner').bind('keyup', function(event) {
			if (event.keyCode == "13") {
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
			if (mui.os.android) {
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
			if (mui.os.android) {
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
			if (plus.device.model == pdaModel) {
				initNativeObjects();
				showSoftInput();
			}
		}
		
		function backFromMask() {
			inputDialogClass.closeMask();
			setFocusForScanner();
			if (plus.device.model == pdaModel)
				$('#div_basic_info').height(materialListHight);
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
				if (e.index == 1) {
					cameraJs.capurteImage(function(url) {
						processPicture(url);
					});
				} else if (e.index == 2) {
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
					if (status == 200) {
						var uf = JSON.parse(t.responseText);
						if (uf.length === 0) {
							console.log("没有上传文件");
							return;
						}
						var newFile = new Object();
						newFile.id = uf[0].fileId;
						detailVue.attacheFileIds_1 += newFile.id + ',';
						newFile.fileExt = 'jpg';
						newFile.fileSize = uf[0].fileSize;
						//					newFile.fileUrl = app.api_url + '' + 'api/sys/file/download?isOnLine=true&fileId=' + '' + newFile.id + '&token=' + app.getToken();
						newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id +
							'&token=' + app.getToken();
						newFile.fileUrl = app.api_url + '' +
							'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id +
							'&token=' + app.getToken();
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
			task.addData("busiType", "pro_check");
			if (detailVue.inventoryKey) {
				task.addData("busiId", detailVue.inventoryKey + "#1");
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
					if (status == 200) {
						var uf = JSON.parse(t.responseText);
						console.log(JSON.stringify(uf));
						if (uf.length === 0) {
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
							newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id +
								'&token=' + app.getToken();
							newFile.fileUrl = app.api_url + '' +
								'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id +
								'&token=' + app.getToken();
							detailVue.imageFiles.push(newFile);
		
							callback(t);
							zm++;
							if (zm < uf.length) {
								setTimeout(showImg, 350);
							}
						}
					} else {
						m.toast('图片上传失败,请重新上传');
					}
				}
			);
			for (var i = 0; i < file.length; i++) {
				task.addFile(file[i], {
					key: file[i]
				});
			}
			task.addData("busiType", "pro_check");
			if (detailVue.inventoryKey) {
				task.addData("busiId", detailVue.inventoryKey + "#1");
			} else {
				task.addData("busiId", "");
			}
			task.start();
		}
		
		function compressAndUploadImg(entry) {
			if (app.debug) {
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
		
		//	document.addEventListener('save-picture', function(event) {
		//		var url = event.detail.target;
		//		plus.io.resolveLocalFileSystemURL(url, function(entry) {
		//				plus.nativeUI.confirm('立即上传或保存到手机相册？', function(f) {
		//					if(f.index == 1) {
		//						compressAndUploadImg(entry);
		//					} else if(f.index == 0) {
		//						plus.gallery.save(entry.fullPath, function() {
		//							m.toast("保存图片到相册成功");
		//						}, function(se) {
		//							m.toast(se.message);
		//						});
		//					}
		//				}, '提示', ['保存', '上传']);
		//			},
		//			function(e) {
		//				m.alert("读取拍照文件错误：" + e.message);
		//			});
		//	}, false);
		
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
		
		document.addEventListener("refreshInventoryRegister", function(e) {
			detailVue.pullDownQuery();
		}, false);
		
		document.addEventListener("closeMask", function(e) {
			backFromMask();
		}, false);
		
		document.addEventListener("updateMaterialRealPickInfo", function(e) {
			detailVue.updateMaterialRealPickInfo(e.detail.materialDetails);
		}, false);
		
		document.addEventListener("scanner", function(e) {
			detailVue.scanner(e.detail.qRCode);
		}, false);
		
		document.addEventListener("comeBack", function() {
			setFocusForScanner();
		}, false);
		
		// mui('#div_material_list').scroll({
		// 	//		deceleration: 0.1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		// 	indicators: true
		// });
		
		
		
		
		//		alert( "Device: " + plus.device.model + "|" + "Vendor: " + plus.device.vendor);
		ws = plus.webview.currentWebview();
		detailVue.inventoryKey = ws.inventoryKey;
		detailVue.isPDA = plus.device.model == pdaModel;
		detailVue.getAttachFile();
		detailVue.initShow();

		var backDefault = m.back;

		function detailBack() {
			if (waiting) {
				waiting.close();
			}
			if (swaiting) {
				swaiting.close();
			}
			if (twaiting) {
				twaiting.close();
			}
			backDefault();
		}
		m.back = detailBack;

		//设置footer绝对位置
		document.getElementById('nav_footer').style.top = (plus.display.resolutionHeight - 45) + "px";
	});


});
