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
		aboutVue.crane = ws.sysDevice;
		aboutVue.platformList = ws.sysPlatformList;
		aboutVue.activePlat = ws.platformId;
		aboutVue.type=ws.type;
		aboutVue.setTitle(ws.type)
		aboutVue.allInfo = ws.allInfo;
		var backDefault = m.back;
		function detailBack() {
			if(craneWebSocket){
				craneWebSocket.close()
			}
			aboutVue.back();
			backDefault();
		}
		m.back = detailBack;
		
		// 连接websocket
		craneWebSocketClient();
	});
	
	var aboutVue = new Vue({
		el: '#off-canvas',
		data: {
			type:'',
			pageTitle:'',
			allInfo:{},
			activePlat:'',
			crane:{},
			platformList:[],
			tipContent:'',
			popoverSure:false,
			popover:false,
			hangPover:false,
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
				hangWeight:'0',
				counterpoise:0,
				countWeightMode:'',
				countWeightModeDesc:'',
			},
			computeList:[],
		},
		computed: {
			allRecNum: function () { // 总应收数量
				let sum = 0
				for (let i in this.allInfo.detailList) {
					if (!this.allInfo.detailList[i].receivableNum) {
						sum += 0
					} else {
						sum += parseInt(this.allInfo.detailList[i].receivableNum)
					}
				}
				if (!sum) sum = 0
				return sum
			},
			allSureNum: function () { // 总实收数量
				let sum = 0
				for (let i in this.allInfo.detailList) {
					if (!this.allInfo.detailList[i].realNum) {
						sum += 0
					} else {
						sum += parseInt(this.allInfo.detailList[i].realNum)
					}
				}
				if (!sum) sum = 0
				return sum
			},
			allSureWeight: function () { // 总实收重量
				let sum = 0
				for (let i in this.allInfo.detailList) {
					if (!this.allInfo.detailList[i].realWeight) {
						sum += 0
					} else {
						sum += parseFloat(this.allInfo.detailList[i].realWeight)
					}
				}
				if (!sum) sum = 0
				return sum
			},
			allNum: function () { // 计量数量
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
			allWeight: function () { // 计量重量
				let sum = 0
				for (let i in this.computeList) {
					if (!this.computeList[i].realWeight) {
						sum += 0
					} else {
						sum += parseFloat(this.computeList[i].realWeight)
					}
				}
				if (!sum) sum = 0
				return sum
			},
		},
		methods:{
			openHang:function(material){
				if(!this.hangPover){
					this.hangPover = true
				}else{
					this.hangPover = false
				}
			},
			openComputation:function(material){
				if (this.popover === false) {
					this.compute.id = material.id
					this.compute.counterpoise = material.counterpoise
					this.compute.countWeightMode = material.countWeightMode
					this.compute.countWeightModeDesc = material.countWeightModeDesc
					this.compute.materialDesc = material.materialDesc
					this.compute.packageNo = material.packageNo
					this.compute.warehousePlaceId = material.warehousePlaceId
					this.compute.warehousePlaceName = material.warehousePlaceName
					this.compute.receivableNum = material.receivableNum
					this.compute.receivableWeight = material.receivableWeight
					this.compute.workNum = 0
					this.compute.workWeight = 0
					this.compute.col = 0
					this.compute.row = 0
					this.popover = true
					if(this.crane.relStatus=='0'){
						this.compute.hangWeight = '吊磅异常'
					}
					this.getComputeList(material.id)
					this.getPlaceSubList()
				} else {
					this.popover = false
					this.computeList = []
				}
			},
			openTip:function(){
				if (this.popoverSure === false) {
					this.tipContent = ''
					let key = true
					for(let i=0;i<this.allInfo.detailList;i++){
						if(this.allInfo.detailList[i].isWeight!='1'){
							key = false
							break;
						}
					}
					if(!key){
						this.tipContent += '有未计量的明细,'
					}
					if(this.allSureNum!=this.allRecNum){
						this.tipContent += '实收数量与应收数量不一致,'
					}
					this.tipContent += '是否确认提交？'
					this.popoverSure = true
				} else {
					this.popoverSure = false
				}
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
				if(!self.compute.warehousePlaceId){
					m.toast('请先选择库位！')
					return
				}
				// if(self.compute.countWeightMode!='01'){
					// console.log(self.compute.counterpoise)
					// console.log(self.compute.workNum)
				// }
				let obj = {}
				obj.id = self.compute.id
				obj.realNum = self.compute.workNum || 0
				obj.realWeight = self.compute.workWeight || 0
				obj.materialDesc = self.compute.materialDesc || ''
				obj.hangTime = timestampToTime(new Date())
				self.computeList.push(obj)
			},
			isWarning:function(){
				
			},
			clearComp:function(){
				let self = this
				self.computeList = []
			},
			clearRemoteComp:function(id){
				var self = this
				var relPath = '/api/rowcar/deleteProCraneLogList';
				m.ajax(app.api_url + relPath, {
					data:{ billDetailId: id },
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 60000, // 超时时间设置为1分钟
					success: function (data) {
						m.toast('保存成功')
						self.openComputation()
						self.toRefresh(self.activePlat)
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			sureCompute:function(){
				var self = this
				var relPath = '/api/rowcar/saveProCraneLogList'
				let list = []
				for(let i = 0 ; i<self.computeList.length ; i++){
					let obj = {}
					obj.deviceId = self.activePlat
					obj.deviceName = '行车' + self.activePlat
					obj.operType = self.allInfo.operType || ''
					obj.taskId = self.allInfo.taskId || ''
					obj.billCode = self.allInfo.receivingCode
					obj.billDetailId = self.computeList[i].id
					obj.weightTime = self.computeList[i].hangTime
					obj.warehousePlaceName = self.computeList[i].warehousePlaceName
					obj.warehouseId = self.computeList[i].warehouseId
					obj.materialDesc = self.computeList[i].materialDesc
					obj.num = self.computeList[i].realNum
					obj.weight = self.computeList[i].realWeight
					obj.status = self.allInfo.status || ''
					obj.isSingleWarning = '0'
					obj.isDel = '0'
					list.push(obj)
				}
				if(list.length<1){
					self.clearRemoteComp(self.compute.id)
					return
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
							self.toRefresh(self.activePlat)
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			getPlaceSubList: function() { // 全部库位
				var self = this
				var relPath = '/api/tspad/getWarehousePlaceList';
				m.ajax(app.api_url + relPath, {
					data:{ platformId: self.activePlat },
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 60000, // 超时时间设置为1分钟
					success: function (data) {
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
						if(list.length<1){
							list.push({id:self.compute.warehousePlaceId,text:self.compute.warehousePlaceName})
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
			getComputeList: function(id) {
				var self = this
				var relPath = '/api/rowcar/selectProCraneLogList';
				m.ajax(app.api_url + relPath, {
					data:{ billDetailId: id },
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 60000, // 超时时间设置为1分钟
					success: function (data) {
						if(data&&data.length>0){
							self.computeList = []
							for(let i=0;i<data.length;i++){
								let obj = {}
								obj.id = data[i].billDetailId
								obj.realNum = data[i].num
								obj.realWeight = data[i].weight
								obj.materialDesc = data[i].materialDesc
								obj.hangTime = data[i].createDate
								self.computeList.push(obj)
							}
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			onSure:function(){
				let self = this
				let data = {}
				data.taskId = self.allInfo.taskId || '' 
				data.platformId = self.activePlat
				if(self.allInfo.detailList&&self.allInfo.detailList.length>0){
					let list = JSON.parse(JSON.stringify(self.allInfo.detailList))
					for(let i=0 ;i<list.length;i++){
						list[i].columnId = '0'
						list[i].storeyNo ='0'
						list[i].xc= 0
						list[i].yc= 0
						list[i].zc= 0
					}
					data.jsonData = JSON.stringify(list)
					let waiting = plus.nativeUI.showWaiting()
					let relPath = '/api/rowcar/receiveConfirmComplete'
					m.ajax(app.api_url + relPath, {
						data:data,
						dataType: 'json', // 服务器返回json格式数据
						type: 'POST', // HTTP请求类型
						timeout: 60000, // 超时时间设置为1分钟
						success: function (data) {
							waiting.close();
							if(data.status){
								m.toast('保存成功')
								self.back();
							}
						},
						error: function(xhr, type, errorThrown) {
							waiting.close();
							m.toast('网络连接失败，请稍后重试')
						}
					})
				}else{
					m.toast('改月台下无作业')
				}
			},
			setTitle:function(type){
				this.type = type
				switch(type){
					case "1":
					this.pageTitle = '入库作业';	break;
					case "2":
					this.pageTitle = '出库作业'; break;
					case "3":
					this.pageTitle = '行车作业'; break;
				}
			},
			// 刷新页面数据
			toRefresh:function(id){
				let self = this
				let waiting = plus.nativeUI.showWaiting()
				m.ajax(app.api_url + '/api/rowcar/getPlatformTaskByPlatformId', {
					data: { platformId: id },
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						waiting.close();
						if(res.code==='200'){
							self.activePlat = id
							self.allInfo = res.data
							self.type=res.resultType;
							aboutVue.setTitle(res.resultType)
						}else{
							m.toast(res.msg)
						}
					},
					error: function(xhr, type, errorThrown) {
						waiting.close();
						m.toast('网络异常，请稍候重试')
					}
				});
			},
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
			gotoNav:function(id){
				this.toRefresh(id)
			},
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
			};
			//获得消息事件
			craneWebSocket.onmessage = function(msg) {
				m.toast('收到消息')
				console.log('——————————————————————receive')
				console.log(JSON.stringify(msg))
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