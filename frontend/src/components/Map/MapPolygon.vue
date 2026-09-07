<template>
  <div class="flex flex-row gap-5">
    <div id="map" ref="mapContainer" style="width: 600px; height: 600px"></div>
    <div class="flex flex-col rounded border-solid border-1 border-gray-800 p-2 min-w-[600px]">
      <div class="px-4">
        <div v-if="selectedPlot && plotState == PlotState.None" class="info-panel">
          <h3>地块信息</h3>
          <el-form :model="selectedPlot" label-width="auto">
            <el-form-item label="ID: ">
              <el-input v-model="selectedPlot.id" disabled />
            </el-form-item>
            <el-form-item label="Name: ">
              <el-input v-model="selectedPlot.properties.name" disabled />
            </el-form-item>
            <el-form-item label="Area: ">
              <el-input v-model="selectedPlot.properties.area" disabled />
            </el-form-item>
            <el-form-item label="Geometry: ">
              <div class="flex flex-col gap-2">
                <div v-for="point in selectedPlot.geometry.coordinates[0]" class="flex flex-row gap-2">
                  <el-input-number v-model.number="point[0]" :min="0" :max="9999.999999" disabled />
                  <span>:</span>
                  <el-input-number v-model.number="point[1]" :min="0" :max="9999.999999" disabled />
                </div>
              </div>
            </el-form-item>
            <el-form-item label=" ">
              <el-button type="primary" @click="onEditPlot" plain>Edit</el-button>
              <el-button type="danger" @click="onDeletePlot" plain>Delete</el-button>
              <el-button @click="cancelFeatureSelected">Close</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-else-if="plotState == PlotState.Add" class="info-panel">
          <h3>添加地块信息</h3>
          <el-form :model="newPlot" label-width="auto">
            <el-form-item label="Name: ">
              <el-input v-model="newPlot.properties.name" />
            </el-form-item>
            <el-form-item label="Area: ">
              <el-input v-model="newPlot.properties.area" />
            </el-form-item>
            <el-form-item label="Geometry: ">
              <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-2">
                  <div v-for="point in newPlot.geometry.coordinates[0]" class="flex flex-row gap-2">
                    <el-input-number v-model.number="point[0]" :min="0" :max="9999.999999" />
                    <span>:</span>
                    <el-input-number v-model.number="point[1]" :min="0" :max="9999.999999" />
                    <el-button type="danger" @click="onDeleteCoordinateForAdd" :icon="Minus" />
                  </div>
                </div>
                <el-button type="primary" @click="onAddCoordinateForAdd" :icon="Plus" />
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAddPlot">Add</el-button>
              <el-button @click="cancelFeatureSelected">Cancel</el-button>
            </el-form-item>
          </el-form>
          <el-alert title="地块的首位坐标要一致" type="warning" show-icon :closable="false" />
        </div>
        <div v-else-if="selectedPlot && plotState == PlotState.Edit" class="info-panel">
          <h3>Edit Plot Info</h3>
          <el-form :model="selectedPlot" label-width="auto">
            <el-form-item label="Name: ">
              <el-input v-model="selectedPlot.properties.name" />
            </el-form-item>
            <el-form-item label="Area: ">
              <el-input v-model="selectedPlot.properties.area" />
            </el-form-item>
            <el-form-item label="Geometry: ">
              <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-2">
                  <div v-for="point in selectedPlot.geometry.coordinates[0]" class="flex flex-row gap-2">
                    <el-input-number v-model.number="point[0]" :min="0" :max="9999.999999" />
                    <span>:</span>
                    <el-input-number v-model.number="point[1]" :min="0" :max="9999.999999" />
                    <el-button type="danger" @click="onDeleteCoordinateForEdit" :icon="Minus" />
                  </div>
                </div>
                <el-button type="primary" @click="onAddCoordinateForEdit" :icon="Plus" />
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleEditPlot">Save</el-button>
              <el-button @click="cancelFeatureSelected">Cancel</el-button>
            </el-form-item>
            <el-alert title="地块的首位坐标要一致" type="warning" show-icon :closable="false" />
          </el-form>
        </div>
        <div v-else>
          <h3 class="font-bold">地块信息</h3>
          <h5 class="text-gray-4">当前一共{{ plotMapList.length }}个地块</h5>
          <el-button type="success" @click="onAddPlot" size="large" plain>Add A New Plot</el-button>
          <el-divider style="margin: 12px 0" />
          <el-table v-loading="loading" :border="true" :data="plotMapList">
            <el-table-column label="Name" align="center" prop="properties.name" />
            <el-table-column label="Area" align="center" prop="properties.area" />
            <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-tooltip content="Edit" placement="top">
                  <el-button link type="primary" icon="Edit" @click="onUpdateRow(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip content="Delete" placement="top">
                  <el-button link type="primary" icon="Delete" @click="onDeleteRow(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <!-- <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" /> -->
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

import { Plus, Minus } from '@element-plus/icons-vue';

enum PlotState {
  None,
  Add,
  Edit
}

