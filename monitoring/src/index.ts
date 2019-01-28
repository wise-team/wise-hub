import * as Mocha from "mocha";
import * as fs from "fs";
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
ow(mentions, ow.string.nonEmpty.label("Env FAILURE_NOTIFICATION_INTERVAL_S"));

// config
const failureErrorTTLms = parseInt(failureNotificationIntervalS || "3600") * 1000;
const testFiles: string[] = [__dirname + "/monitoring.spec.ts"];
const failuresTTLFilePath = "/data/failuresttl.json";
const projectName = "hub-" + wiseEnvironmentType;
const failureLogMarker = "MONITORING_FAILURE_" + projectName;
const logMetadata = {
    service: "monitoring",
    environment: wiseEnvironmentType,
    project: projectName,
};

//

(async () => {
    const failures = await runTestsReportFailures();
    const failuresToNotify: [string, string][] = processFailuresNotificationTTL(failures);
    if (failuresToNotify.length > 0) {
        await sendSlackNotification(failuresToNotify);
        log({
            msg: projectName + " monitoring failed, slack notification sent",
            severity: "info",
        });
    } else {
        log({ msg: projectName + " monitoring done", severity: "info" });
    }
    process.exit(0);
})();

function runTestsReportFailures(): Promise<[string, string][]> {
    const failures: [string, string][] = [];
    const mocha = new Mocha({
        require: ["ts-node/register"],
        reporter: function() {
            /* avoid logs */
        },
    } as any);
    testFiles.forEach(testFile => mocha.addFile(testFile));

    const runner = mocha.run(function(failures) {
        process.exitCode = failures ? -1 : 0; // exit with non-zero status if there were failures
    });

    runner.on("fail", (test, error) => {
        const testTitle = test.titlePath().join(" >> ");
        log({
            msg: "Monitoring test failed: " + testTitle,
            test: testTitle,
            marker: failureLogMarker,
            error: error + "",
            severity: "error",
        });
        failures.push([test.titlePath().join(" >> "), error + ""]);
    });

    return new Promise((resolve, reject) => {
        runner.on("end", () => {
            resolve(failures);
        });
    });
}

interface FailureTTL {
    test: string;
    until: number;
}

function loadFailureTTLs(): FailureTTL[] {
    let failureTTLs: FailureTTL[] = [];
    try {
        let oldFailureTTLs: FailureTTL[] = [];
        if (fs.existsSync(failuresTTLFilePath)) {
            oldFailureTTLs = JSON.parse(fs.readFileSync(failuresTTLFilePath, "UTF-8"));
            ow(failureTTLs, ow.array.label("failureTTLs").ofType(ow.object.hasKeys("test", "until")));
        }
        oldFailureTTLs.forEach(oldFailureTTL => {
            if (oldFailureTTL.until > Date.now()) failureTTLs.push(oldFailureTTL);
        });
    } catch (error) {
        log({ msg: "Could not load failures ttls", error: error, severity: "error" });
    }
    return failureTTLs;
}

function saveFailureTTLs(failureTTLs: FailureTTL[]) {
    try {
        fs.writeFileSync(failuresTTLFilePath, JSON.stringify(failureTTLs));
    } catch (error) {
        log({ msg: "Could not save failures ttls", error: error, severity: "error" });
    }
}

function processFailuresNotificationTTL(failures: [string, string][]): [string, string][] {
    const failureTTLs: FailureTTL[] = loadFailureTTLs();
    const failuresToNotify: [string, string][] = [];

    const deniedFailures: string[] = failureTTLs.map(failureTTLElem => failureTTLElem.test);
    failures.forEach(failure => {
        if (deniedFailures.indexOf(failure[0]) === -1) {
            failuresToNotify.push(failure);
            failureTTLs.push({ test: failure[0], until: Date.now() + failureErrorTTLms });
        }
    });

    saveFailureTTLs(failureTTLs);
    return failuresToNotify;
}

async function sendSlackNotification(failures: [string, string][]) {
    const failuresListedText = failures.map(failure => {
        return "[[[ " + failure[0] + " ]]]: " + failure[1] + "\n";
    });
    const slackText = projectName + " monitofing failed " + mentions + ": " + failuresListedText;
    const slackMessage = { text: slackText };
    try {
        const response = await Axios.post(slackWebhookUrl + "", slackMessage);
    } catch (error) {
        log({
            error: error,
            severity: "error",
            msg: "Could not send slack notification",
            slackResponse: error.response
                ? { data: error.response.data, status: error.response.status }
                : "no response",
        });
    }
}

function log(msg: { error?: Error | string; msg: string; severity: string; [x: string]: any }) {
    console.error(
        JSON.stringify({
            message: msg.msg,
            ...(msg.error ? { error: msg.error + "" } : {}),
            ...(msg.error instanceof Error ? { stack: msg.error.stack + "" } : {}),
            severity: msg.severity,
            timestamp: Date.now(),
            isotime: new Date().toISOString(),
            ...logMetadata,
        })
    );
}
