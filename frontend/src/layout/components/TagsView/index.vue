<template>
  <div id="tags-view-container" class="tags-view-container">
    <div class="tags-view-scroll-container">
      <!-- 向左滚动按钮 -->
      <div class="scroll-button scroll-button-left" @click="scrollLeft">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <!-- 标签容器 -->
      <div ref="scrollContainerRef" class="tags-view-wrapper" @wheel="handleWheel">
        <div ref="tagsWrapperRef" class="tags-view-items-wrapper" :style="{ transform: `translateX(${translateX}px)` }">
          <router-link
            v-for="tag in visitedViews"
            :key="tag.path"
            :data-path="tag.path"
            :class="{ 'active': isActive(tag), 'has-icon': tagsIcon }"
            :to="{ path: tag.path ? tag.path : '', query: tag.query, fullPath: tag.fullPath ? tag.fullPath : '' }"
            class="tags-view-item"
            :style="activeStyle(tag)"
            @click.middle="!isAffix(tag) && canCloseTag(tag) ? closeSelectedTag(tag) : ''"
            @contextmenu.prevent="openMenu(tag, $event)"
          >
            <svg-icon v-if="tagsIcon && tag.meta && tag.meta.icon && tag.meta.icon !== '#'" :icon-class="tag.meta.icon" />
            <span class="tags-view-item-title">{{ tag.title }}</span>
            <span v-if="!isAffix(tag) && canCloseTag(tag)" @click.prevent.stop="closeSelectedTag(tag)">
              <close class="el-icon-close" style="width: 1em; height: 1em; vertical-align: middle" />
            </span>
          </router-link>
        </div>
      </div>

      <!-- 向右滚动按钮 -->
      <div v-if="canScrollRight" class="scroll-button scroll-button-right" @click="scrollRight">
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>
    <!-- <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-path="tag.path"
        :class="{ 'active': isActive(tag), 'has-icon': tagsIcon }"
        :to="{ path: tag.path ? tag.path : '', query: tag.query, fullPath: tag.fullPath ? tag.fullPath : '' }"
        class="tags-view-item"
        :style="activeStyle(tag)"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        <svg-icon v-if="tagsIcon && tag.meta && tag.meta.icon && tag.meta.icon !== '#'" :icon-class="tag.meta.icon"/>
        <span class="tags-view-item-title">{{ tag.title }}</span>
        <span v-if="!isAffix(tag)" @click.prevent.stop="closeSelectedTag(tag)">
          <close class="el-icon-close" style="width: 1em; height: 1em; vertical-align: middle" />
        </span>
      </router-link>
    </scroll-pane> -->
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)"><refresh-right style="width: 1em; height: 1em" /> Refresh page</li>
      <li v-if="!isAffix(selectedTag) && canCloseTag(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <close style="width: 1em; height: 1em" /> Close current
      </li>
      <li @click="closeOthersTags"><circle-close style="width: 1em; height: 1em" /> Close others</li>
      <li v-if="!isFirstView()" @click="closeLeftTags"><back style="width: 1em; height: 1em" /> Close left</li>
      <li v-if="!isLastView()" @click="closeRightTags"><right style="width: 1em; height: 1em" /> Close right</li>
      <li @click="closeAllTags(selectedTag)"><circle-close style="width: 1em; height: 1em" /> Close all</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Close, RefreshRight, CircleClose, Back, Right } from '@element-plus/icons-vue';
// import ScrollPane from './ScrollPane.vue';
import { getNormalPath } from '@/utils/ruoyi';
import { useSettingsStore } from '@/store/modules/settings';
import { usePermissionStore } from '@/store/modules/permission';
import { useTagsViewStore } from '@/store/modules/tagsView';
import { RouteRecordRaw, RouteLocationNormalized } from 'vue-router';

const visible = ref(false);
const top = ref(0);
const left = ref(0);
const selectedTag = ref<RouteLocationNormalized>();
const affixTags = ref<RouteLocationNormalized[]>([]);
// const scrollPaneRef = ref<InstanceType<typeof ScrollPane>>();
const translateX = ref(0); // 标签容器的水平偏移量
const scrollContainerRef = ref<HTMLElement>(); // 滚动容器引用
const tagsWrapperRef = ref<HTMLElement>(); // 标签包装器引用
const canScrollLeft = ref(false); // 是否可以向左滚动
const canScrollRight = ref(false); // 是否可以向右滚动
const containerWidth = ref(0); // 容器宽度
const wrapperWidth = ref(0); // 标签总宽度

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const visitedViews = computed(() => useTagsViewStore().getVisitedViews());
const routes = computed(() => usePermissionStore().getRoutes());
const theme = computed(() => useSettingsStore().theme);
const tagsIcon = computed(() => useSettingsStore().tagsIcon);

