define(function(require, module, exports) {
	var startCamera = function(cameraName, cameraIndexCode, succ, error) {
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
		return B.execSync(_BARCODE, "startCamera", [callbackID, cameraName, cameraIndexCode]);
	}
	
	var openControlling = function(succ, error) {
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
		return B.execSync(_BARCODE, "openControlling", [callbackID]);
	}
	
	return {
		'startCamera': startCamera,
		'openControlling': openControlling
	}
});