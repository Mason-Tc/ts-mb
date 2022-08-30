define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");

	var ws = null;
	var swaiting = null;

	m('#div_info').scroll({
		deceleration: 0.006, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});

	m.init();

	m.plusReady(function() {
		var ws = plus.webview.currentWebview();
		globalVue.inventoryReportId = ws.inventoryReportId;
		globalVue.initData();

		var backDefault = m.back;

		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			backDefault();
		}
		m.back = detailBack;
	});

	var globalVue = new Vue({
		el: '#body_inventory_report_detail',
		data: {
			title: '报告详情',
			inventoryReportId: '',
			numTotal: '', // 盘点总数
			checkedNum: '', // 已盘数量
			diffNum: '', // 差异数
			uncheckedNum: '', // 未盘数量
			checkInfo: '',
			checkCode: '',   // 盘点单号
			checkId: '', // 盘点id
			checkSubject: '', // 盘点主题
			accuracy: '', //准确率
			checkDate: '', // 盘点日期
			creatorName: '', //盘点人
			warehouseShortName: '', //仓库简称
			checkNum: '', //盘点总数
			isRight: '', //正常条数(盘点报告用)
			isError: '', //异常条数(盘点报告用)
			detailList: []
		},
		methods: {
			initData: function() {
				var self = this;
				if(window.plus) {
					swaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				var apiUrl = app.api_url + '/api/proCheck/report/detail?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: self.inventoryReportId
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						if(swaiting) {
							swaiting.close();
						}
						if(data) {
							self.title = '报告详情(' + data.checkCode + ')';
							self.checkCode = data.checkCode; // 盘点单号
							self.checkId = data.id; // 盘点id
							var checkInfo = "";
							if(data.checked && data.notChecked) {
								checkInfo = data.checked + "/" + data.notChecked;
							} else if(!data.checked && data.notChecked) {
								checkInfo = data.checked;
							} else if(data.checked && !data.notChecked) {
								checkInfo = data.notChecked;
							}
							self.checkInfo = checkInfo;
							self.checkSubject = data.checkSubject;
							self.accuracy = data.accuracy ? data.accuracy + '%' : '0%';
							self.checkDate = data.checkDate ? data.checkDate : ''; // 盘点日期
							self.creatorName = data.creatorName ? data.creatorName : ''; //盘点人
							self.warehouseShortName = data.warehouseName ? data.warehouseName : ''; //仓库简称
							self.numTotal = data.numTotal; // 盘点总数
							self.checkedNum = data.checkedNum; // 已盘数量
							self.checkNum = data.checkNum ? data.checkNum : '0'; //盘点总数
							self.isRight = data.isRight ? data.isRight : '0'; //正常条数(盘点报告用)
							self.isError = data.isError ? data.isError : '0'; //异常条数(盘点报告用)
							self.detailList = data.mergeList;
							
							if(self.checkedNum !== undefined && self.checkedNum !== null && self.checkedNum !== ''
								&& data.checkNumTotal !== undefined && data.checkNumTotal !== null && data.checkNumTotal !== '') {
								self.diffNum = (data.checkNumTotal > self.checkedNum ? (data.checkNumTotal - self.checkedNum) : (self.checkedNum - data.checkNumTotal));
							}else {
								self.diffNum = 0;
							}
							
							if(self.numTotal !== undefined && self.numTotal !== null && self.numTotal !== ''
								&& self.checkedNum !== undefined && self.checkedNum !== null && self.checkedNum !== '') {
								self.uncheckedNum = (self.numTotal > self.checkedNum ? (self.numTotal - self.checkedNum) : (self.checkedNum - self.numTotal));
							}else {
								self.uncheckedNum = 0;
							}
							
							
							//							m.each(self.dataPage.dataList, function(index, item) {
							//								if(item) {
							//									item.titleInfo = item.checkSubject + "(" + item.checkCode + ")";
							//									item.rigtCount = "正常" + item.isRight + "条";
							//									item.errorCount = "异常" + item.isError + "条";
							//								}
							//							});
						}
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			toInventoryDetail: function(id) {
				var pageId = "inventory-detail";
				var pageUrl = "../../inventory/html/inventory-detail.html";
				
				m.openWindow({
					id: pageId,
					url: pageUrl,
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						"inventoryKey": id
					}
				});
				
				
			},
			toBack: function() {
				m.back();
			}
			
			
		}
	});

	//	function initHeight() {
	//		var windowHeight = $(window).height();
	//		$('body').height(windowHeight);
	//		$('#div_info_list').height(windowHeight - 90);
	//		$('#div_info_list .public-list').height(windowHeight - 100);
	//		$(window).resize(function() {
	//			var windowHeight = $(window).height();
	//			$('body').height(windowHeight);
	//			$('#div_info_list').height(windowHeight - 90);
	//			$('#div_info_list .public-list').height(windowHeight - 100);
	//		});
	//	}
	//	initHeight();
});