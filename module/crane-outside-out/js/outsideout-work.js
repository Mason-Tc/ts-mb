define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("zepto");
	require("mui-picker");
	require("mui-poppicker");
	
	m.init();
	require("layui");
	var layer;
	layui.use(['layer'], function() {
		layer  = layui.layer;
	});
	var picker = new mui.PopPicker();
	
	var backDefault;
	var swaiting = null;
	var ws=null;
	m.plusReady(function() {
		// debugger
		ws = plus.webview.currentWebview();
		
		aboutVue.getData(ws.taskId, '0');
		
		// aboutVue.proReceiving=ws.taskId;
		// aboutVue.detailList=aboutVue.proReceiving.detailList;
		
		// aboutVue.getWarehouseConditions();
		
		// 重写返回功能
		backDefault = m.back;
		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			// 取消作业
			aboutVue.cancelOutsideReceiving();
			// 刷新列表
			let target = plus.webview.getWebviewById('outsideout-list');
			target.reload(true);
			
			backDefault();
		}
		m.back = detailBack;
	})
	
	var aboutVue = new Vue({
		el: '#off-canvas',
		data: { 
			proReceiving:{},
			warehouseList:[],
			detailList:[]
		},
		methods:{
			// 出库作业完成确认
			sendConfirmComplete:function(submitFlag){
				// debugger
				var content = "是否确认提交?";
				var isAllWeight = true;
				
				if(submitFlag === 1) { // 提交过磅
					var loadedArr = new Array();
					var unloadedArr = new Array();
					
					for (var i = 0; i < aboutVue.detailList.length; i++) {
						var item = aboutVue.detailList[i];
						
						if(item.isLoading === '1') { // 已装
							if(item.isWeight === "0") { // 未过磅
								loadedArr.push(item);
							}
							
						}else { // 未装
							unloadedArr.push(item);
							if(item.isWeight === "0") {
								isAllWeight = false;
							}
						}
						
					}
					
					if(loadedArr.length === 0) {
						layer.msg("无已装物料");
						return;
					}else {
						var lastMaterialDesc = loadedArr[0].materialDesc;
						for (var i = 0; i < unloadedArr.length; i++) {
							var loadedItem = unloadedArr[i];
							if(loadedItem.materialDesc === lastMaterialDesc) {
								layer.msg("同一个规格需一次同时标注为已装，并一次过磅");
								return;
							}
							
						}
					}
					
					if(isAllWeight) {
						var tmpIndex = layer.open({
								skin: 'popOne',
								title: '提示',
								area:['400px','160px'],
								content: '提交后物料已全部过磅，是否确认全部完成？',
								btn:['取消','否','是'],
								yes:function(index,layero){
									layer.close(tmpIndex);
								},
								btn2:function(index,layero){
									aboutVue.handleSubmit(aboutVue.proReceiving.taskId, 1);
									
								},
								btn3:function(index,layero){
									aboutVue.handleSubmit(aboutVue.proReceiving.taskId, 2);
								}
							});
							
							return;
					}
					
					
				}else if(submitFlag === 2) { // 确认全部完成
					// debugger
					
					for (var i = 0; i < aboutVue.detailList.length; i++) {
						var item = aboutVue.detailList[i];
						
						if(item.isLoading === '0') { // 如有未装
							content = "有未装物料明细，是否确认提交！";
							break;
							// layer.msg("有未装物料明细，是否确认提交！");
							// return;
						}
						
						outputNum = $('#realNumInput' + item.detailIds).val(); // 实提数量
						if(outputNum !== (item.sendNum + '')) {
							content = "应发与装卸件数不一致，请确认是否提交，提交后无法撤回！";
							break;
							// layer.msg("应发与装卸件数不一致，请确认是否提交，提交后无法撤回！");
							// return;
						}
						
					}
					

				
				}
				
				let contentHtml = '<div style="height:10px;margin:10px 50px;line-height:30px;'+
				'text-align:center;font-size:16px;">' + content + '</div>';
					layer.open({
						skin: 'popTwo',
						type: 1,
						shade: 0.3,
						title: "提示",
						area:['400px','160px'],
						content: contentHtml,
						btn: ['取 消','确 定'],
						cancel: function(index) {
							return true;
						},
						// 取消按钮
						btn1:function(index, layero){
							layer.close(index);
						},
						// 确定按钮
						btn2: function(index) {
							swaiting = plus.nativeUI.showWaiting('处理中...');
							
							
							m.ajax(app.api_url + '/api/rowcar/submitOutsideWeight?_t=' + new Date().getTime(), {
								data:{
									taskId:aboutVue.proReceiving.taskId,
									submitFlag: submitFlag
								},
								dataType: 'json', //服务器返回json格式数据
								type: 'post', //HTTP请求类型
								timeout: 10000, //超时时间设置为60秒
								success: function(res) {
									if(swaiting) {
										swaiting.close();
									}
									layer.msg(res.msg);
									if(res.status){
										// 刷新列表
										let target = plus.webview.getWebviewById('outsideout-list');
										target.reload(true);
										backDefault();
									}
								},
								error: function(xhr, type, errorThrown) {
									if(swaiting) {
										swaiting.close();
									}
									layer.msg("网络异常，请重新试试");
								}
							});
				
						}
					});	
				

			},
			handleSubmit: function(taskIdParam, submitParam) {
				var swaiting = plus.nativeUI.showWaiting('处理中...');
				
				m.ajax(app.api_url + '/api/rowcar/submitOutsideWeight?_t=' + new Date().getTime(), {
					data:{
						taskId:taskIdParam,
						submitFlag: submitParam
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg(res.msg);
						if(res.status){
							// 刷新列表
							let target = plus.webview.getWebviewById('outsideout-list');
							target.reload(true);
							backDefault();
						}
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg("网络异常，请重新试试");
					}
				});
				
			},
			toCancelOutsideReceiving:function(){
				m.back();
			},
			// 取消作业
			cancelOutsideReceiving:function(){
				m.ajax(app.api_url + '/api/rowcar/cancelOutsideSend?_t=' + new Date().getTime(), {
					data:{
						taskId:aboutVue.proReceiving.taskId,
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						//backDefault();
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg("网络异常，请重新试试");
					}
				}); 
			},
			selectSub:function(item){
				picker.show(function (selectItems) {
					item.subPlaceName=selectItems[0].text;
					item.subPlaceId=selectItems[0].id;
				})
			},
			getWarehouseConditions: function() {
				var self = this;
				//获取基础数据 品名 材质 规格 产地
				m.getJSON(app.api_url + '/api/sysBusinessBasis/subPlaceInfos', function(data) {
					self.warehouseList = data;
					picker.setData(data);
				});
			},
			// 起吊数量增1
			toAddNum:function(item){
				// debugger
				var dom = $('#realNumInput' + item.detailIds);
				// let v1=item.realNum;
				let v1=dom.val();
				if(v1&&v1>0){
					item.realNum=parseInt(v1)+1;
					dom.val(parseInt(v1)+1);
				}else{
					item.realNum=1;
					dom.val(1);
				}
			},
			// 起吊数量减一 
			toMinusNum:function(item){
				var dom = $('#realNumInput' + item.detailIds);
				// let v1=item.realNum;
				let v1=dom.val();
				if(v1&&v1>0){
					item.realNum=parseInt(v1)-1;
					dom.val(parseInt(v1)-1);
				}
			},
			getData: function(taskId, isReload) {
				m.ajax(app.api_url + '/api/rowcar/getOutsideSendData?_t=' + new Date().getTime(), {
					data: {
						taskId: taskId,
						isReload: isReload
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒； 
					success: function(res) {
						// debugger
						
						if(swaiting) {
							swaiting.close();
						}
						
						let errorMsg=res.errorMsg;
						if(errorMsg&&errorMsg.length>0){
							layer.msg(errorMsg);
						}else{
							
							var compare = function(obj1, obj2) {
								var date1 = new Date(obj1.updateDate);
								var date2 = new Date(obj2.updateDate);
								
								if(obj1.isLoading === "1" && obj2.isLoading !== "1") {
									return 1;
								}else if(obj1.isLoading !== "1" && obj2.isLoading === "1") {
									return -1;
								}else if(obj1.isLoading === "1" && obj2.isLoading === "1") {
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
							
							aboutVue.proReceiving = res;
							aboutVue.detailList=aboutVue.proReceiving.detailList;
							
							aboutVue.detailList.sort(compare);
									
							aboutVue.getWarehouseConditions();
							
							setTimeout(function() {
								for(var i = 0; i < aboutVue.detailList.length; i++) {
									var item = aboutVue.detailList[i];
									if(item.outputNum !== 0) {
										$('#realNumInput' + item.detailIds).val(item.outputNum);
									}
									
								}
							}, 500);
							
							
						}
						
						// location.reload();
						
						
						
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
				
			},
			loadSwitch: function(detail) { // 已装/未装切换
				// debugger
				
				detail.loadFlag = detail.isLoading === '1' ? '0' : '1';
				detail.outputNum = $('#realNumInput' + detail.detailIds).val(); // 实提数量
				
				if(detail.isLoading === '0') { // 未装
					var detailOutputNumTemp = detail.outputNum;
					if(detailOutputNumTemp === undefined || detailOutputNumTemp === '') {
						layer.msg("实提数量不能为空");
						return;
					}
					if(detailOutputNumTemp > detail.sendNum) {
						layer.msg("实提数量不能大于应发数量");
						return;
					}
					for(var i = 0; i < aboutVue.detailList.length; i++) {
						var item = aboutVue.detailList[i];
						if(item.isWeight === '0' && item.isLoading === '1' && detail.materialDesc !== item.materialDesc) {
							layer.msg("一次只能过磅一种规格物料，不支持多规格同时过磅！");
							return;
						}
						
						
					}
					
					if(detailOutputNumTemp !== (detail.sendNum + '')) { // 实提与应发不相等
						let content='<div style="height:10px;margin:10px 50px;line-height:30px;'+
						'text-align:center;font-size:16px;">应发与装卸件数不一致，请确认是否提交，提交后无法撤回！</div>';
						layer.open({
							type: 1,
							shade: 0.3,
							title: "提示",
							area:['400px','180px'],
							content: content,
							btn: ['取 消','确 定'],
							cancel: function(index) {
								return true;
							},
							// 取消按钮
							btn1:function(index, layero){
								layer.close(index);
							},
							// 确定按钮
							btn2: function(index) {
								
								swaiting = plus.nativeUI.showWaiting('处理中...');
								
								m.ajax(app.api_url + '/api/rowcar/saveOutsideCrane?_t=' + new Date().getTime(), {
									data: detail,
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									timeout: 10000, //超时时间设置为60秒
									success: function(res) {
										// debugger
										if(swaiting) {
											swaiting.close();
										}
										
										aboutVue.getData(ws.taskId, '1');
										
									},
									error: function(xhr, type, errorThrown) {
										if(swaiting) {
											swaiting.close();
										}
										layer.msg("网络异常，请重新试试");
									}
								});
								
								return true;
							}
						});	
						
					}else {
						swaiting = plus.nativeUI.showWaiting('处理中...');
						
						m.ajax(app.api_url + '/api/rowcar/saveOutsideCrane?_t=' + new Date().getTime(), {
							data: detail,
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 10000, //超时时间设置为60秒
							success: function(res) {
								// debugger
								if(swaiting) {
									swaiting.close();
								}
								
								aboutVue.getData(ws.taskId, '1');
								
							},
							error: function(xhr, type, errorThrown) {
								if(swaiting) {
									swaiting.close();
								}
								layer.msg("网络异常，请重新试试");
							}
						});
						
						
					}
					
					
					
				}else {
					
					swaiting = plus.nativeUI.showWaiting('处理中...');
					
					m.ajax(app.api_url + '/api/rowcar/saveOutsideCrane?_t=' + new Date().getTime(), {
						data: detail,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒
						success: function(res) {
							// debugger
							if(swaiting) {
								swaiting.close();
							}
							
							aboutVue.getData(ws.taskId, '1');
							
						},
						error: function(xhr, type, errorThrown) {
							if(swaiting) {
								swaiting.close();
							}
							layer.msg("网络异常，请重新试试");
						}
					});
					
					
				}
				

				
				
			},
			toRefresh: function() {
				swaiting = plus.nativeUI.showWaiting('处理中...');
				aboutVue.getData(ws.taskId, '1');
				
			}
			
		}
	});
	
	
	
});
	