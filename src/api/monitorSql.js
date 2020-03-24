import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/monitorSql',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/monitorSql/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/monitorSql',
    method: 'put',
    data
  })
}

export function get(id) {
  return request({
    url: `api/monitorSql/${id}`,
    method: 'get',
  })
}

export default { add, edit, del,get }
