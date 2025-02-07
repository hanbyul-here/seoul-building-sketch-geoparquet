# Seoul Building Explorer - GeoParquet

🔗: https://hanbyul-here.github.io/seoul-building-sketch-geoparquet/
(This page will download the geoparquet data, which is ~ 27MB)

## Making data:

### Parquet

```python
import geopandas as gpd
from lonboard._geoarrow.geopandas_interop import geopandas_to_geoarrow
from arro3.io import write_parquet
bds = gpd.read_file('./BUILDING_DATA.zip', encoding='euc-kr')
bds = bds.to_crs('epsg:4326')
bdss = bds[['A13', 'geometry']]
bdss.geometry = shapely.set_precision(bdss.geometry, grid_size=0.00001)
bdss['A13'] = bdss['A13'].fillna('0').astype(str).str[:4]
bdss['A13'] = bdss['A13'].astype('float32')
table = geopandas_to_geoarrow(bdss)
write_parquet(table, "building-arro3.parquet")
```

### Basemap (https://maps.protomaps.com/builds/)

```
pmtiles extract https://build.protomaps.com/20250203.pmtiles ./seoul.pmtiles --bbox=126.736039,37.411321,127.246761,37.711342
```
