<template>
  <div>
    <span>
      <el-autocomplete
        class="inline-input"
        :fetch-suggestions="querySearch"
        placeholder="Select"
        :trigger-on-focus="false"
        style="width: 140px;"
        value-key="userName"
        @select="addRecipients"
      />
      <div v-if="escalation.escalationLevel > 1" class="inline-container">
        <label>when</label>
        <el-select
          v-if="escalation.escalationLevel > 1"
          v-model="escalation.escalationRule"
          clearable
          placeholder="Select"
          style="width: 95px"
          @change="resetValue"
        >
          <el-option
            v-for="item in dict.escalation_rule"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div v-if="escalation.escalationLevel > 1 && escalation.escalationRule <= 2" class="inline-container">
        <label>&gt;</label>
        <el-input-number v-model="escalation.escalationValue" controls-position="right" style="width: 120px;" />
        <label v-if="escalation.escalationRule == 1">mins</label>
      </div>
      <div v-else-if="escalation.escalationLevel > 1 && escalation.escalationRule == 3" class="inline-container">
        <label>is</label>
        <el-select v-model="escalation.escalationValue" placeholder="Select" style="width: 120px;">
          <el-option label="work hours" value="work_hours" />
          <el-option label="off hours" value="off_hours" />
        </el-select>
      </div>
    </span>
    <ul class="contacts-list">
      <li v-for="c in escalation.contacts" :key="c.userName">
        <el-link type="primary">{{ c.userName }}</el-link>
        <el-link :underline="false" @click="removeRecipient(escalation.contacts, c)"><i class="el-icon-circle-close" /></el-link>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'ContactPicker',
  dicts: ['escalation_rule'],
  props: {
    escalation: {
      type: Object,
      required: true
    },
    recipients: {
      type: Array,
      required: true
    }
  },
  methods: {
    removeRecipient(contactList, contact) {
      const idx = contactList.indexOf(contact)
      if (idx > -1) {
        contactList.splice(idx, 1)
      }
    },
    querySearch(queryString, cb) {
      var recipients = this.recipients
      var results = queryString ? recipients.filter(this.createFilter(queryString)) : recipients
      // callback to return the filtered list
      cb(results)
    },
    createFilter(queryString) {
      return (recipient) => {
        return (recipient.userName.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    addRecipients(item) {
      if (!this.escalation.contacts.includes(item)) {
        this.escalation.contacts.push(item)
      }
    },
    resetValue(ruleId) {
      if (ruleId === '1' || ruleId === '2') {
        this.escalation.escalationValue = 0
      } else if (ruleId === '3') {
        this.escalation.escalationValue = null
      }
    }
  }
}
</script>
<style scoped>
ul.contacts-list {
  list-style-type: none;
  overflow: hidden;
  padding-inline-start: 0;
}
ul.contacts-list > li {
  float: left;
  margin: 2px 4px 2px 0px;
  line-height: 14px;
}
div.inline-container {
  display: inline-block;
}
</style>
