// Ремонт JSON после правок агента: модель иногда ставит типографские кавычки “key” вместо "key" у ключей объектов
// (пробный запуск обновлятора, 2026-11-26). Чиним только ключи — это однозначно; кавычки внутри текста не трогаем.
// Если после ремонта JSON всё равно не разбирается, текст возвращается как был (гейт отклонит результат).

const parses = (t) => { try { JSON.parse(t); return true; } catch { return false; } };

/** @returns {{text: string, fixed: number, ok: boolean}} */
export function repairJsonText(text) {
  if (parses(text)) return { text, fixed: 0, ok: true };
  let fixed = 0;
  const repaired = text.replace(/[“”„‟]([A-Za-z_][A-Za-z0-9_]*)[“”„‟](\s*:)/g, (_, key, colon) => { fixed++; return `"${key}"${colon}`; });
  return parses(repaired) ? { text: repaired, fixed, ok: true } : { text, fixed: 0, ok: false };
}
