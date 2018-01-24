<template>
<div id="detail">
    <ul
      v-infinite-scroll="loadMore"
      infinite-scroll-disabled="loading"
      infinite-scroll-distance="10">
      <li v-for="item in conversation"
          v-bind:key="item">{{ item }}</li>
    </ul>
    <cell v-bind:cells="answers"></cell>
    <mt-button type="primary" @click="choise('0')">0</mt-button>
    <mt-button type="primary" @click="choise('1')">1</mt-button>
		<mt-field label="说点什么" placeholder="说点什么" v-model="content"></mt-field>
		<mt-button type="primary" @click="send()">发送</mt-button>  
</div>
</template>

<script>
import _ from 'underscore';
import cell from './cell';

export default {
  name: 'detail',
  data() {
    return {
      answers: this.$store.state.answers,
      conversation: this.$store.state.conversation,
      content: '',
      storeRooms: {}
    }
  },
  watch:{
    conversation(curVal, oldVal) {
      //console.log('new cons', curVal);
    },
    answers(curVal, oldVal) {
      console.log('new ans', curVal);
    }
  },
  created() {
    this.emitRemote({
      target: 'intoRoom'
    });

    this.$store.state.backAction = () => {
      this.emitRemote({
        target: 'exitRoom'
      });
      this.$router.replace(`/room`);
    };
  },
  components: {
      cell
  },
  methods: {
    emitRemote(opt) {
      let apiToken = this.$cookie.get('clickme-apiToken');
      this.$store.state.socket.emit('room', _.extend(opt, {
        apiToken,
        roomId: 1
      }));
    },
    send() {
      this.emitRemote({
        target: 'chat',
        content: this.content
      });      
    },
    choise(n) {
      this.emitRemote({
        target: 'choice',
        choice: n
      });         
    }
  }
}
</script>

<style lang="sass">
    
</style>