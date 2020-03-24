<template>
  <elFrame src="http://www.baidu.com" />
</template>
<script>
import { mapGetters } from 'vuex'
import elFrame from '@/components/Iframe/index'
export default {
  name: 'report',
  components: { elFrame }
}
</script>
