<template>
<div id="roomlist">
  <ul
    v-infinite-scroll="loadMore"
    infinite-scroll-disabled="loading"
    infinite-scroll-distance="100">
    <li v-for="item in list"
        v-bind:key="item">{{ item }}</li>
  </ul>
</div>
</template>

<script>
export default {
  name: 'roomlist',
  data() {
    return {
      list: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],
      loading: false
    }
  },
  methods: {
    loadMore () {
      this.loading = true;
      setTimeout(() => {
        let last = this.list[this.list.length - 1];
        for (let i = 1; i <= 10; i++) {
          this.list.push(last + i);
        }
        this.loading = false;
      }, 500);
    }    
  }
}
</script>

<style lang="sass">

</style>