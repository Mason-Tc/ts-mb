
define(function(require, module, exports) {
	debugger;
	var app = require("app");
	var req = require("../../../js/common/req.js");
	
	req(app.api_url + "/api/fl/user/getListUser?_t=" + new Date().getTime()).then(function(data){
		debugger;
	}).catch(function(e) {
	 //Generic catch-the rest, error wasn't TypeError nor
	 //ReferenceError
	 debugger;
	});
	
});