<template>
  <div class="app-container">
    <div class="head-container">
      <el-form ref="searchForm" :model="queryObject" inline label-width="150px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="Time">
              <el-date-picker
                v-model="queryObject.startEndTime"
                type="datetimerange"
                range-separator="To"
                start-placeholder="Start Time"
                end-placeholder="End Time"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="Customer">
              <el-autocomplete
                v-model="custInputBuffer"
                class="inline-input"
                :fetch-suggestions="searchCustomers"
                placeholder="Type to search"
                :trigger-on-focus="false"
                style="width: 208px;"
                value-key="uaAbbr"
                @select="selectCustomer"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Calling Number">
              <el-input v-model="queryObject.callingNumber" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Orig Clli">
              <el-input v-model="queryObject.origClli" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Orig Mem">
              <el-input v-model="queryObject.origMem" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="Carrier">
              <!-- <el-input v-model="queryObject.carrier" /> -->
              <el-autocomplete
                v-model="carrInputBuffer"
                class="inline-input"
                :fetch-suggestions="searchCarriers"
                placeholder="Type to search"
                :trigger-on-focus="false"
                style="width: 208px;"
                value-key="uaAbbr"
                @select="selectCarrier"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Called Number">
              <el-input v-model="queryObject.calledNumber" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Term Clli">
              <el-input v-model="queryObject.termClli" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Term Mem">
              <el-input v-model="queryObject.termMem" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="Country">
              <el-input />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Area">
              <el-input />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Duration">
              <span>
                <div class="inline-container">
                  <el-select v-model="queryObject.durOperator" placeholder="Select" style="width:85px">
                    <el-option key="ge" label=">=" value="ge" />
                    <el-option key="eq" label="=" value="eq" />
                    <el-option key="le" label="<=" value="le" />
                  </el-select>
                </div>
                <div class="inline-container"><el-input-number v-model="queryObject.durValue" /></div>
              </span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-row>
        <el-col :span="10" style="padding-left:150px;margin-bottom:10px">
          <el-collapse v-model="queryObject.analysis" accordion>
            <el-collapse-item title="Analysis" name="1">
              <el-row>
                <el-col :span="12">
                  <div v-for="(d, i) in selectedDimensions" :key="d.key">
                    <span>Dimension {{ i + 1 }}</span>
                    <el-select v-model="d.key" style="margin-right:10px;">
                      <el-option v-for="item in dimensionList" :key="item.key" :label="item.label" :value="item.key" />
                    </el-select>
                  </div>
                  <el-button v-if="selectedDimensions.length < dimensionList.length" type="success" icon="el-icon-plus" size="mini" circle @click="addDimension" />
                  <el-button v-if="selectedDimensions.length > 1" type="danger" icon="el-icon-minus" size="mini" circle @click="deleteDimension" />
                </el-col>
                <el-col :span="12">
                  <div v-for="(m, j) in selectedMeasures" :key="m.key">
                    <span>Measure {{ j + 1 }}</span>
                    <el-select v-model="m.key" style="margin-right:10px">
                      <el-option v-for="item in measureList" :key="item.key" :label="item.label" :value="item.key" />
                    </el-select>
                  </div>
                  <el-button v-if="selectedMeasures.length < measureList.length" type="success" icon="el-icon-plus" size="mini" circle @click="addMeasure" />
                  <el-button v-if="selectedMeasures.length > 1" type="danger" icon="el-icon-minus" size="mini" circle @click="deleteMeasure" />
                </el-col>
              </el-row>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6" style="padding-left:150px">
          <el-button type="primary" @click="toQuery">Apply</el-button>
          <el-button @click="reset">Reset</el-button>
        </el-col>
      </el-row>
      <div v-loading="queryLoading">
        <el-table
          v-if="queryResult.total !== 0"
          ref="resultTable"
          :data="queryResult.tableData.slice((queryResult.currentPage-1)*queryResult.pageSize, queryResult.currentPage*queryResult.pageSize)"
          size="small"
          style="width: 100%;"
        >
          <el-table-column prop="origTime" label="Orig Time" />
          <el-table-column prop="customer" label="Customer" />
          <el-table-column prop="carrier" label="Carrier" />
          <el-table-column prop="callDuration" label="Call Dur." />
          <el-table-column prop="origClli" label="Orig CLLI" />
          <el-table-column prop="origMem" label="Orig Mem" />
          <el-table-column prop="termClli" label="Term CLLI" />
          <el-table-column prop="termMem" label="Term Mem" />
          <el-table-column prop="callingNum" label="Calling No." />
          <el-table-column prop="dialNum" label="Dial No." />
          <el-table-column prop="termCode" label="Term Code" />
          <el-table-column prop="completedCode" label="Completed Code" />
          <el-table-column prop="destNum" label="Dest Num" />
        </el-table>
        <el-pagination
          v-if="queryResult.total !== 0"
          background
          layout="prev, pager, next"
          :total="queryResult.total"
          @current-change="changeCurrentPage"
        />
        <el-table
          v-if="analyzeResult !== null && analyzeResult.length > 0"
          ref="analysisTable"
          :data="analyzeResult"
          size="small"
          style="width: 100%;"
        >
          <el-table-column v-for="k in Object.keys(analyzeResult[0])" :key="k" :prop="k" :label="k" />
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import { doQuery, doAnalysis, formatTime, getCustomers, getCarriers } from '@/api/cdrQuery/methods.js'

