<!-- src/components/controls/LoadableIconPhrase.vue -->
<template>
<b-container class="phrase-with-icon-loadable">
    <b-row v-if="loading">
        <b-col cols="auto">
            <font-awesome-icon class="pwil-icon pwil-icon-loading" :icon="loadingIcon" spin />
        </b-col>
        <b-col>
            <p>{{ loadingText }}</p>
        </b-col>
    </b-row>
    <b-row v-else-if="error && error.length > 0">
        <b-col cols="auto">
            <font-awesome-icon class="pwil-icon pwil-icon-error" :icon="errorIcon" />
        </b-col>
        <b-col>
            <p class="pwil-error">{{ error }}</p>
        </b-col>
    </b-row>
    <b-row v-else-if="value">
        <b-col cols="auto">
            <font-awesome-icon class="pwil-icon pwil-icon-yes" :icon="yesIcon" />
        </b-col>
        <b-col>
            <p>{{ yesText }}</p>
        </b-col>
    </b-row>
    <b-row v-else>
        <b-col cols="auto">
            <font-awesome-icon class="pwil-icon pwil-icon-no" :icon="noIcon" />
        </b-col>
        <b-col>
            <p>{{ noText }}</p>
        </b-col>
    </b-row>
</b-container>
</template>

<script lang="ts">
import Vue from "vue";
import faSpinner from "@fortawesome/fontawesome-free-solid/faSpinner";
import faExclamation from "@fortawesome/fontawesome-free-solid/faExclamation";
import { s } from "../../store/store";
import { d } from "../../util/util";

export default Vue.extend({
    props: [ "loading", "loadingText", "value", "yesIcon", "noIcon", "yesText", "noText", "error" ],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        loadingIcon() { return faSpinner; },
        errorIcon() { return faExclamation; },
    },
});
</script>

<style>
.pwil-icon {
    font-size: 2rem;
    font-weight: bold;
}

.pwil-icon-loading {
    color: #b8daff;
}

.pwil-icon-error {
    color: #f5c6cb;
}

.pwil-error {
    color: #f5c6cb;
}

.pwil-icon-yes {
    color: #c3e6cb;
}

.pwil-icon-no {
    color: #f5c6cb;
}
</style>
