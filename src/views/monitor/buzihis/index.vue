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
          <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="monitorType">
            <el-input v-model="form.monitorType" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="monitorText">
            <el-input v-model="form.monitorText" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="monitorId">
            <el-input v-model="form.monitorId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="isAlarm">
            <el-input v-model="form.isAlarm" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="createTime">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="status">
            <el-input v-model="form.status" style="width: 370px;" />
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
        <el-table-column v-if="columns.visible('id')" prop="id" label="id" />
        <el-table-column v-if="columns.visible('monitorType')" prop="monitorType" label="monitorType" />
        <el-table-column v-if="columns.visible('monitorText')" prop="monitorText" label="monitorText" />
        <el-table-column v-if="columns.visible('monitorId')" prop="monitorId" label="monitorId" />
        <el-table-column v-if="columns.visible('isAlarm')" prop="isAlarm" label="isAlarm" />
        <el-table-column v-if="columns.visible('createTime')" prop="createTime" label="createTime">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('status')" prop="status" label="status" />
        <el-table-column v-permission="['admin','monitorResultHis:edit','monitorResultHis:del']" label="操作" width="150px" align="center">
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
import crudMonitorResultHis from '@/api/monitorResultHis'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: '业务历史', url: 'api/monitorResultHis', sort: 'id,desc', crudMethod: { ...crudMonitorResultHis }})
const defaultForm = { id: null, monitorType: null, monitorText: null, monitorId: null, isAlarm: null, createTime: null, status: null, xx: null }
export default {
  name: 'MonitorResultHis',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  data() {
    return {
      permission: {
        add: ['admin', 'monitorResultHis:add'],
        edit: ['admin', 'monitorResultHis:edit'],
        del: ['admin', 'monitorResultHis:del']
      },
      rules: {
      },
      queryTypeOptions: [
        { key: 'monitorId', display_name: 'monitorId' }
      ]
    }
  },
  created() {
    const monitorId = this.$route.params.monitorId
    // alert(monitorId)
    this.query = { type: 'monitorId', value: monitorId }
    // this.crud.toQuery()
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
    //  if(this.monitorId)this.query = {type:'monitorId',value:this.monitorId}
      this.crud.params = {}
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
