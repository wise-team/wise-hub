<!-- src/components/views/read/GeneralStatusWidget.vue -->
<template>
    <span class="general-status-widget">
        <b-card
            img-src="/assets/images/michelangelo-moses-wise.jpg"
            img-alt="Image"
            img-top
            tag="article"
        >
            <p v-if="isLoading" class="card-text">
                <font-awesome-icon :icon="loadingIcon" spin /> Loading stats...
            </p>
            <p v-if="error.length > 0" class="card-text text-danger">
                <font-awesome-icon :icon="errorIcon" /> Error loading stats: {{ error }}
            </p>
            <h5 v-if="!isLoading && error.length == 0" class="card-title">The mighty people of Wise:</h5>
            <p v-if="!isLoading && error.length == 0" class="card-text in-numbers">
                <span class="l">brilliant </span><span class="c">{{ votersNumberText }}</span><span class="r"> experts</span>
            </p>
            <p v-if="!isLoading && error.length == 0" class="card-text in-numbers">
                <span class="l">and </span><span class="c">{{ delegatorsNumberText }}</span><span class="r"> delegators</span>
            </p>
            <p v-if="!isLoading && error.length == 0" class="card-text in-numbers">
                <span class="l">who sent </span><span class="c">{{ operationsNumberText }}</span><span class="r"> operations</span>
            </p>
            <p class="card-text">
                <br />
                Join the community:
            </p>
            <b-button :href="loginUrl" variant="primary">Login with Steemconnect</b-button>
        </b-card>
    </span>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { SteemConnectModule } from "../../../store/modules/steemconnect/SteemConnectModule";
import { s } from "../../../store/store";
import { d, assertString, formatBigInt } from "../../../util/util";

export default Vue.extend({
    props: [],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        isLoading(): boolean {
            return s(this.$store).state.status.generalStats.loading;
        },
        error(): string {
            return assertString(d(s(this.$store).state.status.generalStats.error));
        },
        votersNumberText(): string {
              return formatBigInt(s(this.$store).state.status.generalStats.voters);
        },
        delegatorsNumberText(): string {
              return formatBigInt(s(this.$store).state.status.generalStats.delegators);
        },
        operationsNumberText(): string {
              return formatBigInt(s(this.$store).state.status.generalStats.operations);
        },
        loginUrl(): string {
            return s(this.$store).getters[SteemConnectModule.Getters.getLoginUrl];
        },
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
    },
    components: {
    },
});
</script>

<style>
.in-numbers {
    vertical-align: middle;
}

.in-numbers span {
    width: 33%;
    display: inline-block;
    vertical-align: middle;
}

.in-numbers .l {
    text-align: right;
    text-align-last: right;
}

.in-numbers .c {
    text-align: center;
    text-align-last: center;
    font-size: 2.2rem;
}

.in-numbers .r {
    text-align: left;
    text-align-last: left;
}
</style>
