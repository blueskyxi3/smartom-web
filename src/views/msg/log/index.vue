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
        <el-date-picker
          v-model="query.createTime"
          :default-time="['00:00:00','23:59:59']"
          type="daterange"
          range-separator=":"
          size="small"
          class="date-item"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="createTimeStart"
          end-placeholder="createTimeEnd"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="id" prop="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="msgTemplateId">
            <el-input v-model="form.msgTemplateId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="createTime">
            <el-date-picker v-model="form.createTime" type="datetime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="title">
            <el-input v-model="form.title" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="address">
            <el-input v-model="form.address" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="content">
            <el-input :rows="3" v-model="form.content" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="status">
            <el-input v-model="form.status" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="path">
            <el-input v-model="form.path" style="width: 370px;" />
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
        <el-table-column v-if="columns.visible('msgTemplateId')" prop="msgTemplateId" label="msgTemplateId" :show-overflow-tooltip="true"/>
        <el-table-column v-if="columns.visible('title')" prop="title" label="title" :show-overflow-tooltip="true"/>
        <el-table-column v-if="columns.visible('address')" prop="address" label="address" :show-overflow-tooltip="true"/>
        <el-table-column v-if="columns.visible('content')" prop="content" label="content" :show-overflow-tooltip="true"/>
        
        <el-table-column v-if="columns.visible('path')" prop="path" label="path" :show-overflow-tooltip="true"/>
        <el-table-column v-if="columns.visible('status')" prop="status" label="status" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.status|transferStatus}}</span>
          </template>
        </el-table-column>
         <el-table-column v-if="columns.visible('createTime')" prop="createTime" label="createTime" :show-overflow-tooltip="true">   
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','msgLog:edit','msgLog:del']" label="操作" width="150px" align="center">
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
import crudMsgLog from '@/api/msgLog'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: '消息日志', url: 'api/msgLog', sort: 'id,desc', crudMethod: { ...crudMsgLog }})
const defaultForm = { id: null, msgTemplateId: null, createTime: null, title: null, address: null, content: null, status: null, path: null }
export default {
  name: 'MsgLog',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  data() {
    return {
      permission: {
        add: ['admin', 'msgLog:add'],
        edit: ['admin', 'msgLog:edit'],
        del: ['admin', 'msgLog:del']
      },
      rules: {
        id: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'msgTemplateId', display_name: 'msgTemplateId' },
        { key: 'title', display_name: 'title' },
        { key: 'content', display_name: 'content' },
        { key: 'path', display_name: 'path' }
      ]
    }
  },
   filters: {
    parseTime(value) {
      return parseTime(value);
    },
    transferStatus(value) {
      if (value == 0) return "初始化";
      if (value == 1) return "成功";
      if (value == 2) return "失败";
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
