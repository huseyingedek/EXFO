import { format } from "date-fns";
import { enGB, nl } from "date-fns/locale";

const locales = { nl, en: enGB } as const;

const dateFormat = (
  date: Date | string,
  lang: keyof typeof locales = "nl",
  pattern: string = "d MMM yyyy",
): string => {
  const dateObj = new Date(date);
  return format(dateObj, pattern, { locale: locales[lang] });
};

export default dateFormat;
