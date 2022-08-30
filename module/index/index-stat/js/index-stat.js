define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var VueUI = require("vue3");
	require("jquery");
	require("moment");
	require("../../../../js/common/common.js");
	var $ = require("zepto");
	var indexStatVue = new Vue({
		el: '#index-stat',
		data: {
			//			cameraAuth: true,
			//			exponentAuth: true,
			//			whsOnlineAuth: true,
			//			whsEnterAuth: true,
			//			whsOutAuth: true,
			//			inventoryAuth: true,
			//			stockQueryAuth: true,
			//			putInAnalysisAuth: true,
			//			outPutAnalysisAuth: true,
			//			customerAnalysisAuth: true,
			//			settlementAnalysisAuth: true,
			//			inventoryReportAuth: true,
			//			materialQueryAuth: true,
			//			moveRegisterAuth: true,
			//			throughputAnalysisAuth: true,
			//			materialInventoryAnalysisAuth: true,
			//			queueRegisterAuth: true,
			//			todoAuth: true,
			//			printAuth: true,
			//			tagDiscernAuth: true,
			cameraAuth: false,
			exponentAuth: false,
			whsOnlineAuth: false,
			whsEnterAuth: false,
			whsOutAuth: false,
			inventoryAuth: false,
			stockQueryAuth: false,
			putInAnalysisAuth: false,
			outPutAnalysisAuth: false,
			customerAnalysisAuth: false,
			settlementAnalysisAuth: false,
			inventoryReportAuth: false,
			materialQueryAuth: false,
			moveRegisterAuth: false,
			throughputAnalysisAuth: false,
			materialInventoryAnalysisAuth: false,
			loadingAnalysisAuth: false,
			queueRegisterAuth: false,
			todoAuth: false,
			printAuth: false,
			tagDiscernAuth: false,
			craneManageAuth: false,
			appVersion: '', //当前版本号
			showConfirm: false,
			isShowInformation: false,
			informationInfo: {},
			ioNewsflashList: [],
			inoutputReportsList: [],
			currenScrollIndex: 0
		},
		methods: {
			checkUpdate: function() {
				var self = this;
				// plus.runtime.getProperty(plus.runtime.appid, function(info) {
				// 	self.appVersion = info.version;
				// });
				wgtInfo = app.getWgt();
				console.log(JSON.stringify(wgtInfo))
				plus.runtime.getProperty(plus.runtime.appid, function(info) {
					self.appVersion = info.version;
					var plateformType = m.os.plus ? m.os.android ? "0" : m.os.iphone ? "1" : "" : "";
					if (wgtInfo.version > self.appVersion && wgtInfo.wgtPath && !self.showConfirm) {

					} else if (!self.showConfirm) {
						m.ajax(app.api_url + "/api/sys/checkOnlineUpdate?_t=" + new Date().getTime(), {
							data: {
								version: self.appVersion,
								plateformType: plateformType
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 10000, //超时时间设置为10秒；
							success: function(data) {
								if(app.debug)
									console.log(JSON.stringify(data));
								if (data.isUpdate && data.updateType == 2) {
									plus.downloader.createDownload(data.downloadUrl, {
										filename: "_doc/update/"
									}, function(d, status) {
										if (status == 200) {
											app.setWgt({
												wgtPath: d.filename,
												version: data.version,
												msg: data.msg
											});
											self.showConfirm = false;
										} else {}
									}).start();
								}
							},
							error: function(xhr, type, errorThrown) {
								m.toast("网络异常，请重新试试");
							}
						});
					}
				});
			},
			getInformationInfo: function() {
				var self = this;
				m.ajax(app.api_url + '/api/proNotice/list', {
					data: {
						"pageNo": 1,
						"pageSize": 1,
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒
					success: function(data) {
						//						if(app.debug) {
						//							console.log("getInformationInfo:" + JSON.stringify(data));
						//						}
						var totalListCount = data.count;
						var infoList = data.list;
						if (totalListCount > 0) {
							self.isShowInformation = true;
							self.informationInfo = infoList[0];
							var titleStr = '';
							if (isNotBlank(self.informationInfo.title)) {
								if (self.informationInfo.title.length > 21) {
									titleStr = self.informationInfo.title.substring(0, 21) + '...';
								} else {
									titleStr = self.informationInfo.title;
								}
							}
							self.informationInfo.titleStr = titleStr;
							self.informationInfo.showDateStr = moment(self.informationInfo.createDate).format('YYYY-MM-DD');
						} else {
							self.isShowInformation = false;
						}
					},
					error: function(xhr, type, errorThrown) {
						self.isShowInformation = false;
					}
				});
			},
			/**
			 * 打开在线监控
			 */
			openCameraList: function() {
				/*m.alert("功能正在建设中...", function() {
//						toLogin();
					}, "提示", "功能正在建设中...");*/
				//				m.toast("功能正在建设中...");
				m.openWindow({
					id: 'cameraList',
					url: '../../../camera/html/cameraList_back.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						'isShow': true,
						'backIconShow': true
					}
				});

				//				m.openWindow({
				//					id: 'read-qrcode',
				//					url: '../../../barcode/html/read-qrcode.html',
				//					show: {
				//						aniShow: 'pop-in'
				//					},
				//					waiting: {
				//						autoShow: true
				//					},
				//					extras: {
				//						'isShow':true,
				//						'backIconShow': true
				//					}
				//				});
			},
			openTestPage: function() {
							m.openWindow({
								id: 'testPage',
								url: '../../../test/html/test2.html',
								show: {
									aniShow: 'pop-in'
								},
								waiting: {
									autoShow: true
								},
								extras: {
									'isShow': true,
									'backIconShow': true
								}
							});
			
			},

			openCustomerExponent: function() {
				m.openWindow({
					id: 'customer-exponent',
					"url": '../../../exponent-report/html/exponent-report-new.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						//自定义扩展参数，可以用来处理页面间传值
						'indexStatParam': {
							'warehouseId': null,
							'methods': 'openWarehouseOnline'
						}
					}
				});
			},

			openWarehouseOnline: function() {
				m.openWindow({
					id: 'warehouse-online',
					"url": '../../../warehouse-online-report/html/warehouse-online.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						//自定义扩展参数，可以用来处理页面间传值
						//'custId': custId,
						//'custName': custName
					}
				});
			},

			openWarehouseEntering: function() {
				m.openWindow({
					id: 'warehouse-entering',
					"url": '../../../warehouse-entering-management/html/warehouse-entering-management.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						//自定义扩展参数，可以用来处理页面间传值
						//'custId': custId,
						//'custName': custName
					}
				});
			},

			openWarehouseOuting: function() {
				m.openWindow({
					id: 'warehouse-outing',
					"url": '../../../warehouse-outing-management/html/warehouse-outing-management.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						//自定义扩展参数，可以用来处理页面间传值
						//'custId': custId,
						//'custName': custName
					}
				});
			},

			extrasOpenCustomerExponent: function($event, warehouseInfo, gotoIndex) {
				m.openWindow({
					id: 'customer-exponent',
					"url": '../../../exponent-report/html/exponent-report-new.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						//自定义扩展参数，可以用来处理页面间传值
						'indexStatParam': {
							'warehouseId': warehouseInfo.id,
							'warehouseShortName': warehouseInfo.warehouseShortName,
							'gotoIndex': gotoIndex,
							'methods': 'extrasOpenCustomerExponent'
						}
					}
				});
			},
			openInventory: function() {
				m.openWindow({
					id: 'inventory-list',
					"url": '../../../inventory/html/inventory-list.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openStockQuery: function() {
				m.openWindow({
					id: 'stock-query',
					"url": '../../../stock-query/html/stock-query.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openPutInAnalysis: function() {
				m.openWindow({
					id: 'put-in-analysis',
					"url": '../../../put-in-analysis/html/put-in-analysis.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openOutPutAnalysis: function() {
				m.openWindow({
					id: 'out-put-analysis',
					"url": '../../../out-put-analysis/html/out-put-analysis.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openCustomerAnalysis: function() {
				m.openWindow({
					id: 'customer-analysis',
					"url": '../../../customer-analysis/html/customer-analysis.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openSettlementAnalysis: function() {
				m.openWindow({
					id: 'settlement-analysis',
					"url": '../../../settlement-analysis/html/settlement-analysis.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openInventoryReport: function() {
				m.openWindow({
					id: 'inventory-report',
					"url": '../../../inventory-report/html/inventory-report.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openMaterialQuery: function() {
				m.openWindow({
					id: 'material-query',
					"url": '../../../material-query/html/material-query.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openMoveRegister: function() {
				m.openWindow({
					id: 'move-register',
					"url": '../../../move-register/html/move-register-list.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openThroughputAnalysis: function() {
				m.openWindow({
					id: 'throughput-analysis',
					"url": '../../../throughput-analysis/html/throughput-analysis.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openMaterialInventoryAnalysis: function() {
				m.openWindow({
					id: 'material-inventory-analysis',
					"url": '../../../material-inventory-analysis/html/material-inventory-analysis.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openLoadingAnalysis: function() {
				m.openWindow({
					id: 'loading-analysis',
					"url": '../../../loadingAnalysis/html/loadingAnalysis.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openQueueRegister: function() {
				m.openWindow({
					id: 'queue-register-list',
					"url": '../../../queue-register/html/queue-register-list.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openTodo: function() {
				m.openWindow({
					id: 'todo-list',
					"url": '../../../todo/html/todo-list.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openPrintLabel: function() {
				m.openWindow({
					id: 'print-label-list',
					"url": '../../../print-label/html/print-label-list.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openTagDiscern: function() {
				m.openWindow({
					id: 'tag-discern-list',
					"url": '../../../tag-discern/html/tag-discern-list.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openInformation: function() {
				m.openWindow({
					id: 'information-list',
					"url": '../../../information/html/information-list.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			openCraneManage: function() {
				m.openWindow({
					id: 'openCraneManage',
					"url": '../../../crane-index/html/crane-index.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			}
		}
	});
	
	m.plusReady(function() {
		if (indexStatVue.showConfirm == false) {
			setTimeout(function() {
				indexStatVue.checkUpdate();
			}, 5000);
		}
		
		indexStatVue.cameraAuth = app.getUser().isPrivilege('camera:sysUserCamera:api:list') ;
		indexStatVue.exponentAuth = app.getUser().isPrivilege('exponent:report:api') ;
		indexStatVue.whsOnlineAuth = app.getUser().isPrivilege('warehouse:online:api') ;
		indexStatVue.whsEnterAuth = app.getUser().isPrivilege('warehouse:entering:management:api') ;
		indexStatVue.whsOutAuth = app.getUser().isPrivilege('warehouse:outing:management:api') ;
		indexStatVue.inventoryAuth = app.getUser().isPrivilege('inventory:api') ;
		indexStatVue.stockQueryAuth = app.getUser().isPrivilege('stock:query:api') ;
		indexStatVue.putInAnalysisAuth = app.getUser().isPrivilege('put:in:analysis:api') ;
		indexStatVue.outPutAnalysisAuth = app.getUser().isPrivilege('out:put:analysis:api') ;
		indexStatVue.customerAnalysisAuth = app.getUser().isPrivilege('customer:analysis:api') ;
		indexStatVue.settlementAnalysisAuth = app.getUser().isPrivilege('settlement:analysis:api') ;
		indexStatVue.inventoryReportAuth = app.getUser().isPrivilege('inventory:report:api') ;
		indexStatVue.materialQueryAuth = app.getUser().isPrivilege('material:query:api') ;
		indexStatVue.moveRegisterAuth = app.getUser().isPrivilege('move:register:api') ;
		indexStatVue.throughputAnalysisAuth = app.getUser().isPrivilege('throughput:analysis:api') ;
		indexStatVue.materialInventoryAnalysisAuth = app.getUser().isPrivilege('material:inventory:analysis:api') ;
		indexStatVue.queueRegisterAuth = app.getUser().isPrivilege('queue:register:api') ;
		indexStatVue.todoAuth = app.getUser().isPrivilege('to:do:api') ;
		indexStatVue.printAuth = app.getUser().isPrivilege('print:label:api') ;
		indexStatVue.tagDiscernAuth = app.getUser().isPrivilege('tag:discern:api') ;
		indexStatVue.craneManageAuth = app.getUser().isPrivilege('crane:index:api') ;
		indexStatVue.loadingAnalysisAuth = app.getUser().isPrivilege('loading:analysis:api') ;
	});
	
	document.addEventListener("plusready", onPlusReady, false);
	
	function onPlusReady() {
		document.addEventListener("resume", onAppReume, false);
	}
	
	function onAppReume() {
		if (indexStatVue.showConfirm == false) {
			setTimeout(function() {
				indexStatVue.checkUpdate();
			}, 5000);
		}
	}

	function initList() {
		m.getJSON(app.api_url + '/api/homepage/ioNewsflash?_t=' + new Date().getTime(), function(data) {
			indexStatVue.ioNewsflashList = data;
		});
		m.getJSON(app.api_url + '/api/homepage/inoutputReports?_t=' + new Date().getTime(), function(data) {
			var dataArr = [],
				subArr = [];
			if (data != null) {
				var j = 0;
				var imgIdx = 0;
				for (var i = 0; i < data.length; i++) {
					j = i + 1;
					if (imgIdx == 6) {
						imgIdx = 1;
					} else {
						imgIdx++;
					}
					data[i].imgSrc = "../images/cangchu_bg_0" + imgIdx + ".jpg";
					if (j % 2 == 0) {
						subArr.push(data[i]);
						dataArr.push(subArr);
						subArr = new Array();
					} else if (j == data.length) {
						subArr.push(data[i]);
						subArr.push({
							imgSrc: '../images/cangchu_bg_02.jpg',
							warehouseShortName: '-',
							inventoryWeight: '-',
							ioWeight: '-'
						})
						dataArr.push(subArr);
						subArr = new Array();
					} else {
						subArr.push(data[i]);
					}
				}
			}
			indexStatVue.inoutputReportsList = dataArr;
			//仓库列表滚动栏脚本
			warehouseScrollBarScript();
			if (typeof timerID == 'undefined') {
				$.fn.extend({
					Scroll: function(opt, callback) {
						//参数初始化
						if (!opt) var opt = {};
						var _this = this.eq(0).find("ul:first");
						var lineH = _this.find("li:first").height(), //获取行高
							line = opt.line ? parseInt(opt.line, 10) : parseInt(this.height() / lineH, 10), //每次滚动的行数，默认为一屏，即父容器高度
							speed = opt.speed ? parseInt(opt.speed, 10) : 500, //卷动速度，数值越大，速度越慢（毫秒）
							timer = opt.timer ? parseInt(opt.timer, 10) : 3000; //滚动的时间间隔（毫秒）
						if (lineH == 0) lineH = 25;
						if (line == 0) line = 1;
						var upHeight = line * lineH;
						//滚动函数
						scrollUp = function() {
							_this.animate({
								marginTop: upHeight
							}, speed, function() {
								for (i = 1; i <= line; i++) {
									_this.find("li:last").prependTo(_this);
								}
								_this.css({
									marginTop: 0
								});
							});
						}
						timerID = setInterval("scrollUp()", timer);
						_this.on("touchstart", function() {
							clearInterval(timerID);
							timerID = 0;
						});
						_this.on("touchend", function() {
							if (timerID == 0) {
								timerID = setInterval("scrollUp()", timer);
							}
						});
						//鼠标事件绑定
						/*_this.hover(function() {
							console.log(2222222222222222)
							clearInterval(timerID);
						}, function() {
							console.log(1111111111111111)
							timerID = setInterval("scrollUp()", timer);
						}).mouseout();*/
					}
				});
				$("#s2").Scroll({
					line: 1,
					speed: 100,
					timer: 3000
				});
			}
		});

	}
	(function initData() {
		initList();
		//		indexStatVue.getInformationInfo();
		//		setInterval(function() {
		//			console.log("refresh notice: " + moment().format('YYYY-MM-DD HH:mm:ss'));
		//			indexStatVue.getInformationInfo();
		//		}, 900000);
	})();

	document.addEventListener("refreshList", function(e) {
		initList();
	}, false);
	document.querySelector('#warehouse-details').addEventListener('slide', function(event) {
		//注意slideNumber是从0开始的；
		indexStatVue.currenScrollIndex = event.detail.slideNumber;
	});

	function warehouseScrollBarScript() { // 仓库列表滚动栏脚本
		var itemIndex = 0;
		var left_timer = null;
		var right_timer = null;
		var gallery = mui('#warehouse-details');
		if (!indexStatVue.inoutputReportsList) {
			$("#warehouse-details .c_btn_css").css({
				display: 'none'
			});
			return;
		} else {
			$("#warehouse-details .c_btn_css").css({
				display: 'block'
			});
		}
		gallery.on("tap", ".right-btn", function() {
			clearTimeout(right_timer);
			right_timer = setTimeout(function() {
				itemIndex = gallery.slider().getSlideNumber();
				if (itemIndex >= indexStatVue.inoutputReportsList.length - 1) {
					itemIndex = indexStatVue.inoutputReportsList.length - 1;
				} else {
					itemIndex++;
				}
				indexStatVue.currenScrollIndex = itemIndex;
				gallery.slider().gotoItem(itemIndex);
			}, 50);
		});
		gallery.on("tap", ".left-btn", function() {
			clearTimeout(left_timer);
			left_timer = setTimeout(function() {
				itemIndex = gallery.slider().getSlideNumber();
				if (itemIndex <= 0) {
					itemIndex = 0;
				} else {
					itemIndex--;
				}
				indexStatVue.currenScrollIndex = itemIndex;
				gallery.slider().gotoItem(itemIndex);
			}, 50);
		});
	}

});
