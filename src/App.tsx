import { useState, useEffect } from "react";
import wasmInit, { readParquet } from "parquet-wasm";

import * as pmtiles from "pmtiles";
import * as maplibregl from "maplibre-gl";

import { tableFromIPC } from "apache-arrow";
import { Map } from "@vis.gl/react-maplibre";
import DeckGL, { Layer } from "deck.gl";
import { GeoArrowSolidPolygonLayer } from "@geoarrow/deck.gl-layers";
import { DataFilterExtension } from "@deck.gl/extensions";
import "maplibre-gl/dist/maplibre-gl.css";

import Box from "@mui/material/Box";

import Slider from "./Slider";
import style from "./style";
// Update this version to match the version you're using.
const wasmUrl =
  "https://cdn.jsdelivr.net/npm/parquet-wasm@0.6.1/esm/parquet_wasm_bg.wasm";
await wasmInit(wasmUrl);

const GEOARROW_POLYGON_DATA = "/building-arro3.parquet";

const INITIAL_VIEW_STATE = {
  latitude: 37.55,
  longitude: 127,
  zoom: 11,
  bearing: 0,
  pitch: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

const NAV_CONTROL_STYLE = {
  position: "absolute",
  top: 10,
  left: 10,
};

function formatLabel(year: number): string {
  return `${year}`;
}
export default function App() {
  const timeRange = [1920, 2025];
  const [table, setTable] = useState<arrow.Table | null>(null);

  // Attach pmtile protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  useEffect(() => {
    // declare the data fetching function
    const fetchData = async () => {
      const resp = await fetch(GEOARROW_POLYGON_DATA);
      const arrayBuffer = await resp.arrayBuffer();
      const wasmTable = readParquet(new Uint8Array(arrayBuffer));
      const jsTable = tableFromIPC(wasmTable.intoIPCStream());
      setTable(jsTable);
    };

    if (!table) {
      fetchData().catch(console.error);
    }
  });

  const layers: Layer[] = [];
  const [filterValue, setFilter] = useState<
    [start: number, end: number] | null
  >(timeRange);

  table &&
    layers.push(
      new GeoArrowSolidPolygonLayer({
        id: "geoarrow-polygons",
        data: table,
        getPolygon: table.getChild("geometry")!,
        getFillColor: [49, 130, 189, 255],
        getFilterValue: table.getChild("A13"), // This should be float32 type
        filterRange: filterValue,
        extensions: [new DataFilterExtension({ filterSize: 1 })],
      })
    );

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map mapStyle={style} />
      </DeckGL>
      <Box
        component="div"
        sx={{
          padding: "20px",
          width: "200px",
          backgroundColor: "white",
          position: "absolute",
          right: "calc(50% - 100px)",
          bottom: "20px",
          textAlign: "center",
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Slider
          min={1920}
          max={2025}
          value={filterValue}
          animationSpeed={1}
          formatLabel={formatLabel}
          onChange={(newVal) => {
            setFilter(newVal);
          }}
        />
      </Box>
    </>
  );
}
