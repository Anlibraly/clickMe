<template>
    <div id="login">
        <div id="login-input">
            <el-row :gutter="20" >
                <el-col :span="8"  :offset="8" >
                    <el-tooltip :disabled="disabled" :content="errorTip" placement="bottom-start" effect="light" >
                        <el-input placeholder="请输入用户名" v-model="username" type="text"></el-input>
                    </el-tooltip>
					<el-input placeholder="请输入密码" v-model="password" type="password"></el-input>
					<template slot="append" ></template>
					<el-button @click="login" > 登录</el-button>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import _ 		from 'underscore';

export default {
	name: "login",
	data: {
		password: '',
		username: '',
		disabled: true,
		errorTip: ''
	},
	methods: {
		check (v) {
			if(v != undefined && (v > 0 || v.length>0)){
				return true;
			}
			return false;
		},
		setTip (tip) { // 消息提示，1.5秒后自动关闭
			this.errorTip = tip;
			this.disabled = false;
			setTimeout(() => {
				this.disabled = true;
				this.errorTip = '';
			}, 1500);
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
							expidata: '4h'
						});

						this.$cookie.set('clickme-apiToken', data.apiToken, {
							expidata: '4h'
						});

						this.$store.state.socket.emit('room', {
							name: this.username
						});

						this.$router.replace("/room");
					}

				});			
			} else {
				this.setTip('用户名密码不能为空');
			}
		}
	},
	created () { // 进入该界面之后 如果已登录 跳转
		if (this.$cookie.get('clickme-apiToken')) {
			this.$router.replace("/room");
		}
	}
}
</script>

<style lang="sass">
	#login
		width: 100%
		height: 100%
		background: #666666
		background-size: 100% 100%
		background-attachment: fixed
		#login-input
			position: absolute
			width: 100%
			height: 30px
			top: calc(50% - 15px)
</style>