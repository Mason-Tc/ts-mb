define(function(require, module, exports) {
	var m = require("mui");
	var Vue = require("vue");
	var app = require("app");
	//图片预览控件
	require("mui-zoom");
	require("mui-previewimage");
	require("../../../js/common/common.js");
	
//	var slider = m("#slider").slider();
//	slider.setStopped(true); 

	m.init();

	m.plusReady(function() {
		var noticeId = '';
		
		var appVue = new Vue({
			el: "#m-riskCtrl-detail",
			data: {
				itemIndex: 1,
				attachFile: [],
				imageFiles: [],
				files: [],
				coverUrls: [],
				token: '',
				apiUrl: app.api_url,
				notice: {},
				browsePage: {
					totalCount: 0,
					totalPage: 1,
					pageSize: 10,
					pageNo: 1,
					listData: []
				}
			},
		
			methods: {
				loadData: function(callback) {
					var self = this;
					var waiting = plus.nativeUI.showWaiting();
					var apiUrl = app.api_url + 'api/crm/browse/page';
					m.ajax(apiUrl, {
						data: {
							businessId: noticeId,
							businessType: 'ancmt',
							pageNo: self.browsePage.pageNo,
							pageSize: self.browsePage.pageSize
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为10秒；
						success: function(data) {
							if(waiting) {
								waiting.close();
							}
							self.browsePage.totalCount = data.count;
							//						alert(data.count < 1)
							//						if(data.count < 1) {
							//							document.getElementById('div_logistics_customer_empty').style.display = "block";
							//						} else {
							//							document.getElementById('div_logistics_customer_empty').style.display = "none";
							//						}
							console.log(JSON.stringify(data))
							//如果查询第一页，就将所有数据清空
							if(self.browsePage.pageNo === 1) {
								self.browsePage.totalPage = data.totalPage;
								self.browsePage.listData = data.list;
							} else {
								self.browsePage.totalPage = data.totalPage;
								self.browsePage.listData = self.browsePage.listData.concat(data.list);
							}
							if(typeof callback === "function") {
								callback();
							}
						},
						error: function(xhr, type, errorThrown) {
							if(app.debug) {
								console.log(xhr + "|" + type + "|" + errorThrown);
							}
							if(typeof callback === "function") {
								callback();
							}
							if(waiting) {
								waiting.close();
							}
							m.toast("网络异常，请重新试试");
						}
					});
				},
				/**
				 * 评论下拉查询
				 */
				browsePullDownQuery: function() {
					var self = this;
					self.browsePage.pageNo = 1;
					self.loadData(function() {
						browsePullRefresh.endPulldownToRefresh();
						browsePullRefresh.scrollTo(0, 0, 100);
						//if return totalPage greet zero enablePullupToRefresh
						if(self.browsePage.totalPage > 1) {
							browsePullRefresh.refresh(true);
						}
					});
				},
				/**
				 * 评论上拉查询
				 */
				browsePullUpQuery: function() {
					if(this.browsePage.pageNo < this.browsePage.totalPage) {
						this.browsePage.pageNo++;
						this.loadData(function() {
							browsePullRefresh.endPullupToRefresh();
						});
					} else {
						browsePullRefresh.endPullupToRefresh(true);
						window.setTimeout(function() {}, 2000);
					}
				},
				getAttachFile: function() {
					var self = this;
					m.ajax(app.api_url + '/api/sys/file/getAttachFiles?_t=' + new Date().getTime(), {
						data: {
							busiType: 'pro_notice',
							busiId: noticeId + "#1",
							token: app.getToken()
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 20000, //超时时间设置为20秒；
						success: function(data) {
							if(data) {
								self.attachFile = data;
								var imageFiles = [];
								var files = [];
								var coverUrls = [];
								for(var i = 0; i < data.length; i++) {
									var fileExt = data[i].fileExt;
									var size = parseInt(data[i].fileSize);
									var k = 1000, // or 1024
										sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
									j = Math.floor(Math.log(size) / Math.log(k));
									data[i].fileSize = (size / Math.pow(k, j)).toPrecision(3) + ' ' + sizes[j];
									if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
										data[i].previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + data[i].id + '&token=' + app.getToken();
										data[i].fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + data[i].id + '&token=' + app.getToken();
										imageFiles.push(data[i]);
									} else {
										files.push(data[i]);
										if(isNotBlank(data[i].baidudocId)) {
											var jsonData = JSON.parse(data[i].baidudocInfo);
											if(jsonData.status == "PUBLISHED") {
												coverUrls.push(jsonData.coverUrl);
											} else {
												coverUrls.push("../../../images/file.jpg");
											}
										} else {
											coverUrls.push("../../../images/file.jpg");
										}
									}
								}
								self.imageFiles = imageFiles;
								//							alert(JSON.stringify(self.imageFiles));
								self.files = files;
								self.coverUrls = coverUrls;
							}
						},
						error: function(xhr, type, errorThrown) {
							m.toast("网络异常，请重新试试");
						}
					});
				},
				openFile: function(file) {
					if(app.debug)
						console.log(JSON.stringify(file));
						
					if(isNotBlank(file.baidudocId)) {
						var self = this;
						var pageUrl = "../../attachFilePreview/html/read-document.html";
						m.openWindow({
							//						fileId: file.fileId,
							url: pageUrl,
							id: 'read-document',
							show: {
								aniShow: 'pop-in'
							},
							waiting: {
								autoShow: true
							},
							extras: {
								"fileId": file.id
							}
						});
					} else {
						var filePath = app.api_url + '' + 'api/sys/file/download?isOnLine=true&fileId=' + '' + file.id + '&token=' + app.getToken();
						if(app.debug) {
							console.log("RiskfilePath:" + filePath);
						}
						if(m.os.android) {
							plus.runtime.launchApplication({
								pname: "com.tencent.mtt",
								extra: {
									url: filePath
								}
							}, function(e) {
								plus.nativeUI.confirm('当前设备上找不到能打开此附件的应用，是否手动下载并安装相关应用？', function(f) {
									if(f.index == 0) {
										plus.runtime.openURL('http://mb.qq.com');
									} else {
		
									}
								}, '提示', ['是', '否']);
							});
						} else {
							plus.runtime.openURL(filePath, function(error) {
								m.toast("无法下载和打开此附件，请检查附件地址是否正确");
							}, '');
						}
					}
				},
				getcoverUrl: function(index){
					var self = this;
					return self.coverUrls[index];
				}
			}
		});
		
		//下拉刷新对象
		browsePullRefresh = m('#div_notice_pull_refresh').pullRefresh({
			down: {
				//			auto: true,
				contentrefresh: '加载中...',
				callback: function() {
					appVue.browsePullDownQuery();
				}
			},
			up: {
				contentrefresh: '正在加载...',
				callback: function() {
					appVue.browsePullUpQuery();
				}
			}
		});
		
		function initData() {
			var waiting = plus.nativeUI.showWaiting("", {
				back: 'transmit'
			});
			var apiUrl = app.api_url + '/api/proNotice/detail?_t=' + new Date().getTime();
			m.ajax(apiUrl, {
				data: {
					id: noticeId,
					token: app.getToken()
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					if(waiting) {
						waiting.close();
					}
					console.log("information-details: " + JSON.stringify(data));
					data.content = data.content.replace(data.content ? /&(?!#?\w+;)/g : /&/g, '&amp;').replace(/&lt;/g, "<").replace(/&amp;nbsp;/g, " ").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "\'").replace(/&nbsp;/g, "").replace(/img/g, "img data-preview-src=\"\" data-preview-group=\"1\"");
					appVue.notice = data;
					appVue.notice.msgDate = !isNotBlank(appVue.notice.createDate) ? "" : appVue.notice.createDate.substr(0, 16);
					appVue.notice.msgUserName = !appVue.notice.createBy ? "" : !isNotBlank(appVue.notice.createBy.userName) ? "" : appVue.notice.createBy.userName;
					appVue.notice.msgType = !isNotBlank(appVue.notice.noticeType) ? "" : appVue.notice.noticeType == "01" ? "系统维护" : "行业资讯";
					var listView = plus.webview.getWebviewById('information-list');
					if(listView) {
						m.fire(listView, 'refreshInforList', {
							inforId: noticeId,
							readCnt: appVue.notice.readCnt,
							myReadCnt: appVue.notice.myReadCnt
						});
					}
				},
				error: function(xhr, type, errorThrown) {
					if(app.debug) {
						console.log(xhr + "|" + type + "|" + errorThrown);
					}
					if(waiting) {
						waiting.close();
					}
					m.toast("网络异常，请重新试试");
				}
			});
			//增加阅读记录
			//		m.getJSON(app.api_url + 'api/crm/browse/save?_t=' + new Date().getTime(), {
			//			businessId: noticeId,
			//			businessType: 'ancmt',
			//			token: app.getToken()
			//		}, function(data) {
			//			if(data) {
			//				var messageListView = plus.webview.getWebviewById('message');
			//				if(messageListView) {
			//					m.fire(messageListView, 'refreshList');
			//				}
			//			}
			//		});
		}
		
		m.previewImage();
		
		
		var ws = plus.webview.currentWebview();
		noticeId = ws.noticeId;
		initData();
		appVue.getAttachFile();
		appVue.token = app.getToken();
		//		appVue.loadData();
		//		m('.mui-slider').slider().setStopped(true); //禁止滑动	
	});


})