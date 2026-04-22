export function useParsenumber(input) {
  const nums = input.replace(/(,|\$|\s)/g, "").trim();
  if (/^\d+(\.(\d+)?)?$/.test(nums)) {
    return Number(nums)
  };
  return nums === "" ? null : Number.NaN;
}

export function useFormatnumber(value) {
  if (value === null) return "";
  const formattedNumber = value.toFixed(2);
  const [integerPart, decimalPart] = formattedNumber.split(".");
  const integerWithSpaces = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const formattedString = decimalPart ? `${integerWithSpaces}.${decimalPart}` : integerWithSpaces;
  return formattedString;
}


export function usePhoneFormat(phoneNumber) {
  if (!phoneNumber) return "";

  // +998 yoki +82 boshidagi raqamlar bo'lsa 0 bilan almashtiramiz
  const normalized = phoneNumber
    .replace(/^\+998/, "998")
  const cleaned = normalized.replace(/\D/g, "");

  // O'zbekiston raqami (998 XX XXX XX XX)
  const uzbekMatch = cleaned.match(/^998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (uzbekMatch) {
    return `+998 ${uzbekMatch[1]} ${uzbekMatch[2]} ${uzbekMatch[3]} ${uzbekMatch[4]}`;
  }

  // Fallback (agar hech biri tushmasa)
  return phoneNumber;
}



export function useSummaFormat(summa, lang = 'ru-RU', room = 2) {
  return new Intl.NumberFormat(lang, {
    style: 'decimal',
    minimumFractionDigits: room
  }).format(summa)
}

export function useStateNumber(plate) {
  if (plate) {
    // Raqam formati: 01 123AA yoki 01 12345AA
    const formattedPlate = plate.replace(/^(\d{2})([A-Z])(\d{3})([A-Z]{2})$/, '$1 $2 $3 $4');
    return formattedPlate;
  }
  return ""
}


export function inputPhoneNumberFormat(value, lang) {
  if (!value) return value;
  let phoneNumber = value.replace(/[^\d]/g, "");

  if (lang === "uz") {
    const len = phoneNumber.length;
    if (len < 4) return `+998${phoneNumber}`;
    if (len < 6) return `+998 (${phoneNumber.slice(0, 2)}`;
    if (len < 9) return `+998 (${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 5)} ${phoneNumber.slice(5)}`;
    return `+998 (${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 5)} ${phoneNumber.slice(5, 7)} ${phoneNumber.slice(7, 9)}`;
  }


  return "+" + phoneNumber;
}
