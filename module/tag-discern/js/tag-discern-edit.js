define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("moment");
	require("layui");
	require("../../../js/common/common.js");

	var ws = null;
	var waiting = null;
	var swaiting = null;
	var twaiting = null;

	var pdaModel = "PDT-90P";
	var materialListHight;
	var nativeWebview, imm, InputMethodManager;

	m('#queryContent').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	m('#div_material_list .public-list').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	var slider = m("#slider").slider();
	slider.setStopped(true); //禁止滑动

	var layer = null;
	layui.use(['layer'], function() {
		layer = layui.layer;
	});

	var listView = null;
	var materialListPullRefresh = null;
	var nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
	var placesteelPicker = new m.PopPicker();
	var brandPicker = new m.PopPicker();
	var ownerNamePicker = new m.PopPicker();
	var warehousePicker = new m.PopPicker();

	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		detailVue.keyId = ws.keyId;
		detailVue.signsDate = nowDate;
		detailVue.isPDA = plus.device.model == pdaModel;
		detailVue.getWarehouseConditions();
		detailVue.getPlacesteelList();
		detailVue.getMaterialInfoList();
		detailVue.getOwnerList();
		detailVue.initShow(null, true);

		listView = plus.webview.getWebviewById('tag-discern-list');

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

	m.ready(function() {
		//		materialListHight = $('#div_basic_info').height();
	});

	var detailVue = new Vue({
		el: '#body_content',
		data: {
			keyId: '', //主键(列表页带入)
			titleStr: '识别登记',
			totalStr: '',
			isPDA: false,
			signsDate: '', // 时间
			warehouseId: '',
			warehouseName: '',
			placesteelId: '', //产地ID
			placesteelName: '',
			brandId: '', // 品名ID
			brandName: '',
			ownerId: '', // 货主ID
			ownerName: '',
			transportNo: '', // 车船号
			createBy: '', //制单人
			remarks: '', //备注
			numTotal: '0',
			weightTotal: '0',
			currPageSize: 0,
			placesteelList: [],
			brandList: [],
			ownerNameList: [],
			warehouseList: [],
			detailPage: {
				materialList: [], //物料信息List
				pageSize: 50,
				pageNo: 1, //当前页数
				totalPage: 0, //总页数
				totalListCount: 0 //总条数
			}
		},
		methods: {
			onItemSliderClick: function($event, index) {
				var self = this;
				event.stopPropagation();
				slider.gotoItem(index);
				setFocusForScanner();
			},
			getWarehouseConditions: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
					if(data) {
						if(data.warehouseList && data.warehouseList.length > 0) {
							m.each(data.warehouseList, function(index, item) {
								if(item) {
									self.warehouseList.push({
										"value": item.id,
										"text": item.text
									});
								}
							});
						}
					}
				});
			},
			getPlacesteelList: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/sysBusinessBasis/placesteelInfos', function(data) {
