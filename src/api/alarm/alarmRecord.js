import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'alarm-api/alarmRecord',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'alarm-api/alarmRecord/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'alarm-api/alarmRecord',
    method: 'put',
    data
  })
}

export default { add, edit, del }