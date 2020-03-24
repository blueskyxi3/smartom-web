<template>
  <div class="app-container" style="padding: 8px;">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.blurry"
          clearable
          size="small"
          placeholder="输入内容模糊搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <el-date-picker
          v-model="query.createTime"
          :default-time="['00:00:00','23:59:59']"
          type="daterange"
          range-separator=":"
          size="small"
          class="date-item"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <rrOperation :crud="crud" />
      </div>
      <crudOperation :permission="permission">
        <!-- 新增 -->
        <el-button
          slot="left"
          v-permission="['admin','storage:add']"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-upload"
          @click="crud.toAdd"
        >上传</el-button>
      </crudOperation>
    </div>
    <!--表单组件-->
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :before-close="crud.cancelCU"
      :visible.sync="crud.status.cu > 0"
      :title="crud.status.add ? '文件上传' : '编辑文件'"
      width="500px"
    >
      <el-form ref="form" :model="form" size="small" label-width="80px">
        <!--   上传文件   -->
        <el-form-item v-if="crud.status.add" label="上传">
          <el-upload
            ref="upload"
            :limit="1"
            :before-upload="beforeUpload"
            :auto-upload="false"
            :headers="headers"
            :on-success="handleSuccess"
            :on-error="handleError"
            :action="fileUploadApi + '?name=[ETL]'"
          >
            <div class="eladmin-upload">
              <i class="el-icon-upload" /> 添加文件
            </div>
            <div slot="tip" class="el-upload__tip">可上传任意格式文件，且不超过100M</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="RuleID" prop="ruleId">
          <el-input v-model="form.ruleId" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="备注" prop="comments">
          <el-input v-model="form.comments" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button v-if="crud.status.add" :loading="loading" type="primary" @click="upload">确认</el-button>
        <el-button v-else :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      style="width: 100%;"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="columns.visible('name')" prop="name" label="文件名">
        <template slot-scope="scope">
          <el-popover
            :content="'file/' + scope.row.type + '/' + scope.row.realName"
            placement="top-start"
            title="路径"
            width="200"
            trigger="hover"
          >
            <a
              slot="reference"
              :href="baseApi + '/file/' + scope.row.type + '/' + scope.row.realName"
              class="el-link--primary"
              style="word-break:keep-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color: #1890ff;font-size: 13px;"
              target="_blank"
            >{{ scope.row.name }}</a>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column v-if="columns.visible('suffix')" prop="suffix" label="文件类型" />

      <el-table-column v-if="columns.visible('size')" prop="size" label="大小" />
      <el-table-column v-if="columns.visible('operate')" prop="operate" label="操作人" />
      <el-table-column v-if="columns.visible('ruleId')" prop="ruleId" label="RuleID" />
      <el-table-column v-if="columns.visible('status')" prop="status" label="状态">
        <template slot-scope="scope">{{ dict.label.process_status[scope.row.status] }}</template>
      </el-table-column>
      <el-table-column v-if="columns.visible('createTime')" prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columns.visible('updateDate')"
        prop="updateDate"
        label="执行"
        width="100"
      >
        <template slot-scope="scope">
          <el-popover
            v-model="pop"
            v-permission="permission.del"
            placement="top"
            width="280"
            trigger="manual"
            @show="onPopoverShow"
            @hide="onPopoverHide"
          >
            <p v-if="scope.row.ruleId">Rule [{{ scope.row.ruleId }}]!</p>
            <p v-else>Rule [{{ ruleObj.id }}]{{ruleObj.rule}}!</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="doCancel">取消</el-button>
              <el-button type="primary" size="mini" @click="exeCMD(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              v-permission="permission.edit"
              type="primary"
              icon="el-icon-caret-right"
              size="mini"
              @click="$_toPop(scope.row)" circle/>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column
        v-permission="['admin','sql:edit','sql:del']"
        label="操作"
        width="150px"
        align="center"
      >
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudResult from "@/api/etlResult";
import { mapGetters } from "vuex";
import { getToken } from "@/utils/auth";
import crudFile from "@/api/tools/localStorage";
import CRUD, { presenter, header, form, crud } from "@crud/crud";
import rrOperation from "@crud/RR.operation";
import crudOperation from "@crud/CRUD.operation";
import udOperation from "@crud/UD.operation";
import pagination from "@crud/Pagination";

// crud交由presenter持有
const defaultCrud = CRUD({
  title: "ETL文件",
  url: "api/localStorage?type=etl",
  crudMethod: { ...crudFile }
});
const defaultForm = { id: null, name: "" };
export default {
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ["process_status"],
  data() {
    return {
      ruleObj:{},
      delAllLoading: false,
      loading: false,
      headers: { Authorization: getToken() },
      permission: {
        edit: ["admin", "storage:edit"],
        del: ["admin", "storage:del"]
      },
     pop:false 
    };
  },
  computed: {
    ...mapGetters(["baseApi", "fileUploadApi"])
  },
  created() {
    this.crud.optShow.add = false;
  },
  methods: {
    doCancel() {
      this.pop = false
     // this.crud.cancelDelete(this.data)
    },
    $_toPop(row){
      this.pop = true
      this.$_getRule(row)
    },
    // 上传文件
    upload() {
      this.$refs.upload.submit();
    },
    beforeUpload(file) {
      let isLt2M = true;
      isLt2M = file.size / 1024 / 1024 < 100;
      if (!isLt2M) {
        this.loading = false;
        this.$message.error("上传文件大小不能超过 100MB!");
      }
      this.form.name = file.name;
      return isLt2M;
    },
    handleSuccess(response, file, fileList) {
      this.crud.notify("上传成功", CRUD.NOTIFICATION_TYPE.SUCCESS);
      this.$refs.upload.clearFiles();
      this.crud.status.add = CRUD.STATUS.NORMAL;
      this.crud.resetForm();
      this.crud.toQuery();
    },
    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message);
      this.$notify({
        title: msg.message,
        type: "error",
        duration: 2500
      });
      this.loading = false;
    },
    exeCMD(row) {
      row.status = 3;
      this.loading = true;
      crudFile
        .edit(row)
        .then(res => {
          this.loading = false;
          this.crud.notify("执行成功", "success");
          this.pop = false
        })
        .catch(() => {
          this.loading = false;
          this.pop = false
        });
    },
    $_getRule(row){
      this.ruleObj = {}
      crudResult.getRule(row.name+"."+row.suffix).then(res => {
          this.loading = false;
          this.ruleObj = res
        })
        .catch(() => {
          this.loading = false;
        });
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
  }
};
</script>

<style scoped>
/deep/ .el-image__error,
.el-image__placeholder {
  background: none;
}
/deep/ .el-image-viewer__wrapper {
  top: 55px;
}
</style>
