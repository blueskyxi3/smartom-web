<template>
  <div>
    <el-form
      ref="form"
      :model="form"
      style="margin-top: 6px;"
      size="small"
      label-width="100px"
    >
      <div
        ref="editor"
        class="editor"
      />
      <el-button
        :loading="loading"
        style="margin-left:1.6%;"
        size="medium"
        type="primary"
        @click="doSubmit"
      >保存</el-button>
    </el-form>
  </div>
</template>

<script>
import { upload } from '@/utils/upload'
import { mapGetters } from 'vuex'
import E from 'wangeditor'
import { addGuide, getGuide } from '@/api/alarm/alarmRecord'
export default {
  name: 'Index',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false, form: { content: '' },
      editor: null
    }
  },
  computed: {
    ...mapGetters([
      'imagesUploadApi'
    ])
  },
  mounted() {
    const _this = this
    this.editor = new E(this.$refs.editor)
    // 自定义菜单配置
    this.editor.customConfig.zIndex = 10
    // 文件上传
    this.editor.customConfig.customUploadImg = function(files, insert) {
      // files 是 input 中选中的文件列表
      // insert 是获取图片 url 后，插入到编辑器的方法
      files.forEach(image => {
        files.forEach(image => {
          upload(_this.imagesUploadApi, image).then(data => {
            insert(data.data.url)
          })
        })
      })
    }
    this.editor.customConfig.onchange = (html) => {
      this.form.content = html
    }
    this.editor.create()
    // editor.txt.html('<p>www</p><p>wei</p><p>xx</p>')
  },
  methods: {
    getAlarmGuide() {
      getGuide(this.data.alarmDefinitionId).then(res => {
        console.log(JSON.stringify(res))
        this.editor.txt.html(res.guideline)
        this.loading = false
      }).catch(err => {
        this.loading = false
        console.log(err.response.data.message)
      })
    },
    doSubmit() {
      this.loading = true

      const params = {
        guideline: this.form.content,
        alarmDefinitionId: this.data.alarmDefinitionId
      }
      console.info(JSON.stringify(params))
      addGuide(params).then(res => {
        this.loading = false
        this.$message.success('操作成功!')
        this.$emit('event_guide', true)
      }).catch(err => {
        this.loading = false
        console.log(err.response.data.message)
        this.$message.error('操作报错!')
        this.$emit('event_guide', true)
      })
    }
  }
}
</script>

<style scoped>
.editor {
  text-align: left;
  margin: 20px;
  width: 730px;
}
/deep/ .w-e-text-container {
  height: 360px !important;
}
</style>
