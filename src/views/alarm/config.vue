<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-select v-model="query.type" clearable placeholder="Condition" class="filter-item" style="width: 130px">
          <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <el-select v-if="query.type == 'severity'" v-model="query.value" clearable placeholder="Search" style="width: 200px;" class="filter-item">
          <el-option
            v-for="item in dict.alarm_severity"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select v-else-if="query.type == 'systemType'" v-model="query.value" clearable placeholder="Search" style="width: 200px;" class="filter-item">
          <el-option
            v-for="item in dict.system_type"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input v-else v-model="query.value" clearable placeholder="Search" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
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
            <el-link type="primary" @click="generateAlarmCode(form.systemType)">Generate Alarm Code</el-link>
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
          <el-form-item label="Template" prop="alarmTemplateId">
            <el-select v-model="form.alarmTemplateId" style="width: 224px;" disabled>
              <el-option label="Default Alarm Template" value="1" />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">Cancel</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">Continue</el-button>
        </div>
      </el-dialog>
      <el-dialog :close-on-click-modal="false" :before-close="closeConfig" :visible.sync="config.display" title="Configure Alarm" width="700px">
        <el-form ref="configForm" :model="config.form" :rules="configValidationRules" size="small" label-width="160px">
          <el-form-item prop="alarmDefinitionId" hidden="true">
            <el-input v-model="config.form.alarmDefinitionId" type="hidden" />
          </el-form-item>
          <el-form-item label="1st Level Recipients" prop="firstLevelRecipients">
            <ContactPicker :escalation="config.form.escalations[0]" :recipients="recipients" />
          </el-form-item>
          <el-form-item label="2nd Level Recipients" prop="secondLevelRecipients">
            <ContactPicker :escalation="config.form.escalations[1]" :recipients="recipients" />
          </el-form-item>
          <el-form-item label="3rd Level Recipients" prop="thirdLevelRecipients">
            <ContactPicker :escalation="config.form.escalations[2]" :recipients="recipients" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button v-if="config.masterCode !== null && config.subCode !== null" type="text" @click="backToEdit">Back</el-button>
          <el-button v-else type="text" @click="closeConfig">Cancel</el-button>
          <el-button type="primary" @click="doConfig">Done</el-button>
        </div>
      </el-dialog>
      <el-dialog :close-on-click-modal="false" :before-close="cancelTest" :visible.sync="test.display" title="Test Alarm" width="500px">
        <el-form ref="testForm" :model="test.form" :rules="testValidationRules" size="small" label-width="120px">
          <el-form-item label="Recipients" prop="recipients">
            <MedialChannel :recipients="test.form.recipients" />
          </el-form-item>
          <el-form-item label="Message body" prop="messageBody">
            <el-input v-model="test.form.messageBody" type="textarea" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="cancelTest">Cancel</el-button>
          <el-button type="primary" @click="doTest">Go</el-button>
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
        <el-table-column v-permission="['admin','alarmDefinition:config','alarmDefinition:test']" label="Actions" width="250px" align="center">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-setting"
              size="mini"
              @click="toConfig(scope.row.masterCode + '-' + scope.row.subCode)"
            >
              Config
            </el-button>
            <el-button
              icon="el-icon-message"
              size="mini"
              @click="toTest(scope.row.masterCode + '-' + scope.row.subCode)"
            >
              Test
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudAlarmDefinition, { getByAlarmCode, config, loadAlarmConfig, testAlarm, autoGenerate } from '@/api/alarm/alarmDefinition'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import { loadAllContacts } from '@/api/notification/notificationContact'
import ContactPicker from './components/ContactPicker'
import MedialChannel from './components/MediaChannel'
import { validEmail } from '@/utils/validate'

