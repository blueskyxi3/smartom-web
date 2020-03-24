import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/process',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/process/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/process',
    method: 'put',
    data
  })
}
export function exec(params) {
  return request({
    url: 'api/process/exec',
    method: 'get',
    params:params
  })
}
export function get(id) {
  return request({
    url: `api/process/${id}`,
    method: 'get',
  })
}
export default { add, edit, del,get,exec }
