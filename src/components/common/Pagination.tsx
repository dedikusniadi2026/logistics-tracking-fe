import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalItems: number;
  perPage: number | "all";
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number | "all") => void;
}

const PER_PAGE_OPTIONS = [5, 10, 20, 50, "all"] as const;

export default function Pagination({
  page,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const isAll = perPage === "all";
  const actualPerPage = isAll ? totalItems : perPage;
  const totalPages = Math.max(1, Math.ceil(totalItems / actualPerPage));
  const start = isAll ? 1 : (page - 1) * perPage + 1;
  const end = isAll ? totalItems : Math.min(page * perPage, totalItems);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      {/* Left: per-page selector & item count */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Rows per page:</label>
          <select
            value={perPage}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "all") {
                onPerPageChange("all");
              } else {
                onPerPageChange(Number(val));
              }
              onPageChange(1);
            }}
            className="text-xs bg-gray-100 border-0 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium cursor-pointer"
          >
            {PER_PAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all" ? "All" : opt}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-400">
          {start}–{end} of{" "}
          <span className="font-semibold text-gray-700">{totalItems}</span>
        </p>
      </div>

      {/* Right: page navigation (hidden when showing all) */}
      {!isAll && (
        <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={13} className="text-gray-600" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "...")[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="w-7 h-7 flex items-center justify-center text-xs text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                  page === p
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={13} className="text-gray-600" />
        </button>
      </div>
      )}
    </div>
  );
}
