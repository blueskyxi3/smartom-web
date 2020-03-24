import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/msgTemplate',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/msgTemplate/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/msgTemplate',
    method: 'put',
    data
  })
}

export function query() {
  return request({
    url: 'api/msgTemplate',
    method: 'get'
  })
}

export default { add, edit, del,query }
