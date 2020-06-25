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
          <el-form-item label="System Type" prop="systemType">
            <el-select v-model="form.systemType" filterable placeholder="Select system type">
              <el-option
                v-for="item in dict.system_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Master Code" prop="masterCode">
            <el-input-number v-model="form.masterCode" controls-position="right" style="width: 100px;" />
          </el-form-item>
          <el-form-item label="Sub-code" prop="subCode">
            <el-input-number v-model="form.subCode" controls-position="right" style="width: 100px;" />
          </el-form-item>
          <el-form-item label="Subject" prop="alarmSubject">
            <el-input v-model="form.alarmSubject" style="width: 224px;" />
          </el-form-item>
          <el-form-item label="Severity" prop="severity">
            <el-select v-model="form.severity" filterable placeholder="Set severity">
              <el-option
                v-for="item in dict.alarm_severity"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Status" prop="isEnabled">
            <el-checkbox v-model="form.isEnabled">Enable/Disable</el-checkbox>
          </el-form-item>
          <el-form-item label="Auto-clear after" prop="autoClearTime">
            <el-input v-model="form.autoClearTime" style="width: 60px;" />&nbsp; minutes
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">Cancel</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">Continue</el-button>
        </div>
      </el-dialog>
      <el-dialog :close-on-click-modal="false" :visible.sync="config.display" title="Configure Alarm" width="500px">
        <el-form ref="configForm" :model="config.form" size="small" label-width="160px">
          <el-form-item prop="alarmDefinitionId" hidden="true">
            <el-input v-model="config.form.alarmDefinitionId" type="hidden" />
          </el-form-item>
          <el-form-item label="1st Level Recipients" prop="firstLevelRecipients">
            <el-autocomplete
              class="inline-input"
              :fetch-suggestions="querySearch"
              placeholder="Select Recipients"
              :trigger-on-focus="false"
              style="width: 140px;"
              value-key="userName"
              @select="selectFirstLevelRecipients"
            />
          </el-form-item>
          <el-form-item label="2nd Level Recipients" prop="secondLevelRecipients">
            <el-autocomplete
              class="inline-input"
              :fetch-suggestions="querySearch"
              placeholder="Select Recipients"
              :trigger-on-focus="false"
              style="width: 140px;"
              value-key="userName"
              @select="selectSecondLevelRecipients"
            />
          </el-form-item>
          <el-form-item label="3rd Level Recipients" prop="thirdLevelRecipients">
            <el-autocomplete
              class="inline-input"
              :fetch-suggestions="querySearch"
              placeholder="Select Recipients"
              :trigger-on-focus="false"
              style="width: 140px;"
              value-key="userName"
              @select="selectThirdLevelRecipients"
            />
          </el-form-item>
          <el-form-item label="Template" />
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text">Back</el-button>
          <el-button type="primary">Done</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="columns.visible('systemType')" prop="systemType" label="System Type">
          <template slot-scope="scope">
            {{ dict.label.system_type[scope.row.systemType] }}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('masterCode')" prop="masterCode" label="Master Code" />
        <el-table-column v-if="columns.visible('subCode')" prop="subCode" label="Sub-code" />
        <el-table-column v-if="columns.visible('severity')" prop="severity" label="Severity">
          <template slot-scope="scope">
            {{ dict.label.alarm_severity[scope.row.severity] }}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('alarmSubject')" prop="alarmSubject" label="Subject" />
        <el-table-column v-if="columns.visible('isEnabled')" prop="isEnabled" label="Status">
          <template slot-scope="scope">
            <span v-if="scope.row.isEnabled">Enabled</span>
            <span v-else>Disabled</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','alarmDefinition:config','alarmDefinition:test']" label="Actions" width="150px" align="center">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-setting"
              size="mini"
              @click="toConfig(scope.row.id)"
            />
            <el-button
              icon="el-icon-message"
              size="mini"
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
import pagination from '@crud/Pagination'
import { getByAlarmCode } from '@/api/alarm/alarmDefinition'
import { loadAllContacts } from '@/api/notification/notificationContact'

