<template>
  <div class="flex gap-2 p-2">
    <div>
      <div id="map" ref="mapContainer" style="width: 600px; height: 600px"></div>
      <div id="contextMenu" class="context-menu">
        <ul>
          <!-- <li @click="zoomIn()">放大</li>
            <li @click="zoomOut()">缩小</li>
            <hr />
            <li @click="resetView()">重置视图</li> -->
          <li @click="setStartPos()">设置起点</li>
          <li @click="setViaPos()">设置路经点</li>
          <li @click="setEndPos()">设置终点</li>
        </ul>
      </div>
    </div>
    <div>
      <div class="flex flex-col gap-2 min-h-[200px] w-100">
        <div v-for="(waypoint, index) in waypoints">
          <div class="flex items-center gap-2">
            <!-- <el-input v-model="waypoint.userInput" style="width: 240px" placeholder="Please input" />
            <el-icon class="is-loading" v-if="waypoint.isFetching">
              <Loading />
            </el-icon> -->
            <WayPointInput :waypoint="waypoint" :onWayPointInputChange="onWayPointInputChange"></WayPointInput>
            <el-button :icon="Close" size="small" text circle v-if="waypoints.length > 2 && !waypoint.isFetching" @click="deleteWaypoint(index)" />
          </div>
        </div>
        <div>
          <el-button type="primary" :icon="Plus" @click="addEmptyWaypoint" />
        </div>
        <div>
          <el-button type="primary" @click="makeDirectionsRequest">开始导航</el-button>
        </div>
      </div>
      <div class="flex flex-col gap-2 min-h-[300px] mt-5" v-if="routeResult">
        <TripBoard v-if="routeResult.trip" title="Directions" :trip="routeResult.trip"></TripBoard>
        <div v-if="routeResult.alternates && routeResult.alternates.length > 0" class="flex flex-col gap-2">
          <TripBoard v-for="(alternate, index) in routeResult.alternates" :title="`alternate_${index + 1}`" :trip="alternate.trip"></TripBoard>
        </div>

        <!-- <div v-if="routeResult && routeResult.trip" class="flex flex-col gap-2 border-solid border-1 p-2 w-80">
          <span class="font-bold">Directions</span>
          <div class="flex flex-row items-center gap-2">
            <el-icon><Guide /></el-icon>
            <span class="text-sm">{{ routeResult.trip.summary.length.toFixed(routeResult.trip.summary.length > 1000 ? 0 : 1) }}km</span>
            <el-icon><Clock /></el-icon>
            <span class="text-sm">{{ formatDuration(routeResult.trip.summary.time) }}</span>
          </div>
          <el-button type="primary" @click="routeDetailShowFlag = !routeDetailShowFlag">显示/隐藏</el-button>
          <div v-for="(leg, legIndex) in routeResult.trip.legs" :key="legIndex" class="mt-2 mb-4" v-if="routeDetailShowFlag">
            <div v-for="(maneuver, maneuverIndex) in leg.maneuvers" :key="maneuverIndex" class="flex flex-col gap-2">
              <el-divider style="margin: 12px 0" />
              <span class="font-bold">{{ maneuver.instruction }}</span>
              <div v-if="maneuver.type !== 4 && maneuver.type !== 5 && maneuver.type !== 6" class="flex flex-row items-center gap-2">
                <el-icon><Guide /></el-icon>
                <span class="text-sm">{{ getLength(maneuver.length) }}</span>
                <el-icon><Clock /></el-icon>
                <span class="text-sm">{{ new Date(maneuver.time * 1000).toISOString().substr(11, 8) }}</span>
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import maplibregl, { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Plus, Close } from '@element-plus/icons-vue';

import { parseGeocodeResponse, reverse_geocode } from '@/map/nominatim';
import { ActiveWaypoint, ParsedDirectionsGeometry, Waypoint } from '@/map/common/types';
import { filterProfileSettings } from '@/map/common-actions';
import { buildDirectionsRequest, Profile } from '@/map/valhalla';
import { fetchValhallaDirections } from '@/map/directions-actions';

import { settingsInit } from '@/map/common/settings-options';

const mapContainer = ref(null);
let map: maplibregl.Map = null;

let contextMenu;
let menuCoordinates = null;

