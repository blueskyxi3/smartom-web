import request from '@/utils/request'
import qs from 'qs'

export function initData(url, params) {
  let lab = '?'
  if(url.indexOf(lab) != -1) lab = '&'

  return request({
    url: url + lab + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}

export function download(url, params) {
  return request({
    url: url + '?' + qs.stringify(params, { indices: false }),
    method: 'get',
    responseType: 'blob'
  })
}
