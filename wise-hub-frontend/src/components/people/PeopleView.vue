<!-- src/components/people/PeopleView.vue -->
<template>
    <div id="people-view">
        <h1>The mighty people of wise</h1>
        <!--<p class="text-muted text-center">
            In the order of last activity.
        </p>-->
        <b-alert variant="primary" :show="loading">
            <font-awesome-icon :icon="loadingIcon" spin /> Loading...
        </b-alert>
        <b-alert variant="danger" :show="error.length > 0">
            <font-awesome-icon :icon="errorIcon" /> {{ error }}
        </b-alert>
        <div class="people-list">
            <person-component v-for="op in ops" :key="op.id" :op="op" class="p-2 rounded border mb-2" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { StatusModule } from "../../store/modules/status/StatusModule";
import { s } from "../../store/store";
import * as _ from "lodash";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../util/util";

import { StatusApiHelper } from "../../store/modules/status/StatusApiHelper";

import PersonComponent from "./PersonComponent.vue";

export default Vue.extend({
    props: [],
    data() {
        return {
            loading: true,
            error: "",
            ops: [] as StatusModule.WiseOperation []
        };
    },
    mounted() {
        (async () => {
            try {
                this.loading = true;
                this.error = "";

                const allOps = await StatusApiHelper.loadLatestOperations(800);
                const oneOpPerUserArr: StatusModule.WiseOperation []
                    = _.uniqBy(allOps, (op: StatusModule.WiseOperation) => {
                        return op.operation_type === "set_rules" || op.operation_type === "confirm_vote" ? op.delegator : op.voter;
                    });
                this.ops = oneOpPerUserArr;
                

                this.loading = false;
            }
            catch (error) {
                this.error = error + "";
                this.loading = false;
            }
        })();
    },
    methods: {
    },
    computed: {
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
    },
    components: {
        PersonComponent
    },
});
</script>

<style>
.people-list {
    max-width: 40rem;
    margin: 0 auto;
}
</style>
