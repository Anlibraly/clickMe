<template>
  <div id="app">
      <mt-header fixed title="点击就送">       
        <mt-button v-link="'/'" icon="back" slot="left" @click="goBack">返回</mt-button>
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
		this.$store.state.backAction = () => {};
		if (this.$cookie.get('clickme-apiToken')) {

      this.$store.state.token = this.$cookie.get('clickme-apiToken');

      this.$router.replace("/room");

		}
  },
  methods: {
    goBack() {
      this.$store.state.backAction();
    } 
  }
}
</script>

<style lang="sass">
	#router
		margin-top: 0.6rem;
</style>