

define(function (global, factory) {
	//给String类型增加一个div方法。
	String.prototype.div = function (arg){
	    return accDiv(this, arg);
	};
	//给String类型增加一个mul方法。
	String.prototype.mul = function (arg){
	    return accMul(arg,this);
	};
	//给String类型增加一个add方法。
	String.prototype.add = function (arg){
	    return accAdd(arg,this);
	};
	//给String类型增加一个subtr方法。
	String.prototype.subtr = function (arg){
	    return accSub(this, arg);
	};
	/**
	 ** 加法函数，用来得到精确的加法结果
	 ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
	 ** 调用：accAdd(arg1,arg2)
	 ** 返回值：arg1加上arg2的精确结果
	**/
	var accAdd = function accAdd(arg1, arg2) {
	    var r1, r2, m, c;
	    try {
	        r1 = arg1.toString().split(".")[1].length;
	    }
	    catch (e) {
	        r1 = 0;
	    }
	    try {
	        r2 = arg2.toString().split(".")[1].length;
	    }
	    catch (e) {
	        r2 = 0;
	    }
	    c = Math.abs(r1 - r2);
	    m = Math.pow(10, Math.max(r1, r2));
	    if (c > 0) {
	        var cm = Math.pow(10, c);
	        if (r1 > r2) {
	            arg1 = Number(arg1.toString().replace(".", ""));
	            arg2 = Number(arg2.toString().replace(".", "")) * cm;
	        } else {
	            arg1 = Number(arg1.toString().replace(".", "")) * cm;
	            arg2 = Number(arg2.toString().replace(".", ""));
	        }
	    } else {
	        arg1 = Number(arg1.toString().replace(".", ""));
	        arg2 = Number(arg2.toString().replace(".", ""));
	    }
	    return (arg1 + arg2) / m;
	}
	
	/**
	 ** 减法函数，用来得到精确的减法结果
	 ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
	 ** 调用：accSub(arg1,arg2)
	 ** 返回值：arg1减去arg2的精确结果
	 **/
	var accSub = function accSub(arg1, arg2) {
	    var r1, r2, m, n;
	    try {
	        r1 = arg1.toString().split(".")[1].length;
	    }
	    catch (e) {
	        r1 = 0;
	    }
	    try {
	        r2 = arg2.toString().split(".")[1].length;
	    }
	    catch (e) {
	        r2 = 0;
	    }
	    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
	    n = (r1 >= r2) ? r1 : r2;
	    return ((arg1 * m - arg2 * m) / m).toFixed(n);
	}
	
	/**
	 ** 乘法函数，用来得到精确的乘法结果
	 ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
	 ** 调用：accMul(arg1,arg2)
	 ** 返回值：arg1乘以 arg2的精确结果
	 **/
	var accMul = function accMul(arg1, arg2) {
	    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
	    try {
	        m += s1.split(".")[1].length;
	    }
	    catch (e) {
	    }
	    try {
	        m += s2.split(".")[1].length;
	    }
	    catch (e) {
	    }
	    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
	}
	
	/** 
	 ** 除法函数，用来得到精确的除法结果
	 ** 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
	 ** 调用：accDiv(arg1,arg2)
	 ** 返回值：arg1除以arg2的精确结果
	 **/
	var accDiv = function accDiv(arg1, arg2) {
	    var t1 = 0, t2 = 0, r1, r2;
	    try {
	        t1 = arg1.toString().split(".")[1].length;
	    }
	    catch (e) {
	    }
	    try {
	        t2 = arg2.toString().split(".")[1].length;
	    }
	    catch (e) {
	    }
	    with (Math) {
	        r1 = Number(arg1.toString().replace(".", ""));
	        r2 = Number(arg2.toString().replace(".", ""));
	        return (r1 / r2) * pow(10, t2 - t1);
	    }
	}
	/**
	 * 如arg为null或未定义或是长度为0的字符串则返回false，否则返回true；
	 * @param arg
	 * @returns {Boolean}
	 */
	function isNotBlank(arg){
		if(arg == null || arg == undefined || arg === ''){
			return false;
		}else{
			return true;
		}
	}
	/**
	 * 是否是资源的有效数字
	 * @param num 待校验数字
	 * @param numType 资源数字类型
	 * @returns {Boolean}
	 */
	function isValidResNum(num,numType){
		if(isNotBlank(num)){
			var r = /^\d*\b$/;
			switch (numType){
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
		}else{
			return false;
		}
	}
	/* 生成金额格式数字*/
	function fmoney(s, n) {  
	    n = n > 0 && n <= 20 ? n : 2;
	    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";  
	    var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];  
	    t = "";  
	    for (i = 0; i < l.length; i++) {  
	        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");  
	    }  
	    return t.split("").reverse().join("") + "." + r;  
	}  
	/* 还原金额格式数字*/
	function rmoney(s) {  
	    return parseFloat(s.replace(/[^\d\.-]/g, ""));  
	}
	
	return {
		'accAdd': accAdd,
		'accSub': accSub,
		'accMul': accMul,
		'accDiv': accDiv
	};
})
