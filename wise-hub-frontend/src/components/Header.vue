<!-- src/components/Header.vue -->
<template>
        <div id="header-component">
            <div class="text-center header">
                <a href="/"><h1 class="title"><img src="/assets/images/wise/full-color.svg" alt="Wise"></h1></a>
                <p class="text-muted">
                    Vote delegation system for 
                    <span v-if="username.length > 0">@{{ username }}</span>
                    <span v-else>Steem</span>
                </p>
            </div>
        </div>
</template>

<script lang="ts">
import Vue from "vue";
import { s } from "../store/store";
import { d } from "../util/util";

export default Vue.extend({
    props: [],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        username(): string {
            return d(s(this.$store).state.auth.username);
        }
    },
    components: {
    },
});
</script>

<style>
    #header-component {
        margin-top: 3rem;
        margin-bottom: 3rem;
    }

    #header-component h1 {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
    }

    #header-component h1 img {
        max-height: 5rem;
        max-width: 90%;
    }

    #header-component p {
        font-size: 0.75rem;
        line-height: 1.53;
        letter-spacing: 0.2rem;
        margin-bottom: 0;
    }
</style>
