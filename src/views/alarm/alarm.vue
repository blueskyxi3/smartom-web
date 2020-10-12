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
        <el-select
          v-if="query.type == 'systemType'"
          v-model="query.value"
          clearable
          placeholder="Search"
          style="width: 200px;"
          class="filter-item"
        >
          <el-option
            v-for="item in dict.system_type"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-else
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
            <el-input-number
              v-model="num"
              :min="1"
              :max="5000"
              label="Limit Number"
              @change="$_search"
            />
          </el-popover>
        </el-button-group>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <!-- <el-table-column
          prop="id"
          label="ID"
          width="80"
        /> -->
        <el-table-column
          prop="alarmSubject"
          label="Alarm Description"
          width="300"
        />
        <el-table-column
          prop="systemTypeDesc"
          label="System Type"
          width="100"
        />
        <el-table-column
          prop="alarmCode"
          label="Alarm Code"
          width="100"
        />
        <el-table-column
          prop="severity"
          label="Severity"
          width="100"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            {{ dict.label.alarm_severity[scope.row.severity] }}
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
          width="100"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.duration|transferDur }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="count"
          label="Count"
          width="80"
        />
        <el-table-column
          prop="createdBy"
          label="Alarm Source"
        />
        <el-table-column
          prop="updatedBy"
          label="Updated By"
        />
        <el-table-column
          label="Actions"
          width="200px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              @event_refresh="$_search"
            />
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
  '#CF2A27', // critical
  '#E06666', // error
  '#FF9900', // alert
  '#FFD966', // waringing
  '#B6D7A8'// info
]

export default {
  name: 'AlarmPanel',
  components: { udOperation },
  dicts: ['alarm_severity', 'system_type'],
  filters: {
    parseTime(value) {
      return parseTime(value)
    },
    transferDur(value) {
      const dur = Number(value)
      if (dur < 60) {
        return dur + 's'
      } else if (dur < 60 * 60) {
        return Math.floor(dur / 60) + 'm'
      } else if (dur < 60 * 60 * 24) {
        const mins = Math.floor(dur % 3600 / 60)
        return Math.floor(dur / 3600) + 'h' + (mins > 0 ? (' ' + mins + 'm') : '')
      } else {
        const hrs = Math.floor(dur % 86400 / 3600)
        return Math.floor(dur / 86400) + 'd' + (hrs > 0 ? (' ' + hrs + 'h') : '')
      }
    }
  },
  data() {
    return {
      num: 100,
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
        { key: 'systemType', display_name: 'System Type' },
        { key: 'alarmCode', display_name: 'Alarm Code' },
        { key: 'alarmSubject', display_name: 'Alarm Description' }
      ],
      iconstr: 'el-icon-video-pause'
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
      if (row.status === 2) {
        return 'pending-row'
      }
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
      console.log('search')
      const msg = this.$_getParams()
      this.webSocketSend(msg)
    },
    $_switch(i) {
      if (this.serverity[i]) {
        this.backGroundColor[i] = '#FFFFFF'
        this.color[i] = MainColor[i]
        this.serverity[i] = false
      } else {
        this.backGroundColor[i] = MainColor[i]
        this.color[i] = '#000000'
        this.serverity[i] = true
      }
      const msg = this.$_getParams()
      this.webSocketSend(msg)
      this.$forceUpdate()
    },
    $_pause_play() {
      if (this.iconstr === 'el-icon-video-play') {
        this.iconstr = 'el-icon-video-pause'
        this.initWebSocket()
        this.$notify({
          title: '启用成功!',
          type: 'success',
          duration: 3000
        })
      } else {
        this.iconstr = 'el-icon-video-play'
        this.websock.close(1000, 'client close session!!!')
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
      this.num = 100
    },
    $_getParams() {
      // serverity
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
          severity: str,
          num: this.num + ''
        }
      }
      // alarmCode
      if (this.query.type && this.query.value) {
        msg.body[this.query.type] = this.query.value
      }

      return msg
    },
    initWebSocket() {
      // const wsUri = process.env.VUE_APP_WS_API + '/webSocket/deploy'
      const wsUri = process.env.VUE_APP_WS_ALARM_API
      this.websock = new WebSocket(wsUri)
      this.websock.onopen = this.webSocketOnOpen
      this.websock.onerror = this.webSocketOnError
      this.websock.onmessage = this.webSocketOnMessage
      this.websock.onclose = this.webSocketOnClose
    },
    webSocketOnOpen(e) {
      console.log('websocket client open--->' + e)
      const msg = this.$_getParams()
      this.webSocketSend(msg)
      // this.websock.send('{"token": "' + this.token + '", "event": "' + this.topic + '"}')
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
      if (this.iconstr === 'el-icon-video-play') {
        this.$notify({
          title: '暂停中!',
          type: 'warning',
          duration: 5000
        })
        return
      }
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
  background: #cf2a27;
  color: white;
}
.el-table .critical-row:hover>td {
  box-shadow: 0px 1px 8px #a01d1a;
  background: #cf2a27 !important;
  color: #dcdfe6 !important;
}
.el-table .error-row {
  background: #e06666;
  color: black;
}
.el-table .error-row:hover>td {
  box-shadow: 0px 1px 8px #cf2a27;
  background: #e06666 !important;
  color: black !important;
}
.el-table .alert-row {
  color: black;
}
.el-table .alert-row:hover>td {
  background: #ff9900 !important;
}
.el-table .warning-row {
  color: black;
}
.el-table .warning-row:hover>td {
  background: #ffd966 !important;
}
.el-table .info-row {
  color: black;
}
.el-table .info-row:hover>td {
  background: #b6d7a8 !important;
}
.el-table .pending-row {
  color: #6c757d;
}
</style>
