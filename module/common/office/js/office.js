
define(function(require, module, exports) {
	var app = require("app");
	var jQuery = require("jquery");
	require("ztree");
	var treeSetting = require("./tree-setting.js");
	var tree = null;
	jQuery.get(app.api_url+"/api/fl/office/treeData?extId=&type=2&isAll=true&_t="
					+ new Date().getTime(), function(zNodes){
				// 初始化树结构
				tree = jQuery.fn.zTree.init(jQuery("#tree"), treeSetting, zNodes);
				// 默认展开一级节点
				var nodes = tree.getNodesByParam("level", 0);
				for(var i=0; i<nodes.length; i++) {
					tree.expandNode(nodes[i], true, false, false);
				}
				//异步加载子节点（加载用户）
				/*var nodesOne = tree.getNodesByParam("isParent", true);
				for(var j=0; j<nodesOne.length; j++) {
					tree.reAsyncChildNodes(nodesOne[j],"!refresh",true);
				}*/
				
			});
});