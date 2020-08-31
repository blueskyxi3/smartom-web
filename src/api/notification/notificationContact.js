import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'notif-api/notificationContact',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'notif-api/notificationContact/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'notif-api/notificationContact',
    method: 'put',
    data
  })
}

export function loadAllContacts() {
  return request({
    url: 'notif-api/notificationContact/loadAll',
    method: 'get'
  })
}

export default { add, edit, del }
