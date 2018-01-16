<template>
    <div id="login" style="text-align:center;">
		<mt-field label="用户名" placeholder="请输入用户名" v-model="username"></mt-field>
		<mt-field label="密码" placeholder="请输入密码" v-model="password" type="password"></mt-field>
		<mt-button type="primary" @click="login">登录</mt-button>
    </div>
</template>

<script>
import _ 			from 'underscore';
import { Toast } 	from 'mint-ui';

export default {
	name: "login",
	data: {
		username: '',
		password: ''
	},
	methods: {
		check (v) {
			if(v != undefined && (v > 0 || v.length>0)){
				return true;
			}
			return false;
		},
		login () { 
			if(this.check(this.username) && this.check(this.password)) {
				this.$store.dispatch('login', {
					username: this.username,
					password: this.password
				})
				.then((data) => {

					if (data.code > 0) {

						this.$cookie.set('clickme-token', JSON.stringify(data.token), {
							expires: '4h'
						});

						this.$cookie.set('clickme-apiToken', data.apiToken, {
							expires: '4h'
						});

						this.$store.state.socket.emit('room', {
							name: this.username
						});

						this.$router.replace("/room");
					}

				});			
			} else {
				Toast({
					message: '用户名密码不能为空',
					position: 'bottom',
					duration: 3000
				});
			}
		}
	},
	created () { // 进入该界面之后 如果已登录 跳转
		if (this.$cookie.get('clickme-apiToken')) {
			this.$router.replace("/detail");
		}
	}
}
</script>

<style lang="sass">

</style>