"use strict";

// Локализация
var lang = {
	ru: {
		daysNames : 'Вс_Пн_Вт_Ср_Чт_Пт_Сб'.split('_'),
		monthNames: 'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split('_'),
		monthNamesShort: 'Янв._Февр._Март_Апр._Май_Июнь_Июль_Авг._Сент._Окт._Нояб._Дек.'.split('_')
	},
	en: {
		daysNames : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
		monthNames: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
		monthNamesShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_')
	}
}

// Вызов функции создания календаря
function mssDatePicker(pSettings, but){
	var settings = SetDefaultSettings(pSettings);
	var curCalendar = $(but).parents('.mss-datepicker');
	
	// Если календарь закрыт, открываем его
	if(!curCalendar.hasClass('opened')){
		var input = curCalendar.find('input').val();
		CloseCalendar();

		// Если в поле уже есть значение, то открываем на этом месяце
		if(input){
			var inputDate = GetDateFromArray(input.split('.'));
			// Если в поле дата корректная, то открываем на этом месяце
			if(inputDate != 'Invalid Date'){
				CreateCalendar(settings, curCalendar, inputDate);
			}
			// Иначе - открываем на текущем месяце
			else{
				CreateCalendar(settings, curCalendar);
			}
		}
		// Иначе - открываем на текущем месяце
		else{
			CreateCalendar(settings, curCalendar);
		}
	}
	// Если открыт - закрываем
	else{
		CloseCalendar();
	}
}


// Создание календаря
function CreateCalendar(settings, curCalendar, date){
	curCalendar = $(curCalendar);
	var curMonth = (!date) ? new Date() : date;
	curMonth = SetNullTime(curMonth);
	var firstDay = new Date(curMonth.setDate(1));
	var firstDayCell = firstDay.getDay() - settings.weekStart;
	if(firstDayCell < 0) firstDayCell += 7;

	var curCellDate = SetNullTime(new Date(firstDay));
	curCellDate.setDate(-firstDayCell + 1);

	var days = firstDay.daysInMonth() + firstDayCell;
	var dayStrings = Math.ceil(days / 7);


	var tableTR = '<tr></tr>';
	var tableTD = '<td>str</td>';
	var daysNames = lang[settings.lang].daysNames;
	var monthNames = lang[settings.lang].monthNames;

	// Создание заголовочной части с кнопками перехода
	curCalendar.append('<div class="mss-calendar" data-mssdate="' + firstDay + '"><div class="mss-header mss-header-days"><span class="mss-month">' + mssGetHeader(settings, monthNames, firstDay) + '</span><button class="mss-to-prev"></button><button class="mss-to-next"></button></div></div>');
	curCalendar.addClass('opened');

	// Создание таблицы календаря
	curCalendar.find('.mss-calendar').append('<table class="mss-table"><thead class="mss-weekdays"></thead><tbody class="mss-days"></tbody></table>');
	var mssTable = $('.mss-datepicker table.mss-table');


	// Создание ячеек для заголовков дней недели
	curCalendar.find('.mss-table .mss-weekdays').append(tableTR);
	var mssTableDays = $('.mss-datepicker .mss-calendar .mss-weekdays tr');
	for (var i = 0; i < 7; i++) {
		var dayNumWeekStart = i + settings.weekStart;
		if(dayNumWeekStart > 6) dayNumWeekStart -= 7;
		var s = tableTD.replace('str', daysNames[dayNumWeekStart]);
		mssTableDays.append(s);
	}


	// Создание разметки таблицы дней месяца
	for (var trs = 0; trs < dayStrings; trs++) {
		mssTable.append(tableTR);
		for (var ds = 0; ds < 7; ds++) {
			var mssTableDays = curCalendar.find('.mss-table .mss-days tr').eq(trs);
			mssTableDays.append(GetDateStrHTML(settings, curCellDate, firstDay));
			curCellDate.setDate(curCellDate.getDate() + 1);
		}
	}


	// Вызов перехода календаря на предыдущий месяц
	$('.mss-header-days .mss-to-prev').on('click', function(){
		GoToPrevMonth(settings, $(this).parents('.mss-datepicker'));
	});
	$('.mss-prev').on('click', function(){
		GoToPrevMonth(settings, $(this).parents('.mss-datepicker'));
	});

	// Вызов перехода календаря на следующий месяц
	$('.mss-header-days .mss-to-next').on('click', function(){
		GoToNextMonth(settings, $(this).parents('.mss-datepicker'));
	});
	$('.mss-next').on('click', function(){
		GoToNextMonth(settings, $(this).parents('.mss-datepicker'));
	});

	// Вызов перехода календаря на следующий месяц
	$('.mss-cur').on('click', function(){
		var date = new Date(firstDay.setDate(parseInt($(this).html())));
		var strDate = SetNuls(date.getDate()) + settings.dateSeparator + SetNuls((date.getMonth() + 1)) + settings.dateSeparator + SetNuls(date.getFullYear());
		var input = $(this).parents('.mss-datepicker').find('input');
		input.val(strDate);
		input.attr('value', strDate);
		CloseCalendar();
	});

	// Вызов перехода календаря в режим выбора месяца
	$('.mss-month').on('click', function(){
		ModeMonth(settings, $(this).parents('.mss-datepicker'));
	});


}

