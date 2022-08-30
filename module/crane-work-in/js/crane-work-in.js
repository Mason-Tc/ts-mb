define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("../../../js/common/common.js");
	var $ = require("zepto");
	require("layui");
	
	require("mui-picker");
	require("mui-poppicker");
	
	var layer;
	layui.use(['layer'], function() {
		layer  = layui.layer;
	});
	var ws=null;
	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		aboutVue.platforms=ws.platforms;
		aboutVue.rowCar=ws.rowCar;
		aboutVue.getPlatformWarehousing(aboutVue.platforms[0].id);
		
		// 连接websocket
		craneWebSocketClient();
	});
	
	var picker = new mui.PopPicker();
	
	var aboutVue = new Vue({
		el: '#off-canvas',
		data: {
			craneShadeShow:false,// 行车定位遮罩显示
			nocarShadeShow:false,// 运货车辆未到达
			carnoShadeShow:false,// 车牌遮罩显示
			rowCar:{},// 哪个行车
			currentCraneAddr:'',// 当前行车地址
			currentPlatformId:'',// 当前月台id
			platforms:[],// 月台信息
			proReceiving:{} ,// 入库的数据
			placeSubList: [] // 全部库位
		},
		methods:{
			// 根据月台查询入库数据
			getPlatformWarehousing:function(pfId){
				// 切换月台时，初始化页面效果
				aboutVue.craneShadeShow=false;
				aboutVue.nocarShadeShow=false;
				aboutVue.carnoShadeShow=false;
				$("#crane").removeClass("craneAddActive");
				$(".addrBtn").removeClass("addrBtnActive");
				
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/getPlatformWarehousing?_t=' + new Date().getTime(), {
					data: {platformId:pfId},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒； 
					success: function(res) {
						// debugger
						if(swaiting) {
							swaiting.close();
						}
						aboutVue.proReceiving=res;
						aboutVue.getPlaceSubList(); // 获取全部库位
						
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
							}else if(carCheckRet=='1'){
								aboutVue.carnoShadeShow=false;
							}else if(carCheckRet=='2'){
								aboutVue.carnoShadeShow=true;
							}
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
			selectSub: function(item) {
				// debugger
				picker.show(function (selectItems) {
					// debugger
					item.subPlaceName=selectItems[0].text;
					item.subPlaceId=selectItems[0].id;
					$("#subPlaceInputId" + item.id).val(item.subPlaceId);
					$("#subPlaceInput" + item.id).val(item.subPlaceName);
					
				})
			},
			// 实收数量增1
			toAddNum:function(index) {
				let v1=$("#hangNum").val();
				if(v1&&v1.length>0){
					// $("#hangNum").val(parseInt(v1)+1);
					aboutVue.proReceiving.detailList[index].realNum = parseInt(v1)+1;
				}else{
					// $("#hangNum").val(1);
					aboutVue.proReceiving.detailList[index].realNum = 1;
				}
			},
			// 实收数量减一 
			toMinusNum:function(index) {
				let v1=$("#hangNum").val();
				if(v1&&v1.length>0){
					if(parseInt(v1)>1){
						// $("#hangNum").val(parseInt(v1)-1);
						aboutVue.proReceiving.detailList[index].realNum = parseInt(v1)-1;
					}
				}
			},
			onSubPlaceChange: function(index) {
				// debugger
				let id = $("#subPlaceSelect").val();
				let text = $("#subPlaceSelect option:checked").text();
				aboutVue.proReceiving.detailList[index].subPlaceId = id;
				aboutVue.proReceiving.detailList[index].subPlaceName = text;
				
			},
			getPlaceSubList: function() { // 全部库位
				// var self = this;
				var relPath = '/api/sysBusinessBasis/subPlaceInfos?warehouseId=' +
				aboutVue.proReceiving.warehouseId;
				
				m.getJSON(app.api_url + relPath, function(data) {
					// debugger
					aboutVue.placeSubList = data;
					picker.setData(data);
					if(aboutVue.proReceiving.detailList !== undefined && 
						aboutVue.proReceiving.detailList.length > 0) {
							
						for (var i = 0; i < aboutVue.proReceiving.detailList.length; i++) {
							let tmpItem = aboutVue.proReceiving.detailList[i];
							if(tmpItem.subPlaceId !== undefined) {
								$("#subPlaceInputId" + tmpItem.id).val(tmpItem.subPlaceId);
								$("#subPlaceInput" + tmpItem.id).val(tmpItem.subPlaceName);
							}
									
						}
					}
					
				});
				
				
			},
		
			// 完成确认
			toComplete:function(){
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
						// debugger
						swaiting = plus.nativeUI.showWaiting('处理中...');
						var jsonData = [];
						for (var i = 0; i < aboutVue.proReceiving.detailList.length; i++) {
							var item = aboutVue.proReceiving.detailList[i];
							let rnum = item.realNum;
							let lsubPlaceId = item.subPlaceId;
							
							if(rnum==undefined || rnum==null || rnum.length<=0 || parseFloat(rnum)<=0) {
								m.toast("第"+(i+1)+"行，请填写正确的实收数量");
								if(swaiting) {
									swaiting.close();
								}
								return;
							}
							
							if(lsubPlaceId==undefined || lsubPlaceId==null || 
								lsubPlaceId.length<=0 || parseFloat(lsubPlaceId)<0) {
								m.toast("第"+(i+1)+"行，请选择库位");
								if(swaiting) {
									swaiting.close();
								}
								return;
							}
							
							jsonData[i] = item;
						}
				
						m.ajax(app.api_url + '/api/rowcar/receiveConfirmComplete?_t=' + new Date().getTime(), {
							data:{
								taskId:aboutVue.proReceiving.taskId,
								platformId:aboutVue.currentPlatformId,
								jsonData: JSON.stringify(jsonData)
							},
							dataType: 'json', //服务器返回json格式数据
							type: 'post', //HTTP请求类型
							timeout: 10000, //超时时间设置为60秒
							success: function(res) {
								if(swaiting) {
									swaiting.close();
								}
								layer.msg(res.msg,{time:5000});
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
						return true;
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
				var detailList=aboutVue.proReceiving.detailList;
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
					}else{
						if(aboutVue.rowCar.status=='1'){
							// 显示行车遮罩
							aboutVue.craneShadeShow=true;
							$("#crane").removeClass("craneAddActive");
							$(".addrBtn").removeClass("addrBtnActive");
						}
					}
				}
			}
		}
	});
	
	// 行车定位websocket
	var craneWebSocket;
	function craneWebSocketClient(){
		if(typeof(WebSocket) == "undefined") {
			console.log("您的浏览器不支持WebSocket");
		}else{
			var socketUrl=app.ws_url+"craneWebSocket";
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
				//console.log(msg);
				var data=JSON.parse(msg.data);
				if(data instanceof Array){
					// 行车数据是数组
					for(var i=0;i<data.length;i++){
						// 是否这台行车
						if(aboutVue.rowCar.deviceUid==data[i].tagId){
							aboutVue.currentCraneAddr=data[i].fenceName;
							aboutVue.showCraneTargetDiv();
						}
					}
				}else{
					// 告警数据
					var billCode=data.billCode;
					// 月台车牌对比
					var matchPlatformId=data.matchPlatformId;
							console.log(billCode+matchPlatformId);			
					if(billCode!=null&&billCode!=undefined){
						if(billCode==aboutVue.proReceiving.receivingCode){
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
	
	setInterval(function() {
		if (craneWebSocket.readyState == 1) {
			console.log("连接状态，发送消息保持连接");
			craneWebSocket.send("ping");
		} else {
			console.log("断开状态，尝试重连");
			craneWebSocketClient();
		}
	},40000);
});