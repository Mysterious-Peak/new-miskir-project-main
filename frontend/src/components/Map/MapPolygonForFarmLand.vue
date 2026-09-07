<template>
  <div class="flex flex-row gap-5">
    <div id="map" ref="mapContainer" style="width: 600px; height: 600px"></div>
    <div class="flex flex-col rounded border-solid border-1 border-gray-800 p-2 min-w-[600px]">
      <div class="px-4">
        <div v-if="selectedPlot && plotState == PlotState.None" class="info-panel">
          <h3>Polygon Info</h3>
          <el-form :model="selectedPlot" label-width="auto">
            <el-form-item>
              <div class="flex w-full flex-col items-center gap-2">
                <div v-for="point in selectedPlot.geometry.coordinates[0]" class="flex flex-row items-center justify-center gap-2">
                  <el-input-number v-model.number="point[0]" :min="0" :max="9999.999999" disabled />
                  <span>:</span>
                  <el-input-number v-model.number="point[1]" :min="0" :max="9999.999999" disabled />
                </div>
              </div>
            </el-form-item>
            <el-form-item label=" ">
              <el-button type="primary" @click="onEditPlot" plain>Edit</el-button>
              <el-button type="danger" @click="onDeletePlot" plain>Delete</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-else-if="plotState == PlotState.Add" class="info-panel">
          <h3>Add Polygon Info</h3>
          <el-form :model="newPlot" label-width="auto">
            <el-form-item>
              <div class="flex w-full flex-col items-center gap-2">
                <div v-for="point in newPlot.geometry.coordinates[0]" class="flex flex-row items-center justify-center gap-2">
                  <el-input-number v-model.number="point[0]" :min="0" :max="9999.999999" />
                  <span>:</span>
                  <el-input-number v-model.number="point[1]" :min="0" :max="9999.999999" />
                  <el-button type="danger" @click="onDeleteCoordinateForAdd" :icon="Minus" />
                </div>
                <el-button type="primary" @click="onAddCoordinateForAdd" :icon="Plus" />
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAddPlot">Save Polygon</el-button>
              <el-button @click="cancelFeatureSelected">Cancel</el-button>
            </el-form-item>
          </el-form>
          <el-alert title="The primary coordinate must be consistent for all land plots." type="warning" show-icon :closable="false" />
        </div>
        <div v-else-if="selectedPlot && plotState == PlotState.Edit" class="info-panel">
          <h3>Edit Plot Info</h3>
          <el-form :model="selectedPlot" label-width="auto">
            <el-form-item>
              <div class="flex w-full flex-col items-center gap-2">
                <div v-for="point in selectedPlot.geometry.coordinates[0]" class="flex flex-row items-center justify-center gap-2">
                  <el-input-number v-model.number="point[0]" :min="0" :max="9999.999999" />
                  <span>:</span>
                  <el-input-number v-model.number="point[1]" :min="0" :max="9999.999999" />
                  <el-button type="danger" @click="onDeleteCoordinateForEdit" :icon="Minus" />
                </div>
                <el-button type="primary" @click="onAddCoordinateForEdit" :icon="Plus" />
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleEditPlot">Save</el-button>
              <el-button @click="cancelEdit">Cancel</el-button>
            </el-form-item>
            <el-alert title="The primary coordinate must be consistent for all land plots." type="warning" show-icon :closable="false" />
          </el-form>
        </div>
        <div v-else-if="plotList.length == 0">
          <h3 class="font-bold">Polygon Info</h3>
          <el-button type="success" @click="onAddPlot" size="large" plain>Create A Polygon</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import maplibregl, { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw';
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';
import { TerraDraw, TerraDrawPolygonMode, TerraDrawSelectMode, type GeoJSONStoreFeatures } from 'terra-draw';
import type { Position } from 'geojson';

import { Plus, Minus } from '@element-plus/icons-vue';
import { FARM_LAND_TERRA_POLYGON_STYLES, FARM_LAND_TERRA_SELECT_POLYGON_STYLES } from '@/components/Map/farmLandTerraDrawStyles';
import { attachUniformMapCanvasCursor } from '@/components/Map/mapCanvasCursor';
import { TERRA_POLYGON_MODE_CURSORS, TERRA_SELECT_MODE_CURSORS } from '@/components/Map/terraDrawCursors';

enum PlotState {
  None,
  Add,
  Edit
}

const mapContainer = ref(null);
let map: maplibregl.Map = null;
let mapReady = false;
let mapControl: MaplibreTerradrawControl = null;
let draw: TerraDraw = null;
let detachMapCanvasCursor: (() => void) | null = null;
let gpsMarker: maplibregl.Marker = null;
// const plotMapList = ref<GeoJSONStoreFeatures[]>([]);

const props = defineProps({
  initPolygon: Array as PropType<Position[]>,
  onGenerateJson: Function,
  /** WGS84 latitude — shown on map together with `gpsLong` */
  gpsLat: Number as PropType<number | undefined>,
  /** WGS84 longitude */
  gpsLong: Number as PropType<number | undefined>
});

const emit = defineEmits<{
  pickGps: [payload: { lat: number; lng: number }];
}>();

const roundCoord = (n: number) => Math.round(n * 1e6) / 1e6;

// plotMapList.value.push({
//   type: 'Feature',
//   geometry: {
//     type: 'Polygon',
//     coordinates: [
//       [
//         [38.7285, 9.064],
//         [38.6798, 8.974],
//         [38.7938, 8.921],
//         [38.8645, 9.017],
//         [38.8281, 9.065],
//         [38.7285, 9.064]
//       ]
//     ]
//   },
//   properties: {
//     mode: 'polygon',
//     name: '地块A',
//     area: '5000㎡'
//   }
// });

// plotMapList.value.push({
//   type: 'Feature',
//   geometry: {
//     type: 'Polygon',
//     coordinates: [
//       [
//         [38.6285, 9.064],
//         [38.5798, 8.974],
//         [38.6938, 8.921],
//         [38.7645, 9.017],
//         [38.7281, 9.065],
//         [38.6285, 9.064]
//       ]
//     ]
//   },
//   properties: {
//     mode: 'polygon',
//     name: '地块B',
//     area: '5000㎡'
//   }
// });

const selectedPlot = ref(null);
const plotState = ref<PlotState>(PlotState.None);
const defaultPlot = ref<GeoJSONStoreFeatures>({
  type: 'Feature',
  geometry: { type: 'Polygon', coordinates: [[]] },
  properties: {
    mode: 'polygon',
    name: '',
    area: ''
  }
});
const newPlot = ref();

const plotList = ref([]);
const loading = ref(false);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const onMapClickForGps = (e: maplibregl.MapLayerMouseEvent) => {
  if (!draw || !mapReady) return;
  if (draw.getMode() !== 'select') return;
  const { lat, lng } = e.lngLat;
  emit('pickGps', { lat: roundCoord(lat), lng: roundCoord(lng) });
};

const updateGpsPointMarker = () => {
  if (gpsMarker) {
    gpsMarker.remove();
    gpsMarker = null;
  }
  if (!map || !mapReady) return;
  const lat = props.gpsLat;
  const lng = props.gpsLong;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return;
  }
  gpsMarker = new Marker({ color: '#e63946' }).setLngLat([lng, lat]).addTo(map);
  // map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 14) });
  map.flyTo({ center: [lng, lat] });
};

