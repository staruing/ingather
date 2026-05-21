export type BoardEventType = "create" | "update" | "delete";

export type BoardEvent = {
  type: BoardEventType;
  item: Record<string, unknown>;
};

type GlobalBoard = {
  io?: import("socket.io").Server;
};

export function getGlobalBoard(): GlobalBoard {
  return globalThis as unknown as GlobalBoard;
}

export function emitBoardEvent(event: BoardEvent) {
  const io = getGlobalBoard().io;
  if (io) {
    io.to("board:main").emit("board:event", event);
  }
}
