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

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		source = ws.source;
		startRecognize();
	});

	// 条码识别成功事件
	function onmarked(type, result) {
		// m.toast('扫描成功，作业单号为: ' + result)
		var webView = plus.webview.currentWebview().opener()
		mui.fire(webView, 'scanner', {
			qRCode: result
		})
		m.back()
	}

	// 条码识别成功事件
	function onerror() {
		var text = '二维码识别失败，试试退出当前页面重进';
		m.toast(text)
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