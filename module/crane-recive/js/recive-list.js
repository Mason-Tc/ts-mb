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
	var $ = require("zepto");
	require("../../../js/common/common.js");
	// require("mui-picker");
	// require("mui-poppicker");

	m.init();

	m.plusReady(function() {
		var swaiting = null;
		var twaiting = null;
		var dataPullRefresh = null;
		var layer = null;
		var slider = m("#slider").slider();
		var beginDate = moment().subtract(3, 'day').format('YYYY-MM-DD 00:00');
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
		m('#warehouseScrollDiv').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		
		
		slider.setStopped(true); //禁止滑动
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		
		var layerIndex;
		var relSubPlaceLayerIndex;
		
		var picker = new mui.PopPicker();
		
		var globalVue = new Vue({
			el: '#off-canvas',
			data: {
				conditions: {},
				selectedMtxs: {},
				warehouseList: [],
				dataPage: {
					dataList: [],
					detailData:{},
					placeSubList: [], // 全部库位数据
					relPlaceSubList: [], // 关联库位数据
					realNum:[],
					pageSize: 10,
					pageNo: 1, //当前页数
					totalPage: 0, //总页数
					totalListCount: 0, //总条数
					filterConditions: { // 筛选条件
						"dispatchCode": "", //单据号
						"warehouseId": app.getUser().warehouse.id, //仓库ID
						"beginDate": "", //开始时间
						"endDate": "" //结束时间
					}
				}
			},
			methods: {
				toDetail:function(listItem){
					// globalVue.dataPage.detailData=listItem;
					// layerIndex=layer.open({
					// 	type:1,
					// 	title:'收货单',
					// 	area:['800px','400px'],
					// 	content:$("#dialogDiv")
					// })
					 m.ajax(app.api_url + '/api/proReceiving/bargeReceiveForm?_t=' + new Date().getTime(), {
						data: {id:listItem.id},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒； 
						success: function(res) {
							// debugger
							if(res.msg.length>0){
								m.toast(res.msg);
							}else{
								globalVue.dataPage.detailData=res.proReceiving;
								
								m.openWindow({
									id: 'recive-detail',
									"url": '../html/recive-detailR.html',
									show: {
										aniShow: 'pop-in'
									},
									waiting: {
										autoShow: true
									},
									extras: {
										reciveDetail: res.proReceiving, 
										warehouseId: globalVue.dataPage.filterConditions.warehouseId
									}
								});
								
								// layerIndex=layer.open({
								// 	type:1,
								// 	// shade: 0.3,
								// 	title:false,
								// 	// shadeClose: true,
								// 	closeBtn: 0,
								// 	area:['100%','100%'],
								// 	content:$("#dialogDiv"),
								// 	btn: ['取 消','确 定'],
								// 	// 取消按钮
								// 	btn1:function(index, layero) {
								// 		globalVue.cancelRecive();
								// 	},
								// 	// 确定按钮
								// 	btn2: function(index) {
								// 		globalVue.saveRecive();
								// 		return false;
								// 	}
									
								// })
							}
						
						}
					}) 
				},
				cancelRecive:function(){
					// debugger
					layer.close(layerIndex);
					layerIndex = undefined;
					event.stopPropagation();
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
					params["id"]=globalVue.dataPage.detailData.id;
					params["bargeId"]=globalVue.dataPage.detailData.bargeId;
					for(var i=0;i<detailList.length;i++){
						params['detailList[' + i +'].realNum'] = detailList[i].realNum;
						params['detailList[' + i +'].id'] = detailList[i].id;
						params['detailList[' + i +'].subPlaceId'] = detailList[i].subPlaceId;
					}
					
					m.ajax(app.api_url + '/api/proReceiving/saveNum?_t=' + new Date().getTime(), {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒； 
						success: function(res) {
							// debugger
							if(res.msg.length>0){
								m.toast(res.msg);
							}else{
								self.doDataListQuery({
									"pageNo": 1,
									"pageSize": 10,
									"dispatchCode": self.dataPage.filterConditions.dispatchCode,
									"warehouseId": self.dataPage.filterConditions.warehouseId,
									"receivingStart": self.dataPage.filterConditions.beginDate,
									"receivingEnd": self.dataPage.filterConditions.endDate
								}, function() {
									layer.close(layerIndex);
									m.toast("操作成功");
								});
							}
						}
					})
					
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
				selectSub:function(item){
					// debugger
					picker.show(function (selectItems) {
						item.subPlaceName=selectItems[0].text;
						item.subPlaceId=selectItems[0].id;
					})
				},
				getPlaceSubList: function() { // 全部库位
					var self = this;
					var relPath = '/api/sysBusinessBasis/subPlaceInfos?warehouseId=' + 
					self.dataPage.filterConditions.warehouseId;
					
					m.getJSON(app.api_url + relPath, function(data) {
						// debugger
						self.dataPage.placeSubList = data;
						picker.setData(data);
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
					  area: ['220px', '330px'],
					  content: $("#relSubPlace")
					});
					
					
				},
				relSubPlaceSelect: function(id) {
					globalVue.dataPage.detailData.detailList[globalVue.dataPage.detailData.curSubPlaceIndex].subPlaceId = id;
					layer.close(relSubPlaceLayerIndex);
				},
				complete: function() {
					var self = this;
					self.doDataListQuery({
						"pageNo": 1,
						"pageSize": 10,
						"dispatchCode": self.dataPage.filterConditions.dispatchCode,
						"warehouseId": self.dataPage.filterConditions.warehouseId,
						"receivingStart": self.dataPage.filterConditions.beginDate,
						"receivingEnd": self.dataPage.filterConditions.endDate
					}, function() {
						dataPullRefresh.scrollTo(0, 0, 0);
					});
				},
				doDataListQuery: function(params, callback) {
					var self = this;
					if(window.plus) {
						swaiting = plus.nativeUI.showWaiting('处理中...');
					}
					m.ajax(app.api_url + '/api/proReceiving/bargeReceiveList?_t=' + new Date().getTime(), {
						data: params,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒； 
						success: function(res) {
							if(swaiting) {
								swaiting.close();
							}
							if(app.debug) {
								console.log("doDataListQuery:" + JSON.stringify(res));
							}
							self.dataPage.pageNo = res.pageNo;
							self.dataPage.pageSize = res.pageSize;
							self.dataPage.totalListCount = res.count;
							self.dataPage.totalPage = res.totalPage;
							if(self.dataPage.pageNo == 1) {
								self.dataPage.dataList = res.list;
							} else {
								self.dataPage.dataList = self.dataPage.dataList.concat(res.list);
							}
							if(typeof callback === "function") {
								callback();
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
				
				/**
				下拉查询
				*/
				pullDownQuery: function() {
					var self = this;
					self.dataPage.pageNo = 1;
					//						self.dataPage.pageSize = 10;
					self.doDataListQuery({
						"pageNo": self.dataPage.pageNo,
						"auditCode": self.dataPage.filterConditions.auditCode,
						"warehouseIds": self.dataPage.filterConditions.warehouseId,
						"receivingStart": self.dataPage.filterConditions.beginDate,
						"receivingEnd": self.dataPage.filterConditions.endDate
					}, function() {
						m.toast("加载成功!");
						dataPullRefresh.endPulldownToRefresh();
						dataPullRefresh.scrollTo(0, 0, 0);
						if(self.dataPage.totalPage > 1) {
							dataPullRefresh.refresh(true);
						}
					});
				},
				/**
				 * 上拉查询
				 */
				pullUpQuery: function() {
					var self = this;
					if(self.dataPage.pageNo < self.dataPage.totalPage) {
						self.dataPage.pageNo++;
						self.doDataListQuery({
							"pageNo": self.dataPage.pageNo,
							"auditCode": self.dataPage.filterConditions.auditCode,
							"warehouseIds": self.dataPage.filterConditions.warehouseId,
							"receivingStart": self.dataPage.filterConditions.beginDate,
							"receivingEnd": self.dataPage.filterConditions.endDate
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
		globalVue.doDataListQuery({
			"warehouseId": app.getUser().warehouse.id,
			"pageNo": 1,
			"pageSize": 10,
			"receivingStart": globalVue.dataPage.filterConditions.beginDate,
			"receivingEnd": globalVue.dataPage.filterConditions.endDate
		});
		globalVue.getPlaceSubList(); // 获取全部库位
		
		document.addEventListener("popup", function(e) {
			// debugger
			var message = e.detail.msg;
			globalVue.complete(); // 查询
			if(message !== undefined && message !== null && message !== '') {
				// m.toast(message);
				layer.alert(message);
			}
			
		}, false);
		
		
		// var old_back = m.back;
		// m.back = function() {
		// 	// debugger
		// 	if(layerIndex === undefined) {
		// 		old_back();
		// 	}else {
		// 		globalVue.cancelRecive();
		// 	}
		// };
		
	});

	// document.addEventListener("refreshDataList", function(e) {
	// 	globalVue.doDataListQuery({
	// 		"pageNo": 1,
	// 		"pageSize": 10,
	// 		"businessType": globalVue.dataPage.filterConditions.businessType,
	// 		"auditCode": globalVue.dataPage.filterConditions.auditCode,
	// 		"warehouseIds": globalVue.dataPage.filterConditions.warehouseId,
	// 		"beginDate": globalVue.dataPage.filterConditions.beginDate,
	// 		"endDate": globalVue.dataPage.filterConditions.endDate
	// 	}, function() {
	// 		dataPullRefresh.scrollTo(0, 0, 0);
	// 		dataPullRefresh.refresh(true);
	// 	});
	// }, false);
});