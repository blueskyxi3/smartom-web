<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div>
        <!-- 搜索 -->
        <el-input
          v-model="query.value"
          clearable
          placeholder="Search"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="$_search"
        />
        <el-select
          v-model="query.type"
          clearable
          placeholder="Condition"
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
            plain
            type="info"
            icon="el-icon-search"
            @click="$_reset()"
          />
          <el-button
            size="mini"
            icon="el-icon-refresh"
            @click="$_reset()"
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
            xxxxxxxxxxxxx
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
          prop="alarmSubject"
          label="Alarm Description"
          width="180"
        />
        <el-table-column
          prop="systemTypeDesc"
          label="System Type"
          width="180"
        />
        <el-table-column
          prop="alarmCode"
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
          prop="alarmTime"
          label="Alarm Time"
          width="180"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.alarmTime|parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="duration"
          label="Duration"
          width="80"
        />
        <el-table-column
          prop="count"
          label="Count"
          width="80"
        />
        <el-table-column
          prop="createBy"
          label="Create By"
        />
        <el-table-column
          label="Actions"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation :data="scope.row" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils/index'
import udOperation from './panel/UD.operation'
const MainColor = [
  'red', // critical
  '#f56308e9', // error
  '#f5aa08e9', // alert
  '#f5d908f9', // waringing
  '#37a019f0'// info
]

export default {
  name: 'AlarmPanel',
  components: { udOperation },

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
      token: 'aaa',
      topic: 'topic1',
      websock: null,
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
        { key: 'severity', display_name: 'severity' },
        { key: 'systemType', display_name: 'systemType' }
      ]
    }
  },
  created() {
    this.initWebSocket()
  },
  destroyed() {
    this.websock.close() // 离开路由之后断开websocket连接
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
    $_search() {

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
      let str = '-1'
      this.serverity.forEach((s, i) => {
        // console.log('===index===' + i)
        if (s) {
          str = str + ',' + i
        }
      })
      if (str === '-1') str = ''
      const msg = {
        token: this.token,
        event: this.topic,
        body: {
          systemType: '',
          severity: str
        }
      }
      this.webSocketSend(msg)
      this.$forceUpdate()
    },
    $_reset() {
      this.websock.close(1000, 'client close session!')
    },
    initWebSocket() {
      // const wsUri = process.env.VUE_APP_WS_API + '/webSocket/deploy'
      const wsUri = 'ws://127.0.0.1:12345/ws'
      this.websock = new WebSocket(wsUri)
      this.websock.onopen = this.webSocketOnOpen
      this.websock.onerror = this.webSocketOnError
      this.websock.onmessage = this.webSocketOnMessage
      this.websock.onclose = this.webSocketOnClose
    },
    webSocketOnOpen(e) {
      console.log('websocket client open--->' + e)
      this.websock.send('{"token": "' + this.token + '", "event": "' + this.topic + '"}')
    },
    webSocketOnClose(e) {
      console.log('websocket client close--->' + e)
      // this.websock.send("{\"token\": \"" + this.token + "\", \"event\": \"" + this.topic + "\"}")
    },
    webSocketOnError(e) {
      this.$notify({
        title: 'WebSocket连接发生错误',
        type: 'error',
        duration: 0
      })
    },
    webSocketOnMessage(e) {
      // this.tableData = e.data
      const data = JSON.parse(e.data)
      console.log(data)
      this.tableData = data
    },
    webSocketSend(agentData) {
      console.log(JSON.stringify(agentData))
      this.websock.send(JSON.stringify(agentData))
    }
  }
}
</script>
<style>
.crud-opts {
  padding: 6px 0;
  display: -webkit-flex;
  display: flex;
  align-items: center;
}
.crud-opts .crud-opts-right {
  margin-left: auto;
}
.el-table .critical-row {
  background: red;
}
.el-table .error-row {
  background: #f56308e9;
}
.el-table .alert-row {
  color: #f5aa08e9;
}
.el-table .warning-row {
  color: #f5d908f9;
}
.el-table .info-row {
  color: #37a019f0;
}
</style>
