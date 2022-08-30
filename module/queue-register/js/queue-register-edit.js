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

	var inventoryRegisterView = null;
	var ws = null;
	var swaiting = null;
	var twaiting = null;

	m.init();

	m(".select-box .content").scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		//		indicators: false
	});

	var nowTime = moment().format('YYYY-MM-DD HH:mm');
	var endTime = moment().format('YYYY-MM-DD 23:59');
	var arriveDatePicker = new m.DtPicker({
		"type": "datetime",
		"value": nowTime
	});
	var registerDatePicker = new m.DtPicker({
		"type": "datetime",
		"value": nowTime
	});
	var startDatePicker = new m.DtPicker({
		"type": "datetime",
		"value": nowTime
	});
	var endDatePicker = new m.DtPicker({
		"type": "datetime",
		"value": endTime
	});

	layui.use(['layer'], function() {
		layer = layui.layer;
	});

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		detailVue.queueItem = ws.queueItem;
		detailVue.processType = ws.processType;
		detailVue.arriveDate = nowTime;
		detailVue.registerDate = nowTime;
		detailVue.startDate = nowTime;
		detailVue.endDate = endTime;
		detailVue.businessType = detailVue.queueItem ? detailVue.queueItem.businessType : '1';
		detailVue.initShow();

		registerListView = plus.webview.getWebviewById('queue-register-list');

		var backDefault = m.back;

		function detailBack() {
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

	var detailVue = new Vue({
		el: '#body_queue_register_edit',
		data: {
			topTitle: "排队登记",
			processType: -1, //操作类型 0:扫码新增;1:手工新增;2:修改;
			businessType: '1', //业务类型
			businessTypeName: '出库业务',
			oldValidCode: '',
			validCode: '',
			bridgeCraneId: '',
			bridgeCraneName: '',
			ladingCode: '',
			sendCode: '',
			warehouseId: '',
			warehouseName: '',
			materialDesc: '',
			ladingInfo: '',
			carPlateNo: '',
			arriveDate: '', //车辆到达时间
			phone: '',
			enterBusinessStatus: '1', //作业状态 1:作业中;2:暂停中;
			startDate: '', //起始时间
			endDate: '', //截止时间
			registerDate: '', //登记时间
			carNum: '', //登记车辆数
			processText: '提交',
			queueItem: [],
			validCodeList: [],
			bridgeCraneList: []
		},
		methods: {
			initShow: function() {
				var self = this;
				self.topTitle = self.processType == 2 ? ("登记修改(" + self.queueItem.queueCode + ")") : "排队登记";
				self.processText = self.processType == 2 ? "修改" : "提交";
				//								alert(JSON.stringify(self.queueItem));
				if(self.queueItem) {
					self.businessTypeName = self.businessType == '1' ? '出库业务' : '入库业务';
					self.warehouseId = self.queueItem.warehouseId ? self.queueItem.warehouseId : '';
					self.warehouseName = self.queueItem.warehouseName ? self.queueItem.warehouseName : '';
					self.validCode = self.queueItem.queueCode ? self.queueItem.queueCode : '';
					self.oldValidCode = self.validCode;
					self.bridgeCraneId = self.queueItem.bridgeCraneId;
					self.bridgeCraneName = self.queueItem.bridgeCraneName;
					self.ladingCode = self.queueItem.ladingCode ? self.queueItem.ladingCode : '';
					self.sendCode = self.queueItem.sendCode ? self.queueItem.sendCode : '';
					self.materialDesc = self.queueItem.materialDesc ? self.queueItem.materialDesc : '';
					self.carPlateNo = self.queueItem.carPlateNo ? self.queueItem.carPlateNo : '';
					self.arriveDate = self.queueItem.arriveDate ? self.queueItem.arriveDate : nowTime; //车辆到达时间
					self.phone = self.queueItem.phone ? self.queueItem.phone : '';
					self.enterBusinessStatus = self.queueItem.enterBusinessStatus ? self.queueItem.enterBusinessStatus : ''; //作业状态 1:作业中;2:暂停中;
					//					alert(self.enterBusinessStatus)
					self.startDate = self.queueItem.valideDateFrom ? self.queueItem.valideDateFrom.substring(0, self.queueItem.valideDateFrom.lastIndexOf(':')) : nowTime; //起始时间
					self.endDate = self.queueItem.valideDateTo ? self.queueItem.valideDateTo.substring(0, self.queueItem.valideDateTo.lastIndexOf(':')) : endTime; //截止时间
					self.registerDate = self.queueItem.checkinDate ? self.queueItem.checkinDate : nowTime; //登记时间
					self.carNum = self.queueItem.carNum ? self.queueItem.carNum : ''; //登记车辆数
					self.ladingInfo = (!self.queueItem.sendNumTotal && !self.queueItem.sendWeightTotal) ? "0件/0吨" : (self.queueItem.sendNumTotal && !self.queueItem.sendWeightTotal) ? (self.queueItem.sendNumTotal + "件/0吨") : (!self.queueItem.sendNumTotal && self.queueItem.sendWeightTotal) ? ("0件/" + self.queueItem.sendWeightTotal + "吨") : (self.queueItem.sendNumTotal + "件/" + self.queueItem.sendWeightTotal + "吨"); //提单数量/重量
				}
			},
			getValidCode: function() {
				var self = this;
				if(self.businessType == '2')
					return;
				if(!isNotBlank(self.warehouseId)) {
					alert("请输入正确的发货单号，点击查询并获取相关信息后再查看配置行车数据!");
					return;
				}
				if(!isNotBlank(self.bridgeCraneId)) {
					alert("请先配置至少一条行车数据并选择！");
					return;
				}
				if(!isNotBlank(self.registerDate)) {
					alert("请选择登记时间！");
					return;
				}
				if(app.debug) {
					console.log("validCode:" + self.validCode + "|warehouseId:" + self.warehouseId + "|bridgeCraneId:" + self.bridgeCraneId + "|checkinDate:" + self.registerDate);
				}
				//获取行车信息
				if(window.plus) {
					twaiting = plus.nativeUI.showWaiting('处理中...');
				}
				var apiUrl = app.api_url + '/api/proQueue/getValidCode?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						warehouseId: self.warehouseId,
						bridgeCraneId: self.bridgeCraneId,
						checkinDate: self.registerDate
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 20000, //超时时间设置为10秒；
					success: function(data) {
						if(twaiting) {
							twaiting.close();
						}
						if(data.msg) {
							alert(data.msg);
						} else {
							self.validCodeList = data.validCodeList;
							if(self.validCodeList && self.validCodeList.length > 0){
								self.showSelectBox('validCodeList');
							}else{
								alert('当前没有可以插入的排号');
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
			getBridgeCrane: function() {
				var self = this;
				if(!isNotBlank(self.warehouseId)) {
					alert("请输入正确的发货单号，点击查询并获取相关信息后再查看配置行车数据!");
					return;
				}
				//获取行车信息
				if(window.plus) {
					twaiting = plus.nativeUI.showWaiting('处理中...');
				}
				var apiUrl = app.api_url + '/api/SysBridgeCrane/list?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						warehouseId: self.warehouseId
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 20000, //超时时间设置为10秒；
					success: function(data) {
						if(twaiting) {
							twaiting.close();
						}
						if(data.msg) {
							alert("请输入正确的发货单号，点击查询并获取相关信息后再查看配置行车数据!");
						} else {
							self.bridgeCraneList = data.bridgeCraneList;
							self.showSelectBox('bridgeCraneList');
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
			showSelectBox: function(id) {
				var self = this;
				if(id == 'validCodeList') {
					$("#validCodeList.select-box").css({
						display: 'block'
					});
				} else if(id == 'bridgeCraneList') {
					$("#bridgeCraneList.select-box").css({
						display: 'block'
					});
				}
				$(".cyq_mask").css({
					visibility: 'visible'
				});
			},
			hideSelectBox: function(id, isSure) {
				var self = this;
				if(id == 'validCodeList') {
					$("#validCodeList.select-box").css({
						display: 'none'
					});
				} else if(id == 'bridgeCraneList') {
					$("#bridgeCraneList.select-box").css({
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
			pickArriveDate: function() {
				var self = this;
				arriveDatePicker = new m.DtPicker({
					value: self.arriveDate
				});
				arriveDatePicker.show(function(selectItems) {
					self.arriveDate = selectItems.value;
				});
			},
			pickRegisterDate: function() {
				var self = this;
				if(self.processType == 2)
					return;
				registerDatePicker = new m.DtPicker({
					value: self.registerDate
				});
				registerDatePicker.show(function(selectItems) {
					if(!moment().isSame(selectItems.value, 'day')) {
						alert("请选择当天范围内的时间");
					} else {
						self.registerDate = selectItems.value;
					}
				});
			},
			pickStartDate: function() {
				var self = this;
				startDatePicker = new m.DtPicker({
					value: self.startDate
				});
				startDatePicker.show(function(selectItems) {
					if(moment(selectItems.value).isAfter(self.endDate, 'datetime')) {
						alert("起始时间不能晚于截止时间");
					} else {
						self.startDate = selectItems.value;
					}
				});
			},
			pickEndDate: function() {
				var self = this;
				endDatePicker = new m.DtPicker({
					value: self.endDate
				});
				endDatePicker.show(function(selectItems) {
					if(moment(selectItems.value).isBefore(self.startDate, 'datetime')) {
						alert("截止时间不能早于起始时间");
					} else {
						self.endDate = selectItems.value;
					}
				});
			},
			pickValidCodeList: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.validCode = item;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
				self.hideSelectBox('validCodeList', false);
			},
			pickBridgeCrane: function(e, item) {
				var self = this;
				var $target = $(e.target);
				self.bridgeCraneId = item.id;
				self.bridgeCraneName = item.bridgeCraneName;
				var id = self.queueItem ? self.queueItem.id : '';
				var params = {
					"bridgeCraneId": self.bridgeCraneId,
					"checkinDate": self.registerDate,
					"warehouseId": self.warehouseId
				};
				if(isNotBlank(id)) {
					params = {
						"id": id,
						"bridgeCraneId": self.bridgeCraneId,
						"checkinDate": self.registerDate,
						"warehouseId": self.warehouseId
					};
				}
				if(window.plus) {
					twaiting = plus.nativeUI.showWaiting('处理中...');
				}
				var apiUrl = app.api_url + '/api/proQueue/getQueueCode?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 20000, //超时时间设置为10秒；
					success: function(data) {
						if(twaiting) {
							twaiting.close();
						}
						if(data) {
							self.validCode = data.queueCode;
							self.oldValidCode = self.validCode;
							self.validCodeList = data.validCodeList;
							$target.parent().find('li').removeClass('select');
							$target.addClass('select');
							self.hideSelectBox('bridgeCraneList', false);
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
			changeBusinessType: function(businessType) {
				var self = this;
				var oldBusinessType = self.businessType;
				if(oldBusinessType != businessType) {
					layer.open({
						title: false,
						content: '提示：切换业务类型将导致当前类型的数据被清空, 确认要切换吗?',
						area: ['120px', '140px'],
						btn: ['确认', '取消'],
						yes: function(index, layero) {
							//按钮【确认】的回调
							self.processType = 1;
							self.businessType = businessType;
							self.businessTypeName = self.businessType == '1' ? '出库业务' : '入库业务';
							self.queueItem = [];
							if(self.businessType == '1') {
								self.warehouseId = '';
								self.warehouseName = '';
								self.validCode = '';
								self.oldValidCode = '';
								self.bridgeCraneId = '';
								self.bridgeCraneName = '';
								self.ladingCode = '';
								self.sendCode = '';
								self.materialDesc = '';
								self.carPlateNo = '';
								self.arriveDate = moment().format('YYYY-MM-DD HH:mm'); //车辆到达时间
								self.phone = '';
								self.enterBusinessStatus = '';
								self.startDate = moment().format('YYYY-MM-DD HH:mm'); //起始时间
								self.endDate = endTime; //截止时间
								self.registerDate = moment().format('YYYY-MM-DD HH:mm'); //登记时间
								self.carNum = ''; //登记车辆数
								self.ladingInfo = ''; //提单数量/重量
							} else if(self.businessType == '2') {
								if(window.plus) {
									twaiting = plus.nativeUI.showWaiting('处理中...');
								}
								var apiUrl = app.api_url + '/api/proQueue/enterForm?_t=' + new Date().getTime();
								m.ajax(apiUrl, {
									data: {},
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									timeout: 20000, //超时时间设置为10秒；
									success: function(data) {
										if(twaiting) {
											twaiting.close();
										}
										if(data.msg) {
											alert(data.msg);
										} else {
											self.queueItem = data.proQueue;
											if(self.queueItem) {
												self.warehouseId = self.queueItem.warehouseId ? self.queueItem.warehouseId : '';
												self.warehouseName = self.queueItem.warehouseName ? self.queueItem.warehouseName : '';
												self.validCode = self.queueItem.queueCode ? self.queueItem.queueCode : '';
												self.oldValidCode = self.validCode;
												self.bridgeCraneId = self.queueItem.bridgeCraneId;
												self.bridgeCraneName = self.queueItem.bridgeCraneName;
												self.ladingCode = self.queueItem.ladingCode ? self.queueItem.ladingCode : '';
												self.sendCode = self.queueItem.sendCode ? self.queueItem.sendCode : '';
												self.materialDesc = self.queueItem.materialDesc ? self.queueItem.materialDesc : '';
												self.carPlateNo = self.queueItem.carPlateNo ? self.queueItem.carPlateNo : '';
												self.arriveDate = self.queueItem.arriveDate ? self.queueItem.arriveDate : moment().format('YYYY-MM-DD HH:mm'); //车辆到达时间
												self.phone = self.queueItem.phone ? self.queueItem.phone : '';
												self.enterBusinessStatus = self.queueItem.enterBusinessStatus ? self.queueItem.enterBusinessStatus : ''; //作业状态 1:作业中;2:暂停中;
												self.startDate = self.queueItem.valideDateFrom ? self.queueItem.valideDateFrom.substring(0, self.queueItem.valideDateFrom.lastIndexOf(':')) : moment().format('YYYY-MM-DD HH:mm'); //起始时间
												self.endDate = self.queueItem.valideDateTo ? self.queueItem.valideDateTo.substring(0, self.queueItem.valideDateTo.lastIndexOf(':')) : endTime; //截止时间
												self.registerDate = self.queueItem.checkinDate ? self.queueItem.checkinDate : moment().format('YYYY-MM-DD HH:mm'); //登记时间
												self.carNum = self.queueItem.carNum ? self.queueItem.carNum : ''; //登记车辆数
												self.ladingInfo = (!self.queueItem.sendNumTotal && !self.queueItem.sendWeightTotal) ? "0件/0吨" : (self.queueItem.sendNumTotal && !self.queueItem.sendWeightTotal) ? (self.queueItem.sendNumTotal + "件/0吨") : (!self.queueItem.sendNumTotal && self.queueItem.sendWeightTotal) ? ("0件/" + self.queueItem.sendWeightTotal + "吨") : (self.queueItem.sendNumTotal + "件/" + self.queueItem.sendWeightTotal + "吨"); //提单数量/重量
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
							}
							layer.closeAll();
						},
						btn2: function(index, layero) {
							//按钮【取消】的回调
						},
						cancel: function() {
							//右上角关闭回调
						}
					});
				}
			},
			changeTaskStatus: function(enterBusinessStatus) {
				var self = this;
				self.enterBusinessStatus = enterBusinessStatus;
			},
			searchInfo: function() {
				var self = this;
				if(!isNotBlank(self.sendCode)) {
					alert("请输入正确的发货单号！");
					return;
				}
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('处理中...');
				}
				var apiUrl = app.api_url + '/api/proQueue/scanForm?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						sendCode: self.sendCode
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
							if(data.msg) {
								alert(data.msg);
								return;
							}
							self.queueItem = data.proQueue;
							if(self.queueItem) {
								self.businessTypeName = self.businessType == '1' ? '出库业务' : '入库业务';
								self.warehouseId = self.queueItem.warehouseId ? self.queueItem.warehouseId : '';
								self.warehouseName = self.queueItem.warehouseName ? self.queueItem.warehouseName : '';
								self.validCode = self.queueItem.queueCode ? self.queueItem.queueCode : '';
								self.oldValidCode = self.validCode;
								self.bridgeCraneId = self.queueItem.bridgeCraneId;
								self.bridgeCraneName = self.queueItem.bridgeCraneName;
								self.ladingCode = self.queueItem.ladingCode ? self.queueItem.ladingCode : '';
								self.sendCode = self.queueItem.sendCode ? self.queueItem.sendCode : '';
								self.materialDesc = self.queueItem.materialDesc ? self.queueItem.materialDesc : '';
								self.carPlateNo = self.queueItem.carPlateNo ? self.queueItem.carPlateNo : '';
								self.arriveDate = self.queueItem.arriveDate ? self.queueItem.arriveDate : moment().format('YYYY-MM-DD HH:mm'); //车辆到达时间
								self.phone = self.queueItem.phone ? self.queueItem.phone : '';
								self.enterBusinessStatus = self.queueItem.enterBusinessStatus ? self.queueItem.enterBusinessStatus : ''; //作业状态 1:作业中;2:暂停中;
								self.startDate = self.queueItem.valideDateFrom ? self.queueItem.valideDateFrom.substring(0, self.queueItem.valideDateFrom.lastIndexOf(':')) : moment().format('YYYY-MM-DD HH:mm'); //起始时间
								self.endDate = self.queueItem.valideDateTo ? self.queueItem.valideDateTo.substring(0, self.queueItem.valideDateTo.lastIndexOf(':')) : endTime; //截止时间
								self.registerDate = self.queueItem.checkinDate ? self.queueItem.checkinDate : moment().format('YYYY-MM-DD HH:mm'); //登记时间
								self.carNum = self.queueItem.carNum ? self.queueItem.carNum : ''; //登记车辆数
								self.ladingInfo = (!self.queueItem.sendNumTotal && !self.queueItem.sendWeightTotal) ? "0件/0吨" : (self.queueItem.sendNumTotal && !self.queueItem.sendWeightTotal) ? (self.queueItem.sendNumTotal + "件/0吨") : (!self.queueItem.sendNumTotal && self.queueItem.sendWeightTotal) ? ("0件/" + self.queueItem.sendWeightTotal + "吨") : (self.queueItem.sendNumTotal + "件/" + self.queueItem.sendWeightTotal + "吨"); //提单数量/重量
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
					}
				});
			},
			setBridgeCrane: function() {
				var self = this;
				if(!isNotBlank(self.warehouseId)) {
					alert("请输入正确的发货单号，点击查询并获取相关信息后再查看配置行车数据!");
					return;
				}
				m.openWindow({
					id: 'bridge-crane-edit',
					url: '../html/bridge-crane-edit.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						warehouseId: self.warehouseId
					}
				});
			},
			submit: function() {
				var self = this;
				if(!isNotBlank(self.validCode)) {
					alert("请选择排队号码!");
					return;
				}
				if(self.businessType == '1') {
					if(!isNotBlank(self.bridgeCraneId)) {
						alert("请先配置至少一条行车数据并选择!");
						return;
					}
					if(!isNotBlank(self.ladingCode)) {
						alert("提单号不能为空!");
						return;
					}
					if(!isNotBlank(self.sendCode)) {
						alert("发货单号不能为空!");
						return;
					}
					if(!isNotBlank(self.carPlateNo)) {
						alert("车牌号不能为空!");
						return;
					}
					if(!isNotBlank(self.arriveDate)) {
						alert("车辆到达时间不能为空!");
						return;
					}
					if(!isNotBlank(self.phone)) {
						alert("手机号不能为空!");
						return;
					} else if(!validateTel(self.phone)) {
						alert("请输入正确的手机号!");
						return;
					}
				} else {
					//					if(!isNotBlank(self.carNum)) {
					//						alert("登记车辆数为空或包含特殊字符!");
					//						return;
					//					}
					if(!isPositiveInteger(self.carNum)) {
						alert("登记车辆数请输入非0正整数!");
						return;
					}
					if(!isNotBlank(self.enterBusinessStatus)) {
						alert("请选择作业状态!");
						return;
					}
					if(!isNotBlank(self.startDate)) {
						alert("请选择起始时间!");
						return;
					}
					if(!isNotBlank(self.endDate)) {
						alert("请选择截止时间!");
						return;
					}
				}
				if(!isNotBlank(self.registerDate)) {
					alert("请选择登记时间!");
					return;
				}
				if(!isNotBlank(self.warehouseId)) {
					alert("仓库不能为空!");
					return;
				}
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('加载中...');
				}
				var id = self.queueItem ? self.queueItem.id : '';
				var params = {
					"updateDate": (self.queueItem ? self.queueItem.updateDate : ''),
					"queueCode": self.oldValidCode,
					"newQueueCode": self.validCode,
					"bridgeCraneId": self.bridgeCraneId,
					"sendId": (self.queueItem ? self.queueItem.sendId : ''),
					"businessType": self.businessType,
					"arriveDate": self.arriveDate,
					"phone": self.phone,
					"checkinDate": self.registerDate,
					"carNum": self.carNum,
					"enterBusinessStatus": self.enterBusinessStatus,
					"valideDateFrom": self.startDate,
					"valideDateTo": self.endDate,
					"warehouseId": self.warehouseId
				};
				if(isNotBlank(id)) {
					params = {
						"id": id,
						"updateDate": (self.queueItem ? self.queueItem.updateDate : ''),
						"queueCode": self.oldValidCode,
						"newQueueCode": self.validCode,
						"bridgeCraneId": self.bridgeCraneId,
						"sendId": (self.queueItem ? self.queueItem.sendId : ''),
						"businessType": self.businessType,
						"arriveDate": self.arriveDate,
						"phone": self.phone,
						"checkinDate": self.registerDate,
						"carNum": self.carNum,
						"enterBusinessStatus": self.enterBusinessStatus,
						"valideDateFrom": self.startDate,
						"valideDateTo": self.endDate,
						"warehouseId": self.warehouseId
					};
				}
				var apiUrl = app.api_url + '/api/proQueue/save?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: params,
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
								m.fire(registerListView, "refreshQueueList", {});
								m.back();
							} else {
								m.toast(data.msg);
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
					}
				});
			}
		}
	});
});