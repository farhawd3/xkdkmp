export const fieldLabelClass =
  "block text-sm font-semibold leading-5 text-slate-700 dark:text-slate-200";

export const fieldControlClass = [
  "w-full rounded-xl border border-slate-200/90 bg-white text-sm text-slate-900 shadow-sm",
  "transition-[border-color,box-shadow,background-color] duration-200",
  "placeholder:text-slate-400 dark:border-slate-700 dark:bg-[#202A39] dark:text-slate-100 dark:placeholder:text-slate-500",
  "hover:border-slate-300 dark:hover:border-slate-600",
  "focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-rose-100/80",
  "dark:focus:border-rose-400 dark:focus:ring-rose-950/50",
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none",
  "dark:disabled:bg-slate-800/70 dark:disabled:text-slate-500",
].join(" ");

export const fieldErrorClass =
  "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:bg-red-950/20 dark:focus:ring-red-950/50";

export const fieldMessageClass = "flex items-start gap-1.5 text-xs leading-5";
