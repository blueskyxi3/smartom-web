<template>
  <el-tabs
    v-model="activeName"
    style="padding-left: 8px;"
    @tab-click="tabClick"
  >
    <el-tab-pane
      label="Active Alarms"
      name="first"
    >
      <alarm ref="alarmactive" />
    </el-tab-pane>
    <el-tab-pane
      label="Alarm History"
      name="second"
    >
      <alarm-his ref="alarmhis" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Alarm from './alarm.vue'
import AlarmHis from './alarm-his.vue'
export default {
  name: 'AlarmInfo',
  components: { Alarm, AlarmHis },
  data() {
    return {
      activeName: 'first'
    }
  },
  methods: {
    tabClick(name) {
      if (this.activeName === 'first') {
        // this.$refs.alarmactive.crud.toQuery()
      } else {
        // this.$refs.alarmhis.crud.toQuery()
      }
    }
  }
}
</script>

<style scoped>
</style>
