import { useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";

import { VehicleLayer } from "./VehicleLayer";
import type { Vehicle } from "../../types/vehicle";

interface Props {
  vehicles: Vehicle[];
}

const INITIAL_VIEW_STATE = {
  longitude: 106.827153,
  latitude: -6.175392,
  zoom: 10,
};

export default function VehicleMap({
  vehicles,
}: Props) {
  const layers = useMemo(() => {
    return [
      VehicleLayer({
        data: vehicles,
      }),
    ];
  }, [vehicles]);

  console.log(vehicles);

  return (
    <div className="h-[600px] w-full">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller
        layers={layers}
        style={{
          width: "100%",
          height: "100%",
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
  );
}