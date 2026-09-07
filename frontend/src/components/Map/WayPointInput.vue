<template>
  <div class="flex items-center gap-2">
    <!-- <el-input v-model="waypoint.userInput" style="width: 240px" placeholder="Please input" @change="onInputChange" /> -->
    <el-autocomplete
      v-model="waypoint.userInput"
      :fetch-suggestions="querySearchAsync"
      :trigger-on-focus="false"
      placeholder="Please input"
      @select="handleSelect"
    />
    <el-icon class="is-loading" v-if="waypoint.isFetching">
      <Loading />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { forward_geocode, parseGeocodeResponse } from '@/map/nominatim';
import { propTypes } from '@/utils/propTypes';

const props = defineProps({
  waypoint: propTypes.any,
  onWayPointInputChange: propTypes.func
});

const addresses = ref();

const onInputChange = (value) => {
  console.log(value);
  // forward_geocode(value).then(async (response) => {
  //   addresses.value = parseGeocodeResponse(response.data, undefined);
  //   if (addresses.value.length === 0) {
  //     // proxy?.$modal.alertWarning('no addresses can be found.');
  //     return;
  //   }
  //   props.onWayPointInputChange(props.waypoint.id, addresses);
  // });
};

let timeout: ReturnType<typeof setTimeout>;
const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  props.waypoint.decodedGeometry = [];
  forward_geocode(queryString).then(async (response) => {
    addresses.value = parseGeocodeResponse(response.data, undefined);
    if (addresses.value.length === 0) {
      return;
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const list = addresses.value.map((item) => {
        return { value: item.title, key: item.key };
      });

      cb(list);
    }, 2000);
  });
};

const handleSelect = (item: Record<string, any>) => {
  addresses.value = addresses.value.map((address, index) =>
    index == item.key
      ? {
          ...address,
          selected: true
        }
      : {
          ...address,
          selected: false
        }
  );
  props.onWayPointInputChange(props.waypoint.id, addresses.value);
};
</script>
