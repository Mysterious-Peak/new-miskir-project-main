<template>
  <div :class="classObj" class="app-wrapper" :style="{ '--current-color': theme }">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <side-bar v-if="!sidebar.hide" class="sidebar-container" />
    <div :class="{ 'fixed-header': fixedHeader }" class="header-fixed-container">
      <!-- Navbar 固定在顶部 -->
      <div class="navbar-wrapper">
        <navbar ref="navbarRef" @set-layout="setLayout" />
      </div>
    </div>
    <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
      <!-- <el-scrollbar>
        <div :class="{ 'fixed-header': fixedHeader }">
          <navbar ref="navbarRef" @setLayout="setLayout" />
          <tags-view v-if="needTagsView" />
        </div>
        <app-main />
        <settings ref="settingRef" />
      </el-scrollbar> -->
      <div class="header-placeholder"></div>
      <div v-if="needTagsView" class="tagsview-wrapper">
        <tags-view v-if="needTagsView" class="tags-fixed" />
      </div>
      <div class="banner-fixed">
        <banner :title="pageTitle" :description="pageDescription" :icon="pageIcon" :showBack="showBack" :backRoutePath="showPath" />
      </div>
      <app-main />
      <settings ref="settingRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './components/Sidebar/index.vue';
import { AppMain, Navbar, Settings, TagsView } from './components';
import { useAppStore } from '@/store/modules/app';
import { useSettingsStore } from '@/store/modules/settings';
import { initWebSocket } from '@/utils/websocket';
import { initSSE } from '@/utils/sse';

const settingsStore = useSettingsStore();
const theme = computed(() => settingsStore.theme);
const sidebar = computed(() => useAppStore().sidebar);
const device = computed(() => useAppStore().device);
const needTagsView = computed(() => settingsStore.tagsView);
const fixedHeader = computed(() => settingsStore.fixedHeader);

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile',
  hasTagsView: needTagsView,
  sidebarHide: sidebar.value.hide
}));

const { width } = useWindowSize();
const WIDTH = 992; // refer to Bootstrap's responsive design

watchEffect(() => {
  if (device.value === 'mobile') {
    useAppStore().closeSideBar({ withoutAnimation: false });
  }
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile');
    useAppStore().closeSideBar({ withoutAnimation: true });
  } else {
    useAppStore().toggleDevice('desktop');
  }
});

const navbarRef = ref<InstanceType<typeof Navbar>>();
const settingRef = ref<InstanceType<typeof Settings>>();

const route = useRoute();
// 获取当前页面标题,副标题和icon
const pageTitle = computed(() => {
  return (route.query.title as string) || route.meta?.title || getRouteTitle(route);
});

const pageDescription = computed(() => {
  return (route.query.description as string) || route.meta?.description || 'description';
});

const pageIcon = computed(() => {
  return route.meta?.icon;
});

const showBack = computed(() => {
  return route.meta?.showBack === '1' || false;
});

const showPath = computed(() => {
  return route.meta?.showPath;
});

// 递归获取路由标题
const getRouteTitle = (route) => {
  if (route.meta?.title) {
    return route.meta.title;
  }

  if (route.name) {
    return String(route.name);
  }

  return '管理页面';
};

onMounted(() => {
  nextTick(() => {
    navbarRef.value?.initTenantList();
  });
});

onMounted(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + '/resource/websocket');
});

onMounted(() => {
  initSSE(import.meta.env.VITE_APP_BASE_API + '/resource/sse');
});

const handleClickOutside = () => {
  useAppStore().closeSideBar({ withoutAnimation: false });
};

const setLayout = () => {
  settingRef.value?.openSetting();
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixin.scss';
@use '@/assets/styles/variables.module.scss' as *;

.app-wrapper {
  @include mixin.clearfix;
  position: relative;
  // height: 100%;
  width: 100%;
  background-color: #f0f2f5;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.main-container {
  margin-left: 20px;
  margin-right: 20px;
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.tags-fixed {
  position: relative;
  z-index: 2;
}

// 固定头部容器
.header-fixed-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2001; /* 确保在侧边栏之上 */
  // background: transparent;  /* 添加背景色 */

  &.fixed-header {
    width: 100%; /* 默认侧边栏打开时的宽度 */
    transition: all 0.28s;
  }
}

/* Navbar 包装器 */
.navbar-wrapper {
  height: 60px;
  background: #009a44;
}

/* TagsView 包装器，与 Navbar 有20px间隔 */
.tagsview-wrapper {
  margin-bottom: 20px;
  margin-left: 20px;
  // margin-right: 20px;
  // background: transparent;
}

.header-placeholder {
  height: 80px; /* 根据 Navbar 的实际高度调整 */
  width: 100%;
  // background: transparent;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: 100%;
  transition: width 0.28s;
  // background: transparent;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}

/* Banner 容器 */
.banner-fixed {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  margin-left: 20px;
}
</style>
