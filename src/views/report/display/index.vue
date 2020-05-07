<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">

      <div>
        <div style="margin-left:50px">

          <div
            v-for="(cond,index) in conds"
            :key="index"
          >
            <span v-if="cond.ptype==0">{{ cond.pvalue }}:</span>
            <el-input
              v-if="cond.ptype==0"
              v-model="qry[cond.pvalue]"
              placeholder="请输入内容"
              style="width: 200px;margin-right:30px"
            />
          </div>

          <div
            v-for="(cond,index) in conds"
            :key="index"
          >
            <span v-if="cond.ptype==1">{{ cond.pvalue }}:</span>
            <el-date-picker
              v-if="cond.ptype==1"
              v-model="qry[cond.pvalue]"
              default-time="00:00:00"
              type="datetime"
              style="width: 200px;;margin-right:30px"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="日期"
            />
          </div>
        </div>
        <div
          v-if="conds.length>0"
          style="float:right;margin-top:8px;margin-right:150px"
        >
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
        </div>
      </div>

      <div
        v-if="data.length>0"
        class="crud-opts"
      >
        <span class="crud-opts-left">
          <el-button
            class="filter-item"
            size="mini"
            type="warning"
            icon="el-icon-download"
            @click="$_doExport"
          >导出</el-button>
          <el-button
            class="filter-item"
            size="mini"
            type="success"
            icon="el-icon-s-promotion"
            @click="$_doSend"
          >发送</el-button>
        </span>
      </div>
      <!--表格渲染-->
      <el-table
        v-if="data.length>0"
        ref="table"
        :data="data"
        size="small"
        style="width: 100%;"
        @selection-change="$_selectionChangeHandler"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          v-for="(item,index) in columns"
          :key="index"
          :prop="item"
          :label="item"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          v-if="isHaveCreateTime"
          prop="create_time"
          label="create_time"
          width="180"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.create_time|parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="isHaveUpdateTime"
          prop="create_time"
          label="create_time"
          width="180"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.update_time|parseTime }}</span>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <!--
      <el-pagination
        :page-size.sync="page.size"
        :total="page.total"
        :current-page.sync="page.page"
        style="margin-top: 8px;"
        layout="total, prev, pager, next, sizes"
        @size-change="$_sizeChangeHandler($event)"
        @current-change="$_pageChangeHandler"
      /> -->
    </div>
  </div>
</template>

<script>
import crudReport from '@/api/report/report'
import { parseTime, downloadFile } from '@/utils/index'

export default {
  name: 'Display',
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
      reportId: -1,
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
      databases: [],
      data: [],
      qry: {},
      params: {},
      tableHeader: [],
      conds: []
    }
  },
  computed: {
    columns: function() {
      const arr = this.tableHeader.filter(function(x) {
        return x !== 'create_time' && x !== 'update_time'
      })
      return arr
    },
    isHaveCreateTime: function() {
      const flag = this.tableHeader.indexOf('create_time') > 0
      return flag
    },
    isHaveUpdateTime: function() {
      const flag = this.tableHeader.indexOf('update_time') > 0
      return flag
    }
  },
  created() {
    this.reportId = this.$route.params.id
    // this.reportId = this.$route.query.id
    console.log(this.$route.params)
    this.conds = JSON.parse(this.$route.params.conditions)
    this.conds.forEach(e => {
      console.log(JSON.stringify(e))
      if (e.ptype === 1) this.$set(this.qry, e.pvalue, '')
      else { this.$set(this.qry, e.pvalue, e.dvalue) }
      // Object.assign(this.qry, { e.pvalue: e.dvalue })
    })
    // console.log(conds)
    if (this.conds <= 0) this.$_toQuery()
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
      // this.$_toQuery()
    },
    $_toQuery() {
      console.log('_toQuery')
      this.page.page = 1
      this.$_refresh()
    },
    $_refresh() {
      // let _data = this.$_getQueryParams();
      // console.log("refresh--->" + JSON.stringify(_data));
      // console.log(  qs.stringify(_data, { indices: false }))
      debugger
      const qry = this.qry
      crudReport.queryReport(this.reportId, qry).then(res => {
        console.log(res)
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
    $_doExport() {
      crudReport.exportReport(this.reportId).then(result => {
        downloadFile(result, '数据', 'xlsx')
      }).catch((res) => {
        console.log(res)
      })
    },
    $_doSend() {
      crudReport.sendReport(this.reportId).then(result => {
        console.log(result)
        this.$notify({ title: '执行成功', type: 'success', duration: 2500 })
      }).catch((res) => {
        console.log(res)
      })
    },
    $_selectionChangeHandler(e) {
      console.log('selectionChangeHandler--' + e)
    }
  }
}
</script>

<style scoped>
</style>
