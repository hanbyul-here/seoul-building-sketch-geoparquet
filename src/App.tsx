import { useState, useEffect } from "react";
import wasmInit, { readParquet } from "parquet-wasm";
import type { Table } from "apache-arrow";
import Box from "@mui/material/Box";

import * as pmtiles from "pmtiles";
import * as maplibregl from "maplibre-gl";

import { tableFromIPC } from "apache-arrow";
import { Map } from "@vis.gl/react-maplibre";
import DeckGL, { Layer } from "deck.gl";
import { GeoArrowSolidPolygonLayer } from "@geoarrow/deck.gl-layers";
import { DataFilterExtension } from "@deck.gl/extensions";
import "maplibre-gl/dist/maplibre-gl.css";

import Slider from "./Slider";
import style from "./style";
// Update this version to match the version
const wasmUrl =
  "https://cdn.jsdelivr.net/npm/parquet-wasm@0.6.1/esm/parquet_wasm_bg.wasm";
await wasmInit(wasmUrl);

const GEOARROW_POLYGON_DATA = window.location.href + "building-arro3.parquet";

export type ValuePair = [start: number, end: number];
const timeRange = [1920, 2025] as ValuePair;

const INITIAL_VIEW_STATE = {
  latitude: 37.55,
  longitude: 127,
  zoom: 11,
  bearing: 0,
  pitch: 0,
};

function formatLabel(year: number): string {
  return `${year}`;
}
export default function App() {
  const [table, setTable] = useState<Table | null>(null);

  const layers: Layer[] = [];
  const [filterValue, setFilter] = useState<ValuePair>(timeRange);

  // Attach pmtile protocol to MapLibre for basemap
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  // Fetch parquet, build table
  useEffect(() => {
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

  if (table) {
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
  }

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
          backgroundColor: "white",
          position: "absolute",
          padding: "0 12px",
          top: "20px",
          left: "20px",
          width: "250px",
        }}
      >
        <p style={{ color: "#333", fontSize: "12px" }}>
          이 지도는 서울 건물들이 언제 사용승인 허가를 받았는지 보여줍니다.
          아래의 슬라이더를 이용해서 승인 연도의 범위를 조정할 수 있습니다.
        </p>
      </Box>

      <Slider
        min={timeRange[0]}
        max={timeRange[1]}
        value={filterValue}
        animationSpeed={1}
        formatLabel={formatLabel}
        onChange={(newVal) => {
          setFilter(newVal);
        }}
      />
    </>
  );
}
