/**
 * 图片懒加载
 * @param {Object}   obj       DOMElement
 * @param {Function} callback  加载完成回调函数
 * 
 * @author leiming
 * @version 1.0.0 
 */

(function(window) {
	'use strict';
	
	define(function(require) {
		var debug = false; // 默认打印调试日志
		var app = require("app");
		var md5 = require("md5");
		var dig = require("download-img-file");
		function lazyload(obj) {
			proccesImg(obj);
			//proccesPreImg(obj);
		}
		/**
		 * 处理缓加载图片
		 * @param {Object} obj DOMElement
		 */
		function proccesImg(obj){
			//如果已经处理过缓存，就不再处理了
			if(obj.getAttribute('data-loaded')) {
				return;
			}
			var imgUrl = obj.getAttribute('data-lazyload');
			if(!imgUrl){
				return ;
			}
			if(debug) {
				console.log(imgUrl);
			}
			dig.downloadImgFile(imgUrl,function(filePath){
				// 1.1 存在，则直接显示（本地已缓存，不需要淡入动画）
				obj.setAttribute('src', filePath);
				obj.setAttribute('data-loaded', true);
				obj.classList.add('img-lazyload');
			});
		}
		
		/**
		 * 处理缓加载图片
		 * @param {Object} obj DOMElement
		 */
		function proccesPreImg(obj){
			//如果已经处理过缓存，就不再处理了
			if(obj.getAttribute('data-preview-loaded')) {
				return;
			}
			var imgUrl = obj.getAttribute('data-preview-src');
			if(!imgUrl){
				return ;
			}
			if(debug) {
				console.log(imgUrl);
			}
			dig.downloadImgFile(imgUrl,function(filePath){
				// 1.1 存在，则直接显示（本地已缓存，不需要淡入动画）
				obj.setAttribute('data-preview-src', filePath);
				obj.setAttribute('data-preview-loaded', true);
			});
		}
		//对外输出引用
		window.lazyload = lazyload;
		
		return {
			'lazyload':lazyload
		}
	});
})(window);