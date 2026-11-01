import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/maplibre";

const INITIAL_VIEW_STATE = {
  longitude: 106.8456,
  latitude: -6.2088,
  zoom: 10,
};

export default function DeckMap() {
  const data = [
    {
      position: [106.8456, -6.2088],
      name: "Jakarta",
    },
  ];

  const layers = [
    new ScatterplotLayer({
      id: "vehicles",
      data,
      getPosition: (d: any) => d.position,
      getRadius: 500,
      getFillColor: [255, 0, 0],
    }),
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller
      layers={layers}
    >
      <Map
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
    </DeckGL>
  );
}