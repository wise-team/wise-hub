import * as Mocha from "mocha";
import * as fs from "fs";
import * as path from "path";
import ow from "ow";
import Axios from "axios";

// envs
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
ow(slackWebhookUrl, ow.string.nonEmpty.label("Env SLACK_WEBHOOK_URL"));

const wiseEnvironmentType = process.env.WISE_ENVIRONMENT_TYPE;
ow(wiseEnvironmentType, ow.string.nonEmpty.label("Env WISE_ENVIRONMENT_TYPE"));

const mentions = process.env.SLACK_MENTIONS;
ow(mentions, ow.string.label("Env SLACK_MENTIONS"));

const failureNotificationIntervalS = process.env.FAILURE_NOTIFICATION_INTERVAL_S;
ow(mentions, ow.string.label("Env FAILURE_NOTIFICATION_INTERVAL_S"));

// config
const failureErrorTTLms = parseInt(failureNotificationIntervalS || "3600") * 1000;
const testFiles: string [] = [
    __dirname + "/monitoring.spec.ts"
];
const failuresTTLFilePath = "/data/failuresttl.json";
const moduleName = "hub-" + wiseEnvironmentType;
const failureLogMarker = "MONITORING_FAILURE_" + moduleName;






(async () => {
    const failures: [string, string] [] = await runTestsReportFailures();
    const failuresToNotify: [string, string] [] = processFailuresNotificationTTL(failures);
    if (failuresToNotify.length > 0) {
        await sendSlackNotification(failuresToNotify);
    }
    console.log(JSON.stringify({ service: "monitoring", environment: wiseEnvironmentType, module: moduleName,
        message: moduleName + " monitoring done at " + (new Date()).toISOString(),
        severity: "info", timestamp: Date.now(), isotime: (new Date()).toISOString()
    }));
})();






function runTestsReportFailures(): Promise<[string, string] []> {
    const failures: [string, string] [] = [];
    const mocha = new Mocha({
        require: [ "ts-node/register" ],
        reporter: function () { /* avoid logs */ },
        
    } as any);
    testFiles.forEach(testFile => mocha.addFile(testFile));
    
    const runner = mocha.run(function(failures) {
        process.exitCode = failures ? -1 : 0;  // exit with non-zero status if there were failures
    });
    
    // runner.on("start", () => { console.log(">>> start"); });
    // runner.on("pass", (test) => { logTest(test.titlePath().join(" >> "), "pass", ""); });
    runner.on("fail", (test, error) => { 
        console.error(JSON.stringify({ 
            service: "monitoring", name: failureLogMarker, environment: wiseEnvironmentType, module: moduleName,
            test: test.titlePath().join(" >> "), error: error + "", severity: "error"
        }));
        failures.push([test.titlePath().join(" >> "), error + ""]); 
    });
    // runner.on("pending", (test) => { logTest(test.titlePath().join(" >> "), "pending", ""); });
    
    return new Promise((resolve, reject) => {
        runner.on("end", () => {
            resolve(failures);
        });
    });
}


interface FailureTTL { test: string; until: number; };

function loadFailureTTLs(): FailureTTL [] {
    let failureTTLs: FailureTTL [] = [];
    try {
        let oldFailureTTLs: FailureTTL [] = [];
        if (fs.existsSync(failuresTTLFilePath)) {
            oldFailureTTLs = JSON.parse(fs.readFileSync(failuresTTLFilePath, "UTF-8"));
            ow(failureTTLs, ow.array.label("failureTTLs").ofType(ow.object.hasKeys("test", "until")));
        }
        oldFailureTTLs.forEach(oldFailureTTL => {
            if (oldFailureTTL.until > Date.now()) failureTTLs.push(oldFailureTTL);
        });
    }
    catch (error) {
        console.error(JSON.stringify({ 
            service: "monitoring", name: failureLogMarker, environment: wiseEnvironmentType, module: moduleName,
            test: "loadFailureTTLs()", error: error + "", severity: "error"
        }));
    }
    return failureTTLs;
}

function saveFailureTTLs(failureTTLs: FailureTTL []) {
    try {
        fs.writeFileSync(failuresTTLFilePath, JSON.stringify(failureTTLs));
    }
    catch (error) {
        console.error(JSON.stringify({ 
            service: "monitoring", name: failureLogMarker, environment: wiseEnvironmentType, module: moduleName,
            test: "saveFailureTTLs()", error: error + "", severity: "error"
        }));
    }
}

function processFailuresNotificationTTL(failures: [string, string] []): [string, string] [] {
    const failureTTLs: FailureTTL [] = loadFailureTTLs();
    const failuresToNotify: [string, string][] = [];

    const deniedFailures: string [] = failureTTLs.map(failureTTLElem => failureTTLElem.test);
    failures.forEach(failure => {
        if (deniedFailures.indexOf(failure[0]) === -1) {
            failuresToNotify.push(failure);
            failureTTLs.push({ test: failure[0], until: Date.now() + failureErrorTTLms });
        }
    });
    
    saveFailureTTLs(failureTTLs);
    return failuresToNotify;
}

async function sendSlackNotification(failures: [string, string] []) {
    const slackMessage = {
        text: moduleName + "monitofing failed " + mentions  + ": " + failures.map(failure => {
            return "[[[ " + failure[0] + " ]]]: " + failure[1] + "\n"
        })
    };
    const response = await Axios.post(slackWebhookUrl + "", slackMessage);
    process.exit(0);
}