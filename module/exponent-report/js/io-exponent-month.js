define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");

	//下拉刷新对象
	var itemformonthpullRefresh = null;

	var ioExponetMonVue = new Vue({
		el: '#itemformonthpullRefresh',
		data: {
			localioWarehouseID: '',
			// 出入库指数数据
			ioExpMonPage: {
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
						if(self.ioExpMonPage.pageNo === 1) {
							self.ioExpMonPage.totalPage = data.totalPage;
							self.ioExpMonPage.list = data.list;
						} else {
							self.ioExpMonPage.totalPage = data.totalPage;
							self.ioExpMonPage.list = self.ioExpMonPage.list.concat(data.list);
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
					'pageNo': this.ioExpMonPage.pageNo,
					'pageSize': this.ioExpMonPage.pageSize,
					'warehouseID': warehouseID,
					'periodType': '1'
				}, callback);
			},
			
			/*
			下拉查询， 即第一页查询 
			*/
			pullDownQuery: function() {
				if(this.localioWarehouseID === ''){
					return;
				}
				this.ioExpMonPage.pageNo = 1;
				var self = this;
				this.doQuery(this.localioWarehouseID, function() {
					itemformonthpullRefresh.endPulldownToRefresh();
					itemformonthpullRefresh.scrollTo(0, 0, 100);
					//if return totalPage greet zero enablePullupToRefresh
					if(self.ioExpMonPage.totalPage > 1) {
						itemformonthpullRefresh.refresh(true);
					}
				});
			},

			/**
			 * 上拉查询，即第一页查询
			 */
			pullUpQuery: function() {
				if(this.localioWarehouseID === ''){
					itemformonthpullRefresh.endPullupToRefresh();
					itemformonthpullRefresh.disablePullupToRefresh();
					return;
				}
				if(this.ioExpMonPage.pageNo < this.ioExpMonPage.totalPage) {
					this.ioExpMonPage.pageNo++;
					this.doQuery(this.localioWarehouseID, function() {
						itemformonthpullRefresh.endPullupToRefresh();
					});
				} else {
					itemformonthpullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						itemformonthpullRefresh.disablePullupToRefresh();
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
					this.ioExpMonPage.pageNo = 1;
					var self = this;
					this.doQuery(warehouseID, function(){
						itemformonthpullRefresh.endPulldownToRefresh();
						//if return totalPage greet zero enablePullupToRefresh
						if(self.ioExpMonPage.totalPage > 1) {
							itemformonthpullRefresh.refresh(true);
						}
					});
					
				}
			}
		}
	});

	itemformonthpullRefresh = m('#itemformonthpullRefresh').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				ioExponetMonVue.pullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			callback: function() {
				ioExponetMonVue.pullUpQuery();
			}
		}
	});

	return ioExponetMonVue;
});