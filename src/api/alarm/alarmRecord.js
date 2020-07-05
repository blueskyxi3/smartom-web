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

export function pause(code) {
  return request({
    url: 'alarm-api/alarmRecord/pause/' + code,
    method: 'get'
  })
}

export function resume(code) {
  return request({
    url: 'alarm-api/alarmRecord/resume/' + code,
    method: 'get'
  })
}

export function clear(code) {
  return request({
    url: 'alarm-api/alarmRecord/clear/' + code,
    method: 'delete'
  })
}

export function queryAlarmHis(params) {
  return request({
    url: 'alarm-api/alarmRecord/alarmhis',
    method: 'get',
    params: params
  })
}

export function addGuide(data) {
  return request({
    url: 'alarm-api/alarmRecord/alarmGuide',
    method: 'post',
    data
  })
}

export function getGuide(definitionId) {
  return request({
    url: 'alarm-api/alarmRecord/alarmGuide/' + definitionId,
    method: 'get'
  })
}

export default { add, edit, del, resume, pause, clear, addGuide, getGuide, queryAlarmHis }
