import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { getGlobalBoard } from "./src/lib/board-events";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: "/api/socketio",
    cors: { origin: "*" },
  });

  getGlobalBoard().io = io;

  io.on("connection", (socket) => {
    socket.join("board:main");
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port} (Socket.io enabled)`);
  });
});
