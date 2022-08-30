/**
 *固定表格头与最左列
 */
define(function(require, exports, module) {
	function setTable(heightParam, tbIndex) {
		var body = document.querySelector("body");
		var fixedTable = document.querySelector(".m-main-table" + tbIndex);
		if(!fixedTable) {
			return;
		}
		//表格caption
		var caption = fixedTable.querySelector("caption");
		//表格第一个td
		var tdLeft = fixedTable.querySelector(".td-left" + tbIndex);
		//表格头部div
		var divHeader = fixedTable.querySelector(".t-header" + tbIndex);
		//表格左边div
		var divLeft = fixedTable.querySelector(".t-left" + tbIndex);
		//内容div
		var divContent = fixedTable.querySelector(".t-content" + tbIndex);

		//calculate height for scroll 
		var height = body.clientHeight - fixedTable.offsetTop -
			tdLeft.offsetHeight;
		//if cpation exsit
		if(caption) {
			height -= caption.offsetHeight;
		}
		//		height-=155;
		height -= !heightParam ? 155 : heightParam;
		//fixed div for scroll
		divLeft.style.height = height + "px";
		divContent.style.height = height + "px";
		//follow with move
		divContent.addEventListener("scroll", function() {
			var scrollLeft = this.scrollLeft;
			var scrollTop = this.scrollTop;
			divHeader.scrollLeft = scrollLeft;
			divLeft.scrollTop = scrollTop;
		}, false);
		//		divLeft.addEventListener("scroll", function() {
		//			var scrollTop = this.scrollTop;
		//			divContent.scrollTop = scrollTop;
		//		}, false);
	}

	function setTable1(heightParam, tbIndex, isSetHeight) {
		var body = document.querySelector("body");
		var fixedTable = document.querySelector(".m-main-table" + tbIndex);
		if(!fixedTable) {
			return;
		}
		//表格caption
		var caption = fixedTable.querySelector("caption");
		//表格第一个td
		var tdLeft = fixedTable.querySelector(".td-left" + tbIndex);
		//表格头部div
		var divHeader = fixedTable.querySelector(".t-header" + tbIndex);
		//表格左边div
		var divLeft = fixedTable.querySelector(".t-left" + tbIndex);
		//内容div
		var divContent = fixedTable.querySelector(".t-content" + tbIndex);

		if(isSetHeight) {
			//calculate height for scroll 
			var height = body.clientHeight - fixedTable.offsetTop -
				tdLeft.offsetHeight;
			//if cpation exsit
			if(caption) {
				height -= caption.offsetHeight;
			}
			//		height-=155;
			height -= !heightParam ? 155 : heightParam;
			//fixed div for scroll
			divLeft.style.height = height + "px";
			divContent.style.height = height + "px";
		}
		//follow with move
		divContent.addEventListener("scroll", function() {
			var scrollLeft = this.scrollLeft;
			var scrollTop = this.scrollTop;
			divHeader.scrollLeft = scrollLeft;
			divLeft.scrollTop = scrollTop;
		}, false);
		//		divLeft.addEventListener("scroll", function() {
		//			var scrollTop = this.scrollTop;
		//			divContent.scrollTop = scrollTop;
		//		}, false);
	}

	return {
		'setTable': setTable,
		'setTable1': setTable1
	}
});