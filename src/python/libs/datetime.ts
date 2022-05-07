// 参考自: https://github.com/tstriker/py-datetime
import { KV } from "../../ast/node-interpreter/node-eval-utils/types";
import * as d3TimeFormat from 'd3-time-format'


let toMillis : KV = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7,
};

class time {
    hour: number = 0
    minute: number = 0
    second: number = 0
    millisecond: number = 0

    constructor(hour: number, minute: number, second: number, millisecond: number) {
        let args: KV = {hour, minute, second, millisecond};
        if (hour != null && typeof hour != "number") {
            // we have a dict
            args = hour;
        }
        (["hour", "minute", "second", "millisecond"]).forEach((field) => {
            args[field] = args[field] || 0;
        });
        Object.assign(this, args);
    }

    str() {
        // we have to set the date to today to avoid any daylight saving nonsense
        let ts = dt.datetime.combine(dt.datetime.now(), this)
        return d3TimeFormat.timeFormat("%H:%M:%S.%f")(new Date(ts));
    }

    get __totalMillis() {
        return (
            this.hour * toMillis.hours +
            this.minute * toMillis.minutes +
            this.second * toMillis.seconds +
            this.millisecond
        );
    }

    valueOf() {
        return this.__totalMillis;
    }

    toString() {
        return this.str();
    }
}
function timeWrapper(hour: number, minute: number, second: number, millisecond: number) {
    return new time(hour, minute, second, millisecond);
}

class date {
    [index: string]: any
    year: number = 0
    month: number = 0
    day: number = 0

    constructor(year: number, month: number, day: number) {
        Object.assign(this, {year, month, day});
    }

    get jsDate() {
        return new Date(this.year, this.month - 1, this.day);
    }

    str() {
        return d3TimeFormat.timeFormat("%Y-%m-%d")(this.jsDate);
    }

    weekday() {
        // javascript week starts on sunday, while python one starts on monday
        return ((this.jsDate.getDay() + 6) % 7);
    }

    isoweekday() {
        return this.weekday() + 1;
    }

    get __totalMillis() {
        return this.jsDate.getTime();
    }

    valueOf() {
        return this.__totalMillis;
    }

    toString() {
        return this.str();
    }
}
function dateWrapper(year: number, month: number, day: number) {
    return new date(year, month, day)
}

class datetime {
    [index: string]: any
    year: number = 0
    month: number = 0
    day: number = 0
    hour: number = 0
    minute: number = 0
    second: number = 0
    millisecond: number = 0
    utc: boolean = false

    constructor(year: number|Date|datetime|date, month?: number, day?: number, 
                hour: number = 0, minute: number = 0, second: number = 0, millisecond: number = 0, utc: boolean = false) {
        let args:KV = {}
        // this.utc = utc

        if (typeof year == "number" && !month && !day) {
            // while a dt.datetime(2020) is perfectly valid, it's quite unlikely.
            // much more unlikely than having gotten an epoch passed in. convert that to date
            year = new Date(year);
        }

        if (year instanceof datetime || year instanceof date) {
            (["year", "month", "day", "hour", "minute", "second", "millisecond", "utc"]).forEach((field) => {
                let ts = year as datetime|date
                args[field] = ts[field];
            })
        } else if (year instanceof Date) {
            let ts = year;
            args = {
                year: ts.getFullYear(),
                month: ts.getMonth() + 1,
                day: ts.getDate(),
                hour: ts.getHours(),
                minute: ts.getMinutes(),
                second: ts.getSeconds(),
                millisecond: ts.getMilliseconds(),
            };
        } else {
            args = {year, month, day, hour, minute, second, millisecond};
        }
        Object.assign(this, args);
    }

