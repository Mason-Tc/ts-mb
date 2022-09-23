define(function(require, module, exports) {
	var m = require("mui")
	var app = require("app")
	var Vue = require("vue")
	require('jquery')
	require("layui")
	require("../../../js/common/common.js")
	
	window.onload = function() {
		window.addEventListener('refresh', function() {
			location.reload()
		})
	}
	
	m.init({
		statusBarBackground: '#f7f7f7',
		swipeBack: false //启用右滑关闭功能
	})
	
	m.plusReady(function() {
		globalVue.getWarehouseList()
		globalVue.crane = app.getCrane()
		globalVue.getTaskList()
	})
	
	var globalVue = new Vue({
		el: "#app",
		data: {
			crane: {}, // 行车信息
			searchList: {
				carPlateNo: '',
				ladingCode: '',
			}, // 搜索框
			warehouseList: [], // 仓库列表
			taskList: [], // 作业列表
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
			getWarehouseList: function() {
				var self = this
				var waiting = plus.nativeUI.showWaiting()
				var apiUrl = app.api_url + '/api/sysBusinessBasis/warehouseInfos1?_t=' + new Date().getTime()
				m.ajax(apiUrl, {
					dataType: 'json', //服务器返回json格式数据
					type: 'GET', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					async: false,
					success: function (data) {
						self.warehouseList = data
						self.searchList.warehouseId = app.getUser().warehouse.id ? app.getUser().warehouse.id : data[0].id
						self.sure()
						waiting.close()
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试")
						waiting.close()
					}
				})
			},
			getTaskList: function () {
				var self = this
				var waiting = plus.nativeUI.showWaiting()
				m.ajax(app.api_url + '/api/ctpad/getWarningTaskList', {
					data: {
						// 'deviceId': self.crane.id,
						'carPlateNo': self.searchList.carPlateNo,
						'ladingCode': self.searchList.ladingCode,
						'warehouseId': self.searchList.warehouseId,
						// 'warnType': self.searchList.warnType,
					},
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 10000, // 超时时间设置为10秒
					success: function (data) {
						self.taskList = data
						waiting.close()
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试")
						waiting.close()
					}
				})
			},
			toWorkOutInput: function (tId) { // 跳转到超载作业录入页面
				this.isSelect(()=>{
					var self = this
					var waiting = plus.nativeUI.showWaiting()
					m.ajax(app.api_url + '/api/ctpad/getWarningTaskData', {
						data: { 
							'isReload': 0,
							'taskId': tId
						},
						dataType: 'json', // 服务器返回json格式数据
						type: 'POST', // HTTP请求类型
						timeout: 20000, // 超时时间设置为2分钟
						success: function (data) {
							if (data.retMsg) {
								m.toast(data.retMsg)
							} else if (!data.worktypeList) {
								m.confirm('当前未进行班组配置，是否继续？', '温馨提示', ['是', '否'], function (e) {
									if (e.index == 0) {
										m.openWindow({
											id: 'work-out-input',
											"url": './work-out-input.html',
											show: {
												aniShow: 'pop-in'
											},
											extras: {
												allInfo: data,
												taskId: tId,
											},
											waiting: {
												autoShow: true
											}
										})
									}
								})
							} else {
								m.openWindow({
									id: 'work-out-input',
									"url": './work-out-input.html',
									show: {
										aniShow: 'pop-in'
									},
									extras: {
										allInfo: data,
										taskId: tId,
									},
									waiting: {
										autoShow: true
									}
								})
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
			toScan: function () {
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
			clean: function () { // 重置
				this.searchList = {
					warehouseId: app.getUser().warehouse.id ? app.getUser().warehouse.id : this.warehouseList[0].id,
					ladingCode: '',
					carPlateNo: '',
					// warnType: '',
				}
			},
			sure: function () { // 确定按钮提交表单
			},
			close: function () { // 关闭当前页面
				m.back()
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
	})
})