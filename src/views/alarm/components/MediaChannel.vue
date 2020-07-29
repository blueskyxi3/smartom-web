<template>
  <div>
    <span v-for="(r, index) in recipients" :key="`r-${index}`" class="media-channel">
      <el-select v-model="r.mediaType" clearable placeholder="select" style="width: 80px;">
        <el-option
          v-for="item in dict.media_type"
          :key="item.id"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input v-model="r.mediaAddress" type="text" style="width: 225px;" />
      <el-link :underline="false" class="remove-icon" @click="removeMediaChannel(r)"><i class="el-icon-circle-close" /></el-link>
    </span>
    <el-link type="primary" @click="addMediaChannel">Add Media Channel</el-link>
  </div>
</template>
<script>
export default {
  name: 'MediaChannel',
  dicts: ['media_type'],
  props: {
    recipients: {
      type: Array,
      required: true
    }
  },
  methods: {
    addMediaChannel() {
      this.recipients.push({
        mediaType: null,
        mediaAddress: null
      })
      this.emitChangeEvent()
    },
    removeMediaChannel(obj) {
      const idx = this.recipients.indexOf(obj)
      if (idx > -1) {
        this.recipients.splice(idx, 1)
        this.emitChangeEvent()
      }
    },
    emitChangeEvent() {
      this.$emit('change')
    }
  }
}
</script>
<style scoped>
.media-channel .el-select {
  display:inline-block
}

.media-channel .el-input {
  display:inline-block
}

.media-channel > .remove-icon i{
  color: #CF2A27;
  font-weight: 900;
}
</style>
