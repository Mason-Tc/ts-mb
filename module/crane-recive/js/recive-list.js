define(function(require, module, exports) {
	var m = require("mui")
	var app = require("app")
	var Vue = require("vue")
	var $ = require("jquery")
	var waiting = null
	var pullRefresh = null
	require("../../../js/common/select2.full.js")
	window.onload = function() {
		window.addEventListener('refresh2', function() {
			if(globalVue.isFirst){
				globalVue.isFirst = false
				globalVue.allNum = 0
				globalVue.allWei = 0
				globalVue.choosedTaskList = []
				globalVue.shopList = []
				globalVue.pullDownQuery()
			}
		})
		window.addEventListener('scanner', function(e) {
			globalVue.queryScan(e.detail.qRCode)
		})
	}
	function formatState(state) {
	    var $state = $(
		    '<div style="position: relative;z-index: 999;font-size: 13px;display: block;border-bottom: 1px solid #ebebeb;background: white;opacity: 1;padding: 10px 0 10px 15px;margin: 0;">' + state.text + '</div>'
	    );
	    return $state;
	}
	m.plusReady(function () {
		m.init({
			statusBarBackground: '#f7f7f7',
			swipeBack: false //启用右滑关闭功能
		})
	    globalVue.getCustomer()
		//待出库作业下拉&上拉刷新
		pullRefresh = m('.mui-scroll-wrapper').pullRefresh({
			down: {
				contentrefresh: '加载中...',
				callback: function() {
					globalVue.pullDownQuery()
				}
			},
			up: {
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				callback: function() {
					globalVue.pullUpQuery()
				}
			}
		});
		var backDefault = m.back;
		function detailBack() {
			if(waiting) {
				waiting.close();
			}
			backDefault();
		}
		m.back = detailBack;
	})
	var globalVue = new Vue({
		el: "#app",
		data: {
			isFirst:false,
			taskWaitList: [], // 待入库作业列表
			completeTask: null, // 确认收货的对象
			choosedTaskList: [], // 已选择的作业列表
			shopList: [], // 收纳篮列表
			allChecked: false,
			allNum: 0,
			allWei: 0,
			popoverSure: false,
			popoverShop: false,
			searchObj: {
				forecastCode:'',
				carPlateNos:'',
				ownerId:'',
				brandId:'',
				specificationId:'',
				textureId:'',
				placesteelId:'',
				packageNo:'',
			},
			pageNo:1,
			pageSize:5,
		},
		methods: {
			pullUpQuery: function(){ //上拉刷新
				var self = this
				self.pageNo = self.pageNo + 1;
				self.onSearch(()=>{
					pullRefresh.endPullupToRefresh();
				});
			},
			pullDownQuery: function(){ //下拉刷新
				var self = this
				self.pageNo = 1;
				self.onSearch(()=>{
					pullRefresh.endPulldownToRefresh();
					pullRefresh.scrollTo(0, 0, 100);
					pullRefresh.refresh(true);
				});
			},
			getCustomer: function () { // 获取货主名称
				var self = this
				var relPath = '/api/sysBusinessBasis/customerInfo'
				waiting = plus.nativeUI.showWaiting()
				m.getJSON(app.api_url + relPath, function(data) {
					waiting.close()
					//货主名称
					self.searchObj.ownerId = ''
					$('.q-customer-name').select2({
						containerCssClass:"select_box",
						templateResult: formatState,
						data: data,
						placeholder: '请选择货主名称'
					})
					$(".q-customer-name").val('').trigger("change")
					$(".q-customer-name").on("select2:select", function (e) {
						self.searchObj.ownerId = e.params.data.id
					})
					self.getMaterial()
				})
			},
			getMaterial: function () { // 获取品名规格材质产地
				var self = this
				var relPath = '/api/sysBusinessBasis/materialConditions'
				waiting = plus.nativeUI.showWaiting()
				m.getJSON(app.api_url + relPath, function(data) {
					waiting.close()
					//品名
					self.searchObj.brandId = ''
					$('.q-brand-name').select2({
						containerCssClass:"select_box",
						templateResult: formatState,
						data: data.brandList,
						placeholder: '请选择品名',
					})
					$(".q-brand-name").val('').trigger("change")
					$(".q-brand-name").on("select2:select", function (e) {
						self.searchObj.brandId = e.params.data.id
						let instance = $('.q-quality-name').data('select2')
						if (instance) {
							$('.q-quality-name').select2('destroy').empty()
						}
						let order = '_' + self.searchObj.brandId
						self.searchObj.textureId = ''
						$('.q-quality-name').select2({
							containerCssClass:"select_box",
							templateResult: formatState,
							data: data.textureMap[order] || [],
							placeholder: '请选择材质'
						})
						$(".q-quality-name").val('').trigger("change")
					})
					//产地
					self.searchObj.placesteelId = ''
					$('.q-field-name').select2({
						containerCssClass:"select_box",
						templateResult: formatState,
						data: data.placesteelList,
						placeholder: '请选择产地'
					})
					$(".q-field-name").val('').trigger("change")
					$(".q-field-name").on("select2:select", function (e) {
						self.searchObj.placesteelId = e.params.data.id
					})
					//规格
					self.searchObj.specificationId = ''
					$('.q-specification-name').select2({
						containerCssClass:"select_box",
						templateResult: formatState,
						data: data.specificationList.slice(0,30),
						placeholder: '请选择规格',
						query: function (query) {
							var res = {results: []};
							if(query.term){
								if(data.specificationList.length>0){
									data.specificationList.forEach((val)=>{
										if(val.text.indexOf(query.term)>=0){
											res.results.push(val)
										}
									})
								}
							}else{
								if(data.specificationList.length>0){
									res.results=data.specificationList.slice(0,30)
								}
							}
							query.callback(res);
						}
					})
					$(".q-specification-name").val('').trigger("change")
					$(".q-specification-name").on("select2:select", function (e) {
						self.searchObj.specificationId = e.params.data.id
					})
					let order = '_' + self.searchObj.brandId
					self.searchObj.textureId = ''
					$('.q-quality-name').select2({
						containerCssClass:"select_box",
						templateResult: formatState,
						data: data.textureMap[order] || [],
						placeholder: '请选择材质'
					})
					$(".q-quality-name").val('').trigger("change")
					$(".q-quality-name").on("select2:select", function (e) {
						self.searchObj.textureId = e.params.data.id
					})
					self.onSearch()
				})
			},
			onSearch:function(callback){
				var self = this
				waiting = plus.nativeUI.showWaiting()
				m.ajax(app.api_url + '/api/proReceiving/toReceiveList', {
					data: {
						'pageNo':self.pageNo,
						'pageSize':self.pageSize,
						'forecastCode':self.searchObj.forecastCode,
						'carPlateNos':self.searchObj.carPlateNos,
						'ownerId':self.searchObj.ownerId,
						'brandId':self.searchObj.brandId,
						'specificationId':self.searchObj.specificationId,
						'textureId':self.searchObj.textureId,
						'placesteelId':self.searchObj.placesteelId,
						'packageNo':self.searchObj.packageNo,
					},
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 60000, // 超时时间设置为1分钟
					success: function (data) {
						waiting.close()
						let list = data.list || []
						if(self.pageNo == 1){
							self.taskWaitList=[]
						}
						if(self.pageNo<=data.totalPage){
							for (let i in list) {
								list[i].checked = false
								self.taskWaitList.push(list[i])
							}
							for(let i in self.taskWaitList){
								let checked = false
								for(let j in self.shopList){
									if(self.shopList[j].id===self.taskWaitList[i].id){
										checked = true
										break;
									}
								}
								self.taskWaitList[i].checked = checked
							}
							if(typeof callback === 'function'){
								callback()
							}
						}else{
							pullRefresh.endPullupToRefresh(true);
						}
					},
					error: function(xhr, type, errorThrown) {
						waiting.close()
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			reForm: function () { // 重置
				var self = this
				self.searchObj = {
					forecastCode:'',
					carPlateNos:'',
					ownerId:'',
					brandId:'',
					specificationId:'',
					textureId:'',
					placesteelId:'',
					packageNo:'',
				}
				$(".q-customer-name").val('').trigger("change")
				$(".q-brand-name").val('').trigger("change")
				$(".q-field-name").val('').trigger("change")
				$(".q-specification-name").val('').trigger("change")
				$(".q-quality-name").val('').trigger("change")
			},
			toScan: function () { // 跳转扫描界面
				m.openWindow({
					id: 'read-qrcode',
					"url": '../../barcode/html/read-qrcode.html',
					extras: {
					},
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					}
				})
			},
			openTip: function () { // 打开提示框
				if (this.popoverSure === false) {
					this.popoverSure = true
				} else {
					this.popoverSure = false
				}
			},
			openShop: function () { // 打开收纳篮
				if (this.popoverShop === false) {
					this.popoverShop = true
				} else {
					this.popoverShop = false
				}
			},
			chooseWork: function (task) { // 选择作业
				if(this.shopList.length>0){
					if(this.shopList[0].forecastCode!==task.forecastCode||this.shopList[0].ownerId!==task.ownerId){
						m.toast('必须选择相同预报单号,相同货主单位的作业')
						return
					}
				}
				this.allNum = 0
				this.allWei = 0
				this.choosedTaskList = []
				this.shopList = []
				if (task.checked) {
					task.checked = false
				} else {
					task.checked = true
				}
				let checkedNum = 0
				for (let i in this.taskWaitList) {
					if (this.taskWaitList[i].checked) {
						this.allNum += this.taskWaitList[i].num
						this.allWei += this.taskWaitList[i].weight
						this.choosedTaskList.push(this.taskWaitList[i].id)
						this.shopList.push(this.taskWaitList[i])
						checkedNum++
					}
				}
				if(checkedNum == this.taskWaitList.length){
					this.allChecked = true
				}else{
					this.allChecked = false
				}
			},
			allCheck: function () { // 全选
				if (this.allChecked) {
					for (let i in this.taskWaitList) {
						this.taskWaitList[i].checked = false
					}
					this.allNum = 0
					this.allWei = 0
					this.choosedTaskList = []
					this.shopList = []
					this.allChecked = false
				} else {
					let key = this.taskWaitList.every((val)=>{
						return val.forecastCode == this.taskWaitList[0].forecastCode
					})
					if(key){
						this.allChecked = true
						this.choosedTaskList = []
						this.shopList = []
						this.allNum = 0
						this.allWei = 0
						for (let i in this.taskWaitList) {
							this.taskWaitList[i].checked = true
							this.allNum += this.taskWaitList[i].num
							this.allWei += this.taskWaitList[i].weight
							this.choosedTaskList.push(this.taskWaitList[i].id)
							this.shopList.push(this.taskWaitList[i])
						}
					}else{
						m.toast('必须选择预报单号相同的作业')
					}
				}
			},
			sure: function () { // 确定按钮提交表单
				var self = this
				if (this.choosedTaskList.length <= 0) {
					m.toast('请先选择需要入库登记的预报单号')
				} else {
					let choosedStringId = this.choosedTaskList.join(',')
					waiting = plus.nativeUI.showWaiting()
					m.ajax(app.api_url + '/api/proReceiving/newForm', {
						data: {
							'forecastDetailIds': choosedStringId,
						},
						dataType: 'json', // 服务器返回json格式数据
						type: 'POST', // HTTP请求类型
						timeout: 20000, // 超时时间设置为2分钟
						success: function (data) {
							waiting.close()
							if(data){
								self.isFirst = true
								m.openWindow({
									id: 'recive-detail',
									url: '../html/recive-detail.html',
									show: {
										aniShow: 'pop-in'
									},
									extras: {
										allInfo:data
									},
									waiting: {
										autoShow: true
									}
								})
							}
						},
						error: function(xhr, type, errorThrown) {
							waiting.close()
							m.toast('网络连接失败，请稍后重试')
						}
					})
				}
			},
			complete: function () { // 确认收货
				var self = this
				waiting = plus.nativeUI.showWaiting()
				m.ajax(app.api_url + '/api/proReceiving/receiveConfirm', {
					data: {
						'id': self.completeTask.id,
					},
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 20000, // 超时时间设置为2分钟
					success: function (data) {
						m.toast(data.msg)
						waiting.close()
						self.openTip()
                        for(let i in self.shopList){
                            if(self.shopList[i].id==self.completeTask.id){
                                self.allNum -= self.shopList[i].num
                                self.allWei -= self.shopList[i].weight
                                self.shopList.splice(i,1)
                                self.choosedTaskList.splice(i,1)
								break;
                            }
                        }
						self.pullDownQuery()
					},
					error: function(xhr, type, errorThrown) {
						waiting.close()
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			setComTask: function (task) { // 设置确认收货的对象
				this.completeTask = task
				this.openTip()
			},
			queryScan: function (tId) { // 查询出库作业
				var self = this
				var scanSuc = false
				for (let i in self.taskWaitList) {
					if (tId == self.taskWaitList[i].id) {
						scanSuc = true
						m.toast('扫描成功，您扫描的作业单号为' + tId)
						m.ajax(app.api_url + '/api/proReceiving/newForm', {
							data: {
								'forecastDetailIds': tId,
							},
							dataType: 'json', // 服务器返回json格式数据
							type: 'POST', // HTTP请求类型
							timeout: 20000, // 超时时间设置为2分钟
							success: function (data) {
								if(data){
									m.openWindow({
										id: 'recive-detail',
										"url": '../html/recive-detail.html',
										show: {
											aniShow: 'pop-in'
										},
										extras: {
											allInfo:data
										},
										waiting: {
											autoShow: true
										}
									})
								}
							},
							error: function(xhr, type, errorThrown) {
								m.toast('网络连接失败，请稍后重试')
							}
						})
						break
					}
				}
				if (!scanSuc) {
					m.toast('扫描失败，请扫描有效的二维码')
				}
			},
			close: function () { // 关闭当前页面
				m.back()
			},
		},
	})
})