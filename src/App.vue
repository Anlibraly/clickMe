<template>
  <div id="app">
      <mt-header fixed title="点击就送">       
        <mt-button v-link="'/'" icon="back" slot="left">返回</mt-button>
        <mt-button icon="more" slot="right"></mt-button>
      </mt-header>
      <router-view id="router"></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to ClickMe'
    }
  },
	created () { // 进入该界面之后 如果已登录 跳转
		if (this.$cookie.get('clickme-apiToken') === 1) {

      this.$router.replace("/room");

		}
	}
}
</script>

<style lang="sass">
	#router
		margin-top: 0.6rem;
</style>