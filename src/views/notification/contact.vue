<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-select v-model="query.type" clearable placeholder="Condition" class="filter-item" style="width: 130px">
          <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <el-input v-model="query.value" clearable placeholder="Search" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="Name" prop="userName">
            <el-input v-model="form.userName" controls-position="right" style="width: 224px;" />
          </el-form-item>
          <el-form-item label="Media Type" prop="mediaType">
            <el-select v-model="form.mediaType" filterable placeholder="Select media type">
              <el-option
                v-for="item in dict.media_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Media Address" prop="mediaAddress">
            <el-input v-model="form.mediaAddress" controls-position="right" style="width: 224px;" />
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
        <el-table-column v-if="columns.visible('userName')" prop="userName" label="Name" />
        <el-table-column v-if="columns.visible('mediaType')" prop="mediaType" label="Media Type">
          <template slot-scope="scope">
            {{ dict.label.media_type[scope.row.mediaType] }}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('mediaAddress')" prop="mediaAddress" label="Media Address" />
        <el-table-column v-permission="['admin','notificationContact:edit','notificationContact:del']" label="操作" width="150px" align="center">
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
import crudNotificationContact from '@/api/notification/notificationContact'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: 'Contact', url: 'notif-api/notificationContact', sort: 'id,desc', crudMethod: { ...crudNotificationContact }})
const defaultForm = { userName: null, mediaType: null, mediaAddress: null }
export default {
  name: 'NotificationContact',
  components: { pagination, rrOperation, crudOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['media_type'],
  data() {
    return {
      permission: {
        add: ['admin', 'notificationContact:add'],
        edit: ['admin', 'notificationContact:edit'],
        del: ['admin', 'notificationContact:del']
      },
      rules: {
      },
      queryTypeOptions: [
        { key: 'userName', display_name: 'Name' },
        { key: 'mediaAddress', display_name: 'Media Address' }
      ]
    }
  },
  beforeUpdate() {
    // Change the data type of systemType and severity to String so the el-select would correctly display selected label
    const t = this.form.mediaType
    if (t !== null) this.form.mediaType = String(t)
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
