<template>
  <div :class="{ 'has-logo': showLogo }" :style="{ backgroundColor: bgColor }">
    <!-- <logo v-if="showLogo" :collapse="isCollapse" /> -->
    <el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper">
      <!-- 圆形收缩按钮 -->
      <div class="sidebar-collapse-btn" :class="{ 'is-collapsed': isCollapse }" @click="toggleSideBar">
        <el-icon :size="16">
          <ArrowLeft />
        </el-icon>
      </div>

      <transition :enter-active-class="proxy?.animate.menuSearchAnimate.enter" mode="out-in">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :background-color="bgColor"
          :text-color="textColor"
          :unique-opened="true"
          :active-text-color="theme"
          :collapse-transition="false"
          :popper-offset="12"
          mode="vertical"
        >
          <sidebar-item v-for="(r, index) in sidebarRouters" :key="r.path + index" :item="r" :base-path="r.path" />
        </el-menu>
      </transition>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import Logo from './Logo.vue';
import SidebarItem from './SidebarItem.vue';
import variables from '@/assets/styles/variables.module.scss';
import { useAppStore } from '@/store/modules/app';
import { useSettingsStore } from '@/store/modules/settings';
import { usePermissionStore } from '@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const route = useRoute();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const sidebarRouters = computed<RouteRecordRaw[]>(() => permissionStore.getSidebarRoutes());
const showLogo = computed(() => settingsStore.sidebarLogo);
const sideTheme = computed(() => settingsStore.sideTheme);
const theme = computed(() => settingsStore.theme);
const isCollapse = computed(() => !appStore.sidebar.opened);

const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
});

// 切换侧边栏
const toggleSideBar = () => {
  appStore.toggleSideBar(false);
};

const bgColor = computed(() => (sideTheme.value === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground));
const textColor = computed(() => (sideTheme.value === 'theme-dark' ? variables.menuColor : variables.menuLightColor));
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.module.scss' as *;

/* 圆形收缩按钮样式 - 与现有CSS结合 */
.sidebar-collapse-btn {
  position: fixed;
  top: 80px; /* 60px 顶栏 + 20px 侧栏内距，与参考项目折叠按钮对齐 */
  left: 280px; /* 与参考项目的默认侧栏宽度一致 */
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1002; /* 确保在侧边栏之上 */
  transition: all 0.3s ease;
  transform: translateX(-50%); /* 一半在里面，一半在外面 */

  /* 按钮悬停效果 */
  &:hover {
    background-color: #f0f0f0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    transform: translateX(-50%) scale(1.1);
  }

  /* 按钮点击效果 */
  &:active {
    transform: translateX(-50%) scale(0.95);
  }

  /* 图标样式 */
  .el-icon {
    color: #000;
    font-weight: bold;
    transition: transform 0.3s ease;
  }

  /* 侧边栏展开状态 - 向左箭头 */
  &:not(.is-collapsed) {
    .el-icon {
      transform: rotate(0deg);
    }
  }

  /* 侧边栏折叠状态 - 向右箭头 */
  &.is-collapsed {
    left: 64px;
    .el-icon {
      transform: rotate(180deg); /* 旋转180度变成向右 */
    }
  }

  // /* 侧边栏折叠状态 */
  // &.is-collapsed {
  //   left: 64px; /* 折叠后的侧边栏宽度 */

  //   .el-icon {
  //     transform: rotate(180deg);
  //   }
  // }

  /* 确保侧边栏容器的溢出不会隐藏按钮 */
  .sidebar-container {
    overflow: visible !important;
  }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
  .sidebar-collapse-btn {
    left: 200px;
  }
}

@media screen and (max-width: 768px) {
  /* Mobile navigation is opened from the navbar hamburger. */
  .sidebar-collapse-btn {
    display: none;
  }
}
</style>