watch(route, () => {
  addTags();
  moveToCurrentTag();
});
watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu);
  } else {
    document.body.removeEventListener('click', closeMenu);
  }
});

// 监听标签变化和窗口大小变化，更新滚动按钮状态
watch(
  visitedViews,
  () => {
    nextTick(() => {
      updateContainerDimensions();
      updateScrollButtons();
    });
  },
  { deep: true }
);

const isActive = (r: RouteLocationNormalized): boolean => {
  return r.path === route.path;
};
const activeStyle = (tag: RouteLocationNormalized) => {
  if (!isActive(tag)) return {};
  return {
    'background-color': 'var(--tags-view-active-bg)',
    'border-color': 'var(--tags-view-active-border-color)',
    'color': 'var(--tags-view-active-color)'
  };
};
const isAffix = (tag: RouteLocationNormalized) => {
  return tag?.meta && tag?.meta?.affix;
};
const isFirstView = () => {
  try {
    return selectedTag.value.fullPath === '/index' || selectedTag.value.fullPath === visitedViews.value[1].fullPath;
  } catch (err) {
    return false;
  }
};
const isLastView = () => {
  try {
    return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1].fullPath;
  } catch (err) {
    return false;
  }
};

const nonAffixTagsCount = computed(() => {
  return visitedViews.value.filter((tag) => !isAffix(tag)).length;
});

// 判断是否可以关闭当前标签（只剩一个非固定标签时不能关闭）
const canCloseTag = (tag: RouteLocationNormalized) => {
  if (isAffix(tag)) return false; // 固定标签不能关闭
  return nonAffixTagsCount.value > 1; // 只剩一个非固定标签时不能关闭
};

// 判断是否可以关闭其他标签
const canCloseOthersTags = computed(() => {
  return nonAffixTagsCount.value > 1;
});

// 判断是否可以全部关闭
const canCloseAllTags = computed(() => {
  return nonAffixTagsCount.value > 1;
});

const filterAffixTags = (routes: RouteRecordRaw[], basePath = '') => {
  let tags: RouteLocationNormalized[] = [];

  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + '/' + route.path);
      tags.push({
        hash: '',
        matched: [],
        params: undefined,
        query: undefined,
        redirectedFrom: undefined,
        fullPath: tagPath,
        path: tagPath,
        name: route.name as string,
        meta: { ...route.meta }
      });
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
};
const initTags = () => {
  const homePath = usePermissionStore().getHomePath();
  const menu = router.getRoutes();
  const homeTag = menu.filter((item) => item.path === homePath);
  if (homeTag.length > 0) {
    const tag = {
      hash: '',
      matched: [],
      params: undefined,
      query: undefined,
      redirectedFrom: undefined,
      fullPath: homeTag[0].path,
      path: homeTag[0].path,
      name: homeTag[0].name as string,
      meta: { ...homeTag[0].meta }
    };
    useTagsViewStore().addVisitedView(tag);
  }
};
const addTags = () => {
  const { name } = route;
  if (route.query.title) {
    route.meta.title = route.query.title as string;
  }
  if (name) {
    useTagsViewStore().addView(route as any);
  }
};
const moveToCurrentTag = () => {
  nextTick(() => {
    for (const r of visitedViews.value) {
      if (r.path === route.path) {
        scrollToTag(r);
        // when query is different then update
        if (r.fullPath !== route.fullPath) {
          useTagsViewStore().updateVisitedView(route);
        }
      }
    }
  });
};
const refreshSelectedTag = (view: RouteLocationNormalized) => {
  proxy?.$tab.refreshPage(view);
  if (route.meta.link) {
    useTagsViewStore().delIframeView(route);
  }
};
const closeSelectedTag = (view: RouteLocationNormalized) => {
  if (!canCloseTag(view)) {
    return;
  }
  proxy?.$tab.closePage(view).then(({ visitedViews }: any) => {
    if (isActive(view)) {
      toLastView(visitedViews, view);
    }
  });
};
const closeRightTags = () => {
  proxy?.$tab.closeRightPage(selectedTag.value).then((visitedViews: RouteLocationNormalized[]) => {
    if (!visitedViews.find((i: RouteLocationNormalized) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews);
    }
  });
};
const closeLeftTags = () => {
  proxy?.$tab.closeLeftPage(selectedTag.value).then((visitedViews: RouteLocationNormalized[]) => {
    if (!visitedViews.find((i: RouteLocationNormalized) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews);
    }
  });
};
const closeOthersTags = () => {
  if (!canCloseOthersTags.value) {
    return;
  }
  router.push(selectedTag.value).catch(() => {});
  proxy?.$tab.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag();
  });
};
const closeAllTags = (view: RouteLocationNormalized) => {
  if (!canCloseAllTags.value) {
    return;
  }
  proxy?.$tab.closeAllPage().then(({ visitedViews }) => {
    if (affixTags.value.some((tag) => tag.path === route.path)) {
      return;
    }
    toLastView(visitedViews, view);
  });
};
const toLastView = (visitedViews: RouteLocationNormalized[], view?: RouteLocationNormalized) => {
  const latestView = visitedViews.slice(-1)[0];
  if (latestView) {
    router.push(latestView.fullPath as string);
  }
};
const openMenu = (tag: RouteLocationNormalized, e: MouseEvent) => {
  const menuMinWidth = 105;
  const offsetLeft = proxy?.$el.getBoundingClientRect().left; // container margin left
  const offsetWidth = proxy?.$el.offsetWidth; // container width
  const maxLeft = offsetWidth - menuMinWidth; // left boundary
  const l = e.clientX - offsetLeft + 15; // 15: margin right

  if (l > maxLeft) {
    left.value = maxLeft;
  } else {
    left.value = l;
  }

  top.value = e.clientY;
  visible.value = true;
  selectedTag.value = tag;
};
const closeMenu = () => {
  visible.value = false;
};

