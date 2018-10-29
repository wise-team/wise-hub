<!-- src/components/Footer.vue -->
<template>
    <footer>
        <b-container>
            <b-row>
                <div class="p-2 mt-3 text-center text-small w-100">
                    <strong>More info</strong>, star &amp; fork on
                        <b-button variant="secondary" size="sm"
                            :href="'https://github.com/' + wise.config.repository.github.organization + '/' + wise.repository.name">
                        <font-awesome-icon :icon="githubIcon" /> {{ wise.config.repository.github.organization + '/' + wise.repository.name }}
                    </b-button>
                    <p> </p>
                    <p style="font-size: 0.75rem;">
                        Copyright &copy; 2018-{{ new Date().getFullYear() }}
                        by <a :href="'https://steemit.com/@' + wise.config.team.steem.account">@{{ wise.config.team.steem.account }}</a>
                        Under {{ wise.config.license.code }} license.
                    </p>
                </div>
            </b-row>
        </b-container>
    </footer>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../icons";
import { data as wise } from "../wise-config.gen";
import { d } from "../util/util";

export default Vue.extend({
    props: [],
    data() {
        return {
            wise: wise
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
