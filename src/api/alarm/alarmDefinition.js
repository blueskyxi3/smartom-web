import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'alarm-api/alarmDefinition',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'alarm-api/alarmDefinition/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'alarm-api/alarmDefinition',
    method: 'put',
    data
  })
}

export function config(data) {
  return request({
    url: 'alarm-api/alarmDefinition/config',
    method: 'post',
    data
  })
}

export function getByAlarmCode(masterCode, subCode) {
  if (!(masterCode === '' || masterCode === undefined || masterCode == null ||
        subCode === '' || subCode === undefined || subCode == null)) {
    return request({
      url: 'alarm-api/alarmDefinition/' + masterCode + '/' + subCode,
      method: 'get'
    })
  }
}

export function loadAlarmConfig(alarmCode) {
  return request({
    url: 'alarm-api/alarmDefinition/config/' + alarmCode,
    method: 'get'
  })
}

export function testAlarm(data) {
  return request({
    url: 'alarm-api/alarmDefinition/test',
    method: 'post',
    data
  })
}

export function autoGenerate(systemType) {
  return request({
    url: 'alarm-api/alarmDefinition/generateAlarmCode/' + systemType,
    method: 'get'
  })
}

export default { add, edit, del }
