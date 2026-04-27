/**
 * Tarjima va transliteratsiya yordamchilari.
 *
 * - uz <-> uzk: lotin <-> kirill (offline transliteratsiya, API kerakmas)
 * - uz/uzk <-> ru: Google Translate (bepul public endpoint)
 *
 * Ishlatish:
 *   import { autoTranslate, translateBetween } from '@/utils/translation'
 *   const { name_uz, name_uzk, name_ru } = await autoTranslate('ru', text)
 */

// ─── 1. UZ (lotin) <-> UZK (kirill) transliteratsiyasi ─────────

const UZ_DIGRAPHS = [
  ["ch", "ч"], ["sh", "ш"], ["yo", "ё"], ["yu", "ю"], ["ya", "я"],
  ["o'", "ў"], ["o`", "ў"], ["o‘", "ў"],
  ["g'", "ғ"], ["g`", "ғ"], ["g‘", "ғ"],
];

const UZ_MONO = {
  a: "а", b: "б", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и",
  j: "ж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ",
  r: "р", s: "с", t: "т", u: "у", v: "в", x: "х", y: "й", z: "з",
  c: "с", w: "в",
};

const UZK_DIGRAPHS_REV = [
  ["ч", "ch"], ["Ч", "Ch"],
  ["ш", "sh"], ["Ш", "Sh"],
  ["ё", "yo"], ["Ё", "Yo"],
  ["ю", "yu"], ["Ю", "Yu"],
  ["я", "ya"], ["Я", "Ya"],
  ["ў", "o'"], ["Ў", "O'"],
  ["ғ", "g'"], ["Ғ", "G'"],
  ["ц", "ts"], ["Ц", "Ts"],
  ["щ", "sch"], ["Щ", "Sch"],
];

const UZK_MONO_REV = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "j", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ҳ: "h", қ: "q",
  ь: "", ъ: "'", э: "e", ы: "i",
};

const matchCase = (src, mapped) => {
  if (!src) return mapped;
  if (src[0] === src[0].toUpperCase()) {
    return mapped.charAt(0).toUpperCase() + mapped.slice(1);
  }
  return mapped;
};

export const uzToUzk = (text) => {
  if (!text) return "";
  let out = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    // 2-harfli kombinatsiyalar
    for (const [pat, repl] of UZ_DIGRAPHS) {
      const slice = text.slice(i, i + pat.length);
      if (slice.toLowerCase() === pat) {
        out += matchCase(slice, repl);
        i += pat.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const ch = text[i];
    const lower = ch.toLowerCase();
    if (UZ_MONO[lower] !== undefined) {
      out += matchCase(ch, UZ_MONO[lower]);
    } else {
      out += ch;
    }
    i++;
  }
  return out;
};

export const uzkToUz = (text) => {
  if (!text) return "";
  let out = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [pat, repl] of UZK_DIGRAPHS_REV) {
      const slice = text.slice(i, i + pat.length);
      if (slice === pat) {
        out += repl;
        i += pat.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const ch = text[i];
    const lower = ch.toLowerCase();
    if (UZK_MONO_REV[lower] !== undefined) {
      const mapped = UZK_MONO_REV[lower];
      out += ch === lower ? mapped : (mapped.charAt(0).toUpperCase() + mapped.slice(1));
    } else {
      out += ch;
    }
    i++;
  }
  return out;
};

// ─── 2. Google Translate (bepul public endpoint) ──────────────

const GT_URL = "https://translate.googleapis.com/translate_a/single";

const cache = new Map();

export const googleTranslate = async (text, from, to) => {
  if (!text || !text.trim()) return "";
  if (from === to) return text;
  const key = `${from}::${to}::${text}`;
  if (cache.has(key)) return cache.get(key);

  const params = new URLSearchParams({
    client: "gtx",
    sl: from,
    tl: to,
    dt: "t",
    q: text,
  });
  try {
    const res = await fetch(`${GT_URL}?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = (data?.[0] || []).map((seg) => seg?.[0] || "").join("");
    cache.set(key, translated);
    return translated;
  } catch (err) {
    console.warn("googleTranslate xatosi:", err);
    return "";
  }
};

// ─── 3. Yuqori darajadagi yordamchi ───────────────────────────

/**
 * `from` tilidan boshqa ikki tilga avtomatik tarjima qiladi.
 * uz <-> uzk transliteratsiya (instant), ru bilan Google Translate.
 *
 * @param {'uz'|'uzk'|'ru'} from - manba til
 * @param {string} text - manba matn
 * @returns {Promise<{name_uz: string, name_uzk: string, name_ru: string}>}
 */
export const autoTranslate = async (from, text) => {
  const result = { name_uz: "", name_uzk: "", name_ru: "" };
  if (!text || !text.trim()) return result;

  if (from === "uz") {
    result.name_uz = text;
    result.name_uzk = uzToUzk(text);
    result.name_ru = await googleTranslate(text, "uz", "ru");
  } else if (from === "uzk") {
    result.name_uzk = text;
    result.name_uz = uzkToUz(text);
    // Google "uzk" ni qabul qilmaydi — kirilldan lotinga aylantirib uz orqali tarjima qilamiz
    result.name_ru = await googleTranslate(result.name_uz, "uz", "ru");
  } else if (from === "ru") {
    result.name_ru = text;
    result.name_uz = await googleTranslate(text, "ru", "uz");
    result.name_uzk = uzToUzk(result.name_uz);
  }

  return result;
};
