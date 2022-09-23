define(function(require, module, exports) {
	var m = require("mui")
	var app = require("app")
	var Vue = require("vue")
	var $ = require("jquery")
	require("layui");
	var select2 = require("select2")
	var cameraJs = require("../../common/camera/js/camera.js");
	require("../../../js/common/common.js")
	var layer = null;
	layui.use(['layer'], function() {
		layer = layui.layer;
	});
	function formatState(state) {
	    var $state = $(
		  '<div style="position: relative;z-index: 4;font-size: 13px;display: block;border-bottom: 1px solid #ebebeb;background: white;opacity: 1;padding: 10px 0 10px 15px;margin: 0;">' + state.text + '</div>'
	    )
	    return $state
	}
	m.plusReady(function() {
		m.init({
			statusBarBackground: '#f7f7f7',
			swipeBack: false, //启用右滑关闭功能
			beforeback: function() {
				var webView = plus.webview.currentWebview().opener()
				mui.fire(webView, 'refresh')
				return true
			}
		})
		globalVue.crane = app.getCrane()
		globalVue.computation.warehouseId = app.getUser().warehouse.id
		globalVue.computation.deviceName = globalVue.crane.deviceName
		ws = plus.webview.currentWebview()
		globalVue.allInfo = ws.allInfo
		globalVue.allInfo.materialList = globalVue.upList(ws.allInfo.materialList)
		globalVue.taskId = ws.taskId
		globalVue.reMark = ws.allInfo.remarks || ''
		globalVue.sendType = ws.allInfo.sendType
		if(globalVue.sendType=='2'){
			globalVue.getShopCartList()
		}
		globalVue.getWorkList(globalVue.allInfo.workloadList)
		globalVue.getBrand()
		globalVue.initImageList(globalVue.allInfo.attacheFileIds)
	})
	
	var globalVue = new Vue({
		el: "#app",
		data: {
			crane: {}, // 当前选择的行车
			allInfo: {}, // 所有信息
			taskId: '', // 任务id
			materialList: [], // 物料列表
			workList: [], // 工作量列表
			humanWorkList: [], // 人工添加的工作量列表
			brandList: [], // 品名列表
			currentType: '', // 当前计量类型
			computation: { // 计重对象
				materialDesc: '',
				sendNum: '',
				sendWei: '',
				warehousePlaceId: '',
				warehousePlaceName: '',
				subPlaceId: '',
				subPlaceName: '',
				num: 1,
				warehouseId: '',
				deviceId: '',
				deviceName: '',
				taskId: '',
				billDetailId: '',
			},
			average: 0, // 平均重量
			compList: [], // 计重列表
			popover: false, // 弹窗控制
			trueWeight: '未连接', // 吊磅重量
			inputWeight: 0, // 输入重量
			popoverSure: false, // 确认弹窗控制
			tipContent: '', // 提醒内容
			sendType: '',
			showReservedList:[], // 已选库存列表
			reservedList:[],
			num:0, //应发数量
			realNum:0,//实发数量
			weight:0, //应发重量
			limitNum: 0,//实物数量
			detail:{},
			activeItem: -1 ,//当前活动物料
			activeAll: -1 ,//当前活动汇总
			outputNum: 0 ,  //已计量个数
			showJl: false,  //是否展示计量消息
			lengthSearch:'',
			showChooseCrane:false,//是否展示选择库位和垛位
			popoverShop:false,//是否显示购物车
			shopList:[],//购物车列表
			wPId: '', //库位ID
			wPName:'',//库位名字
			sPId: '', //垛位ID
			sPName:'',//垛位名字
			reMark: '',//备注
			showWPName:'',
			showWPId:'',
			showSPName:'',
			showSPId:'',
			changeRes:false,//是否显示换货后的结果
			imagesFiles:[],//附件列表
			delFileIds:[], //删除的附件
			attacheFileIds:[], //添加的附件
			countMode:false,//计量方式:理计false,磅计true
			isRealWeight:false,//是否磅出
		},
		methods: {
			isSelect:function(callback){ //判断当前是否有行车
				m.ajax(app.api_url + '/api/ctpad/isSelected', {
					data: {},
					dataType: 'json',
					type: 'get',
					timeout: 10000,
					success:(res)=>{
						if (res.sysDevice) {
							if(typeof callback == 'function'){
								callback()
							}
						} else {
							m.alert('请先选择行车')
							m.openWindow({
								id: 'openCraneManage',
								"url": '../../crane-index/html/crane-index.html',
								show: {},
								waiting: {
									autoShow: true
								},
								extras: {}
							});
						}
					},
					error: (xhr, type, errorThrown)=>{
						m.toast("网络异常，请重新试试");
					}
				})
			},
			initImageList:function(fileIds){
				if(!fileIds)return
				let self = this
				self.imagesFiles = []
				let fileList = fileIds.split(',') || []
				if(fileList.length>0){
					for(let i in fileList){
						let newFile = new Object();
						newFile.id = fileList[i];
						newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id + '&token=' + app.getToken();
						newFile.fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id + '&token=' + app.getToken();
						this.imagesFiles.push(newFile)
					}
				}
			},
			folder:function(e,str,num){
				let elem = $(e.target).prev()[0]
				if(e.target.innerText=='展开'){
					e.target.innerText='收起'
					elem.innerText = str
				}else{
					e.target.innerText='展开'
					elem.innerText = str.substring(0,num)+'...'
				}
			},
			openFile: function (fileId){
				var filePath = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&fileId=' + '' + fileId + '&token=' + app.getToken();
				if(app.debug) {
					console.log("RiskfilePath:" + filePath);
				}
				if(m.os.android) {
					plus.nativeUI.previewImage([filePath],{
						background:'#FFFFFF',
					});
				} else {
					plus.runtime.openURL(filePath, function(error) {
						m.toast("无法下载和打开此附件，请检查附件地址是否正确");
					}, '');
				}
			},
			delFile: function(fileId){
				const self = this
				plus.nativeUI.confirm('确定删除？', function(f) {
					if (f.index == 1) {
						let newId = false
						self.imagesFiles.forEach((val,index)=>{
							if(val.id==fileId){
								self.imagesFiles.splice(index,1)
							}
						})
						self.attacheFileIds.forEach((val,index)=>{
							if(val===fileId){
								newId = true
								self.attacheFileIds.splice(index,1)
							}
						})
						if(!newId){
							self.delFileIds.push(fileId)
						}
					}
				}, '提示', ['取消', '确定']);
			},
			tempSaveOutput:function(){//暂存
				m.back()
				var self = this
				m.ajax(app.api_url + '/api/ctpad/tempSaveOutput', {
					data: {
						'taskId':self.allInfo.id,
						'remarks':self.reMark,
					},
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 20000, // 超时时间设置为2分钟
					success: function (data) {
						if(data.status){
							m.toast(data.msg)
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			sureChange:function(){
				let self = this
				self.changeRes = true
				self.showChooseCrane = false
				self.showWPName = self.wPName
				self.showSPName = self.sPName
				self.showWPId = self.wPId
				self.showSPId = self.sPId
				self.getMaterial(self.detail,self.activeAll,self.wPId,self.sPId,true,true)
			},
			getShopCartList:function(){
				var self = this
				m.ajax(app.api_url + '/api/ctpad/getShopCartList', {
					data: {
						'flag':'2',
						'taskId':self.allInfo.id,
						'workCraneIds':self.crane.workCraneIds,
					},
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 20000, // 超时时间设置为2分钟
					success: function (data) {
						self.shopList = []
						let list = data || []
						if(list.length>0){
							list.forEach((val)=>{
								self.shopList.push(val)
							})
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			debounce: function (fn,delay){
				let delays=delay||500;
				return ()=>{
				    let th=this;
				    let args=arguments;
				    if (this.timer) {
				        clearTimeout(this.timer);
				    }
				    this.timer=setTimeout(function () {
				            this.timer=null;
				            fn.apply(th,args);
				    }, delays);
				};
			},
			openShop:function(){
				let self = this
				if(self.popoverShop){
					self.popoverShop = false
				}else{
					self.popoverShop = true
				}
			},
			changeDetail: function(){
				this.isSelect(()=>{
					let self = this
					if(self.showChooseCrane){
						self.showChooseCrane = false
					}else{
						self.showChooseCrane = true
						self.getLocationList()
					}
				})
			},
			getMaterial: function (data,idx,warehousePlaceId,subPlaceId,change,update,getRealNum) {
				this.isSelect(()=>{
					var self = this
					if(change){
						self.changeRes = true
					}else{
						self.changeRes = false
					}
					self.activeAll = idx
					self.num = data.workNum
					if(!getRealNum){
						self.realNum = data.realNum
					}
					self.weight = data.workWeight
					self.computation.sendDetailId = data.sendDetailId
					self.computation.deviceId = data.craneId
					self.detail = Object.assign({},data)
					self.computation.warehousePlaceId = data.warehousePlaceId
					self.computation.warehousePlaceName = data.warehousePlaceName
					self.computation.subPlaceId = data.subPlaceId
					self.computation.subPlaceName = data.subPlaceName
					var waiting = plus.nativeUI.showWaiting()
					m.ajax(app.api_url + '/api/ctpad/getMergeInventoryList', {
						data: {
							'warehousePlaceId':warehousePlaceId || '',
							'subPlaceId':subPlaceId || '',
							'detailId': data.id,
							'flag':'2',
						},
						dataType: 'json', // 服务器返回json格式数据
						type: 'POST', // HTTP请求类型
						timeout: 20000, // 超时时间设置为2分钟
						success: function (res) {
							let data = res.inventoryList || []
							self.reservedList = self.upList(data)
							self.showReservedList = self.reservedList
							if(res.retMsg){
								self.showJl = true
								setTimeout(()=>{
									self.showJl = false
								},8000)
								self.updateData()
							}
							if(update){
								self.updateData()
							}
							waiting.close()
						},
						error: function(xhr, type, errorThrown) {
							waiting.close()
							m.toast('网络连接失败，请稍后重试')
						}
					})
				})
			},
			upList:function (list) {
				let arr = []
				let arrMid = []
				let arrEnd = []
				list.forEach((val,i)=>{
					if(val.isWeight=='1'){
						arrEnd.push(val)
					}else if(val.isUsed=='1'){
						arrMid.push(val)
					}else{
						arr.push(val)
					}
				})
				arrMid.forEach((val)=>{
					arr.push(val)
				})
				arrEnd.forEach((val)=>{
					arr.push(val)
				})
				return arr
			},
			openComputation: function (id, status, operType, desc, num, wei, average, type,billDetailId,material,index,outputNum) { // 打开计量弹出框
				this.isSelect(()=>{
					if (this.popover === false) {
						this.popover = true
						this.isRealWeight = false
						this.inputWeight = 0
						this.activeItem = index
						this.computation.materialDesc = desc
						this.computation.taskId = this.taskId
						this.computation.billDetailCode = this.allInfo.taskCode
						this.average = average
						this.currentType = type
						this.enterWeight = material.counterpoise
						this.computation.num = 1
						if(type){
							this.countMode = (type=='理计' ? false: true)
						}
						if(this.changeRes){
							this.computation.warehousePlaceId = this.showWPId
							this.computation.warehousePlaceName = this.showWPName
							this.computation.subPlaceId = this.showSPId
							this.computation.subPlaceName = this.showSPName
						}
						if(this.sendType=='2'){
							this.outputNum = parseFloat(outputNum) || 0
							this.limitNum = num
							this.computation.sendNum = this.num
							this.computation.sendWei = this.weight
							this.computation.inventoryId = id
							if(billDetailId){
								this.computation.billDetailId = billDetailId
							}else{
								this.computation.billDetailId = '0'
							}
							this.getComputation(this.computation.billDetailId, status, operType)
						}else{
							this.limitNum = num
							this.computation.deviceId = material.craneId
							this.computation.sendNum = num
							this.computation.sendWei = wei
							this.computation.billDetailId = id
							this.computation.warehousePlaceId = material.warehousePlaceId
							this.computation.warehousePlaceName = material.warehousePlaceName
							this.computation.subPlaceId = material.subPlaceId
							this.computation.subPlaceName = material.subPlaceName
							this.getComputation(this.computation.billDetailId, status, operType)
						}
					} else {
						this.activeItem = -1
						this.currentType = ''
						this.popover = false
					}
				})
			},
			openTip: function () { // 打开提示框
				this.isSelect(()=>{
					if(this.sendType=='2'){
						if (this.shopList.length>0&&this.workList.length === 0&&this.humanWorkList.length === 0){
							layer.msg("请先录入工作量")
							return
						}
					}else{
						if (this.allNum>0&&this.workList.length === 0&&this.humanWorkList.length === 0){
							layer.msg("请先录入工作量")
							return
						}
					}
					if (this.popoverSure === false) {
						
						let text = ''
						if(this.allNum < this.allShouldNum){
							text += '<span>实发数量和应发数量不一致</span>,'
						}
						
						for (let i in this.allInfo.materialList) {
							if (!this.allInfo.materialList[i].realWeight) {
								text += '存在物料未计重,'
								break;
							}
						}
						this.tipContent = text + '是否确认提交？'
						this.popoverSure = true
					} else {
						this.popoverSure = false
					}
				})
			},
			openWorkTip: function () { // 提醒工作量
				m.toast('如果出现人员选项和当前列表中的人员存在不一致的情况，请确认班组配置！')
			},
			updateData: function () { // 更新数据
				var self = this
				// var waiting = plus.nativeUI.showWaiting()
				m.ajax(app.api_url + '/api/ctpad/getWarningTaskData', {
					data: {
						'isReload': 0,
						'taskId': self.taskId,
					},
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 20000, // 超时时间设置为2分钟
					success: function (data) {
						if (data.retMsg) {
							m.toast(data.retMsg)
						}
						self.allInfo = data
						self.allInfo.materialList = self.upList(data.materialList)
						self.getWorkList(self.allInfo.workloadList)
						if(self.detail.id){
							if(self.changeRes){
								self.getMaterial(self.detail,self.activeAll,self.showWPId,self.showSPId,self.changeRes,false,true)
							}else{
								self.getMaterial(self.detail,self.activeAll,'','',self.changeRes,false,true)
							}
						}
						if(self.sendType=='2'){
							self.getShopCartList()
						}
						self.realNum = self.allInfo.materialList[self.activeAll].realNum
						// waiting.close()
					},
					error: function(xhr, type, errorThrown) {
						// waiting.close()
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			getLocationList: function () { // 获取库位列表
				var self = this
				var localWarehouse = {id:parseInt(self.detail.warehousePlaceId),text:self.detail.warehousePlaceName}
				// var relPath = '/api/sysBusinessBasis/placeInfos?craneId=' + self.crane.id
				var relPath = '/api/ctpad/invPlaceInfos?detailId=' + self.allInfo.materialList[self.activeAll].id + '&placeName='
				var waiting = plus.nativeUI.showWaiting()
				m.getJSON(app.api_url + relPath, function(data) {
					if (!data || data.length === 0) {
						m.toast('当前行车没有库位和垛位,请重新选择行车')
						waiting.close()
					}
					let flag = false
					for(let i in data){
						if(data[i].id==localWarehouse.id){
							flag = true
						}
					}
					if(!flag&&localWarehouse.id){
						data.splice(0,0,localWarehouse)
					}
					$('.q-subPlaceInput-name').select2({
						templateResult: formatState,
						data: data,
						placeholder: '请选择库位'
					})
					self.wPId= localWarehouse.id
					self.wPName = localWarehouse.text
					$(".q-subPlaceInput-name").val([localWarehouse.id]).trigger("change")
					$(".q-subPlaceInput-name").on("select2:select", function (e) {
						self.wPId = e.params.data.id
						self.wPName = e.params.data.text
						self.getButtressList(e.params.data.id)
					})
					waiting.close()
					self.getButtressList(localWarehouse.id)
				})
			},
			getButtressList: function (id) { // 获取垛位列表
				var self = this
				var localPlace = {id:parseInt(self.detail.subPlaceId),text:self.detail.subPlaceName}
				// var relPath = '/api/sysBusinessBasis/subPlaceInfos?warehousePlaceId=' + id
				var relPath = '/api/ctpad/invSubPlaceInfos?detailId=' + self.allInfo.materialList[self.activeAll].id + '&placeId=' + id
				var waiting = plus.nativeUI.showWaiting()
				m.getJSON(app.api_url + relPath, function (data) {
					waiting.close()
					let instance = $('.q-subPlaceSonInput-name').data('select2')
					if (instance) {
					    $('.q-subPlaceSonInput-name').select2('destroy').empty()
					}
					$('.q-subPlaceSonInput-name').select2({
						templateResult: formatState,
						data: data,
						placeholder: '请选择垛位'
					})
					let flag = false
					for(let i in data){
						if(data[i].id==localPlace.id){
							flag = true
							break
						}
					}
					if(flag){
						self.sPId = localPlace.id
						self.sPName = localPlace.text
						$(".q-subPlaceSonInput-name").val([localPlace.id]).trigger("change")
					}else{
						self.sPId = data[0].id
						self.sPName = data[0].text
					}
					$(".q-subPlaceSonInput-name").on("select2:select", function (e) {
						self.sPId = e.params.data.id
						self.sPName = e.params.data.text
					})
				})
			},
			getBrand: function () { // 获取品名
				var self = this
				var relPath = '/api/sysBusinessBasis/materialConditions'
				m.getJSON(app.api_url + relPath, function(data) {
					self.brandList = data.brandList
				})
			},
			getComputation: function (id, status, operType) { // 获取计量数据
				var self = this
				var waiting = plus.nativeUI.showWaiting()
				m.ajax(app.api_url + '/api/ctpad/selectProCraneLogList', {
					data: {
						billDetailId: id,
						taskId: self.taskId,
						status: status,
						operType: operType,
						deviceId: self.computation.deviceId,
					},
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 20000, // 超时时间设置为2分钟
					success: function (data) {
						self.compList = JSON.parse(JSON.stringify(data))
						for (let i in self.compList) {
							let d = new Date(self.compList[i].weightTime)
							self.compList[i].weightTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + ':' + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + ':' + (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds())
						}
						waiting.close()
					},
					error: function(xhr, type, errorThrown) {
						waiting.close()
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			computeNum: function (type) { // 加减实发件数
				if (type === '+') {
					// if (this.computation.num = '') this.computation.num = 1
					if (typeof this.computation.num !== 'number') this.computation.num = parseInt(this.computation.num)
					this.computation.num += 1
				} else if (type ===  '-') {
					this.computation.num -= 1
					if (this.computation.num < 0) {
						m.toast('实发数量不能小于0')
						this.computation.num = 0
					}
				}
			},
			addCompList: function (type) { // 添加计量列表
				let comp = JSON.parse(JSON.stringify(this.computation))
				if(parseInt(comp.num.toString().indexOf("."))>=0){
					m.toast('起吊数量请输入0或正整数')
					return
				}
				if(comp.num<0){
					m.toast('起吊数量请输入0或正整数')
					return
				}
				if(comp.num > this.limitNum){
					m.toast('起吊数量不能大于实物数量')
					return
				}
				let reWeight = ''
				if (type) {
					reWeight = this.enterWeight + ''
				} else {
					reWeight = this.inputWeight + ''
				}
				comp.weight = parseFloat(reWeight.substring(0,reWeight.indexOf(".") + 4));
				// if (!comp.weight) {
				// 	m.toast('请先获取重量')
				// } 
				if (!comp.warehousePlaceId) {
					m.toast('请先选择库位')
				} else if (!comp.subPlaceId) {
					m.toast('请先选择垛位')
				} else {
					let d = new Date()
					comp.weightTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + ':' + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + ':' + (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds())
					this.compList.push(comp)
				}
			},
			clean: function () { // 清楚数据
				this.compList = []
				// this.getLocationList()
			},
			sureCompute: function () { // 确定计量
				this.isSelect(()=>{
					var self = this
					if(self.sendType=='1'){
						if (self.compList.length === 0) {
							m.toast('没有计量数据，无法提交，请先确认')
							return
						}
					}else{
						if(self.num<self.allCompNum+self.realNum-self.outputNum){
							m.toast('实发数量不能大于应发数量')
							return
						}
					}
					let compListCopy = JSON.parse(JSON.stringify(self.compList))
					if (compListCopy.length === 0) {
						compListCopy.push(JSON.parse(JSON.stringify(self.computation)))
						compListCopy[0].num = self.allInfo.sendType=='1' ? 0 : -1
						compListCopy[0].weight = 0
					}
					let isNone = false
					for (let i in compListCopy) {
						compListCopy[i].billCode = self.allInfo.taskCode
						if (compListCopy[i].num == 0) {
							compListCopy[i].num = self.allInfo.sendType=='1' ? 0 : -1
							isNone = true
							if(self.allInfo.sendType=='1'&&self.compList.length<1){
								isNone = false
							}
						}
					}
					if (isNone) {
						m.confirm('当前列表中存在计重数量为0件的物料，提交后所有计量数据都将作废，是否确定计量？', '温馨提示', ['是', '否'], function (e) {
							if (e.index == 0) {
								var waiting = plus.nativeUI.showWaiting()
								m.ajax(app.api_url + '/api/ctpad/saveProCraneLogList', {
									data: {
										'jsonData': JSON.stringify(compListCopy),
										'flag': '2',
										'operType': '2',
										'weightFlag': self.isRealWeight ?'1':'0',
									},
									dataType: 'json', // 服务器返回json格式数据
									type: 'POST', // HTTP请求类型
									timeout: 20000, // 超时时间设置为2分钟
									success: function (data) {
										m.toast(data.msg)
										if (data.status === true) {
											self.openComputation()
											self.updateData()
											self.clean()
											self.computation = {
												materialDesc: '',
												sendNum: '',
												sendWei: '',
												warehousePlaceId: '',
												warehousePlaceName: '',
												subPlaceId: '',
												subPlaceName: '',
												num: 1,
												warehouseId: app.getUser().warehouse.id,
												deviceId: self.crane.id,
												deviceName: self.crane.deviceName,
												taskId: self.taskId,
												billDetailId: '',
											}
										}
										waiting.close()
									},
									error: function(xhr, type, errorThrown) {
										waiting.close()
										m.toast('网络连接失败，请稍后重试')
									}
								})
							}
						})
					} else {
						var waiting = plus.nativeUI.showWaiting()
						m.ajax(app.api_url + '/api/ctpad/saveProCraneLogList', {
							data: {
								'jsonData': JSON.stringify(compListCopy),
								'flag': '2',
								'operType': '2',
								'weightFlag': self.isRealWeight ?'1':'0',
							},
							dataType: 'json', // 服务器返回json格式数据
							type: 'POST', // HTTP请求类型
							timeout: 20000, // 超时时间设置为2分钟
							success: function (data) {
								m.toast(data.msg)
								if (data.status === true) {
									self.openComputation()
									self.updateData()
									self.clean()
									self.computation = {
										materialDesc: '',
										sendNum: '',
										sendWei: '',
										warehousePlaceId: '',
										warehousePlaceName: '',
										subPlaceId: '',
										subPlaceName: '',
										num: 1,
										warehouseId: app.getUser().warehouse.id,
										deviceId: self.crane.id,
										deviceName: self.crane.deviceName,
										taskId: self.taskId,
										billDetailId: '',
									}
								}
								waiting.close()
							},
							error: function(xhr, type, errorThrown) {
								waiting.close()
								m.toast('网络连接失败，请稍后重试')
							}
						})
					}
				})
			},
			getWorkList: function (arr) { // 解析工作量列表
				let tempArr = []
				let tempObj = []
				let copyArr = []
				let idx
				let idArr = []
				let nameArr = []
				this.workList = []
				for (let i in arr) {
					copyArr = JSON.parse(JSON.stringify(arr[i]))
					tempObj = arr[i].groupNo
					if (tempArr.indexOf(tempObj) === -1) {
						tempArr.push(tempObj)
						copyArr.createBy = ''
						copyArr.updateBy = ''
						idArr = copyArr.users.split(',')
						copyArr[copyArr.worktypeId] = []
						for (let i in idArr) {
							copyArr[copyArr.worktypeId].push([idArr[i]])
						}
						nameArr = copyArr.usersName.split(',')
						copyArr[copyArr.worktypeName] = []
						for (let i in nameArr) {
							copyArr[copyArr.worktypeName].push([nameArr[i]])
						}
						if (!copyArr.workNum) copyArr.workNum = 0
						if (!copyArr.workload) copyArr.workload = 0
						delete copyArr.users
						delete copyArr.usersName
						delete copyArr.worktypeId
						delete copyArr.worktypeName
						this.workList.push(copyArr)
					} else {
						idx = tempArr.indexOf(tempObj)
						this.workList[idx][copyArr.worktypeId] = copyArr.users.split(',')
						this.workList[idx][copyArr.worktypeName] = copyArr.usersName.split(',')
					}
				}
			},
			// toWorkTab: function () { // 跳转到工作量页面
			// 	document.getElementById("a_work").click()
			// 	this.takeToWork()
			// 	this.openTip()
			// },
			sure: function () { // 确定按钮提交表单
				this.isSelect(()=>{
					var self = this
					let worktypeList = []
					let sendId = ''
					if(self.allInfo.materialList.length>0){
						sendId = self.allInfo.materialList[0].sendId
					}
					if (this.allInfo.worktypeList) {
						worktypeList = JSON.parse(JSON.stringify(this.allInfo.worktypeList))
					}
					if(self.workList.length>0){
						for(let i in self.humanWorkList){
							self.humanWorkList[i].ownerId = self.workList[0].ownerId
						}
					}
					let wkL = JSON.parse(JSON.stringify(self.workList.concat(self.humanWorkList)))
					let workParams = []
					let workParamsPass = true
					let userPass = false
					if (wkL.length !== 0) {
						for (let i in wkL) {
							userPass = false
							for (let j in worktypeList) {
								wkL[i][worktypeList[j].id] = wkL[i][worktypeList[j].id] ? wkL[i][worktypeList[j].id].join(',') : ''
								if (wkL[i][worktypeList[j].id]) userPass = true
								wkL[i][worktypeList[j].worktypeName] = wkL[i][worktypeList[j].worktypeName] ? wkL[i][worktypeList[j].worktypeName].join(',') : ''
								if (wkL[i][worktypeList[j].id]) {
									workParams.push({
										groupNo: parseInt(i) + 1,
										ownerId: wkL[i].ownerId,
										brandId: wkL[i].brandId,
										sendId: sendId,
										materialDesc: wkL[i].materialDesc,
										workload: wkL[i].workload,
										workNum: wkL[i].workNum,
										users: wkL[i][worktypeList[j].id],
										usersName: wkL[i][worktypeList[j].worktypeName],
										worktypeId: worktypeList[j].id,
										craneId: wkL[i].craneId,
										billCode: wkL[i].billCode,
										ownerId: wkL[i].ownerId,
									})
								}
							}
						}
					}
					if (!userPass&&self.shopList.length>0) {
						workParamsPass = false
						m.toast('每一列至少要有一个工种选择了员工')
					}
					if (workParams.length > 0) {
						for (let i in workParams) {
							if (!workParams[i].materialDesc) {
								workParamsPass = false
								m.toast('存在品名未选择')
								break
							}
							if (workParams[i].workload != 0 && !workParams[i].workload) {
								workParamsPass = false
								m.toast('存在工作重量未填写')
								break
							}
							if (workParams[i].workNum != 0 && !workParams[i].workNum) {
								workParamsPass = false
								m.toast('存在工作量未填写')
								break
							}
						}
					}
					if (workParamsPass) {
						var waiting = plus.nativeUI.showWaiting()
						m.ajax(app.api_url + '/api/ctpad/warnTaskComplete', {
							data: {
								'taskId': self.taskId,
								'jsonData': JSON.stringify(workParams),
								'remarks': self.reMark,
								'attacheFileIds': self.attacheFileIds.join(','),
								'delFileIds':self.delFileIds.join(',')
							},
							dataType: 'json', // 服务器返回json格式数据
							type: 'POST', // HTTP请求类型
							timeout: 20000, // 超时时间设置为2分钟
							success: function (data) {
								m.toast(data.msg)
								if (data.status === true) {
									m.back()
								}
								waiting.close()
							},
							error: function(xhr, type, errorThrown) {
								waiting.close()
								m.toast('网络连接失败，请稍后重试')
							}
						})
					}
				})
			},
			close: function () { // 关闭当前页面
				m.back()
			},
			getName: function (arr, dic, obj, objName) {
				let name = []
				for (let i in arr) {
					for (let j in dic) {
						if (arr[i] === dic[j].workUserId) {
							name.push(dic[j].workUserName)
						}
					}
				}
				Vue.set(obj, objName, name)
			},
			getBrandName: function (obj) {
				for (let i in this.brandList) {
					if (obj.brandId === this.brandList[i].id) {
						// obj.brandName = this.brandList[i].text
						Vue.set(obj, 'materialDesc', this.brandList[i].text)
					}
				}
			},
			addWorkHumanList: function () {
				this.humanWorkList.push({
					workNum: 0,
					workload: 0,
					craneId: this.crane.id,
					billCode: this.allInfo.taskCode,
					ownerId: this.allInfo.materialList[0].ownerId,
				})
			},
			deleteHumanWork: function (idx) {
				this.humanWorkList.splice(idx, 1)
			},
			openAndclose: function(idx,val){
				var openOrClose =$('.openAndClose')[idx].innerText
				if (openOrClose =='展开'){
					$('.openAndCloseValue')[idx].innerText=val;
					$('.openAndClose')[idx].innerText = '收起'
				}else {
					$('.openAndCloseValue')[idx].innerText=val.substring(0,23)+"...";
					$('.openAndClose')[idx].innerText = '展开'
				}
			},
		},
		computed: {
			allShouldNum: function () { // 实发总计数量
				let sum = 0
				for (let i in this.allInfo.materialList) {
					if (!this.allInfo.materialList[i].workNum) {
						sum += 0
					} else {
						sum += parseFloat(this.allInfo.materialList[i].workNum)
					}
				}
				if (!sum) sum = 0
				return sum
			},
			allNum: function () { // 实发总计数量
				let sum = 0
				for (let i in this.allInfo.materialList) {
					sum += this.allInfo.materialList[i].realNum
				}
				if (!sum) sum = 0
				return sum
			},
			allWei: function () { // 实发总计数量
				let sum = 0
				for (let i in this.allInfo.materialList) {
					sum += this.allInfo.materialList[i].realWeight
				}
				if (!sum) sum = 0
				return toDecimal(sum)
			},
			allCompNum: function () {
				let sum = 0
				for (let i in this.compList) {
					sum += parseFloat(this.compList[i].num) || 0
				}
				if (!sum) sum = 0
				return sum
			},
			allReservedNum: function () {
				let sum = 0
				for (let i in this.reservedList) {
					sum += parseFloat(this.reservedList[i].outputNum) || 0
				}
				if (!sum) sum = 0
				return sum
			},
			allWorkNum: function () { // 工作量总计
				let sum = 0
				let wkL = JSON.parse(JSON.stringify(this.workList.concat(this.humanWorkList)))
				for (let i in wkL) {
					sum += parseFloat(wkL[i].workNum)
				}
				if (!sum) sum = 0
				return sum
			},
			allWorkWeight: function () { // 工作量重量总计
				let sum = 0
				let wkL = JSON.parse(JSON.stringify(this.workList.concat(this.humanWorkList)))
				for (let i in wkL) {
					if (wkL[i].workload) {
						sum += parseFloat(wkL[i].workload)
					} else {
						sum += 0
					}
				}
				if (!sum) sum = 0
				return toDecimal(sum)
			},
			enterWeight: function () { // 入库重量计算
				if (isNaN(parseInt(this.computation.num))) {
					m.toast('请输入整数')
					this.computation.num = 0
					return 0
				}
				return floatMul(this.average, this.computation.num)
			},
		},
		watch:{
			activeAll(val,oldVal){
				if(val==undefined){
					this.activeAll = oldVal
				}
			},
			lengthSearch(val){
				this.debounce(()=>{
					this.showReservedList = []
					this.reservedList.forEach((obj)=>{
						let n = obj.materialDesc.search(val)
						if(n>=0){
							this.showReservedList.push(obj)
						}
					})
				})();
			}
		}
	})
	
	$("#addFile").click(function() {
		plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: [{
				title: "拍照"
			}, {
				title: "手机相册"
			}]
		}, function(e) {
			if(e.index == 1) {
				cameraJs.capurteImage(function(url) {
					processPicture(url);
				});
			} else if(e.index == 2) {
				cameraJs.galleryImgs(function(e) {
					batchUpload(e.files, function(data) {});
				});
			}
		});
	});
	
	function processPicture(url) {
		plus.io.resolveLocalFileSystemURL(url, function(entry) {
				// plus.nativeUI.confirm('是否上传？', function(f) {
				// 	if (f.index == 1) {
						compressAndUploadImg(entry);
				// 	} 
				// }, '提示', ['取消', '上传']);
			},
			function(e) {
				m.alert("读取拍照文件错误：" + e.message);
			});
	}
	
	function compressAndUploadImg(entry) {
		if(app.debug) {
			console.log("compress:" + entry.toLocalURL());
		}
		plus.zip.compressImage({
			src: entry.toLocalURL(),
			dst: '_doc/' + entry.name,
			overwrite: true,
			quality: 100
		}, function(zip) {
			createUpload(zip.target, function(data) {
	
			});
		}, function(zipe) {
			m.toast('压缩失败！');
		});
	}
	
	// 创建上传任务
	function createUpload(file, callback) {
		var waiting = plus.nativeUI.showWaiting("图片上传中...", {
			back: 'transmit'
		});
		var fileServer = app.api_url + '/api/sys/file';
		var task = plus.uploader.createUpload(fileServer, {
				method: "POST",
				blocksize: 204800,
				priority: 100,
				timeout: 0
			},
			function(t, status) {
				m.toast('上传成功')
				// 上传完成
				waiting.close();
				if(status == 200) {
					var uf = JSON.parse(t.responseText);
					if(uf.length === 0) {
						console.log("没有上传文件");
						return;
					}
					var newFile = new Object();
					newFile.id = uf[0].fileId;
					newFile.fileExt = 'jpg';
					newFile.fileSize = uf[0].fileSize;
					newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id + '&token=' + app.getToken();
					newFile.fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id + '&token=' + app.getToken();
					globalVue.imagesFiles.push(newFile)
					globalVue.attacheFileIds.push(newFile.id)
				} else {
					m.toast('图片上传失败,请重新上传');
				}
				return;
			}
		);
		task.addFile(file, {
			key: "upload"
		});
		task.addData("busiType", "pro_work_task");
		task.start();
	}
	
	function batchUpload(file, callback) {
		var uploadWaiting = plus.nativeUI.showWaiting("图片上传中...", {
			back: 'transmit'
		});
		var task = plus.uploader.createUpload(app.api_url + '/api/sys/file/batchUploadImgs', {
				method: "POST",
				blocksize: 204800,
				priority: 100,
				timeout: 0
			},
			function(t, status) {
				uploadWaiting.close();
				// 上传完成			
				if(status == 200) {
					var uf = JSON.parse(t.responseText);
					if(uf.length === 0) {
						console.log("没有上传文件");
						return;
					}
					m.toast('上传成功');
					var zm = 0;
					setTimeout(showImg, 350);
	
					function showImg() {
						var newFile = new Object();
						newFile.id = uf[zm].fileId;
						newFile.fileExt = 'jpg';
						newFile.fileSize = uf[zm].fileSize;
						newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id + '&token=' + app.getToken();
						newFile.fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id + '&token=' + app.getToken();
						globalVue.imagesFiles.push(newFile)
						globalVue.attacheFileIds.push(newFile.id)
						callback(t);
						zm++;
						if(zm < uf.length) {
							setTimeout(showImg, 350);
						}
					}
				} else {
					m.toast('图片上传失败,请重新上传');
				}
			}
		);
		for(var i = 0; i < file.length; i++) {
			task.addFile(file[i], {
				key: file[i]
			});
		}
		task.addData("busiType", "pro_work_task");
		let busiId = globalVue.allInfo.id+'#1'
		task.addData("busiId",busiId)
		task.start();
	}
	
})