const waypoints = ref<Waypoint[]>([]);
const waypointMarkers = ref<Record<string, Marker>>({});
const settings = ref<any>(settingsInit);
const profile = ref<Profile>('truck' as Profile);
const dateTime = ref({
  type: -1,
  value: new Date(Date.now()).toISOString().slice(0, 16)
});
const routeResult = ref<ParsedDirectionsGeometry>();
const routeDetailShowFlag = ref(false);
const routeSourceId = 'route-source';
const routeLayerId = 'route-layer';
const routerSourceAlternateIdList = [];
const routerLayerAlternateIdList = [];

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const initMap = () => {
  map = new maplibregl.Map({
    container: 'map',
    style: 'http://192.168.2.150:8080/styles/Custom/style.json',
    center: [38.7, 9.0],
    zoom: 10,
    maxPitch: 85
  });

  map.once('load', () => {
    initLineLayer();
  });

  contextMenu = document.getElementById('contextMenu');
  map.on('contextmenu', (e) => {
    e.preventDefault();

    // 获取点击的坐标
    const { lng, lat } = e.lngLat;
    menuCoordinates = { lng, lat };

    // 显示菜单
    contextMenu.style.display = 'block';
    contextMenu.style.left = e.originalEvent.clientX + 'px';
    contextMenu.style.top = e.originalEvent.clientY + 'px';
  });

  map.on('click', () => {
    contextMenu.style.display = 'none';
  });
};

function zoomIn() {
  map.zoomIn();
  contextMenu.style.display = 'none';
}
function zoomOut() {
  map.zoomOut();
  contextMenu.style.display = 'none';
}
function resetView() {
  map.flyTo({
    center: [38.7, 9.0],
    zoom: 10
  });
  contextMenu.style.display = 'none';
}

const initWayPoints = () => {
  if (waypoints.value.length == 0) {
    waypoints.value.push({
      id: '0',
      geocodeResults: [],
      isFetching: false,
      userInput: ''
    });
    waypoints.value.push({
      id: '1',
      geocodeResults: [],
      isFetching: false,
      userInput: ''
    });
  }
};
const createWayPointMarkerKey = (wayPoint: Waypoint): string => {
  return `${wayPoint.geocodeResults[0].sourcelnglat[0]}, ${wayPoint.geocodeResults[0].sourcelnglat[1]}`;
};
const deleteMarker = (wayPoint: Waypoint) => {
  if (wayPoint.geocodeResults.length > 0) {
    const markerKey = createWayPointMarkerKey(wayPoint);
    if (markerKey in waypointMarkers.value) {
      waypointMarkers.value[markerKey].remove();
      delete waypointMarkers.value[markerKey];
    }
  }
};
const addMarker = (wayPoint: Waypoint) => {
  const newMarker = new maplibregl.Marker();
  newMarker.setLngLat([wayPoint.geocodeResults[0].sourcelnglat[0], wayPoint.geocodeResults[0].sourcelnglat[1]]).addTo(map);
  waypointMarkers.value[createWayPointMarkerKey(wayPoint)] = newMarker;
};
const setWaypoint = async (index: number, addresses: any[]) => {
  const wayPoint = waypoints.value[index];

  deleteMarker(wayPoint);

  wayPoint.isFetching = true;
  wayPoint.geocodeResults = addresses;
  wayPoint.userInput = `${addresses[0].sourcelnglat[0].toFixed(2)}, ${addresses[0].sourcelnglat[1].toFixed(2)}`;

  addMarker(wayPoint);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  wayPoint.isFetching = false;
  wayPoint.userInput = addresses[0].title;
  wayPoint.geocodeResults[0].selected = true;
};
const addViaWaypoint = async (addresses: any[]) => {
  waypoints.value.splice(waypoints.value.length - 1, 0, {
    id: '',
    isFetching: true,
    geocodeResults: addresses,
    userInput: `${addresses[0].sourcelnglat[0].toFixed(2)}, ${addresses[0].sourcelnglat[1].toFixed(2)}`
  });
  waypoints.value = waypoints.value.map((waypoint, idx) => {
    return {
      ...waypoint,
      id: `${idx}`
    };
  });
  const wayPoint = waypoints.value[waypoints.value.length - 2];

  addMarker(wayPoint);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  wayPoint.isFetching = false;
  wayPoint.userInput = addresses[0].title;
  wayPoint.geocodeResults[0].selected = true;
};
const deleteWaypoint = (index: number) => {
  const wayPoint = waypoints.value[index];
  deleteMarker(wayPoint);

  waypoints.value.splice(index, 1);
  waypoints.value = waypoints.value.map((waypoint, idx) => {
    return {
      ...waypoint,
      id: `${idx}`
    };
  });
};
const addEmptyWaypoint = () => {
  if (waypoints.value.length > 6) {
    return;
  }
  waypoints.value.splice(waypoints.value.length - 1, 0, {
    id: `${waypoints.value.length - 1}`,
    isFetching: false,
    geocodeResults: [],
    userInput: ''
  });
};

