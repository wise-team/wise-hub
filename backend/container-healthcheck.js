const watchdog = require("node-docker-watchdog");

const env = process.env.WISE_ENVIRONMENT_TYPE || process.env.ENVIRONMENT_TYPE || process.env.NODE_ENV || "unknown";

console.log("Healthcheck");
watchdog.CliWatchdogHealthcheck({
    project: "wise-hub",
    environment: env
});