const initMap = () => {
  mapReady = false;
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [38.7, 9.0],
    zoom: 10,
    maxPitch: 85,
    maxCanvasSize: [600, 600]
  });

  mapControl = new MaplibreTerradrawControl({
    modes: ['polygon', 'select'],
    adapterOptions: {
      coordinatePrecision: 6
    },
    modeOptions: {
      polygon: new TerraDrawPolygonMode({
        cursors: TERRA_POLYGON_MODE_CURSORS,
        styles: { ...FARM_LAND_TERRA_POLYGON_STYLES }
      }),
      select: new TerraDrawSelectMode({
        cursors: TERRA_SELECT_MODE_CURSORS,
        styles: { ...FARM_LAND_TERRA_SELECT_POLYGON_STYLES },
        flags: {
          polygon: {
            feature: {
              draggable: false,
              rotateable: false,
              scaleable: false,
              coordinates: {
                midpoints: false,
                draggable: false,
                deletable: false
              }
            }
          }
        }
      })
    }
  });
  map.addControl(mapControl, 'top-left');

  map.once('load', () => {
    draw = mapControl.getTerraDrawInstance();
    if (draw) {
      // const geojson: GeoJSONStoreFeatures[] = plotMapList.value;
      // draw.addFeatures(geojson);

      // plotMapList.value = draw.getSnapshot();

      draw.on('select', (id) => {
        console.log(draw.getSnapshot());
        const snapshot = draw.getSnapshot();
        const feature = snapshot?.find((feature) => feature.id === id);

        onSelectPlot(feature);
      });

      draw.setMode('select');

      if (props.initPolygon.length > 0) {
        const initList: GeoJSONStoreFeatures[] = [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [props.initPolygon]
            },
            properties: {
              mode: 'polygon',
              name: 'polygon_1',
              area: '5000㎡'
            }
          }
        ];
        const results = draw.addFeatures(initList);
        if (results.length > 0) draw.selectFeature(results[0].id);
      }

      map.resize();
      detachMapCanvasCursor = attachUniformMapCanvasCursor(map.getCanvas());
      mapReady = true;
      map.on('click', onMapClickForGps);
      updateGpsPointMarker();
    }
  });
};

