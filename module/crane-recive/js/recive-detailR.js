define(function(require, module, exports) {
	var m = require("mui");
	require("mui-zoom");
	require("mui-previewimage");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("moment");
	require("layui");
	// var $ = require("zepto");
	var $ = require("jquery");
	var select2 = require("select2");
	var cameraJs = require("../../common/camera/js/camera.js");
	require("../../../js/common/common.js");

	m.init();

	m.plusReady(function() {
		var swaiting = null;
		var twaiting = null;
		var dataPullRefresh = null;
		var layer = null;
		var slider = m("#slider").slider();
		
		m('#div_list .public-list').scroll({
			deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		m('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		m('#warehouseScrollDiv').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		
		
		// slider.setStopped(true); //禁止滑动
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		
		var layerIndex;
		var relSubPlaceLayerIndex;
		
		var picker = new mui.PopPicker();
		
		function formatState(state) {
		    var $state = $(
			  '<span style="font-size: 16px;border-bottom:1px solid #DCDCDC;display: block;">' + state.text + '</span>'
		    );
		    return $state;
		}
		
		var globalVue = new Vue({
			el: '#off-canvas',
			data: {
				conditions: {},
				selectedMtxs: {},
				warehouseList: [],
				attacheFileIds_1: "",
				delIds_1: "",
				imageFiles: [],
				dataPage: {
					dataList: [],
					detailData:{},
					placeSubList: [], // 全部库位数据
					relPlaceSubList: [], // 关联库位数据
					realNum:[],
					// pageSize: 10,
					// pageNo: 1, //当前页数
					// totalPage: 0, //总页数
					// totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"dispatchCode": "", //单据号
						"warehouseId": app.getUser().warehouse.id, //仓库ID
						"beginDate": "", //开始时间
						"endDate": "" //结束时间
					}
				}
			},
			methods: {
				cancelRecive:function(){
					m.back();
					// debugger
					// layer.close(layerIndex);
					// layerIndex = undefined;
					// event.stopPropagation();
				},
				saveRecive:function(){
					// debugger

					var self = this;
					var detailList=globalVue.dataPage.detailData.detailList;
					for(var i=0;i<detailList.length;i++){
						var rnum=detailList[i].realNum;
						var tSubPlaceId = detailList[i].subPlaceId;
						if(rnum==null||rnum==undefined||rnum.length<=0||parseFloat(rnum)<=0){
							m.toast("物料信息第"+(i+1)+"行，请填写正确的实收数量");
							return false;
						}
						if(tSubPlaceId==null||tSubPlaceId==undefined||tSubPlaceId.length<=0||parseFloat(tSubPlaceId)<0) {
							m.toast("物料信息第"+(i+1)+"行，库位为空");
							return false;
						}
					}
					
					var params=new Map();
					var tipList = [];
					params["id"]=globalVue.dataPage.detailData.id;
					params["bargeId"]=globalVue.dataPage.detailData.bargeId;
					params["attacheFileIds_1"]=globalVue.attacheFileIds_1; // 附件
					params["delIds_1"]=globalVue.delIds_1;
					for(var i=0;i<detailList.length;i++){
						params['detailList[' + i +'].realNum'] = detailList[i].realNum;
						params['detailList[' + i +'].id'] = detailList[i].id;
						params['detailList[' + i +'].subPlaceId'] = detailList[i].subPlaceId;
						
						tipList.push(detailList[i].materialDesc + "存放在" + 
							detailList[i].subPlaceName + "库位");
						
					}
					
					layer.open({
						// title: false,
						content: tipList.join("，") + "，是否确认？",
						area: ['420px', '240px'], //宽高
						btn: ['确认', '取消'],
						yes: function(index, layero) {
							//按钮【确认】的回调
							
							m.ajax(app.api_url + '/api/proReceiving/saveNum?_t=' + new Date().getTime(), {
								data: params,
								dataType: 'json', //服务器返回json格式数据
								type: 'post', //HTTP请求类型
								timeout: 10000, //超时时间设置为60秒； 
								success: function(res) {
									// debugger
									if(res.status) { // 提交成功
										m.toast("操作成功");
										let target = plus.webview.getWebviewById('toRecive');
										// target.reload(true);
										
										m.fire(target, "popup", {
											msg: res.msg
										});
										
										m.back();
										
									}else { // 提交失败
										if(res.msg !== undefined && res.msg !== null && res.msg !== '') {
											m.toast(res.msg);
										}else {
											m.toast("操作失败");
										}
									}
									
								},
								error: function(xhr, type, errorThrown) {
									if(swaiting) {
										swaiting.close();
									}
									layer.msg("网络异常，请重新试试");
								}
							});
							
							layer.closeAll();
						},
						btn2: function(index, layero) {
							//按钮【取消】的回调
							// setFocusForScanner();
						},
						cancel: function() {
							//右上角关闭回调
							// setFocusForScanner();
						}
					});
				
					
				},
				// 实收数量增1
				toAddNum:function(index) {
					let v1=$("#hangNum").val();
					if(v1&&v1.length>0){
						// $("#hangNum").val(parseInt(v1)+1);
						globalVue.dataPage.detailData.detailList[index].realNum = parseInt(v1)+1;
					}else{
						// $("#hangNum").val(1);
						globalVue.dataPage.detailData.detailList[index].realNum = 1;
					}
				},
				// 实收数量减一 
				toMinusNum:function(index) {
					let v1=$("#hangNum").val();
					if(v1&&v1.length>0){
						if(parseInt(v1)>1){
							// $("#hangNum").val(parseInt(v1)-1);
							globalVue.dataPage.detailData.detailList[index].realNum = parseInt(v1)-1;
						}
					}
				},
				selectSub:function(item){
					// debugger
					picker.show(function (selectItems) {
						// debugger
						item.subPlaceName=selectItems[0].text;
						item.subPlaceId=selectItems[0].id;
						$("#subPlaceInputId" + item.id).val(item.subPlaceId);
						$("#subPlaceInput" + item.id).val(item.subPlaceName);
					})
				},
				getPlaceSubList: function() { // 全部库位
					var self = this;
					var relPath = '/api/sysBusinessBasis/subPlaceInfos?warehouseId=' + 
					self.dataPage.filterConditions.warehouseId;
					
					m.getJSON(app.api_url + relPath, function(data) {
						// debugger
						self.dataPage.placeSubList = data;
						
						$('.q-subPlaceInput-name').select2({
							templateResult: formatState,
							data: data
						});
						
						// 选中事件
						$(".q-subPlaceInput-name").on("select2:select", function(e) {
							// debugger
							// $("#subPlaceInputId" + item.id).val(item.subPlaceId);
							var index = $(e.target).attr("itemIndex");
							
							globalVue.dataPage.detailData.detailList[index].subPlaceId = e.params.data.id;
							globalVue.dataPage.detailData.detailList[index].subPlaceName = e.params.data.text;
							
							
						});
						
						// picker.setData(data);
						
						if(globalVue.dataPage.detailData.detailList !== undefined &&
							globalVue.dataPage.detailData.detailList.length > 0) {
								
							for (var i = 0; i < globalVue.dataPage.detailData.detailList.length; i++) {
								let tmpItem = globalVue.dataPage.detailData.detailList[i];
								if(tmpItem.subPlaceId !== undefined) {
									// $("#subPlaceInputId" + tmpItem.id).val(tmpItem.subPlaceId);
									// $("#subPlaceInput" + tmpItem.id).val(tmpItem.subPlaceName);
									
									$("#subPlaceInput" + tmpItem.id).val(tmpItem.subPlaceId).trigger('change');
									
								}
										
							}
								
						}
						
					});
				},
				getRelSubPlace: function(index) { // 获取关联子库位
				
					var self = this;
					
					var meterItem = globalVue.dataPage.detailData.detailList[index];
					
					var relPath = '/api/sysBusinessBasis/subPlaceInfos?warehouseId=' + 
					self.dataPage.filterConditions.warehouseId + '&brandId=' + meterItem.brandId +
					'&textureId=' + meterItem.textureId + '&specificationId=' + meterItem.specificationId +
					'&placesteelId=' + meterItem.placesteelId;
					
					m.getJSON(app.api_url + relPath, function(data) {
						// debugger
						self.dataPage.relPlaceSubList = data;
					});
					
					self.dataPage.detailData.curSubPlaceIndex = index; // 当前关联库位index
					relSubPlaceLayerIndex = layer.open({
					  type: 1,
					  title: "关联库位",
					  area: ['390px', '390px'],
					  content: $("#relSubPlace")
					});
					
					
				},
				relSubPlaceSelect: function(id, text) {
					// debugger
					// item.subPlaceName=selectItems[0].text;
					// item.subPlaceId=selectItems[0].id;
					// $("#subPlaceInputId").val(item.subPlaceId);
					// $("#subPlaceInput").val(item.subPlaceName);
					globalVue.dataPage.detailData.detailList[globalVue.dataPage.detailData.curSubPlaceIndex].subPlaceId = id;
					globalVue.dataPage.detailData.detailList[globalVue.dataPage.detailData.curSubPlaceIndex].subPlaceName = text;
					
					let tmp = globalVue.dataPage.detailData.detailList[globalVue.dataPage.detailData.curSubPlaceIndex];
					
					// $("#subPlaceInputId" + tmp.id).val(id);
					// $("#subPlaceInput" + tmp.id).val(text);
					$("#subPlaceInput" + tmp.id).val(id).trigger('change');
					layer.close(relSubPlaceLayerIndex);
				},
				getAttachFile: function() {
					// debugger
					var self = this;
					if (app.debug) {
						var getInventoryAttachFileUrl = app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime() +
							"&busiType=pro_receiving" + "&busiId=" + (globalVue.dataPage.detailData.id + "#1") + "&token=" + app.getToken();
						console.log("getInventoryAttachFileUrl:" + getInventoryAttachFileUrl);
					}
					m.ajax(app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime(), {
						data: {
							busiType: 'pro_receiving',
							busiId: globalVue.dataPage.detailData.id + "#1",
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
						// 	m.ajax(app.api_url + '/api/sys/file/deleteFile?_t=' + new Date().getTime(), {
						// 		data: {
						// 			fileId: id,
						// 			token: app.getToken()
						// 		},
						// 		dataType: 'json', //服务器返回json格式数据
						// 		type: 'post', //HTTP请求类型
						// 		success: function(data) {
						
						// 		},
						// 		error: function(xhr, type, errorThrown) {
						// 			m.toast("网络异常，请重新试试");
						// 		}
						// 	});
						
							self.delIds_1 += id + ',';
						
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
				}

			}

		});
		
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
						globalVue.attacheFileIds_1 += newFile.id + ',';
						newFile.fileExt = 'jpg';
						newFile.fileSize = uf[0].fileSize;
						//					newFile.fileUrl = app.api_url + '' + 'api/sys/file/download?isOnLine=true&fileId=' + '' + newFile.id + '&token=' + app.getToken();
						newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id +
							'&token=' + app.getToken();
						newFile.fileUrl = app.api_url + '' +
							'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id +
							'&token=' + app.getToken();
						globalVue.imageFiles.push(newFile);
		
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
			if (globalVue.dataPage.detailData.id) {
				task.addData("busiId", "#1");
			} else {
				task.addData("busiId", "");
			}
			task.start();
		}
		
		function batchUpload(file, callback) {
			// debugger
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
							globalVue.attacheFileIds_1 += newFile.id + ',';
							newFile.fileExt = 'jpg';
							newFile.fileSize = uf[zm].fileSize;
							newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id +
								'&token=' + app.getToken();
							newFile.fileUrl = app.api_url + '' +
								'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id +
								'&token=' + app.getToken();
							globalVue.imageFiles.push(newFile);
		
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
			task.addData("busiType", "pro_receiving");
			if (globalVue.dataPage.detailData.id) {
				task.addData("busiId", "#1");
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
		
		// //	document.addEventListener('save-picture', function(event) {
		// //		var url = event.detail.target;
		// //		plus.io.resolveLocalFileSystemURL(url, function(entry) {
		// //				plus.nativeUI.confirm('立即上传或保存到手机相册？', function(f) {
		// //					if(f.index == 1) {
		// //						compressAndUploadImg(entry);
		// //					} else if(f.index == 0) {
		// //						plus.gallery.save(entry.fullPath, function() {
		// //							m.toast("保存图片到相册成功");
		// //						}, function(se) {
		// //							m.toast(se.message);
		// //						});
		// //					}
		// //				}, '提示', ['保存', '上传']);
		// //			},
		// //			function(e) {
		// //				m.alert("读取拍照文件错误：" + e.message);
		// //			});
		// //	}, false);
		
		function processPicture(url) {
			debugger
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
		
		// document.addEventListener("refreshInventoryRegister", function(e) {
		// 	globalVue.pullDownQuery();
		// }, false);
		
		// document.addEventListener("closeMask", function(e) {
		// 	backFromMask();
		// }, false);
		
		// document.addEventListener("updateMaterialRealPickInfo", function(e) {
		// 	globalVue.updateMaterialRealPickInfo(e.detail.materialDetails);
		// }, false);
		
		// document.addEventListener("scanner", function(e) {
		// 	globalVue.scanner(e.detail.qRCode);
		// }, false);
		
		// document.addEventListener("comeBack", function() {
		// 	setFocusForScanner();
		// }, false);
		
		
		// debugger
		ws = plus.webview.currentWebview();
		globalVue.dataPage.detailData=ws.reciveDetail;
		
		globalVue.dataPage.filterConditions.warehouseId = ws.warehouseId;
		
		globalVue.getPlaceSubList(); // 获取全部库位
		
		globalVue.getAttachFile();
		// globalVue.initShow();
		
		
	});

});