const mapContainer = ref(null);
let map: maplibregl.Map = null;
let mapControl: MaplibreTerradrawControl = null;
let draw: TerraDraw = null;
const plotMapList = ref<GeoJSONStoreFeatures[]>([]);

plotMapList.value.push({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [38.7285, 9.064],
        [38.6798, 8.974],
        [38.7938, 8.921],
        [38.8645, 9.017],
        [38.8281, 9.065],
        [38.7285, 9.064]
      ]
    ]
  },
  properties: {
    mode: 'polygon',
    name: '地块A',
    area: '5000㎡'
  }
});

plotMapList.value.push({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [38.6285, 9.064],
        [38.5798, 8.974],
        [38.6938, 8.921],
        [38.7645, 9.017],
        [38.7281, 9.065],
        [38.6285, 9.064]
      ]
    ]
  },
  properties: {
    mode: 'polygon',
    name: '地块B',
    area: '5000㎡'
  }
});

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

const initMap = () => {
  map = new maplibregl.Map({
    container: 'map',
    style: 'http://192.168.2.150:8080/styles/Custom/style.json',
    center: [38.7, 9.0],
    zoom: 10,
    maxPitch: 85
  });

  mapControl = new MaplibreTerradrawControl({
    modes: ['polygon', 'select'],
    adapterOptions: {
      coordinatePrecision: 6
    },
    modeOptions: {
      polygon: new TerraDrawPolygonMode({
        styles: {
          fillColor: '#00FCF00C',
          fillOpacity: 0.7,
          outlineColor: '#a3cf62',
          outlineWidth: 2,
          closingPointColor: '#FAFAFA',
          closingPointWidth: 3,
          closingPointOutlineColor: '#7fb80e',
          closingPointOutlineWidth: 1
        }
      }),
      select: new TerraDrawSelectMode({
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
      const geojson: GeoJSONStoreFeatures[] = plotMapList.value;
      draw.addFeatures(geojson);

      plotMapList.value = draw.getSnapshot();

      draw.on('select', (id) => {
        console.log(draw.getSnapshot());
        const snapshot = draw.getSnapshot();
        const feature = snapshot?.find((feature) => feature.id === id);

        onSelectPlot(feature);
      });

      draw.setMode('select');
    }
  });
};
const onSelectPlot = async (feature) => {
  if (plotState.value == PlotState.Add) {
    try {
      await proxy?.$modal.confirm('是否取消添加地块？');
    } catch (error) {
      draw.deselectFeature(feature.id);
      return;
    }
  }
  if (plotState.value == PlotState.Edit) {
    if (selectedPlot.value.id == feature.id) return;
    try {
      await proxy?.$modal.confirm('是否取消修改地块？');
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

  await proxy?.$modal.confirm('是否确认删除该地块？');
  draw.removeFeatures([selectedPlot.value.id]);
  plotList.value.splice(plotList.value.indexOf(selectedPlot.value), 1);

  cancelFeatureSelected();

  proxy?.$modal.msgSuccess('成功删除地块');
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
const cancelFeatureSelected = () => {
  if (selectedPlot.value) {
    draw.deselectFeature(selectedPlot.value.id);
    selectedPlot.value = null;
  }
  plotState.value = PlotState.None;
};
const handleAddPlot = () => {
  if (
    newPlot.value.properties.name.trim() === '' ||
    newPlot.value.properties.area.trim() === '' ||
    newPlot.value.geometry.coordinates[0].length < 3
  ) {
    proxy?.$modal.alertWarning('请完整填写地块信息');
    return;
  }

  plotList.value.push(newPlot.value);
  const results = draw.addFeatures([newPlot.value]);
  if (!results[0].valid) {
    proxy?.$modal.alertWarning(results[0].reason);
    return;
  }
  console.log(results);

  plotState.value = PlotState.None;
  draw.selectFeature(results[0].id);

  newPlot.value = defaultPlot.value;

  proxy?.$modal.msgSuccess('成功添加地块');
};
const handleEditPlot = () => {
  if (
    !selectedPlot.value ||
    selectedPlot.value.properties.name.trim() === '' ||
    selectedPlot.value.properties.area.trim() === '' ||
    selectedPlot.value.geometry.coordinates[0].length < 3
  ) {
    proxy?.$modal.alertWarning('请完整填写地块信息');
    return;
  }
  draw.deselectFeature(selectedPlot.value.id);

  plotList.value.splice(plotList.value.indexOf(selectedPlot.value), 1);
  draw.removeFeatures([selectedPlot.value.id]);

  delete selectedPlot.value.id;
  delete selectedPlot.value.properties.selected;

  plotList.value.push(selectedPlot.value);
  const results = draw.addFeatures([selectedPlot.value]);

  plotState.value = PlotState.None;
  draw.selectFeature(results[0].id);
  proxy?.$modal.msgSuccess('成功修改地块');
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
  await proxy?.$modal.confirm('是否确认删除该地块？');
  draw.removeFeatures([row.id]);

  plotList.value.splice(plotList.value.indexOf(row), 1);

  cancelFeatureSelected();

  proxy?.$modal.msgSuccess('成功删除地块');
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) map.remove();
});
</script>
