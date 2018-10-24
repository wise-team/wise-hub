<!-- src/components/controls/BehindPanel.vue -->
<template>
    <div>
        <div class="behind-panel">
            <div class="behind-panel-viewport bg-secondary text-light">
                <div class="behind-panel-content container">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { s } from "../../store/store";
import { d } from "../../util/util";

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
});
</script>

<style>
.behind-panel {
    width: 50%;
    margin: 0 auto;
    position: relative;
}

.behind-panel-viewport {
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    box-shadow: inset 0px 11px 8px -10px rgba(0,0,0,0.8), inset 0px -11px 8px -10px rgba(0,0,0,0.8);
}

.behind-panel-content {
    padding-top: 1rem;
    padding-bottom: 1rem;
}
</style>
