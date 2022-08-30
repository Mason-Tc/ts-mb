define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("zepto");
	m.init();
	require("layui");
	require("../../../js/common/bignumber.min.js");

	var layer;
	layui.use(['layer'], function() {
		layer  = layui.layer;
	});
	var swaiting = null;
	var ws=null;
	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		aboutVue.platforms=ws.platforms;
		aboutVue.rowCar=ws.rowCar;
		aboutVue.getPlatformWarehousing(aboutVue.platforms[0].id);
		
		// 连接websocket
		webSocketClient();
		craneWebSocketClient();
	})
	
	var aboutVue = new Vue({
		el: '#off-canvas',
		data: {
			isOpenDialog:false,// 是否打开了计重弹窗
			steadyWeight:'',// 吊镑稳定重量
			dynamicWeight:'',// 吊镑动态重量
			sumNum:0,// 计重数量合计
			sumWeight:0.0,// 计重重量合计
			craneLogList:[],// 计重时的List数据
			craneLogMap:new Map(),// 计重时的map数据
			isCallOn:0,// 是否叫号
			craneShadeShow:false,// 行车定位遮罩显示
			nocarShadeShow:false,// 运货车辆未到达
			carnoShadeShow:false,// 车牌遮罩显示
			rowCar:{},// 哪个行车
			rowCarAddr:{},// socket传过来的行车地址对象
			currentCraneAddr:'',// 当前行车库位地址
			currentPlatformId:'',// 当前月台id
			platforms:[],// 月台信息
			proSend:{}, // 出库数据
			detail:{}  // 弹窗详细数据
		},
		methods:{
			// 根据月台查询出库数据
			getPlatformWarehousing:function(pfId){
				// 切换月台时，初始化页面效果
				//aboutVue.steadyWeight='2000';
				aboutVue.proSend={};
				aboutVue.detail={};
				aboutVue.sumNum=0;
				aboutVue.sumWeight=0;
				aboutVue.craneLogList=[];
				aboutVue.isCallOn=0;
				aboutVue.craneShadeShow=false;
				aboutVue.nocarShadeShow=false;
				aboutVue.carnoShadeShow=false;
				$("#crane").removeClass("craneAddActive");
				$(".addrBtn").removeClass("addrBtnActive");
				
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/getPlatformProSend?_t=' + new Date().getTime(), {
					data: {platformId:pfId},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒； 
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						aboutVue.proSend=res;
						
						// 获取行车设备的最新状态，包括定位启停，吊镑启停
						let deviceList=res.deviceList;
						if(deviceList&&deviceList.length>0){
							for(let i=0;i<deviceList.length;i++){
								if(deviceList[i].id==aboutVue.rowCar.id){
									aboutVue.rowCar=deviceList[i];
									break;
								}
							}
						}
						//layer.msg(aboutVue.rowCar.deviceName+": 吊镑状态---"+aboutVue.rowCar.relStatus+" ; 定位状态---"+aboutVue.rowCar.status)
						// 重置叫号标记
						aboutVue.isCallOn=0;
						// 切换标签效果
						aboutVue.currentPlatformId=pfId;
						$("#divTag span").removeClass("tagActive")
						$('#pf_'+pfId).addClass("tagActive");
						
						//车牌对比结果
						var carCheckRet=res.carCheckRet;
						if(carCheckRet!=null&&carCheckRet!=undefined){
							// 0未比对 1OK 2NG
							if(carCheckRet=='0'){
								aboutVue.nocarShadeShow=true;
								aboutVue.carnoShadeShow=false;
							}else if(carCheckRet=='1'){
								layer.msg("作业车辆车牌号比对成功");
								aboutVue.carnoShadeShow=false;
								aboutVue.nocarShadeShow=false;
							}else if(carCheckRet=='2'){
								aboutVue.carnoShadeShow=true;
								aboutVue.nocarShadeShow=false;
							}
						}
						
						// 给详细数据加一个排序字段,再加一个是否已计重
						let detailList=aboutVue.proSend.detailList;
						if(detailList&&detailList.length>0){
							for(let i=0;i<detailList.length;i++){
								//console.log(detailList[i].warehousePlaceName+'  '+detailList[i].materialDesc+'  '+detailList[i].sendCode);
								if(detailList[i].isWeight=='1'){
									aboutVue.proSend.detailList[i].order=new Date().getTime()+i;
								}else{
									aboutVue.proSend.detailList[i].order=i;
								}
							}
							aboutVue.sortDetailList();
						}
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
				m.ajax(app.api_url + '/api/rowcar/sendConfirmComplete?_t=' + new Date().getTime(), {
					data:{
						taskId:aboutVue.proSend.taskId,
						platformId:aboutVue.currentPlatformId,
						callNumberFlag:aboutVue.isCallOn,
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
							aboutVue.toRefresh();
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
			// 显示行车位置正确的对应效果
			showCraneTargetDiv:function(){
				// 判断物料数据是否包含当前库位
				var isContain=false;
				var wpName=aboutVue.currentCraneAddr;
				var detailList=aboutVue.proSend.detailList;
				if(detailList&&detailList.length>0){
					for(var i=0;i<detailList.length;i++){
						var wp=detailList[i].warehousePlaceName;
						if(wpName==wp){
							isContain=true;
							i=detailList.length;
						}
					}
					if(isContain){
						// 隐藏行车遮罩
						aboutVue.craneShadeShow=false;
						// 坐标高亮
						$("#crane").addClass("craneAddActive");
						// 突出对应的可操作区
						$(".addrBtn").removeClass("addrBtnActive");
						$("."+wpName).addClass("addrBtnActive");
						// 开启了定位功能才高亮称重按钮
						if(aboutVue.rowCar.status=='1'){
							$(".weighBtn").removeClass("weighBtnActive");
							$("."+wpName+"_weighBtn").addClass("weighBtnActive");
						}
					}else{
						// 没有打开计重弹窗，才显示遮罩
						if(!aboutVue.isOpenDialog){
							$("#crane").removeClass("craneAddActive");
							$(".addrBtn").removeClass("addrBtnActive");
							// 开启了吊镑功能才删除高亮
							if(aboutVue.rowCar.status=='1'){
								$(".weighBtn").removeClass("weighBtnActive");
							}
							// 开启定位功能才显示遮罩
							if(aboutVue.rowCar.status=='1'){
								// 显示行车遮罩
								aboutVue.craneShadeShow=true;
							}
						}
					}
				}
			},
			// 叫号
			callOnePlat:function(){
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/callOnePlat?_t=' + new Date().getTime(), {
					data:{platformId:aboutVue.currentPlatformId},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						if(swaiting) { 
							swaiting.close();
						}
						let str=res.msg.replace(/;/g,';\r\n');
						layer.msg(str,{time:10000});
						// 叫号成功后，记录已叫号标记
						if(res.status){
							if(aboutVue.proSend&&aboutVue.proSend.id!=null){
								aboutVue.isCallOn=1;
							}else{
								aboutVue.toRefresh();
							}
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
			// 计重弹框
			gotoWeigh:function(item,itemIndex){
				var isUse=$("#"+item.detailIds+'_weighBtn').hasClass("weighBtnActive");
				if(!isUse){
					layer.msg("请选择正确的计重作业");
					return;
				}
				aboutVue.detail=item;
				//console.log("-----弹框"+aboutVue.detail);
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
									let str="<tr id='"+uuid+"'><td style='width: 300px;'>"+res[k].materialDesc+"</td><td style='width: 100px;color:#4285f4;font-weight:700;'>"+
									res[k].num+"</td><td style='width: 100px;'>"+res[k].weight+"</td>"+
											"<td><span onclick=toDelRow('"+uuid+"') style='color: #ff8888;' class='mui-icon mui-icon-trash'></span></td></tr>";
									$("#tby").append(str);
								}
								$("#sumNum").text(aboutVue.sumNum);
								$("#sumWeight").text(aboutVue.sumWeight.toFixed(3));
							}
							aboutVue.isOpenDialog=true;
							layer.open({
								type: 1,
								shade: 0.3,
								title: "计重",
								area:['700px','520px'],
								content: $('#weighDiv'),
								btn: ['取 消','确 定'],
								cancel: function(index) {
									aboutVue.clearDialogData();
									aboutVue.isOpenDialog=false;
									return true;
								},
								// 取消按钮
								btn1:function(index, layero){
									aboutVue.clearDialogData();
									aboutVue.isOpenDialog=false;
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
							aboutVue.isOpenDialog=false;
							
							// 重新设置详细数据的排序字段
							aboutVue.proSend.detailList[itemIndex].order=new Date().getTime();
							aboutVue.proSend.detailList[itemIndex].isWeight='1';
							aboutVue.sortDetailList();
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
					layer.msg("请填写起吊数量");
					return;
				}
				if(!hangWeightNum||hangWeightNum.length==0){
					layer.msg("请等待吊镑稳定数据");
					return;
				}
				if(parseInt(hangNum)<=0){
					layer.msg("请填写正确的数量");
					return;
				}
				
				// 先判断是否关闭了吊镑,校验动态数据和稳定数据是否一致
				if(aboutVue.rowCar.relStatus!=undefined&&aboutVue.rowCar.relStatus=='1'){
					if(parseInt(hangWeightNum)!=parseInt(aboutVue.dynamicWeight)){
						layer.msg("动态重量和稳定重量不一致");
						return;
					} 
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
				//console.log("-----计重"+aboutVue.detail);
				let hangData={};
				hangData.deviceId=aboutVue.rowCar.id;
				hangData.deviceName=aboutVue.rowCar.deviceName;
				hangData.taskId=aboutVue.proSend.taskId;
				hangData.billCode=aboutVue.detail.sendCode;
				hangData.billDetailId=aboutVue.detail.detailIds;
				hangData.weightTime=new Date();
				hangData.coordinateX=aboutVue.rowCarAddr.axisx;
				hangData.coordinateY=aboutVue.rowCarAddr.axisy;
				hangData.warehousePlaceName=aboutVue.currentCraneAddr;
				hangData.materialDesc=aboutVue.detail.materialDesc;
				hangData.num=hangNum;
				hangData.weight=hangWeightNum;
				hangData.warehouseId=aboutVue.proSend.warehouseId;
				//aboutVue.craneLogList.push(hangData);
				aboutVue.craneLogMap.set(uuid,hangData);
				
				// 清除这次起吊数量和稳定重量
				$("#hangNum").val("");
				//$("#hangWeightNum").val("");
				aboutVue.steadyWeight="";
				
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
			// 吊镑清零
			clearHangWeight:function(){
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/clearHangWeight?_t=' + new Date().getTime(), {
					data:{ipPort:aboutVue.rowCar.extend2,cmd:'Z'}, // Z：清零；T：去皮；C：清皮
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg(res.msg);
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg("网络异常，请重新试试");
					}
				});
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
		},
		computed: {
			totalWeight: function () {
				let dataList = this.proSend.detailList;
				if(dataList === undefined || dataList.length === 0) {
					return "";
				}
				
				let result = new BigNumber(0);
				for (let i = 0; i < dataList.length; i++) {
					let itemWeight = new BigNumber(dataList[i].outputWeight);
					result = result.plus(itemWeight);
				}
				
				let inWeight = new BigNumber(this.proSend.inWeight);
				result = result.plus(inWeight);
				
				return result + dataList[0].sendWeightUnitDesc;
			},
			totalNum: function () {
				let dataList = this.proSend.detailList;
				if(dataList === undefined || dataList.length === 0) {
					return "";
				}
				let ret = 0;
				for (let i = 0; i < dataList.length; i++) {
					ret += dataList[i].outputNum;
				}
				
				return ret + dataList[0].sendNumUnitDesc;
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
	
	// 吊镑socket
	    var socket;
		function webSocketClient(){
			if(typeof(WebSocket) == "undefined") {
				console.log("您的浏览器不支持WebSocket");
			}else{
				var socketUrl=app.ws_url+"hangWeighWebSocket";
				console.log(socketUrl);
				if(socket!=null){
					socket.close();
					socket=null;
				}
				socket = new WebSocket(socketUrl);
				//打开事件
				socket.onopen = function() {
					console.log("websocket已打开");
					//socket.send("这是来自客户端的消息" + location.href + new Date());
				};
				//获得消息事件
				socket.onmessage = function(msg) {
					//console.log(msg);
					var data=JSON.parse(msg.data);
					var ipPort=data.ipPort;	// ip和端口
					var weight=data.weight;// 重量
					var isSteady=data.isSteady;// 0：稳态，1：动态
					if(ipPort&&ipPort==aboutVue.rowCar.extend2){
						aboutVue.dynamicWeight=weight;
						// 开启了吊镑才显示稳定数据
						if(aboutVue.rowCar.relStatus=='1'){
							if(0==isSteady){
								aboutVue.steadyWeight=weight;
							}
						}
					}
				};
				//关闭事件
				socket.onclose = function() {
					console.log("websocket已关闭");
				};
				//发生了错误事件
				socket.onerror = function() {
					console.log("websocket发生了错误");
				}
			}
		}

		setInterval(function() {
			if (socket.readyState == 1) {
				console.log("连接状态，发送消息保持连接");
				socket.send("ping");
			} else {
				console.log("断开状态，尝试重连");
				webSocketClient();
			}
			if (craneWebSocket.readyState == 1) {
				console.log("连接状态，发送消息保持连接");
				craneWebSocket.send("ping");
			} else {
				console.log("断开状态，尝试重连");
				craneWebSocketClient();
			}
		},40000);
		
		
		// 行车定位websocket
		var craneWebSocket;
		function craneWebSocketClient(){
			if(typeof(WebSocket) == "undefined") {
				console.log("您的浏览器不支持WebSocket");
			}else{
				var socketUrl=app.ws_url+"craneWebSocket";
				console.log(socketUrl);
				if(craneWebSocket!=null){
					craneWebSocket.close();
					craneWebSocket=null;
				}
				craneWebSocket = new WebSocket(socketUrl);
				//打开事件
				craneWebSocket.onopen = function() {
					console.log("websocket已打开");
					//socket.send("这是来自客户端的消息" + location.href + new Date());
				};
				//获得消息事件
				craneWebSocket.onmessage = function(msg) {
					var data=JSON.parse(msg.data);
					if(data instanceof Array){
						// 行车数据是数组
						for(var i=0;i<data.length;i++){
							// 是否这台行车
							if(aboutVue.rowCar.deviceUid==data[i].tagId){
								aboutVue.rowCarAddr=data[i];
								aboutVue.currentCraneAddr=data[i].fenceName;
								aboutVue.showCraneTargetDiv();
							}
						}
					}else{
						// 告警数据
						var billCode=data.billCode;
						// 月台车牌对比
						var matchPlatformId=data.matchPlatformId;
					
						if(billCode!=null&&billCode!=undefined){
							if(billCode==aboutVue.proSend.sendCode){
								var dealResult=data.dealResult;
								// 处理结果(1不作业 2忽略)
								if('1'==dealResult){
									aboutVue.carnoShadeShow=true;
								}else{
									aboutVue.carnoShadeShow=false;
								}
							}
						}else  if(matchPlatformId!=undefined&&matchPlatformId==aboutVue.currentPlatformId){
							var matchResultMsg=data.matchResultMsg;
							
							console.log(aboutVue.currentPlatformId+"---"+matchResultMsg);
							// 0未比对 1OK 2NG
							if(matchResultMsg=='0'){
								aboutVue.nocarShadeShow=true;
								aboutVue.carnoShadeShow=false;
							}else if(matchResultMsg=='1'){
								layer.msg("作业车辆车牌号比对成功");
								aboutVue.carnoShadeShow=false;
								aboutVue.nocarShadeShow=false;
							}else if(matchResultMsg=='2'){
								aboutVue.carnoShadeShow=true;
								aboutVue.nocarShadeShow=false;
							}
						}
					}
				};
				//关闭事件
				craneWebSocket.onclose = function() {
					console.log("websocket已关闭");
				};
				//发生了错误事件
				craneWebSocket.onerror = function() {
					console.log("websocket发生了错误");
				}
			}
		}
		
});