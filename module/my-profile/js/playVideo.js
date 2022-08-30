define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue2");

	m.plusReady(function() {
		var ws = plus.webview.currentWebview();
		palyVideoVue.videoPath = ws.videoPath;

		palyVideoVue.playVideo();
//        var player = plus.video.createVideoPlayer('videoplayer', {
//			src: ws.videoPath,
//			top:'50px',
//			left:'0px',
//			width: '100%',
//			height: '200px',
//			position: 'static',
//			autoplay: true
//		});
//		ws.append(player);
	});

	var palyVideoVue = new Vue({
		el: '#playVideoDiv',
		data: {
			player: null,
			videoPath: '',
			playing: false
		},
		methods: {
			playVideo: function() {
				var self = this;
				if (!self.player) {
					self.player = plus.video.createVideoPlayer('videoplayer', {
						'src': self.videoPath,
						'top': '70px',
						'left': '0px',
						'width': '100%',
						'height': '200px',
						'position': 'static',
//						'initial-time': '59.547001',
						'autoplay': true
					});
					plus.webview.currentWebview().append(self.player);
					// 监听开始播放事件
					self.player.addEventListener('play', function(e) {
//						plus.nativeUI.alert('Video play');
					}, false)
					// 监听播放进度更新事件
					self.player.addEventListener('timeupdate', function(e) {
//						console.log(JSON.stringify(e));
					}, false);
					// 监听播放结束事件
					self.player.addEventListener('ended', function(e) {
//						plus.nativeUI.alert('Video ended');
					}, false);
				}
			}
		},
		mounted: function() {

		}
	});

});
