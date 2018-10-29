<!-- src/components/views/rulesets/PublishRulesetsComponent.vue -->
<template>
    <div class="publish-rulesets-component">
        <h5>
            Upload rulesets
        </h5>
        <p>
            You are about to upload rulesets for the following voters:
            <ul>
                <li v-for="setRules in setRulesArray" :key="setRules.id">
                    <strong>@{{ setRules.voter }}</strong>:
                    ({{ setRules.rulesets.length === 0 ? "remove all" : setRules.rulesets.length + " rulesets" }})
                </li>
            </ul>
        </p>
        <p>
            Verify if this is correct. The following operations will be sent to the blockchain:
        </p>

        <p v-if="operationsError.length > 0" class="text-danger">
            Error generationg operations JSON: {{ operationsError }}. If you cannot resolve this, please contact the wise-team.
        </p>
        <p v-else-if="operationsLoading" class="text-center">
            <font-awesome-icon :icon="loadingIcon" /> generating operations to be sent to blockchain...
        </p>
        <p v-else class="blockchain-ops">
            <pre>{{ operationsToBePublished | json }}</pre>
        </p>
        <p>
            <b-button variant="primary" disabled>Send with steemconnect</b-button>
            <b-button variant="primary" disabled>Send with Vessel</b-button>
            <b-button variant="primary" disabled>Provide posting key and send</b-button>
        </p>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as _ from "lodash";
import * as steem from "steem";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d, ucfirst, uniqueId } from "../../util/util";
import { DelayedExecutor } from "../../util/DelayedExecutor";

import { NormalizedRulesets } from "../../store/modules/rulesets/NormalizedRulesets";
import { RulesetsModule } from "../../store/modules/rulesets/RulesetsModule";
import { Wise, RulesUpdater, SetRulesForVoter } from "steem-wise-core";

const generateOpsExecutor = new DelayedExecutor(1200);

export default Vue.extend({
    props: [ "ids" ],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        setRulesArray(): NormalizedRulesets.NormalizedSetRulesForVoter [] {
            return this.ids.map((setRulesId: string) => 
                this.$store.state.rulesets.normalizedRulesets.entities.setRules[setRulesId]);
        },
        operationsLoading(): boolean {
            return s(this.$store).state.rulesets.operationsToBePublished.loading;  
        },
        operationsError(): string {
            let error = s(this.$store).state.rulesets.operationsToBePublished.error || "";
            this.ids.forEach((setRulesId: string) => {
                const srfv = s(this.$store).state.rulesets.operationsToBePublished.operations[setRulesId];
                if (srfv && srfv.error.length > 0) error = srfv.error;
            });
            return error;  
        },
        operationsToBePublished(): steem.OperationWithDescriptor [] {
            const ops: steem.OperationWithDescriptor [] = 
                this.ids.map((setRulesId: string) => {
                    return s(this.$store).state.rulesets.operationsToBePublished.operations[setRulesId].ops || [];
                });
            return ops;
        },
        sendEnabled(): boolean {
            return !this.operationsLoading && this.operationsToBePublished.length > 0;
        },
        loadingIcon() { return icons.loading; },
    },
    components: {
    },
    filters: {
        ucfirst: ucfirst,
        json: (str: string) => JSON.stringify(str, undefined, 2)
    }
});
</script>

<style>
.blockchain-ops {
    overflow-x: scroll;
    max-width: 100%;
    display: block;
}
</style>