// Включение режима выбора месяца
function ModeMonth(settings, calendar){
	var curCalendar = calendar.find('.mss-calendar');
	var cur = new Date(Date.parse(curCalendar.data('mssdate')));
	curCalendar.html('');
	var monthNames = (settings.monthShort) ? lang[settings.lang].monthNamesShort : lang[settings.lang].monthNames;

	// Создание заголовочной части с кнопками перехода
	curCalendar.append('<div class="mss-header mss-header-month"><span class="mss-year">' + cur.getFullYear() + '</span><button class="mss-to-prev"></button><button class="mss-to-next"></button></div>');

	// Создание таблицы режима выбора месяца
	curCalendar.append('<div class="mss-months"><ul></ul></div>');
	for (var i = 0; i < 12; i++) {
		var className = '';
		if(cur.getMonth() == i){
			className += ' class="mss-cur-month"';
		}
		curCalendar.find('ul').append('<li' + className + '><span>' + monthNames[i] + '</span></li>');
	}

	// Вызов перехода календаря на предыдущий год
	$('.mss-header-month .mss-to-prev').on('click', function(){
		GoToAnotherYear(cur, curCalendar, -1);
	});
	// Вызов перехода календаря на следующий год
	$('.mss-header-month .mss-to-next').on('click', function(){
		GoToAnotherYear(cur, curCalendar, 1);
	});
	// Выбор месяца в режиме выбора месяца и вызов отрисовки календаря этого месяца
	$('.mss-months li').on('click', function(){
		var num = $('.mss-months li').index($(this));
		$('.mss-calendar').remove();
		cur.setMonth(num);
		CreateCalendar(settings, calendar, cur);
	});
	// Вызов перехода календаря в режим выбора года
	$('.mss-year').on('click', function(){
		ModeYear(settings, $(this).parents('.mss-datepicker'));
	});
}


