<!-- src/components/views/read/GeneralStatusWidget.vue -->
<template>
    <span class="general-status-widget">
        <b-card
            img-src="https://picsum.photos/600/300/?image=25"
            img-alt="Image"
            img-top
            tag="article"
        >
            <p class="card-text">
                Some quick example text to build on the card title and make up the bulk of the card's content.
            </p>
            <b-button href="#" variant="primary">Go somewhere</b-button>
        </b-card>
    </span>
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
</style>
