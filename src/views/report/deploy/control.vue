<template>
  <el-form
    ref="dynamicValidateForm"
    :model="conditionForm"
    label-width="100px"
  >
    <el-form-item
      v-for="(condition, index) in conditionForm.conditions"
      :key="condition.key"
      :label="'参数' + index"
      :prop="'conditions.' + index + '.pvalue'"
      :rules="{required: true, message: '参数名不能为空', trigger: 'blur' }"
    >
      <el-input
        v-model="condition.pvalue"
        placeholder="参数名称"
        style="width: 25%;"
      />
      <el-input
        v-model="condition.dvalue"
        placeholder="默认值"
        style="width: 25%;"
      />
      <el-select
        v-model="condition.ptype"
        style="width: 25%;"
        placeholder="请选择"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button @click.prevent="removecondition(condition)">删除</el-button>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="submitForm('dynamicValidateForm')"
      >提交</el-button>
      <el-button @click="addcondition">新增参数</el-button>
      <el-button @click="resetForm('dynamicValidateForm')">重置</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  props: {
    conditionForm: {
      type: Object,
      default: function() {
        return {
          conditions: [{
            pvalue: '',
            dvalue: '',
            ptype: '0'
          }]
        }
      }
    }
  },
  data() {
    return {
      options: [{
        value: '0',
        label: '文本框'
      }, {
        value: '1',
        label: '日期框'
      }]
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert('submit!')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    removecondition(item) {
      var index = this.conditionForm.conditions.indexOf(item)
      if (index !== -1) {
        this.conditionForm.conditions.splice(index, 1)
      }
    },
    addcondition() {
      this.conditionForm.conditions.push({
        pvalue: '',
        dvalue: '',
        ptype: '0',
        key: Date.now()
      })
    }
  }
}
</script>
