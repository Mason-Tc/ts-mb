define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");

	var div_image_preview_content = document.getElementById("div_image_preview_content");
	var imagePreview = document.getElementById("image-preview");
	var div_image_preview_water_mark = document.getElementById("div_image_preview_water_mark");

	var currView = null;
	var loadingWin = null;

	m.init({
		swipeBack: true //启用右滑关闭功能
	});

	function imageLoaded() {
		if(app.debug)
			console.log("imgLoaded");
		var imgUrl = this.src;
		div_image_preview_water_mark.style.top = (imagePreview.offsetHeight) + 'px';
		plus.io.resolveLocalFileSystemURL(imgUrl, function(entry) {
			window.setTimeout(function() {
				savePicture(entry);
			}, 2000);
		}, function(e) {
			console.log("读取拍照文件错误：" + e.message);
		});
	}

	function imageLoadedError() {
		plus.nativeUI.alert("无效的图片资源", function() {
			m.back();
		});
	}

	function savePicture(entry) {
		var bitmap = new plus.nativeObj.Bitmap("watermark");
		// 将webview内容绘制到Bitmap对象中
		currView.draw(bitmap, function() {
			if(app.debug)
				console.log('绘制图片成功');
			saveBitmap(currView, bitmap, entry);
		}, function(e) {
			if(loadingWin) {
				loadingWin.close();
			}
			if(app.debug)
				console.log('绘制图片失败：' + JSON.stringify(e));
			m.toast("绘制水印图片出现问题，请重新试试");
		});
	}
	// 保存图片
	function saveBitmap(wc, bitmap, entry) {
		bitmap.save("_doc/camera/" + entry.name, {
			overwrite: true,
			//format: 'jpg',
			quality: 100
		}, function(info) {
			if(loadingWin) {
				loadingWin.close();
			}
			if(app.debug)
				console.log('保存图片成功：' + JSON.stringify(info));
			var ows = plus.webview.currentWebview().opener();
			m.fire(ows, 'save-picture', info);
			wc.close();
		}, function(e) {
			if(loadingWin) {
				loadingWin.close();
			}
			if(app.debug)
				console.log('保存图片失败：' + JSON.stringify(e));
			//				m.alert('保存图片失败：' + JSON.stringify(e));
			m.toast("保存图片出现问题，请重新试试");
		});
	}

	imagePreview.addEventListener("load", imageLoaded, false);
	imagePreview.addEventListener("error", imageLoadedError, false);

	// H5 plus事件处理
	function plusReady() {
		div_image_preview_content.style.height = plus.screen.resolutionHeight + 'px';
		if(window.plus) {
			loadingWin = plus.nativeUI.showWaiting('正在处理图片...');
		}
		currView = plus.webview.currentWebview();
		imagePreview.src = currView.imageUrl;
		div_image_preview_water_mark.innerHTML = currView.waterMark;
	}
	m.plusReady(plusReady);
});