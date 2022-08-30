define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");

	m.init({
		//		beforeback: function() {　　
		//			//获得父页面的webview
		//			var warehouseEnteringManagementPage = plus.webview.currentWebview().opener();　　
		//			//触发父页面的自定义事件(getReceivedListFilterVal),从而进行刷新
		//			mui.fire(warehouseEnteringManagementPage, 'getReceivedListFilterVal', {
		//				"receivingCode": globalVue.sureVal.receivingCode,
		//				"ownerId": globalVue.sureVal.ownerId,
		//				"ownerName": globalVue.sureVal.ownerName,
		//				"brandId": globalVue.sureVal.brandId,
		//				"brandName": globalVue.sureVal.brandName,
		//				"receivingStart": globalVue.sureVal.receivingStart,
		//				"receivingEnd": globalVue.sureVal.receivingEnd
		//			});
		//			//返回true,继续页面关闭逻辑
		//			return true;
		//		}
	});

	m(".select-box .content").scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		//		indicators: false
	});
	var dtPicker1 = new mui.DtPicker();
	var dtPicker2 = new mui.DtPicker();

	var globalVue = new Vue({
		el: '#queryContent',
		data: {
			receivingCode: '', //收货单号 
			in_ownerName: '', //未确定的货主单位
			ownerName: '', //货主单位
			in_ownerId: '', //未确定的货主单位ID
			ownerId: '', //货主单位ID
			in_brandId: '', //未确定的品名ID
			brandId: '', //品名ID
			in_brandName: '', //未确定的品名
			brandName: '', //品名
			receivingStart: '', //开始时间
			receivingEnd: '', //截止时间
			currentSelectedBtnIndex: null, //当天,近三天,近一周
			ownerNameList: [], //所有货主单位信息
			typeNameList: [], //所有品名信息
			sureVal: { //点确定才会传值(避免返回也执行过滤功能)
				receivingCode: '',
				ownerId: '',
				ownerName: '',
				brandId: '',
				brandName: '',
				receivingStart: '',
				receivingEnd: ''
			},
		},
		methods: {
			showSelectBox: function(id) {
				var self = this;
				if(id == 'typeNameList') {
					$("#typeNameList.select-box").css({
						display: 'block'
					});
				} else if(id == 'ownerNameList') {
					if(!self.ownerNameList) {
						m.toast('货主单位为空');
						return
					}
					$("#ownerNameList.select-box").css({
						display: 'block'
					});
				}
				$(".cyq_mask").css({
					visibility: 'visible'
				});
			},
			hideSelectBox: function(id, isSure) {
				var self = this;
				if(id == 'typeNameList') {
					if(isSure) {
						self.brandId = self.in_brandId;
						self.brandName = self.in_brandName;
					}
					$("#typeNameList.select-box").css({
						display: 'none'
					});
				} else if(id == 'ownerNameList') {
					if(isSure) {
						self.ownerName = self.in_ownerName;
						self.ownerId = self.in_ownerId;
					}
					$("#ownerNameList.select-box").css({
						display: 'none'
					});
				} else if(!id) {
					$(".select-box").css({
						display: 'none'
					});
				}
				$(".cyq_mask").css({
					visibility: 'hidden'
				});
			},
			pickOwnerName: function(e, text, id) {
				var self = this;
				var $target = $(e.target);
				self.in_ownerName = text;
				self.in_ownerId = id;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
			},
			pickTypeName: function(e, text, id) {
				var self = this;
				var $target = $(e.target);
				self.in_brandId = id;
				self.in_brandName = text;
				$target.parent().find('li').removeClass('select');
				$target.addClass('select');
			},
			pickBeginDate: function() {
				var self = this;
				dtPicker1.show(function(selectItems) {
					self.receivingStart = selectItems.value;
					self.currentSelectedBtnIndex = null;
				})
			},
			pickEndDate: function() {
				var self = this;
				dtPicker2.show(function(selectItems) {
					self.receivingEnd = selectItems.value;
					self.currentSelectedBtnIndex = null;
				})
			},
			todayQuery: function() {
				this.currentSelectedBtnIndex = 0;
				var dateObj = this.getDate();
				var year = dateObj.year;
				var month = dateObj.month < 10 ? '0' + dateObj.month : dateObj.month;
				var date = dateObj.date < 10 ? '0' + dateObj.date : dateObj.date;
				this.receivingStart = year + '-' + month + '-' + date + " 00:00";
				this.receivingEnd = year + '-' + month + '-' + date + " 23:59";
			},
			threeDayQuery: function() {
				this.currentSelectedBtnIndex = 1;
				var dateObj = this.getDate();
				this.calTime(dateObj, 3);
			},
			weekDayQuery: function() {
				this.currentSelectedBtnIndex = 2;
				var dateObj = this.getDate();
				this.calTime(dateObj, 7);
			},
			getDate: function() {
				var myDate = new Date(),
					year = myDate.getFullYear(),
					month = myDate.getMonth() + 1,
					date = myDate.getDate();
				return {
					"year": year,
					"month": month,
					"date": date
				}
			},
			calTime: function(dateObj, nearlyDay) {
				if(!dateObj || !nearlyDay) {
					return;
				}
				var year = dateObj.year,
					month = dateObj.month,
					date = dateObj.date,
					currentYear = null,
					currentMonth = null,
					currentDate = null,
					handleYear = null,
					handleMonth = null,
					handleDate = null,
					addDay = nearlyDay - 1;
				curMonthDays = new Date(year, month, 0).getDate(); //这个月有多少天 ;参数0表示当前 月的第0天，上月的最后一天

				if(date + addDay > curMonthDays) {
					date = (date + addDay) % curMonthDays;
					if(month + 1 > 12) {
						month = 1;
						year++;
					} else {
						month = month + 1;
					}
				} else {
					date = date + addDay;
				}
				currentYear = dateObj.year;
				currentMonth = dateObj.month < 10 ? '0' + dateObj.month : dateObj.month;
				currentDate = dateObj.date < 10 ? '0' + dateObj.date : dateObj.date;
				handleYear = year;
				handleMonth = month < 10 ? '0' + month : month;
				handleDate = date < 10 ? '0' + date : date;
				this.receivingStart = currentYear + '-' + currentMonth + '-' + currentDate + " 00:00";
				this.receivingEnd = handleYear + '-' + handleMonth + '-' + handleDate + " 23:59";
			},
			resetVal: function() {
				this.receivingCode = ''; //收货单号
				this.in_ownerId = ''; //未确定的货主单位ID
				this.ownerId = ''; //货主单位ID
				this.in_ownerName = ''; //未确定的货主单位
				this.ownerName = ''; //货主单位
				this.in_brandId = ''; //未确定的品名ID
				this.brandId = ''; //品名ID
				this.in_brandName = ''; //未确定的品名
				this.brandName = ''; //品名
				this.receivingStart = ''; //开始时间
				this.receivingEnd = ''; //截止时间
				this.currentSelectedBtnIndex = null; //当天,近三天,近一周
				$(".select-box .content ul li").removeClass('select');
			},
			sure: function() {
				this.sureVal.receivingCode = this.receivingCode;
				this.sureVal.ownerId = this.ownerId;
				this.sureVal.ownerName = this.ownerName;
				this.sureVal.brandId = this.brandId;
				this.sureVal.brandName = this.brandName;
				this.sureVal.receivingStart = this.receivingStart;
				this.sureVal.receivingEnd = this.receivingEnd;
				//获得父页面的webview
				var warehouseEnteringManagementPage = plus.webview.getWebviewById('warehouse-entering');　　
				//触发父页面的自定义事件(getReceivedListFilterVal),从而进行刷新
				mui.fire(warehouseEnteringManagementPage, 'getReceivedListFilterVal', {
					"receivingCode": this.sureVal.receivingCode,
					"ownerId": this.sureVal.ownerId,
					"ownerName": this.sureVal.ownerName,
					"brandId": this.sureVal.brandId,
					"brandName": this.sureVal.brandName,
					"receivingStart": this.sureVal.receivingStart,
					"receivingEnd": this.sureVal.receivingEnd
				});
				m.back();
			}
		}
	});

	m.plusReady(function() {
		//父页面传来的原筛选值
		var filterConditions = plus.webview.currentWebview().filterConditions;
		globalVue.receivingCode = filterConditions.receivingCode;
		globalVue.ownerId = filterConditions.ownerId;
		globalVue.ownerName = filterConditions.ownerName;
		globalVue.brandId = filterConditions.brandId;
		globalVue.brandName = filterConditions.brandName;
		globalVue.receivingStart = filterConditions.receivingStart;
		globalVue.receivingEnd = filterConditions.receivingEnd;

		//子页面要传给父页面的值
		globalVue.sureVal.receivingCode = filterConditions.receivingCode;
		globalVue.sureVal.ownerId = filterConditions.ownerId;
		globalVue.sureVal.ownerName = filterConditions.ownerName;
		globalVue.sureVal.brandId = filterConditions.brandId;
		globalVue.sureVal.brandName = filterConditions.brandName;
		globalVue.sureVal.receivingStart = filterConditions.receivingStart;
		globalVue.sureVal.receivingEnd = filterConditions.receivingEnd;
		console.log("子页面得到的值:" + JSON.stringify(filterConditions));

		//获取货主单位的数据
		m.getJSON(app.api_url + '/api/sysBusinessBasis/customerInfo?customerType=2', function(data) {
			for(var i = 0; i < data.length; i++) {
				globalVue.ownerNameList.push({
					"text": data[i].text,
					"id": data[i].id
				});
			}
		});

		//获取品名的数据
		m.getJSON(app.api_url + '/api/sysBusinessBasis/brandInfos', function(data) {
			for(var i = 0; i < data.length; i++) {
				globalVue.typeNameList.push({
					"text": data[i].text,
					"id": data[i].id
				});
			}
		});

		//设置footer绝对位置
		document.getElementById('btnList').style.top = (plus.display.resolutionHeight - 40) + "px";
	});

});