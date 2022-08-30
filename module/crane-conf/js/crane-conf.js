define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("zepto");
	m.plusReady(function() {
		// 回显已选择的月台
		aboutVue.selectedPlatform();
		aboutVue.selectedRowCar();
	})
	var waiting;
	var aboutVue = new Vue({
		el: '#about-detail',
		data: {
			pfList:[],
			rowcarList:[]
		},
		methods: {
			// 查询用户已选择的月台
			selectedPlatform:function(){
				m.ajax(app.api_url + '/api/rowcar/getPlatformInfo', {
					data: {},
					dataType: 'json', 
					type: 'get', 
					timeout: 10000,
					success: function(res) {
						aboutVue.pfList=res;
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			},
			// 查询用户已选择的行车
			selectedRowCar:function(){
				m.ajax(app.api_url + '/api/rowcar/getRowCar', {
					data: {},
					dataType: 'json', 
					type: 'get', 
					timeout: 10000,
					success: function(res) {
						aboutVue.rowcarList=res;
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			},
			// 选择月台时的效果
			cliMe:function(flag){
				var has=$("#pf"+flag).hasClass("activeBg");
				if(has){
					$("#pf"+flag).removeClass("activeBg");
					//$("#pf"+flag).addClass("contentSpan");
				}else{
					//$("#pf"+flag).removeClass("contentSpan");
					$("#pf"+flag).addClass("activeBg");
				}
			},
			// 选择行车时的效果
			cliCrane:function(flag, index){
				if(index === 0) {
					index = 1; // 月台1组有行车01南北
				}
				var correspondingPFList =  this.pfList[index-1].platformVOList;
				
				$("#pfBtns .contentSpan").removeClass("activeBg");
				$("#pfBtns .contentSpan input[name='platform']").prop('checked', false);
				
				for (var i = 0; i < correspondingPFList.length; i++) {
					var correspondingPF = correspondingPFList[i];
					$("#pfInput"+correspondingPF.id).prop('checked', true);
					$("#pf"+correspondingPF.id).addClass("activeBg");
				}
				
				$("#craneDiv .contentCrane").removeClass("activeBg")
				$("#crane"+flag).addClass("activeBg");
			},
			
			resetChecked: function() {
				$("input").prop("checked", false);
				$(".activeBg").removeClass("activeBg").addClass("contentSpan");
			},
			complete: function() {
				var pfs = "";
				var radioEls = $("#craneDiv input:checked");
				if (radioEls.length==0) {
					m.toast("请选择行车",{duration:10000,type:'div'});
					return;
				}
				// 行车
				let craneId=$(radioEls[0]).val();
				let craneName=$(radioEls[0]).next().text();
				craneName=craneName.replace("行车","").replace("北","").replace("南","");
				//console.log($(radioEls[0]).val());
				var els = $("#pfBtns input:checked");
				if (els.length > 0) {
					if (els.length > 2) {
						m.toast("月台不能跨组选择",{duration:10000,type:'div'});
						return;
					} else {
						if (els.length == 2) {
							let a = $(els[0]).val();
							let b = $(els[1]).val();
							let abs = Math.abs(parseFloat(a) - parseFloat(b));
							if (abs == 5) {
								let tempNum=(parseFloat(a) - parseFloat(craneName))+(parseFloat(b) - parseFloat(craneName));
								if(tempNum!=5&&tempNum!=15&&tempNum!=25){
									m.toast("行车和月台不匹配",{duration:10000,type:'div'});
									return;
								}else{
									pfs = a + "," + b;
								}
							} else {
								m.toast("月台不能跨组选择",{duration:10000,type:'div'});
								return;
							}
						} else {
							let a = $(els[0]).val();
							let n=parseFloat(a) - parseFloat(craneName);
							if(n==0||n==5||n==10){
								pfs = a;
							}else{
								m.toast("行车和月台不匹配",{duration:10000,type:'div'});
								return;
							}
						}
					}
					if (pfs.length > 0) {
						savePlatform(craneId,pfs);
					}
				}else{
					m.toast("请选择月台",{duration:10000,type:'div'});
					return;
				}
			}
		}
	});
	
	// 保存选择月台
    function savePlatform(rowCarId,pfs){
		waiting = plus.nativeUI.showWaiting();
		m.ajax(app.api_url + '/api/rowcar/saveRowCarSelectedInfo', {
			data: {
				'rowCarId': rowCarId,
				'platformIds': pfs
			},
			dataType: 'json', 
			type: 'post', 
			timeout: 10000,
			success: function(res) {
				waiting.close();
				m.toast(res.msg);
				if(res.status){
					m.back();
				}
			},
			error: function(xhr, type, errorThrown) {
				waiting.close();
				m.toast("网络异常，请重新试试");
			}
		});
	}
	
	
	
});
