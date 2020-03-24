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
          <el-form-item label="id" v-if="crud.status.edit" >
            <el-input v-model="form.id" style="width: 370px;" disabled/>
          </el-form-item>
          <el-form-item label="Rule Name">
            <el-input v-model="form.ruleName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="rule">
            <el-input v-model="form.rule" style="width: 370px;" type="textarea" :rows="3"/>
          </el-form-item>
       
          <el-form-item label="状态" style="width: 370px;">
            <el-select v-model="form.status" filterable placeholder="请选择" style="width: 370px;" >
              <el-option
                v-for="item in dict.etl_status"
                :key="item.id"
                :label="item.label"
                :value="Number(item.value)"  />
            </el-select>
          </el-form-item>
           <el-form-item label="规则" >
            <el-select v-model="form.type" filterable placeholder="请选择" style="width: 370px;">
              <el-option
                v-for="item in dict.etl_type"
                :key="item.id"
                :label="item.label"
                :value="Number(item.value)" />
            </el-select>
          </el-form-item>
       
          <el-form-item label="Table Name">
            <el-input v-model="form.tableName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="file Pattern">
            <el-input v-model="form.fileName" style="width: 370px;" />
          </el-form-item>
           <el-form-item label="数据库">
             <el-select v-model="form.dbId" placeholder="请选择" style="width: 370px">
               <el-option v-for="item in databases" :key="item.id" :value="item.id" :label="item.name"  />
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
        <el-table-column v-if="columns.visible('id')" prop="id" label="id" width="100"/>
        <el-table-column v-if="columns.visible('ruleName')" prop="ruleName" label="ruleName" :show-overflow-tooltip="true"/>
        <el-table-column v-if="columns.visible('rule')" prop="rule" label="rule" :show-overflow-tooltip="true"/>
        
        <el-table-column v-if="columns.visible('status')" prop="status" label="状态">
          <template slot-scope="scope">
            {{ dict.label.etl_status[scope.row.status] }}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('type')" prop="type" label="规则" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ dict.label.etl_type[scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('tableName')" prop="tableName" label="Table Name" :show-overflow-tooltip="true"/>
        <el-table-column v-if="columns.visible('fileName')" prop="fileName" label="File Pattern" :show-overflow-tooltip="true" />
         <el-table-column v-if="columns.visible('dbId')" prop="dbId" label="数据裤" :show-overflow-tooltip="true">
            <template slot-scope="scope" >
              <template v-for="item in databases">
                  <span v-if="item.id == scope.row.dbId" :key="item.id">{{ item.name }}</span>
              </template>
          </template>
         </el-table-column>
        <el-table-column v-permission="['admin','etlRule:edit','etlRule:del']" label="操作" width="150px" align="center">
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
import crudEtlRule from '@/api/etlRule'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: 'ETL规则', url: 'api/etlRule', sort: 'id,desc', crudMethod: { ...crudEtlRule }})
const defaultForm = { id: null, ruleName: null, rule: null, status: null, type: null, tableName: null }
export default {
  name: 'EtlRule',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['etl_status', 'etl_type'],
  data() {
    return {
      permission: {
        add: ['admin', 'etlRule:add'],
        edit: ['admin', 'etlRule:edit'],
        del: ['admin', 'etlRule:del']
      },
      rules: {
      },
      queryTypeOptions: [
        { key: 'ruleName', display_name: 'ruleName' },
        { key: 'tableName', display_name: 'tableName' }
      ],
      databases:[]
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
  },
   created(){
       crudDatabase.getDatabases().then(res => {
        this.databases = res.content
      })
  }
}
</script>

<style scoped>

</style>
