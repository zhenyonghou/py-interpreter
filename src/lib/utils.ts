import moment from 'moment'

export default class Utils {
  static GetTimestamp() {
    return Math.ceil((new Date()).getTime() / 1000)
  }

  static jsonToSearch(obj: any) {
    let arr = [];
    for (let k in obj) {
      arr.push(`${k}=${obj[k]}`);
    }
    return ('?' + arr.join('&'));
  }

  static unixToTime(unix: number, format = 'YYYY-MM-DD HH:mm') {
    return moment.unix(unix).format(format)
  }

  static scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
}