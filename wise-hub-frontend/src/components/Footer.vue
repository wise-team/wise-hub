<!-- src/components/Footer.vue -->
<template>
    <footer>
        <b-container>
            <b-row>
                <div class="p-2 mt-3 text-center text-small w-100">
                    <strong>More info</strong>, star &amp; fork on
                        <b-button variant="secondary" size="sm"
                            :href="'https://github.com/' + githubOrganization + '/' + repositoryName">
                        <font-awesome-icon :icon="githubIcon" /> {{ githubOrganization + '/' + repositoryName }}
                    </b-button>
                    <p> </p>
                    <p style="font-size: 0.75rem;">
                        Copyright &copy; 2018-{{ new Date().getFullYear() }}
                        by <a :href="'https://steemit.com/@' + wiseTeamSteemAccount">@{{ wiseTeamSteemAccount }}</a>
                        Under {{ licenseCode }} license.
                    </p>
                </div>
            </b-row>
        </b-container>
    </footer>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../icons";
import { d } from "../util/util";

export default Vue.extend({
    props: [],
    data() {
        return {
            githubOrganization: /*§ §*/ "wise-team" /*§ ' "' + data.config.repository.github.organization + '" ' §.*/,
            repositoryName: /*§ §*/ "wise-hub" /*§ ' "' + data.repository.name + '" ' §.*/,
            wiseTeamSteemAccount: /*§ §*/ "wise-team" /*§ ' "' + data.config.team.steem.account + '" ' §.*/,
            licenseCode: /*§ §*/ "MIT" /*§ ' "' + data.config.license.code + '" ' §.*/,
        };
    },
    methods: {
    },
    computed: {
        githubIcon() { return icons.github; },
    },
    components: {
    },
});
</script>

<style>
footer {
    background: url("/assets/images/jan-matejko-copernicus-optimized.jpg") no-repeat top center;
    background-size: cover;
    min-height: 35rem;
    box-shadow: inset 0 12px 12px -7px rgba(0,0,0,1.0);
    border-top: 2px solid black;
    color: rgba(255, 255, 255, 0.75);
}

footer a {
    text-decoration: underline !important;
    color: white !important;
}

footer a:hover {
    text-decoration: none !important;
}
</style>
