import request from '@/utils/request'
import qs from 'qs'


export function exec(ids,batch_id) {
  return request({
    url: 'api/etl/exec?ids='+ids+"&fileName="+batch_id,
    method: 'get'
  })
}

export function getRule(filename) {
  return request({
    url: 'api/etl/rule?fileName='+filename,
    method: 'get'
  })
}


export function query(params) {
  return request({
    url: 'api/etl?' + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}

export default { exec, query ,getRule}
