import request from '@/utils/request'

export function doQuery(data) {
  return request({
    url: 'cdr-api/cdr-query/idd/',
    method: 'post',
    data
  })
}

export function doAnalysis(data) {
  return request({
    url: 'cdr-api/cdr-query/idd/_analyze',
    method: 'post',
    data
  })
}

export function getCustomers() {
  return request({
    url: 'cdr-api/commons/customers/idd',
    method: 'get'
  })
}

export function getCarriers() {
  return request({
    url: 'cdr-api/commons/carriers/idd',
    method: 'get'
  })
}

export function formatTime(input) {
  if (input instanceof Date) {
    const date = String(input.getDate()).padStart(2, '0')
    const month = String((input.getMonth() + 1)).padStart(2, '0')
    const year = input.getFullYear()
    const hours = String(input.getHours()).padStart(2, '0')
    const minutes = String(input.getMinutes()).padStart(2, '0')
    const seconds = String(input.getSeconds()).padStart(2, '0')
    return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds
  } else {
    return ''
  }
}
