// https://github.com/ArminTamzarian/node-calendar/blob/master/node-calendar.js
var _DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var _DAYS_BEFORE_MONTH = [-1, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

/**
     * Adjust the provided weekday index from the Javascript index scheme
     * (SUN=0, MON=1, ...) to the Python scheme (MON=0, TUE=1, ...)
     *
     * @api private
     */
function _adjustWeekday(weekday: number) {
    return weekday > 0 ? weekday - 1 : 6
}

/**
     * Extracts the wide or abbreviated day names for a specified locale.
     * If cldr is not installed values default to that for locale en_US.
     *
     * @param {Boolean} abbr
     * @api private
     */
function _extractLocaleDays(abbr: boolean) {
    if (abbr) {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    else {
        return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    }
}

/**
   * Extracts the wide or abbreviated month names for a specified locale.
   * If cldr is not installed values default to that for locale en_US.
   *
   * @param {Boolean} abbr
   * @api private
   */
function _extractLocaleMonths(abbr: boolean) {
    var months = []
    if (abbr) {
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
    else {
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    }

    months.unshift('');
    return months;
}

/**
     * Calculates the ordinal time from given year, month, day values.
     *
     * @param {Number} year
     * @param {Number} month
     * @param {Number} day
     * @api private
     */
function _toordinal(year: number, month: number, day: number) {
    var days_before_year = ((year - 1) * 365) + Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400);
    var days_before_month = _DAYS_BEFORE_MONTH[month] + (month > 2 && isleap(year) ? 1 : 0);
    return (days_before_year + days_before_month + day);
}

/**
     * Return true for leap years, false for non-leap years.
     *
     * @param {Number} year
     * @api public
     */
function isleap(year: number) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/**
   * Return number of leap years in range [y1, y2).
   * Assumes y1 <= y2.
   *
   * @param {Number} y1
   * @param {Number} y2
   * @api public
   */
function leapdays(y1: number, y2: number) {
    y1--;
    y2--;
    return (Math.floor(y2 / 4) - Math.floor(y1 / 4)) - (Math.floor(y2 / 100) - Math.floor(y1 / 100)) + (Math.floor(y2 / 400) - Math.floor(y1 / 400));
};

/**
 * Return starting weekday (0-6 ~ Mon-Sun) and number of days (28-31) for
 * year, month.
 *
 * @param {Number} year
 * @param {Number} month
 * @throws {IllegalMonthError} If the provided month is invalid.
 * @api public
 */
function monthrange(year: number, month: number) {
    if (month < 1 || month > 12) {
        throw new Error('IllegalMonthError')
    }

    var day1 = weekday(year, month, 1);
    var ndays = _DAYS_IN_MONTH[month] + ((month === 2 && isleap(year)) ? 1 : 0)

    return [day1, ndays];
};

/**
 * Sets the locale for use in extracting month and weekday names.
 *
 * @api public
 */
function setlocale() {
    this.day_name = _extractLocaleDays(false);
    this.day_abbr = _extractLocaleDays(true);
    this.month_name = _extractLocaleMonths(false);
    this.month_abbr = _extractLocaleMonths(true);
}

/**
    * Unrelated but handy function to calculate Unix timestamp from GMT.
    *
    * @param {Array} tuple
    * @throws {IllegalMonthError} If the provided month element is invalid.
    * @throws {IllegalDayError} If the provided day element is invalid.
    * @api public
    */
function timegm(timegmt: Array<number>) {
    var year = timegmt[0];
    var month = timegmt[1];
    var day = timegmt[2];
    var hour = timegmt[3];
    var minute = timegmt[4];
    var second = timegmt[5];

    if (month < 1 || month > 12) {
        throw new Error('IllegalMonthError');
    }

    if (day < 1 || day > (_DAYS_IN_MONTH[month] + ((month === 2 && isleap(year)) ? 1 : 0))) {
        throw new Error('IllegalDayError');
    }

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
        throw new Error('IllegalTimeError');
    }

    var days = _toordinal(year, month, 1) - 719163 + day - 1;
    var hours = (days * 24) + hour;
    var minutes = (hours * 60) + minute;
    var seconds = (minutes * 60) + second;

    return seconds;
}

/**
 * Return weekday (0-6 ~ Mon-Sun) for year (1970-...), month (1-12),
 * day (1-31).
 *
 * @param {Number} year
 * @param {Number} month
 * @param {Number} day
 * @throws {IllegalMonthError} If the provided month element is invalid.
 * @throws {IllegalDayError} If the provided day element is invalid.
 * @api public
 */
function weekday(year: number, month: number, day: number) {
    if (month < 1 || month > 12) {
        throw new Error('IllegalMonthError');
    }

    if (day < 1 || day > (_DAYS_IN_MONTH[month] + ((month === 2 && isleap(year)) ? 1 : 0))) {
        throw new Error('IllegalDayError');
    }

    var date = new Date(year, month - 1, day);
    return _adjustWeekday(date.getDay());
}

class Calendar {
    _firstweekday: number = 0
    _oneday: number = 1000 * 60 * 60 * 24;
    _onehour: number = 1000 * 60 * 60;

    constructor(firstweekday: number) {
        if (firstweekday < 0 || firstweekday > 6) {
            throw new Error('IllegalWeekdayError')
        }

        this._firstweekday = firstweekday
    }

    getfirstweekday() {
        return this._firstweekday
    }

    setfirstweekday(firstweekday: number) {
        if (firstweekday < 0 || firstweekday > 6) {
            throw new Error('IllegalWeekdayError')
        }

        this._firstweekday = firstweekday;
    }

    /**
     * Return an array for one week of weekday numbers starting with the
     * configured first one.
     *
     * @api public
     */
    iterweekdays() {
        var weekdays = [];
        for (var i = this._firstweekday; i < this._firstweekday + 7; i++) {
            weekdays.push(i % 7);
        }

        return weekdays;
    }

    /**
     * Return an array for one month. The array will contain Date
     * values and will always iterate through complete weeks, so it will yield
     * dates outside the specified month.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */
    itermonthdates(year: number, month: number) {
        if (month < 1 || month > 12) {
            throw new Error('IllegalMonthError');
        }

        var date = new Date(year, month - 1, 1);
        var day = _adjustWeekday(date.getDay());
        var days = (day - this._firstweekday) >= 0 ? (day - this._firstweekday) % 7 : 7 + (day - this._firstweekday);

        date.setTime(date.getTime() - (days * this._oneday));

        var dates = [];
        while (true) {
            dates.push(new Date(date.getTime()));

            var currentDate = date.getDate();
            date.setTime(date.getTime() + this._oneday);

            // Hack to account for DST
            while (date.getDate() === currentDate) {
                date.setTime(date.getTime() + this._onehour);
            }

            if (date.getMonth() !== month - 1 && _adjustWeekday(date.getDay()) === this._firstweekday) {
                break;
            }
        }

        return dates;
    }

    /**
    * Like itermonthdates(), but will yield day numbers. For days outside
    * the specified month the day number is 0.
    *
    * @param {Number} year
    * @param {Number} month
    * @api public
    */
    itermonthdays(year: number, month: number) {
        return this.itermonthdates(year, month).map(function (value) {
            return value.getMonth() === month - 1 ? value.getDate() : 0;
        })
    }

    /**
     * Like itermonthdates(), but will yield [day number, weekday number]
     * arrays. For days outside the specified month the day number is 0.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */
    itermonthdays2(year: number, month: number) {
        return this.itermonthdates(year, month).map(function (value) {
            return value.getMonth() === month - 1 ? [value.getDate(), _adjustWeekday(value.getDay())] : [0, _adjustWeekday(value.getDay())];
        }, this);
    }

    /**
   * Return a matrix (array of array) representing a month's calendar.
   * Each row represents a week; week entries are Date values.
   *
   * @param {Number} year
   * @param {Number} month
   * @api public
   */
    monthdatescalendar(year: number, month: number) {
        var days = [];
        let dates = this.itermonthdates(year, month);
        for (var i = 0; i < dates.length; i += 7) {
            days.push(dates.slice(i, i + 7));
        }

        return days;
    }

    /**
     * Return a matrix representing a month's calendar.
     * Each row represents a week; days outside this month are zero.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */
    monthdayscalendar(year: number, month: number) {
        var days = [];
        let dates = this.itermonthdays(year, month);
        for (var i = 0; i < dates.length; i += 7) {
            days.push(dates.slice(i, i + 7));
        }

        return days
    }

    /**
     * Return a matrix representing a month's calendar.
     * Each row represents a week; week entries are
     * [day number, weekday number] arrays. Day numbers outside this month
     * are zero.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */
    monthdays2calendar(year: number, month: number) {
        var days = [];
        let dates = this.itermonthdays2(year, month);
        for (var i = 0; i < dates.length; i += 7) {
            days.push(dates.slice(i, i + 7));
        }

        return days;
    };

    /**
     * Return the data for the specified year ready for formatting. The return
     * value is an array of month rows. Each month row contains up to width months.
     * Each month contains between 4 and 6 weeks and each week contains 1-7
     * days. Days are Date objects.
     *
     * @param {Number} year
     * @param {Number} width
     * @api public
     */
    yeardatescalendar(year: number, width: number) {
        width = typeof (width) === "undefined" ? 3 : width;

        var months = [];
        for (var month = 1; month <= 12; month++) {
            months.push(this.monthdatescalendar(year, month));
        }

        var rows = [];
        for (var i = 0; i < months.length; i += width) {
            rows.push(months.slice(i, i + width));
        }
        return rows;
    };

    /**
     * Return the data for the specified year ready for formatting (similar to
     * yeardatescalendar()). Entries in the week arrays are day numbers.
     * Day numbers outside this month are zero.
     *
     * @param {Number} year
     * @param {Number} width
     * @api public
     */
    yeardayscalendar(year: number, width: number) {
        width = typeof (width) === "undefined" ? 3 : width;

        var months = [];
        for (var month = 1; month <= 12; month++) {
            months.push(this.monthdayscalendar(year, month));
        }

        var rows = [];
        for (var i = 0; i < months.length; i += width) {
            rows.push(months.slice(i, i + width));
        }
        return rows;
    };

    /**
     * Return the data for the specified year ready for formatting (similar to
     * yeardatescalendar()). Entries in the week arrays are
     * [day number, weekday number] arrays. Day numbers outside this month are
     * zero.
     *
     * @param {Number} year
     * @param {Number} width
     * @api public
     */
    yeardays2calendar(year: number, width: number) {
        width = typeof (width) === "undefined" ? 3 : width

        var months = []
        for (var month = 1; month <= 12; month++) {
            months.push(this.monthdays2calendar(year, month))
        }

        var rows = [];
        for (var i = 0; i < months.length; i += width) {
            rows.push(months.slice(i, i + width))
        }
        return rows;
    }
}

var calendar = {
    isleap,
    leapdays,
    monthrange,
    weekday,
    setlocale,
    timegm,
    Calendar,

    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,

    JANUARY: 1,
    FEBRUARY: 2,
    MARCH: 3,
    APRIL: 4,
    MAY: 5,
    JUNE: 6,
    JULY: 7,
    AUGUST: 8,
    SEPTEMBER: 9,
    OCTOBER: 10,
    NOVEMBER: 11,
    DECEMBER: 12
}

calendar.setlocale()

export default calendar