watch(
  () => [props.gpsLat, props.gpsLong] as const,
  () => updateGpsPointMarker()
);
const onSelectPlot = async (feature) => {
  if (plotState.value == PlotState.Add) {
    try {
      await proxy?.$modal.confirm('Do you want to cancel Add');
    } catch (error) {
      draw.deselectFeature(feature.id);
      return;
    }
  }
  if (plotState.value == PlotState.Edit) {
    if (selectedPlot.value.id == feature.id) return;
    try {
      await proxy?.$modal.confirm('Do you want to cancel Edit？');
    } catch (error) {
      draw.selectFeature(selectedPlot.value.id);
      return;
    }
  }
  selectedPlot.value = feature;
  plotState.value = PlotState.None;
};
const onAddPlot = () => {
  cancelFeatureSelected();
  newPlot.value = defaultPlot.value;
  plotState.value = PlotState.Add;
};
const onEditPlot = () => {
  if (!selectedPlot.value) return;
  plotState.value = PlotState.Edit;
};
const onDeletePlot = async () => {
  if (!selectedPlot.value) return;

  await proxy?.$modal.confirm('Are you sure delete this polygon？');
  draw.removeFeatures([selectedPlot.value.id]);
  plotList.value.splice(plotList.value.indexOf(selectedPlot.value), 1);

  cancelFeatureSelected();

  proxy?.$modal.msgSuccess('delete success');
};
const onAddCoordinateForAdd = () => {
  newPlot.value.geometry.coordinates[0].push([0, 0]);
};
const onAddCoordinateForEdit = () => {
  if (!selectedPlot.value) return;
  selectedPlot.value.geometry.coordinates[0].push([0, 0]);
};
const onDeleteCoordinateForAdd = () => {
  if (newPlot.value.geometry.coordinates[0].length > 0) {
    newPlot.value.geometry.coordinates[0].pop();
  }
};
const onDeleteCoordinateForEdit = () => {
  if (!selectedPlot.value) return;
  if (selectedPlot.value.geometry.coordinates[0].length > 0) {
    selectedPlot.value.geometry.coordinates[0].pop();
  }
};
const cancelEdit = () => {
  plotState.value = PlotState.None;
};
const cancelFeatureSelected = () => {
  if (selectedPlot.value) {
    draw.deselectFeature(selectedPlot.value.id);
    selectedPlot.value = null;
  }
  plotState.value = PlotState.None;
};
const handleAddPlot = () => {
  if (
    // newPlot.value.properties.name.trim() === '' ||
    // newPlot.value.properties.area.trim() === '' ||
    newPlot.value.geometry.coordinates[0].length < 3
  ) {
    proxy?.$modal.alertWarning('Please provide complete information for the land parcel.');
    return;
  }

  plotList.value.push(newPlot.value);
  const results = draw.addFeatures([newPlot.value]);
  if (!results[0].valid) {
    proxy?.$modal.alertWarning(results[0].reason);
    return;
  }
  newPlot.value.id = results[0].id;

  props.onGenerateJson(JSON.stringify(newPlot.value.geometry.coordinates[0]));

  plotState.value = PlotState.None;
  draw.selectFeature(results[0].id);

  newPlot.value = defaultPlot.value;

  proxy?.$modal.msgSuccess('Add success');
};
const handleEditPlot = () => {
  if (
    !selectedPlot.value ||
    // selectedPlot.value.properties.name.trim() === '' ||
    // selectedPlot.value.properties.area.trim() === '' ||
    selectedPlot.value.geometry.coordinates[0].length < 3
  ) {
    proxy?.$modal.alertWarning('Please provide complete information for the land parcel.');
    return;
  }
  draw.deselectFeature(selectedPlot.value.id);

  plotList.value.splice(plotList.value.indexOf(selectedPlot.value), 1);
  draw.removeFeatures([selectedPlot.value.id]);

  delete selectedPlot.value.id;
  delete selectedPlot.value.properties.selected;

  plotList.value.push(selectedPlot.value);
  const results = draw.addFeatures([selectedPlot.value]);

  props.onGenerateJson(JSON.stringify(selectedPlot.value.geometry.coordinates[0]));

  plotState.value = PlotState.None;
  draw.selectFeature(results[0].id);
  proxy?.$modal.msgSuccess('Edit success');
};
const onUpdateRow = (row) => {
  if (!row) return;
  if (plotState.value == PlotState.Add) {
    proxy?.$modal.alertWarning('正在添加地块，请先完成添加操作');
    return;
  }
  if (plotState.value == PlotState.Edit) {
    proxy?.$modal.alertWarning('正在修改地块，请先完成修改操作');
    return;
  }
  draw.selectFeature(row.id);
};
const onDeleteRow = async (row) => {
  if (!row) return;
  if (plotState.value == PlotState.Add) {
    proxy?.$modal.alertWarning('正在添加地块，请先完成添加操作');
    return;
  }
  if (plotState.value == PlotState.Edit) {
    proxy?.$modal.alertWarning('正在修改地块，请先完成修改操作');
    return;
  }
  await proxy?.$modal.confirm('Are you sure delete this polygon？');
  draw.removeFeatures([row.id]);

  plotList.value.splice(plotList.value.indexOf(row), 1);

  cancelFeatureSelected();

  proxy?.$modal.msgSuccess('Delete success');
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.off('click', onMapClickForGps);
  }
  detachMapCanvasCursor?.();
  detachMapCanvasCursor = null;
  if (gpsMarker) {
    gpsMarker.remove();
    gpsMarker = null;
  }
  mapReady = false;
  if (map) map.remove();
});
</script>