// Включение режима выбора года
function ModeYear(settings, calendar){
	var curCalendar = calendar.find('.mss-calendar');
	var a = curCalendar.data('mssdate');
	var cur = new Date(Date.parse(curCalendar.data('mssdate')));
	curCalendar.html('');

	// Создание заголовочной части с кнопками перехода
	curCalendar.append('<div class="mss-header mss-header-year"><span class="mss-year">' + (cur.getFullYear() - 5) + ' - ' + (cur.getFullYear() + 6) + '</span><button class="mss-to-prev"></button><button class="mss-to-next"></button></div>');

	// Создание таблицы режима выбора года
	curCalendar.append('<div class="mss-years"><ul></ul></div>');
	for (var i = 0; i < 12; i++) {
		var className = '';
		if(cur.getFullYear() == i){
			className += ' class="mss-cur-year"';
		}
		curCalendar.find('ul').append('<li' + className + '><span>' + (cur.getFullYear() - 5 + i) + '</span></li>');
	}

	// Вызов перехода календаря на предыдущий диапазон лет
	$('.mss-header-year .mss-to-prev').on('click', function(){
		GoToAnotherYearsRange(cur, curCalendar, -10, settings);
	});
	// Вызов перехода календаря на следующий диапазон лет
	$('.mss-header-year .mss-to-next').on('click', function(){
		GoToAnotherYearsRange(cur, curCalendar, 10, settings);
	});
	// Вызов перехода календаря в режим выбора месяца
	$('.mss-years li').on('click', function(){
		var num = parseInt($(this).find('span').html());
		cur.setFullYear(num);
		curCalendar.attr('data-mssdate', cur);
		curCalendar.data('mssdate', cur);
		ModeMonth(settings, curCalendar.parents('.mss-datepicker'));
	});
}


// Смена диапазона лет  в режиме выбора года
function GoToAnotherYearsRange(curDate, curCalendar, direction, settings){
	curDate.setFullYear(curDate.getFullYear() + direction);
	curCalendar.attr('data-mssdate', curDate);
	curCalendar.data('mssdate', curDate);
	curCalendar.find('.mss-year').html((curDate.getFullYear() - 5) + ' - ' + (curDate.getFullYear() + 6));
	curCalendar.find('.mss-years').remove();
	ModeYear(settings, curCalendar.parents('.mss-datepicker'));
}


// Смена года в режиме выбора месяца
function GoToAnotherYear(curDate, curCalendar, direction){
	curDate.setFullYear(curDate.getFullYear() + direction);
	curCalendar.attr('data-mssdate', curDate);
	curCalendar.find('.mss-year').html(curDate.getFullYear());
}


// Формирует текст заголовка календаря (месяц, год)
function mssGetHeader(settings, monthNames, date){
	return (settings.yearInHead) ? monthNames[date.getMonth()] + ' ' + date.getFullYear() : monthNames[date.getMonth()];
}


// Добавляет нули в формат даты
function SetNuls(num){
	return (num < 10) ? "0" + num : num;
}

// Вызывает переход к предыдущему месяцу
function GoToPrevMonth(settings, calendar){
	GoToAnotherMonth(settings, calendar, -1);
}

// Вызывает переход к следующему месяцу
function GoToNextMonth(settings, calendar){
	GoToAnotherMonth(settings, calendar, 1);
}

// Стирает старый календарь и вызывает на отрисовку календарь другого месяца
function GoToAnotherMonth(settings, calendar, direction){
	var cur = new Date(Date.parse(calendar.find('.mss-calendar').data('mssdate')));
	$('.mss-calendar').remove();
	cur.setMonth(cur.getMonth() + direction);
	CreateCalendar(settings, calendar, cur);
}


// Возвращает подготовленную строку HTML-кода ячейки таблицы календаря
function GetDateStrHTML(settings, date, curMonthDate){
	var className;
	// Присвоение класса дню текущего месяца
	if(date.getMonth() == curMonthDate.getMonth()) {
		className = 'mss-cur';
	}
	// Присвоение класса дню предыдущего месяца
	else if(date.getTime() < curMonthDate.getTime()){
		className = 'mss-prev';
	}
	// Присвоение класса дню следующего месяца
	else{
		className = 'mss-next';
	}
	// Присвоение класса выходным
	if(settings.markWeekends){
		if(date.getDay() == 0 || date.getDay() == 6){
			className += ' mss-weekend';
		}
	}
	// Присвоение класса сегодняшнему дню
	if(settings.markToday){
		var today = SetNullTime(new Date());
		if(date.getTime() - today.getTime() == 0){
			className += ' mss-today';
		}
	}

	// Присвоение класса праздникам и отключенным датам
	className += GetClassForArray(settings.holidays, date, 'mss-holiday');
	className += GetClassForArray(settings.desabled, date, 'mss-desabled');

	var str = '<td><span class="' + className + '">' + date.getDate() + '</span></td>';
	return str;
}


