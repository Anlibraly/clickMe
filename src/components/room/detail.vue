<template>
<div id="detail">
    <ul
      v-infinite-scroll="loadMore"
      infinite-scroll-disabled="loading"
      infinite-scroll-distance="10">
      <li v-for="item in conversation"
          v-bind:key="item">{{ item }}</li>
    </ul>    
		<mt-field label="说点什么" placeholder="说点什么" v-model="content"></mt-field>
		<mt-button type="primary" @click="send">发送</mt-button>  
</div>
</template>

<script>
import _ from 'underscore';

export default {
  name: 'detail',
  data() {
    return {
      content: '',
      storeRooms: {},
      conversation: this.$store.state.conversation
    }
  },
  watch:{
    conversation(curVal, oldVal) {
      //console.log(111, curVal);
    }
  },
  created() {
    let apiToken = this.$cookie.get('clickme-apiToken');

    this.$store.state.socket.emit('room', {
      apiToken,
      target: 'intoRoom',
      roomId: 1
    });

  },
  components: {

  },
  methods: {
    send() {
      let apiToken = this.$cookie.get('clickme-apiToken');
      this.$store.state.socket.emit('room', {
        apiToken,
        target: 'chat',
        content: this.content,
        roomId: 1
      });      
    }
  }
}
</script>

<style lang="sass">
    
</style>