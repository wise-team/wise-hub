<!-- src/components/rulesets/actions/ChangeRulesetVoterActionComponent.vue -->
<template>
    <div>
        <h5>Change voter</h5>
        <b-input-group prepend="@">
            <b-form-input v-model="voter" :disabled="loading"></b-form-input>
            <b-button @click="changeVoter()" variant="primary">
                <font-awesome-icon v-if="loading" :icon="loadingIcon" spin />
                Change
            </b-button>
        </b-input-group>
        <span class="text-danger">{{ error }}</span>
        <hr />
        <small>
            This change takes effect as you type, but is temporary. It will disappear when you refresh the page. 
            To make it persistent upload rulesets for this voter (violet box).
        </small>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { s } from "../../../store/store";
import { d, ucfirst, uniqueId } from "../../../util/util";
import { RulesetsModule } from "../../../store/modules/rulesets/RulesetsModule";
import { AuthModuleApiHelper } from "../../../store/modules/auth/AuthModuleApiHelper";

export default Vue.extend({
    props: [ "setRulesId", "ruleset" ],
    data() {
        return {
            error: "",
            loading: false,
            voter: s(this.$store).state.rulesets.normalizedRulesets.entities.setRules[this.setRulesId].voter
        };
    },
    methods: {
        changeVoter() {
            (async () => {
                try {
                    this.loading = true;
                    const accountExists = await AuthModuleApiHelper.accountExists(this.voter);
                    if (accountExists) {
                        /*s(this.$store).dispatch(
                            RulesetsModule.Actions.changeRulesetVoter,
                            { setRulesId: this.setRulesId, rulesetId: this.ruleset.id, voter: this.voter }
                        );*/
                        this.loading = false;
                        this.error = "";
                    }
                    else {
                        this.loading = false;
                        this.error = "Account @" + this.voter + " does not exist";
                        console.error(this.error);
                    }
                }
                catch(error) {
                    this.error = error + ": " + error.message;
                    this.loading = false;
                    console.error(error);
                }
            })();
        }
    },
    computed: {
        loadingIcon() { return icons.loading; }
    },
    components: {
    },
});
</script>

<style>

</style>
