define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue2");
	var j = require("jquery");

	var height = (window.innerHeight - 100) + 'px'; //获取页面实际高度  
	var width = window.innerWidth + 'px';
	document.getElementById("bcid").style.height = height;
	document.getElementById("bcid").style.width = width;

	var ws = null;
	var scan = null;
	var isOpen = false; // 闪光灯是否开始标志 true:闪光灯已经开启 false:闪光灯关闭
	var source = '';
//	var sourceView = null;

	m.plusReady(function() {
		m.init();
		ws = plus.webview.currentWebview();
		source = ws.source;
		startRecognize();
	});

	// 条码识别成功事件
	function onmarked(type, result) {
		//		var text = '未知: ';
		//		switch(type) {
		//			case plus.barcode.QR:
		//				text = 'QR: '; // 二维码
		//				break;
		//			case plus.barcode.EAN13:
		//				text = 'EAN13: ';
		//				break;
		//			case plus.barcode.EAN8:
		//				text = 'EAN8: ';
		//				break;
		//		}
		//		alert(text + result);
//		if(source == 'outing-details')
//			sourceView = plus.webview.getWebviewById('outing-details');
//		else if(source == 'inventory-register')
//			sourceView = plus.webview.getWebviewById('inventory-register');

		var sourceView = plus.webview.getWebviewById(source);
		m.fire(sourceView, "scanner", {
			qRCode: result
		});
		m.back();
	}

	// 条码识别成功事件
	function onerror() {
		var text = '二维码识别失败，试试退出当前页面重进';
		alert(text);
	}

	// 创建扫描控件
	function startRecognize() {
		var filter;
		var styles = {
			frameColor: '#29E52C',
			scanbarColor: '#29E52C',
			background: ''
		};
		scan = new plus.barcode.Barcode('bcid', filter, styles);
		scan.onmarked = onmarked;
		scan.onerror = onerror;
		scan.start();
	}
	// 重新扫描
	document.getElementById("resetScan").addEventListener('tap', function() {
		scan.cancel();
		scan.close();
		startRecognize();
	});
	//  开启和关闭闪光灯
	document.getElementById("setFlash").addEventListener('tap', function() {
		isOpen = !isOpen;
		if(isOpen) {
			scan.setFlash(true);
		} else {
			scan.setFlash(false);
		}
	});

});