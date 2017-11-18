(function ($) {


    $.DateRangePicker = function (options)
    {
        // setup
        var opts                = $.extend({}, $.DateRangePicker.defaults, options),
            mobile              = false;

        opts.containerMobile    = opts.container + 'Mobile';

        var container                    = $(opts.container),
            containerMobile              = $(opts.container + 'Mobile'),
            containerInput               = container.find('.DateRangePickerInput'),
            containerCalendar            = container.find('.DateRangePickerCalendar'),
            containerCalendarContainer   = container.find('.DateRangePickerCalendarContainer');

        /*const locale = new Intl.DateTimeFormat(opts.locale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });*/
        function GetDateLocale(value) {
            var year    = value.getFullYear().toString().substring(2),
                month   = value.getMonth()+1,
                day     = value.getDate();
            if (opts.locale == 'ru-RU') {
                if(month < 10) month = '0'+month;
                if(day   < 10) day   = '0'+day;
                var dateText = day+'.'+month+'.'+year;
            } else if (opts.locale == 'en-US') {
                var dateText = month+'/'+day+'/'+year;
            }
            return dateText;
        }


        function init()
        {
            CheckButtonClear();

            if(opts.date_at == '') {
                container.find('span.date_at').text(opts.l.at);
            } else {
                var date_at_  = new Date(opts.date_at),
                    date_at__ = GetDateLocale(date_at_);
                container.find('span.date_at').html(date_at__);
            }

            if(opts.date_to == '') {
                container.find('span.date_to').text(opts.l.to);
            } else {
                var date_to_  = new Date(opts.date_to),
                    date_to__ = GetDateLocale(date_to_);
                container.find('span.date_to').html(date_to__);
            }


            if(opts.date_at != '' && opts.date_to != '') {
                containerMobile.find('.header-mob').html(date_at__ + ' — ' + date_to__);
            } else {
                containerMobile.find('.header-mob').html(opts.l.label);
            }
        }
        // initialize
        init();


        // создаём календарь
        function CreateCalendar(year, month, direction, max_m = 4) {

            var html;

            var start = 1;
            if(direction == '' && CheckMobileWindowWidth() == true) {
                start = 2;
                max_m++;
            }

            for(var m = start; m <= max_m; m++) {

                var Dlast = new Date(year,month+m,0).getDate(),  // последний день месяца
                    D = new Date(year,month+m-1,Dlast),  // дата последнего дня месяца
                    DNlast = new Date(D.getFullYear(),D.getMonth(),Dlast).getDay(),  // день недели последнего дня месяца
                    DNfirst = new Date(D.getFullYear(),D.getMonth(),1).getDay(),  // день недели первого дня месяца

                // дни недели
                html = '<tr>';
                for(var  i = 0; i <= 6; i++) {
                    html += '<th>'+opts.l.days[i]+'</th>';
                }
                html += '</tr>';

                // пустые клетки до первого дня текущего месяца
                if (DNfirst != 0) {
                    for(var  i = 1; i < DNfirst; i++) html += '<td>&nbsp;</td>';
                }
                // если первый день месяца выпадает на воскресенье, то требуется 7 пустых клеток
                else {
                    for(var  i = 0; i < 6; i++) html += '<td>&nbsp;</td>';
                }

                // дни месяца
                for(var  i = 1; i <= Dlast; i++) {

                    // до сегодняшней дате можно задать стиль CSS
                    if (new Date(D.getFullYear(),D.getMonth(),i+1) < new Date() && opts.inactive == true) {
                        html += '<td class="inactive' + CheckDate(D.getFullYear(), D.getMonth(), i) + '">' + i + '</td>';
                    } else {
                        html += '<td class="valid' + CheckDate(D.getFullYear(), D.getMonth(), i) + '" data-year="' + D.getFullYear() + '" data-month="' + (D.getMonth() + 1) + '">' + i + '</td>';
                    }
                    // если день выпадает на воскресенье, то перевод строки
                    if (new Date(D.getFullYear(),D.getMonth(),i).getDay() == 0) {
                        html += '<tr>';
                    }
                }

                // вставляем календарь
                html = '<table data-year="'+D.getFullYear()+'" data-month="'+D.getMonth()+'"><caption>' + opts.l.months[D.getMonth()] +' '+ D.getFullYear() + '</caption>' + html + '</table>';
                if(direction == 'prev') {
                    if(CheckMobileWindowWidth() == false) {
                        var width = containerCalendarContainer.find('table').innerWidth() + 10;
                        containerCalendar.find('table:last').remove();
                        containerCalendarContainer.animate({
                            left: '10px',
                        }, 200, function(){
                            containerCalendarContainer.css('left', '-'+width+'px').prepend(html);
                        });
                    } else {
                        containerCalendarContainer.prepend(html);
                    }
                } else if(direction == 'next') {
                    if(CheckMobileWindowWidth() == false) {
                        var width = containerCalendarContainer.find('table').innerWidth() + 10;
                        containerCalendarContainer.animate({
                            left: '-'+(width * 2 + 10)+'px',
                        }, 200, function(){
                            containerCalendar.find('table:first').fadeOut(0, function(){
                                $(this).remove();
                                containerCalendarContainer.css('left', '-'+width+'px');
                            });
                        }).append(html);
                    } else {
                        containerCalendarContainer.append(html);
                    }
                } else {
                    containerCalendarContainer.append(html);
                }

            }
        }
        // проверяем даты в календаре
        function CheckDate(year, month, day) {
            var date = year+'-'+('0' + (month + 1)).slice(-2)+'-'+('0' + day).slice(-2);
            if(opts.date_at != '' && opts.date_at == date) {
                return ' start';
            }
            if(opts.date_to != '' && opts.date_to == date) {
                return ' end';
            }

            var date_at_ = new Date(opts.date_at),
                date_to_ = new Date(opts.date_to),
                date_ = new Date(date);
            if(date_at_ < date_ && date_to_ > date_) {
                return ' intermediate';
            }

            return '';
        }


        // убираем календарь при клике в любом другом месте
        $(document).click(function(event){
            if(!CheckMobileWindowWidth()) {
                if($(event.target).closest(opts.container + ', ' + opts.containerMobile).length)
                    return;
                CloseCalendarAndEmpty();
                event.stopPropagation();
            }
        });


        // открываем календарь
        container.on('click', 'span', function() {
            OpenCalendar($(this));
        });


        // перелистываем календарь назад
        containerCalendar.on('click', '.button-left, .button-top', function() {
            var year  = containerCalendarContainer.find('table:first').data('year'),
                month = parseFloat(containerCalendarContainer.find('table:first').data('month')) - 1,
                m_max = 1;
            CreateCalendar(year, month, 'prev', m_max);
        });


        // перелистываем календарь вперёд
        containerCalendar.on('click', '.button-right, .button-bottom', function() {
            var year = containerCalendarContainer.find('table:last').data('year');
            var month = parseFloat(containerCalendarContainer.find('table:last').data('month')) + 1;
            if(CheckMobileWindowWidth() == false) {
                var m_max = 1;
            } else {
                var m_max = 4;
            }
            CreateCalendar(year, month, 'next', m_max);
        });


        // назначаем дату
        containerCalendar.on('click', 'td.valid', function() {

            var year  = Number($(this).data('year')),
                month = Number($(this).data('month'));

            if(opts.inputActive == 'date_at') {
                var start = $(this).text();
                containerCalendar.find('td.valid').removeClass('start');
                $(this).addClass('start');

                opts.date_at = year + '-' + ('0' + month).slice(-2) + '-' + ('0' + $(this).text()).slice(-2);
                var date_at_ = new Date(opts.date_at),
                    date_to_ = new Date(opts.date_to);
                container.find('span.date_at').html(GetDateLocale(date_at_));

                opts.inputActive = 'date_to';
                container.find('.DateInput').removeClass('active');
                container.find('.DateInput.date_to').addClass('active');

                if(date_at_ > date_to_) {
                    date_to = '';
                    container.find('input.date_to').val('');
                    container.find('span.date_to').text(container.find('span.date_to').data('text'));
                    containerCalendar.find('td.valid').removeClass('end');
                }
                CheckHover(containerCalendar.find('td.valid.end'), 'click');

            } else {

                var end = $(this).text();
                containerCalendar.find('td.valid').removeClass('end');
                $(this).addClass('end');

                opts.date_to = year + '-' + ('0' + month).slice(-2) + '-' + ('0' + $(this).text()).slice(-2);
                var date_at_ = new Date(opts.date_at),
                    date_to_ = new Date(opts.date_to);
                container.find('span.date_to').html(GetDateLocale(date_to_));

                if(date_at_ > date_to_) {
                    date_at = '';
                    container.find('input.date_at').val('');
                    container.find('span.date_at').text(container.find('span.date_at').data('text'));
                    containerCalendar.find('td.valid').removeClass('start');
                }
                CheckHover(containerCalendar.find('td.valid.start'), 'click');

                if(opts.date_at != '') {
                    CloseCalendarAndEmpty();
                } else {
                    opts.inputActive = 'date_at';
                    container.find('.DateInput').removeClass('active');
                    container.find('.DateInput.date_at').addClass('active');
                }
            }

            if(opts.date_at != '' && opts.date_to != '' && containerCalendar.is(':hidden')) {
                container.find('input.date_at').val(opts.date_at).change();
                container.find('input.date_to').val(opts.date_to).change();

                var date_at_  = new Date(opts.date_at),
                    date_at__ = GetDateLocale(date_at_),
                    date_to_  = new Date(opts.date_to),
                    date_to__ = GetDateLocale(date_to_);
                containerMobile.find('.header-mob').html(date_at__ + ' — ' + date_to__);

                containerInput.find('.close').trigger('click');
            }

            CheckButtonClear();

        });


        // очищение значений
        containerInput.on('click', '.clear', function() {
            containerInput.find('.clear').hide();

            container.find('span.date_at').text(opts.l.at);
            container.find('span.date_to').text(opts.l.to);

            containerCalendar.find('td').removeClass('start intermediate end');

            containerMobile.find('.header-mob').html(opts.l.label);

            opts.date_at = '';
            opts.date_to = '';

            containerInput.find('.DateInput').find('span').empty();
            containerInput.find('.DateInput').find('input').val('').change();
        });




        // фунуция открытия календаря
        function OpenCalendar(div) {
            if(containerCalendar.is(':hidden')) {
                if(opts.date_at != '') {
                    var list = opts.date_at.split('-');
                    var year = Number(list[0]);
                    var month = Number(list[1]) - 2;
                    CreateCalendar(year, month, '');
                } else {
                    var year = new Date().getFullYear();
                    var month = Number(new Date().getMonth()) - 1;
                    CreateCalendar(year, month, '');
                }
            }

            container.addClass('active').find('.DateInput').removeClass('active');
            containerMobile.addClass('hidden');
            div.parent('.DateInput').addClass('active');
            opts.inputActive = div.attr('class');

            if(CheckMobileWindowWidth()) {
                var height = containerInput.outerHeight();
                containerCalendar.css('top', height+'px');
            } else {
                containerCalendar.css('top', '100%');
            }
        }


        // подсвечиваем диапазон при наведении
        containerCalendar.on('mouseenter', 'td.valid', function() {
            if(opts.date_at != '' && opts.date_to == '') {
                CheckHover($(this), 'hover');
            }
        }).on('mouseleave', 'td', function() {
            if(opts.date_at != '' && opts.date_to == '') {
                $(this).removeClass('hovered');
                containerCalendar.find('td').removeClass('intermediate-hover intermediate');
            }
        });
        // функция подсветки диапазона при наведении
        function CheckHover(element, method) {
            containerCalendar.find('td').removeClass('intermediate-hover intermediate');

            var year  = Number(element.data('year'));
            var month = Number(element.data('month'));
            var day   = Number(element.text());
            var date_at_ = new Date(opts.date_at);
            var date_ = new Date(year+'-'+month+'-'+day);

            if (opts.date_at != '' && date_at_ < date_) {
                element.addClass('hovered');
                var elements = containerCalendarContainer.find('td.valid');
                var intermediate = false;
                if(!elements.hasClass('start')) {
                    var intermediate = true;
                }
                $.each(elements, function( key, value ) {
                    var class_ = $(this).attr('class');
                    if(class_.indexOf('start') + 1 && (opts.date_to == '' || method == 'click')) {
                        intermediate = true;
                    } else if (class_.indexOf('hovered') + 1) {
                        intermediate = false;
                    }
                    if(intermediate == true) {
                        if(method == 'click') {
                            $(this).addClass('intermediate');
                        } else {
                            $(this).addClass('intermediate-hover');
                        }
                    }
                });
            }
        }

        // функция проверяет есть ли значение и если есть, то добавляет очистить
        function CheckButtonClear() {
            if(opts.date_at != '' || opts.date_to != '') {
                containerInput.find('.clear').show();
            }
        }

        // функция закрытия календаря
        function CloseCalendarAndEmpty() {
            container.find('input.date_at').val(opts.date_at);
            container.find('input.date_to').val(opts.date_to);

            container.removeClass('active').find('.DateInput').removeClass('active');
            containerMobile.removeClass('hidden');

            containerCalendarContainer.empty();

            $('body').css('position', '');
        }




        // открываем фильтр для мобильных
        $(document).on('click', opts.containerMobile, function() {
            //OpenCalendar(containerInput.find('.date_at'));
            containerInput.find('span.date_at').click();
            $('body').css('position', 'fixed');
        });
        // закрываем фильтр для мобильных
        containerInput.on('click', '.close', function() {
            CloseCalendarAndEmpty();
            $(window).unbind('scroll');
        });


        // проверка ширины окна
        function CheckMobileWindowWidth() {
            var window_width = window.innerWidth;
            if(window_width <= 980) {
                return true;
            } else {
                return false;
            }
        }
    }


    // plugin defaults
    $.DateRangePicker.defaults = {
        container: '#DateRangePicker',  // Сменяемо
        containerMobile: false,

        inputActive: 'date_at',

        inactive: true,  // Сменяемо

        date_at: '',  // Сменяемо
        date_to: '',  // Сменяемо

        locale: '',  // Сменяемо
        l: {  // Сменяемо
            label: '',
            at: '',
            to: '',
            days: [],
            months: [],
        }
    };


})(jQuery);