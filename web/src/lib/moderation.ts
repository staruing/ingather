const BANNED_WORDS = ["spam", "광고"];

export const MAX_TEXT_LENGTH = 24;

export function validateBoardText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "텍스트를 입력해 주세요.";
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return `텍스트는 ${MAX_TEXT_LENGTH}자 이하여야 합니다.`;
  }
  const lower = trimmed.toLowerCase();
  if (BANNED_WORDS.some((w) => lower.includes(w))) {
    return "사용할 수 없는 단어가 포함되어 있습니다.";
  }
  if (/https?:\/\//i.test(trimmed)) {
    return "URL은 텍스트에 포함할 수 없습니다.";
  }
  return null;
}
