<template>
  <elFrame src="http://192.168.101.171:8080" />
</template>
<script>
import { mapGetters } from 'vuex'
import elFrame from '@/components/Iframe/index'
export default {
  name: 'xxljob',
  components: { elFrame },
}
</script>
