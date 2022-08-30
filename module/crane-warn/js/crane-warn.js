define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("moment");
	require("layui");

	m.init();

	m.plusReady(function() {
		var layer = null;
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		var $ = require("zepto");
		require("../../../js/common/common.js");
		
		var swaiting = null;
		var twaiting = null;
		var dataPullRefresh = null;
		
		var slider = m("#slider").slider();
		// var beginDate = moment().subtract(360, 'day').format('YYYY-MM-DD 00:00');
		var beginDate = moment().format('YYYY-MM-DD 00:00');
		var endDate = moment().format('YYYY-MM-DD 23:59');
		var dtPicker1 = new mui.DtPicker({
			"type": "datetime",
			"value": beginDate
		});
		var dtPicker2 = new mui.DtPicker({
			"type": "datetime",
			"value": endDate
		});
		
		m('#div_list .public-list').scroll({
			deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			indicators: false
		});
		m('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		
		var globalVue = new Vue({
			el: '#off-canvas',
			data: {
				rpAuth: app.getUser().isPrivilege('crane:warn:rp:api') || false, //月台页签权限
				wbAuth: app.getUser().isPrivilege('crane:warn:wb:api') || false, //地磅页签权限
				rpRadioVal: '1', // 警告类型，单选值
				wbRadioVal: '1',
				warehouseList: [],
				leastFlag: '',
				dataPage: {
					warnDictData: [],
					dataList: [],
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"taskCode": "", //单据号
						"warehouseId": app.getUser().warehouse.id, //仓库ID
						"beginDate": "", //开始时间
						"endDate": "", //结束时间
						"warnType": '',
						"taskType": '',
						"status": '0' // 只查询未处理的
					}
				}
			},
			methods: {
				// 选择告警类型标签
				selectTag: function(flag, e) {
					var self = this;
					$("#divTag span").removeClass("tagActive");
					e.target.classList.add("tagActive");
					self.dataPage.filterConditions.warnType = flag;
					if (self.leastFlag != flag) {
						self.resetFilterConditions();
						self.complete();
					}
					self.leastFlag = flag;
				},
				resetFilterConditions() {
					var self = this;
					self.dataPage.filterConditions.taskCode = '';
					self.dataPage.filterConditions.warehouseId = app.getUser().warehouse.id;
					self.dataPage.filterConditions.beginDate = beginDate;
					self.dataPage.filterConditions.endDate = endDate;
				},
				// 单选告警确认
				toRadio: function(flag, e, warnType) {
					var self = this;
					if (warnType == '1') {
						self.rpRadioVal = flag;
						$("#div_alert_railwayplatform span").removeClass("tagActive")
						e.target.classList.add("tagActive");
					} else {
						self.wbRadioVal = flag;
						$("#div_alert_weighbridge span").removeClass("tagActive")
						e.target.classList.add("tagActive");
					}
				},
				toChange: function() {
					$("#txt_railwayplatform_reason").val($("#sl_railwayplatform_reason").val());
				},
				// 处理告警
				toHandle: function(item) {
					var self = this;
					if (item.warnType == '1') {
						layer.open({
							type: 1,
							shade: 0.3,
							title: "告警处理",
							content: $("#div_alert_railwayplatform"),
							area: ['600px', '370px'],
							btn: ['提 交'],
							cancel: function(index) {
								self.resetDialog(item.warnType);
								return true;
							},
							yes: function(index, layero) {
								if (self.rpRadioVal == '') {
									m.toast("请选择告警确认");
									return;
								}
								var warnReason = $("#txt_railwayplatform_reason").val();
								if (!isNotBlank(warnReason)) {
									m.toast("请选择告警原因或输入告警说明");
									return;
								}
								m.ajax(app.api_url + '/api/warning/handleWarning?_t=' + new Date().getTime(), {
									data: {
										id: item.id,
										dealOpinion: warnReason,
										dealResult: self.rpRadioVal
									},
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									success: function(res) {
										if(app.debug)
											console.log(JSON.stringify(res));
										if (swaiting) {
											swaiting.close();
										}
										if(res.status){
											self.resetDialog(item.warnType);
											self.complete();
											layer.close(index);
										}else{
											m.toast(res.msg);
										}
									},
									error: function(xhr, type, errorThrown) {
										if (swaiting) {
											swaiting.close();
										}
										m.toast("网络异常，请重新试试");
									}
								})
							}
						});
					} else {
						// if (item.warnType == '3'){
						// 	$("#spn_weighbridge_tag2").hide();
						// }
						layer.open({
							type: 1,
							shade: 0.3,
							title: "告警处理",
							content: $("#div_alert_weighbridge"),
							area: ['600px', '370px'],
							btn: ['提 交'],
							cancel: function(index) {
								self.resetDialog(item.warnType);
								return true;
							},
							yes: function(index, layero) {
								if (self.wbRadioVal == '') {
									m.toast("请选择告警确认");
									return;
								}
								var warnReason = $("#txt_weighbridge_reason").val();
								if (!isNotBlank(warnReason)) {
									m.toast("请输入告警说明");
									return;
								}
								if(app.debug){
									var pm = {
										id: item.id,
										dealOpinion: warnReason,
										dealResult: self.wbRadioVal
									};
									console.log(JSON.stringify(pm));
								}
								m.ajax(app.api_url + '/api/warning/handleWeighbridgeWarning?_t=' + new Date().getTime(), {
									data: {
										id: item.id,
										dealOpinion: warnReason,
										dealResult: self.wbRadioVal
									},
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									success: function(res) {
										if(app.debug)
											console.log(JSON.stringify(res));
										if (swaiting) {
											swaiting.close();
										}
										if(res.status){
											self.resetDialog(item.warnType);
											self.complete();
											layer.close(index);
										}else{
											m.toast(res.msg);
										}
									},
									error: function(xhr, type, errorThrown) {
										if (swaiting) {
											swaiting.close();
										}
										m.toast("网络异常，请重新试试");
									}
								})
							}
						});
					}
				},
				resetDialog: function(warnType) {
					var self = this;
					if (warnType == '1') {
						self.rpRadioVal = '1';
						$("#div_alert_railwayplatform span").removeClass("tagActive")
						$("#spn_railwayplatform_tag1").addClass("tagActive");
						$("#div_alert_railwayplatform select").val("");
						$("#txt_railwayplatform_reason").val("");
					} else {
						self.wbRadioVal = '1';
						$("#div_alert_weighbridge span").removeClass("tagActive")
						$("#spn_weighbridge_tag1").addClass("tagActive");
						$("#div_alert_weighbridge select").val("");
						$("#txt_weighbridge_reason").val("");
					}
					$("#spn_weighbridge_tag2").show();
				},
				pickBeginDate: function() {
					var self = this;
					dtPicker1.show(function(selectItems) {
						self.dataPage.filterConditions.beginDate = selectItems.value;
						$('.tap-time').each(function() {
							var obj = $(this);
							obj.removeClass('time-selected');
						});
					});
				},
				pickEndDate: function() {
					var self = this;
					dtPicker2.show(function(selectItems) {
						self.dataPage.filterConditions.endDate = selectItems.value;
						$('.tap-time').each(function() {
							var obj = $(this);
							obj.removeClass('time-selected');
						});
					});
				},
				getWarehouseConditions: function() {
					var self = this;
					//获取基础数据 品名 材质 规格 产地
					m.getJSON(app.api_url + '/api/proInventoryApi/warehouseConditions', function(data) {
						self.warehouseList = data.warehouseList;
					});
				},
				getWarnDictData: function() {
					var self = this;
					m.ajax(app.api_url + '/api/dict/getListByType?_t=' + new Date().getTime(), {
						data: {
							type: 'warn_reason'
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						success: function(res) {
							self.dataPage.warnDictData = res;
						}
					});
				},
				complete: function() {
					var self = this;
					self.doDataListQuery({
						"pageNo": 1,
						"pageSize": 10,
						"taskCode": self.dataPage.filterConditions.taskCode,
						"warehouseId": self.dataPage.filterConditions.warehouseId,
						"beginDate": self.dataPage.filterConditions.beginDate,
						"endDate": self.dataPage.filterConditions.endDate,
						"warnType": self.dataPage.filterConditions.warnType,
						"status": self.dataPage.filterConditions.status,
						"taskType": self.dataPage.filterConditions.taskType
					}, function() {
						dataPullRefresh.scrollTo(0, 0, 0);
					});
				},
				doDataListQuery: function(params, callback) {
					var self = this;
					if (window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					if(app.debug)
						console.log(JSON.stringify(params));
					m.ajax(app.api_url + '/api/warning/findWarningPage?_t=' + new Date().getTime(), {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒； 
						success: function(res) {
							if (swaiting) {
								swaiting.close();
							}
							self.dataPage.pageNo = res.pageNo;
							self.dataPage.pageSize = res.pageSize;
							self.dataPage.totalListCount = res.count;
							self.dataPage.totalPage = res.totalPage;
							if (self.dataPage.pageNo == 1) {
								self.dataPage.dataList = res.list;
							} else {
								self.dataPage.dataList = self.dataPage.dataList.concat(res.list);
							}
							if (app.debug)
								console.log(JSON.stringify(self.dataPage.dataList));
		
							if (self.dataPage.dataList && self.dataPage.dataList.length > 0) {
								m.each(self.dataPage.dataList, function(index, item){
									if(item && item.warnType == '2'){
										if(item.diffWeight < 0){
											item.warnMsgHtml = "磅差"+"<span style='margin-left: 0px;color:green;'>" + item.diffWeight + "</span>吨, 超过告警阀值" + item.diffRatio + "‰";
										}else if(item.diffWeight > 0){
											item.warnMsgHtml = "磅差"+"<span style='margin-left: 0px;color:red;'>" + item.diffWeight + "</span>吨, 超过告警阀值" + item.diffRatio + "‰";
										}else{
											item.warnMsgHtml = item.warnMsg;
										}	
									}else{
										item.warnMsgHtml = item.warnMsg;
									}
								});
							}
		
							if (typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if (swaiting) {
								swaiting.close();
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
		
				/**
				下拉查询
				*/
				pullDownQuery: function() {
					var self = this;
					self.dataPage.pageNo = 1;
					//						self.dataPage.pageSize = 10;
					self.doDataListQuery({
						"pageNo": self.dataPage.pageNo,
						"taskCode": self.dataPage.filterConditions.taskCode,
						"warehouseId": self.dataPage.filterConditions.warehouseId,
						"beginDate": self.dataPage.filterConditions.beginDate,
						"endDate": self.dataPage.filterConditions.endDate,
						"warnType": self.dataPage.filterConditions.warnType,
						"status": self.dataPage.filterConditions.status,
						"taskType": self.dataPage.filterConditions.taskType
					}, function() {
						m.toast("加载成功!");
						dataPullRefresh.endPulldownToRefresh();
						dataPullRefresh.scrollTo(0, 0, 0);
						if (self.dataPage.totalPage > 1) {
							dataPullRefresh.refresh(true);
						}
					});
				},
				/**
				 * 上拉查询
				 */
				pullUpQuery: function() {
					var self = this;
					if (self.dataPage.pageNo < self.dataPage.totalPage) {
						self.dataPage.pageNo++;
						self.doDataListQuery({
							"warnType": self.dataPage.filterConditions.warnType,
							"status": self.dataPage.filterConditions.status,
							"taskType": self.dataPage.filterConditions.taskType,
							"pageNo": self.dataPage.pageNo,
							"taskCode": self.dataPage.filterConditions.taskCode,
							"warehouseId": self.dataPage.filterConditions.warehouseId,
							"beginDate": self.dataPage.filterConditions.beginDate,
							"endDate": self.dataPage.filterConditions.endDate
						}, function() {
							dataPullRefresh.endPullupToRefresh();
						});
					} else {
						dataPullRefresh.endPullupToRefresh(true);
						window.setTimeout(function() {
							dataPullRefresh.disablePullupToRefresh();
						}, 1500);
					}
				}
			}
		});
		
		dataPullRefresh = m('#div_list .public-list').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.pullDownQuery();
				}
			},
			up: {
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				callback: function() {
					var self = this;
					globalVue.pullUpQuery();
				}
			}
		});
		
		
		globalVue.dataPage.filterConditions.beginDate = beginDate;
		globalVue.dataPage.filterConditions.endDate = endDate;
		globalVue.getWarehouseConditions();
		globalVue.getWarnDictData();
		globalVue.doDataListQuery({
			"warehouseId": app.getUser().warehouse.id,
			"pageNo": 1,
			"pageSize": 10,
			"beginDate": globalVue.dataPage.filterConditions.beginDate,
			"endDate": globalVue.dataPage.filterConditions.endDate,
			"warnType": globalVue.dataPage.filterConditions.warnType,
			"status": globalVue.dataPage.filterConditions.status
		});
	});


});
