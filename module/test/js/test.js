define(function(require, module, exports) {
	var app = require("app");
	var jquery = require("jquery");
	var select2 = require("select2");
	var data = [{
		id: 0,
		text: 'enhancement'
	}, {
		id: 1,
		text: 'bug'
	}, {
		id: 2,
		text: 'duplicate'
	}, {
		id: 3,
		text: 'invalid'
	}, {
		id: 4,
		text: 'wontfix'
	}, {
		id: 5,
		text: 'wontfix2'
	}, {
		id: 6,
		text: 'wontfix3'
	}, {
		id: 7,
		text: 'wontfix4'
	}];

	/*$("#q-cust-name").select2({
		 placeholder: "请至少选择一项",
		'data': data
	});*/
	function formatRepo(state) {
	/*	if(!state.id) {
			return state.text;
		}
		var $state = $(
			'<span><img src="vendor/images/flags/' + state.element.value.toLowerCase() + '.png" class="img-flag" /> ' + state.text + '</span>'
		);*/
		return state.customerName;
	};
	var select2 = $("#q-cust-name").select2({
		placeholder: "请至少选择一项",
		tags: true,
		ajax: {
			url: app.api_url + "/api/crm/customer/getCustomerPageByName",
			dataType: 'json',
			delay: 250,
			data: function(params) {
				return {
					customerName: params.term, // search term
					pageNo: params.pageNo,
					pageSize:8,
					token: app.token
				};
			},
			processResults: function(data, params) {			
				params.pageNo = data.pageNo || 1;
				return {
					results: data.list,
					pagination: {
						more: params.pageNo < data.totalPage
					}
				};
			},
			cache: true
		},
		escapeMarkup: function(markup) {
			return markup;
		}, // let our custom formatter work
		minimumInputLength: 0,
		templateResult: function(result){
			return result.customerName||'';
		}, // omitted for brevity, see the source of this page
		templateSelection: function(selection){
			return selection.customerName;
		} // omitted for brevity, see the source of this page
	});
	select2.on("change",function(e){
		debugger;
	});
	
	select2.on("select2:select",function(e){
		debugger;
	});
	var select3 = $("#select2").select2({
		placeholder: "请至少选择一项",
		allowClear: true
	});
	select3.on("change",function(e){
		debugger;
	});
	
	select3.on("select2:select",function(e){
		debugger;
	});
	select3.on("select2:unselect",function(e){
		debugger;
	});
});