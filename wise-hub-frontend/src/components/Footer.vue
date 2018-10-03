<!-- src/components/Footer.vue -->
<template>
    <div>
        <footer class="my-5 pt-3 mt-4 text-muted text-center text-small">
            <strong>More info</strong>, star &amp; fork on
            <!--§ "<b-button variant=\"outline-secondary\" size=\"sm\" href=\"https://github.com/" + d(data.config.githubOrgName) + "/" + d(data.repository.name) + "\">" §--><b-button variant="outline-secondary" size="sm" href="https://github.com/wise-team/wise-hub"><!--§§.-->
                <font-awesome-icon :icon="githubIcon" /> <!--§ d(data.config.githubOrgName) + "/" + d(data.repository.name) §-->wise-team/wise-hub<!--§§.-->
            </b-button>
            <p> </p>
            <p style="font-size: 0.75rem;">
                Copyright &copy; 2018-<!--§ (new Date()).getFullYear() §-->2018<!--§§.-->
                by <!--§ "<a href=\"https://steemit.com/@" + d(data.config.wiseSteemAccount) + "\">@" + d(data.config.wiseSteemAccount) + "</a>" §--><a href="https://steemit.com/@wise-team">@wise-team</a><!--§§.-->
                Under <!--§ d(data.config.license) §-->MIT<!--§§.--> license.
            </p>
        </footer>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import faGithub from "@fortawesome/fontawesome-free-brands/faGithub";

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