export default {
  name: 'IddCdrQuery',
  data() {
    return {
      queryObject: {
        startEndTime: [new Date(), new Date()],
        customer: null,
        carrier: null,
        callingNumber: null,
        calledNumber: null,
        origClli: null,
        termClli: null,
        origMem: null,
        termMem: null,
        durOperator: null,
        durValue: null,
        analysis: null
      },
      queryResult: {
        tableData: null,
        total: 0,
        pageSize: 10,
        currentPage: 1
      },
      queryLoading: false,
      selectedDimensions: [
        {
          key: 'in_ua_id'
        }
      ],
      selectedMeasures: [
        {
          key: 'total_mins'
        }
      ],
      dimensionList: [
        {
          label: 'Customer',
          key: 'in_ua_id'
        },
        {
          label: 'Carrier',
          key: 'out_ua_id'
        },
        {
          label: 'Orig Clli',
          key: 'orig_clli'
        },
        {
          label: 'Term Clli',
          key: 'term_clli'
        },
        {
          label: 'Country',
          key: 'country'
        },
        {
          label: 'Area',
          key: 'area'
        }
      ],
      measureList: [
        {
          label: 'Total Minutes',
          key: 'total_mins'
        },
        {
          label: 'ASR',
          key: 'asr'
        },
        {
          label: 'Number of Calls',
          key: 'num_of_calls'
        },
        {
          label: 'Average Call Duration',
          key: 'avg_call_dur'
        }
      ],
      analyzeResult: null,
      customerList: null,
      carrierList: null,
      custInputBuffer: '',
      carrInputBuffer: ''
    }
  },
  mounted() {
    getCustomers().then(result => {
      if (result) {
        this.customerList = result
      } else {
        console.log('Error loading customers')
      }
    })

    getCarriers().then(result => {
      if (result) {
        this.carrierList = result
      } else {
        console.log('Error loading carriers')
      }
    })
  },
  methods: {
    toQuery() {
      if (this.queryLoading) {
        return
      }
      this.queryLoading = true
      // Format the times to "yyyy-mm-dd hh:mi:ss"
      var queryObjClone = Object.assign({}, this.queryObject)
      delete queryObjClone.startEndTime
      queryObjClone.startTime = formatTime(this.queryObject.startEndTime[0])
      queryObjClone.endTime = formatTime(this.queryObject.startEndTime[1])
      console.log(queryObjClone)

      // Reset results
      this.analyzeResult = null
      this.queryResult = {
        tableData: null,
        total: 0,
        pageSize: 10,
        currentPage: 1
      }

      if (this.queryObject.analysis === '1') {
        // Do analysis
        // Remove duplicated dimensions
        var dimensions = [] // Array to keep unique dimensions
        this.selectedDimensions.forEach(element => {
          if (!dimensions.includes(element.key)) dimensions.push(element.key)
        })
        queryObjClone.dimensions = dimensions
        // Remove duplicated measures
        var measures = [] // Array to keep unique measures
        this.selectedMeasures.forEach(element => {
          if (!measures.includes(element.key)) measures.push(element.key)
        })
        queryObjClone.measures = measures
        doAnalysis(queryObjClone).then(result => {
          if (result) {
            // Massage the query result
            this.analyzeResult = result.map(x => {
              if ('IN_UA_ID' in x) {
                x = this.renameObjKey(x, 'IN_UA_ID', 'Customer')
                x.Customer = this.uaIdToBillCode(x.Customer, this.customerList)
              } else if ('in_ua_id' in x) {
                x = this.renameObjKey(x, 'in_ua_id', 'Customer')
                x.Customer = this.uaIdToBillCode(x.Customer, this.customerList)
              }
              if ('OUT_UA_ID' in x) {
                x = this.renameObjKey(x, 'OUT_UA_ID', 'Carrier')
                x.Carrier = this.uaIdToBillCode(x.Carrier, this.carrierList)
              } else if ('out_ua_id' in x) {
                x = this.renameObjKey(x, 'out_ua_id', 'Carrier')
                x.Carrier = this.uaIdToBillCode(x.Carrier, this.carrierList)
              }
              return x
            })
          } else {
            console.log('Error processing query')
          }
          this.queryLoading = false
        })
      } else {
        // Do query when analysis is off
        doQuery(queryObjClone).then(result => {
          if (result) {
            this.queryResult.tableData = result
            this.queryResult.total = result.length
            this.queryResult.curPage = 1 // reset current page
            // Massage the query result
            this.queryResult.tableData = this.queryResult.tableData.map(x => {
              x.customer = this.uaIdToBillCode(x.inUaId, this.customerList)
              x.carrier = this.uaIdToBillCode(x.outUaId, this.carrierList)
              return x
            })
          } else {
            console.log('Error processing query')
          }
          this.queryLoading = false
        })
      }
    },
    reset() {
      for (const key in this.queryObject) {
        this.queryObject[key] = null
      }
      this.queryObject.startEndTime = [new Date(), new Date()]
      // Reset dimensions and measures
      this.selectedDimensions = [{ key: 'in_ua_id' }]
      this.selectedMeasures = [{ key: 'total_mins' }]
    },
    changeCurrentPage(curPage) {
      this.queryResult.currentPage = curPage
    },
    addDimension() {
      this.selectedDimensions.push({ key: 'area' })
    },
    deleteDimension() {
      if (this.selectedDimensions.length > 1) {
        this.selectedDimensions.pop()
      }
    },
    addMeasure() {
      this.selectedMeasures.push({ key: 'avg_call_dur' })
    },
    deleteMeasure() {
      if (this.selectedMeasures.length > 1) {
        this.selectedMeasures.pop()
      }
    },
    searchCustomers(queryString, cb) {
      var custs = this.customerList
      var results = queryString ? custs.filter(this.createFilter(queryString)) : custs
      // callback to return the filtered list
      cb(results)
    },
    createFilter(queryString) {
      return (billCode) => {
        return (billCode.uaAbbr.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    selectCustomer(item) {
      this.queryObject.customer = item.uaId
    },
    searchCarriers(queryString, cb) {
      var carrs = this.carrierList
      var results = queryString ? carrs.filter(this.createFilter(queryString)) : carrs
      // callback to return the filtered list
      cb(results)
    },
    selectCarrier(item) {
      this.queryObject.carrier = item.uaId
    },
    renameObjKey(oldObj, oldKey, newKey) {
      const keys = Object.keys(oldObj)
      const newObj = keys.reduce((acc, val) => {
        if (val === oldKey) {
          acc[newKey] = oldObj[oldKey]
        } else {
          acc[val] = oldObj[val]
        }
        return acc
      }, {})
      return newObj
    },
    uaIdToBillCode(uaId, list) {
      const billcodes = list.filter(c => String(c.uaId) === String(uaId)) // Get the bill code object by ua ID
      if (billcodes !== null && billcodes.length > 0) {
        return billcodes[0].uaAbbr
      } else {
        return ''
      }
    }
  }
}
</script>
<style scoped>
div.inline-container {
  display: inline-block;
}
</style>
