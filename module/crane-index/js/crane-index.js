define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var $ = require("zepto");
	require("../../../js/common/common.js");
	require("layui");
	
	m.plusReady(function() {
		var layer;
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
		var aboutVue = new Vue({
			el: '#about-detail',
			data: {
				user:app.getUser(),
				pfList:[],
				rowcarList:[],
				capacityAuth: app.getUser().isPrivilege('crane:capacity:api'),
				reciveAuth: app.getUser().isPrivilege('crane:recive:api'),
				warehouseInAuth: app.getUser().isPrivilege('crane:warehouseIn:api'),
				warehouseOutAuth: app.getUser().isPrivilege('crane:warehouseOut:api'),
				platformAuth: app.getUser().isPrivilege('crane:platform:api'),
				warnAuth: app.getUser().isPrivilege('crane:warn:api'),
				emergencyPlatformAuth: app.getUser().isPrivilege('crane:emergencyPlatform:api'),
				emergencyPositionAuth: app.getUser().isPrivilege('crane:emergencyPosition:api'),
				platformStatusAuth: app.getUser().isPrivilege('crane:platformStatus:api'),
				balanceDiffAuth:app.getUser().isPrivilege('crane:balanceDiff:api'),
				outSideWeighAuth: app.getUser().isPrivilege('crane:outSideWeigh:api'),
				outSideEnterAuth: app.getUser().isPrivilege('crane:outSideEnter:api'),
				hangWeightClear: app.getUser().isPrivilege('crane:hangWeightClear:api'),
				guidanceScreenAuth: app.getUser().isPrivilege('screen:guidanceScreenAuth:api'),
				outSideOutAuth: app.getUser().isPrivilege('crane:outSideOut:api')
			},  
			methods: {
				// 查询用户已选择的月台
				selectedPlatform:function(){
					var waiting = plus.nativeUI.showWaiting();
					m.ajax(app.api_url + '/api/rowcar/getPlatformInfo', {
						data: {},
						dataType: 'json', 
						type: 'get', 
						timeout: 10000,
						success: function(res) {
							waiting.close();
							aboutVue.pfList=res;
						},
						error: function(xhr, type, errorThrown) {
							//waiting.close();
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
							//waiting.close();
							m.toast("网络异常，请重新试试");
						}
					});
				},
				// 选择月台时的效果
				cliMe:function(flag){
					var has=$("#pf"+flag).hasClass("activeBg");
					if(has){
						$("#pf"+flag).removeClass("activeBg");
						$("#pf"+flag).addClass("contentSpan");
					}else{
						$("#pf"+flag).removeClass("contentSpan");
						$("#pf"+flag).addClass("activeBg");
					}
				},
				// 选择行车时的效果
				cliCrane:function(flag){
					$("#craneDiv .contentSpan").removeClass("activeBg")
					$("#crane"+flag).addClass("activeBg");
				},
				// 跳转容量调整
				toCapacity: function() {
					m.openWindow({
						id: 'toCapacity',
						"url": '../../crane-capacity/html/capacity-list.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转收货登记
				toRecive: function() {
					m.openWindow({
						id: 'toRecive',
						"url": '../../crane-recive/html/recive-list.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转行车配置
				toCraneConf: function() {
					m.openWindow({
						id: 'toCraneConf',
						"url": '../../crane-conf/html/crane-conf.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转作业告警
				toCraneWarn: function() {
					m.openWindow({
						id: 'toCraneWarn',
						"url": '../../crane-warn/html/crane-warn.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转应急数字月台
				toEmergencyPlatform: function() {
					m.openWindow({
						id: 'emergency-platform',
						"url": '../../crane-emergency-platform/html/emergency-platform.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转应急行车定位
				toEmergencyPosition: function() {
					m.openWindow({
						id: 'emergency-position',
						"url": '../../crane-emergency-position/html/emergency-position.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转月台应急
				toPlatformStatus: function() {
					m.openWindow({
						id: 'platform-status',
						"url": '../../crane-platform-status/html/platform-status.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转磅差应急
				toBalanceDiff: function() {
					m.openWindow({
						id: 'balance-diff-list',
						"url": '../../crane-balance-diff/html/balance-diff-list.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转库外作业
				toOutSideWeigh: function() {
					m.openWindow({
						id: 'outside-list',
						"url": '../../crane-outside-weigh/html/outside-list.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转室外入库作业
				toOutSideEnter: function() {
					m.openWindow({
						id: 'outsideenter-list',
						"url": '../../crane-outside-enter/html/outsideenter-list.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转室外出库作业
				toOutSideOut: function() {
					m.openWindow({
						id: 'outsideout-list',
						"url": '../../crane-outside-out/html/outsideout-list.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转出入库作业
				toCraneWork: function(inOut) {
					//查询用户是否已选择了月台
					var waiting = plus.nativeUI.showWaiting();
					m.ajax(app.api_url + '/api/rowcar/isSelected', {
						data: {},
						dataType: 'json',
						type: 'get',
						timeout: 10000,
						success: function(res) {
							waiting.close();
							if (res.sysDevice) {
								m.openWindow({
									id: 'toCraneWork',
									"url": '../../'+inOut+'/html/'+inOut+'.html',
									show: {
										aniShow: 'pop-in'
									},
									waiting: {
										autoShow: true
									},
									extras: {'rowCar': res.sysDevice,'platforms': res.sysPlatformList}
								});
							} else {
								layer.msg("请先选择作业月台");
								/* layer.open({
									type: 1,
									shade: 0.3,
									title: "选择月台",
									content: $('#platform'),
									btn: ['确 定'],
									area: ['600px', '400px'],
									cancel: function(index) {
										return true;
									},
									yes:function(index, layero){
										aboutVue.savePlatform(index,inOut);
									}
								}); */
							}
						},
						error: function(xhr, type, errorThrown) {
							waiting.close();
							m.toast("网络异常，请重新试试");
						}
					});
				},
				// 跳转吊磅清零
				toHangWeight: function() {
					m.openWindow({
						id: 'hangweight-list',
						"url": '../../crane-hangweight/html/crane-hangweight.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 跳转诱导屏管理
				toGuidanceScreenManage: function() {
					m.openWindow({
						id: 'guidance-screen-manage',
						"url": '../../guidance-screen-manage/html/guidance-screen-manage.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: true
						},
						extras: {}
					});
				},
				// 保存选择月台
				savePlatform:function(index,inOut) {
					var pfs = "";
					var radioEls = $("#craneDiv input:checked");
					if (radioEls.length==0) {
						m.toast("请选择行车");
						return;
					}
					var rowCarId=$(radioEls[0]).val();
					var els = $("#pfBtns input:checked");
					if (els.length > 0) {
						if (els.length > 2) {
							m.toast("月台不能跨组选择");
							return;
						} else {
							if (els.length == 2) {
								var a = $(els[0]).val();
								var b = $(els[1]).val();
								var abs = Math.abs(parseFloat(a) - parseFloat(b));
								if (abs == 5) {
									pfs = a + "," + b;
								} else {
									m.toast("月台不能跨组选择");
									return;
								}
							} else {
								pfs = $(els[0]).val();
							}
						}
						if (pfs.length > 0) {
							var waiting = plus.nativeUI.showWaiting();
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
									if (res.status) {
										layer.close(index);
										var rowCar={};
										for(var i=0;i<aboutVue.rowcarList.length;i++){
											if(aboutVue.rowcarList[i].id==rowCarId){
												rowCar=aboutVue.rowcarList[i];
												break;
											}
										}
										var sysPlatformList=[];
										var split=pfs.split(",");
										for(var k=0;k<split.length;k++){
											for(var j=0;j<aboutVue.pfList.length;j++){
												var platformVOList=aboutVue.pfList[j].platformVOList;
												for(var n=0;n<platformVOList.length;n++){
													if(split[k]==platformVOList[n].id){
														platformVOList[n].platformName=platformVOList[n].name;
														sysPlatformList.push(platformVOList[n]);
														j=aboutVue.pfList.length;
													}
												}
											}
										}
										
										m.openWindow({
											id: 'toCraneWork',
											"url": '../../'+inOut+'/html/'+inOut+'.html',
											show: {
												aniShow: 'pop-in'
											},
											waiting: {
												autoShow: true
											},
											extras: {'rowCar': rowCar,'platforms': sysPlatformList}
										});
									} else {
										m.toast(res.msg);
									}
								},
								error: function(xhr, type, errorThrown) {
									waiting.close();
									m.toast("网络异常，请重新试试");
								}
							});
						}
					} else {
						m.toast("请选择月台");
						return;
					}
				}
			}
		});
		
		
		// 设置横屏
		plus.screen.lockOrientation("landscape-primary");
		// 查询用户已选择的月台
		aboutVue.selectedPlatform();
		aboutVue.selectedRowCar();
	})
	
	m.init({
		beforeback: function() {
	　　　　 // 设置竖屏
			plus.screen.lockOrientation("portrait-primary");
			return true;
		}
	});
	

});
