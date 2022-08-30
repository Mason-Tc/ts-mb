define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("zepto");
	m.init();
	require("layui");
	var layer;
	layui.use(['layer'], function() {
		layer  = layui.layer;
	});
	var swaiting = null;
	var ws=null;
	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		aboutVue.task=ws.task;
		aboutVue.taskId=aboutVue.task.id;
		aboutVue.pfList=aboutVue.task.pfList;
		aboutVue.getPlatformWarehousing(aboutVue.pfList[0].id);
		
		// 重写返回功能
		var backDefault = m.back;
		function detailBack() {
			if(swaiting) {
				swaiting.close();
			}
			let target = plus.webview.getWebviewById('balance-diff-list'); 
			target.reload(true);
			backDefault();
		}
		m.back = detailBack;
	})
	
	var aboutVue = new Vue({
		el: '#off-canvas',
		data: { 
			pfList:[],// 传过来的月台对象
			taskId:'',// 传过来的任务id
			task:{},// 列表传过来的任务对象
			steadyWeight:'',// 吊镑稳定重量
			dynamicWeight:'',// 吊镑动态重量
			sumNum:0,// 计重数量合计
			sumWeight:0.0,// 计重重量合计
			craneLogList:[],// 计重时的List数据
			craneLogMap:new Map(),// 计重时的map数据
			rowCar:{},// 哪个行车
			currentPlatformId:'',// 当前月台id
			platforms:[],// 月台信息
			proSend:{}, // 出库数据
			detail:{}  // 弹窗详细数据
		},
		methods:{
			// 根据月台查询出库数据
			getPlatformWarehousing:function(pfId){
				// 切换月台时，初始化页面效果
				aboutVue.proSend={};
				aboutVue.detail={};
				aboutVue.sumNum=0;
				aboutVue.sumWeight=0;
				aboutVue.craneLogList=[];
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/getTaskPlatSend?_t=' + new Date().getTime(), {
					data: {taskId:aboutVue.taskId,platformId:pfId},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒； 
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						aboutVue.proSend=res;
					
						
						// 切换标签效果
						aboutVue.currentPlatformId=pfId;
						$("#divTag span").removeClass("tagActive")
						$('#pf_'+pfId).addClass("tagActive");
					},
					error: function(xhr, type, errorThrown) {
						// 切换标签效果
						$("#divTag span").removeClass("tagActive")
						$('#pf_'+pfId).addClass("tagActive");
						if(swaiting) {
							swaiting.close();
						}
						layer.msg("网络异常，请重新试试");
					}
				});
			},
			
			// 出库作业完成确认
			sendConfirmComplete:function(){
				let detailList=aboutVue.proSend.detailList;
				let tempOutputNum=0;// 实提
				let tempSendNumNum=0;// 应发
				for(var i=0;i<detailList.length;i++){
					tempOutputNum+=parseInt(detailList[i].outputNum);
					tempSendNumNum+=parseInt(detailList[i].sendNum);
					//layer.msg(detailList[i].warehousePlaceName+"实提数量不能为0",{time:10000});
					//layer.msg(detailList[i].warehousePlaceName+"实提数量不能为0");
					//return false;
					detailList[i].createBy=null;
					detailList[i].updateBy=null;
				}
				if(tempOutputNum==0){
					layer.msg("实提数量不能为0");
					return false;
				}else{
					if(tempOutputNum<tempSendNumNum){
						let content='<div style="height:150px;margin:40px 100px;line-height:30px;'+
						'text-align:center;font-size:16px;">应发数量<span style="color:#4285f4;font-weight:700;font-size:20px;">'+
						tempSendNumNum+'</span>件与实提数量'+
						'<span style="color:#4285f4;font-weight:700;font-size:20px;">'+tempOutputNum+'</span>件不一致，<br>请确认是否继续提交。</div>';
						layer.open({
							type: 1,
							shade: 0.3,
							title: "确认提示",
							area:['400','150'],
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
								aboutVue.doSendConfirmComplete(detailList);
								return true;
							}
						});
					}else{
						// 数量相等也要提示，防止误点
						let content='<div style="height:120px;margin:40px 100px;line-height:30px;'+
						'text-align:center;font-size:16px;">请确认是否继续提交。</div>';
						layer.open({
							type: 1,
							shade: 0.3,
							title: "确认提示",
							area:['400','150'],
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
								aboutVue.doSendConfirmComplete(detailList);
								return true;
							}
						});
					}
				}
			},
			doSendConfirmComplete:function(detailList){
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/warnTaskComplete?_t=' + new Date().getTime(), {
					data:{
						taskId:aboutVue.proSend.taskId,
						platformId:aboutVue.currentPlatformId,
						jsonData:JSON.stringify(detailList),
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						
						let str=res.msg.replace(/;/g,';\r\n');
						//layer.msg(str);
						layer.msg(str,{time:10000});
						if(res.status){
							//aboutVue.toRefresh();
							m.back();
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
			// 切换月台时，暂时保存数据
			autoSaveWarnTaskComplete:function(pfId){
				let detailList=aboutVue.proSend.detailList;
				for(var i=0;i<detailList.length;i++){
					detailList[i].createBy=null;
					detailList[i].updateBy=null;
				}
				m.ajax(app.api_url + '/api/rowcar/warnTaskComplete?_t=' + new Date().getTime(), {
					data:{
						taskId:aboutVue.proSend.taskId,
						platformId:aboutVue.currentPlatformId,
						jsonData:JSON.stringify(detailList)},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						if(res.status){
							aboutVue.getPlatformWarehousing(pfId);
						}else{
							let str=res.msg.replace(/;/g,';\r\n');
							layer.msg(str,{time:5000});
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
			// 刷新页面数据
			toRefresh:function(){
				aboutVue.getPlatformWarehousing(aboutVue.currentPlatformId);
			},
			
			// 计重弹框
			gotoWeigh:function(item,itemIndex){
				aboutVue.detail=item;
				aboutVue.sumNum=0;
				aboutVue.sumWeight=0;
				m.ajax(app.api_url + '/api/rowcar/selectProCraneLogList?_t=' + new Date().getTime(), {
						data:{billDetailId:aboutVue.detail.detailIds},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒
						success: function(res) {
							if(res&&res.length>0){
								for(let k=0;k<res.length;k++){
									aboutVue.sumNum+=parseInt(res[k].num);
									aboutVue.sumWeight+=parseFloat(res[k].weight);
									// 回显计重表格数据
									let uuid=aboutVue.getUUID();
									aboutVue.craneLogMap.set(uuid,res[k]);
									let str="<tr id='"+uuid+"'><td style='width: 300px;'>"+res[k].materialDesc+"</td><td style='width:100px;color:#4285f4;font-weight:700;'>"+
									res[k].num+"</td><td style='width:100px;'>"+res[k].weight+"</td>"+
											"<td><span onclick=toDelRow('"+uuid+"') style='color: #ff8888;' class='mui-icon mui-icon-trash'></span></td></tr>";
									$("#tby").append(str);
								}
								$("#sumNum").text(aboutVue.sumNum);
								$("#sumWeight").text(aboutVue.sumWeight.toFixed(3));
							}
							layer.open({
								type: 1,
								shade: 0.3,
								title: "计重",
								area:['680px','520px'],
								content: $('#weighDiv'),
								btn: ['取 消','确 定'],
								cancel: function(index) {
									aboutVue.clearDialogData();
									return true;
								},
								// 取消按钮
								btn1:function(index, layero){
									aboutVue.clearDialogData();
									layer.close(index);
								},
								// 确定按钮
								btn2: function(index) {
									aboutVue.saveProCraneLogList(index,itemIndex);
									return false;
								}
							});
						},
						error: function(xhr, type, errorThrown) {
							if(swaiting) {
								swaiting.close();
							}
							layer.msg("网络异常，请重新试试");
						}
					}); 
			},
			// 保存称重数据
			saveProCraneLogList:function(index2,itemIndex){
				// 校验是否有计量明细
				if(aboutVue.craneLogMap.size==0){
					layer.msg("请先确认计量数据");
					return ;
				}
				// 校验应发件数是否大于明细总件数
				let tempNum=0;
				let reqData=[];
				for(let item of aboutVue.craneLogMap.values()){
					tempNum+=parseInt(item.num);
					item.id="";
					reqData.push(item);
				}
				if(tempNum>parseInt(aboutVue.detail.sendNum)){
					layer.msg("实提数量为"+tempNum+"件，不能大于应发数量"+aboutVue.detail.sendNum+"件");
					return;
				}
				if(tempNum<parseInt(aboutVue.detail.sendNum)){
					let content='<div style="height:150px;margin:40px 100px;line-height:30px;'+
					'text-align:center;font-size:16px;">应发数量<span style="color:#4285f4;font-weight:700;font-size:20px;">'+
					aboutVue.detail.sendNum+'</span>件与实提数量'+
					'<span style="color:#4285f4;font-weight:700;font-size:20px;">'+tempNum+'</span>件不一致，<br>请确认是否继续提交。</div>';
					layer.open({
						type: 1,
						shade: 0.3,
						title: "确认提示",
						area:['400','150'],
						content: content,
						btn: ['取 消','确 定'],
						cancel: function(index) {
							aboutVue.clearDialogData();
							return true;
						},
						// 取消按钮
						btn1:function(index, layero){
							aboutVue.clearDialogData();
							layer.close(index);
						},
						// 确定按钮
						btn2: function(index) {
							aboutVue.doSaveProCraneLogList(index2,itemIndex,reqData);
							return true;
						}
					});
				}else{
					aboutVue.doSaveProCraneLogList(index2,itemIndex,reqData);
				}
			},
			// 执行保存称重数据
			doSaveProCraneLogList:function(index,itemIndex,reqData){
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/saveProCraneLogList?_t=' + new Date().getTime(), {
					data:{jsonData:JSON.stringify(reqData)},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg(res.msg,{time:3000});
						if(res.status){
							aboutVue.proSend.detailList[itemIndex].outputNum=aboutVue.sumNum;
							aboutVue.proSend.detailList[itemIndex].outputWeight=parseFloat(parseFloat(aboutVue.sumWeight).toFixed(3));
							layer.close(index);
							aboutVue.clearDialogData();
							
							// 重新设置详细数据的排序字段
							aboutVue.proSend.detailList[itemIndex].isWeight='1';
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
			// 确认一次起吊
			confirmOnce:function(){
				// 起吊数量
				var hangNum=$("#hangNum").val();
				// 起吊重量
				var hangWeightNum=$("#hangWeightNum").val();
				if(!hangNum||hangNum.length==0){
					layer.msg("请填写数量");
					return;
				}
				if(!hangWeightNum||hangWeightNum.length==0){
					layer.msg("请填写重量");
					return;
				}
				if(parseInt(hangNum)<=0){
					layer.msg("请填写正确的数量");
					return;
				}
				if(parseInt(hangWeightNum)<=0){
					layer.msg("请填写正确的重量");
					return;
				}
				
				// 转为吨
				hangWeightNum=parseInt(hangWeightNum)/1000;
				aboutVue.sumNum+=parseInt(hangNum);
				aboutVue.sumWeight+=hangWeightNum;
				$("#sumNum").text(aboutVue.sumNum);
				$("#sumWeight").text(aboutVue.sumWeight.toFixed(3));
				// 添加一行表格数据
				let uuid=aboutVue.getUUID();
				let str="<tr id='"+uuid+"'><td style='width: 300px;'>"+aboutVue.detail.materialDesc+"</td><td style='width: 100px;color:#4285f4;font-weight:700;'>"
						+hangNum+"</td><td  style='width: 100px;'>"+hangWeightNum+"</td>"+
						"<td><span onclick=toDelRow('"+uuid+"') style='color: #ff8888;' class='mui-icon mui-icon-trash'></span></td></tr>";
				$("#tby").append(str);
				//放入craneLogMap
				let hangData={};
				hangData.deviceId=aboutVue.detail.deviceId;
				hangData.deviceName=aboutVue.detail.deviceName;
				hangData.taskId=aboutVue.proSend.taskId;
				hangData.billCode=aboutVue.detail.sendCode;
				hangData.billDetailId=aboutVue.detail.detailIds;
				hangData.weightTime=new Date();
				hangData.coordinateX=null;
				hangData.coordinateY=null;
				hangData.warehousePlaceName=aboutVue.detail.warehousePlaceName;
				hangData.materialDesc=aboutVue.detail.materialDesc;
				hangData.num=hangNum;
				hangData.weight=hangWeightNum;
				hangData.warehouseId=aboutVue.proSend.warehouseId;
				aboutVue.craneLogMap.set(uuid,hangData);
				
				// 清除这次起吊数量和稳定重量
				$("#hangNum").val("");
				$("#hangWeightNum").val("");
				
				// 自动保存计重的数据
				aboutVue.autoSaveProCraneLogList();
			},
			// 自动保存称重数据
			autoSaveProCraneLogList:function(){
				if(aboutVue.craneLogMap.size==0){
					return false;
				}
				// 校验应发件数是否大于明细总件数
				let tempNum=0;
				let reqData=[];
				for(let item of aboutVue.craneLogMap.values()){
					tempNum+=parseInt(item.num);
					item.id="";
					reqData.push(item);
				}
				if(tempNum>parseInt(aboutVue.detail.sendNum)){
					return false;
				}else{
					m.ajax(app.api_url + '/api/rowcar/saveProCraneLogList?_t=' + new Date().getTime(), {
						data:{jsonData:JSON.stringify(reqData)},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为60秒
						success: function(res) {
							//layer.msg(res.msg,{time:3000});
							
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
			// 起吊数量增1
			toAddNum:function(){
				let v1=$("#hangNum").val();
				if(v1&&v1.length>0){
					$("#hangNum").val(parseInt(v1)+1);
				}else{
					$("#hangNum").val(1);
				}
			},
			// 起吊数量减一 
			toMinusNum:function(){
				let v1=$("#hangNum").val();
				if(v1&&v1.length>0){
					if(parseInt(v1)>1){
						$("#hangNum").val(parseInt(v1)-1);
					}
				}
			},
			
			
			getUUID:function() {
			        var d = new Date().getTime();
			        if (window.performance && typeof window.performance.now === "function") {
			            d += performance.now(); //use high-precision timer if available
			        }
			        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			            var r = (d + Math.random() * 16) % 16 | 0;
			            d = Math.floor(d / 16);
			            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			        });
			        return uuid;
			},
			// 清除弹框中的数据
			clearDialogData:function(){
				aboutVue.sumNum=0;
				aboutVue.sumWeight=0;
				aboutVue.dynamicWeight='';
				aboutVue.craneLogMap.clear();
				aboutVue.detail={};
				$("#hangNum").val('');
				$("#tby").html('');
			},
			// 排序detailList
			sortDetailList:function(){
				let dList=aboutVue.proSend.detailList;
				if(dList&&dList.length>0){
					aboutVue.proSend.detailList=[];
					// 使用选择排序法排序
					for(let i=0;i<dList.length;i++){
						for(let j=i+1;j<dList.length;j++){
							if(dList[i].order>dList[j].order){
								let temp=dList[j];
								dList[j]=dList[i];
								dList[i]=temp;
							}
						}
						aboutVue.proSend.detailList.push(dList[i]);
					}
				}
				//aboutVue.proSend.detailList=tempArr;
			}
		}
	});
	
	// 删除计重数据
	toDelRow=function(uuid){
		//console.log(uuid);
		let item=aboutVue.craneLogMap.get(uuid);
		aboutVue.sumNum=aboutVue.sumNum-parseInt(item.num);
		aboutVue.sumWeight=parseFloat((aboutVue.sumWeight-parseFloat(item.weight)).toFixed(3));
		aboutVue.craneLogMap.delete(uuid);
		$("#"+uuid).remove();
		$("#sumNum").text(aboutVue.sumNum);
		$("#sumWeight").text(aboutVue.sumWeight.toFixed(3));
		//console.log(aboutVue.craneLogMap.size);
		
		// 自动保存计重的数据
		aboutVue.autoSaveProCraneLogList();
	}
});
	