define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	require("../../../../js/common/common.js");

	//	function openImageHtml(imgUrl) {
	//		var startDate = new Date();
	//		var waterMark = getDateTimeNow();
	//		plus.geolocation.getCurrentPosition(function(p) {
	//			var endDate = new Date();
	//			if(app.debug) {
	//				console.log("显示地址成功,耗时时长（ms）：" + (endDate.getTime() - startDate.getTime()));
	//				console.log(JSON.stringify(p));
	//			}
	//			var adr = (p.address.country ? p.address.country : "") + (p.address.province ? p.address.province : "") + (p.address.city ? p.address.city : "") + (p.address.district ? p.address.district : "") + (p.address.street ? p.address.street : "") + (p.address.streetNum ? p.address.streetNum : "");
	//			if(adr) {
	//				waterMark += "<br/>" + adr;
	//			}
	//			showWaterMarkView(imgUrl, waterMark);
	//		}, function(e) {
	//			if(app.debug)
	//				//console.log("失败:" + e.message);
	//				m.toast("获取地理位置信息失败，请检查相关设置是否开启");
	//			showWaterMarkView(imgUrl, waterMark);
	//		}, {
	//			enableHighAccuracy: true,
	//			timeout: 1000,
	//			maximumAge: 1000,
	//			provider: 'baidu'
	//		});
	//	}

	// 拍照
	function capurteImage() {
		//		var waterMark = "";
		plus.nativeUI.toast("开始拍照");
		var cmr = plus.camera.getCamera();
		//		setTimeout(function() {
		//			plus.geolocation.getCurrentPosition(function(p) {
		//				var endDate = new Date();
		//				if(app.debug) {
		//					console.log(JSON.stringify(p));
		//				}
		//				var adr = (p.address.country ? p.address.country : "") + (p.address.province ? p.address.province : "") + (p.address.city ? p.address.city : "") + (p.address.district ? p.address.district : "") + (p.address.street ? p.address.street : "") + (p.address.streetNum ? p.address.streetNum : "");
		//				if(adr) {
		//					waterMark += "  " + adr;
		//				}
		//			}, function(e) {
		//				if(!isGPSOpened()) {
		//					var msg = "";
		//					if(m.os.plus && m.os.iphone) {
		//						msg = "由于此功能需要使用定位功能，请先到设置->隐私->定位服务中开启定位服务，否则拍出的照片无法显示位置信息";
		//					} else if(m.os.plus && m.os.android) {
		//						msg = "由于此功能需要使用定位功能，请先到设置中开启，否则拍出的照片无法显示位置信息";
		//					}
		//					m.alert(msg);
		//				}
		//				//m.toast("获取地理位置信息失败，请检查相关设置是否开启");
		//			}, {
		//				enableHighAccuracy: true,
		//				timeout: 1000,
		//				maximumAge: 1000,
		//				provider: 'baidu'
		//			});
		//		}, 1000);

		cmr.captureImage(function(p) {
			plus.io.resolveLocalFileSystemURL(p, function(entry) {
				shuiyin("shuiyin", entry.toLocalURL(), "");
			}, function(e) {
				plus.nativeUI.toast('读取拍照文件错误：' + e.message);
			});
		}, function(e) {
			plus.nativeUI.toast('拍照失败：' + e.message);
		}, {
			filename: '_doc/camera/',
			index: 1
		});
	}

	function shuiyin(canvasid, imgurl, addtext) {
		var waiting = plus.nativeUI.showWaiting('');
		var img = new Image;
		img.src = imgurl;
		var nowTime = getDateTimeNow().trim();
		addtext = addtext ? addtext.trim() : addtext;
		img.onload = function() {
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, img.width, img.height);
			ctx.font = "120px 微软雅黑 bold";
			ctx.fillStyle = "rgb(255, 0, 0)";
			//			ctx.fillText(nowTime, 200, img.height - 250); //选择位置
			//			ctx.fillText(addtext, 200, img.height - 100); //选择位置
			ctx.fillText("", 200, img.height - 250); //选择位置
			ctx.fillText("", 200, img.height - 100);
			var imgdata = canvas.toDataURL("image/jpeg");
			var filename = 'xx' + new Date().getSeconds() + '.jpg';
			var bitmap = new plus.nativeObj.Bitmap("watermark");
			bitmap.loadBase64Data(imgdata, function() {
				console.log("加载Base64图片数据成功");
				waiting.close();
				// 将webview内容绘制到Bitmap对象中
				bitmap.save("_doc/camera/" + filename, {
					overwrite: true,
					//format: 'jpg',
					quality: 100
				}, function(info) {
					//					plus.nativeUI.toast("相片已保存成功");
					console.log('保存图片成功：' + JSON.stringify(info));
					var ows = plus.webview.currentWebview();
					m.fire(ows, 'save-picture', info);
				}, function(e) {
					plus.nativeUI.toast("相片保存失败");
					console.log('保存图片失败：' + JSON.stringify(e));
				});
			}, function(e) {
				console.log('加载Base64图片数据失败：' + JSON.stringify(e));
			});

		}
	}

	function galleryImgs(callback) {
		plus.gallery.pick(function(e) {
			if(typeof callback === "function") {
				callback(e);
			}
		}, function(e) {
			console.log("取消选择图片");
		}, {
			filter: "image",
			multiple: true,
			system: false
		});
	}

	function isGPSOpened() {
		var isOpened = false;
		if(m.os.plus && m.os.android) {
			var context = plus.android.importClass("android.content.Context");
			var locationManager = plus.android.importClass("android.location.LocationManager");
			var main = plus.android.runtimeMainActivity();
			var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
			isOpened = mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER);
		} else if(m.os.plus && m.os.iphone) {
			var CLLocationManager = plus.ios.import("CLLocationManager");
			var authorizationStatus = CLLocationManager.authorizationStatus();
			isOpened = (authorizationStatus == 3 || authorizationStatus == 4);
		}
		return isOpened;
	}

	return {
		'capurteImage': capurteImage,
		'galleryImgs': galleryImgs,
		'isGPSOpened': isGPSOpened
	}

});