onMounted(() => {
  initTags();
  addTags();
});

// 处理鼠标滚轮滚动
const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  const delta = event.deltaY || event.deltaX;

  if (delta > 0) {
    // 向下或向右滚动
    scrollRight();
  } else {
    // 向上或向左滚动
    scrollLeft();
  }
};

// 更新容器和标签的宽度
const updateContainerDimensions = () => {
  if (!scrollContainerRef.value || !tagsWrapperRef.value) return;

  containerWidth.value = scrollContainerRef.value.offsetWidth;
  wrapperWidth.value = tagsWrapperRef.value.offsetWidth;
};

// 向左滚动
const scrollLeft = () => {
  const scrollStep = containerWidth.value * 0.6; // 每次滚动容器宽度的60%
  const newTranslateX = Math.min(0, translateX.value + scrollStep);
  translateX.value = newTranslateX;
  updateScrollButtons();
};

// 向右滚动
const scrollRight = () => {
  const scrollStep = containerWidth.value * 0.6; // 每次滚动容器宽度的60%
  const maxTranslateX = containerWidth.value - wrapperWidth.value;
  const newTranslateX = Math.max(maxTranslateX, translateX.value - scrollStep);
  translateX.value = newTranslateX;
  updateScrollButtons();
};

// 滚动到指定标签
const scrollToTag = (tag: RouteLocationNormalized) => {
  if (!scrollContainerRef.value || !tagsWrapperRef.value) return;

  const containerWidth = scrollContainerRef.value.offsetWidth;
  const wrapperWidth = tagsWrapperRef.value.offsetWidth;

  // 如果所有标签的宽度小于容器宽度，不需要滚动
  if (wrapperWidth <= containerWidth) {
    translateX.value = 0;
    updateScrollButtons();
    return;
  }

  // 找到标签元素
  const tagElements = tagsWrapperRef.value.querySelectorAll('.tags-view-item');
  let targetElement: HTMLElement | null = null;

  tagElements.forEach((el: Element) => {
    if (el.getAttribute('data-path') === tag.path) {
      targetElement = el as HTMLElement;
    }
  });

  if (!targetElement) return;

  const tagLeft = targetElement.offsetLeft;
  const tagWidth = targetElement.offsetWidth;
  const tagRight = tagLeft + tagWidth;

  // 当前可视区域的左右边界
  const visibleLeft = -translateX.value;
  const visibleRight = visibleLeft + containerWidth;

  // 如果标签在可视区域外，滚动到合适位置
  if (tagLeft < visibleLeft) {
    // 标签在可视区域左侧
    translateX.value = -tagLeft + 10; // 稍微留点空隙
  } else if (tagRight > visibleRight) {
    // 标签在可视区域右侧
    translateX.value = -(tagRight - containerWidth) + 10;
  }

  updateScrollButtons();
};

