
export default class Auth {
  constructor() {

  }

  static saveAuthData(obj: any) {
    localStorage.setItem('auth_data', JSON.stringify(obj));
  }

  static clearAuthData() {
    localStorage.removeItem('auth_data');
  }

  static getAuthData() {
    let str = localStorage.getItem('auth_data');
    if (str) {
      let obj = JSON.parse(str)
      return obj
    }
    return {};
  }

  static isAuthenticated() {
    return !!localStorage.getItem('auth_data')
  }
}