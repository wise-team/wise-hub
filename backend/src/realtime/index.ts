import * as fs from "fs";
import * as http from "http";
import * as express from "express";
import { Log } from "../lib/Log";
import * as Redis from "ioredis";
import { common } from "../common/common";
import * as socket_io from "socket.io";
/******************
 **    CONFIG    **
 ******************/
const PORT = /*§ §*/8099/*§ data.config.hub.docker.services.realtime.port §.*/;


/******************
 ** INTIAL SETUP **
 ******************/
Log.log().initialize();

process.on("unhandledRejection", (err) => {
    console.error("Unhandled promise");
    Log.log().error("UNHANDLED PROMISE -> exit");
    Log.log().error(err);
    console.error(err);
    process.exit(1);
});

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("Env REDIS_URL is missing.");
const redis = new Redis(redisUrl);

const app = express();
const server = new http.Server(app);


/*****************
 **   CONNECT   **
 *****************/
const io: socket_io.Server = socket_io(server);

console.log("Redis subscribe to " + common.redis.channels.realtimeKey);
redis.subscribe(common.redis.channels.realtimeKey, (error: any, count: number) => {
    if (error) {
        Log.log().exception(Log.level.error, error);
        process.exit(1);
    }
    else Log.log().info("Subscribe successful, count=" + count);
});
redis.on("message", function (channel: string, message: string) {
    try {
        io.to(common.socketio.rooms.general).emit("msg", message);
        Log.log().debug("io.to(" + common.socketio.rooms.general + ").emit(msg, " + message + ")");

        const msgObj: any = JSON.parse(message);
        if (msgObj.delegator) {
            const delegator = msgObj.delegator;
            io.to(common.socketio.rooms.delegatorBase + delegator).emit("msg", message);
            Log.log().debug("io.to(" + common.socketio.rooms.delegatorBase + delegator + ").emit(msg, " + message + ")");
        }
    }
    catch (error) {
        Log.log().exception(Log.level.error, error);
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
            Log.log().error("Error while joining room " + room + ": " + err);
            Log.log().exception(Log.level.error, err);
        }
        else {
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

process.on("SIGTERM", function () {
    io.close(function () {
        Log.log().info("Graceful shutdown");
        process.exit(0);
    });
});