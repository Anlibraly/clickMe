<template>
<div id="roomlist">
  <room-cell v-bind:list="list"
    v-bind:loadMore="loadMore"></room-cell>
</div>
</template>

<script>
import RoomCell from './RoomCell';

export default {
  name: 'roomlist',
  data() {
    return {
      list: [{
        name: 'iPHONE6',
        thumb: 'https://diycode.b0.upaiyun.com/photo/2017/fc7727985fd40e43f6b5bd6192dc23b7.jpeg',
        awards: [1,1,1,0,0],
        totle: 102,
        pnum: 11
      },{
        name: 'iPHONE6',
        thumb: 'https://diycode.b0.upaiyun.com/photo/2017/fc7727985fd40e43f6b5bd6192dc23b7.jpeg',
        awards: [1,1,1,0,0],
        totle: 102,
        pnum: 11
      },{
        name: 'iPHONE6',
        thumb: 'https://diycode.b0.upaiyun.com/photo/2017/fc7727985fd40e43f6b5bd6192dc23b7.jpeg',
        awards: [1,1,1,0,0],
        totle: 102,
        pnum: 11
      },{
        name: 'iPHONE6',
        thumb: 'https://diycode.b0.upaiyun.com/photo/2017/fc7727985fd40e43f6b5bd6192dc23b7.jpeg',
        awards: [1,1,1,0,0],
        totle: 102,
        pnum: 11
      },{
        name: 'iPHONE6',
        thumb: 'https://diycode.b0.upaiyun.com/photo/2017/fc7727985fd40e43f6b5bd6192dc23b7.jpeg',
        awards: [1,1,1,0,0],
        totle: 102,
        pnum: 11
      }],
      loading: false,
      loadMore: () => {
        this.loading = true;
        setTimeout(() => {
          let last = this.list[this.list.length - 1];
          for (let i = 1; i <= 10; i++) {
            this.list.push({
              name: 'iPHONE7',
              thumb: 'https://diycode.b0.upaiyun.com/photo/2017/fc7727985fd40e43f6b5bd6192dc23b7.jpeg',
              awards: [1,1,1,0,0],
              totle: 102,
              pnum: 11
            });
          }
          this.loading = false;
        }, 500);
      }   
    }
  },
  components: {
    RoomCell
  },
  methods: {
 
  }
}
</script>

<style lang="sass">
    
</style>