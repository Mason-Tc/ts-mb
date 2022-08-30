define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	var com = require("computer");
	//下拉刷新对象
	var inOutExpPullRefresh = null;
	var screenHeight = getClientHeight();
	var warehouseIOExpVue = new Vue({
		el: '#inOutputExponent',
		data: {
			reportDate: '',
			// 出入库指数数据
			warehouseIOExpPage: {
				totalPage: 1,
				pageSize: 99999,
				pageNo: 1,
				warehouseIOExpList: [],
				totalInOutputWeight: 0
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
				m.ajax(app.api_url + '/api/warehouseOnline/warehouseIOExponent', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；W
					success: function(data) {
						var date = new Date();
						self.reportDate = '(' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ')';
						//如果查询第一页，就将所有数据清空
						if(self.warehouseIOExpPage.pageNo === 1) {
							self.warehouseIOExpPage.totalPage = data.totalPage;
							self.warehouseIOExpPage.warehouseIOExpList = data.list;
						} else {
							self.warehouseIOExpPage.totalPage = data.totalPage;
							self.warehouseIOExpPage.warehouseIOExpList = self.warehouseIOExpPage.warehouseIOExpList.concat(data.list);
						}
						//计算总计值
						self.warehouseIOExpPage.totalInOutputWeight = 0;
						if(self.warehouseIOExpPage.warehouseIOExpList.length){
							for (var i = 0; i < self.warehouseIOExpPage.warehouseIOExpList.length; i++) {
								if(self.warehouseIOExpPage.warehouseIOExpList[i].inOutputWeight){
									self.warehouseIOExpPage.totalInOutputWeight = com.accAdd(self.warehouseIOExpPage.totalInOutputWeight,self.warehouseIOExpPage.warehouseIOExpList[i].inOutputWeight);
								}
							}
						}else{
							self.warehouseIOExpPage.totalInOutputWeight = 0;
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
					'pageNo': this.warehouseIOExpPage.pageNo,
					'pageSize': this.warehouseIOExpPage.pageSize
				}, callback);
			},

			/*
			下拉查询， 即第一页查询 
			*/
			pullDownQuery: function() {
				this.warehouseIOExpPage.pageNo = 1;
				var self = this;
				this.doQuery(function() {
					inOutExpPullRefresh.endPulldownToRefresh();
//					inOutExpPullRefresh.scrollTo(0, 0, 100);
					//if return totalPage greet zero enablePullupToRefresh
					if(self.warehouseIOExpPage.totalPage > 1) {
						inOutExpPullRefresh.refresh(true);
					}
				});
			},

			/**
			 * 上拉查询，即第一页查询
			 */
			pullUpQuery: function() {
				if(this.warehouseIOExpPage.pageNo < this.warehouseIOExpPage.totalPage) {
					this.warehouseIOExpPage.pageNo++;
					this.doQuery(function() {
						inOutExpPullRefresh.endPullupToRefresh();
					});
				} else {
					inOutExpPullRefresh.endPullupToRefresh(true);
					/*window.setTimeout(function() {
						inOutExpPullRefresh.disablePullupToRefresh();
					}, 2000);*/
				}
			},

			/*
			 *  查询出入库指数
			 */
			inOutputExpoentQuery: function() {
				this.warehouseIOExpPage.pageNo = 1;
				var self = this;
				this.doQuery(function() {
					inOutExpPullRefresh.endPulldownToRefresh();
					//if return totalPage greet zero enablePullupToRefresh
					if(self.warehouseIOExpPage.totalPage > 1) {
						inOutExpPullRefresh.refresh(true);
					}
				});
			}
		}
	});

	inOutExpPullRefresh = m('#inOutExpPullRefresh').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				warehouseIOExpVue.pullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			callback: function() {
				warehouseIOExpVue.pullUpQuery();
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
	return warehouseIOExpVue;
});