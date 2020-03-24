<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
          <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
         <el-select v-model="query.isAlarm" clearable placeholder="告警" class="filter-item" style="width: 130px">
          <el-option v-for="item in alarms" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission">
        <template slot="right">
          <el-button
            v-if="!isRefresh"
            v-permission="['admin','deploy:add']"
            class="filter-item"
            size="mini"
            type="primary"
            icon="el-icon-upload"
            @click="startRefresh"
          >启动刷新</el-button>
          <el-button
            v-if="isRefresh"
            v-permission="['admin','deploy:add']"
            class="filter-item"
            size="mini"
            type="primary"
            icon="el-icon-upload"
            @click="stopRefresh"
          >关闭刷新</el-button>
        </template>
      </crudOperation>
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="500px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="monitorType">
            <el-input v-model="form.monitorType" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="monitorText">
            <el-input :rows="3" v-model="form.monitorText" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="monitorId">
            <el-input v-model="form.monitorId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="isAlarm">
            <el-input v-model="form.isAlarm" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="createTime">
            <el-date-picker v-model="form.createTime" type="datetime" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column v-if="columns.visible('id')" prop="id" label="ID" width="100" />

        <el-table-column v-if="columns.visible('serviceName')" prop="serviceName" :show-overflow-tooltip="true" label="系统名" width="130" >
          <template slot-scope="scope">
            <span>{{ scope.row.serviceName }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('alertCode')" prop="alertCode" label="系统类型" width="130" :show-overflow-tooltip="true"  >
          <template slot-scope="scope">{{ dict.label.alert_code[scope.row.alertCode] }}</template>
        </el-table-column>
         <el-table-column v-if="columns.visible('serverName')" prop="serverName" label="服务器" width="130">
          <template slot-scope="scope">
            <span>{{ scope.row.serverName }}</span>
          </template>
            </el-table-column>
        <el-table-column v-if="columns.visible('processName')" prop="processName" :show-overflow-tooltip="true" label="程序名称" width="130">
          <template slot-scope="scope">
            <span>{{ scope.row.processName }}</span>
          </template>
        </el-table-column>
      
        <el-table-column
          label="执行结果"
          width="300"
          v-if="columns.visible('monitorText')"
          prop="monitorText" 
        >
          <template slot-scope="scope" >
            <el-popover trigger="hover" placement="top" v-if="scope.row.monitorType=='SHELL' ">
              <p>{{ scope.row.monitorText }}</p>
              <div slot="reference" class="name-wrapper">
                {{ scope.row.monitorText|ellipsis }}
              </div>
            </el-popover>
            <el-popover v-else placement="right" width="400" trigger="click">
              <json-viewer :value="sqldata" :expand-depth="5" copyable boxed sort></json-viewer>
              <el-button
                type="text"
                icon="el-icon-search"
                slot="reference"
                @click="$_getSqlData(scope.row)"
              >查看详情</el-button>
            </el-popover>
          </template>
         </el-table-column> 
        <!--     <el-table-column
          label="执行脚本"
          width="150"
          v-if="columns.visible('monitorId')"
          prop="monitorId"
        >
          <template slot-scope="scope">
            <el-popover placement="right" width="400" trigger="click">
            
             <json-viewer :value="scriptData"></json-viewer>
              <el-button
                icon="el-icon-search"
                slot="reference"
                @click="$_getScript(scope.row)"
              >{{ scope.row.monitorId }}</el-button>
            </el-popover>
          </template>
        </el-table-column>-->

        <el-table-column label="状态" width="150" v-if="columns.visible('isAlarm')" prop="isAlarm">
          <template slot-scope="scope">
           <span >
            <i v-if="scope.row.isAlarm!=0" class="el-icon-message-solid" style="color:red" ></i>
             <span v-if="scope.row.isAlarm!=0"  style="color:red">
             {{scope.row.isAlarm==0?'Normal':'Critical'}} 
              </span> 
            <span v-else>
             {{scope.row.isAlarm==0?'Normal':'Critical'}} 
              </span> 
           </span>  
          </template>
        </el-table-column>
  
           <el-table-column label="来源" width="100">
          <template slot-scope="scope">
            {{ scope.row.monitorType }}:{{scope.row.monitorId}}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('createTime')" prop="createTime" label="执行时间" width="200">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      <el-table-column label="操作" width="100px" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" style="margin-right: 2px" type="text">
            <router-link :to="'/monitor/buzihis/' + scope.row.monitorId">
              查看历史详情
            </router-link>
          </el-button>
        </template>
       </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudProcess from "@/api/process";
import crudSql from "@/api/sql";
import crudMonitorSql from "@/api/monitorSql";
import crudMonitorResult from "@/api/monitorResult";
import CRUD, { presenter, header, form, crud } from "@crud/crud";
import rrOperation from "@crud/RR.operation";
import crudOperation from "@crud/E.operation";
import udOperation from "@crud/UD.operation";
import pagination from "@crud/Pagination";

// crud交由presenter持有
const defaultCrud = CRUD({
  title: "业务监控",
  url: "api/monitorResult",
  sort: "id,desc",
  crudMethod: { ...crudMonitorResult }
});
const defaultForm = {
  id: null,
  monitorType: null,
  monitorText: null,
  monitorId: null,
  isAlarm: null,
  createTime: null
};
export default {
  name: "MonitorResult",
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ["alert_code"],
  data() {
    return {
      permission: {
        add: ["admin", "monitorResult:add"],
        edit: ["admin", "monitorResult:edit"],
        del: ["admin", "monitorResult:del"]
      },
      isRefresh: false,
      rules: {},
      queryTypeOptions: [
        { key: 'processName', display_name: "程序名称" }, // reverse to app
        { key: 'serviceName', display_name: "系统名称" },//reverse to app
      ],
      scriptData: {},
      sqldata: {},
      timer: "",
      alarms:[{id:'1',name:'Normal'},{id:'0',name:'Critical'}],
    };
  },
  filters: {
    ellipsis(value) {
      if (!value) return "";
      if (value.length > 30) {
        return value.slice(0, 30) + "...";
      }
      return value;
    }
  },
  // mounted() {
  //   this.timer = setInterval(this.get, 10000);
  // },
  beforeDestroy() {
    console.log("destory!");
    clearInterval(this.timer);
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      this.crud.params = {};
      const query = this.query;
      if(query.isAlarm){
         this.crud.params['isAlarm'] = query.isAlarm
      }
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value;
      }
      return true;
    },
    tableRowClassName({ row, rowIndex }) {
      // console.log("rowindex:" + rowIndex + "  row:" + row.monitorId);
      return "warning-row";
    },
    startRefresh() {
      console.log("start-----");
      if (!this.timer)  {
        this.timer = setInterval(this.get, 10000);
      }
      this.crud.notify("已经启动", "success");
      this.isRefresh = true;
    },
    stopRefresh() {
      console.log("stop-----");
      clearInterval(this.timer);
      this.crud.notify("已经关闭", "success");
      this.isRefresh = false;
    },
    get() {
      console.log("get-----");
      this.crud.toQuery();
    },
    $_getSqlData(row) {
      console.log("  row:" + row.monitorId);
      this.loading = true;
      crudMonitorSql
        .get(row.id)
        .then(res => {
          this.loading = false;
         // this.sqldata = res;
         console.log(res)
         if(!res) this.sqldata = {};
         else this.sqldata = res;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    $_getScript(row) {
      console.log("  row:" + row.monitorId);
      this.loading = true;

      if (row.monitorType != "SHELL") {
        crudSql
          .get(row.monitorId)
          .then(res => {
            this.loading = false;
            this.scriptData = res;
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        crudProcess
          .get(row.monitorId)
          .then(res => {
            this.loading = false;
            this.scriptData = res;
          })
          .catch(() => {
            this.loading = false;
          });
      }
    }
  }
};
</script>

<style scoped>
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>