// crud交由presenter持有
const defaultCrud = CRUD({ title: 'alarm', url: 'alarm-api/alarmDefinition', sort: 'id,desc', crudMethod: { ...crudAlarmDefinition }})
const defaultForm = { id: null, masterCode: null, subCode: null, alarmSubject: null, severity: null, systemType: null, alarmTemplateId: null, isEnabled: null, autoClearTime: null }
export default {
  name: 'AlarmDefinition',
  components: { pagination, crudOperation, rrOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['alarm_severity', 'system_type'],
  data() {
    const validateAlarmCode = (rule, value, callback) => {
      if (value === 0 || value === '' || value === undefined || value == null) {
        callback(new Error('Please input a valid alarm code'))
      } else {
        // Check whether the alarm code exists in system
        getByAlarmCode(this.form.masterCode, this.form.subCode).then(result => {
          if (result) {
            callback(new Error('Alarm code already exists'))
          } else {
            callback()
          }
        })
      }
    }
    return {
      permission: {
        add: ['admin', 'alarmDefinition:add'],
        edit: ['admin', 'alarmDefinition:edit'],
        del: ['admin', 'alarmDefinition:del']
      },
      rules: {
        systemType: [
          { required: true, message: 'Please select a system type', trigger: 'blur' }
        ],
        masterCode: [
          { required: true, trigger: 'blur', validator: validateAlarmCode }
        ],
        subCode: [
          { required: true, trigger: 'blur', validator: validateAlarmCode }
        ],
        alarmSubject: [
          { required: true, message: 'Please input alarm subject', trigger: 'blur' },
          { min: 2, max: 200, message: '2 ~ 200 characters allowed', trigger: 'blur' }
        ],
        severity: [
          { required: true, message: 'Please set the severity', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'severity', display_name: 'Severity' },
        { key: 'systemType', display_name: 'System Type' }
      ],
      config: {
        display: false,
        form: {
          alarmDefinitionId: null,
          escalations: []
        }
      },
      recipients: []
    }
  },
  mounted() {
    loadAllContacts().then(result => {
      if (result) {
        this.recipients = result
      } else {
        console.log('No contacts found')
      }
    })
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      const query = this.query
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      return true
    },
    [CRUD.HOOK.afterSubmit]() {
      console.log('Submit complete')
    },
    toConfig(alarmDefId) {
      this.config.form.alarmDefinitionId = alarmDefId
      this.config.display = true
    },
    querySearch(queryString, cb) {
      var recipients = this.recipients
      var results = queryString ? recipients.filter(this.createFilter(queryString)) : recipients
      // callback to return the filtered list
      cb(results)
    },
    createFilter(queryString) {
      return (recipient) => {
        return (recipient.userName.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    selectFirstLevelRecipients(item) {
      var eList = this.config.form.escalations
      var e
      if (eList.length === 0) {
        e = {
          escalationLevel: 1,
          escalationRule: null,
          escalationValue: null,
          contacts: []
        }
        eList.push(e)
      } else {
        e = eList[0]
      }
      if (!e.contacts.includes(item)) {
        e.contacts.push(item)
      }
    },
    selectSecondLevelRecipients(item) {
      var eList = this.config.form.escalations
      var e
      if (eList.length === 1) {
        e = {
          escalationLevel: 2,
          escalationRule: null,
          escalationValue: null,
          contacts: []
        }
        eList.push(e)
      } else {
        e = eList[1]
      }
      if (!e.contacts.includes(item)) {
        e.contacts.push(item)
      }
    },
    selectThirdLevelRecipients(item) {
      var eList = this.config.form.escalations
      var e
      if (eList.length === 2) {
        e = {
          escalationLevel: 3,
          escalationRule: null,
          escalationValue: null,
          contacts: []
        }
        eList.push(e)
      } else {
        e = eList[2]
      }
      if (!e.contacts.includes(item)) {
        e.contacts.push(item)
      }
    }
  }
}
</script>

<style scoped>

</style>
