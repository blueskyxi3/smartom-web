import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/serverDeploy',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/serverDeploy',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/serverDeploy',
    method: 'put',
    data
  })
}
export function getServers() {
  return request({
    url: 'api/serverDeploy',
    method: 'get'
  })
}
export default { add, edit, del,getServers }
