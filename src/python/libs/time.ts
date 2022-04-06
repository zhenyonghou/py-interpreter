
class struct_time {
    tm_year: number
    tm_mon: number
    tm_mday: number
    tm_hour: number
    tm_min: number
    tm_sec: number
    tm_wday: number
    tm_yday: number
    tm_isdst: number
    tm_zone: string
    tm_gmtoff: number
}

function time() {
    return Date.now() / 1000
}

function sleep(secs: number) {
    const start = time()

    while(1) {
        if (time() - start > secs) {
            break
        }
    }
}

function localtime(secs: number=0) {
    const t = secs || time()
    let d = new Date(t * 1000)
    
    let st = new struct_time()
    st.tm_year = d.getFullYear()
    st.tm_mon = d.getMonth()
    st.tm_mday = d.getDate()
    st.tm_hour = d.getHours()
    st.tm_min = d.getMinutes()
    st.tm_sec = d.getSeconds()
    st.tm_wday = d.getDay()
    // ...
}

function strftime(fmt: string, ...restArgs: any[]) {
    return ""
}

export {struct_time, time, sleep, localtime, strftime}