// crud交由presenter持有
const defaultCrud = CRUD({ title: 'alarm', url: 'alarm-api/alarmDefinition', sort: 'id,desc', crudMethod: { ...crudAlarmDefinition }})
const defaultForm = { id: null, masterCode: null, subCode: null, alarmSubject: null, severity: null, systemType: null, alarmTemplateId: null, isEnabled: null, autoClearTime: null }
export default {
  name: 'AlarmDefinition',
  components: { pagination, crudOperation, rrOperation, ContactPicker, MedialChannel },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['alarm_severity', 'system_type', 'escalation_rule'],
  data() {
    const validateAlarmCode = (rule, value, callback) => {
      if (value === 0 || value === '' || value === undefined || value == null) {
        callback(new Error('Please input a valid alarm code'))
      } else {
        // Check whether the alarm code exists in system
        getByAlarmCode(this.form.masterCode, this.form.subCode).then(result => {
          if (result && result.id !== this.form.id) {
            callback(new Error('Alarm code already exists'))
          } else {
            callback()
          }
        })
      }
    }
    const validateFirstLevel = (rule, value, callback) => {
      const escalation = this.config.form.escalations[0]
      if (escalation.contacts.length > 0) {
        const invalidContacts = [] // Check if there're any contacts without medial channels selected
        escalation.contacts.forEach(c => {
          if (c.mediaChannels.filter(m => !m.disabled).length === 0) {
            invalidContacts.push(c.userName)
          }
        })
        if (invalidContacts.length === 0) {
          callback()
        } else {
          callback(new Error('Please select at least one media channel for ' + invalidContacts.join()))
        }
      } else {
        callback(new Error('Please select at least one contact'))
      }
    }
    const validateHigherLevels = (escalation, callback) => {
      if (escalation.contacts.length === 0 && !escalation.escalationRule && !escalation.escalationValue) {
        // Skip validation when nothing input
        callback()
      } else if (escalation.contacts.length === 0) {
        callback(new Error('Please select at least one contact'))
      } else if (!escalation.escalationRule) {
        callback(new Error('Please select escalation rule'))
      } else if (!escalation.escalationValue) {
        callback(new Error('Please select escalation value'))
      } else {
        const invalidContacts = [] // Check if there're any contacts without medial channels selected
        escalation.contacts.forEach(c => {
          if (c.mediaChannels.filter(m => !m.disabled).length === 0) {
            invalidContacts.push(c.userName)
          }
        })
        if (invalidContacts.length === 0) {
          callback()
        } else {
          callback(new Error('Please select at least one media channel for ' + invalidContacts.join()))
        }
      }
    }
    const validateSecondLevel = (rule, value, callback) => {
      validateHigherLevels(this.config.form.escalations[1], callback)
    }
    const validateThirdLevel = (rule, value, callback) => {
      validateHigherLevels(this.config.form.escalations[2], callback)
    }
    const validateMediaChannelsForAlarmTest = (rule, value, callback) => {
      if (!value.length) {
        callback(new Error('Please add at least one recipient'))
      } else {
        value.forEach(v => {
          if (!v.mediaType) {
            callback(new Error('Please select a media type'))
          }
          if (!v.mediaAddress) {
            callback(new Error('Please input the media address'))
          }
          if (v.mediaType === '1' && !validEmail(v.mediaAddress)) {
            callback(new Error('Please input a valid email'))
          } else if (v.mediaType === '2' && !/^\d+$/.test(v.mediaAddress)) {
            callback(new Error('Please input a valid phone number'))
          }
        })
      }
      callback()
    }
    return {
      permission: {
        add: ['admin', 'alarmDefinition:add'],
        edit: ['admin', 'alarmDefinition:edit'],
        del: ['admin', 'alarmDefinition:del'],
        config: ['admin', 'alarmDefinition:config']
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
        },
        masterCode: null,
        subCode: null
      },
      configValidationRules: {
        firstLevelRecipients: [
          { required: true, trigger: 'change', type: 'array', validator: validateFirstLevel }
        ],
        secondLevelRecipients: [
          { required: false, trigger: 'change', type: 'array', validator: validateSecondLevel }
        ],
        thirdLevelRecipients: [
          { required: false, trigger: 'change', type: 'array', validator: validateThirdLevel }
        ]
      },
      test: {
        display: false,
        form: {
          alarmCode: null,
          recipients: [],
          messageBody: null
        }
      },
      testValidationRules: {
        messageBody: [
          { required: true, message: 'Please input message body', trigger: 'blur' },
          { min: 0, max: 400, message: '400 characters allowed', trigger: 'blur' }
        ],
        recipients: [
          { required: true, trigger: 'change', type: 'array', validator: validateMediaChannelsForAlarmTest }
        ]
      },
      recipients: [] // The full list of contacts in system, will be initialized on mount
    }
  },
  beforeUpdate() {
    // Change the data type of systemType and severity to String so the el-select would correctly display selected label
    const t = this.form.systemType
    const s = this.form.severity
    if (t !== null) this.form.systemType = String(t)
    if (s !== null) this.form.severity = String(s)
    // When creating a new alarm, the 'isEnabled' property should be true
    if (this.form.id === null) this.form.isEnabled = true
    // Default template id
    this.form.alarmTemplateId = String(1)
  },
  mounted() {
    // load full list of contacts in system
    loadAllContacts().then(result => {
      if (result) {
        this.recipients = result
      } else {
        this.crud.notify('No contacts found', 'error')
      }
    })

    // initialize escalations
    this.initEscalations()
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
    [CRUD.HOOK.beforeSubmit]() {
      // Get alarm code to config before submit
      this.config.masterCode = this.form.masterCode
      this.config.subCode = this.form.subCode
    },
    [CRUD.HOOK.afterSubmit]() {
      this.toConfig(this.config.masterCode + '-' + this.config.subCode)
    },
    initEscalations() {
      // Initialize 3 escalation levels
      this.config.form.escalations = [
        {
          escalationLevel: 1,
          escalationRule: null,
          escalationValue: null,
          contacts: []
        },
        {
          escalationLevel: 2,
          escalationRule: null,
          escalationValue: null,
          contacts: []
        },
        {
          escalationLevel: 3,
          escalationRule: null,
          escalationValue: null,
          contacts: []
        }
      ]
    },
    toConfig(alarmCode) {
      loadAlarmConfig(alarmCode).then(result => {
        if (result) {
          this.config.form.alarmDefinitionId = result.alarmDefinitionId
          this.initEscalations()
          result.escalations.forEach((item, index) => {
            item.contacts = item.contacts.map(c => {
              const fullContact = this.recipients.find(r => r.userName === c.userName) // Find the user's full contact info
              // Figure out which media channels are disabled
              fullContact.mediaChannels.forEach(m => {
                // If some media channel cannot be found in Escalation contact, it's disabled because the record was not saved into database
                if (!c.mediaChannels.some(mc => String(mc.mediaType) === String(m.mediaType) && mc.mediaAddress === m.mediaAddress)) {
                  c.mediaChannels.push({
                    mediaType: m.mediaType,
                    mediaAddress: m.mediaAddress,
                    disabled: true
                  })
                }
              })
              return c
            })
            // Use Vue.set to update array item
            this.$set(this.config.form.escalations, index, item)
          })
          this.config.display = true
        } else {
          this.crud.notify('Could not load alarm config of: ' + alarmCode, 'error')
        }
      })
    },
    doConfig() {
      this.$refs['configForm'].validate(valid => {
        if (!valid) {
          return
        }
        config(this.config.form).then(() => {
          this.crud.notify('Config Completed', 'success')
          this.closeConfig()
        })
      })
    },
    closeConfig() {
      this.config.display = false
      this.config.masterCode = null
      this.config.subCode = null
    },
    backToEdit() {
      getByAlarmCode(this.config.masterCode, this.config.subCode).then(result => {
        this.config.display = false // Hide the config form
        this.crud.toEdit(result) // Launch the edit form
      })
    },
    toTest(alarmCode) {
      this.test.display = true
      this.test.form.alarmCode = alarmCode
    },
    cancelTest() {
      this.resetTestForm()
      this.test.display = false
    },
    doTest() {
      this.$refs['testForm'].validate(valid => {
        if (!valid) {
          return
        }
        testAlarm(this.test.form).then(() => {
          this.resetTestForm()
          this.test.display = false
          this.crud.notify('Testing Sent', 'success')
        })
      })
    },
    resetTestForm() {
      for (var k in this.test.form) {
        if (Array.isArray(this.test.form[k])) {
          this.test.form[k] = []
        } else {
          this.test.form[k] = null
        }
      }
    },
    generateAlarmCode(systemType) {
      if (!systemType) {
        this.crud.notify('Select a system type first', 'error')
        return
      }
      autoGenerate(systemType).then(result => {
        if (/^\d+-\d+$/.test(result)) {
          const arr = result.split('-')
          this.form.masterCode = arr[0]
          this.form.subCode = arr[1]
        } else {
          this.crud.notify('Generating error', 'error')
        }
      })
    }
  }
}
</script>
