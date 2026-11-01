import { IconLayer } from "@deck.gl/layers";
import type { Vehicle } from "../../types/vehicle";

interface Props {
  data: Vehicle[];
}

export function VehicleLayer({ data }: Props) {
  return new IconLayer<Vehicle>({
    id: "vehicle-layer",

    data,

    pickable: true,

    getIcon: () => ({
      url: "/truck.png",
      width: 128,
      height: 128,
      anchorY: 128,
    }),

    getPosition: (d) => [
      Number(d.lng),
      Number(d.lat),
    ],

    getSize: () => 40,

    sizeScale: 1,

    getAngle: (d) => d.heading || 0,
  });
}