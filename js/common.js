"use strict";

function mssDatePickerInput(){
	$('#datepicker1 button').on('click', function(){
		mssDatePicker({}, this);
	});
	$('#datepicker2 button').on('click', function(){
		mssDatePicker({
			lang: 'ru',
			weekStart: 1,					
			markToday: false,	
			markWeekends: true,
			holidays: ['1.1','2.1','3.1','4.1','5.1','7.1','23.2','8.3','1.5','9.5','12.6','4.11'],		
			desabled: ['18.2.2019', '0', '23.02.2018-8.3.2018'],	
		}, this);
	});
	$('#datepicker3 button').on('click', function(){
		mssDatePicker({}, this);
	});
	$('#datepicker4 button').on('click', function(){
		mssDatePicker({}, this);
	});
}


$(document).ready(function () {
	mssDatePickerInput();
});


