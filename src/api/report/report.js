import request from '@/utils/request'

export function getMenusTree() {
  return request({
    url: 'api/report/tree',
    method: 'get'
  })
}

export function add(data) {
  if (data.type === '0') {
    data.db_id = ''
  }

  const flag = data.conditionForm.conditions.some(c => {
    return c.pvalue === null || c.pvalue === undefined || c.pvalue === ''
  })

  if (flag) Object.assign(data, { conditions: '' })
  else Object.assign(data, { conditions: JSON.stringify(data.conditionForm.conditions) })
  delete data.conditionForm
  return request({
    url: 'api/report',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/report/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  const flag = data.conditionForm.conditions.some(c => {
    return c.pvalue === null || c.pvalue === undefined || c.pvalue === ''
  })

  if (flag) Object.assign(data, { conditions: '' })
  else Object.assign(data, { conditions: JSON.stringify(data.conditionForm.conditions) })
  delete data.conditionForm

  return request({
    url: 'api/report',
    method: 'put',
    data
  })
}
export function queryReport(id, params) {
  return request({
    url: 'api/report/query/' + id,
    method: 'get',
    params
  })
}
export function getReport(id) {
  return request({
    url: 'api/report/display/' + id,
    method: 'get'
  })
}
export function exportReport(id) {
  return request({
    url: 'api/report/export/' + id,
    method: 'get',
    responseType: 'blob'
  })
}

export function sendReport(id) {
  return request({
    url: 'api/report/send/' + id,
    method: 'get'
  })
}
export default { add, edit, del, getMenusTree, getReport, exportReport, sendReport, queryReport }
