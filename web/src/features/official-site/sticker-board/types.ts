export type BoardItemData = {
  id: string;
  boardId: string;
  userId: string;
  type: string;
  stickerId: string | null;
  text: string | null;
  textColor: string | null;
  fontSize: number | null;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  user: { id: string; nickname: string; profileImage: string | null };
  sticker: { id: string; imageUrl: string; name: string } | null;
};

export type StickerData = {
  id: string;
  imageUrl: string;
  name: string;
};
