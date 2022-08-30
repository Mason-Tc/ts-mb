function showFileSize(size) {
	var i = Math.floor(Math.log(size) / Math.log(1024));
	return(size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function isURL(str_url) {
	var strRegex = '^((https|http|ftp|rtsp|mms)?://)' +
		'?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@ 
		+
		'(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184 
		+
		'|' // 允许IP和DOMAIN（域名） 
		+
		'([0-9a-z_!~*\'()-]+.)*' // 域名- www. 
		+
		'([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名 
		+
		'[a-z]{2,6})' // first level domain- .com or .museum 
		+
		'(:[0-9]{1,4})?' // 端口- :80 
		+
		'((/?)|' // a slash isn't required if there is no file name 
		+
		'(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$';
	var re = new RegExp(strRegex);
	//re.test() 
	if(re.test(str_url)) {
		return(true);
	} else {
		return(false);
	}
}

function changeToNumber(obj) {
	var changeNum = new Number(obj);
	return(changeNum === NaN) ? 0 : changeNum <= 0 ? 0 : changeNum;
}

/**
 * 判断是否为数字
 * @param {Object} s
 */
function isNumber(s) {
	if(s != null && s != "") {
		return !isNaN(s);
	}
	return false;
}

/**
 * 判断是否为整数
 * @param {Object} obj
 */
function isInteger(obj) {
	return Math.floor(obj) === obj
}

/**
 * 判断是否为正整数
 * @param {Object} obj
 */
function isPositiveInteger(obj) {
	var re = /^[1-9]+[0-9]*]*$/;
	return re.test(obj);
}

/**
 * 判断是否为小数
 * @param {Object} obj
 */
function isDecimal(obj) {   
	var re = /^\d+\.\d+$/;   
	return re.test(obj);
} 

/**
 * 如arg为null或未定义或是长度为0的字符串则返回false，否则返回true；
 * @param arg
 * @returns {Boolean}
 */
function isNotBlank(arg) {
	if(arg == null || arg == 'undefined' || arg === '') {
		return false;
	} else {
		return true;
	}
}

/**
 * 是否是资源的有效数字
 * @param num 待校验数字
 * @param numType 资源数字类型
 * @returns {Boolean}
 */
function isValidResNum(num, numType) {
	if(isNotBlank(num)) {
		var r = /^\d*\b$/;
		switch(numType) {
			case 'ratio':
				r = /(^[1-9]\b)|(^[1-9][0-9]\b)|(^100\b)$/;
				break;
			case 'quantity':
				r = /^[1-9][0-9]*\b$/;
				break;
			case 'weight':
				r = /^(([1-9][0-9]*))(\.[0-9]{0,3})?\b$/;
				break;
			case 'price':
				r = /^(0|([1-9][0-9]*))(\.[0-9]{0,2})?\b$/;
				break;
			default:
				r = /^\d*\b$/;
				break;
		}
		return r.test(num);
	} else {
		return false;
	}
}

/* 生成金额格式数字*/
function fmoney(s, n) {
	n = n > 0 && n <= 20 ? n : 2;
	s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
	var l = s.split(".")[0].split("").reverse(),
		r = s.split(".")[1];
	t = "";
	for(i = 0; i < l.length; i++) {
		t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
	}
	return t.split("").reverse().join("") + "." + r;
}

/* 还原金额格式数字*/
function rmoney(s) {
	return parseFloat(s.replace(/[^\d\.-]/g, ""));
}

function getDateNow() {
	var time = new Date();
	var month = time.getMonth() + 1;
	month = month == 0 ? 12 : month;
	month = month >= 10 ? month : '0' + month;
	var yearPrefix = time.getFullYear();
	yearPrefix = month == 12 ? yearPrefix - 1 : yearPrefix;
	var day = time.getDate();
	day = day >= 10 ? day : '0' + day;
	var nowDate = yearPrefix + '-' + month + '-' + day;

	return nowDate;
}

function getDateTimeNow(isCommon) {
	var time = new Date();
	var month = time.getMonth() + 1;
	month = month == 0 ? 12 : month;
	var yearPrefix = time.getFullYear();
	yearPrefix = month == 12 ? yearPrefix - 1 : yearPrefix;
	var day = time.getDate();
	var hour = (time.getHours() % 24) == 0 ? 0 : (time.getHours() % 24);
	var minute = time.getMinutes();
	var second = time.getSeconds();
	var nowDateTime = yearPrefix + '年' + month + '月' + day + "日 " + hour + "时" + minute + "分" + second + "秒";
	if(!isCommon) {
		month = month >= 10 ? month : '0' + month;
		day = day >= 10 ? day : '0' + day;
		hour = hour >= 10 ? hour : '0' + hour;
		minute = minute >= 10 ? minute : '0' + minute;
		second = second >= 10 ? second : '0' + second;
		nowDateTime = yearPrefix + '-' + month + '-' + day + " " + hour + ":" + minute + ":" + second;
	}

	return nowDateTime;
}

function getCurrentMonthFirst() {
	var date = new Date();
	date.setDate(1);
	return date;
}

// 获取当前月的最后一天
function getCurrentMonthLast() {
	var date = new Date();
	var currentMonth = date.getMonth();
	var nextMonth = ++currentMonth;
	var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
	var oneDay = 1000 * 60 * 60 * 24;
	return new Date(nextMonthFirstDay - oneDay);
}

function buildAbbreviation(str, spl, start, end) {
	var newStr = '';
	if(str && str.length > spl) {
		newStr = str.substring(0, start) + '...' + str.substring(str.length - end, str.length);
	} else {
		newStr = str;
	}
	return newStr;
}

function validateTel(tel) {
	var telRegexp = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/;
	if(telRegexp.test(tel)) {
		return true;
	}
	return false;
}

var inputDialogClass = {
	inputDialog: null,
	currView: null,
	showInputDialog: function(currVw, styleParams, intentParams, maskClickFuntion) {
		inputDialogClass.currView = currVw;
		if(inputDialogClass.inputDialog) { // 避免快速多次点击创建多个窗口
			return;
		}
		//		var top = plus.display.resolutionHeight - 300;
		inputDialogClass.inputDialog = plus.webview.create("input-dialog.html", "input-dialog", styleParams, intentParams);
		inputDialogClass.inputDialog.addEventListener("loaded", function() {
			inputDialogClass.inputDialog.show('slide-in-bottom', 300);
		}, false);
		// 显示遮罩层  
		currVw.setStyle({
			mask: "rgba(0,0,0,0.5)"
		});
		// 点击关闭遮罩层
		currVw.addEventListener("maskClick", maskClickFuntion, false);
	},
	closeMask: function() {
		inputDialogClass.currView.setStyle({
			mask: "none"
		});
		//避免出现特殊情况，确保弹出框在初始化时关闭 
		if(!inputDialogClass.inputDialog) {
			inputDialogClass.inputDialog = plus.webview.getWebviewById("input-dialog");
		}
		if(inputDialogClass.inputDialog) {
			inputDialogClass.inputDialog.close();
			inputDialogClass.inputDialog = null;
		}
	}
};