define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	require("moment");
	/* var rootPath = '';
	m.plusReady(function () {
	    rootPath = app.getRootPath();
	}); */

	// 拍照
	function capurteImage(cb) {
		plus.nativeUI.toast("开始拍照");
		var cmr = plus.camera.getCamera();
		cmr.captureImage(function(p) {
			plus.io.resolveLocalFileSystemURL(p, function(entry) {
				var imageUrl = entry.toLocalURL();
				if (m.os.ios) {
					imageUrl = entry.toRemoteURL();
				}
				drawShuiYin(imageUrl, cb);
			}, function(e) {
				plus.nativeUI.toast('读取拍照文件错误：' + e.message);
			});
		}, function(e) {
			plus.nativeUI.toast('拍照失败：' + e.message);
		}, {
			filename: '_doc/camera/',
			index: 1,
			resolution: 'high'
		});
	}


	async function drawShuiYin(mainImgUrl, cb) {
		try {
			var canvas = document.createElement("canvas");
			var img = await getImage(mainImgUrl);

			var locationImage = await getLocalImage("_www/images/location.png");
			var weatherImage = await getLocalImage("_www/images/weather.png");
			var avatarImage = await getLocalImage("_www/images/avatar.png");
			var logoImage = await getLocalImage("_www/images/crm_logo.png");

//            var locationImage = await getLocalImage("../images/location.png");
//            			var weatherImage = await getLocalImage("../images/weather.png");
//            			var avatarImage = await getLocalImage("../images/avatar.png");
//            			var logoImage = await getLocalImage("../images/crm_logo.png");
			/* 		var locationImage = await getLocalImage(rootPath+"/images/location.png");
					var avatarImage =  await getLocalImage(rootPath+"/images/avatar.png");
					var weatherImage =  await getLocalImage(rootPath+"/images/weather.png");	
					var logoImage =  await getLocalImage(rootPath+"/images/crm_logo.png"); */
			var addtext = await getAddress();

			var city = '';
			if (addtext.address && addtext.address.city) {
				city = addtext.address.city;
			}
			// var weather = await getWeather(city);

			var nowTime = moment().format('YYYY-MM-DD HH:mm:ss');
			//时分
			var hourDesc = nowTime.substr(11, 5).trim();
			var dateDesc = nowTime.substr(0, 10).replace(/-/g, '.');
			var mydate = new Date();
			var myddy = mydate.getDay(); //获取存储当前日期
			var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
			var weekDesc = weekday[myddy];

			canvas.width = img.width;
			canvas.height = img.height;

			var ctx = canvas.getContext("2d");

			ctx.drawImage(img, 0, 0);
			ctx.fillStyle = "#000";
			// 调节透明度
			ctx.globalAlpha = 0.25;
			ctx.fillRect(180, 100, img.width * 0.9, img.height * 0.2);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.font = "120px 微软雅黑 bold";
			ctx.fillText(hourDesc, 500, 300); //选择位置
			ctx.fillText(dateDesc + ' ' + weekDesc, 950, 300); //选择位置
			ctx.drawImage(locationImage, 250, 130);
			if (addtext.address && addtext.address.district) {
				var streetNum = addtext.address.streetNum ? addtext.address.streetNum : '';
				var address = (addtext.address.street || '') + '' + streetNum + ' ' + addtext.address.province + '' + addtext.address
					.city + '' + addtext.address.district;
				ctx.fillText(address, 500, 500); //选择位置
			} else {
				ctx.fillText("获取位置信息失败", 500, 500); //选择位置
			}

			// if(weather && weather.error==0) {
			// 	var wt = weather.results[0].weather_data[0].weather + '  ' + weather.results[0].weather_data[0].temperature;
			// 	ctx.fillText(wt, 500, 700); //选择位置
			// }else{
			// 	ctx.fillText('暂无天气数据', 500, 700); //选择位置
			// }
			// ctx.drawImage(weatherImage, 250, 500);
			// ctx.drawImage(logoImage, img.width - 760, img.height - 280);
			// ctx.drawImage(avatarImage, img.width -800, img.height - 500);
			//ctx.fillText(app.getUser().crmUserName, img.width - 600, img.height - 300 ); //选择位置

			var imgdata = canvas.toDataURL("image/jpeg");
			var imagePath = await saveImg(imgdata);

			if (typeof cb === 'function') {
				cb(imagePath);
			}
		} catch (e) {
			m.alert("拍照后加水印失败");
			console.log(e);
		}
	}

	function saveImg(imgdata) {
		return new Promise(function(resolve, reject) {
			var waiting = plus.nativeUI.showWaiting('');
			var filename = (new Date().getTime()) + '-' + Math.floor(Math.random() * 100000 + 1) + '.jpg';
			var bitmap = new plus.nativeObj.Bitmap("watermark");
			bitmap.loadBase64Data(imgdata, function() {
				console.log("加载Base64图片数据成功");
				//waiting.close();
				// 将webview内容绘制到Bitmap对象中
				bitmap.save("_doc/camera/" + filename, {
					overwrite: true,
					//format: 'jpg',
					quality: 75
				}, function(info) {
					waiting.close();
					plus.nativeUI.toast("相片已保存成功");
					bitmap.clear();
					//保存后的图片url路径，以"file://"开头
					void plus.gallery.save("_doc/camera/" + filename, function(e) {
						resolve(info.target);
					}, function(e) {
						reject(e);
					});
				}, function(e) {
					waiting.close();
					plus.nativeUI.toast("相片保存失败");
					bitmap.clear();
					reject(e);
				});
			}, function(e) {
				bitmap.clear();
				waiting.close();
				plus.nativeUI.toast('加载Base64图片数据失败：' + JSON.stringify(e));
				reject(e);
			});
		});
	}

	function getAddress() {
		return new Promise(function(resolve, reject) {
			plus.geolocation.getCurrentPosition(function(p) {
				resolve(p);
			}, function(e) {
				/* console.log('Gelocation Error: code - ' + e.code + '; message - ' + e.message);
					        switch(e.code) {
					          case e.PERMISSION_DENIED:
					              m.alert('User denied the request for Geolocation.');
					              break;
					          case e.POSITION_UNAVAILABLE:
					              m.alert('Location information is unavailable.');
					              break;
					          case e.TIMEOUT:
					              m.alert('The request to get user location timed out.');
					              break;
					          case e.UNKNOWN_ERROR:
					              alert('An unknown error occurred.');
					              break;
					          } */
				if (!isGPSOpened()) {
					var msg = "";
					if (m.os.plus && m.os.iphone) {
						msg = "由于此功能需要使用定位功能，请先到设置->隐私->定位服务中开启定位服务，否则拍出的照片无法显示位置信息";
					} else if (m.os.plus && m.os.android) {
						msg = "由于此功能需要使用定位功能，请先到设置中开启，否则拍出的照片无法显示位置信息";
					}
					//m.alert(msg);
					reject(e);
				}
				//m.toast("获取地理位置信息失败，请检查相关设置是否开启");
			}, {
				enableHighAccuracy: true,
				timeout: 1000,
				maximumAge: 1000,
				provider: 'baidu'
			});
		});


	}

	function getWeather(district) {

		return new Promise(function(resolve, reject) {
			m.ajax("http://api.map.baidu.com/telematics/v3/weather?location=" + district +
				"&output=json&ak=I785lbU4gsOMQTzQRucRRKPK&t=" + new Date().getTime(), {
					data: {},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 5000, //超时时间设置为60秒；
					success: function(data) {
						resolve(data)
					},
					error: function(xhr, type, errorThrown) {
						m.alert('获取天气信息失败');
						reject(type);
					}
				});
		});
	}

	function getImage(imgeUrl) {
		var img = new Image();
		img.setAttribute('crossOrigin', 'anonymous');
		return new Promise(function(resolve, reject) {
			img.src = imgeUrl;
			img.onload = function() {
				resolve(img);
			}
			img.onerror = function(e) {
				reject(e);
			}
		});
	}

	function getLocalImage(imgeUrl) {
		var img = new Image();
		img.setAttribute('crossOrigin', 'anonymous');
		var path = plus.io.convertLocalFileSystemURL(imgeUrl);
		return new Promise(function(resolve, reject) {
			if (m.os.ios) {
				if (!path.startsWith("file://")) {
					path = "file://" + path;
				}
				plus.io.resolveLocalFileSystemURL(path, function(entry) {
					//plus.io.resolveLocalFileSystemURL(imgeUrl, function(entry) {
					img.src = entry.toRemoteURL();
					img.onload = function() {
						resolve(img);
					}
					img.onerror = function(e) {
						reject(e);
					}
				}, function(e) {
					plus.nativeUI.toast('读取拍照文件错误：' + e.message);
					reject(e);
				});
			} else {
				//android 设备
				img.src = path;
				img.onload = function() {
					resolve(img);
				}
				img.onerror = function(e) {
					reject(e);
				}
			}
		});
	}

	function getWeekDay() {
		var myddy = mydate.getDay(); //获取存储当前日期
		var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
		var weekDesc = weekday[myddy];
		return weekDesc;
	}

	function galleryImgs(callback) {
		plus.gallery.pick(function(e) {
			if (typeof callback === "function") {
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
		if (m.os.plus && m.os.android) {
			var context = plus.android.importClass("android.content.Context");
			var locationManager = plus.android.importClass("android.location.LocationManager");
			var main = plus.android.runtimeMainActivity();
			var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
			isOpened = mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER);
		} else if (m.os.plus && m.os.iphone) {
			var CLLocationManager = plus.ios.import("CLLocationManager");
			var authorizationStatus = CLLocationManager.authorizationStatus();
			isOpened = (authorizationStatus == 3 || authorizationStatus == 4);
		}
		return isOpened;
	}

	function getDateTimeNow(isCommon) {
		var time = new Date();
		var month = time.getMonth() + 1;
		month = month == 0 ? 12 : month;
		var yearPrefix = time.getFullYear();
		month == 12 ? yearPrefix - 1 : yearPrefix;
		var day = time.getDate();
		var hour = (time.getHours() % 24) == 0 ? 0 : (time.getHours() % 24);
		var minute = time.getMinutes();
		var second = time.getSeconds();
		var nowDateTime = yearPrefix + '年' + month + '月' + day + "日 " + hour + "时" + minute + "分" + second + "秒";
		if (!isCommon) {
			month = month >= 10 ? month : '0' + month;
			day = day >= 10 ? day : '0' + day;
			hour = hour >= 10 ? hour : '0' + hour;
			minute = minute >= 10 ? minute : '0' + minute;
			second = second >= 10 ? second : '0' + second;
			nowDateTime = yearPrefix + '-' + month + '-' + day + " " + hour + ":" + minute + ":" + second;
		}

		return nowDateTime;
	}
	return {
		'capurteImage': capurteImage,
		'galleryImgs': galleryImgs,
		'isGPSOpened': isGPSOpened
	}

});
