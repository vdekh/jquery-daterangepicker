(function ($) {


    $.DateRangePicker = function (options)
    {
        // setup
        var opts                = $.extend({}, $.DateRangePicker.defaults, options),
            mobile              = false;

        var container                    = $(opts.container),
            containerValues              = container.find('.values'),
            containerCalendar            = container.find('.calendar'),
            containerCalendarContainer   = container.find('.container');

        /*const locale = new Intl.DateTimeFormat(opts.locale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });*/
        function getDateLocale(value) {
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


        function init() {
            checkButtonClear();

            if(opts.date_at == '') {
                containerValues.find('span.date_at').text(opts.l.at);
            } else {
                var date_at_  = new Date(opts.date_at),
                    date_at__ = getDateLocale(date_at_);
                containerValues.find('span.date_at').html(date_at__);
            }

            if(opts.date_to == '') {
                containerValues.find('span.date_to').text(opts.l.to);
            } else {
                var date_to_  = new Date(opts.date_to),
                    date_to__ = getDateLocale(date_to_);
                containerValues.find('span.date_to').html(date_to__);
            }
        }
        // Initialize
        init();


        // Create a calendar
        function createCalendar(year, month, direction, max_m = 4) {

            var html;

            var start = 1;

            for(var m = start; m <= max_m; m++) {

                var Dlast = new Date(year,month+m,0).getDate(),
                    D = new Date(year,month+m-1,Dlast),
                    DNlast = new Date(D.getFullYear(),D.getMonth(),Dlast).getDay(),
                    DNfirst = new Date(D.getFullYear(),D.getMonth(),1).getDay(),

                html = '<tr>';
                for(var  i = 0; i <= 6; i++) {
                    html += '<th>'+opts.l.days[i]+'</th>';
                }
                html += '</tr>';

                if (DNfirst != 0) {
                    for(var  i = 1; i < DNfirst; i++) html += '<td>&nbsp;</td>';
                } else {
                    for(var  i = 0; i < 6; i++) html += '<td>&nbsp;</td>';
                }

                for(var  i = 1; i <= Dlast; i++) {

                    if (new Date(D.getFullYear(),D.getMonth(),i+1) < new Date() && opts.inactive == true) {
                        html += '<td class="inactive' + checkDates(D.getFullYear(), D.getMonth(), i) + '">' + i + '</td>';
                    } else {
                        html += '<td class="valid' + checkDates(D.getFullYear(), D.getMonth(), i) + '" data-year="' + D.getFullYear() + '" data-month="' + (D.getMonth() + 1) + '">' + i + '</td>';
                    }
                    if (new Date(D.getFullYear(),D.getMonth(),i).getDay() == 0) {
                        html += '<tr>';
                    }
                }

                html = '<table data-year="'+D.getFullYear()+'" data-month="'+D.getMonth()+'"><caption>' + opts.l.months[D.getMonth()] +' '+ D.getFullYear() + '</caption>' + html + '</table>';
                if(direction == 'prev') {
                    var width = containerCalendarContainer.find('table').innerWidth() + 10;
                    containerCalendar.find('table:last').remove();
                    containerCalendarContainer.animate({
                        left: '10px',
                    }, 200, function(){
                        containerCalendarContainer.css('left', '-'+width+'px').prepend(html);
                    });
                } else if(direction == 'next') {
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

            }
        }
        // Check the dates in the calendar
        function checkDates(year, month, day) {
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


        // Hide the calendar when clicking anywhere else
        $(document).click(function(event){
            if($(event.target).closest(opts.container).length)
                return;
            closeCalendarAndEmpty();
            event.stopPropagation();
        });


        // Open the calendar
        containerValues.on('click', 'span', function() {
            if(containerCalendar.is(':hidden')) {
                if(opts.date_at != '') {
                    var list  = opts.date_at.split('-');
                    var year  = Number(list[0]),
                        month = Number(list[1]) - 2;
                    createCalendar(year, month, '');
                } else {
                    var year  = new Date().getFullYear(),
                        month = Number(new Date().getMonth()) - 1;
                    createCalendar(year, month, '');
                }
            }

            container.addClass('active').find('.value').removeClass('active');
            $(this).parent('.value').addClass('active');
            opts.inputActive = $(this).attr('class');

            containerCalendar.css('top', '100%');
        });


        // Turn over the calendar back
        containerCalendar.on('click', '.button-prev', function() {
            var year  = containerCalendarContainer.find('table:first').data('year'),
                month = parseFloat(containerCalendarContainer.find('table:first').data('month')) - 1,
                m_max = 1;
            createCalendar(year, month, 'prev', m_max);
        });


        // Turn over the calendar next
        containerCalendar.on('click', '.button-next', function() {
            var year = containerCalendarContainer.find('table:last').data('year');
            var month = parseFloat(containerCalendarContainer.find('table:last').data('month')) + 1;
            var m_max = 1;
            createCalendar(year, month, 'next', m_max);
        });


        // Assign a date
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
                container.find('span.date_at').html(getDateLocale(date_at_));

                opts.inputActive = 'date_to';
                container.find('.value').removeClass('active');
                container.find('.value.date_to').addClass('active');

                if(date_at_ > date_to_) {
                    date_to = '';
                    container.find('input.date_to').val('');
                    container.find('span.date_to').text(container.find('span.date_to').data('text'));
                    containerCalendar.find('td.valid').removeClass('end');
                }
                checkHover(containerCalendar.find('td.valid.end'), 'click');

            } else {

                var end = $(this).text();
                containerCalendar.find('td.valid').removeClass('end');
                $(this).addClass('end');

                opts.date_to = year + '-' + ('0' + month).slice(-2) + '-' + ('0' + $(this).text()).slice(-2);
                var date_at_ = new Date(opts.date_at),
                    date_to_ = new Date(opts.date_to);
                container.find('span.date_to').html(getDateLocale(date_to_));

                if(date_at_ > date_to_) {
                    date_at = '';
                    container.find('input.date_at').val('');
                    container.find('span.date_at').text(container.find('span.date_at').data('text'));
                    containerCalendar.find('td.valid').removeClass('start');
                }
                checkHover(containerCalendar.find('td.valid.start'), 'click');

                if(opts.date_at != '') {
                    closeCalendarAndEmpty();
                } else {
                    opts.inputActive = 'date_at';
                    container.find('.value').removeClass('active');
                    container.find('.value.date_at').addClass('active');
                }
            }

            if(opts.date_at != '' && opts.date_to != '' && containerCalendar.is(':hidden')) {
                container.find('input.date_at').val(opts.date_at).change();
                container.find('input.date_to').val(opts.date_to).change();

                var date_at_  = new Date(opts.date_at),
                    date_at__ = getDateLocale(date_at_),
                    date_to_  = new Date(opts.date_to),
                    date_to__ = getDateLocale(date_to_);

                containerValues.find('.close').trigger('click');
            }

            checkButtonClear();

        });


        // Clear values
        containerValues.on('click', '.clear', function() {
            containerValues.find('.clear').hide();

            containerValues.find('span.date_at').text(opts.l.at);
            containerValues.find('span.date_to').text(opts.l.to);

            opts.date_at = '';
            opts.date_to = '';

            containerCalendar.find('td').removeClass('start intermediate end');

            containerValues.find('.value').find('input').val('').change();
        });


        // Highlights the range when hovering
        containerCalendar.on('mouseenter', 'td.valid', function() {
            if(opts.date_at != '' && opts.date_to == '') {
                checkHover($(this), 'hover');
            }
        }).on('mouseleave', 'td', function() {
            if(opts.date_at != '' && opts.date_to == '') {
                $(this).removeClass('hovered');
                containerCalendar.find('td').removeClass('intermediate-hover intermediate');
            }
        });
        // function of Highlights the range when hovering
        function checkHover(element, method) {
            containerCalendar.find('td').removeClass('intermediate-hover intermediate');

            var year  = Number(element.data('year')),
                month = Number(element.data('month')),
                day   = Number(element.text());
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

        // Add clear button
        function checkButtonClear() {
            if(opts.date_at != '' || opts.date_to != '') {
                containerValues.find('.clear').show();
            }
        }

        // Close Calendar
        function closeCalendarAndEmpty() {
            container.find('input.date_at').val(opts.date_at);
            container.find('input.date_to').val(opts.date_to);

            container.removeClass('active').find('.value').removeClass('active');

            containerCalendarContainer.empty();

            $('body').css('position', '');
        }
    }


    // plugin defaults
    $.DateRangePicker.defaults = {
        container: '#DateRangePicker',

        inputActive: 'date_at',

        inactive: true,

        date_at: '',
        date_to: '',

        locale: '',
        l: {
            label: '',
            at: '',
            to: '',
            days: [],
            months: [],
        }
    };


})(jQuery);