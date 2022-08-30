define(function(require) {
	var app = require("app");
	var setting = {
		view: {
			selectedMulti: false,
			dblClickExpand: false
		},
		check: {
			enable: false,
			nocheckInherit: true
		},
		async: {
			enable: false,
			url: app.api_url+"/api/fl/user/treeData",
			autoParam: ["id=officeId"]
		},
		data: {
			simpleData: {
				enable: true
			}
		},
		callback: {
			onClick: function(event, treeId, treeNode) {
				
			},
			onCheck: function(e, treeId, treeNode) {
				
			},
			onAsyncSuccess: function(event, treeId, treeNode, msg) {
				
			},
			onDblClick: function() {
				
			}
		}
	};
	return setting;
});