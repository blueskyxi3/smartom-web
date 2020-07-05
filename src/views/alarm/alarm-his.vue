<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div>
        <!-- 搜索 -->
        <el-select
          v-model="query.type"
          clearable
          placeholder="Condition"
          class="filter-item"
          style="width: 200px"
        >
          <el-option
            v-for="item in queryTypeOptions"
            :key="item.key"
            :label="item.display_name"
            :value="item.key"
          />
        </el-select>
        <el-input
          v-model="query.value"
          clearable
          placeholder="Search"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="$_search"
        />

        <span>
          <el-button
            class="filter-item"
            size="mini"
            type="success"
            icon="el-icon-search"
            @click="$_search"
          >Search</el-button>
          <el-button
            class="filter-item"
            size="mini"
            type="warning"
            icon="el-icon-refresh-left"
            @click="$_reset"
          >Reset</el-button>
        </span>
      </div>

      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button
            class="filter-item"
            size="mini"
            style="width:80px"
            :style="{ color: color[0],borderColor:color[0], backgroundColor: backGroundColor[0] }"
            @click="$_switch(0)"
          >
            Critical
          </el-button>
          <el-button
            class="filter-item"
            size="mini"
            type="success"
            style="width:80px"
            :style="{ color: color[1],borderColor:color[1], backgroundColor: backGroundColor[1] }"
            @click="$_switch(1)"
          >
            Error
          </el-button>
          <el-button
            class="filter-item"
            type="danger"
            size="mini"
            style="width:80px"
            :style="{ color: color[2],borderColor:color[2], backgroundColor: backGroundColor[2] }"
            @click="$_switch(2)"
          >
            Alert
          </el-button>
          <el-button
            class="filter-item"
            size="mini"
            style="width:80px"
            :style="{ color: color[3],borderColor:color[3], backgroundColor: backGroundColor[3] }"
            @click="$_switch(3)"
          >
            Warning</el-button>
          <el-button
            class="filter-item"
            size="mini"
            style="width:80px"
            :style="{ color: color[4],borderColor:color[4], backgroundColor: backGroundColor[4] }"
            @click="$_switch(4)"
          >
            Info</el-button>
        </span>

        <el-button-group class="crud-opts-right">
          <el-button
            size="mini"
            icon="el-icon-search"
            @click="$_search()"
          />
          <el-button
            size="mini"
            :icon="iconstr"
            @click="$_pause_play()"
          />
          <el-popover
            placement="bottom-end"
            width="150"
            trigger="click"
          >
            <el-button
              slot="reference"
              size="mini"
              icon="el-icon-s-grid"
            >
              <i
                class="fa fa-caret-down"
                aria-hidden="true"
              />
            </el-button>
            xxxxxxx
          </el-popover>
        </el-button-group>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="alarm_subject"
          label="Alarm Description"
          width="180"
        />
        <el-table-column
          prop="system_type_desc"
          label="System Type"
          width="180"
        />
        <el-table-column
          prop="alarm_code"
          label="Alarm Code"
          width="180"
        />
        <el-table-column
          prop="severity"
          label="Severity"
          width="180"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.severity|transfer }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_time"
          label="Created Time"
          width="180"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.created_time|parseTime }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="created_by"
          label="Created By"
        />

        <el-table-column
          prop="updated_time"
          label="Updated Time"
          width="180"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.updated_time|parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="updated_by"
          label="Updated By"
        />
      </el-table>
      <el-pagination
        :page-size.sync="page.size"
        :total="page.total"
        :current-page.sync="page.page"
        style="margin-top: 8px;"
        layout="total, prev, pager, next, sizes"
        @size-change="$_sizeChange($event)"
        @current-change="$_pageChange"
      />
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils/index'
import { queryAlarmHis } from '@/api/alarm/alarmRecord'
const MainColor = [
  'red', // critical
  '#f56308e9', // error
  '#f5aa08e9', // alert
  '#f5d908f9', // waringing
  '#37a019f0'// info
]

export default {
  name: 'AlarmHis',
  filters: {
    parseTime(value) {
      return parseTime(value)
    },
    transfer(value) {
      if (value === 0) return 'critical'
      if (value === 1) return 'error'
      if (value === 2) return 'alert'
      if (value === 3) return 'warning'
      if (value === 4) return 'info'
      return 'exeption data'
    }
  },
  data() {
    return {
      page: { size: 10, total: 0, page: 1 },
      serverity: [
        false,
        false,
        false,
        false,
        false
      ],
      tableData: [],
      query: {},
      color: [
        MainColor[0],
        MainColor[1],
        MainColor[2],
        MainColor[3],
        MainColor[4]
      ],
      backGroundColor: [
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF'
      ],
      queryTypeOptions: [
        { key: 'systemType', display_name: 'System Type' },
        { key: 'alarmCode', display_name: 'Alarm Code' },
        { key: 'alarmSubject', display_name: 'Alarm Description' }
      ],
      iconstr: 'el-icon-video-pause'
    }
  },
  created() {

  },

  methods: {
    tableRowClassName({ row, rowIndex }) {
      // console.info("**************")
      // console.log("------------------>>>>>" + JSON.stringify(row))
      if (row.severity === 0) {
        return 'critical-row'
      } else if (row.severity === 1) {
        return 'error-row'
      } else if (row.severity === 2) {
        return 'alert-row'
      } else if (row.severity === 3) {
        return 'warning-row'
      } else if (row.severity === 4) {
        return 'info-row'
      }
      return ''
    },
    $_pageChange() {
      console.log(JSON.stringify(this.page))
      this.$_search()
    },
    $_sizeChange(e) {
      console.log(e)
      console.log(JSON.stringify(this.page))
      this.$_search()
    },
    $_search() {
      // const msg = this.$_getParams()
      // const params = { severity: 1, alarmCode: '100' }
      const params = this.$_getParams()
      Object.assign(params, this.page)
      console.log(JSON.stringify(params))
      queryAlarmHis(params).then((res) => {
        console.log(JSON.stringify(res))
        this.tableData = res.content
        this.page.total = res.totalElements
      }).catch((e) => {
        console.log(e)
        this.$message.error('查询报错!')
      })
    },
    $_switch(i) {
      if (this.serverity[i]) {
        this.backGroundColor[i] = '#FFFFFF'
        this.color[i] = MainColor[i]
        this.serverity[i] = false
      } else {
        this.backGroundColor[i] = MainColor[i]
        this.color[i] = '#FFFFFF'
        this.serverity[i] = true
      }
      // const msg = this.$_getParams()
      this.$_search()
      this.$forceUpdate()
    },
    $_pause_play() {
      if (this.iconstr === 'el-icon-video-play') {
        this.iconstr = 'el-icon-video-pause'

        this.$notify({
          title: '启用成功!',
          type: 'success',
          duration: 3000
        })
      } else {
        this.iconstr = 'el-icon-video-play'

        this.$notify({
          title: '暂停成功!',
          type: 'success',
          duration: 3000
        })
      }
    },

    $_reset() {
      // this.websock.close(1000, 'client close session!')
      this.query.type = ''
      this.query.value = ''
    },
    $_getParams() {
      // serverity
      let str = '-1'
      this.serverity.forEach((s, i) => {
        if (s) {
          str = str + ',' + i
        }
      })

      let msg = {}
      if (str !== '-1') {
        msg = { severity: str }
      }

      // alarmCode
      if (this.query.type && this.query.value) {
        msg[this.query.type] = this.query.value
      }

      return msg
    }
  }
}
</script>
<style>
</style>