    replace(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number) {
        // returns new date with updated values
        let args = {};
        if (year && typeof year != "number") {
            args = year
        } else {
            args = {year, month, day, hour, minute, second, millisecond}
        }

        let newTs = new datetime(this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
        Object.entries(args).forEach(([key, val]) => {
            if (val != null) {
                newTs[key] = val;
            }
        });
        return newTs;
    }

    get jsDate() :any {
        if (this.utc) {
            return new Date(this.valueOf());
        } else {
            return new Date(
                this.year,
                this.month - 1,
                this.day || 1,
                this.hour || 0,
                this.minute || 0,
                this.second || 0,
                this.millisecond || 0,
            );
        }
    }

    str() {
        return d3TimeFormat.timeFormat("%Y-%m-%d %H:%M:%S.%f")(this.jsDate);
    }

    valueOf() {
        if (this.utc) {
            return Date.UTC(
                this.year,
                this.month - 1,
                this.day || 1,
                this.hour || 0,
                this.minute || 0,
                this.second || 0,
                this.millisecond || 0,
            )
        } else {
            return this.jsDate.getTime();
        }
    }

    toString() {
        return this.str();
    }

    strftime(format: string) {
        return d3TimeFormat.timeFormat(format)(this.jsDate);
    }

    time() {
        return new time(this.hour, this.minute, this.second, this.millisecond);
    }

    date() {
        return new date(this.year, this.month, this.day);
    }

    weekday() {
        // javascript week starts on sunday, while python one starts on monday
        return this.date().weekday();
    }

    isoweekday() {
        return this.weekday() + 1;
    }
}

function datetimeWrapper(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number) {
    return new datetime(year, month, day, hour, minute, second, millisecond)
}

datetimeWrapper.strptime = (dateString: string, format: string, utc: boolean = false) => {
    let parser = utc ? d3TimeFormat.utcParse : d3TimeFormat.timeParse;
    let parsed = parser(format)(dateString);
    if (!parsed) {
        throw(`ValueError: time data '${dateString}' does not match format '${format}'`)
    }
    return utc ? datetimeWrapper.utc(parsed) : new datetime(parsed);
}

datetimeWrapper.now = () => {
    return new datetime(new Date());
}
datetimeWrapper.combine = (date: any, time: any) => {
    date = new datetime(date);
    Object.assign(date, time);
    return date;
}

datetimeWrapper.utc = (ts: any) => {
    if (typeof ts == "number") {
        // while a dt.datetime(2020) is perfectly valid, it's quite unlikely.
        // much more unlikely than having gotten an epoch passed in. convert that to date
        ts = new Date(ts);
    }
    return new datetime(
        ts.getUTCFullYear(),
        ts.getUTCMonth() + 1,
        ts.getUTCDate(),
        ts.getUTCHours(),
        ts.getUTCMinutes(),
        ts.getUTCSeconds(),
        ts.getUTCMilliseconds(),
        true
    );
}

class timedelta {
    [index: string]: any

    days: number = 0
    seconds: number = 0
    milliseconds: number = 0
    minutes: number = 0
    hours: number = 0
    weeks: number = 0

    constructor(days: number, seconds: number, milliseconds: number, minutes: number, hours: number, weeks: number) {
        let args: KV = {weeks, days, hours, minutes, seconds, milliseconds}
        if (typeof days != "number") {
            // we have a dict
            args = days;
        } else if (Math.abs(days) > 900) {
            // we have millis, let's deconstruct into days, hours, minutes, seconds, milliseconds
            let totalMillis = days
            args = {};
            
            (["days", "hours", "minutes", "seconds", "milliseconds"]).forEach(key => {
                let multiplier = toMillis[key]
                let val = Math.floor(totalMillis / multiplier)
                if (val) {
                    args[key] = val
                    totalMillis -= val * multiplier
                }
            })
        }

        (["weeks", "days", "hours", "minutes", "seconds", "milliseconds"]).forEach((key) => {
            this[key] = args[key] || 0;
        });
    }

    get __totalMillis() {
        let tsFields = ["weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
        let millis = tsFields.map((field) => this[field] * toMillis[field]);
        return millis.reduce((total, current) => total + current);
    }

    str() {
        return d3TimeFormat.timeFormat("%H:%M:%S.%f")(new Date(this.valueOf()));
    }

    valueOf() {
        return this.__totalMillis;
    }

    toString() {
        return this.str();
    }

    totalSeconds() {
        return this.__totalMillis / 1000;
    }
}

function timedeltaWrapper(days: number, seconds: number, milliseconds: number, minutes: number, hours: number, weeks: number) {
    return new timedelta(days, seconds, milliseconds, minutes, hours, weeks)
}

const dt = {
    datetime: datetimeWrapper,
    time: timeWrapper,
    date: dateWrapper,
    timedelta: timedeltaWrapper,
}

export default dt