define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("zepto");
	require("layui");
	
	var layer;
	layui.use(['layer'], function() {
		layer  = layui.layer;
	});
	
	m.plusReady(function() {
		// 连接websocket
		webSocketClient();
	
		
	});
	
	var swaiting = null;
	var waiting;
	var aboutVue = new Vue({
		el: '#crane-hangweight',
		data: {
			// hangCarList: ['行车1南', '行车1北', '行车2', '行车3', '行车4', '行车5'],
			hangCarList: [
				{
					name: '行车1南',
					ipPort: '127.0.0.1:5006'
				},
				{
					name: '行车1北',
					ipPort: '127.0.0.1:5005'
				},
				{
					name: '行车2',
					ipPort: '127.0.0.1:5004'
				},
				{
					name: '行车3',
					ipPort: '127.0.0.1:5003'
				},
				{
					name: '行车4',
					ipPort: '127.0.0.1:5002'
				},
				{
					name: '行车5',
					ipPort: '127.0.0.1:5001'
				}
			]
		},
		methods: {
			
			clearHangWeight:function(ipPortParam) {
				// debugger
				swaiting = plus.nativeUI.showWaiting('处理中...');
				m.ajax(app.api_url + '/api/rowcar/clearHangWeight?_t=' + new Date().getTime(), {
					data:{ipPort:ipPortParam, cmd:'Z'}, // Z：清零；T：去皮；C：清皮
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒
					success: function(res) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg(res.msg);
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						layer.msg("网络异常，请重新试试");
					}
				});
			}
			
		}
	});
	
		// 吊镑socket
	    var socket;
		function webSocketClient() {
			if(typeof(WebSocket) == "undefined") {
				console.log("您的浏览器不支持WebSocket");
			}else{
				var socketUrl=app.ws_url+"hangWeighWebSocket";
				console.log(socketUrl);
				if(socket!=null){
					socket.close();
					socket=null;
				}
				socket = new WebSocket(socketUrl);
				//打开事件
				socket.onopen = function() {
					console.log("websocket已打开");
					//socket.send("这是来自客户端的消息" + location.href + new Date());
				};
				//获得消息事件
				socket.onmessage = function(msg) {
					//console.log(msg);
					var data=JSON.parse(msg.data);
					var ipPort=data.ipPort;	// ip和端口
					var weight=data.weight;// 重量
					var isSteady=data.isSteady;// 0：稳态，1：动态
					
					for (var i = 0; i < hangCarList.length; i++) {
						var item = hangCarList[i];
						
						if(item.ipPort === ipPort) {
							if(isSteady === 0) {
							    $("#steadyWeight" + i).text(weight);
							}
							break;
						}
						
					}
					
                    // if("127.0.0.1:5001" === ipPort) { // 行车5
                    //     if(isSteady === 0) {
                    //         $("#steadyWeight5").text(weight);
                    //     }
                    // }
                    // if("127.0.0.1:5002" === ipPort) { // 行车4
                    //     if(isSteady === 0) {
                    //         $("#steadyWeight4").text(weight);
                    //     }
                    // }
                    // if("127.0.0.1:5003" === ipPort) { // 行车3
                    //     if(isSteady === 0) {
                    //         $("#steadyWeight3").text(weight);
                    //     }
                    // }
                    // if("127.0.0.1:5004" === ipPort) { // 行车2
                    //     if(isSteady === 0) {
                    //         $("#steadyWeight2").text(weight);
                    //     }
                    // }
                    // if("127.0.0.1:5005" === ipPort) { // 行车1北
                    //     if(isSteady === 0) {
                    //         $("#steadyWeight1").text(weight);
                    //     }
                    // }
                    // if("127.0.0.1:5006" === ipPort) { // 行车1南
                    //     if(isSteady === 0) {
                    //         $("#steadyWeight0").text(weight);
                    //     }
                    // }
					

				};
				//关闭事件
				socket.onclose = function() {
					console.log("websocket已关闭");
				};
				//发生了错误事件
				socket.onerror = function() {
					console.log("websocket发生了错误");
				}
			}
		}
		
		setInterval(function() {
			if (socket.readyState == 1) {
				console.log("连接状态，发送消息保持连接");
				socket.send("ping");
			} else {
				console.log("断开状态，尝试重连");
				webSocketClient();
			}

		}, 40000);



		
	
});
