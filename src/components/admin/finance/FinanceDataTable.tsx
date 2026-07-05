import React from 'react';

export function formatMoney(value: any) {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(numberValue);
}

export function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" && value.length > 42) return `${value.slice(0, 18)}...${value.slice(-10)}`;
  return value;
}

export function StatusBadge({ value }: { value?: any }) {
  const text = String(value || "unknown");
  const tone =
    text.includes("paid") || text.includes("captured") || text.includes("active") || text.includes("rewarded") || text.includes("completed")
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : text.includes("failed") || text.includes("rejected") || text.includes("cancelled")
        ? "bg-red-50 text-red-700 border-red-200"
        : text.includes("pending") || text.includes("processing") || text.includes("eligible")
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {text}
    </span>
  );
}

export function DataTable({
  id,
  rows,
  columns,
  emptyText,
  renderCell,
}: {
  id?: string;
  rows: Record<string, any>[];
  columns: string[];
  emptyText: string;
  renderCell?: (row: any, column: string) => React.ReactNode;
}) {
  if (!rows.length) {
    return (
      <div id={id} className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div id={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {column.replaceAll("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={row.id || index} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column} className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {(() => {
                        const custom = renderCell ? renderCell(row, column) : undefined;
                        if (custom !== undefined) return custom;
                        
                        return (
                            <>
                                {column === "status" || column.endsWith("_status") || column === "event_type" ? (
                                    <StatusBadge value={row[column]} />
                                ) : column.includes("amount") ||
                                    column.includes("balance") ||
                                    column === "total_earned" ||
                                    column === "total_paid_out" ||
                                    column === "gross_amount" ||
                                    column === "final_amount" ||
                                    column === "payout_amount" ? (
                                    formatMoney(row[column])
                                ) : (
                                    formatValue(row[column])
                                )}
                            </>
                        );
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
