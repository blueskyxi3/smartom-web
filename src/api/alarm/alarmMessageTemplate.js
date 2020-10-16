import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'alarm-api/alarmMessageTemplate',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'alarm-api/alarmMessageTemplate/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'alarm-api/alarmMessageTemplate',
    method: 'put',
    data
  })
}

export function listAllTemplates() {
  return request({
    url: 'alarm-api/alarmMessageTemplate',
    method: 'get'
  })
}

export default { add, edit, del }
