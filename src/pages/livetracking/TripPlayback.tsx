import { Play, Pause, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LiveVehicle } from "../../types/livetracking";

interface Props {
  route: [number, number][];  // [lng, lat][]
  vehicle: LiveVehicle | null;
  onProgress: (idx: number) => void;
}

export default function TripPlayback({ route, vehicle, onProgress }: Props) {
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = route.length;

  const stop = () => {
    setPlaying(false);
    setIdx(0);
    onProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const pause = () => {
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const play = () => {
    if (total === 0) return;
    if (idx >= total - 1) setIdx(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setIdx((prev) => {
          const next = prev + 1;
          if (next >= total) {
            setPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return total - 1;
          }
          onProgress(next);
          return next;
        });
      }, 300);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, total, onProgress]);

  // reset when route changes
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  if (!vehicle || total === 0) return null;

  const progress = total > 1 ? Math.round((idx / (total - 1)) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-semibold text-gray-800">Trip Playback</span>
          <span className="text-[11px] text-gray-400 ml-2">{vehicle.vehicleId}</span>
        </div>
        <span className="text-[11px] text-gray-400">
          {idx + 1} / {total} waypoints
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!playing ? (
          <button
            onClick={play}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Play size={12} /> Play
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Pause size={12} /> Pause
          </button>
        )}
        <button
          onClick={stop}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Square size={12} /> Stop
        </button>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={idx}
          onChange={(e) => {
            const v = Number(e.target.value);
            setIdx(v);
            onProgress(v);
          }}
          className="flex-1 accent-blue-600"
        />
      </div>
    </div>
  );
}
