<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px" />
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column v-permission="['admin','notificationHistory:edit','notificationHistory:del']" label="操作" width="150px" align="center">
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
import crudNotificationHistory from '@/api/notification/notificationHistory'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: 'notification', url: 'notif-api/notificationHistory', sort: 'id,desc', crudMethod: { ...crudNotificationHistory }})
const defaultForm = { id: null, sentoutDatetime: null, source: null }
export default {
  name: 'NotificationHistory',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  data() {
    return {
      permission: {
        add: ['admin', 'notificationHistory:add'],
        edit: ['admin', 'notificationHistory:edit'],
        del: ['admin', 'notificationHistory:del']
      },
      rules: {
      }}
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
