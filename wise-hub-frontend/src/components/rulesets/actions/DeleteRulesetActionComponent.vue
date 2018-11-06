<!-- src/components/rulesets/actions/DeleteRulesetActionComponent.vue -->
<template>
    <div>
        <h5>Delete ruleset <em>{{ ruleset.name }}</em></h5>
        <b-button @click="deleteRuleset()" size="sm" variant="danger">
            <font-awesome-icon :icon="deleteIcon" /> Confirm delete
        </b-button>
        <hr />
        <p>
            This change is permanent. You will not be able to undo it after you confirm
        </p>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { s } from "../../../store/store";
import { d, ucfirst, uniqueId } from "../../../util/util";
import { RulesetsModule } from "../../../store/modules/rulesets/RulesetsModule";

export default Vue.extend({
    props: [ "setRulesId", "ruleset" ],
    data() {
        return {
            unique: uniqueId()
        };
    },
    methods: {
        deleteRuleset() {
            s(this.$store).dispatch(
                RulesetsModule.Actions.deleteRuleset,
                {
                    rulesetId: this.ruleset.id
                }
            );
        }
    },
    computed: {
        deleteIcon() { return icons.delete; }
    },
    components: {
    },
});
</script>

<style>

</style>
