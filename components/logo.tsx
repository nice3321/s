import { cn } from "@/lib/utils";

/**
 * شعار سُفرة النصّي: الكلمة بالكوفي الكحلي والضمّة برتقالية — مطابق للهوية.
 * الضمّة داخل span خاص بها؛ المتصفحات الحديثة تحافظ على اتصال الحروف
 * عبر حدود العناصر المضمّنة، فيبقى الرسم متصلاً واللون منفصلاً.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      dir="rtl"
      className={cn("font-display font-bold leading-none text-ink select-none", className)}
    >
      س<span className="text-saffron">ُ</span>فرة
    </span>
  );
}

/** ضمّة زخرفية — تُستعمل كأيقونة وعنصر خلفية بلون واحد. */
export function Damma({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <path
        d="M33.5 11.5a8.5 8.5 0 1 1-9 8.9"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M24.5 20.5C24.5 30.5 19 35.5 9.5 37"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
