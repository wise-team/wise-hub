<!-- src/components/Footer.vue -->
<template>
    <div>
        <footer class="my-5 pt-3 mt-4 text-muted text-center text-small">
            <strong>More info</strong>, star &amp; fork on
                <b-button variant="outline-secondary" size="sm"
                    :href="'https://github.com/' + d(wise.config.repository.github.organization) + '/' + d(wise.repository.name)">
                <font-awesome-icon :icon="githubIcon" /> {{ d(wise.config.repository.github.organization) + '/' + d(wise.repository.name) }}
            </b-button>
            <p> </p>
            <p style="font-size: 0.75rem;">
                Copyright &copy; 2018-{{ new Date().getFullYear() }}
                by <a :href="'https://steemit.com/@' + d(wise.config.team.steem.account)">@ {{ d(wise.config.team.steem.account) }} </a>
                Under {{ d(data.config.license) }} license.
            </p>
        </footer>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import faGithub from "@fortawesome/fontawesome-free-brands/faGithub";
import { data as wise } from "../wise-config.gen";
import { d } from "../util/util";

export default Vue.extend({
    props: [],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        githubIcon() {
            return faGithub;
        },
    },
    components: {
    },
});
</script>

<style>
</style>
