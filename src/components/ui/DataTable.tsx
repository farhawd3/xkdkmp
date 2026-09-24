import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  isNumeric?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Belum ada data untuk ditampilkan.",
  className,
}: DataTableProps<T>) {
  return (
    <div
      role="region"
      aria-label="Tabel data, dapat digulir horizontal"
      tabIndex={0}
      className={cn(
        "w-full overflow-x-auto rounded-[20px] border border-slate-200/90 bg-white shadow-[var(--card-shadow)] dark:border-slate-700 dark:bg-[#252F40]",
        className
      )}
    >
      <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
        <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/65 text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-3.5 whitespace-nowrap",
                  col.align === "right" || col.isNumeric
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="transition-colors hover:bg-rose-50/40 dark:hover:bg-slate-800/60"
              >
                {columns.map((col) => {
                  const alignClass =
                    col.align === "right" || col.isNumeric
                      ? "text-right tabular-nums font-semibold text-slate-900 dark:text-slate-100"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left";

                  return (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3.5 whitespace-nowrap", alignClass, col.className)}
                    >
                      {col.render
                        ? col.render(row)
                        : (row as Record<string, unknown>)[col.key] !== undefined
                        ? String((row as Record<string, unknown>)[col.key])
                        : "-"}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
