// tslint:disable no-console
import * as express from "express";
import * as http from "http";
import * as Redis from "ioredis";
import * as socket_io from "socket.io";

import { common } from "../common/common";
import { Log } from "../lib/Log";

import { Watchdogs } from "./Watchdogs";
/******************
 **    CONFIG    **
 ******************/
const PORT = /*§ §*/ 8099 /*§ data.config.hub.docker.services.realtime.port §.*/;

/******************
 ** INTIAL SETUP **
 ******************/
Log.log().initialize();
const watchdogs = new Watchdogs();
watchdogs.start();

process.on("unhandledRejection", err => {
    console.error("Unhandled promise");
    Log.log().error("UNHANDLED PROMISE -> exit");
    Log.log().error(err);
    console.error(err);
    process.exit(1);
});

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("Env REDIS_URL is missing.");
const subRedis = new Redis(redisUrl);
const redis = new Redis(redisUrl);

const app = express();
const server = new http.Server(app);

/*****************
 **   CONNECT   **
 *****************/
const io: socket_io.Server = socket_io(server, {
    path: "/realtime/socket.io",
});

Log.log().info("Redis subscribe to " + common.redis.channels.realtimeKey);
subRedis.subscribe(common.redis.channels.realtimeKey, (error: any, count: number) => {
    if (error) {
        Log.log().error("realtime/index.ts#subRedis.subscribe", error, {
            channel: common.redis.channels.realtimeKey,
            count,
        });
        process.exit(1);
    } else Log.log().info("Subscribe successful, count=" + count);
});
subRedis.on("message", function(channel: string, message: string) {
    try {
        watchdogs.redisMessageBeatHours(5);
        io.to(common.socketio.rooms.general).emit("msg", message);
        Log.log().debug("io.to(" + common.socketio.rooms.general + ").emit(msg, " + message + ")");

        const msgObj: any = JSON.parse(message);
        if (msgObj.delegator) {
            const delegator = msgObj.delegator;
            io.to(common.socketio.rooms.delegatorBase + delegator).emit("msg", message);
            Log.log().debug(
                "io.to(" + common.socketio.rooms.delegatorBase + delegator + ").emit(msg, " + message + ")",
            );
        }
    } catch (error) {
        Log.log().error("realtime/index.ts#subRedis.onMessage error in message processing", error, {
            channel: common.redis.channels.realtimeKey,
            message,
        });
    }
});
Log.log().info("Wise realtime is operational");

/*****************
 **     APP     **
 *****************/
app.get("/", function(req, res) {
    res.send("This is a realtime server");
});

io.on("connection", function(socket) {
    const query: any = socket.handshake.query;
    const delegator = query.delegator;

    let room = common.socketio.rooms.general;
    if (delegator && delegator.length > 0 && delegator !== "undefined") {
        room = common.socketio.rooms.delegatorBase + delegator;
    }
    socket.join(room, (err: any) => {
        if (err) {
            Log.log().error("realtime/index.ts#io.on(connection).socket.join error while joining room", err, {
                room,
                query,
            });
        } else {
            Log.log().info("Client joined room '" + room + "'");
        }
    });
});

/****************
 **   SERVER   **
 ****************/
server.listen(PORT, () => {
    Log.log().info("Listening on " + PORT);
});

process.on("SIGTERM", function() {
    io.close(function() {
        Log.log().info("Graceful shutdown");
        process.exit(0);
    });
});

// hartbeat
function hartbeat() {
    (async () => {
        try {
            watchdogs.heartbeatBeatSeconds(12);
            await redis.set(common.redis.realtimeHartbeat, "ALIVE", "EX", 10);
        } catch (error) {
            Log.log().error("realtime/index.ts#hartbeat", error);
        }
    })();

    setTimeout(() => hartbeat(), 5000);
}
hartbeat();
