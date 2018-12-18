<!-- src/components/rulesets/actions/RenameRulesetActionComponent.vue -->
<template>
    <div>
        <h5>Rename ruleset</h5>
        <b-input-group prepend="Name">
            <b-form-input v-model="rulesetName" class="t-renameruleset-name-input"></b-form-input>
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
import { d, ucfirst } from "../../../util/util";
import { NormalizedRulesets } from "../../../store/modules/rulesets/NormalizedRulesets";
import { RulesetsModule } from "../../../store/modules/rulesets/RulesetsModule";

export default Vue.extend({
    props: [ "setRulesId", "ruleset" ],
    data() {
        return {
            error: ""
        };
    },
    methods: {
    },
    computed: {
        rulesetName: {
            get(): string {
                return this.ruleset.name;
            },
            set(value: string): void {
                try {
                    s(this.$store).dispatch(RulesetsModule.Actions.renameRuleset, { rulesetId: this.ruleset.id, name: value });
                }
                catch (error) {
                    console.error(error);
                    this.error = error + ": " + error.message;
                }
            }
        }
    },
    components: {
    },
});
</script>

<style>

</style>
