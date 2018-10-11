<!-- src/components/Header.vue -->
<template>
        <div id="header-component">
            <div class="text-center header">
                <a href="/"><h1><img src="/assets/images/wise/full-color.svg" alt="Wise"></h1></a>
                <p class="text-muted">
                    Vote delegation system for Steem blockchain
                </p>
            </div>
        </div>
</template>

<script lang="ts">
import Vue from "vue";

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
    },
});
</script>

<style>
    #header-component {
        margin-top: 3rem;
        margin-bottom: 3rem;
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
