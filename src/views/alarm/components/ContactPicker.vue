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
      <label v-if="escalation.escalationLevel > 1">when</label>
      <el-select v-if="escalation.escalationLevel > 1" v-model="escalation.escalationRule" clearable placeholder="Select" style="width: 95px">
        <el-option
          v-for="item in dict.escalation_rule"
          :key="item.id"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
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
}
</style>