//					alert(JSON.stringify(data));
					if(data) {
						if(data.length > 0) {
							m.each(data, function(index, item) {
								if(item) {
									self.placesteelList.push({
										"value": item.id,
										"text": item.text
									});
								}
							});

						}
					}
				});
			},
			getMaterialInfoList: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/sysBusinessBasis/materialConditions', function(data) {
					//					alert(JSON.stringify(data));
					if(data) {
						//						if(data.placesteelList && data.placesteelList.length > 0) {
						//							m.each(data.placesteelList, function(index, item) {
						//								if(item) {
						//									self.placesteelList.push({
						//										"value": item.id,
						//										"text": item.text
						//									});
						//								}
						//							});
						//
						//						}
						if(data.brandList && data.brandList.length > 0) {
							m.each(data.brandList, function(index, item) {
								if(item) {
									self.brandList.push({
										"value": item.id,
										"text": item.text
									});
								}
							});

						}
					}
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
			pickPlacesteel: function() {
				var self = this;
				placesteelPicker.setData(self.placesteelList);
				placesteelPicker.pickers[0].setSelectedValue(self.placesteelId);
				placesteelPicker.show(function(selectItems) {
					if(isNotBlank(self.placesteelId) && self.placesteelId != selectItems[0].value && (self.detailPage.materialList && self.detailPage.materialList.length > 0)) {
						layer.open({
							title: false,
							content: '提示: 请确认是否修改，将清除已采集数据!',
							btn: ['确认', '取消'],
							yes: function(index, layero) {
								//按钮【确认】的回调
								self.clear('', function() {
									self.placesteelName = selectItems[0].text;
									self.placesteelId = selectItems[0].value;
								});
								layer.closeAll();
								setFocusForScanner();
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
					} else {
						self.placesteelName = selectItems[0].text;
						self.placesteelId = selectItems[0].value;
						setFocusForScanner();
					}
				});
			},
			pickBrand: function() {
				var self = this;
				brandPicker.setData(self.brandList);
				brandPicker.pickers[0].setSelectedValue(self.brandId);
				brandPicker.show(function(selectItems) {
					if(isNotBlank(self.brandId) && self.brandId != selectItems[0].value && (self.detailPage.materialList && self.detailPage.materialList.length > 0)) {
						layer.open({
							title: false,
							content: '提示: 请确认是否修改，将清除已采集数据!',
							btn: ['确认', '取消'],
							yes: function(index, layero) {
								//按钮【确认】的回调
								self.clear('', function() {
									self.brandName = selectItems[0].text;
									self.brandId = selectItems[0].value;
								});
								layer.closeAll();
								setFocusForScanner();
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
					} else {
						self.brandName = selectItems[0].text;
						self.brandId = selectItems[0].value;
						setFocusForScanner();
					}
				});
			},
			pickOwnerName: function() {
				var self = this;
				ownerNamePicker.setData(self.ownerNameList);
				ownerNamePicker.pickers[0].setSelectedValue(self.ownerId);
				ownerNamePicker.show(function(selectItems) {
					if(isNotBlank(self.ownerId) && self.ownerId != selectItems[0].value && (self.detailPage.materialList && self.detailPage.materialList.length > 0)) {
						layer.open({
							title: false,
							content: '提示: 请确认是否修改，将清除已采集数据!',
							btn: ['确认', '取消'],
							yes: function(index, layero) {
								//按钮【确认】的回调
								self.clear('', function() {
									self.ownerName = selectItems[0].text;
									self.ownerId = selectItems[0].value;
								});
								layer.closeAll();
								setFocusForScanner();
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
					} else {
						self.ownerName = selectItems[0].text;
						self.ownerId = selectItems[0].value;
						setFocusForScanner();
					}
				});
			},
			pickWarehouse: function() {
				var self = this;
				warehousePicker.setData(self.warehouseList);
				warehousePicker.pickers[0].setSelectedValue(self.warehouseId);
				warehousePicker.show(function(selectItems) {
					if(isNotBlank(self.warehouseId) && self.warehouseId != selectItems[0].value && (self.detailPage.materialList && self.detailPage.materialList.length > 0)) {
						layer.open({
							title: false,
							content: '提示: 请确认是否修改，将清除已采集数据!',
							btn: ['确认', '取消'],
							yes: function(index, layero) {
								//按钮【确认】的回调
								self.clear('', function() {
									self.warehouseName = selectItems[0].text;
									self.warehouseId = selectItems[0].value;
								});
								layer.closeAll();
								setFocusForScanner();
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
					} else {
						self.warehouseName = selectItems[0].text;
						self.warehouseId = selectItems[0].value;
						setFocusForScanner();
					}
				});
			},
			initShow: function(callback, isRefresh) {
				var self = this;
				if(window.plus) {
					waiting = plus.nativeUI.showWaiting('加载中...');
				}
				var apiUrl = app.api_url + '/api/proSigns/form?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: self.keyId,
						pageNo: self.detailPage.pageNo,
						pageSize: self.detailPage.pageSize
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 20000, //超时时间设置为10秒；
					success: function(data) {
						if(waiting) {
							waiting.close();
						}
						if(app.debug) {
							console.log("initShow:" + JSON.stringify(data));
						}
						if(data) {
							if(isRefresh){
                                if(!isNotBlank(self.keyId)) {
                                    self.warehouseId = !data.createBy ? "" : !data.createBy.warehouse ? "" : isNotBlank(data.createBy.warehouse.id) ? data.createBy.warehouse.id : "";
                                    self.warehouseName = !data.createBy ? "" : !data.createBy.warehouse ? "" : isNotBlank(data.createBy.warehouse.warehouseName) ? data.createBy.warehouse.warehouseName : "";
                                } else {
                                    self.warehouseId = isNotBlank(data.warehouseId) ? data.warehouseId : "";
                                    self.warehouseName = isNotBlank(data.warehouseName) ? data.warehouseName : "";
                                }
                                self.signsDate = isNotBlank(data.signsDate) ? data.signsDate : nowDate;
                                self.createBy = !data.createBy ? "" : isNotBlank(data.createBy.userName) ? data.createBy.userName : "";
                                self.brandId = isNotBlank(data.brandId) ? data.brandId : "";
                                self.placesteelId = isNotBlank(data.placesteelId) ? data.placesteelId : "";
                                self.ownerId = isNotBlank(data.ownerId) ? data.ownerId : "";
                                self.brandName = isNotBlank(data.brandName) ? data.brandName : "";
                                self.placesteelName = isNotBlank(data.placesteelName) ? data.placesteelName : "";
                                self.ownerName = isNotBlank(data.ownerName) ? data.ownerName : "";
                                self.transportNo = isNotBlank(data.transportNo) ? data.transportNo : "";
                                self.remarks = isNotBlank(data.remarks) ? data.remarks : "";
							}
							self.numTotal = isNotBlank(data.numTotal) ? data.numTotal : "0";
							self.weightTotal = isNotBlank(data.weightTotal) ? data.weightTotal : "0";
							self.totalStr = "(" + self.numTotal + "件/" + self.weightTotal + "吨)";
							if(data.detailPage) {
								self.detailPage.pageNo = data.detailPage.pageNo;
								self.detailPage.pageSize = data.detailPage.pageSize;
								self.detailPage.totalListCount = data.detailPage.count;
								self.detailPage.totalPage = data.detailPage.totalPage;
								if(self.detailPage.pageNo == 1) {
									self.detailPage.materialList = data.detailPage.list;
								} else {
									self.detailPage.materialList = self.detailPage.materialList.concat(data.detailPage.list);
								}
								self.currPageSize = self.detailPage.pageNo * self.detailPage.pageSize;
								if(self.detailPage.materialList && self.detailPage.materialList.length > 0) {
									m.each(self.detailPage.materialList, function(index, item) {
										if(item) {
											item.signsInfo = (isNotBlank(item.num) ? item.num : '0') + "件/" + (isNotBlank(item.weight) ? item.weight : '0') + "吨";
										}
									});
								}
							}
						}
						if(typeof callback === "function") {
							callback();
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
					if(app.debug) {
						console.log("qRCode:" + qRCode);
					}
					if(!isNotBlank(self.placesteelId)) {
						alert("请选择产地");
						setFocusForScanner();
						return;
					}
					if(!isNotBlank(self.brandId)) {
						alert("请选择品名");
						setFocusForScanner();
						return;
					}
					if(!isNotBlank(self.ownerId)) {
						alert("请选择货主单位");
						setFocusForScanner();
						return;
					}
					if(!isNotBlank(self.warehouseId)) {
						alert("请选择仓库");
						setFocusForScanner();
						return;
					}
					//					if(self.detailPage.materialList && self.detailPage.materialList.length > 0) {
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					var apiUrl = app.api_url + '/api/proSigns/scanForm?_t=' + new Date().getTime();
					m.ajax(apiUrl, {
						data: {
							id: self.keyId,
							signsDesc: qRCode,
							signsDate: self.signsDate,
							placesteelId: self.placesteelId,
							brandId: self.brandId,
							ownerId: self.ownerId,
							warehouseId: self.warehouseId,
							numTotal: self.numTotal,
							weightTotal: self.weightTotal
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
									console.log("scanner:" + JSON.stringify(data));
								}
								if(!isNotBlank(self.keyId))
									self.keyId = data.id;
								self.numTotal = isNotBlank(data.numTotal) ? data.numTotal : "0";
								self.weightTotal = isNotBlank(data.weightTotal) ? data.weightTotal : "0";
								self.totalStr = "(" + self.numTotal + "件/" + self.weightTotal + "吨)";
								if(!isNotBlank(data.msg)) {
									plus.device.beep(2);
									self.detailPage.pageNo = data.detailPage.pageNo;
									self.detailPage.pageSize = data.detailPage.pageSize;
									self.detailPage.totalListCount = data.detailPage.count;
									self.detailPage.totalPage = data.detailPage.totalPage;
									if(self.detailPage.pageNo == 1) {
										self.detailPage.materialList = data.detailPage.list;
									} else {
										self.detailPage.materialList = self.detailPage.materialList.concat(data.detailPage.list);
									}
									self.currPageSize = self.detailPage.pageNo * self.detailPage.pageSize;
									if(self.detailPage.materialList && self.detailPage.materialList.length > 0) {
										m.each(self.detailPage.materialList, function(index, item) {
											if(item) {
												item.signsInfo = (isNotBlank(item.num) ? item.num : '0') + "件/" + (isNotBlank(item.weight) ? item.weight : '0') + "吨";
											}
										});
									}
									m.fire(listView, "refreshTagDiscernList", {});
								} else {
									plus.device.beep(4);
									alert(data.msg);
								}
							} else {
								plus.device.beep(4);
								alert("无法识别的条码，请重试！");
							}
							//							self.pullDownQuery();
							setFocusForScanner();
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
				//				} else {
				//					alert("无法识别的条码，请重试！");
				//				}
			},
			trash: function($event, item) {
				var self = this;
				event.stopPropagation();
				layer.open({
					title: false,
					content: '提示: 确认删除此物料?',
					btn: ['确认', '取消'],
					yes: function(index, layero) {
						//按钮【确认】的回调
						self.clear(item.id);
						layer.closeAll();
						setFocusForScanner();
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
			clear: function(cId, callback) {
				var self = this;
				if(window.plus) {
					twaiting = plus.nativeUI.showWaiting('处理中...');
				}
				var apiUrl = app.api_url + '/api/proSigns/clear?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: self.keyId, //主ID
						signsDetailId: cId //子ID
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
							self.numTotal = isNotBlank(data.numTotal) ? data.numTotal : "0";
							self.weightTotal = isNotBlank(data.weightTotal) ? data.weightTotal : "0";
							self.totalStr = "(" + self.numTotal + "件/" + self.weightTotal + "吨)";
							if(data.detailPage) {
								self.detailPage.pageNo = data.detailPage.pageNo;
								self.detailPage.pageSize = data.detailPage.pageSize;
								self.detailPage.totalListCount = data.detailPage.count;
								self.detailPage.totalPage = data.detailPage.totalPage;
								if(self.detailPage.pageNo == 1) {
									self.detailPage.materialList = data.detailPage.list;
								} else {
									self.detailPage.materialList = self.detailPage.materialList.concat(data.detailPage.list);
								}
								self.currPageSize = self.detailPage.pageNo * self.detailPage.pageSize;
								if(self.detailPage.materialList && self.detailPage.materialList.length > 0) {
									m.each(self.detailPage.materialList, function(index, item) {
										if(item) {
											item.signsInfo = (isNotBlank(item.num) ? item.num : '0') + "件/" + (isNotBlank(item.weight) ? item.weight : '0') + "吨";
										}
									});
								}
							}
							m.fire(listView, "refreshTagDiscernList", {});
						}
						if(typeof callback === "function") {
							callback();
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
			submit: function() {
				var self = this;
				if(window.plus) {
					twaiting = plus.nativeUI.showWaiting('加载中...');
				}
				var apiUrl = app.api_url + '/api/proSigns/save?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: self.keyId, //ID
						placesteelId: self.placesteelId,
						brandId: self.brandId,
						ownerId: self.ownerId,
						warehouseId: self.warehouseId,
						transportNo: self.transportNo, // 车船号
						remarks: self.remarks, //备注
						status: '2' //状态(0:暂存，2:已完成)
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
								m.fire(listView, "refreshTagDiscernList", {});
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
						setFocusForScanner();
					}
				});
			},
			onTemporaryClick: function() {
				var self = this;
				if(!isNotBlank(self.placesteelId)) {
					alert("请选择产地");
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.brandId)) {
					alert("请选择品名");
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.ownerId)) {
					alert("请选择货主单位");
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.warehouseId)) {
					alert("请选择仓库");
					setFocusForScanner();
					return;
				}
				if(!self.detailPage.materialList || self.detailPage.materialList.length < 1) {
					alert("请添加物料");
					setFocusForScanner();
					return;
				}
				if(window.plus) {
					twaiting = plus.nativeUI.showWaiting('加载中...');
				}
				var apiUrl = app.api_url + '/api/proSigns/save?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: self.keyId, //ID
						placesteelId: self.placesteelId,
						brandId: self.brandId,
						ownerId: self.ownerId,
						warehouseId: self.warehouseId,
						transportNo: self.transportNo, // 车船号
						remarks: self.remarks, //备注
						status: '0' //状态(0:暂存，2:已完成)
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
								m.fire(listView, "refreshTagDiscernList", {});
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
						setFocusForScanner();
					}
				});
			},
			onSubmitClick: function() {
				var self = this;
				if(!isNotBlank(self.placesteelId)) {
					alert("请选择产地");
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.brandId)) {
					alert("请选择品名");
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.ownerId)) {
					alert("请选择货主单位");
					setFocusForScanner();
					return;
				}
				if(!isNotBlank(self.warehouseId)) {
					alert("请选择仓库");
					setFocusForScanner();
					return;
				}
				if(!self.detailPage.materialList || self.detailPage.materialList.length < 1) {
					alert("请添加物料");
					setFocusForScanner();
					return;
				}

				layer.open({
					title: false,
					content: '提示: 确认完成此次识别登记?',
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
					if(self.detailPage.totalPage > 1) {
						materialListPullRefresh.refresh(true);
					}
				}, false);
			},
			/**
			 * 上拉查询
			 */
			pullUpQuery: function() {
				var self = this;
				if(self.detailPage.pageNo < self.detailPage.totalPage) {
					self.detailPage.pageNo++;
					self.initShow(function() {
						materialListPullRefresh.endPullupToRefresh();
					}, false);
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

	function backFromMask() {
		inputDialogClass.closeMask();
		setFocusForScanner();
		//		if(plus.device.model == pdaModel)
		//			$('#div_basic_info').height(materialListHight);
	}

	document.addEventListener("refreshInventoryRegister", function(e) {
		detailVue.pullDownQuery();
	}, false);

	document.addEventListener("closeMask", function(e) {
		backFromMask();
	}, false);

	document.addEventListener("inputConfirm", function(e) {
		if(e.detail.inputType == 1) {
			detailVue.transportNo = e.detail.inputValue;
		} else if(e.detail.inputType == 2) {
			detailVue.remarks = e.detail.inputValue;
		}
		backFromMask();
	}, false);

	document.addEventListener("scanner", function(e) {
		detailVue.scanner(e.detail.qRCode);
	}, false);

	document.addEventListener("comeBack", function() {
		setFocusForScanner();
	}, false);

});