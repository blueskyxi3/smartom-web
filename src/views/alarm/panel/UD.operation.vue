<template>
  <div>
    <el-popover
      v-model="pop1"
      placement="top"
      width="820"
      trigger="manual"
      @show="onPopoverShow1"
      @hide="onPopoverHide1"
    >
      <guideline
        ref="guide1"
        :data="data"
        @event_guide="$_close"
      />
      <el-button
        slot="reference"
        :disabled="disabledDle"
        type="primary"
        icon="el-icon-edit-outline"
        size="mini"
        class="action-btn"
        @click="toGuideline"
      />
    </el-popover>

    <el-button
      size="mini"
      type="primary"
      :icon="iconstr"
      class="action-btn"
      @click="toPauseAndResume(data)"
    />
    <el-popover
      v-model="pop"
      placement="top"
      width="180"
      trigger="manual"
      @show="onPopoverShow"
      @hide="onPopoverHide"
    >
      <p>{{ msg }}</p>
      <div style="text-align: right; margin: 0">
        <el-button
          size="mini"
          type="text"
          @click="doCancel"
        >No</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="doDelete(data)"
        >Yes</el-button>
      </div>
      <el-button
        slot="reference"
        :disabled="disabledDle"
        type="primary"
        icon="el-icon-circle-close"
        size="mini"
        class="action-btn"
        @click="toDelete"
      />
    </el-popover>
  </div>
</template>
<script>
import { pause, resume, clear } from '@/api/alarm/alarmRecord'
import guideline from './guideline.vue'
export default {
  components: { guideline },
  props: {
    data: {
      type: Object,
      required: true
    },
    disabledEdit: {
      type: Boolean,
      default: false
    },
    disabledDle: {
      type: Boolean,
      default: false
    },
    msg: {
      type: String,
      default: 'Clear this alarm ?'
    }
  },
  data() {
    return {
      pop: false,
      pop1: false
      // iconstr: 'el-icon-video-pause'
    }
  },
  computed: {
    iconstr() {
      if (this.data.status === 2) { return 'el-icon-video-play' } else return 'el-icon-video-pause'
    }
  },
  methods: {
    doCancel() {
      this.pop = false
      // this.crud.cancelDelete(this.data)
    },
    toDelete() {
      this.pop = true
    },
    toGuideline() {
      this.pop1 = true
      this.$refs.guide1.getAlarmGuide()
    },
    $_close() {
      this.pop1 = false
    },
    doDelete(data) {
      console.log('doDelete')
      this.pop = false
      clear(data.alarmCode).then((res) => {
        console.log(JSON.stringify(res))
        this.$message.success('Alarm cleared!')
        this.$emit('event_refresh', true)
      }).catch((e) => {
        console.log(e)
        this.$message.error('Error occured.')
      })
    },
    toEdit(data) {
      console.log('toEdit')
    },
    toPauseAndResume(data) {
      console.log('toPauseAndResume->' + JSON.stringify(data))
      if (data.status === 2) {
        resume(data.alarmCode).then((res) => {
          console.log(JSON.stringify(res))
          this.$message.success('Alarm resumed')
          this.$emit('event_refresh', true)
        }).catch((e) => {
          console.log(e)
          this.$message.error('Error occured.')
        })
      } else {
        pause(data.alarmCode).then((res) => {
          console.log(JSON.stringify(res))
          this.$message.success('Alarm suspended')
          this.$emit('event_refresh', true)
        }).catch((e) => {
          console.log(e)
          this.$message.error('Error occured.')
        })
      }
    },
    onPopoverShow() {
      setTimeout(() => {
        document.addEventListener('click', this.handleDocumentClick)
      }, 0)
    },
    onPopoverHide() {
      document.removeEventListener('click', this.handleDocumentClick)
    },
    handleDocumentClick(event) {
      this.pop = false
    },
    onPopoverShow1() {
      setTimeout(() => {
        document.addEventListener('click', this.handleDocumentClick1)
      }, 0)
    },
    onPopoverHide1() {
      document.removeEventListener('click', this.handleDocumentClick1)
    },
    handleDocumentClick1(event) {
      this.pop1 = false
    }
  }
}
</script>
<style scoped>
.action-btn {
  font-size: 20px;
}
</style>
