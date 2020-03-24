<template>
  <div>
    <el-button v-permission="permission.edit"  :disabled="disabledEdit" size="mini" type="primary" icon="el-icon-caret-right" @click="doEdit(data)" />
    <el-popover v-model="pop" v-permission="permission.del" placement="top" width="180" trigger="manual" @show="onPopoverShow" @hide="onPopoverHide">
      <p>{{ msg }}</p>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="doCancel">取消</el-button>
        <el-button type="primary" size="mini" @click="doDelete(data)">确定</el-button>
      </div>
      <el-button slot="reference" :disabled="disabledDle" type="danger" icon="el-icon-s-data" size="mini" @click="toDelete" />
    </el-popover>
  </div>
</template>
<script>

import crudResult from "@/api/etlResult";
export default {
  props: {
    data: {
      type: Object,
      required: true
    },
    permission: {
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
      pop: false
    }
  },
  methods: {
    doCancel() {
      this.pop = false
     // this.crud.cancelDelete(this.data)
    },
    doDelete() {
     // this.crud.cancelDelete(this.data)
    },
    doEdit(e) {
      console.log(JSON.stringify(e))
      debugger
      crudResult.exec(e.id,e.batch_id).then(res => {
          this.loading = false;
          this.$notify({title: '执行成功',type: 'success',duration: 2500})
        })
        .catch(() => {
           this.$notify({title: '执行失败',type: 'failure',duration: 5000})
          this.loading = false;
        });
     // this.crud.cancelDelete(this.data)
    },
    toDelete() {
      this.pop = true
    //   if (data === this.data) {
      //  this.pop = false
      //}
    },
   
    onPopoverShow() {
      console.info('onPopoverShow')
      setTimeout(() => {
        document.addEventListener('click', this.handleDocumentClick)
      }, 0)
    },
    onPopoverHide() {
      console.info('onPopoverHide')
      document.removeEventListener('click', this.handleDocumentClick)
    },
    handleDocumentClick(event) {
      this.pop = false
    }
  }
}
</script>
