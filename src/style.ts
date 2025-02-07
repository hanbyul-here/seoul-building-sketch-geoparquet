import layers from "protomaps-themes-base";

const isProd = import.meta.env.MODE === "production";

const basemapDataUrl = isProd
  ? `${window.location.origin}/${import.meta.env.BASE_URL}`
  : window.location.origin;

const notVisibleLayerKeyWords = [
  "transit",
  "poi",
  "places",
  "buildings",
  "landuse",
  "pois",
];
const baseMapFoundation = {
  version: 8,
  name: "Seoul Building Map",
  sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
  glyphs:
    "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
};

export const baseMapLayers = layers("basemap", "grayscale", "ko").filter(
  (layer) => {
    return !notVisibleLayerKeyWords.some((item) => layer.id.includes(item));
  }
);

const baseMapStyle = {
  ...baseMapFoundation,
  sources: {
    basemap: {
      type: "vector",
      url: `pmtiles://${basemapDataUrl}/seoul.pmtiles`,
      attribution:
        '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
    },
  },
  layers: baseMapLayers,
};

export default baseMapStyle;
