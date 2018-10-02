<!-- src/components/Header.vue -->
<template>
        <div>
            <div class="text-center header">
                <a href="/"><img class="d-block mx-auto mb-4" src="assets/wise-logo.png" alt="Wise Vote"></a>
                <p class="lead">
                    Wise hub
                </p>
            </div>
        </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Actions } from "../store/actions";

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
</style>
