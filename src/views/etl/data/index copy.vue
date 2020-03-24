<template>
   <div>
     {{multipleSelection}}
  <el-table
    :data="tableData"
    style="width: 100%"
    :row-class-name="tableRowClassName" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55"> </el-table-column>
     <el-table-column v-for="(item,index) in tableHeader"  :prop="item" :label="item" :key='index'> </el-table-column>
      
      <el-table-column label="操作"> 
       <template slot-scope="scope">
        <el-button
          size="mini"
          @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
        <el-button
          size="mini"
          type="danger"
          @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>
   </div>
</template>

<style>
  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>

<script>
  export default {
    methods: {
      tableRowClassName({row, rowIndex}) {
        if (rowIndex % 2 == 0) {
          return 'warning-row';
        } 
        return '';
      },
       handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleEdit(index, row) {
        console.log(JSON.stringify(index), JSON.stringify(row));
      },
      handleDelete(index, row) {
        console.log(index, row);
      }
    },
    data() {
      return {
        multipleSelection: [],
        tableHeader:['date','name','address'],
        tableData: [{
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
        }, {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }]
      }
    }
  }
</script>