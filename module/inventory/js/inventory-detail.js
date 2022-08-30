define(function(require, module, exports) {
	var m = require("mui");
	require("mui-zoom");
	require("mui-previewimage");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("../../../js/common/common.js");

	m.init();

	m.plusReady(function() {
		var ws = null;
		var waiting = null;
		
		var materialListPullRefresh = null;
		
		var slider = m("#slider").slider();
		slider.setStopped(true); //禁止滑动
		
		var detailVue = new Vue({
			el: '#div_inventory_detail',
			data: {
				inventoryKey: '', //主键(列表页带入)
				warehouseId: '',
				checkType: '',
				checkCode: '',
				checkNumTotal: '',
				numTotal: '',
				warehouseName: '',
				checkDate: '', // 盘点日期
				checkSubject: '', // 盘点主题
				totalCheck: '', // 已盘点总记录数
				createBy: '', //制单人
				totalStr: '',
				materialList: [], //物料信息List
				attachFile: [],
				imageFiles: [],
				files: [],
				coverUrls: []
			},
			methods: {
				initShow: function() {
					var self = this;
					var apiUrl = app.api_url + '/api/proCheck/detail?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							id: self.inventoryKey
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							// debugger
							if(waiting) {
								waiting.close();
							}
							if(data) {
								self.warehouseId = data.warehouseId;
								self.checkDate = data.checkDate;
								self.checkType = data.checkType;
								self.checkCode = data.checkCode;
								self.checkNumTotal = data.checkNumTotal;
								self.numTotal = data.numTotal;
								self.warehouseName = data.warehouseName;
								self.checkSubject = data.checkSubject;
								self.createBy = !data.createBy ? "" : data.createBy.userName ? data.createBy.userName : "";
								self.totalCheck = data.totalCheck;
								self.materialList = data.mergeList;
								if(self.materialList && self.materialList.length > 0) {
									var inventoryedNumTotal = 0; // 已盘点件数总数
									m.each(self.materialList, function(index, item) {
										if(item) {
											item.cbxId = item.id + '_' + index;
											item.originalInfo = (item.num ? item.num : '0') + item.numUnitStr + "/" + (item.weight ? item.weight : '0') + item.weightUnitStr;
											item.inventoryInfo = (item.checkNum ? item.checkNum : '0') + item.numUnitStr + "/" + (item.checkWeight ? item.checkWeight : '0') + item.weightUnitStr;
											
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
						var getInventoryDetailAttachFileUrl = app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime() + "&busiType=pro_check" + "&busiId=" + (self.inventoryKey + "#1") + "&token=" + app.getToken();
						console.log("getInventoryDetailAttachFileUrl:" + getInventoryDetailAttachFileUrl);
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
				openFile: function(fileId, baidudocId) {
					if(isNotBlank(baidudocId)){
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
					}else{
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
					}
				},
				onItemSliderClick: function($event, index) {
					var self = this;
					event.stopPropagation();
					slider.gotoItem(index);
				},
				onCloseClick: function() {
					m.back();
				},
				getcoverUrl: function(index){
					var self = this;
					return self.coverUrls[index];
				},
				/**
				下拉查询
				*/
				pullDownQuery: function() {
					var self = this;
					// self.detailPage.pageNo = 1;
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
		
		m.previewImage();
		
		
		
		//		alert( "Device: " + plus.device.model + "|" + "Vendor: " + plus.device.vendor);
		if(window.plus) {
			waiting = plus.nativeUI.showWaiting('加载中...');
		}
		ws = plus.webview.currentWebview();
		detailVue.inventoryKey = ws.inventoryKey;
		detailVue.getAttachFile();
		detailVue.initShow();
		
		materialListPullRefresh = m('#div_material_list').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					// detailVue.pullDownQuery();
					materialListPullRefresh.endPulldownToRefresh();
				}
			},
			up: {
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				callback: function() {
					// detailVue.pullUpQuery();
					materialListPullRefresh.endPullupToRefresh(true);
				}
			}
		});

		var backDefault = m.back;

		function detailBack() {
			if(waiting) {
				waiting.close();
			}
			backDefault();
		}
		m.back = detailBack;

		//设置footer绝对位置
		document.getElementById('nav_footer').style.top = (plus.display.resolutionHeight - 45) + "px";
	});


});