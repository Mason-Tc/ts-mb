define(function(require, module, exports) {
	var printerConnection = function(succ, error) {
		var _BARCODE = 'ZTCommon';
		var B = window.plus.bridge;
		var success = typeof successCallback !== 'function' ? null : function(args) {
				succ(args);
			},
			fail = typeof errorCallback !== 'function' ? null : function(code) {
				error(code);
			};
		// 将两个callback方法进行封装，并生成一个CallbackID传递给Native层
		callbackID = B.callbackId(success, fail);
		return B.execSync(_BARCODE, "printerConnection", [callbackID]);
	}
	
	var printLabel = function(source, jsonStr, succ, error) {
		var _BARCODE = 'ZTCommon';
		var B = window.plus.bridge;
		var success = typeof successCallback !== 'function' ? null : function(args) {
				succ(args);
			},
			fail = typeof errorCallback !== 'function' ? null : function(code) {
				error(code);
			};
		// 将两个callback方法进行封装，并生成一个CallbackID传递给Native层
		callbackID = B.callbackId(success, fail);
		return B.execSync(_BARCODE, "printLabel", [callbackID, source, jsonStr]);
	}

	return {
		'printerConnection': printerConnection,
		'printLabel':printLabel
	}
});