define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	require('jquery');
	m.init();
	var slider = m("#slider1").slider();
	m('#ivntScrollDiv').scroll({
		deceleration: 0.0005, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#brandScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#textureScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#specificationScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#placesteelScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	m('#mtxScrollDiv').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	// 右侧查询框
	var offCanvasWrapper = m("#offCanvasWrapper");
	var mask = m.createMask(function() {
		if(offCanvasWrapper.offCanvas().isShown("right")) {
			offCanvasWrapper.offCanvas('close');
			mask.close();
		}
	}, 'contentDiv');
	var cameraListVue = new Vue({
		el: '#offCanvasWrapper',
		data: {
			cstmrId: '',
			warehouseId: '',
			seWarehouseName: '',
			cstmrList: [],
			ivntList: [],
			totalWeight: 0,
			conditions: {},
			textureList: [],
			brandSort: 'desc',//品名
			textureSort: 'desc',//材质
			specificationSort: 'desc',//规格
//			placesteelSort: 'desc',//产地
			inventorySort: 'desc',//库存量
			sortColumn: '',
			sortColumns: ["品名","材质","规格","产地","库存量(吨)"],
			selectedMtxs:{},
//			mtxDivStyle0:"height:90px;top:46px;",
//			mtxDivStyle1:"height:90px;top:130px;",
//			mtxDivStyle2:"height:90px;top:220px;",
//			mtxDivStyle3:"height:90px;top:310px;",
//			mtxLabelClass0:"mui-icon mui-icon-arrowdown",
//			mtxLabelClass1:"mui-icon mui-icon-arrowdown",
//			mtxLabelClass2:"mui-icon mui-icon-arrowdown",
//			mtxLabelClass3:"mui-icon mui-icon-arrowdown"
//			mtxDivStyle:["height:90px;top:46px;","height:90px;top:130px;","height:90px;top:220px;","height:90px;top:310px;"],
//			mtxLabelClass:["mui-icon mui-icon-arrowdown","mui-icon mui-icon-arrowdown","mui-icon mui-icon-arrowdown","mui-icon mui-icon-arrowdown"]
		},
		methods: {
			showOffExponentQuery: function() {
				offCanvasWrapper.offCanvas('show');
				mask.show();
			},
			getmtxLabelClass:function(idx){
				return this.mtxLabelClass[idx];
			},
			/**
			 * 隐藏查询框
			 */
			hideOffCanvaQuery: function() {
				offCanvasWrapper.offCanvas('close');
				mask.close();
			},
			cstmrAClass:function(idx){
				if(cameraListVue.cstmrList.length>0 && cameraListVue.cstmrList[0].first==true && idx==0){
					return "mui-control-item cstmrA selectedTD";
				}else{
					return "mui-control-item cstmrA";
				}
				
			},
			cyqCstmrAClass:function(idx){
				if(cameraListVue.cstmrList.length>0 && cameraListVue.cstmrList[0].first==true && idx==0){
					return "cyq-control-item cstmrA selectedTD";
				}else{
					return "cyq-control-item cstmrA";
				}
				
			},
			removeSltMtx:function(evnet, type, id){
				var	selectedObj = $(event.currentTarget);
				var fireOnThis = document.getElementById(selectedObj.attr("tagId"));
				m.trigger(fireOnThis, 'tap');
				
//				m.trigger(tabItems[index], 'tap');
			},
			unfoldUl:function(idx){
				var isfold=-90;
				var selectedLabel = eval("cameraListVue.mtxLabelClass"+idx);
				var selectedDiv = eval("cameraListVue.mtxDivStyle"+idx);
				var sufStyle=selectedDiv.substring(selectedDiv.indexOf(';'));
				if(selectedLabel=="mui-icon mui-icon-arrowdown"){
//					cameraListVue.$set(cameraListVue.mtxLabelClass,idx,"mui-icon mui-icon-arrowup");
//					Vue.set(cameraListVue.mtxLabelClass,idx,"mui-icon mui-icon-arrowup");
					eval("cameraListVue.mtxLabelClass"+idx+"='mui-icon mui-icon-arrowup';");
					eval("cameraListVue.mtxDivStyle"+idx+"='height:180px"+sufStyle+"';");
					isfold=90;
					
				}else{
//					Vue.set(cameraListVue.mtxLabelClass,idx,"mui-icon mui-icon-arrowdown");
					eval("cameraListVue.mtxLabelClass"+idx+"='mui-icon mui-icon-arrowdown'");
					eval("cameraListVue.mtxDivStyle"+idx+"='height:180px"+sufStyle+"';");
				}
				
				
				switch(idx){
					case 0:
					case 1:
						var texturePre=cameraListVue.mtxDivStyle1.substring(0,cameraListVue.mtxDivStyle1.indexOf(";"));
						cameraListVue.mtxDivStyle1=texturePre+";top:"+(Number(cameraListVue.mtxDivStyle1.substring(cameraListVue.mtxDivStyle1.lastIndexOf(":")+1,cameraListVue.mtxDivStyle1.lastIndexOf("px")))+isfold)+"px;"
					case 2:
						var spPre=cameraListVue.mtxDivStyle2.substring(0,cameraListVue.mtxDivStyle2.indexOf(";"));
						cameraListVue.mtxDivStyle2=spPre+";top:"+(Number(cameraListVue.mtxDivStyle2.substring(cameraListVue.mtxDivStyle2.lastIndexOf(":")+1,cameraListVue.mtxDivStyle2.lastIndexOf("px")))+isfold)+"px;"
					case 3:
						var stPre=cameraListVue.mtxDivStyle3.substring(0,cameraListVue.mtxDivStyle3.indexOf(";"));
						cameraListVue.mtxDivStyle3=stPre+";top:"+(Number(cameraListVue.mtxDivStyle3.substring(cameraListVue.mtxDivStyle3.lastIndexOf(":")+1,cameraListVue.mtxDivStyle3.lastIndexOf("px")))+isfold)+"px;"
					break;
				}
			},
			searchIvntDetail: function(evt, curId, warehouseId, seWarehouseName) {
				var self = this;
				var $openWarehouseMenu = $("#openWarehouseMenu");
				cameraListVue.seWarehouseName = seWarehouseName;
				if(cameraListVue.cstmrList.length>0){cameraListVue.cstmrList[0].first=false;}
				var selectedObj;
				if(evt != null) {
					selectedObj = $(evt.currentTarget);
					var cpsId=selectedObj.attr("class").substring(0,selectedObj.attr("class").indexOf(" "))+selectedObj.attr("mtxId");
				} else {
					selectedObj = $(null);
				}
				var cstmrId = '',
					brandId = '',
					textureId = '',
					specificationId = '',
					placesteelId = '';
				if(selectedObj.hasClass("cstmrA")) {
					cstmrId=curId;
					selectedObj.addClass('selectedTD');
				} else if(selectedObj.hasClass("brandA")) {
					if(selectedObj.hasClass('selectedTD')){
						selectedObj.removeClass('selectedTD');
						cameraListVue.textureList=[];
						Vue.delete(cameraListVue.selectedMtxs, 0);
						Vue.delete(cameraListVue.selectedMtxs, 1);
					}else{
						selectedObj.addClass('selectedTD');
						cameraListVue.textureList=eval('cameraListVue.conditions.textureMap._'+selectedObj.attr('mtxId'));
						Vue.set(cameraListVue.selectedMtxs, 0, {id:cpsId,name:selectedObj.text(),tagId:selectedObj.attr('id')});
						if(cameraListVue.selectedMtxs["1"]){
							Vue.delete(cameraListVue.selectedMtxs, 1);
						}
					}
				}else if(selectedObj.hasClass("textureA")) {
					if(selectedObj.hasClass('selectedTD')){
						selectedObj.removeClass('selectedTD');
						eval('delete cameraListVue.selectedMtxs.'+cpsId);
						Vue.delete(cameraListVue.selectedMtxs, 1);
					}else{
						selectedObj.addClass('selectedTD');
						Vue.set(cameraListVue.selectedMtxs, 1, {id:cpsId,name:selectedObj.text(),tagId:selectedObj.attr('id')});
						if(selectedObj.hasClass("brandA")){
							Vue.delete(cameraListVue.selectedMtxs, 1);
						}
					}
				}else if(selectedObj.hasClass("specificationA")) {
					if(selectedObj.hasClass('selectedTD')){
						selectedObj.removeClass('selectedTD');
						eval('delete cameraListVue.selectedMtxs.'+cpsId);
						Vue.delete(cameraListVue.selectedMtxs, 2);
					}else{
						selectedObj.addClass('selectedTD');
						Vue.set(cameraListVue.selectedMtxs, 2, {id:cpsId,name:selectedObj.text(),tagId:selectedObj.attr('id')});
					}
				}else if(selectedObj.hasClass("placesteelA")) {
					if(selectedObj.hasClass('selectedTD')){
						selectedObj.removeClass('selectedTD');
						eval('delete cameraListVue.selectedMtxs.'+cpsId);
						Vue.delete(cameraListVue.selectedMtxs, 3);
					}else{
						selectedObj.addClass('selectedTD');
						Vue.set(cameraListVue.selectedMtxs, 3, {id:cpsId,name:selectedObj.text(),tagId:selectedObj.attr('id')});
					}
				}else{
					cstmrId=curId;
					if(cameraListVue.cstmrList.length>0){
						cameraListVue.cstmrList[0].first=true;
					}
				}
//				console.log(JSON.stringify(cameraListVue.selectedMtxs));
				$('.selectedTD').each(function() {
					var obj = $(this);
					if(obj.hasClass("cstmrA")) {
						if(selectedObj.hasClass("cstmrA")){
							cstmrId=curId;
							if(obj.attr('mtxId')!=curId){
							obj.removeClass('selectedTD');
							}
						}else{
							cstmrId=obj.attr('mtxId');
						}
					}else if(obj.hasClass("brandA")) {
//						console.log("brandA:"+selectedObj.hasClass("brandA"));
						if(selectedObj.hasClass("brandA")){
							obj.removeClass('selectedTD');
							textureId='';
							/*if(obj.attr('mtxId')!=curId){
								brandId='';
								console.log('被清空');
							}else{
								brandId=curId;
								selectedObj.addClass('selectedTD');
								console.log('被赋值');
							}*/
							brandId=curId;
							selectedObj.addClass('selectedTD');
						}else{
							brandId=obj.attr('mtxId');
						}
						
					}else if(obj.hasClass("textureA")) {
//						console.log("textureA:"+selectedObj.hasClass("textureA"));
						if(selectedObj.hasClass("textureA")){
							obj.removeClass('selectedTD');
							/*if(obj.attr('mtxId')!=curId){
								textureId='';
							}else{
								textureId=curId;
								selectedObj.addClass('selectedTD');
							}*/
							textureId=curId;
							selectedObj.addClass('selectedTD');
						}else{
							textureId=obj.attr('mtxId');
							if(selectedObj.hasClass("brandA")){
								textureId='';
							}
						}
					}else if(obj.hasClass("specificationA")) {
						if(selectedObj.hasClass("specificationA")){
							obj.removeClass('selectedTD');
							/*if(obj.attr('mtxId')!=curId){
								specificationId='';
							}else{
								specificationId=selectedObj.attr('mtxId');
								selectedObj.addClass('selectedTD');
							}*/
							specificationId=selectedObj.attr('mtxId');
							selectedObj.addClass('selectedTD');
						}else{
							specificationId=obj.attr('mtxId');
						}
					}else if(obj.hasClass("placesteelA")) {
						if(selectedObj.hasClass("placesteelA")){
							obj.removeClass('selectedTD');
							/*if(obj.attr('mtxId')!=curId){
								placesteelId='';
							}else{
								placesteelId=selectedObj.attr('mtxId');
								selectedObj.addClass('selectedTD');
							}*/
							placesteelId=selectedObj.attr('mtxId');
							selectedObj.addClass('selectedTD');
						}else{
							placesteelId=obj.attr('mtxId');
						}
					}
				});
				console.log('cstmrId:' + cstmrId + ',warehosueId=' + warehouseId + ',brandId=' + brandId + ',textureId=' + textureId + ',specificationId=' + specificationId + ',placesteelId=' + placesteelId);
				m.getJSON(app.api_url + '/api/exponentReportApi/cstmrIvntDetail?_t=' + new Date().getTime() + '&totalPage=1&pageSize=9999&pageNo=1&warehouseId=' + warehouseId + '&ownerId=' + cstmrId + '&brandId=' + brandId + '&textureId=' + textureId + '&specificationId=' + specificationId + '&placesteelId=' + placesteelId, function(data2) {
					cameraListVue.ivntList = data2.list;
//					console.log(JSON.stringify(cameraListVue.ivntList));
					$('#ivntScrollDiv>.mui-scroll').css({
						WebkitTransform: 'translate3d(0px,0px,0px)',
						MozTransform: 'translate3d(0px,0px,0px)',
						MsTransform: 'translate3d(0px,0px,0px)',
						transform: 'translate3d(0px,0px,0px)'
					});
					$('#warhouse-menu ul').on('tap', 'li', function() {
						$('#warhouse-menu').css({
							opacity: '0',
							visibility: 'hidden'
						});
						$('.cyq_mask').css({
							visibility: 'hidden',
							opacity: '0'
						});
						$openWarehouseMenu.removeClass('hidden-menu');
						$openWarehouseMenu.addClass('show-menu');
					});
					//计算总计值
					self.totalWeight = 0;
					if (self.ivntList != null && self.ivntList.length > 0) {
						for (var i = 0; i < self.ivntList.length; i++) {
							if (self.ivntList[i].weight) {
								self.totalWeight = com.accAdd(self.totalWeight, self.ivntList[i].weight);
							}
						}
					} else {
						self.totalWeight = 0;
					}
				});

				function switchSelected(targetObj, curSelectedObj) {
					targetObj.addClass('selectedTD');
					curSelectedObj.removeClass('selectedTD');
				}
				//				this.hideOffCanvaQuery();
			},
			brandSortMth: function($event){
				var self = this;
				event.stopPropagation();
//				alert(JSON.stringify(self.ivntList));
				if (self.ivntList == null || self.ivntList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.brandName < y.brandName) {
						return -1;
					} else if(x.brandName > y.brandName) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.brandName < y.brandName) {
						return 1;
					} else if(x.brandName > y.brandName) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[0];
				if(self.brandSort === 'desc') {
					self.brandSort = 'asc';
					self.ivntList = self.ivntList.sort(asc);
				} else {
					self.brandSort = 'desc';
					self.ivntList = self.ivntList.sort(desc);
				}
				swaiting.close();
			},
			textureSortMth: function($event){
				var self = this;
				event.stopPropagation();
				if (self.ivntList == null || self.ivntList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.textureName < y.textureName) {
						return -1;
					} else if(x.textureName > y.textureName) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.textureName < y.textureName) {
						return 1;
					} else if(x.textureName > y.textureName) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[1];
				if(self.textureSort === 'desc') {
					self.textureSort = 'asc';
					self.ivntList = self.ivntList.sort(asc);
				} else {
					self.textureSort = 'desc';
					self.ivntList = self.ivntList.sort(desc);
				}
				swaiting.close();
			},
			specificationSortMth: function($event){
				var self = this;
				event.stopPropagation();
				if (self.ivntList == null || self.ivntList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.specificationName < y.specificationName) {
						return -1;
					} else if(x.specificationName > y.specificationName) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.specificationName < y.specificationName) {
						return 1;
					} else if(x.specificationName > y.specificationName) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[2];
				if(self.specificationSort === 'desc') {
					self.specificationSort = 'asc';
					self.ivntList = self.ivntList.sort(asc);
				} else {
					self.specificationSort = 'desc';
					self.ivntList = self.ivntList.sort(desc);
				}
				swaiting.close();
			},
			inventorySortMth: function($event){
				var self = this;
				event.stopPropagation();
				if (self.ivntList == null || self.ivntList.length < 1) {
					return;
				}
				var swaiting = plus.nativeUI.showWaiting("");
				//升序
				var asc = function(x, y) {
					if(x.weight < y.weight) {
						return -1;
					} else if(x.weight > y.weight) {
						return 1;
					} else {
						return 0;
					}
				}
				//降序
				var desc = function(x, y) {
					if(x.weight < y.weight) {
						return 1;
					} else if(x.weight > y.weight) {
						return -1;
					} else {
						return 0;
					}
				}
				self.sortColumn = self.sortColumns[4];
				if(self.inventorySort === 'desc') {
					self.inventorySort = 'asc';
					self.ivntList = self.ivntList.sort(asc);
				} else {
					self.inventorySort = 'desc';
					self.ivntList = self.ivntList.sort(desc);
				}
				swaiting.close();
			}
		}
	});
	
	/*选择仓库菜单样式 脚本*/
		var $openWarehouseMenu = $("#openWarehouseMenu");
		var $warhouseMenu = $('#warhouse-menu');
		var $cyqMask = $('.cyq_mask');
		$openWarehouseMenu.on("tap", function() {
			var $this = $(this);
			if($this.hasClass('show-menu')){
				$warhouseMenu.css({ 
					visibility: 'visible',
					opacity: '1'
				});
				$cyqMask.css({ 
					visibility: 'visible',
					opacity: '.3'
				});
				$this.removeClass('show-menu');
				$this.addClass('hidden-menu');
			} else if($this.hasClass('hidden-menu')){
				$warhouseMenu.css({ 
					opacity: '0',
					visibility: 'hidden'
				});
				$cyqMask.css({ 
					visibility: 'hidden',
					opacity: '0'
				});
				$this.removeClass('hidden-menu');
				$this.addClass('show-menu');
			}
			
		})
		$cyqMask.on("tap", function() {
			$warhouseMenu.css({ 
				opacity: '0',
				visibility: 'hidden'
			});
			$cyqMask.css({ 
				visibility: 'hidden',
				opacity: '0'
			});
			$openWarehouseMenu.removeClass('hidden-menu');
			$openWarehouseMenu.addClass('show-menu');
		})
		var screenHeight = $(window).height();
		$('#ivntScrollDiv').height(screenHeight - $('#ivntScrollDiv').offset().top - 1);
	/*选择仓库菜单样式 脚本结束*/
	
	m.plusReady(function() {
		slider.setStopped(true); //禁止滑动
		var self = plus.webview.currentWebview();
		cameraListVue.cstmrList = self.cstmrList;
		cameraListVue.cstmrId = self.cstmrId;
		cameraListVue.warehouseId = self.warehouseId;
		cameraListVue.seWarehouseName = cameraListVue.cstmrList[0].ownerName;
		m.getJSON(app.api_url + '/api/sysBusinessBasis/materialConditions?_t=' + new Date().getTime(), function(data) {
			cameraListVue.conditions = data;
		});
		cameraListVue.searchIvntDetail(null, cameraListVue.cstmrId, cameraListVue.warehouseId, cameraListVue.seWarehouseName);
	});
});