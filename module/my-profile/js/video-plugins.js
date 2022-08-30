define(function(require, module, exports) 
{
    var videoPlugin=function(docPath,cameraName, succ, error){
    		var _BARCODE = 'ZTCamera';
			var B = window.plus.bridge;
	        var success = typeof successCallback !== 'function' ? null : function(args)
	        {
	        	succ(args);
	        },
	        fail = typeof errorCallback !== 'function' ? null : function(code)
	        {
	        	error(code);
	        };
	        // 将两个callback方法进行封装，并生成一个CallbackID传递给Native层
	        callbackID = B.callbackId(success, fail);
		    return B.execSync(_BARCODE, "playVideo", [callbackID, docPath, cameraName]);
		}  
    return videoPlugin;
});
