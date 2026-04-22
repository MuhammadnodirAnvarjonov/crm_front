import dayjs from 'dayjs'

export function formatMyDate(input, format = "YYYY-MM-DD HH:mm:ss") {
  if (!input) return "";

  let d;
  // Timestamp (10 xonali) bo'lsa millisekundga o'tkazish
  if (typeof input === 'number' && input.toString().length === 10) {
    d = dayjs(input * 1000);
  } else {
    d = dayjs(input);
  }

  if (!d.isValid()) return "Invalid Date";

  return d.format(format);
};
