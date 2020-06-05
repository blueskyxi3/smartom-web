import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'alarm-api/alarmDefinition',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'alarm-api/alarmDefinition/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'alarm-api/alarmDefinition',
    method: 'put',
    data
  })
}

export default { add, edit, del }
