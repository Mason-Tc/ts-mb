define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");

	//下拉刷新对象
	var customerpullRefresh = null;

	var customerExpVue = new Vue({
		el: "#customerpullRefresh",
		data: {
			localWarehouseID: '',
			localOwnerName: '',
			// 客户指数数据
			customerExpPage: {
				totalPage: 1,
				pageSize: 20,
				pageNo: 1,
				list: []
			},
			customerAuth:app.user.isPrivilege('exponent:report:customer:api'),
		},
		methods: {
			/**
			 * 根据查询参数查询
			 * @param {Object} params 查询参数
			 * @param {Function} callback
			 */
			cstmrQuery: function(params, callback) {
				var self = this;
				m.ajax(app.api_url + '/api/exponentReportApi/customerExponents', {
					data: params,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						//如果查询第一页，就将所有数据清空
						if(self.customerExpPage.pageNo === 1) {
							self.customerExpPage.totalPage = data.totalPage;
							self.customerExpPage.list = data.list;
						} else {
							self.customerExpPage.totalPage = data.totalPage;
							self.customerExpPage.list = self.customerExpPage.list.concat(data.list);
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

			doQuery: function(warehouseID, ownerName, callback) {
				this.cstmrQuery({
					'pageNo': this.customerExpPage.pageNo,
					'pageSize': this.customerExpPage.pageSize,
					'warehouseID': warehouseID,
					'ownerName': ownerName
				}, callback);
			},

			/*
			下拉查询， 即第一页查询 
			*/
			pullDownQuery: function() {
				this.customerExpPage.pageNo = 1;
				var self = this;
				this.doQuery(this.localWarehouseID, this.localOwnerName, function() {
					customerpullRefresh.endPulldownToRefresh();
//					customerpullRefresh.scrollTo(0, 0, 100);
					//if return totalPage greet zero enablePullupToRefresh
					if(self.customerExpPage.totalPage > 1) {
						customerpullRefresh.refresh(true);
					}
				});
			},

			/**
			 * 上拉查询，即第一页查询
			 */
			pullUpQuery: function() {
				if(this.customerExpPage.pageNo < this.customerExpPage.totalPage) {
					this.customerExpPage.pageNo++;
					this.doQuery(this.localWarehouseID, this.localOwnerName, function() {
						customerpullRefresh.endPullupToRefresh();
					});
				} else {
					customerpullRefresh.endPullupToRefresh(true);
					window.setTimeout(function() {
						customerpullRefresh.disablePullupToRefresh();
					}, 2000);
				}
			},

			/*
			 * 查询客户指数
			 */
			customerExpQuery: function(warehouseID, ownerName) {
				if(this.localWarehouseID === warehouseID && this.localOwnerName === ownerName) {
					return;
				} else {
					this.localWarehouseID = warehouseID;
					this.localOwnerName = ownerName;
					this.customerExpPage.pageNo = 1;
					var self = this;
					this.doQuery(warehouseID, ownerName, function() {
						//if return totalPage greet zero enablePullupToRefresh
						if(self.customerExpPage.totalPage > 1) {
							customerpullRefresh.refresh(true);
						}
					});
				}
			},

			/*
			 * 格式化占比
			 */
			format: function(ratio) {
				return ratio.toFixed(2) + "%";
			}
		}
	});

	//下拉刷新对象
	customerpullRefresh = m('#customerpullRefresh').pullRefresh({
		down: {
			contentrefresh: '加载中...',
			callback: function() {
				customerExpVue.pullDownQuery();
			}
		},
		up: {
			contentrefresh: '正在加载...',
			callback: function() {
				customerExpVue.pullUpQuery();
			}
		}
	});

	return customerExpVue;
});