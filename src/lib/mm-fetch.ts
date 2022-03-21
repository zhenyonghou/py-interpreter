const FETCH_HOST = 'https://lp-pyast-api.imwatt.com'

interface Kv {
  [key: string]: any
}

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

    const response = await fetch(`${FETCH_HOST}${url}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (response.status >= 200 && response.status < 300) {
      const respData = await response.json()
      if (respData.err_code > 0) {
        return respData
      } else {
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
}

export default MMFetch