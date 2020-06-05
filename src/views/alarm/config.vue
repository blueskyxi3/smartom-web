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
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="Master Code">
            <el-input v-model="form.masterCode" style="width: 100px;" />
          </el-form-item>
          <el-form-item label="Sub-code">
            <el-input v-model="form.subCode" style="width: 100px;" />
          </el-form-item>
          <el-form-item label="Subject">
            <el-input v-model="form.alarmSubject" style="width: 224px;" />
          </el-form-item>
          <el-form-item label="Severity">
            <el-select v-model="form.severity" filterable placeholder="Set severity">
              <el-option
                v-for="item in dict.alarm_severity"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="System Type">
            <el-select v-model="form.systemType" filterable placeholder="Select system type">
              <el-option
                v-for="item in dict.system_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Status">
            <el-checkbox v-model="form.isEnabled">Enable/Disable</el-checkbox>
          </el-form-item>
          <el-form-item label="Auto-clear after">
            <el-input v-model="form.autoClearTime" style="width: 60px;" />&nbsp; minutes
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">Cancel</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">OK</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="columns.visible('masterCode')" prop="masterCode" label="Master Code" />
        <el-table-column v-if="columns.visible('subCode')" prop="subCode" label="Sub-code" />
        <el-table-column v-if="columns.visible('alarmSubject')" prop="alarmSubject" label="Subject" />
        <el-table-column v-if="columns.visible('severity')" prop="severity" label="Severity">
          <template slot-scope="scope">
            {{ dict.label.alarm_severity[scope.row.severity] }}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('systemType')" prop="systemType" label="System Type">
          <template slot-scope="scope">
            {{ dict.label.system_type[scope.row.systemType] }}
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','alarmDefinition:edit','alarmDefinition:del']" label="Actions" width="150px" align="center">
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
import crudAlarmDefinition from '@/api/alarm/alarmDefinition'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: 'alarm', url: 'alarm-api/alarmDefinition', sort: 'id,desc', crudMethod: { ...crudAlarmDefinition }})
const defaultForm = { id: null, masterCode: null, subCode: null, alarmSubject: null, severity: null, systemType: null, alarmTemplateId: null, isEnabled: null, autoClearTime: null }
export default {
  name: 'AlarmDefinition',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['alarm_severity', 'system_type'],
  data() {
    return {
      permission: {
        add: ['admin', 'alarmDefinition:add'],
        edit: ['admin', 'alarmDefinition:edit'],
        del: ['admin', 'alarmDefinition:del']
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
