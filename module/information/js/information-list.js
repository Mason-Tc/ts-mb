define(function(require, module, exports) {
	var m = require("mui");
	var Vue = require("vue");
	var app = require("app");
	require("../../../js/common/common.js");

	//下拉刷新对象
	var noticePullRefresh = null;

	var slider = m("#slider").slider();
	slider.setStopped(true);

	m.init();

	m.plusReady(function() {
		var ws = plus.webview.currentWebview();
		messageVue.loadData();
		//		messageVue.announceTypeList = app.getFlDictDataLabelList('notice_type');
	});

	var messageVue = new Vue({
		el: "#body_message",
		data: {
			noticeCount: '0',
			announceType: '',
			announceTypeList: [{
				'value': '01',
				'label': '系统维护'
			}, {
				'value': '02',
				'label': '行业资讯'
			}],
			noticePage: {
				totalCount: 0,
				totalPage: 1,
				pageSize: 10,
				pageNo: 1,
				messageListData: []
			}
		},
		methods: {
			noticeQuery: function(params, callback) {
				var nwaiting = plus.nativeUI.showWaiting('');
				var self = this;
				var apiUrl = app.api_url + '/api/proNotice/list?_t=' + new Date().getTime();
				if(app.debug) {
					var noticeQueryUrl = apiUrl + "&pageNo=" + params.pageNo + "&pageSize=" + params.pageSize;
					console.log("noticeQueryUrl:" + noticeQueryUrl);
				}
				m.ajax(apiUrl, {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 50000, //超时时间设置为50秒；
					success: function(data) {
						if(nwaiting) {
							nwaiting.close();
						}
						if(app.debug) {
							console.log("noticeData:" + JSON.stringify(data));
						}
						self.noticeCount = data.count;
						if(data.count < 1) {
							document.getElementById('div_notice_empty').style.display = "block";
							document.getElementById('div_notice_pull_refresh').style.display = "none";
						} else {
							document.getElementById('div_notice_empty').style.display = "none";
							document.getElementById('div_notice_pull_refresh').style.display = "block";
							if(data.list && data.list.length > 0) {
								m.each(data.list, function(index, item) {
									if(item) {
										item.titleId = "div_" + item.id;
										item.msgDate = !item.createDate ? "" : item.createDate.substr(0, 16);
										item.msgUserName = !item.createBy ? "" : !isNotBlank(item.createBy.userName) ? "" : item.createBy.userName;
										item.hasRead = item.myReadCnt > 0; 
									}
								});
							}
							//如果查询第一页，就将所有数据清空
							self.noticePage.totalPage = data.totalPage;
							if(self.noticePage.pageNo === 1) {
								self.noticePage.messageListData = data.list;
							} else {
								self.noticePage.messageListData = self.noticePage.messageListData.concat(data.list);
							}
						}

						if(typeof callback === "function") {
							callback();
						}
					},
					error: function(xhr, type, errorThrown) {
						if(nwaiting) {
							nwaiting.close();
						}
						if(typeof callback === "function") {
							callback();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			doQuery: function(callback) {
				var self = this;
				self.noticeQuery({
					'pageNo': self.noticePage.pageNo,
					'pageSize': self.noticePage.pageSize,
					'noticeType': self.announceType
				}, callback);
			},
			loadData: function() {
				var self = this;
				self.doQuery();
			},
			/**
			公告下拉查询
			*/
			noticePullDownQuery: function() {
				this.noticePage.pageNo = 1;
				var self = this;
				this.doQuery(function() {
					noticePullRefresh.endPulldownToRefresh();
					noticePullRefresh.scrollTo(0, 0, 100);
					//if return totalPage greet zero enablePullupToRefresh
					if(self.noticePage.totalPage > 1) {
						noticePullRefresh.refresh(true);
					}
				});
			},
			/**
			 * 公告上拉查询
			 */
			noticePullUpQuery: function() {
				if(this.noticePage.pageNo < this.noticePage.totalPage) {
					this.noticePage.pageNo++;
					this.doQuery(function() {
						noticePullRefresh.endPullupToRefresh();
					});
				} else {
					noticePullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						noticePullRefresh.disablePullupToRefresh();
					}, 2000);
				}
			},
			openNotice: function(e) {
				var pwaiting = plus.nativeUI.showWaiting('');
				var self = this;
				var apiUrl = app.api_url + '/api/proNotice/readNotice?_t=' + new Date().getTime();
				m.ajax(apiUrl, {
					data: {
						id: e.id
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为50秒；
					success: function(data) {
						if(pwaiting) {
							pwaiting.close();
						}
						if(data && data.status) {
							m.openWindow({
								url: '../html/information-details.html',
								id: 'information-details',
								styles: {

								},
								extras: {
									noticeId: e.id
								},
								show: {
									autoShow: true //页面loaded事件发生后自动显示，默认为true
								},
								waiting: {
									autoShow: true, //自动显示等待框，默认为true
									title: '正在加载...' //等待对话框上显示的提示内容
								}
							});
						} else {
							m.toast(data.msg);
						}
					},
					error: function(xhr, type, errorThrown) {
						if(pwaiting) {
							pwaiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			}
		}
	});

	noticePullRefresh = m('#div_notice_pull_refresh').pullRefresh({
		down: {
			//auto: true,
			contentrefresh: '加载中...',
			callback: function() {
				messageVue.noticePullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			callback: function() {
				messageVue.noticePullUpQuery();
			}
		}
	});

	messageVue.$watch('announceType', function(val) {
		messageVue.noticePage.pageNo = 1;
		messageVue.doQuery();
	});

	document.addEventListener("refreshInforList", function(e) {
		var inforId = e.detail.inforId;
		var readCnt = e.detail.readCnt;
		var myReadCnt = e.detail.myReadCnt;
		if(messageVue.noticePage.messageListData && messageVue.noticePage.messageListData.length > 0) {
			m.each(messageVue.noticePage.messageListData, function(index, item) {
				if(item && item.id == inforId) {
					item.readCnt = readCnt;
					item.myReadCnt = myReadCnt;
					item.hasRead = item.myReadCnt > 0; 
					if(item.hasRead)
						document.getElementById(item.titleId).className = 'message-title';
					else
						document.getElementById(item.titleId).className = 'message-title blue';
				}
			});
		}
	}, false);
});