function setStartPos() {
  if (!menuCoordinates) return;
  reverse_geocode(menuCoordinates.lng, menuCoordinates.lat).then(async (response) => {
    const addresses = parseGeocodeResponse(response.data, [menuCoordinates.lng, menuCoordinates.lat]);
    if (addresses.length === 0) {
      proxy?.$modal.alertWarning('no addresses can be found.');
      return;
    }
    await setWaypoint(0, addresses);
    proxy?.$modal.msgSuccess('起点设置成功');
  });
  contextMenu.style.display = 'none';
}
function setViaPos() {
  if (!menuCoordinates) return;
  reverse_geocode(menuCoordinates.lng, menuCoordinates.lat).then(async (response) => {
    const addresses = parseGeocodeResponse(response.data, [menuCoordinates.lng, menuCoordinates.lat]);
    if (addresses.length === 0) {
      proxy?.$modal.alertWarning('no addresses can be found.');
      return;
    }
    await addViaWaypoint(addresses);
    proxy?.$modal.msgSuccess('路经点设置成功');
  });
  contextMenu.style.display = 'none';
}
function setEndPos() {
  if (!menuCoordinates) return;
  reverse_geocode(menuCoordinates.lng, menuCoordinates.lat).then(async (response) => {
    const addresses = parseGeocodeResponse(response.data, [menuCoordinates.lng, menuCoordinates.lat]);
    if (addresses.length === 0) {
      proxy?.$modal.alertWarning('no addresses can be found.');
      return;
    }
    await setWaypoint(waypoints.value.length - 1, addresses);
    proxy?.$modal.msgSuccess('终点设置成功');
  });
  contextMenu.style.display = 'none';
}
const onWayPointInputChange = (index, addresses) => {
  const wayPoint = waypoints.value[index];

  deleteMarker(wayPoint);

  wayPoint.geocodeResults = addresses;

  addMarker(wayPoint);

  const selectedGeoResult = wayPoint.geocodeResults.find((geo) => geo.selected);
  wayPoint.userInput = selectedGeoResult.title;
};

const updatePermalink = () => {};
const getActiveWaypoints = (waypoints: Waypoint[]): ActiveWaypoint[] => {
  const activeWaypoints: ActiveWaypoint[] = [];
  for (const waypoint of waypoints) {
    if (waypoint.geocodeResults.length > 0) {
      for (const result of waypoint.geocodeResults) {
        if (result.selected) {
          activeWaypoints.push(result);
          break;
        }
      }
    }
  }
  return activeWaypoints;
};
const makeDirectionsRequest = async () => {
  clearDirectionResult();
  const activeWaypoints = getActiveWaypoints(waypoints.value);
  if (activeWaypoints.length >= 2) {
    settings.value = filterProfileSettings(profile.value, settings.value);
    const valhallaRequest = buildDirectionsRequest({
      profile: profile.value,
      activeWaypoints,
      settings: settings.value,
      dateTime: dateTime.value
    });
    fetchValhallaDirections(valhallaRequest)
      .then(async (result) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        routeResult.value = result;
        showLineLayer();
      })
      .catch((error) => {
        routeResult.value = null;
        console.log(error);
      });
    // zoomTo((data as ParsedDirectionsGeometry).decodedGeometry);
  }
};
const clearDirectionResult = () => {
  routeResult.value = null;
  clearLineLayer();
};
const initLineLayer = () => {
  map.addSource(routeSourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: []
      },
      properties: {}
    }
  });
  map.addLayer({
    id: routeLayerId,
    type: 'line',
    source: routeSourceId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#0066ff',
      'line-width': 4,
      'line-opacity': 1
    }
  });
  for (let i = 0; i < 5; i++) {
    const sourceId = `alt_source_${i}`;
    const layerId = `alt_layer_${i}`;
    routerSourceAlternateIdList.push(sourceId);
    routerLayerAlternateIdList.push(layerId);

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: []
        },
        properties: {}
      }
    });
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#66a3ff',
        'line-width': 4,
        'line-opacity': 1
      }
    });
  }
};
const clearLineLayer = () => {
  routerSourceAlternateIdList.forEach((sourceId) => {
    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    source.setData({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: []
      },
      properties: {}
    });
  });
};
const showLineLayer = () => {
  clearLineLayer();
  const source = map.getSource(routeSourceId) as maplibregl.GeoJSONSource;
  source.setData({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: routeResult.value.decodedGeometry.map((coord) => [coord[1], coord[0]])
    },
    properties: {}
  });
  if (routeResult.value.alternates) {
    routeResult.value.alternates.forEach((alternate, index) => {
      const source = map.getSource(routerSourceAlternateIdList[index]) as maplibregl.GeoJSONSource;
      source.setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: (alternate as ParsedDirectionsGeometry).decodedGeometry.map((coord) => [coord[1], coord[0]])
        },
        properties: {}
      });
    });
  }
};

onMounted(() => {
  initMap();
  initWayPoints();
});

onUnmounted(() => {
  if (map) map.remove();
});
</script>
<style lang="css" scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: none;
  z-index: 1000;
  min-width: 150px;
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 5px 0;
}

.context-menu li {
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
}

.context-menu li:hover {
  background-color: #f5f5f5;
}

.context-menu hr {
  margin: 5px 0;
  border: none;
  border-top: 1px solid #eee;
}
</style>
