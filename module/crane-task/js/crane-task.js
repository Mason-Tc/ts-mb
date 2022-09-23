define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("jquery")
	require("../../../js/common/common.js");
	var ws=null;
	m.plusReady(function() {
		var backDefault = m.back;
		function detailBack() {
			aboutVue.back();
			backDefault();
		}
		m.back = detailBack;
	});
	
	var aboutVue = new Vue({
		el: '#off-canvas',
		data: {
			allInfo:{},
			activePlat:'1',
			platformList:[{id:'1',name:'月台1'},{id:'3',name:'月台3'}],
			src:'./crane-in.html'
		},
		methods:{
			back:function(){
				m.openWindow({
					id: 'openCraneManage',
					"url": '../../crane-index/html/crane-index.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {}
				});
			},
			gotoNav:function(id){
				this.activePlat = id
				if(id==1){
					this.src = './crane-in.html'
				}
				if(id==2){
					this.src = './crane-out.html'
				}
				if(id==3){
					this.src = './crane-process.html'
				}
			}
		}
	});
});