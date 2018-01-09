<template>
    <div id="cell">
        <ul>
            <li v-for="light in cells"
                    v-bind:key="light"
                    v-bind:class="{ lig: light, nolig: !light }">
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'cell',
    props: [
        'cells'
    ],
    data() {
        return {

        }
    },
    methods: {

    }
}
</script>

<style lang="sass">
    #cell
        background: #fff;
        ul
            margin: 0;
            width: 2.76rem;
            li
                width: 0.3rem;
                height: 0.3rem;
                margin: 0.08rem;
                border: 1px solid #444;
    .lig
        background-color: #33cd5f;  
    .nolig
        background-color: #dddddd;                 
</style>