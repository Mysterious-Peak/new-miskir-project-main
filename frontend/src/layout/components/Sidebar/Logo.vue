<template>
  <div
    class="sidebar-logo-container"
    :class="{ collapse: collapse }"
    :style="{ backgroundColor: sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground }"
  >
    <transition :enter-active-class="proxy?.animate.logoAnimate.enter" mode="out-in">
      <div class="sidebar-logo-link">
        <h1 class="sidebar-title" :style="{ color: sideTheme === 'theme-dark' ? variables.logoTitleColor : variables.logoLightTitleColor }">
          <svg-icon :icon-class="envIcon" style="font-size: 28px; margin-right: 12px" />{{ envTitle }}
        </h1>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import variables from '@/assets/styles/variables.module.scss';
// import logo from '@/assets/icons/leaf.svg';
import { useSettingsStore } from '@/store/modules/settings';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
});

const title = import.meta.env.VITE_APP_LOGO_TITLE;
const settingsStore = useSettingsStore();
const sideTheme = computed(() => settingsStore.sideTheme);
const contextPath = import.meta.env.VITE_APP_CONTEXT_PATH || '/';
const envConfigs = {
  '/': {
    title: 'Smart Agri Platform',
    icon: 'seedling-line',
    fallbackIcon: 'seedling-line'
  },
  '/farmland/': {
    title: 'Farmland Management',
    icon: 'landscape-line',
    fallbackIcon: 'landscape-line'
  },
  '/production/': {
    title: 'Production Management',
    icon: 'plant-line',
    fallbackIcon: 'plant-line'
  },
  '/harvest/': {
    title: 'Harvest Storage',
    icon: 'shopping-basket-line',
    fallbackIcon: 'shopping-basket-line'
  },
  '/logistics/': {
    title: 'Logistics delivery',
    icon: 'map-pin-line',
    fallbackIcon: 'map-pin-line'
  },
  '/processing/': {
    title: 'Processing & Value Addition',
    icon: 'shopping-cart-line',
    fallbackIcon: 'shopping-cart-line'
  },
  '/sustainability/': {
    title: 'Sustainability and Climate Resilience Stage',
    icon: 'leaf-line',
    fallbackIcon: 'leaf-line'
  }
};
// 计算属性：获取当前环境的标题
const envTitle = computed(() => {
  return envConfigs[contextPath]?.title || envConfigs['/'].title;
});

// 计算属性：获取当前环境的图标
const envIcon = computed(() => {
  return envConfigs[contextPath]?.icon || envConfigs['/'].icon;
});
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: auto;
  min-width: 0;
  height: 100%;
  line-height: normal;
  background-color: transparent !important; /* 确保背景透明 */
  text-align: left;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: auto;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }

    & .sidebar-title {
      font-size: 18px;
      font-weight: 600;
      font-family: var(--app-font-family);
      color: #ffffff !important;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      height: 60px;
      margin: 0;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
