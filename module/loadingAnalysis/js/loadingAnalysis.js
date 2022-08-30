define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var echarts = require("echarts");
	var com = require("computer");
	require("jquery");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	require("f2");
	require("light");
	require("moment");
	var fixTable = require("fixed-left-header-table");
	require("../../../js/common/common.js");
	
	require("../../../js/common/bignumber.min.js");

	var ws = null;
	var awaiting = null;

	var beginMonth = moment().subtract(11, 'months').format('YYYY-MM');
	var endMonth = moment().format('YYYY-MM');

	var beginDate = moment().startOf('month').format('YYYY-MM-DD');
	var endDate = moment().endOf('month').format('YYYY-MM-DD');
	var dtPicker1 = new mui.DtPicker({
		"type": "date",
		"value": beginDate
	});
	var dtPicker2 = new mui.DtPicker({
		"type": "date",
		"value": endDate
	});

	//下拉刷新对象
	//	var pullRefresh = null;

	var scrollContent = m('#contentId').scroll({
		deceleration: 0.001 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#warehouseScrollDiv').scroll({
		deceleration: 0.001 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#brandScrollDiv').scroll({
		deceleration: 0.001 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	// 右侧查询框
	var offCanvasQuery = m("#off-canvas").offCanvas();
	
	// var mask = m.createMask(function() {
	// 	if(offCanvasQuery.isShown("right")) {
	// 		offCanvasQuery.close();
	// 		$('#searchVue').hide();
	// 		mask.close();
	// 	}
	// }, 'contentDiv');
	
	var screenHeight = getClientHeight();

	fixTable.setTable1(0, "", false);

	m.init();

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.filterConditions.beginDate = beginDate;
		globalVue.filterConditions.endDate = endDate;
		globalVue.sortColumn = globalVue.sortColumns[1];
		globalVue.getWarehouseList();
		globalVue.getBasicInfo();
		globalVue.globalDoQuery();

		var backDefault = m.back;

		function detailBack() {
			if(awaiting) {
				awaiting.close();
			}
			if(offCanvasQuery.isShown("right")) {
				globalVue.hideOffCanvaQuery();
			} else
				backDefault();
		}
		m.back = detailBack;
	});

	var globalVue = new Vue({
		el: "#off-canvas",
		data: {
			realNumTotalForSummaryStr: '0家', //入库量
			realWeightTotalForSummaryStr: '0吨', //出库量
			numTotal: 0, // 件数总计
			weightTotal: 0, // 重量总计
			enterWeightSort: 'desc', //入库量排序
			outWeightSort: 'desc', //出库量排序
			tpWeightSort: 'desc', //吞吐量排序
			sortColumn: '',
			sortColumns: ["入库量", "出库量", "吞吐量"],
			selectedMtxs: {},
			conditions: {},
			warehouseList: [], // 可选仓库列表
			filterConditions: { // 筛选条件
				warehouseId: '', // 仓库ID串
				warehouse: '', // 仓库名称
				brandIds: '',//品名ID串
				beginDate: '',
				endDate: '',
				carPlateNo: '', // 车牌号
				ladingCode: '' // 提单号
			},
			summaryList: []
		},
		methods: {
			/**
			 * 打开查询框
			 */
			showOffExponentQuery: function() {
				offCanvasQuery.show();
				$('#searchVue').show();
				// mask.show();
			},
			/**
			 * 隐藏查询框
			 */
			hideOffCanvaQuery: function() {
				if(offCanvasQuery.isShown("right")) {
					offCanvasQuery.close();
					// mask.close();
				}
				$('#searchVue').hide();
			},
			pickBeginDate: function() {
				var self = this;
				dtPicker1.show(function(selectItems) {
					self.filterConditions.beginDate = selectItems.value;
					$('.tap-time').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				});
			},
			pickEndDate: function() {
				var self = this;
				dtPicker2.show(function(selectItems) {
					self.filterConditions.endDate = selectItems.value;
					$('.tap-time').each(function() {
						var obj = $(this);
						obj.removeClass('time-selected');
					});
				});
			},
			globalDoQuery: function(ishideCanva) {
				var self = this;
				self.summaryQuery();
				if(ishideCanva)
					self.hideOffCanvaQuery();
			},
			/**
			 * 
			 * @param {Object} $event
			 * @param {Object} status 具体条件(0 当月; 1 近3月; 2 近6月;)
			 */
			selectDate: function($event, status) {
				var self = this;
				var selectedObj = $(event.currentTarget);
				$('.tap-time').each(function() {
					var obj = $(this);
					obj.removeClass('time-selected');
				});
				selectedObj.addClass('time-selected');
				if(status == 0) {
					self.filterConditions.beginDate = moment().startOf('month').format('YYYY-MM-DD');
					self.filterConditions.endDate = moment().endOf('month').format('YYYY-MM-DD');
				} else if(status == 1) {
					self.filterConditions.beginDate = moment().subtract(3, 'months').format('YYYY-MM-DD');
					self.filterConditions.endDate = moment().format('YYYY-MM-DD');
				} else if(status == 2) {
					self.filterConditions.beginDate = moment().subtract(6, 'months').format('YYYY-MM-DD');
					self.filterConditions.endDate = moment().format('YYYY-MM-DD');
				}
				dtPicker1 = new mui.DtPicker({
					"type": "date",
					"value": self.filterConditions.beginDate
				});
				dtPicker2 = new mui.DtPicker({
					"type": "date",
					"value": self.filterConditions.endDate
				});
			},
			/**
			 * 根据查询参数查询
			 * @param {Function} callback
			 */
			summaryQuery: function(callback) {
				debugger
				var self = this;
				if(window.plus) {
					awaiting = plus.nativeUI.showWaiting('数据加载中...');
				}
				
				var apiUrl = app.api_url + '/api/CraneWorkloadApi/list?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						warehouseId: self.filterConditions.warehouseId,
						// brandId: self.filterConditions.brandIds,
						carPlateNo: self.filterConditions.carPlateNo,
						ladingCode: self.filterConditions.ladingCode,
						workloadStart: self.filterConditions.beginDate,
						workloadEnd: self.filterConditions.endDate
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						debugger
						if(awaiting) {
							awaiting.close();
						}
						//						alert(JSON.stringify(data));
						if(data) {
							self.summaryList = data;
							self.realNumTotalForSummaryStr = data.totalEnterWeight ? (data.totalEnterWeight + '吨') : '0吨';
							self.realWeightTotalForSummaryStr = data.totalOutputWeight ? (data.totalOutputWeight + '吨') : '0吨';
							
							
							
							if(self.summaryList != null && self.summaryList.length > 0) {
								self.numTotal = 0;
								self.weightTotal = 0;
								var tmpResult = new BigNumber(0);
								m.each(self.summaryList, function(index, item) {
									if(item) {
										var idx = index + 1;
										var materialDesc = item.brandName + " " + item.placeSteelName;
										item.materialDescShow = materialDesc;
										item.materialDescShowAbb = buildAbbreviation(materialDesc, 7, 4, 4);
										
										self.numTotal += item.num;
										
										var itemWeight = new BigNumber(item.weight);
										tmpResult = tmpResult.plus(itemWeight);
										// self.weightTotal += item.weight;
										
									}
								});
								self.weightTotal = tmpResult.toNumber();
								
							}
						}
						if(typeof callback === "function") {
							callback();
						}
						
						scrollContent.scrollTo(0, 0, 100); //100毫秒滚动到顶
						
						
					},
					error: function(xhr, type, errorThrown) {
						if(awaiting) {
							awaiting.close();
						}
						if(typeof callback === "function") {
							callback();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			getWarehouseList: function() {
				var self = this;
				var apiUrl = app.api_url + '/api/sysBusinessBasis/warehouseInfos1?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					dataType: 'json', //服务器返回json格式数据
					type: 'GET', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					async: false,
					success: function(data) {
						self.warehouseList = data;
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			},
			getBasicInfo: function() {
				var self = this;
				m.getJSON(app.api_url + '/api/sysBusinessBasis/materialConditions?_t=' + new Date().getTime(), function(data) {
					// debugger
					self.conditions = data;
				});
			},
			searchIvntDetail: function(evt, curId) {
				var self = this;
				var selectedObj;
				if(evt != null) {
					selectedObj = $(evt.currentTarget);
					var cpsId = selectedObj.attr("class").substring(0, selectedObj.attr("class").indexOf(" ")) + selectedObj.attr("mtxId");
				} else {
					selectedObj = $(null);
				}
				var warehouseIds = [];
				var brandIds = [];
				if(selectedObj.hasClass("warehouseA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
					} else {
						selectedObj.addClass('selectedTD');
					}
				} else if(selectedObj.hasClass("brandA")) {
					if(selectedObj.hasClass('selectedTD')) {
						selectedObj.removeClass('selectedTD');
					} else {
						selectedObj.addClass('selectedTD');
					}
				} else {}
				$('.selectedTD').each(function() {
					var obj = $(this);
					if(obj.hasClass("warehouseA")) {
						warehouseIds.push(obj.attr('mtxId'));
					} else if(obj.hasClass("brandA")) {
						brandIds.push(obj.attr('mtxId'));
					}
				});
				self.filterConditions.warehouseId = warehouseIds ? warehouseIds.join(',') : '';
				self.filterConditions.brandIds = brandIds ? brandIds.join(',') : '';
				console.log('warehouseIds=' + self.filterConditions.warehouseId + 'brandIds=' + self.filterConditions.brandIds);
			},
			resetFilter: function() {
				var self = this;
				self.filterConditions.warehouseId = '';
				self.filterConditions.warehouse = '';
				self.filterConditions.brandIds = '';
				$('.tap-time').each(function() {
					var obj = $(this);
					obj.removeClass('time-selected');
				});
				$('#td_curr_day').addClass('time-selected');
				self.filterConditions.beginDate = beginDate;
				self.filterConditions.endDate = endDate;
				self.selectedMtxs = {};
				$('.selectedTD').each(function() {
					var obj = $(this);
					obj.removeClass('selectedTD');
				});
				
				$('#carPlateNoId').val(''); // 车牌号
				$('#ladingCodeId').val(''); // 提单号
				
				self.filterConditions.carPlateNo = '';
				self.filterConditions.ladingCode = '';
				
				
				
				
				
			},
			complete: function() {
				var self = this;
				self.globalDoQuery(true);
			},
			onCloseClick: function() {
				m.back();
			},
			doEnterWeightSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.enterWeight < y.enterWeight) {
						return -1;
					} else if(x.enterWeight > y.enterWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.enterWeight < y.enterWeight) {
						return 1;
					} else if(x.enterWeight > y.enterWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[0];
				if(self.enterWeightSort === 'desc') {
					self.enterWeightSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.enterWeightSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			},
			doOutputWeightSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.outputWeight < y.outputWeight) {
						return -1;
					} else if(x.outputWeight > y.outputWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.outputWeight < y.outputWeight) {
						return 1;
					} else if(x.outputWeight > y.outputWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[1];
				if(self.outWeightSort === 'desc') {
					self.outWeightSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.outWeightSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			},
			doSpotGoodsTpWeightSort: function($event) {
				var self = this;
				event.stopPropagation();
				if(self.summaryList == null || self.summaryList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.throughputWeight < y.throughputWeight) {
						return -1;
					} else if(x.throughputWeight > y.throughputWeight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.throughputWeight < y.throughputWeight) {
						return 1;
					} else if(x.throughputWeight > y.throughputWeight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[2];
				if(self.tpWeightSort === 'desc') {
					self.tpWeightSort = 'asc';
					self.summaryList = self.summaryList.sort(asc);
				} else {
					self.tpWeightSort = 'desc';
					self.summaryList = self.summaryList.sort(desc);
				}
				swaiting.close();
			}
		}
	});

	function getClientHeight() {
		var clientHeight = 0;
		if(document.body.clientHeight && document.documentElement.clientHeight) {
			var clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
		} else {
			var clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
		}
		return clientHeight;
	}

});

















