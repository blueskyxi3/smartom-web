<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
          <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="id" v-if="crud.status.edit">
            <el-input v-model="form.id" style="width: 370px;" disabled/>
          </el-form-item>
          <el-form-item label="消息类型" prop="type">
          <el-radio-group v-model="form.type" size="mini" style="width: 178px">
            <el-radio-button label="0">邮件</el-radio-button>
            <el-radio-button label="1">短信</el-radio-button>
            <el-radio-button label="2">系统</el-radio-button>
          </el-radio-group>
        </el-form-item>
          <el-form-item label="name" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="content">
            <el-input :rows="3" v-model="form.content" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="title" v-if="form.type!=1">
            <el-input v-model="form.title" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="address" >
            <el-input v-model="form.address" :rows="3"  type="textarea"  style="width: 370px;" placeholder="多个邮箱以；分隔"/>
          </el-form-item>
            <el-form-item label="状态" v-if="crud.status.edit">
             <el-select v-model.number="form.status" placeholder="请选择" style="width: 370px">
               <el-option :value=1 label="有效"  />
               <el-option :value=0 label="无效"  />
             </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="columns.visible('id')" prop="id" label="id" :show-overflow-tooltip="true"/>
        <el-table-column v-if="columns.visible('name')" prop="name" label="name" :show-overflow-tooltip="true"/>
       
        <el-table-column v-if="columns.visible('type')" prop="type" label="消息类型" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.type|transferType }}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('title')" prop="title" label="title" :show-overflow-tooltip="true"/>
         <el-table-column v-if="columns.visible('content')" prop="content" label="content"  :show-overflow-tooltip="true"/>
         <el-table-column v-if="columns.visible('address')" prop="address" label="address" :show-overflow-tooltip="true"/>
         <el-table-column v-if="columns.visible('status')" prop="status" label="状态" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.status|transferStatus }}
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','msgTemplate:edit','msgTemplate:del']" label="操作" width="150px" align="center">
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
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: '消息模板', url: 'api/msgTemplate', sort: 'id,desc', crudMethod: { ...crudMsgTemplate }})
const defaultForm = { id: null, name: null, content: null, type: null, status: null, title: null, address: null }
export default {
  name: 'MsgTemplate',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  data() {
    return {
      permission: {
        add: ['admin', 'msgTemplate:add'],
        edit: ['admin', 'msgTemplate:edit'],
        del: ['admin', 'msgTemplate:del']
      },
      rules: {
        name: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择消息类型', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'type', display_name: '消息类型' },
        { key: 'status', display_name: '状态' }
      ]
    }
  },
  filters: {
    parseTime(value) {
      return parseTime(value);
    },
    transferStatus(value) {
      if (value == 0) return "无效";
      if (value == 1) return "有效";
      return "异常数据";
    },
    transferType(value) {
      if (value == 0) return "邮件";
      if (value == 1) return "短信";
      if (value == 2) return "系统";
      return "异常数据";
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
