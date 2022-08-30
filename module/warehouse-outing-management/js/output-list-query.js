define(function(require, module, exports) {
	var m = require("mui");
	var app = require("app");
	var Vue = require("vue");
	require("jquery");
	require("mui-picker");
	require("mui-poppicker");
	require("mui-dtpicker");
	
	m.init({
		beforeback: function() {　　
			//获得父页面的webview
			var warehouseOutingManagementPage = plus.webview.currentWebview().opener();　　
			//触发父页面的自定义事件(getOutputListFilterVal),从而进行刷新
			mui.fire(warehouseOutingManagementPage, 'getOutputListFilterVal', {
				"carPlateNo": globalVue.sureVal.carPlateNo,
				"ladingCode": globalVue.sureVal.ladingCode,
				"ownerId": globalVue.sureVal.ownerId,
				"ownerName": globalVue.sureVal.ownerName,
				"beginDate": globalVue.sureVal.beginDate,
				"endDate": globalVue.sureVal.endDate
			});
			//返回true,继续页面关闭逻辑
			return true;
		}
	});

	var dtPicker1 = new mui.DtPicker();
	var dtPicker2 = new mui.DtPicker();
	m(".select-box .content").scroll({
		deceleration: 1, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
//		indicators: false
	});

	var globalVue = new Vue({
		el: '#queryContent',
		data: {
			carPlateNo: '', //车牌号 
			ladingCode: '', //提单号
			in_ownerName: '',//未确定的货主单位
			ownerName: '', //货主单位
			in_ownerId: '',//未确定的货主单位ID
			ownerId: '',//货主单位ID
			beginDate: '', //开始时间
			endDate: '', //截止时间
			currentSelectedBtnIndex: null, //当天,近三天,近一周
			ownerNameList: [],//所有货主单位信息
			sureVal: { //点确定才会传值(避免返回也执行过滤功能)
				carPlateNo: '',
				ladingCode: '',
				ownerId: '',
				ownerName: '',
				beginDate: '',
				endDate: ''
			},
		},
		methods: {
			showSelectBox: function(id) {
				var self = this;
				if (id == 'typeNameList') {
					$("#typeNameList.select-box").css({
						display: 'block'
					});
				} else if(id == 'ownerNameList'){
					if(!self.ownerNameList){
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
				if (id == 'typeNameList') {
					if(isSure){
						self.typeName = self.in_typeName;
					}
					$("#typeNameList.select-box").css({
						display: 'none'
					});
				} else if(id == 'ownerNameList'){
					if(isSure){
						self.ownerName = self.in_ownerName;
						self.ownerId = self.in_ownerId;
					}
					$("#ownerNameList.select-box").css({
						display: 'none'
					});
				} else if(!id){
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
			pickBeginDate: function() {
				var self = this;
				dtPicker1.show(function(selectItems) {
					self.beginDate = selectItems.value;
					self.currentSelectedBtnIndex = null;
				})
			},
			pickEndDate: function() {
				var self = this;
				dtPicker2.show(function(selectItems) {
					self.endDate = selectItems.value;
					self.currentSelectedBtnIndex = null;
				})
			},
			todayQuery: function() {
				this.currentSelectedBtnIndex = 0;
				var dateObj = this.getDate();
				var year = dateObj.year;
				var month = dateObj.month < 10 ? '0' + dateObj.month : dateObj.month;
				var date = dateObj.date < 10 ? '0' + dateObj.date : dateObj.date;
				this.beginDate = year + '-' + month + '-' + date + " 00:00";
				this.endDate = year + '-' + month + '-' + date + " 23:59";
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
				this.beginDate = currentYear + '-' + currentMonth + '-' + currentDate + " 00:00";
				this.endDate = handleYear + '-' + handleMonth + '-' + handleDate + " 23:59";
			},
			resetVal: function() {
				this.carPlateNo = ''; //车牌号 
				this.ladingCode = ''; //提单号
				this.in_ownerId = '';//未确定的货主单位ID
				this.ownerId = '';//货主单位ID
				this.in_ownerName = '';//未确定的货主单位
				this.ownerName = ''; //货主单位
				this.beginDate = ''; //开始时间
				this.endDate = ''; //截止时间
				this.currentSelectedBtnIndex = null; //当天,近三天,近一周
				$(".select-box .content ul li").removeClass('select');
			},
			sure: function() {
				this.sureVal.carPlateNo = this.carPlateNo;
				this.sureVal.ladingCode = this.ladingCode;
				this.sureVal.ownerId = this.ownerId;
				this.sureVal.ownerName = this.ownerName;
				this.sureVal.beginDate = this.beginDate;
				this.sureVal.endDate = this.endDate;
				m.back();
			}
		}
	});
	
	m.plusReady(function() {
		//父页面传来的原筛选值
		var filterConditions = plus.webview.currentWebview().filterConditions;
		globalVue.carPlateNo = filterConditions.carPlateNo;
		globalVue.ladingCode = filterConditions.ladingCode;
		globalVue.ownerId = filterConditions.ownerId;
		globalVue.ownerName = filterConditions.ownerName;
		globalVue.beginDate = filterConditions.beginDate;
		globalVue.endDate = filterConditions.endDate;
		
		//子页面要传给父页面的值
		globalVue.sureVal.carPlateNo = filterConditions.carPlateNo;
		globalVue.sureVal.ladingCode = filterConditions.ladingCode;
		globalVue.sureVal.ownerId = filterConditions.ownerId;
		globalVue.sureVal.ownerName = filterConditions.ownerName;
		globalVue.sureVal.beginDate = filterConditions.beginDate;
		globalVue.sureVal.endDate = filterConditions.endDate;
		console.log("子页面得到的值:"+JSON.stringify(filterConditions));
		
		//获取货主单位的数据
		m.getJSON(app.api_url + '/api/sysBusinessBasis/customerInfo?customerType=2', function(data) {
			for (var i=0; i<data.length; i++) {
				globalVue.ownerNameList.push({
					"text": data[i].text,
					"id": data[i].id
				});
			}
		});
		
		//设置footer绝对位置
		document.getElementById('btnList').style.top = (plus.display.resolutionHeight - 40) + "px";
	});

});