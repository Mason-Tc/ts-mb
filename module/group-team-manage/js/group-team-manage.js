define(function(require, module, exports) {
	var m = require("mui")
	var app = require("app")
	var Vue = require("vue")
	require('jquery')
	require("../../../js/common/common.js")
	
	m.init({
		statusBarBackground: '#f7f7f7',
		swipeBack: true //启用右滑关闭功能
	})
	
	m.plusReady(function () {
	    globalVue.getTeamGroupList()
	})
	
	var globalVue = new Vue({
		el: "#app",
		data: {
			chooseGroup: [], // 选中的对象
			allGroup: [], // 所有的工种列表
		},
		methods: {
			getTeamGroupList: function() { // 获取班组信息列表
				var self = this
				// var waiting = plus.nativeUI.showWaiting()
				// m.ajax(app.api_url + '/api/ctpad/getTeamInfo', {
				// 	dataType: 'json', //服务器返回json格式数据
				// 	type: 'GET', //HTTP请求类型
				// 	timeout: 20000, //超时时间设置为2分钟；
				// 	success: function (data) {
				// 		let copyData = JSON.parse(JSON.stringify(data))
				// 		// self.allGroup = copyData
						self.allGroup = [{worktypeName:'理货员',id:'3',workUserList:[{workUserName:'tc',isSelect:'0'}]}]
				// 		self.chooseGroup = JSON.parse(JSON.stringify(copyData))
				// 		for (let i in self.chooseGroup) {
				// 			self.chooseGroup[i].workUserList = []
				// 		}
				// 		waiting.close()
				// 	},
				// 	error: function(xhr, type, errorThrown) {
				// 		waiting.close()
				// 		m.toast('网络连接失败，请稍后重试')
				// 	}
				// })
			},
			chooseStyle: function (isSelect) { // 选择样式
				if (isSelect === '1') {
					return 'background: #DAE6FB; border: 1px solid #4285F4;'
				} else {
					return ''
				}
			},
			choose: function (obj) { // 选择
				if (obj.isSelect === '1') {
					obj.isSelect = '0'
				} else {
					obj.isSelect = '1'
				}
			},
			sure: function () { // 确定按钮提交表单
				var self = this
				var isEmpty = true
				self.chooseGroup = JSON.parse(JSON.stringify(self.allGroup))
				for (let i in self.chooseGroup) {
					self.chooseGroup[i].workUserList = []
				}
				for (let i in self.allGroup) {
					for (let j in self.allGroup[i].workUserList) {
						if (self.allGroup[i].workUserList[j].isSelect === '1') {
							isEmpty = false
							self.chooseGroup[i].workUserList.push(self.allGroup[i].workUserList[j])
						}
					}
				}
				if (isEmpty) {
					m.toast('您当前的班组配置为空，请配置后确认')
				} else {
					const params = JSON.stringify(self.chooseGroup)
					var waiting = plus.nativeUI.showWaiting()
					m.ajax(app.api_url + '/api/ctpad/saveTeamInfo', {
						data: { jsonData: params },
						dataType: 'json', //服务器返回json格式数据
						type: 'POST', //HTTP请求类型
						timeout: 20000, //超时时间设置为2分钟；
						success: function (data) {
							m.toast(data.msg)
							if (data.status === true) {
								self.close()
							}
							waiting.close()
						},
						error: function(xhr, type, errorThrown) {
							waiting.close()
							m.toast('网络连接失败，请稍后重试')
						}
					})
				}
			},
			close: function () { // 关闭当前页面
				m.back()
			},
		},
	})
})