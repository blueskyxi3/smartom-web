<template>
  <div class="dashboard-container">
    <div class="dashboard-editor-container">
      <panel-group />
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <ve-line :data="chartData" />
      </el-row>
      <el-row :gutter="32">
        <el-col
          :xs="24"
          :sm="24"
          :lg="8"
        >
          <div class="chart-wrapper">
            今日告警
            <ve-pie :data="todayPieChartData" />
          </div>
        </el-col>
        <el-col
          :xs="24"
          :sm="24"
          :lg="8"
        >
          <div class="chart-wrapper">
            告警类型
            <ve-pie :data="pieChartData" />
          </div>
        </el-col>
        <el-col
          :xs="24"
          :sm="24"
          :lg="8"
        >
          <div class="chart-wrapper">
            近期统计
            <ve-histogram :data="chartData" />
          </div>
        </el-col>
      </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <line-chart />
      </el-row>
    </div>
  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import { count } from '@/api/monitor/visits'
/**
 * 记录访问，只有页面刷新或者第一次加载才会记录
 */
count().then(res => {
})

export default {
  name: 'Dashboard',
  components: {
    PanelGroup,
    LineChart
  },
  data() {
    return {
      chartSettings: {
        label: '今日告警'
      },
      chartData: {
        columns: ['日期', 'SMS', 'VOICE', 'MOBILE', 'RETAIL'],
        rows: [
          { '日期': 'Mon', 'SMS': 3, 'VOICE': 3, 'MOBILE': 1, 'RETAIL': 2 },
          { '日期': 'Tue', 'SMS': 2, 'VOICE': 2, 'MOBILE': 1, 'RETAIL': 2 },
          { '日期': 'Wed', 'SMS': 1, 'VOICE': 2, 'MOBILE': 0, 'RETAIL': 2 },
          { '日期': 'Thu', 'SMS': 0, 'VOICE': 2, 'MOBILE': 0, 'RETAIL': 2 },
          { '日期': 'Fri', 'SMS': 0, 'VOICE': 1, 'MOBILE': 9, 'RETAIL': 2 },
          { '日期': 'Sat', 'SMS': 2, 'VOICE': 0, 'MOBILE': 6, 'RETAIL': 2 },
          { '日期': 'Sun', 'SMS': 5, 'VOICE': 3, 'MOBILE': 3, 'RETAIL': 4 }
        ]
      },
      pieChartData: {
        columns: ['类型', '告警数量'],
        rows: [
          { '类型': 'SMS', '告警数量': 5 },
          { '类型': 'VOICE', '告警数量': 3 },
          { '类型': 'MOBILE', '告警数量': 3 },
          { '类型': 'RETAIL', '告警数量': 4 }
        ]
      },
      todayPieChartData: {
        columns: ['级别', '告警数量'],
        rows: [
          { '级别': '低', '告警数量': 5 },
          { '级别': '中等', '告警数量': 8 },
          { '级别': '高', '告警数量': 2 }
        ]
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 18px 22px 22px 22px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
</style>
