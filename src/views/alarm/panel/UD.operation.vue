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
        icon="el-icon-edit"
        size="mini"
        @click="toGuideline"
      />
    </el-popover>

    <el-button
      size="mini"
      type="primary"
      :icon="iconstr"
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
        >取消</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="doDelete(data)"
        >确定</el-button>
      </div>
      <el-button
        slot="reference"
        :disabled="disabledDle"
        type="danger"
        icon="el-icon-delete"
        size="mini"
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
      default: '确定删除本条数据吗？'
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
        this.$message.success('操作成功!')
        this.$emit('event_refresh', true)
      }).catch((e) => {
        console.log(e)
        this.$message.error('操作报错!')
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
          this.$message.success('恢复成功!')
          this.$emit('event_refresh', true)
        }).catch((e) => {
          console.log(e)
          this.$message.error('操作报错!')
        })
      } else {
        pause(data.alarmCode).then((res) => {
          console.log(JSON.stringify(res))
          this.$message.success('暂停成功!')
          this.$emit('event_refresh', true)
        }).catch((e) => {
          console.log(e)
          this.$message.error('操作报错!')
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
