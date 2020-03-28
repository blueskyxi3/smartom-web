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
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="580px"
      >
        <el-form
          ref="form"
          :inline="true"
          :model="form"
          :rules="rules"
          size="small"
          label-width="80px"
        >
          <el-form-item
            v-if="crud.status.edit"
            label="id"
          >
            <el-input
              v-model="form.id"
              style="width: 370px;"
              disabled
            />
          </el-form-item>
          <el-form-item
            label="类型"
            prop="type"
          >
            <el-radio-group
              v-model="form.type"
              size="mini"
              style="width: 178px"
            >
              <el-radio-button label="0">分类</el-radio-button>
              <el-radio-button label="1">报表</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="name"
            prop="name"
          >
            <el-input
              v-model="form.name"
              style="width: 370px;"
            />
          </el-form-item>
          <el-form-item
            v-if="form.type == 1"
            label="content"
            prop="content"
          >
            <el-input
              v-model="form.content"
              :rows="3"
              type="textarea"
              style="width: 370px;"
            />
          </el-form-item>
          <el-form-item
            v-if="form.type == 1"
            label="数据库"
            prop="dbId"
          >
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
          <!-- <el-form-item v-if="crud.status.edit" label="status" >
             <el-select v-model="form.status" placeholder="请选择" style="width: 370px" disabled>
               <el-option :value="1" label="有效"  />
               <el-option :value="0" label="无效"  />
             </el-select>
          </el-form-item>-->
          <el-form-item
            v-if="form.type == 1"
            label="消息模板"
          >
            <el-select
              v-model="form.msgId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteMethod"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="上级类目"
            prop="pid"
          >
            <treeselect
              v-model="form.pid"
              :options="menus"
              style="width: 370px;"
              placeholder="选择上级类目"
              prop="pid"
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
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        row-key="id"
        @select="crud.selectChange"
        @select-all="crud.selectAllChange"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          v-if="columns.visible('name')"
          label="Name"
          prop="name"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.type ==0 ">{{ scope.row.name }}</span>
            <el-button
              v-else
              size="mini"
              style="margin-right: 2px"
              type="text"
            >
              <router-link :to="'/report/display/' + scope.row.id">{{ scope.row.name }}</router-link>
            </el-button>
          </template>
        </el-table-column>
        <!-- <el-table-column v-if="columns.visible('pid')" prop="pid" label="pid" /> -->
        <el-table-column
          v-if="columns.visible('content')"
          prop="content"
          label="content"
          :show-overflow-tooltip="true"
        />
        <!--  <el-table-column v-if="columns.visible('status')" prop="status" label="status">
          <template slot-scope="scope">
            {{ dict.label.status[scope.row.status] }}
          </template>
        </el-table-column>-->
        <el-table-column
          v-if="columns.visible('dbId')"
          prop="dbId"
          label="数据裤"
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
          v-if="columns.visible('msgId')"
          prop="msgId"
          label="消息模板ID"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            {{ scope.row.msgId }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.visible('createdBy')"
          prop="createdBy"
          label="createdBy"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          v-if="columns.visible('createTime')"
          prop="createTime"
          label="createTime"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin','report:edit','report:del']"
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
import crudMsgTemplate from '@/api/msgTemplate'
import crudDatabase from '@/api/mnt/database'
import crudReport from '@/api/report/report'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

// crud交由presenter持有
const defaultCrud = CRUD({
  title: '报表',
  url: 'api/report',
  sort: 'id,desc',
  crudMethod: { ...crudReport }
})
const defaultForm = {
  id: null,
  name: null,
  pid: null,
  type: null,
  level: null,
  content: null,
  status: null,
  msgId: null,
  createdBy: null,
  createTime: null
}
export default {
  name: 'Report',
  components: {
    Treeselect,
    pagination,
    crudOperation,
    rrOperation,
    udOperation
  },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['status'],
  data() {
    return {
      options: [],
      databases: [],
      msgTemplate: [],
      menus: [],
      permission: {
        add: ['admin', 'report:add'],
        edit: ['admin', 'report:edit'],
        del: ['admin', 'report:del']
      },
      rules: {
        name: [{ required: true, message: '不能为空', trigger: 'blur' }],
        dbId: [{ required: true, message: '不能为空', trigger: 'blur' }],
        content: [
          { required: true, message: '请填入SQL内容', trigger: 'blur' }
        ],
        pid: [{ required: true, message: '请选择报表分类', trigger: 'blur' }],
        type: [{ required: true, message: '选择报表类型', trigger: 'blur' }]
      },
      queryTypeOptions: [
        { key: 'name', display_name: 'name' },
        { key: 'pid', display_name: 'pid' },
        { key: 'content', display_name: 'content' },
        { key: 'createdBy', display_name: 'createdBy' }
      ]
    }
  },
  created() {
    crudDatabase.getDatabases().then(res => {
      this.databases = res.content
    })
    crudMsgTemplate.query().then(res => {
      const res1 = res.content
      this.msgTemplate = res1.map(item => {
        return { value: `${item.id}`, label: `${item.name}` }
      })
      this.options = this.msgTemplate
    })
  },

  methods: {
    remoteMethod(query) {
      if (query !== '') {
        setTimeout(() => {
          this.options = this.msgTemplate.filter(item => {
            return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1
          })
        }, 200)
      } else {
        this.options = []
      }
    },
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      const query = this.query
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      return true
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      crudReport.getMenusTree().then(res => {
        this.menus = []
        const menu = { id: 0, label: '顶级类目', children: [] }
        menu.children = res
        this.menus.push(menu)
      })
    }
  }
}
</script>

<style scoped>
</style>
