define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("parabola");
	require("../../../js/common/common.js");
	m.init({
		/*beforeback: function(){
			//获得列表界面的webview
			var outingDetailsPage = plus.webview.currentWebview().opener();
			//触发列表界面的自定义事件（refresh）,从而进行数据刷新
			mui.fire(outingDetailsPage, 'batchAddMaterials', {
				"materialList": globalVue.addList
			});
			//返回true，继续页面关闭逻辑
			return true;
		}*/
	});

	m.plusReady(function() {
		ws = plus.webview.currentWebview();
		globalVue.ownerId = ws.ownerId;
		globalVue.warehouseId = ws.warehouseId;
		var materielDetail = ws.materielDetail;
		var excludeIds = ws.excludeIds.replace(/\,/, '');
		globalVue.initList({
			ownerId: globalVue.ownerId,
			warehouseId: globalVue.warehouseId,
			brandId: materielDetail.brandId,
			textureId: materielDetail.textureId,
			specificationId: materielDetail.specificationId,
			placesteelId: materielDetail.placesteelId,
			excludeIds: excludeIds
		});
		
		outingDetailsPage = plus.webview.getWebviewById('outing-details');
						mui.fire(outingDetailsPage, 'batchAddMaterials', {
							"materialList": self.addList
						});
						
		var backDefault = m.back;
		function detailBack() {
			var outingDetailsView = plus.webview.getWebviewById('outing-details');
			m.fire(outingDetailsView, "comeBack", {});
			backDefault();
		}
		m.back = detailBack;
		
		//设置footer绝对位置
		document.getElementById('btnList').style.top = (plus.display.resolutionHeight - 48) + "px";
	});

	var globalVue = new Vue({
		el: '#batchAdd',
		data: {
			ballIndex: 0,
			ownerId: null,
			warehouseId: null,
			materielList: [], // 筛选后的list
			allMaterielList: [], // 初始时所有的list
			checkList: [], // 打勾选中的list
			checkIds: [], // 打勾选中的list的id
			isCheckedAll: false, // 全选状态
			searchVal: '', // 搜索的值
			addList: [], // 打勾选中的需要提交的List
			totalInfo: '', // 合计值
			realNumUnitDesc: '', // 数量单位
			realWeightUnitDesc: '', // 重量单位
		},
		methods: {
			initList: function(params, callback) {
				var self = this;
				m.ajax(app.api_url + '/api/proOutput/getOutInventorys', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					//timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						self.materielList = data;
						self.allMaterielList = data;
						self.realNumUnitDesc = self.allMaterielList ? self.allMaterielList[0].numUnitDesc : '件';
						self.realWeightUnitDesc = self.allMaterielList ? self.allMaterielList[0].weightUnitDesc : '吨(t)';
						/*console.log(JSON.stringify(data));*/
						self.buildTotalInfo();
						if(typeof callback === "function") {
							callback();
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
			},
			ballDrop: function(e, index, checkId) {
				var self = this;
				var top = $(e.target).offset().top;
				var topArea = $(window).height() - top - 34;
				var leftArea = $("footer input[type='button']").offset().left;
				var $ball = null;
				var bool = null;
				var ballIndex = 0;
				var $ballEle = null;
				var idIndex = 0;
				if($(e.target).is(":checked")) { // 由于click事件的延迟性,所以判断相反,这里不能用tap事件,有BUG
					self.checkIds.push(checkId);
					//小球的脚本
					self.ballIndex++;
					$ball = $("<div class='ball' data-ball='ball" + self.ballIndex + "'></div>");
					$("#batchAdd").append($ball);
					$ballEle = $("[data-ball='ball" + self.ballIndex + "']");
					$ballEle.css({
						top: top,
						visibility: "visible"
					});
					$ballEle.animate({
						opacity: 1
					}, 100, function() {
						$(this).animate({
							opacity: 0
						}, 1000);
					});
					bool = new Parabola({
						el: "[data-ball='ball" + self.ballIndex + "']",
						offset: [leftArea, topArea],
						curvature: 0.005,
						duration: 600,
						callback: function() {
							$ballEle.remove();
						},
						stepCallback: function(x, y) {}
					});
					bool.start();
				} else {
					idIndex = self.checkIds.indexOf(checkId);
					if(idIndex >= 0) {
						// 如果已经包含了该id, 则去除(单选按钮由选中变为非选中状态)
						self.checkIds.splice(idIndex, 1)
					}
					$("[data-ball='ball" + this.ballIndex + "']").remove();
				}
				
				if(self.checkIds.length === self.materielList.length){
					self.isCheckedAll = true;
				} else {
					self.isCheckedAll = false;
				}
				self.buildTotalInfo();
			},
			checkedAll: function() {
				this.isCheckedAll = !this.isCheckedAll;
				if(this.isCheckedAll) {
					// 全选时
					this.checkIds = [];
					this.materielList.forEach(function(item) {
						this.checkIds.push(item.id)
					}, this);
				} else {
					this.checkIds = [];
				}
				this.buildTotalInfo(); 
			},
			buildTotalInfo: function() {
				var self = this;
				self.totalInfo = "合计:0" + self.realNumUnitDesc + "/0" + self.realWeightUnitDesc;
				self.checkList = self.allMaterielList.filter(function(item){
					return self.checkIds.indexOf(item.id) != -1;
				}, this);
				/*console.log('被选中的列表:'+JSON.stringify(self.checkList));*/
				if(self.checkList && self.checkList.length > 0) {
					var totalNum = 0;
					var totalWeight = 0.0;
					m.each(self.checkList, function(index, itm) {
						if(itm) {
							var realNumUnit = itm.supplyNum ? parseInt(itm.supplyNum) : 0;
							var realWeight = itm.supplyWeight ? parseFloat(itm.supplyWeight) : 0;
							totalNum += realNumUnit;
							totalWeight += realWeight;
						}
					});
					var totalWeightStr = isDecimal(totalWeight) ? totalWeight.toFixed(3) : totalWeight;
					self.totalInfo = "合计:" + totalNum + self.realNumUnitDesc + "/" + totalWeightStr + self.realWeightUnitDesc;
					/*console.log(self.totalInfo);*/
				}
			},
			search: function() {
				var self = this;
				var reg = null;
				var keyWord = self.searchVal;
				reg = new RegExp(keyWord, 'i');
				self.materielList = self.allMaterielList.filter(function(item){
					var key = item.packageNo.search(reg);
					return key != -1;
				},this);
				self.isCheckedAll = false;
				self.checkIds = [];
				self.buildTotalInfo();
			},
			submit: function() {
				var self = this;
				var outingDetailsPage = null;
				if(self.checkIds.length==0){
					alert('请选择您要添加的数据!');
					return;
				}
				var includeIds = self.checkIds.join(',');
				m.ajax(app.api_url + '/api/proOutput/addOutputDetails', {
					data: {
						ownerId: self.ownerId,
						warehouseId: self.warehouseId,
						includeIds: includeIds
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					//timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						self.addList = data;
						outingDetailsPage = plus.webview.getWebviewById('outing-details');
						mui.fire(outingDetailsPage, 'batchAddMaterials', {
							"materialList": self.addList
						});
						m.back();
					},
					error: function(xhr, type, errorThrown) {
						m.toast("网络异常，请重新试试");
					}
				});
					
				
			}
		}
	});

	function initHeight() {
		var windowHeight = $(window).height();
		$('#batchAddList').height(windowHeight - 148);
		$(window).resize(function() {
			var windowHeight = $(window).height();
			$('#batchAddList').height(windowHeight - 148);
		});
	}
	initHeight();
	mui('#batchAddList').scroll({
		deceleration: 0.1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: true
	});
});