define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue2");
	require("mui-zoom");
	require("mui-previewimage");
	require("mui-zoom");
	require("mui-previewimage");

	m.init({
		gestureConfig: {
			longtap: true //默认为false
		}
	});

	m.plusReady(function() {
		myPictureVue.getPictureList();

		m(".list").on('longtap', '.list-item', function() {
			//获取id
			//var id = this.getAttribute("id");
			var picturePath = this.getAttribute("picturePath");
			plus.nativeUI.confirm('确定要删除该图片吗？', function(f) {
				if(f.index == 0) {
					plus.io.resolveLocalFileSystemURL(picturePath, function(entry) {
						entry.remove(function(entry) {
							myPictureVue.getPictureList();
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

	var myPictureVue = new Vue({
		el: '#myPictureDiv',
		data: {
			dayPartList: []
		},
		methods: {
			getPictureList: function() {
				var self = this;
				self.dayPartList = [];
				plus.io.resolveLocalFileSystemURL('_documents/pictures/', function(entry) {
					// console.log(JSON.stringify(entry));
					var dirReader = entry.createReader();
					dirReader.readEntries(function(entries) {
						for(var i = 0; i < entries.length; i++) {
							buildDayPart(entries[i], entry);
						}
					}, function(e) {
						m.alert('暂无图片', '提示', function() {});
					});
				}, function(e) {
					//					m.alert('暂无图片', '提示', function() {});
				});
			}
		},
		mounted: function() {
			//			m.plusReady(function() {
			//				plus.io.resolveLocalFileSystemURL('_documents/pictures/', function(entry) {
			//					var dirReader = entry.createReader();
			//					dirReader.readEntries(function(entries) {
			//						for(var i = 0; i < entries.length; i++) {
			//							buildDayPart(entries[i], entry);
			//						}
			//					}, function(e) {
			//						m.alert('暂无图片', '提示', function() {});
			//					});
			//				}, function(e) {
			//					//					m.alert('暂无图片', '提示', function() {});
			//				});
			//
			//			});

		}
	});

	function buildDayPart(entry, entry1) {
		var pic = {};
		pic.path = entry.toLocalURL();
		entry1.getFile(entry.name, {
			create: true
		}, function(fileEntry) {
			fileEntry.file(function(file) {
//				var fileReader = new plus.io.FileReader();
//				fileReader.onloadend = function(evt) {
					//					pic.path=fileReader.result;
					entry.getMetadata(function(metadata) {
						var dateStr = dateToStr(metadata.modificationTime);
						var notExists = true;
						for(var i = 0; i < myPictureVue.dayPartList.length; i++) {
							notExists = true
							if(myPictureVue.dayPartList[i].datePart == dateStr) {
								myPictureVue.dayPartList[i].picList.push(pic);
								notExists = false;
								break;
							}
						}

						if(notExists) {
							var dayPart = {
								datePart: dateStr,
								picList: [pic]
							};
							myPictureVue.dayPartList.push(dayPart);
						}
					}, function(e) {
						m.alert('文件异常', '错误', function() {});
					}, false);
//				}
//				fileReader.readAsDataURL(file, 'utf-8');

			});
		});

	}

	function dateToStr(datetime, mode) {
		var year = datetime.getFullYear(),
			month = datetime.getMonth() + 1,
			date = datetime.getDate(),
			hour = datetime.getHours(),
			minutes = datetime.getMinutes(),
			second = datetime.getSeconds();
		if(month < 10) {
			month = "0" + month;
		}
		if(date < 10) {
			date = "0" + date;
		}
		if(hour < 10) {
			hour = "0" + hour;
		}
		if(minutes < 10) {
			minutes = "0" + minutes;
		}
		if(second < 10) {
			second = "0" + second;
		}
		return(year + "/" + month + "/" + date);

	}
	m.previewImage();

});