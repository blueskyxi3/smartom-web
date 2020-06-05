<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.value" clearable placeholder="Search" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.type" clearable placeholder="Condition" class="filter-item" style="width: 130px">
          <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="columns.visible('alarmDefinitionId')" prop="alarmDefinitionId" label="Alarm Definition ID" />
        <el-table-column v-if="columns.visible('currEscalationLevel')" prop="currEscalationLevel" label="Escalation Level" />
        <el-table-column v-if="columns.visible('createdBy')" prop="createdBy" label="Alarm Source" />
        <el-table-column v-if="columns.visible('createdTime')" prop="createdTime" label="Alarm Time" />
        <el-table-column v-permission="['admin','alarmRecord:edit','alarmRecord:del']" label="Actions" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudAlarmRecord from '@/api/alarm/alarmRecord'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: 'alarm', url: 'alarm-api/alarmRecord', sort: 'id,desc', crudMethod: { ...crudAlarmRecord }})
const defaultForm = { id: null, masterCode: null, subCode: null, alarmSubject: null, severity: null, systemType: null, alarmTemplateId: null, isEnabled: null, autoClearTime: null }
export default {
  name: 'AlarmRecord',
  components: { pagination, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['alarm_severity', 'system_type'],
  data() {
    return {
      permission: {
        add: ['admin', 'alarmRecord:add'],
        edit: ['admin', 'alarmRecord:edit'],
        del: ['admin', 'alarmRecord:del']
      },
      rules: {
      },
      queryTypeOptions: [
        { key: 'severity', display_name: 'severity' },
        { key: 'systemType', display_name: 'systemType' }
      ]
    }
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      const query = this.query
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      return true
    }
  }
}
</script>

<style scoped>

</style>