// 更新滚动按钮状态
const updateScrollButtons = () => {
  if (!scrollContainerRef.value || !tagsWrapperRef.value) return;

  updateContainerDimensions();

  const containerWidth = scrollContainerRef.value.offsetWidth;
  const wrapperWidth = tagsWrapperRef.value.offsetWidth;

  // 计算是否可以滚动
  const canScroll = wrapperWidth > containerWidth;

  if (canScroll) {
    // 可以滚动时，根据当前滚动位置决定按钮状态
    canScrollLeft.value = translateX.value < 0;
    canScrollRight.value = translateX.value > containerWidth - wrapperWidth;
  } else {
    // 不能滚动时，重置位置和按钮状态
    translateX.value = 0;
    canScrollLeft.value = false;
    canScrollRight.value = false;
  }
};

// 处理侧边栏变化
const handleSidebarChange = () => {
  // 延迟执行，等待DOM更新完成
  setTimeout(() => {
    updateContainerDimensions();
    updateScrollButtons();
  }, 300); // 与侧边栏动画时间一致
};

// 窗口大小变化时更新滚动按钮
onMounted(() => {
  initTags();
  addTags();

  // 监听窗口大小变化
  window.addEventListener('resize', updateScrollButtons);

  // 初始更新滚动按钮状态
  nextTick(() => {
    updateScrollButtons();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollButtons);
});
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background-color: #fff !important;
  opacity: 1;
  color: #333333;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, 微软雅黑, Arial, sans-serif;
  font-weight: regular;
  font-size: 16px;
  line-height: normal;
  letter-spacing: 0px;
  text-align: left;

  border: none;
  border-radius: 12px;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);

  .tags-view-scroll-container {
    display: flex;
    align-items: center;
    height: 100%;
    position: relative;

    .scroll-button {
      position: absolute;
      top: 0;
      height: 100%;
      width: 30px;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: background-color 0.3s;

      &:hover {
        background-color: rgba(0, 154, 68, 0.1);
      }

      .el-icon {
        font-size: 14px;
        color: #333;
      }

      &.scroll-button-left {
        left: 0;
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
        // box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
        &:hover {
          color: #009a44;
        }
      }

      &.scroll-button-right {
        right: 0;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
        // box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .tags-view-wrapper {
    flex: 1;
    height: 100%;
    overflow: hidden;
    position: relative;
    margin: 0 30px;
    .tags-view-items-wrapper {
      display: inline-flex;
      height: 100%;
      transition: transform 0.3s ease;
      white-space: nowrap;
      padding: 0 5px;
      .tags-view-item {
        display: inline-block;
        position: relative;
        cursor: pointer;
        height: 26px;
        line-height: 25px;
        background-color: #fff !important;
        border: none;
        // color: #495060;
        padding: 0 8px;
        font-size: 12px;
        margin-left: 5px;
        margin-top: 4px;
        // border-radius: 8px;
        flex-shrink: 0;
        text-decoration: none;
        color: #333;

        &:not(:first-child)::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 12px;
          width: 1px;
          background-color: var(--el-border-color-light);
        }

        &:hover {
          color: #1dc244;
          background-color: rgba(0, 154, 68, 0.05);
        }
        &:first-of-type {
          margin-left: 0px;
        }
        // &:last-of-type {
        //   margin-right: 15px;
        // }
        &.active {
          // background-color: #ffffff;
          color: #009a44 !important;
          font-weight: bolder;
          opacity: 1;
          border-radius: 0px;

          &::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: -2px; // 下划线位置
            width: 100%;
            height: 2px;
            background-color: #009a44; // 你的主题绿色
            border-radius: 1px;
            transform: scaleX(1);
            transition: transform 0.3s ease;
          }
        }
        .tags-view-item-title {
          margin-left: 4px;
          margin-right: 3px;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .el-icon-close {
          margin-left: 4px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          transition: all 0.3s;

          &:hover {
            background-color: #f56c6c;
            color: #fff;
          }
        }
      }
    }
  }
  .tags-view-item.active.has-icon::before {
    content: none !important;
  }
  .tags-view-item-title {
    margin-left: 4px;
    margin-right: 3px;
  }
  .contextmenu {
    margin: 0;
    background: var(--el-bg-color);
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
        width: 12px !important;
        height: 12px !important;
      }
    }
  }
}
</style>
