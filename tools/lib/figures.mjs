// Validation for in-article figure blocks (docs/figures.md).
// The template registry lives in tools/figures/templates.json so the Astro renderer
// (astro/src/data/figures.ts) and this validator check exactly the same ids and fields.
// Mixed into tools/validate.mjs; covered by tools/figures.test.mjs.

export const manifestUrl = new URL('../figures/templates.json', import.meta.url);

/** ja+en pair: [ja, en] or {ja, en}, both non-empty. */
export const isText = (v) =>
  Array.isArray(v)
    ? v.length === 2 && v.every((x) => typeof x === 'string' && x.trim() !== '')
    : !!v && typeof v === 'object'
      && !Array.isArray(v)
      && typeof v.ja === 'string' && v.ja.trim() !== ''
      && typeof v.en === 'string' && v.en.trim() !== '';

const isDate = (v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

const typeOk = (type, v) => {
  switch (type) {
    case 'text': return isText(v);
    case 'string': return typeof v === 'string' && v.trim() !== '';
    case 'number': return typeof v === 'number' && Number.isFinite(v);
    case 'date': return isDate(v);
    case 'array': return Array.isArray(v);
    default: return false;
  }
};

/** Value(s) at a spec path such as `items` or `items[].label` (missing ones are filtered by the caller). */
const expand = (data, path) => {
  let cur = [data];
  for (const seg of path.split('.')) {
    const iterate = seg.endsWith('[]');
    const key = seg.slice(0, iterate ? -2 : undefined);
    const next = [];
    for (const node of cur) {
      if (node === null || typeof node !== 'object') continue;
      const value = node[key];
      if (iterate) {
        if (Array.isArray(value)) next.push(...value);
      } else next.push(value);
    }
    cur = next;
  }
  return cur;
};

const FIELD = /^([A-Za-z0-9_]+)(\[\])?(?:\.([A-Za-z0-9_]+))?$/;

/** Errors for `figure.data` against the template's spec (shape, types, min/max, stray keys). */
function dataErrors(data, template) {
  const errors = [];
  const spec = template?.data ?? {};
  const top = new Set();
  /** array head -> allowed keys of its items */
  const itemKeys = new Map();

  for (const path of Object.keys(spec)) {
    const m = path.match(FIELD);
    if (!m) continue;
    const [, head, iterate, leaf] = m;
    top.add(head);
    if (iterate && leaf) {
      if (!itemKeys.has(head)) itemKeys.set(head, new Set());
      itemKeys.get(head).add(leaf);
    }
  }

  for (const key of Object.keys(data)) if (!top.has(key)) errors.push(`figure: лишнее поле data.${key}`);

  for (const [path, rule] of Object.entries(spec)) {
    const values = expand(data, path).filter((v) => v !== undefined);
    if (values.length === 0) {
      if (!rule.optional) errors.push(`figure: нет data.${path}`);
      continue;
    }
    for (const v of values) {
      if (!typeOk(rule.type, v)) errors.push(`figure: data.${path} — неверный тип (ожидается ${rule.type})`);
      else if (rule.type === 'array') {
        if (rule.min != null && v.length < rule.min) errors.push(`figure: data.${path} — минимум ${rule.min} (сейчас ${v.length})`);
        if (rule.max != null && v.length > rule.max) errors.push(`figure: data.${path} — максимум ${rule.max} (сейчас ${v.length})`);
      }
    }
  }

  for (const [head, keys] of itemKeys) {
    if (!Array.isArray(data[head])) continue;
    data[head].forEach((item, i) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        errors.push(`figure: data.${head}[${i}] — должен быть объектом`);
        return;
      }
      for (const key of Object.keys(item)) {
        if (!keys.has(key)) errors.push(`figure: лишнее поле data.${head}[${i}].${key}`);
      }
    });
  }

  return errors;
}

const FIELDS = new Set(['kind', 'template', 'data', 'alt', 'caption', 'brief', 'facts']);

/** All errors for one `figure` block. Empty array = valid. */
export function validateFigure(figure, manifest) {
  const errors = [];
  if (!figure || typeof figure !== 'object' || Array.isArray(figure)) {
    return ['figure: должен быть объектом'];
  }

  for (const key of Object.keys(figure)) {
    if (!FIELDS.has(key)) errors.push(`figure: неизвестное поле «${key}» (можно: ${[...FIELDS].join(', ')})`);
  }

  const kinds = Object.keys(manifest.kinds ?? {});
  const template = figure.template ? manifest.templates?.[figure.template] : undefined;

  if (!figure.kind) errors.push('figure: нет kind');
  else if (!kinds.includes(figure.kind)) errors.push(`figure: kind «${figure.kind}» не из списка (${kinds.join(', ')})`);

  if (!figure.template) errors.push('figure: нет template');
  else if (!template) errors.push(`figure: шаблона «${figure.template}» нет в tools/figures/templates.json`);

  if (template && figure.kind && template.kind !== figure.kind) {
    errors.push(`figure: у шаблона «${figure.template}» kind «${template.kind}», а в блоке «${figure.kind}»`);
  }

  const raster = (manifest.raster_kinds ?? []).includes(figure.kind);

  if (raster) {
    if (!isText(figure.alt)) errors.push('figure: растровой фигуре нужен alt на ja и en');
    if (!figure.brief) errors.push('figure: растровой фигуре нужен brief (сцена для генератора)');
    if (figure.data !== undefined) errors.push('figure: растровая фигура не использует data (сцена — в brief)');
  } else if (template) {
    if (template.caption === 'required' && !isText(figure.caption)) {
      errors.push('figure: этому шаблону нужен caption на ja и en (вывод под фигурой)');
    }
    if (!figure.data || typeof figure.data !== 'object' || Array.isArray(figure.data)) {
      errors.push('figure: нет data (объект по схеме шаблона)');
    } else {
      errors.push(...dataErrors(figure.data, template));
    }
    if (figure.brief !== undefined) errors.push('figure: brief — только для растровых фигур');
  }

  if (figure.alt !== undefined && !isText(figure.alt)) errors.push('figure: alt должен быть парой ja/en');
  if (figure.caption !== undefined && !isText(figure.caption)) errors.push('figure: caption должен быть парой ja/en');
  if (figure.facts !== undefined && (!Array.isArray(figure.facts) || !figure.facts.every((x) => typeof x === 'string' && x.trim()))) {
    errors.push('figure: facts — массив id фактов');
  }

  return errors;
}
