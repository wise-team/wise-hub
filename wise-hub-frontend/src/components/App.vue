<!-- src/components/App.vue -->
<template>
    <b-container class="main-container">
        <b-row>
            <b-col>
                <header-component />
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <footer-component />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import Vue from "vue";

import HeaderComponent from "./Header.vue";
import FooterComponent from "./Footer.vue";

export default Vue.extend({
    props: [],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
    },
    components: {
        HeaderComponent,
        FooterComponent,
    },
});
</script>

<style>
</style>
