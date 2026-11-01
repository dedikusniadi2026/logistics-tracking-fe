import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShipments } from "../../hooks/useDashboard";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/** Build grid of [null | day-number] with Monday as first column */
function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert Sunday-based (0) to Monday-based (0=Mon): (day+6)%7
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);
  // split into weeks
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function CalendarWidget() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { data: shipments = [] } = useShipments();

  // Highlight days that have scheduled or active shipments
  const shipmentDays = new Set<number>();
  const deliveredDays = new Set<number>();
  shipments.forEach((s) => {
    const d = s.estimatedDelivery ?? s.createdAt;
    if (d) {
      const dt = new Date(d);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        if (s.status === "DELIVERED") {
          deliveredDays.add(dt.getDate());
        } else {
          shipmentDays.add(dt.getDate());
        }
      }
    }
  });

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const today = isCurrentMonth ? now.getDate() : -1;

  const weeks = buildCalendar(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Calendar</h3>
          <p className="text-[11px] text-gray-400">{MONTHS[month]} {year}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={12} className="text-gray-500" />
          </button>
          <button
            onClick={nextMonth}
            className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={12} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-2">
        <span className="flex items-center gap-1 text-[10px] text-gray-400">
          <span className="w-2 h-2 rounded-full bg-blue-100 border border-blue-300 inline-block" />
          Scheduled
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-100 border border-green-300 inline-block" />
          Delivered
        </span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="space-y-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5">
            {week.map((day, di) => {
              const isToday      = day === today;
              const isShipment   = day !== null && shipmentDays.has(day) && !isToday;
              const isDelivered  = day !== null && deliveredDays.has(day) && !isToday;
              const isEmpty      = day === null;

              return (
                <div
                  key={di}
                  className={[
                    "aspect-square flex items-center justify-center text-[11px] font-medium rounded-lg transition-colors",
                    isEmpty     ? "" : "cursor-pointer",
                    isToday     ? "bg-blue-600 text-white"               : "",
                    isShipment  ? "bg-blue-100 text-blue-600"            : "",
                    isDelivered ? "bg-green-100 text-green-600"          : "",
                    !isToday && !isShipment && !isDelivered && !isEmpty
                      ? "text-gray-600 hover:bg-gray-100"
                      : "",
                  ].join(" ")}
                >
                  {day ?? ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
