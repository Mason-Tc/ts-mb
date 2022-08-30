define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	
	require("layui");
	var $ = require("zepto");
	require("../../../js/common/common.js");

	var layer = null;
	layui.use(['layer'], function() {
		layer = layui.layer;
	});
	
	var swaiting = null;
	var twaiting = null;
	var dataPullRefresh = null;
	var layer = null;
	

	m('#div_list .public-list').scroll({
		deceleration: 0.01, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
	m('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#warehouseScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});


	
	m.init({
		beforeback: function() {
	　　　　 //获得父页面的webview
			var list = plus.webview.currentWebview().opener();
	　　　　 //触发父页面的自定义事件(refresh),从而进行刷新
			m.fire(list, 'doRefresh');
			//返回true,继续页面关闭逻辑
			return true;
		}
	});
	var ws;
	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.getDetailData(ws.detailId);
		globalVue.proDispatchDetail.id=ws.detailId;
	});

	var globalVue = new Vue({
		el: '#off-canvas',
		data: {
			proDispatchDetail:{},// 调拨明细
			warehousePlace:{},
			warehousePlaceSubList:[],// 物料对应的子库位列表
			subList:[],// 子库位
			capacity:'',// 容量
			platformList:[],// 月台数据
			warehousePlaceList:[]// 所有库位数据
		},
		methods: {
			editCapacity:function(warehouseId){
				// 先查询子库位的信息，再弹窗
				var self=this;
				m.ajax(app.api_url + '/api/warehousePlace/detailAdjustForm?_t=' + new Date().getTime(), {
					data: {'id':warehouseId},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒； 
					success: function(res) {
						self.warehousePlace=res.warehousePlace;
						self.warehousePlaceSubList=res.warehousePlaceSubList;
						layer.open({
							type: 1,
							shade: 0.3,
							title: "调整容量",
							content: $("#handleDiv"),
							area: ['600px', '370px'],
							btn: ['确 定'],
							cancel: function(index) {
								var inputEls=$("#handleDiv input");
								$(inputEls).val('');
							 	layer.close(index);
							},
							yes:function(index, layero){
								// 组装数据
								var params=new Map();
								params=self.warehousePlace;
								params.createBy=null;
								params.updateBy=null;
								var sub=self.warehousePlaceSubList;
								for(var i=0;i<sub.length;i++){
									params['warehousePlaceSubList[' + i +'].capacity'] = sub[i].capacity;
									params['warehousePlaceSubList[' + i +'].id'] = sub[i].id;
								}
								m.ajax(app.api_url + '/api/warehousePlace/detailCapacityAdjust?_t=' + new Date().getTime(), {
									data: params,
									dataType: 'json', //服务器返回json格式数据
									type: 'post', //HTTP请求类型
									timeout: 10000, //超时时间设置为60秒；
									success: function(res) {
										m.toast(res.msg);
										if(res.status){
											self.getDetailData(self.proDispatchDetail.id);
											layer.close(index);
										}
									},
									error: function(xhr, type, errorThrown) {
										if(swaiting) {
											swaiting.close();
										}
										m.toast("网络异常，请重新试试");
									}
								});
							}
						})
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
				
			},
			// 调整详情数据初始化
			getDetailData:function(id){
				var self=this;
				m.ajax(app.api_url + '/api/dispatch/capacityAdjustForm?_t=' + new Date().getTime(), {
					data: {id:id},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒； 
					success: function(res) {
						self.subList=res.subList;
						self.capacity=res.capacity;
						self.platformList=res.platformList;
						self.proDispatchDetail=res.proDispatchDetail;
						self.warehousePlaceList=res.warehousePlaceList;
						var len=self.warehousePlaceList.length;
						// 设置图片显示
						var sLen=self.subList.length;
						for(var j=0;j<sLen;j++){
							var subId=self.subList[j].warehousePlaceId;
							$("#"+subId+"_img").addClass("imgShow");
						}
						// 设置库位背景
						for(var i=0;i<len;i++){
							var wp=self.warehousePlaceList[i];
							var wpId=wp.id;
							var wpLevel=wp.usageLevel;
							// 设置库位背景颜色
							$("#"+wpId).addClass("level"+wpLevel);
							// 设置库位名称
							$("#"+wpId+"_pname").text(wp.warehousePlaceName);
							
							// 设置可用容量
							var maxNum=wp.maxNum;
							var usedNum=wp.usedNum;
							var usable=(parseFloat(maxNum)-parseFloat(usedNum)).toFixed(3);
							$("#"+wpId+"_usable").text(usable+"吨");
						}
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			// 保存接受重量
			editDetail: function() {
				var self=this;
				var params=new Map();
				params=self.proDispatchDetail;
				params.createBy=null;
				params.updateBy=null;
				m.ajax(app.api_url + '/api/dispatch/adjustCapacity?_t=' + new Date().getTime(), {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为60秒；
					success: function(res) {
						if(res.status){
							// 自己设置文字，后台只返回状态
							//self.getDetailData(self.proDispatchDetail.id);
							m.toast('操作成功',{duration:'long'});
							setInterval(function(){m.back();},1000)
						}else{
							m.toast(res.msg,{duration:'long'});
						}
						
					},
					error: function(xhr, type, errorThrown) {
						if(swaiting) {
							swaiting.close();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},
			// 显示小格子的提示
			tipDetail:function(id){
				m.ajax(app.api_url + '/api/warehousePlace/warehousePlaceDetail?_t=' + new Date().getTime(), {
					data: {'warehouseId':globalVue.proDispatchDetail.warehouseId,'id':id},
					//dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000,
					success: function(res) {
						layer.tips(res,"#"+id);
					}
				});
				// 判断图片是否显示
				var showFlag=$("#"+id+"_img").hasClass("imgShow");
				if(showFlag){
					// 改变右边库位背景
					$("#detailTb tr").removeClass("trbg");
					$("#"+id+"_tr").addClass("trbg");
				}
				
			},
			// 格式化小数点
			formatDecimal:function(numb){
				return parseFloat(numb.toFixed(3));
			}
		}
	});

	
});