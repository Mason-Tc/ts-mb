define(function(require, module, exports) {
	var m = require("mui");
	var Vue = require("vue");
	var app = require("app");

	m.plusReady(function() {
		var fileId = null;
		var backButton = document.getElementById('back');
		backButton.addEventListener('click', function(event) {
			appVue.back();
		});
		
		var appVue = new Vue({
			el: "#m-detail",
			data: {
		
			},
		
			methods: {
				back: function() {
					var ws = plus.webview.currentWebview();
					plus.webview.close(ws);
				},
				openFile: function() {
					var waiting = plus.nativeUI.showWaiting();
					var filePath = app.api_url + '' + 'api/sys/file/download?isOnLine=true&fileId=' + '' + fileId + '&token=' + app.getToken();
					if(m.os.android) {
						if(waiting) {
							waiting.close();
						}
						plus.runtime.launchApplication({
							pname: "com.tencent.mtt",
							extra: {
								url: filePath
							}
						}, function(e) {
							if(waiting) {
								waiting.close();
							}
							plus.nativeUI.confirm('当前设备上找不到能打开此附件的应用，是否手动下载并安装相关应用？', function(f) {
								if(f.index == 0) {
									plus.runtime.openURL('http://mb.qq.com');
								} else {
		
								}
							}, '提示', ['是', '否']);
						});
					} else {
						if(waiting) {
							waiting.close();
						}
						plus.runtime.openURL(filePath, function(error) {
							m.toast("无法下载和打开此附件，请检查附件地址是否正确");
						}, '');
					}
				},
			}
		})
		
		
		var self = plus.webview.currentWebview();
		fileId = self.fileId;

		var waiting = plus.nativeUI.showWaiting("", {
			back: 'transmit'
		});

		m.ajax(app.api_url + 'api/sys/file/getBaiduDoc?_t=' + new Date().getTime(), {
			data: {
				fileId: fileId,
				token: app.getToken()
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 20000, //超时时间设置为10秒；
			success: function(data) {
				if(waiting) {
					waiting.close();
				}
				var jsonData = JSON.parse(data.baidudocInfo);
				if(jsonData.status == "PUBLISHED") {
					var option = {
						docId: data.baidudocId,
						token: jsonData.token,
						host: "BCEDOC",
						width: 600, // 文档容器宽度
						pn: 1, // 定位到第几页，可选
						ready: function(handler) { // 设置字体大小和颜色, 背景颜色（可设置白天黑夜模式）
							handler.setFontSize(1);
							handler.setBackgroundColor("#fff");
							handler.setFontColor("#000");
						},
						flip: function(data) { // 翻页时回调函数, 可供客户进行统计等
							console.log(data.pn);
						},
						fontSize: "big",
						toolbarConf: {
							page: true, // 上下翻页箭头图标
							pagenum: true, // 几分之几页
							full: false, // 是否显示全屏图标,点击后全屏
							copy: true, // 是否可以复制文档内容
							position: "center" // 设置 toolbar中翻页和放大图标的位置(值有left/center)
						} //文档顶部工具条配置对象,必选
					};
					new Document("reader", option);
				} else {
					appVue.openFile();
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
				appVue.openFile();
			}
		});

		//		m.getJSON(app.api_url + 'api/crm/user/getBaiduDoc?_t=' + new Date().getTime(), {
		//			fileId: fileId,
		//			token: app.getToken()
		//		}, function(data) {
		//			
		//
		//		})

		plus.key.addEventListener("backbutton", function() {
			if(waiting) {
				waiting.close();
			}
			appVue.back();
		}) //监听返回按键
	})

	m.init({
		swipeBack: false,
		gestureConfig: {
			tap: false, //默认为true
		}
	});
})