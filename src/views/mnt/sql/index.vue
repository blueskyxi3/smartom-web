<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.value"
          clearable
          placeholder="输入搜索内容"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <el-select
          v-model="query.type"
          clearable
          placeholder="类型"
          class="filter-item"
          style="width: 130px"
        >
          <el-option
            v-for="item in queryTypeOptions"
            :key="item.key"
            :label="item.display_name"
            :value="item.key"
          />
        </el-select>
        <el-select
          v-model="query.dbId"
          clearable
          placeholder="服务器"
          class="filter-item"
          style="width: 130px"
        >
          <el-option
            v-for="item in databases"
            :key="item.name"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="500px"
      >
        <el-form
          ref="form"
          :model="form"
          :rules="rules"
          size="small"
          label-width="80px"
        >
          <el-form-item
            v-if="crud.status.edit"
            label="序号"
          >
            <el-input
              v-model="form.id"
              style="width: 370px;"
              disabled
            />
          </el-form-item>
          <el-form-item
            label="监控项"
            prop="name"
          >
            <el-input
              v-model="form.name"
              style="width: 370px;"
            />
          </el-form-item>
          <el-form-item label="服务器">
            <el-select
              v-model="form.dbId"
              placeholder="请选择"
              style="width: 370px"
            >
              <el-option
                v-for="item in databases"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="系统名"
            prop="serviceName"
          >
            <el-input
              v-model="form.serviceName"
              style="width: 370px;"
            />
          </el-form-item>
          <el-form-item
            label="命令"
            prop="sqlText"
          >
            <el-input
              v-model="form.sqlText"
              :rows="3"
              type="textarea"
              style="width: 370px;"
            />
          </el-form-item>
          <el-form-item
            label="告警规则"
            prop="rule"
          >
            <el-input
              v-model="form.rule"
              :rows="3"
              type="textarea"
              style="width: 370px;"
            />
          </el-form-item>
          <el-form-item label="告警编码">
            <el-select
              v-model="form.alertCode"
              filterable
              placeholder="请选择"
              style="width: 370px;"
              clearable
            >
              <el-option
                v-for="item in dict.alert_code"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="form.remark"
              :rows="3"
              type="textarea"
              style="width: 370px;"
            />
          </el-form-item>
        </el-form>
        <div
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            type="text"
            @click="crud.cancelCU"
          >取消</el-button>
          <el-button
            :loading="crud.cu === 2"
            type="primary"
            @click="crud.submitCU"
          >确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          v-if="columns.visible('id')"
          prop="id"
          label="序号"
          width="100"
        />
        <el-table-column
          v-if="columns.visible('dbId')"
          prop="dbId"
          label="服务器"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <template v-for="item in databases">
              <span
                v-if="item.id == scope.row.dbId"
                :key="item.id"
              >{{ item.name }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.visible('serviceName')"
          prop="serviceName"
          label="系统名"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          v-if="columns.visible('name')"
          prop="name"
          label="监控项"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          v-if="columns.visible('sqlText')"
          prop="sqlText"
          label="命令"
          :show-overflow-tooltip="true"
          width="320"
        />
        <el-table-column
          v-if="columns.visible('rule')"
          prop="rule"
          label="告警规则"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          v-if="columns.visible('alertCode')"
          prop="alertCode"
          label="告警编码"
        >
          <template slot-scope="scope">
            {{ dict.label.alert_code[scope.row.alertCode] }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.visible('createTime')"
          prop="createTime"
          label="创建时间"
          width="160"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.visible('updateDate')"
          prop="updateDate"
          label="执行"
          width="100"
        >
          <template slot-scope="scope">
            <el-button
              v-permission="permission.edit"
              type="primary"
              icon="el-icon-caret-right"
              circle
              @click="exeCMD(scope.row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin','sql:edit','sql:del']"
          label="操作"
          width="150px"
          align="center"
        >
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
import crudDatabase from '@/api/mnt/database'
import crudSql from '@/api/sql'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: 'SQL', url: 'api/sql', sort: 'id,desc', crudMethod: { ...crudSql }})
const defaultForm = { id: null, name: null, dbId: null, sqlText: null, rule: null, createTime: null, remark: null }
export default {
  name: 'Sql',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['user_status', 'alert_code'],
  data() {
    return {
      permission: {
        add: ['admin', 'sql:add'],
        edit: ['admin', 'sql:edit'],
        del: ['admin', 'sql:del']
      },
      rules: {
        name: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        sqlText: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: '监控项' },
        { key: 'sqlText', display_name: '命令' }
      ],
      query: {},
      databases: []
    }
  },
  created() {
    crudDatabase.getDatabases().then(res => {
      this.databases = res.content
    })
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      const query = this.query
      this.crud.params = {}
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      if (query.dbId) {
        this.crud.params['dbId'] = query.dbId
      }
      return true
    },
    exeCMD(id) {
      this.loading = true
      crudSql.exec({ 'ids': id }).then((res) => {
        this.loading = false
        debugger
        this.crud.notify(res || '执行失败', res ? 'success' : 'error')
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
</style>
