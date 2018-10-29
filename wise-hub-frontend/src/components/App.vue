<!-- src/components/App.vue -->
<template>
    <div id="main">
        <b-container class="main-container">
            <b-row>
                <b-col>
                    <header-component />
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <navigation-component />
                </b-col>
            </b-row>
            <b-row>
                <b-col class="router-view-container">
                    <router-view></router-view>
                </b-col>
            </b-row>
        </b-container>

        <footer-component />
    </div>
</template>

<script lang="ts">
import Vue from "vue";

import HeaderComponent from "./Header.vue";
import FooterComponent from "./Footer.vue";
import NavigationComponent from "./Navigation.vue";


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
        NavigationComponent
    },
});
</script>

<style>
.router-view-container {
    margin-top: 1rem;
}

#main {
    width: 100%;
}

.main-container {
    min-height: 500px;
    margin-bottom: 4rem;
}

@media (min-height: 850px) {
    .main-container {
        min-height: 650px;
    }
}

@media (min-height: 110px) {
    .main-container {
        min-height: 800px;
    }
}
</style>
