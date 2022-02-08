// import 'whatwg-fetch';
import Utils from './utils';
import Auth from './auth';

// const FETCH_HOST = process.env.NODE_ENV === 'development' ? 'https://g-op-api.imwatt.com': 'https://g-op-api.imwatt.com'
// const FETCH_HOST = 'http://47.100.73.157:7475'
const FETCH_HOST = 'http://127.0.0.1:7475'

interface Kv {
  [key: string]: any
}

// const checkStatus = (response: Response) => {
//   if (response.status >= 200 && response.status < 300) {
//     return response;
//   } else {
//     const error = new Error(response.statusText);
//     throw error;
//   }
// }

class MMFetch {
  // 设置全局回调
  static onError: (statusCode: number, errCode: number, msg: string) => void
  static onTokenExpired: () => void

  // post请求(json格式数据)
  static async post(url: string, opt = {}, withAuth = true) {

    let data: Kv = {}
    if (opt) {
      data = { ...opt }
    }

    if (withAuth) {
      const { token } = Auth.getAuthData()
      // data.mid = parseInt(mid)
      data.token = token
    }

    const response = await fetch(`${FETCH_HOST}${url}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (response.status >= 200 && response.status < 300) {
      const respData = await response.json()
      if (respData.err_code > 0) {
        return respData
      } else {
        // console.log(respData.msg)

        if (respData.err_code == -1004) { // token过期
          MMFetch.onTokenExpired()
        } else {
          MMFetch.onError(response.status, respData.err_code, respData.msg)
        }
      }
    } else {
      MMFetch.onError(response.status, 0, '报错了')
    }
    return null
  }

  static async postRaw(url: string, data: any) {
    const response = await fetch(`${FETCH_HOST}${url}`, {
      method: 'POST',
      body: data
    })

    if (response.status >= 200 && response.status < 300) {
      return response
    } else {
      MMFetch.onError(response.status, 0, '报错了')
    }
    return null
  }

  static async get(url: string, parameters: any) {
    let fetchUrl = `${FETCH_HOST}${url}`;
    if (parameters) {
      fetchUrl = fetchUrl + Utils.jsonToSearch(parameters);
    }

    const response = await fetch(fetchUrl, {
      method: 'GET',
    })

    if (response.status >= 200 && response.status < 300) {
      const respData = await response.json()
      if (respData.err_code > 0) {
        return respData
      } else {
        // console.log(respData.msg)

        if (respData.err_code == -1004) { // token过期
          MMFetch.onTokenExpired()
        } else {
          MMFetch.onError(response.status, respData.err_code, respData.msg)
        }
      }
    } else {
      MMFetch.onError(response.status, 0, '报错了')
    }
    return null
  }

  static async uploadFile(url: RequestInfo, formData: FormData) {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })

    if (response.status >= 200 && response.status < 300) {
      const respData = await response.json()
      if (respData.err_code > 0) {
        return respData
      } else {
        // console.log(respData.msg)

        if (respData.err_code == -1004) { // token过期
          MMFetch.onTokenExpired()
        } else {
          MMFetch.onError(response.status, respData.err_code, respData.msg)
        }
      }
    } else {
      MMFetch.onError(response.status, 0, '报错了')
    }
    return null
  }
}

export default MMFetch