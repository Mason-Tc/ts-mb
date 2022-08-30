define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	require("../../../js/common/common.js");
//	require("../../common/camera/js/mobileBUGFix.mini.js");
//	require("../../common/camera/js/exif.js");
	require("../js/mobileBUGFix.mini.js");
	require("../js/exif.js");

	function openImageHtml(imgUrl) {
		var startDate = new Date();
		var waterMark = getDateTimeNow();
		plus.geolocation.getCurrentPosition(function(p) {
			var endDate = new Date();
			if(app.debug) {
				console.log("显示地址成功,耗时时长（ms）：" + (endDate.getTime() - startDate.getTime()));
				console.log(JSON.stringify(p));
			}
			//			var waterMark = (new Date()).toLocaleString();
			var adr = (p.address.country ? p.address.country : "") + (p.address.province ? p.address.province : "") + (p.address.city ? p.address.city : "") + (p.address.district ? p.address.district : "") + (p.address.street ? p.address.street : "") + (p.address.streetNum ? p.address.streetNum : "");
			if(adr) {
				waterMark += "<br/>" + adr;
			}
			//			var url = "../../common/html/image-preview.html";
			//			var view = plus.webview.create(url, url, {
			//				hardwareAccelerated: true,
			//				scrollIndicator: 'none',
			//				scalable: false,
			//				bounce: "none",
			//				zindex: -1
			//			}, {
			//				'imageUrl': imgUrl,
			//				'waterMark': waterMark
			//			});
			//			view.show();
			showWaterMarkView(imgUrl, waterMark);
		}, function(e) {
			if(app.debug)
				console.log("失败:" + e.message);
			//			m.toast("获取地理位置信息失败，请检查相关设置是否开启");
			showWaterMarkView(imgUrl, waterMark);
		}, {
			enableHighAccuracy: true,
			timeout: 1000,
			maximumAge: 1000,
			provider: 'baidu'
		});
	}

	function showWaterMarkView(imgUrl, waterMark) {
				var url = "../html/image-preview.html";
				var view = plus.webview.create(url, url, {
					hardwareAccelerated: true,
					scrollIndicator: 'none',
					scalable: false,
					bounce: "none"
		//			zindex: -1
				}, {
					'imageUrl': imgUrl,
//					'waterMark': waterMark
					'waterMark': ''
				});
				view.show();
	}

	// 拍照
	function capurteImage() {
		plus.nativeUI.toast("开始拍照");
		var cmr = plus.camera.getCamera();
		cmr.captureImage(function(p) {
			if(app.debug) {
				console.log("capurteImage p:" + p);
			}
			plus.io.resolveLocalFileSystemURL(p, function(entry) {
				if(app.debug)
					console.log(entry);

				if(m.os.android) {
					var Orientation = null;
					var img = new Image();
					img.src = entry.fullPath;
					img.onload = function() {
						//获取照片方向角属性，用户旋转控制
						EXIF.getData(img, function() {
							//			alert(EXIF.pretty(img));
							EXIF.getAllTags(img);
							//									alert(EXIF.getTag(img, 'Orientation')); 
							Orientation = EXIF.getTag(img, 'Orientation');
							if(app.debug) {
								console.log("Orientation:" + Orientation);
							}
							var expectWidth = img.naturalWidth;
							var expectHeight = img.naturalHeight;

							if(img.naturalWidth > img.naturalHeight && img.naturalWidth > 800) {
								expectWidth = 800;
								expectHeight = expectWidth * img.naturalHeight / img.naturalWidth;
							} else if(img.naturalHeight > img.naturalWidth && img.naturalHeight > 1200) {
								expectHeight = 1200;
								expectWidth = expectHeight * img.naturalWidth / img.naturalHeight;
							}
							//				alert(expectWidth+','+expectHeight);
							var canvas = document.createElement("canvas");
							var ctx = canvas.getContext("2d");
							//						ctx.font = "30px Arial";
							//						ctx.fillStyle = "#FF0000";
							//						ctx.fillText("Hello World", 50, 50);
							canvas.width = expectWidth;
							canvas.height = expectHeight;
							ctx.drawImage(img, 0, 0, expectWidth, expectHeight);
							//				alert(canvas.width+','+canvas.height);

							var base64 = null;
							var mpImg = new MegaPixImage(img);
							mpImg.render(canvas, {
								maxWidth: 800,
								maxHeight: 1200,
								quality: 0.8,
								orientation: Orientation
							});
							if(Orientation != "" && Orientation != 1) {
								//						alert('旋转处理');
								switch(Orientation) {
									case 6: //需要顺时针（向左）90度旋转
										if(app.debug)
											console.log('需要顺时针（向左）90度旋转');
										//										rotateImg(img, 'left', canvas);
										break;
									case 8: //需要逆时针（向右）90度旋转
										if(app.debug)
											console.log('需要顺时针（向右）90度旋转');
										//										rotateImg(img, 'right', canvas);
										break;
									case 3: //需要180度旋转
										if(app.debug)
											console.log('需要180度旋转');
										//										rotateImg(img, 'left', canvas); //转两次
										//										rotateImg(img, 'left', canvas);
										break;
								}
							}
							base64 = canvas.toDataURL("image/jpeg");
							var bitmap = new plus.nativeObj.Bitmap("watermark");
							bitmap.loadBase64Data(base64, function() {
								if(app.debug) {
									console.log("加载Base64图片数据成功");
								}
								// 将webview内容绘制到Bitmap对象中
								bitmap.save("_doc/camera/" + entry.name, {
									overwrite: true,
									//format: 'jpg',
									quality: 100
								}, function(info) {
									if(app.debug)
										console.log('保存图片成功：' + JSON.stringify(info));
								}, function(e) {
									if(app.debug)
										console.log('保存图片失败：' + JSON.stringify(e));
									m.toast("保存图片出现问题，请重新试试");
								});
							}, function() {
								if(app.debug) {
									console.log('加载Base64图片数据失败：' + JSON.stringify(e));
								}
							});
							openImageHtml(entry.fullPath);
						});
					}
				} else
					openImageHtml(entry.fullPath);
			}, function(e) {
				m.alert("读取拍照文件错误：" + e.message);
			});
		}, function(e) {
			//没有拍时就不提示什么了
			//			m.alert("失败：" + e.message);
		}, {
			filename: "_doc/camera/",
			index: 1
		});
	}

	//对图片旋转处理
	function rotateImg(img, direction, canvas) {
		//alert(img);
		//最小与最大旋转方向，图片旋转4次后回到原方向  
		var min_step = 0;
		var max_step = 3;
		//var img = document.getElementById(pid);  
		if(img == null) return;
		//img的高度和宽度不能在img元素隐藏后获取，否则会出错  
		var height = img.height;
		var width = img.width;
		/*var height = canvas.height;
		var width = canvas.width;*/
		//var step = img.getAttribute('step');  
		var step = 2;
		if(step == null) {
			step = min_step;
		}
		if(direction == 'right') {
			step++;
			//旋转到原位置，即超过最大值  
			step > max_step && (step = min_step);
		} else {
			step--;
			step < min_step && (step = max_step);
		}
		//img.setAttribute('step', step);  
		/*var canvas = document.getElementById('pic_' + pid);  
		if (canvas == null) {  
		    img.style.display = 'none';  
		    canvas = document.createElement('canvas');  
		    canvas.setAttribute('id', 'pic_' + pid);  
		    img.parentNode.appendChild(canvas);  
		}  */
		//旋转角度以弧度值为参数  
		var degree = step * 90 * Math.PI / 180;
		var ctx = canvas.getContext('2d');
		switch(step) {
			case 0:
				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0);
				break;
			case 1:
				canvas.width = height;
				canvas.height = width;
				ctx.rotate(degree);
				ctx.drawImage(img, 0, -height);
				break;
			case 2:
				canvas.width = width;
				canvas.height = height;
				ctx.rotate(degree);
				ctx.drawImage(img, -width, -height);
				break;
			case 3:
				canvas.width = height;
				canvas.height = width;
				ctx.rotate(degree);
				ctx.drawImage(img, -width, 0);
				break;
		}
	}

	function galleryImgs(callback) {
		plus.gallery.pick(function(e) {
			//			var zm = 0;
			//			setTimeout(file, 350);
			//
			//			function file() {
			//				plus.io.resolveLocalFileSystemURL(e.files[zm], function(entry) {
			//					if(typeof callback === "function") {
			//						callback(entry);
			//					}
			//				}, function(e) {
			//					plus.nativeUI.toast("读取拍照文件错误：" + e.message);
			//				});
			//				zm++;
			//				if(zm < e.files.length) {
			//					setTimeout(file, 350);
			//				}
			//			}
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

	return {
		'capurteImage': capurteImage,
		'galleryImgs': galleryImgs
	}

});