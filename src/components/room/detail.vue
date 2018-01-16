<template>
<div id="roomlist">
  <room-cell v-bind:list="list"
    v-bind:loadMore="loadMore"></room-cell>
</div>
</template>

<script>
import RoomCell from './RoomCell';
import _ from 'underscore';

export default {
  name: 'roomlist',
  data() {
    return {
      storeRooms: {},
      list: [],
      loading: false,
      page: 1,
      loadMore: () => {
        this.getRooms();
      }
    }
  },
  created() {
    this.getRooms();
  },
  components: {
    RoomCell
  },
  methods: {
    
    getRooms() {
      if(this.loading) return;

      this.loading = true;
      let apiToken = this.$cookie.get('clickme-apiToken');
      let page = this.page;

      this.$store.dispatch('fetchRoomList', {
        page,
        apiToken
      })
      .then((data) => {
        if(data.code && data.rooms.length > 0) {
          this.storeRooms = _.indexBy(this.list, '_id');;
          let newRooms = _.indexBy(data.rooms, '_id');
          _.extend(this.storeRooms, newRooms);
          this.list = _.values(this.storeRooms);
          if(data.rooms.length === 10) {
            this.page++;
          }
        }

        setTimeout(() => {
          this.loading = false;
        }, 1000);
      });
    }
  }
}
</script>

<style lang="sass">
    
</style>