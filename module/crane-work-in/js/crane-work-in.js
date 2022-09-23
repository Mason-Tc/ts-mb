define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("jquery")
	require("../../../js/common/common.js");
	require("../../../js/common/select2.full.js")
	require("layui");
	require("mui-picker");
	require("mui-poppicker");
	function formatState(state) {
	    var $state = $(
		  '<div style="position: relative;z-index: 4;font-size: 13px;display: block;border-bottom: 1px solid #ebebeb;background: white;opacity: 1;padding: 10px 0 10px 15px;margin: 0;">' + state.text + '</div>'
	    )
	    return $state
	}
	function timestampToTime(timestamp) {
		var date = new Date(timestamp);
		var Y = date.getFullYear() + '-';
		var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1):date.getMonth()+1) + '-';
		var D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())+ ' ';
		var h = (date.getHours() < 10 ? '0'+date.getHours():date.getHours())+ ':';
		var m = (date.getMinutes() < 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
		var s = date.getSeconds() < 10 ? '0'+date.getSeconds():date.getSeconds();
		return Y+M+D+h+m+s;
	}
	var layer;
	layui.use(['layer'], function() {
		layer  = layui.layer;
	});
	var ws=null;
	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		aboutVue.currentPlatformId=ws.platformId;
		aboutVue.allInfo = ws.allInfo
		console.log('————————————————————————————————————————————in')
		console.log(JSON.stringify(ws.allInfo))
		// 连接websocket
		// craneWebSocketClient();
	});
	
	var picker = new mui.PopPicker();
	var aboutVue = new Vue({
		el: '#app',
		data: {
			craneShadeShow:false,// 行车定位遮罩显示
			nocarShadeShow:false,// 运货车辆未到达
			carnoShadeShow:false,// 车牌遮罩显示
			rowCar:{},// 哪个行车
			currentCraneAddr:'',// 当前行车地址
			currentPlatformId:'',// 当前月台id
			proReceiving:{} ,// 入库的数据
			placeSubList: [] ,// 全部库位
			platforms:[{platformName:'月台3',id:'3'}],
			tipContent:'',
			popoverSure:false,
			popover:false,
			allInfo:{},
			compute:{
				id:'',
				materialDesc:'',
				packageNo:'',
				warehousePlaceId:'',
				warehousePlaceName:'',
				col:0,
				row:0,
				receivableNum:0,
				receivableWeight:0,
				workNum:0,
				workWeight:0,
				hangWeight:0,
			},
			computeList:[],
		},
		computed: {
			allNum: function () { // 实发总计数量
				let sum = 0
				for (let i in this.computeList) {
					if (!this.computeList[i].realNum) {
						sum += 0
					} else {
						sum += parseInt(this.computeList[i].realNum)
					}
				}
				if (!sum) sum = 0
				return sum
			},
			allWeight: function () { // 应发总计数量
				let sum = 0
				for (let i in this.computeList) {
					if (!this.computeList[i].realWeight) {
						sum += 0
					} else {
						sum += parseInt(this.computeList[i].realWeight)
					}
				}
				if (!sum) sum = 0
				return sum
			},
		},
		methods:{
			openComputation:function(material){
				if (this.popover === false) {
					this.compute.id = material.id
					this.compute.materialDesc = material.materialDesc
					this.compute.packageNo = material.packageNo
					this.compute.warehousePlaceId = material.warehousePlaceId
					this.compute.receivableNum = material.receivableNum
					this.compute.receivableWeight = material.receivableWeight
					this.popover = true
					this.getPlaceSubList()
				} else {
					this.popover = false
				}
			},
			openTip:function(){
				if (this.popoverSure === false) {
					// if(this.allNum!=this.workNum){
					// 	this.tipContent='实收数量和应收数量不一致，是否确认提交？'
					// }else{
						this.tipContent = '是否确认提交？'
					// }
					this.popoverSure = true
				} else {
					this.popoverSure = false
				}
			},
			// 根据月台查询入库数据
			getPlatformWarehousing:function(pfId){
				// 切换月台时，初始化页面效果
				let self = this
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/getPlatformTaskByPlatformId', {
					data: {platformId:self.currentPlatformId},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒； 
					success: function(res) {
						console.log('_______________________refresh')
						console.log(JSON.stringify(res))
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
			// 实收数量增1
			toAddNum:function() {
				let self = this
				if(self.compute.workNum>=self.compute.receivableNum){
					self.compute.workNum = self.compute.receivableNum
				}else{
					self.compute.workNum = self.compute.workNum + 1
				}
			},
			// 实收数量减一 
			toMinusNum:function(index) {
				let self = this
				if(self.compute.workNum<=0){
					self.compute.workNum = 0
				}else{
					self.compute.workNum = self.compute.workNum -1
				}
			},
			addCompute:function(){
				let self = this
				if(self.compute.workNum>self.compute.receivableNum){
					m.toast('实发不能大于应发')
					return
				}
				if(self.compute.workNum<=0){
					m.toast('起吊数量不能为0')
					return
				}
				let obj = {}
				obj.id = self.compute.id
				obj.realNum = self.compute.workNum || 0
				obj.realWeight = self.compute.workWeight || 0
				obj.materialDesc = self.compute.materialDesc || ''
				obj.hangTime = timestampToTime(new Date())
				self.computeList.push(obj)
			},
			clearComp:function(){
				let self = this
				self.computeList = []
			},
			sureCompute:function(){
				var self = this
				var relPath = '/api/rowcar/saveProCraneLogList'
				let list = []
				for(let i = 0 ; i<self.computeList.length ; i++){
					let obj = {}
					obj.deviceId = '1'
					obj.deviceName = '行车1'
					obj.operType = '2'
					obj.taskId = self.allInfo.taskId
					obj.billCode = self.allInfo.receivingCode
					obj.billDetailId = self.computeList[i].id
					obj.weightTime = self.computeList[i].hangTime
					obj.warehousePlaceName = self.computeList[i].warehousePlaceName
					obj.warehouseId = self.computeList[i].warehouseId
					obj.materialDesc = self.computeList[i].materialDesc
					obj.num = self.computeList[i].realNum
					obj.weight = self.computeList[i].realWeight
					obj.status = 2
					obj.isSingleWarning = '0'
					obj.isDel = '0'
					list.push(obj)
				}
				m.ajax(app.api_url + relPath, {
					data:{jsonData:JSON.stringify(list)},
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 60000, // 超时时间设置为1分钟
					success: function (data) {
						if(data.status){
							m.toast('保存成功')
							self.openComputation()
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			getPlaceSubList: function() { // 全部库位
				var self = this
				var relPath = '/api/tspad/getWarehousePlaceList'
				console.log('platform:' + self.currentPlatformId)
				m.ajax(app.api_url + relPath, {
					data:{ platformId: self.currentPlatformId },
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 60000, // 超时时间设置为1分钟
					success: function (data) {
						console.log(JSON.stringify(data))
						let list = []
						if(Array.isArray(data)){
							list = data.map((e)=>{
								return { id:e.id , text:e.warehousePlaceName }
							})
						}
						let instance = $('.q-warehousePlace-id').data('select2')
						if (instance) {
							$('.q-warehousePlace-id').select2('destroy').empty()
						}
						$('.q-warehousePlace-id').select2({
							containerCssClass:"select_box_border",
							templateResult: formatState,
							data: list ,
							placeholder: '请选择库位'
						})
						$('.q-warehousePlace-id').val(self.compute.warehousePlaceId).trigger("change")
						$('.q-warehousePlace-id').on("select2:select", function (e) {
							self.compute.warehousePlaceId = e.params.data.id
							self.compute.warehousePlaceName = e.params.data.text
						})
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			onSure:function(){
				let self = this
				let data = {}
				data.taskId = self.allInfo.taskId
				data.platformId = self.currentPlatformId
				let list = JSON.parse(JSON.stringify(self.allInfo.detailList))
				for(let i=0 ;i<list.length;i++){
					list[i].columnId = '1'
					list[i].storeyNo ='1'
					list[i].xc=1
					list[i].yc=1
					list[i].zc=1
				}
				data.jsonData = JSON.stringify(list)
				let relPath = '/api/rowcar/receiveConfirmComplete'
				m.ajax(app.api_url + relPath, {
					data:data,
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 60000, // 超时时间设置为1分钟
					success: function (data) {
						if(data.status){
							m.toast('保存成功')
							self.back();
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			// 完成确认
			back:function(){
				m.openWindow({
					id: 'openCraneManage',
					"url": '../../crane-index/html/crane-index.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
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
	// var craneWebSocket;
	// function craneWebSocketClient(){
	// 	if(typeof(WebSocket) == "undefined") {
	// 		console.log("您的浏览器不支持WebSocket");
	// 	}else{
	// 		var socketUrl=app.ws_url+"craneWebSocket";
	// 		if(craneWebSocket!=null){
	// 			craneWebSocket.close();
	// 			craneWebSocket=null;
	// 		}
	// 		craneWebSocket = new WebSocket(socketUrl);
	// 		//打开事件
	// 		craneWebSocket.onopen = function() {
	// 			console.log("websocket已打开");
	// 			//socket.send("这是来自客户端的消息" + location.href + new Date());
	// 		};
	// 		//获得消息事件
	// 		craneWebSocket.onmessage = function(msg) {
				//console.log(msg);
				// var data=JSON.parse(msg.data);
				// if(data instanceof Array){
				// 	// 行车数据是数组
				// 	for(var i=0;i<data.length;i++){
				// 		// 是否这台行车
				// 		if(aboutVue.rowCar.deviceUid==data[i].tagId){
				// 			aboutVue.currentCraneAddr=data[i].fenceName;
				// 			aboutVue.showCraneTargetDiv();
				// 		}
				// 	}
				// }else{
				// 	// 告警数据
				// 	var billCode=data.billCode;
				// 	// 月台车牌对比
				// 	var matchPlatformId=data.matchPlatformId;
				// 			console.log(billCode+matchPlatformId);			
				// 	if(billCode!=null&&billCode!=undefined){
				// 		if(billCode==aboutVue.proReceiving.receivingCode){
				// 			var dealResult=data.dealResult;
				// 			// 处理结果(1不作业 2忽略)
				// 			if('1'==dealResult){
				// 				aboutVue.carnoShadeShow=true;
				// 			}else{
				// 				aboutVue.carnoShadeShow=false;
				// 			}
				// 		}
				// 	}else  if(matchPlatformId!=undefined&&matchPlatformId==aboutVue.currentPlatformId){
				// 		var matchResultMsg=data.matchResultMsg;
				// 		console.log(aboutVue.currentPlatformId+"---"+matchResultMsg);
				// 		// 0未比对 1OK 2NG
				// 		if(matchResultMsg=='0'){
				// 			aboutVue.nocarShadeShow=true;
				// 			aboutVue.carnoShadeShow=false;
				// 		}else if(matchResultMsg=='1'){
				// 			aboutVue.carnoShadeShow=false;
				// 			aboutVue.nocarShadeShow=false;
				// 		}else if(matchResultMsg=='2'){
				// 			aboutVue.carnoShadeShow=true;
				// 			aboutVue.nocarShadeShow=false;
				// 		}
				// 	}
				// }
	// 		};
	// 		//关闭事件
	// 		craneWebSocket.onclose = function() {
	// 			console.log("websocket已关闭");
	// 		};
	// 		//发生了错误事件
	// 		craneWebSocket.onerror = function() {
	// 			console.log("websocket发生了错误");
	// 		}
	// 	}
	// }
	
	// setInterval(function() {
	// 	if (craneWebSocket.readyState == 1) {
	// 		console.log("连接状态，发送消息保持连接");
	// 		craneWebSocket.send("ping");
	// 	} else {
	// 		console.log("断开状态，尝试重连");
	// 		craneWebSocketClient();
	// 	}
	// },40000);
});