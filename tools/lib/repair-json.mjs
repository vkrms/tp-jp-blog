// Ремонт JSON после правок агента: модель иногда ставит типографские кавычки “ ” вместо ASCII " на месте
// JSON-разделителей — у ключей (“key”: ) и/или у границ строковых значений (: “текст”,).
//
// Контент легитимно содержит “ ” как обычную типографику ВНУТРИ текста (87+ случаев в опубликованных статьях,
// в том числе в самом начале/конце предложения — «…“you can’t earn”, but…» выглядит ровно как разделитель, но
// это настоящая цитата). Различить «кавычка как разделитель» и «кавычка как типографика» по контексту ненадёжно.
// Но в этом формате (отступ 1 у JSON.stringify) каждое строковое значение, каким бы длинным оно ни было, лежит
// на своей строке целиком — поэтому вместо контекстных догадок берём ПЕРВЫЙ и ПОСЛЕДНИЙ символ именно значения
// (после пропуска `"key": `, если он есть, и конечной запятой) и чиним только их. Это однозначно: у легитимной
// (уже валидной) строки оба эти символа и так ASCII — трогать нечего; у строки, где агент перепутал кавычки,
// хотя бы один из них кривой. Всё, что строго между первым и последним символом значения, не трогаем никогда —
// там типографика внутри текста, и с ней может быть что угодно, это не наша забота.
//
// Чиним только строки, которых не было в содержимом файла на начало запуска (`baseText`) дословно — лишняя
// осторожность (по конструкции выше она и не обязательна: на уже-валидной чужой строке менять всё равно нечего).
// Без `baseText` (например report.json — агент пишет его с нуля, в git его не существует) правим все строки.
//
// Если после ремонта JSON всё равно не разбирается, текст возвращается как был (гейт отклонит результат).

const parses = (t) => { try { JSON.parse(t); return true; } catch { return false; } };
const CURLY_DOUBLE = /[“”„‟]/;
const KEY_PREFIX = /^"[A-Za-z_][A-Za-z0-9_]*"\s*:\s*/; // "ключ":  — ключи в этой схеме всегда ASCII-идентификаторы

/** “key”: → "key": на одной строке — ключи всегда ASCII, поэтому однозначно. */
function fixKeyOnLine(line) {
  let fixed = 0;
  const out = line.replace(/[“”„‟]([A-Za-z_][A-Za-z0-9_]*)[“”„‟](\s*:)/, (_, key, colon) => { fixed++; return `"${key}"${colon}`; });
  return { line: out, fixed };
}

/** Первый и последний символ значения на строке (после "ключ": и до конечной запятой) — если кривая кавычка, чиним. */
function fixValueEdgesOnLine(line) {
  const leadWs = /^\s*/.exec(line)[0].length;
  let end = line.length;
  while (end > leadWs && /\s/.test(line[end - 1])) end--;
  if (end > leadWs && line[end - 1] === ',') end--;
  while (end > leadWs && /\s/.test(line[end - 1])) end--;

  const body = line.slice(leadWs, end);
  const keyMatch = KEY_PREFIX.exec(body);
  const valueStart = leadWs + (keyMatch ? keyMatch[0].length : 0);
  if (valueStart >= end) return { line, fixed: 0 };

  let fixed = 0;
  let out = line;
  const lastIdx = end - 1;
  if (lastIdx > valueStart && CURLY_DOUBLE.test(out[lastIdx])) { out = out.slice(0, lastIdx) + '"' + out.slice(lastIdx + 1); fixed++; }
  if (CURLY_DOUBLE.test(out[valueStart])) { out = out.slice(0, valueStart) + '"' + out.slice(valueStart + 1); fixed++; }
  return { line: out, fixed };
}

/** @returns {{text: string, fixed: number, ok: boolean}} */
export function repairJsonText(text, baseText = null) {
  if (parses(text)) return { text, fixed: 0, ok: true };

  const baseLines = baseText !== null ? new Set(baseText.split('\n')) : null;
  const lines = text.split('\n');
  let fixed = 0;

  for (let i = 0; i < lines.length; i++) {
    if (baseLines && baseLines.has(lines[i])) continue; // дословно как в начале запуска — не трогаем
    if (!CURLY_DOUBLE.test(lines[i])) continue;
    const k = fixKeyOnLine(lines[i]);
    const v = fixValueEdgesOnLine(k.line);
    lines[i] = v.line;
    fixed += k.fixed + v.fixed;
  }

  const candidate = lines.join('\n');
  return { text: candidate, fixed, ok: parses(candidate) };
}
