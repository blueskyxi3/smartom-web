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
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="600px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="编号" v-if="crud.status.edit" >
            <el-input v-model="form.id" style="width: 370px;" disabled/>
          </el-form-item>
          <el-form-item label="服务器">
             <el-select v-model.number="form.serverId" placeholder="请选择" style="width: 370px">
               <el-option v-for="item in servers" :key="item.id" :label="item.name" :value="item.id" />
             </el-select>
          </el-form-item>
          <el-form-item label="进程名称" prop="processName">
            <el-input v-model="form.processName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="系统名称" prop="serviceName">
            <el-input v-model="form.serviceName" style="width: 370px;" />
          </el-form-item>
           <el-form-item label="命令" prop="command">
            <el-input :rows="3" v-model="form.command" type="textarea" style="width: 370px;" />
          </el-form-item>
           <el-form-item label="关键字" prop="keyword">
            <el-input v-model="form.keyword" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="告警编码">
            <el-select v-model="form.alertCode" filterable placeholder="请选择" style="width: 370px;" clearable>
              <el-option
                v-for="item in dict.alert_code"
                :key="item.id"
                :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input :rows="3" v-model="form.remark" type="textarea" style="width: 370px;" />
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
        <el-table-column v-if="columns.visible('id')" prop="id" label="编码" />
        <el-table-column v-if="columns.visible('serverId')" prop="serverId" label="服务器" :show-overflow-tooltip="true">
            <template slot-scope="scope" >
              <template v-for="item in servers">
                  <span v-if="item.id == scope.row.serverId" :key="item.id">{{ item.name }}</span>
              </template>
          </template>
         </el-table-column>

        <el-table-column v-if="columns.visible('processName')" prop="processName" label="进程名称"  :show-overflow-tooltip="true"/>
        <el-table-column v-if="columns.visible('serviceName')" prop="serviceName" label="系统名称" :show-overflow-tooltip="true"/>
         <el-table-column v-if="columns.visible('command')" prop="command" label="命令" :show-overflow-tooltip="true" width="320"/>
        <el-table-column v-if="columns.visible('keyword')" prop="keyword" label="关键字" :show-overflow-tooltip="true"/>
        <el-table-column v-if="columns.visible('alertCode')" prop="alertCode" label="告警编码">
          <template slot-scope="scope">
            {{ dict.label.alert_code[scope.row.alertCode] }}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('createDate')" prop="createDate" label="创建时间" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createDate) }}</span>
          </template>
        </el-table-column>
      
        <el-table-column v-if="columns.visible('updateDate')" prop="updateDate" label="执行" width="100">
          <template slot-scope="scope">
              <el-button type="primary" v-permission="permission.edit"  icon="el-icon-caret-right"  @click="exeCMD(scope.row.id)" circle></el-button>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','process:edit','process:del']" label="操作" width="150px" align="center">
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
import crudServer from '@/api/mnt/serverDeploy'
import crudProcess from '@/api/process'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: 'Process', url: 'api/process', sort: 'id,desc', crudMethod: { ...crudProcess }})
const defaultForm = { id: null, serverId: null, processName: null, command: null, serviceName: null, createDate: null, updateDate: null, createUserId: null, updateUserId: null, remark: null }
export default {
  name: 'Process',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['alert_code'],
  data() {
    return {
      permission: {
        add: ['admin', 'process:add'],
        edit: ['admin', 'process:edit'],
        del: ['admin', 'process:del']
      },
      rules: {
        processName: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        command: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        serviceName: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'serverId', display_name: 'serverId' },
        { key: 'processName', display_name: 'processName' },
        { key: 'command', display_name: 'command' },
        { key: 'serviceName', display_name: 'serviceName' }
      ],
      servers:[]
    }
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      this.crud.params = {}
      const query = this.query
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      return true
    },
     exeCMD(id) {
      this.loading = true
      crudProcess.exec({'id':id}).then((res) => {
        this.loading = false
        debugger
        this.crud.notify(res ? res : '执行失败', res ? 'success' : 'error')
      }).catch(() => {
        this.loading = false
      })
    }
  },
  created(){
       crudServer.getServers().then(res => {
        this.servers = res.content
      })
  }
}
</script>

<style scoped>

</style>
