<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div>
        <!-- 搜索 -->
        <el-input
          v-model="query.value"
          clearable
          placeholder="输入搜索内容"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="$_toQuery"
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
        <el-date-picker
          v-model="query.createTime"
          :default-time="['00:00:00','23:59:59']"
          type="daterange"
          range-separator=":"
          size="small"
          class="date-item"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <span>
          <el-button
            class="filter-item"
            size="mini"
            type="success"
            icon="el-icon-search"
            @click="$_toQuery"
          >搜索</el-button>
          <el-button
            class="filter-item"
            size="mini"
            type="warning"
            icon="el-icon-refresh-left"
            @click="$_resetQuery()"
          >重置</el-button>
        </span>
      </div>

      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button
            class="filter-item"
            size="mini"
            type="warning"
            icon="el-icon-download"
            @click="$_doExport"
          >导出</el-button>
        </span>
      </div>
      <!--表格渲染-->
      <el-table
        ref="table"
        :data="data"
        size="small"
        style="width: 100%;"
        @selection-change="$_selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          v-for="(item,index) in columns"
          :key="index"
          :prop="item"
          :label="item"
          :show-overflow-tooltip="true"
        />
        <el-table-column prop="create_time" label="创建时间" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time|parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.status|transferStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin','etlRule:edit','etlRule:del']"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation :data="scope.row" :permission="permission" />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <el-pagination
        :page-size.sync="page.size"
        :total="page.total"
        :current-page.sync="page.page"
        style="margin-top: 8px;"
        layout="total, prev, pager, next, sizes"
        @size-change="$_sizeChangeHandler($event)"
        @current-change="$_pageChangeHandler"
      />
    </div>
  </div>
</template>

<script>
import crudResult from '@/api/etlResult'
// import crudEtlRule from '@/api/etlRule'
import udOperation from './ud'
// import { parseTime, downloadFile } from '@/utils/index'
import { parseTime } from '@/utils/index'

export default {
  name: 'EtlResult',
  components: { udOperation },

  dicts: ['etl_status', 'etl_type'],
  filters: {
    parseTime(value) {
      return parseTime(value)
    },
    transferStatus(value) {
      if (value === 0) return '未开始'
      if (value === 1) return '成功'
      if (value === 2) return '失败'
      if (value === 3) return '处理中'
      return '异常数据'
    }
  },
  data() {
    return {
      permission: {
        add: ['admin', 'etlRule:add'],
        edit: ['admin', 'etlRule:edit'],
        del: ['admin', 'etlRule:del']
      },
      page: {
        // 页码
        page: 0,
        // 每页数据条数
        size: 10,
        // 总数据条数
        total: 0
      },
      sort: ['id,desc'],
      queryTypeOptions: [{ key: 'batch_id', display_name: '文件名' }],
      databases: [],
      data: [],
      query: {},
      params: {},
      tableHeader: []
    }
  },
  computed: {
    columns: function() {
      const arr = this.tableHeader.filter(function(x) {
        return x !== 'status' && x !== 'create_time'
      })
      return arr
    }
  },
  created() {
    this.$_toQuery()
  },
  methods: {
    $_sizeChangeHandler(e) {
      console.log(`size------>${e}`)
      this.page.size = e
      this.page.page = 1
      this.$_refresh()
    },
    $_pageChangeHandler(e) {
      console.log(`_pageChangeHandler${e}`)
      this.page.page = e
      this.$_refresh()
    },
    $_resetQuery(toQuery = true) {
      console.log('resetQuery' + toQuery)
      // const defaultQuery = JSON.parse(JSON.stringify(crud.defaultQuery))
      // const query = crud.query
      // Object.keys(query).forEach(key => {
      //  query[key] = defaultQuery[key]
      // })
      this.$_toQuery()
    },
    $_toQuery() {
      console.log('_toQuery')
      this.page.page = 1
      this.$_refresh()
    },
    $_refresh() {
      const _data = this.$_getQueryParams()

      console.log('refresh--->' + JSON.stringify(_data))
      // console.log(  qs.stringify(_data, { indices: false }))

      crudResult.query(_data).then(res => {
        this.data = res.content
        this.page.total = res.totalElements
        this.tableHeader = res.columns
      })
    },
    $_getQueryParams: function() {
      if (this.query.type && this.query.value) {
        this.params[this.query.type] = this.query.value
      }

      return {
        page: this.page.page - 1,
        size: this.page.size,
        sort: this.sort,
        ...this.query,
        ...this.params
      }
    },
    $_doExport() {},
    $_selectionChangeHandler(e) {
      console.log('selectionChangeHandler--' + e)
    }
  }
}
</script>

<style scoped>
</style>
