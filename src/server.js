import express from "express";
import { Server } from "socket.io";
import path from "path";
import http from "http";

const __dirname = path.resolve();
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", socket => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(wsServer.sockets.adapter);
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done(); 
        socket.to(roomName).emit("welcome", socket.nickname);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", nickname => socket["nickname"] = nickname);
});

/* const sockets = [];

const wss = new WebSocketServer({ server });
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser");
    socket.on("close", () => {
        console.log("Disconnected from the Browser");
    });
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type) {
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`.toString('utf8')));
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
}); */

httpServer.listen(3000, handleListen);
