<template>
    <div id="room-cell">
        <ul
            v-infinite-scroll="loadMore"
            infinite-scroll-disabled="loading"
            infinite-scroll-distance="10">
            <li v-for="rdata in list"
                v-bind:key="rdata"
                v-on:click="joinIn(rdata._id)">
                    <div class="title">{{rdata.name}}</div>
                    <img v-bind:src="rdata.thumb"/>
                    <div class="cblock">
                        <cell v-bind:cells="rdata.awards"></cell>
                    </div>
                    <div class="note">
                        <span>累计中{{rdata.totle}}套</span>
                        <span>{{rdata.pnum}}人热聊中</span>
                    </div>         
                </li>
        </ul>
    </div>
</template>

<script>
import cell from './cell';
export default {
    name: 'room-cell',
    props: [
        'list',
        'loadMore',
        'loading'
    ],
    components: {
        cell
    },
    data() {
        return {
            joinIn: (id) => {
                this.$router.replace(`/detail?id=${id}`);
            }
        }
    },
    methods: {

    }
}
</script>

<style lang="sass">
    #room-cell
        width: 100%;
        margin-top: 0.1rem;
        font-size: 0.216rem
        ul
            margin: 0 0.2rem;
            width: 6rem;
            li
                width: 2.76rem;
                display: inline-block;
                margin: 0.1rem;
                border: 1px solid #000;
                .title
                    color: #111;
                img
                    width: 2.2rem;
                    margin: 0.1rem 0.2rem;
                
</style>