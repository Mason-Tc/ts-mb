define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	//下拉刷新对象
	var inventoryExpPullRefresh = null;
	var screenHeight = getClientHeight();
	var inventoryExponentVue = new Vue({
		el: '#inventoryExponent',
		data: {
			reportDate: '',
			// 出入库指数数据
			inventoryExpPage: {
				totalPage: 1,
				pageSize: 99999,
				pageNo: 1,
				inventoryExpList: [],
				totalInventoryWeight: 0
			},
			invListStyle:'height: '+(screenHeight-150)+'px;',
		},
		methods: {
			/**
			 * 
			 * @param {Object} params
			 * @param {Object} callback
			 */
			query: function(params, callback) {
				var self = this;
				m.ajax(app.api_url + '/api/warehouseOnline/inventoryExponent', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；W
					success: function(data) {
						var date = new Date();
						self.reportDate = '(' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ')';
						//如果查询第一页，就将所有数据清空
						if(self.inventoryExpPage.pageNo === 1) {
							self.inventoryExpPage.totalPage = data.totalPage;
							self.inventoryExpPage.inventoryExpList = data.list;
							
						} else {
							self.inventoryExpPage.totalPage = data.totalPage;
							self.inventoryExpPage.inventoryExpList = self.inventoryExpPage.inventoryExpList.concat(data.list);
						}
						//计算总计值
						self.inventoryExpPage.totalInventoryWeight = 0;
						if(self.inventoryExpPage.inventoryExpList.length){
							for (var i = 0; i < self.inventoryExpPage.inventoryExpList.length; i++) {
								if(self.inventoryExpPage.inventoryExpList[i].inventoryWeight){
									self.inventoryExpPage.totalInventoryWeight = com.accAdd(self.inventoryExpPage.totalInventoryWeight,self.inventoryExpPage.inventoryExpList[i].inventoryWeight);
								}
							}
						}else{
							self.inventoryExpPage.totalInventoryWeight = 0;
						}
						
						if(typeof callback === "function") {
							callback();
						}
					},
					error: function(xhr, type, errorThrown) {
						if(typeof callback === "function") {
							callback();
						}
						m.toast("网络异常，请重新试试");
					}
				});
			},

			/**
			 * 
			 * @param {Object} warehouseID
			 * @param {Object} callback
			 */
			doQuery: function(callback) {
				this.query({
					'pageNo': this.inventoryExpPage.pageNo,
					'pageSize': this.inventoryExpPage.pageSize
				}, callback);
			},

			/*
			下拉查询， 即第一页查询 
			*/
			pullDownQuery: function() {
				this.inventoryExpPage.pageNo = 1;
				var self = this;
				this.doQuery(function() {
					inventoryExpPullRefresh.endPulldownToRefresh();
//					inventoryExpPullRefresh.scrollTo(0, 0, 100);
					//if return totalPage greet zero enablePullupToRefresh
					if(self.inventoryExpPage.totalPage > 1) {
						inventoryExpPullRefresh.refresh(true);
					}
				});
			},

			/**
			 * 上拉查询，即第一页查询
			 */
			pullUpQuery: function() {
				if(this.inventoryExpPage.pageNo < this.inventoryExpPage.totalPage) {
					this.inventoryExpPage.pageNo++;
					this.doQuery(function() {
						inventoryExpPullRefresh.endPullupToRefresh();
					});
				} else {
					inventoryExpPullRefresh.endPullupToRefresh(true);
					/*window.setTimeout(function() {
						inventoryExpPullRefresh.disablePullupToRefresh();
					}, 2000);*/
				}
			},

			/*
			 *  查询出入库指数
			 */
			inventoryExponentQuery: function() {
				this.inventoryExpPage.pageNo = 1;
				var self = this;
				this.doQuery(function() {
					inventoryExpPullRefresh.endPulldownToRefresh();
					//if return totalPage greet zero enablePullupToRefresh
					if(self.inventoryExpPage.totalPage > 1) {
						inventoryExpPullRefresh.refresh(true);
					}
				});
			},
			toExponentReport: function(warehouseId, warehouseName) {
				m.openWindow({
					id: 'customer-exponent',
					"url": '../../exponent-report/html/exponent-report-new.html',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: true
					},
					extras: {
						//自定义扩展参数，可以用来处理页面间传值
						'indexStatParam': {
							'warehouseId': warehouseId,
							'warehouseShortName': warehouseName,
							'gotoIndex': 0,
							'methods': 'extrasOpenCustomerExponent'
						}
					}
				});
			}
		}
	});
	
	inventoryExpPullRefresh = m('#inventoryExpPullRefresh').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				inventoryExponentVue.pullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			callback: function() {
				inventoryExponentVue.pullUpQuery();
			}
		}
	});
	function getClientHeight()
	{
	  var clientHeight=0;
	  if(document.body.clientHeight&&document.documentElement.clientHeight)
	  {
	  var clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
	  }
	  else
	  {
	  var clientHeight = (document.body.clientHeight>document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
	  }
	  return clientHeight;
	}
	return inventoryExponentVue;
});