define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue2");
	var j = require("jquery");
	var playVideo = require("./video-plugins.js");

	m.init({
		gestureConfig: {
			longtap: true //默认为false
		}
	});

	m.plusReady(function() {
		getVideoList();

		m(".list").on('longtap', '.list-item', function() {
			//获取id
			//var id = this.getAttribute("id");
			var videoPath = this.getAttribute("videoPath");
			plus.nativeUI.confirm('确定要删除该视频吗？', function(f) {
				if (f.index == 0) {
					plus.io.resolveLocalFileSystemURL(videoPath, function(entry) {
						entry.remove(function(entry) {
							var imgPath = videoPath.substr(0, videoPath.lastIndexOf('.')) + ".jpg";
							plus.io.resolveLocalFileSystemURL(imgPath, function(fentry) {
								fentry.remove(function(etry) {

								}, function(ex) {

								});
							}, function(fe) {

							});
							getVideoList();
						}, function(e) {
							m.toast(e.message);
						});
					}, function(e) {

					});
				} else {

				}
			}, '提示', ['是', '否']);
		});

	});

	var myVideoVue = new Vue({
		el: '#myVideoDiv',
		data: {
			videoList: []
		},
		methods: {
			playVideo: function(path) {
				// playVideo(path, "视频播放");
//                player = plus.video.createVideoPlayer('videoplayer', {
//                			src:path,
//                			top:'50px',
//                			left:'0px',
//                			width: '100%',
//                			height: '200px',
//                			position: 'static',
//                			autoplay: 'true'
////                			'initial-time': '59.547001'
//                		});
//                		plus.webview.currentWebview().append(player);

				m.openWindow({
					id: 'playVideo',
					url: '../html/playVideo.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						'videoPath': path
					}
				});
			}
		},
		mounted: function() {},
	});

	function getVideoList() {
		myVideoVue.videoList = [];
		plus.io.resolveLocalFileSystemURL('_documents/videos/', function(entry) {
			var dirReader = entry.createReader();
			dirReader.readEntries(function(entries) {
				for (var i = 0; i < entries.length; i++) {
					var exd = entries[i].name.substr(entries[i].name.lastIndexOf('.') + 1);
					if (exd.toLocaleUpperCase() == 'MP4') {
						buildDayPart(entries[i], entry);
					}
				}
			}, function(e) {
				m.alert('暂无图片', '提示', function() {});
			});
		}, function(e) {

		});
	}

	function buildDayPart(entry, entry1) {
		var video = {};
		video.path = entry.toLocalURL();
		video.name = entry.name;
		var prefixPath = video.path.substr(0, video.path.lastIndexOf('.')) + ".jpg";

		entry.getMetadata(function(metadata) {
			video.updateTime = dateToStr(metadata.modificationTime);
			video.posterImg = prefixPath;

			plus.io.resolveLocalFileSystemURL(prefixPath, function(fentry) {
				video.posterImg = prefixPath;
				myVideoVue.videoList.push(video);
			}, function(e) {
				video.posterImg = "../images/zt_crm_logob.png";
				myVideoVue.videoList.push(video);
			});
		}, function(e) {
			m.alert('文件异常', '错误', function() {});
		}, false);
	}

	function dateToStr(datetime, mode) {
		var year = datetime.getFullYear(),
			month = datetime.getMonth() + 1,
			date = datetime.getDate(),
			hour = datetime.getHours(),
			minutes = datetime.getMinutes(),
			second = datetime.getSeconds();
		if (month < 10) {
			month = "0" + month;
		}
		if (date < 10) {
			date = "0" + date;
		}
		if (hour < 10) {
			hour = "0" + hour;
		}
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (second < 10) {
			second = "0" + second;
		}
		return (year + "/" + month + "/" + date + " " + hour + ":" + minutes);

	}

});
