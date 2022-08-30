define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");

	//下拉刷新对象
	var itemfortodaypullRefresh = null;

	var ioExponetDayVue = new Vue({
		el: '#itemfortodaypullRefresh',
		data: {
			localioWarehouseID: '',
			// 出入库指数数据
			ioExpDayPage: {
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
						if(self.ioExpDayPage.pageNo === 1) {
							self.ioExpDayPage.totalPage = data.totalPage;
							self.ioExpDayPage.list = data.list;
						} else {
							self.ioExpDayPage.totalPage = data.totalPage;
							self.ioExpDayPage.list = self.ioExpDayPage.list.concat(data.list);
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
					'pageNo': this.ioExpDayPage.pageNo,
					'pageSize': this.ioExpDayPage.pageSize,
					'warehouseID': warehouseID,
					'periodType': '0'
				}, callback);
			},
			
			/*
			下拉查询， 即第一页查询 
			*/
			pullDownQuery: function() {
				if(this.localioWarehouseID === ''){
					return;
				}
				this.ioExpDayPage.pageNo = 1;
				var self = this;
				this.doQuery(this.localioWarehouseID, function() {
					itemfortodaypullRefresh.endPulldownToRefresh();
					itemfortodaypullRefresh.scrollTo(0, 0, 100);
					//if return totalPage greet zero enablePullupToRefresh
					if(self.ioExpDayPage.totalPage > 1) {
						itemfortodaypullRefresh.refresh(true);
					}
				});
			},

			/**
			 * 上拉查询，即第一页查询
			 */
			pullUpQuery: function() {
				if(this.localioWarehouseID === ''){
					itemfortodaypullRefresh.endPullupToRefresh();
					itemfortodaypullRefresh.disablePullupToRefresh();
					return;
				}
				if(this.ioExpDayPage.pageNo < this.ioExpDayPage.totalPage) {
					this.ioExpDayPage.pageNo++;
					this.doQuery(this.localioWarehouseID, function() {
						itemfortodaypullRefresh.endPullupToRefresh();
					});
				} else {
					itemfortodaypullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						itemfortodaypullRefresh.disablePullupToRefresh();
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
					this.ioExpDayPage.pageNo = 1;
					var self = this;
					this.doQuery(warehouseID, function(){
						itemfortodaypullRefresh.endPulldownToRefresh();
						//itemfortodaypullRefresh.scrollTo(0, 0, 100);
						//if return totalPage greet zero enablePullupToRefresh
						if(self.ioExpDayPage.totalPage > 1) {
							itemfortodaypullRefresh.refresh(true);
						}
					});
					
				}
			}
		}
	});

	itemfortodaypullRefresh = m('#itemfortodaypullRefresh').pullRefresh({
		down: {
			auto: true,
			contentrefresh: '加载中...',
			callback: function() {
				ioExponetDayVue.pullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			callback: function() {
				ioExponetDayVue.pullUpQuery();
			}
		}
	});

	return ioExponetDayVue;
});