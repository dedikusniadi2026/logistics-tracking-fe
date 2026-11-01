import { useEffect, useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/maplibre";
import {
  liveTrackingApi,
  type TrackingPoint as LiveTrackingPoint,
} from "../../../api/tracking.api";

const INITIAL_VIEW_STATE = {
  longitude: 106.827153,
  latitude: -6.175392,
  zoom: 10,
};

export default function LiveTrackingMap() {
  const [points, setPoints] = useState<LiveTrackingPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await liveTrackingApi();
        const list = Array.isArray(data) ? (data as LiveTrackingPoint[]) : [];
        if (mounted) setPoints(list);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const layers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: "tracking-layer",
        data: points,
        getPosition: (d: LiveTrackingPoint) => [d.longitude, d.latitude],
        getRadius: 90,
        getFillColor: [37, 99, 235],
        pickable: false,
      }),
    ];
  }, [points]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Live Tracking</h2>
        <button className="text-blue-600 hover:text-blue-700">See All</button>
      </div>

      <div className="relative h-[450px] w-full overflow-hidden rounded-lg">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Loading...
          </div>
        ) : null}

        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <Map
            style={{
              width: "100%",
              height: "100%",
            }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          />
        </DeckGL>
      </div>
    </div>
  );
}
