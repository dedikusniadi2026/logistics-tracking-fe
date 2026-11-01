import { Star, ArrowUpRight, Users } from "lucide-react";
import { useDashboardStats, useDrivers } from "../../hooks/useDashboard";

export default function RatingCard() {
  const { data: stats } = useDashboardStats();
  const { data: drivers } = useDrivers();

  // Prefer explicit rating field from stats
  const rating: number | null =
    stats?.rating ?? stats?.averageRating ?? stats?.average_rating ?? null;

  const reviewCount: number | null =
    stats?.reviewCount ?? stats?.review_count ?? stats?.totalReviews ?? null;

  // Fallback metric: available drivers count
  const availableDrivers =
    drivers?.filter((d) => d.status === "AVAILABLE").length ?? null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold text-gray-900">
          {rating !== null ? "Rating" : "Available Drivers"}
        </h3>
        <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowUpRight size={12} className="text-gray-400" />
        </button>
      </div>

      {rating !== null ? (
        <>
          <p className="text-xs text-gray-400 mb-3">
            Based on {reviewCount != null ? `${reviewCount} reviews` : "reviews"}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-gray-900 leading-none">
              {Number(rating).toFixed(1)}
            </span>
            <Star size={22} className="fill-yellow-400 text-yellow-400" />
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">Drivers ready for dispatch</p>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-gray-900 leading-none">
              {availableDrivers ?? "—"}
            </span>
            <Users size={22} className="text-blue-500" />
          </div>
        </>
      )}
    </div>
  );
}
