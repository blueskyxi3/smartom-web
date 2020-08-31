import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'notif-api/notificationHistory',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'notif-api/notificationHistory/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'notif-api/notificationHistory',
    method: 'put',
    data
  })
}

export default { add, edit, del }
