define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");

	//下拉刷新对象
	var itemforyearpullRefresh = null;

	var ioExponetYearVue = new Vue({
		el: '#itemforyearpullRefresh',
		data: {
			localioWarehouseID: '',
			// 出入库指数数据
			ioExpYearPage: {
				totalPage: 1,
				pageSize: 10,
				pageNo: 1,
				list: []
			}
		},
		methods: {
			/**
			 * 
			 * @param {Object} params
			 * @param {Object} callback
			 */
			query: function(params, callback){
				var self = this;
				m.ajax(app.api_url + '/api/exponentReportApi/ioExponents', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						//如果查询第一页，就将所有数据清空
						if(self.ioExpYearPage.pageNo === 1) {
							self.ioExpYearPage.totalPage = data.totalPage;
							self.ioExpYearPage.list = data.list;
						} else {
							self.ioExpYearPage.totalPage = data.totalPage;
							self.ioExpYearPage.list = self.ioExpYearPage.list.concat(data.list);
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
			doQuery: function(warehouseID, callback) {
				this.query({
					'pageNo': this.ioExpYearPage.pageNo,
					'pageSize': this.ioExpYearPage.pageSize,
					'warehouseID': warehouseID,
					'periodType': '2'
				}, callback);
			},
			
			/*
			下拉查询， 即第一页查询 
			*/
			pullDownQuery: function() {
				if(this.localioWarehouseID === ''){
					return;
				}
				this.ioExpYearPage.pageNo = 1;
				var self = this;
				this.doQuery(this.localioWarehouseID, function() {
					itemforyearpullRefresh.endPulldownToRefresh();
					itemforyearpullRefresh.scrollTo(0, 0, 100);
					//if return totalPage greet zero enablePullupToRefresh
					if(self.ioExpYearPage.totalPage > 1) {
						itemforyearpullRefresh.refresh(true);
					}
				});
			},

			/**
			 * 上拉查询，即第一页查询
			 */
			pullUpQuery: function() {
				if(this.localioWarehouseID === ''){
					itemforyearpullRefresh.endPullupToRefresh();
					itemforyearpullRefresh.disablePullupToRefresh();
					return;
				}
				if(this.ioExpYearPage.pageNo < this.ioExpYearPage.totalPage) {
					this.ioExpYearPage.pageNo++;
					this.doQuery(this.localioWarehouseID, function() {
						itemforyearpullRefresh.endPullupToRefresh();
					});
				} else {
					itemforyearpullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						itemforyearpullRefresh.disablePullupToRefresh();
					}, 2000);
				}
			},

			/*
			 *  查询出入库指数
			 */
			inoutputExpQuery: function(warehouseID) {
				if(warehouseID === this.localioWarehouseID) {
					return;
				} else {
					this.localioWarehouseID = warehouseID;
					this.ioExpYearPage.pageNo = 1;
					var self = this;
					this.doQuery(warehouseID, function(){
						itemforyearpullRefresh.endPulldownToRefresh();
						//if return totalPage greet zero enablePullupToRefresh
						if(self.ioExpYearPage.totalPage > 1) {
							itemforyearpullRefresh.refresh(true);
						}
					});
					
				}
			}
		}
	});

	itemforyearpullRefresh = m('#itemforyearpullRefresh').pullRefresh({
		down: {
			auto: true,
			contentrefresh: '加载中...',
			callback: function() {
				ioExponetYearVue.pullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			callback: function() {
				ioExponetYearVue.pullUpQuery();
			}
		}
	});

	return ioExponetYearVue;
});