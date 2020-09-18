import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/sql',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/sql/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/sql',
    method: 'put',
    data
  })
}
export function exec(params) {
  return request({
    url: 'api/sql/execQuery',
    method: 'get',
    params: params
  })
}
export function get(id) {
  return request({
    url: `api/sql/${id}`,
    method: 'get'
  })
}
export function checkAlarmDef(params) {
  return request({
    url: 'api/sql/checkAlarmDef',
    method: 'get',
    params: params
  })
}

export default { add, edit, del, get, exec, checkAlarmDef }