// Возвращает имя класса по параметрам из массива
function GetClassForArray(array, date, className){
	if(array){
		for (var i = 0; i < array.length; i++) {
			var day = date.getDay();
			var data = date.getDate();
			var month = date.getMonth() + 1;
			var year = date.getFullYear();
			SetNullTime(date);
			var d = array[i] + '';
			// Если указан номер дня недели
			if(d.length == 1){
				if(array[i] == day){
					return ' ' + className;
				}
			}
			// Если указан диапазон дат в формате 'D.M.YYYY-D.M.YYYY'
			else if(d.indexOf('-') > 0){
				var ds = d.split('-');
				var dateStart = GetDateFromArray(ds[0].split('.'));
				var dateEnd = GetDateFromArray(ds[1].split('.'));
				if(date.getTime() >= dateStart.getTime() && date.getTime() <= dateEnd.getTime()){
					return ' ' + className;
				}
			}
			// Если указана дата
			else{
				var hDate = (array[i]).split('.');
				// Дата в формате 'D.M'
				if(hDate.length == 2){
					if((parseInt(hDate[0]) == data) && (parseInt(hDate[1]) == month)){
						return ' ' + className;
					}
				}
				// Дата в формате 'D.M.YYYY'
				else if(hDate.length == 3){
					if((parseInt(hDate[0]) == data) && (parseInt(hDate[1]) == month) && (parseInt(hDate[2]) == year)){
						return ' ' + className;
					}
				}
			}
		}
	}
	return '';
}

// Возвращает дату с обнуленным временем
function SetNullTime(date){
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

// Возвращает дату из массива ['D','M','YYYY']
function GetDateFromArray(arr){
	return new Date(parseInt(arr[2]), parseInt(arr[1]) - 1, parseInt(arr[0]));
}

// Закрывает календарь
function CloseCalendar(){
	$('.mss-calendar').remove();
	$('.mss-datepicker').removeClass('opened');
}

// Метод определяет количество дней в месяце
Date.prototype.daysInMonth = function() {
	return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate();
};


// Установка настроек по умолчанию, если они не указаны пользователем
function SetDefaultSettings(pSettings){
	var settings = {
		lang: 'en',						// Язык локализации
		weekStart: 0,					// С какого дня начинается неделя (0 - Вс)
		dateSeparator: '.',		// Разделитель групп разрядов в дате
		timeSeparator: ':',		// Разделитель групп разрядов времени
		yearInHead: true,			// Отображать в заголовке год
		markWeekends: false,		// Выделять выходные дни красным
		markToday: true,			// Выделять сегодняшний день
		monthShort: true,			// Использовать в режиме выбора месяца укороченные названия месяцев
		holidays: [],					// Массив праздничных дней в формате
														// номер дня недели (0 - Вс)
														// либо дата в формате 'D.M' - сработает каждый год
														// либо дата в формате 'D.M.YYYY' - сработает 1 раз
														// либо диапазон дат в формате 'D.M.YYYY-D.M.YYYY'
		desabled: []					// Массив отключенных дней. Формат как у праздников
	};
	if(pSettings.lang != undefined) settings.lang = pSettings.lang;
	if(pSettings.weekStart != undefined) settings.weekStart = pSettings.weekStart;
	if(pSettings.dateSeparator != undefined) settings.dateSeparator = pSettings.dateSeparator;
	if(pSettings.timeSeparator != undefined) settings.timeSeparator = pSettings.timeSeparator;
	if(pSettings.yearInHead != undefined) settings.yearInHead = pSettings.yearInHead;
	if(pSettings.markWeekends != undefined) settings.markWeekends = pSettings.markWeekends;
	if(pSettings.markToday != undefined) settings.markToday = pSettings.markToday;
	if(pSettings.monthShort != undefined) settings.monthShort = pSettings.monthShort;
	if(pSettings.holidays != undefined) settings.holidays = pSettings.holidays;
	if(pSettings.desabled != undefined) settings.desabled = pSettings.desabled;

	return settings;
}