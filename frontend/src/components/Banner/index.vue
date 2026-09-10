<!-- components/Banner/index.vue -->
<template>
  <div class="banner-container" :class="bannerClass">
    <div class="banner-content">
      <!-- 左侧内容区 -->
      <div class="banner-left">
        <!-- 自定义插槽内容 -->
        <div v-if="icon || showBack" class="banner-icon" :class="{ 'clickable': showBack }" @click="handleIconClick">
          <svg-icon :icon-class="resolvedIcon" />
        </div>

        <!-- 文字区域 -->
        <div class="banner-text">
          <h1 v-if="title" class="banner-title">
            {{ title }}
          </h1>

          <p v-if="description" class="banner-description">
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';

interface BannerProps {
  // 主标题
  title?: string;

  // 副标题/描述
  description?: string;

  // 图标组件
  icon?: string;

  //是否显示返回功能
  showBack?: boolean;

  // 是否显示关闭按钮
  showClose?: boolean;

  // 自定义类名
  customClass?: string;

  // 是否固定在顶部
  fixed?: boolean;

  // 是否居中显示
  center?: boolean;

  // 返回路由路径（可选）
  backRoutePath?: string;
}

const props = withDefaults(defineProps<BannerProps>(), {
  title: '',
  description: '',
  icon: undefined,
  showBack: false,
  showClose: false,
  customClass: '',
  fixed: false,
  center: false,
  backRoutePath: ''
});

const emit = defineEmits(['close']);
const router = useRouter();
const { proxy } = getCurrentInstance() as any;

// 计算类名
const bannerClass = computed(() => {
  return [
    props.customClass,
    {
      'banner-fixed': props.fixed,
      'banner-center': props.center,
      'has-icon': props.icon
    }
  ]
    .filter(Boolean)
    .join(' ');
});

// 解析图标组件
const resolvedIcon = computed(() => {
  if (props.showBack) {
    return 'caret-back';
  }
  return props.icon || '';
});

// 处理图标点击
const handleIconClick = () => {
  if (!props.showBack) {
    return;
  }
  // 通知父组件（当前 layout 未监听 close，仅保持向后兼容）
  emit('close', {
    backRoutePath: props.backRoutePath
  });
  goBack();
};

// 校验目标路径是否真实注册：resolve 后未落入 404 兜底路由才算有效
const isValidBackTarget = (path: string): boolean => {
  if (!path) {
    return false;
  }
  try {
    const resolved = router.resolve(path);
    if (!resolved || resolved.matched.length === 0) {
      return false;
    }
    // router/index.ts 中 404 兜底路由 path 为 '/:pathMatch(.*)*'
    return !resolved.matched.some((r) => r.path === '/:pathMatch(.*)*');
  } catch (e) {
    return false;
  }
};

// 统一返回导航：目标路径有效 → push；无效 → 历史回退；无历史 → 首页
const navigateBack = () => {
  if (isValidBackTarget(props.backRoutePath)) {
    router.push(props.backRoutePath);
  } else if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
};

// 先关闭当前页签再返回（closePage 恒 resolve，catch 仅兜底）
const goBack = () => {
  if (proxy?.$tab?.closePage) {
    proxy.$tab
      .closePage(router.currentRoute.value)
      .then(() => navigateBack())
      .catch(() => navigateBack());
  } else {
    navigateBack();
  }
};
</script>

<style lang="scss" scoped>
.banner-container {
  width: 100%;
  height: 128px;
  min-height: 128px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #009a44 0%, #00b350 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #ffffff;
}

.banner-content {
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;

  .banner-center & {
    justify-content: center;
    text-align: center;
  }
}

.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  cursor: pointer;

  :deep(.el-icon),
  :deep(svg),
  :deep(img) {
    width: 40px;
    height: 40px;
    color: #ffffff;
    font-size: 40px;
  }
}

.banner-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-width: 0;
}

.banner-title {
  margin: 0;
  color: #ffffff;
  font-family: var(--app-font-family);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-description {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--app-font-family);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.banner-custom {
  margin-top: 8px;

  :deep(*) {
    color: rgba(255, 255, 255, 0.9);
  }
}

.banner-fixed {
  position: sticky;
  top: 24px;
  z-index: 99;
}

@media screen and (max-width: 768px) {
  .banner-container {
    height: auto;
    min-height: 112px;
    padding: 20px 16px;
    margin-bottom: 0;
  }

  .banner-content {
    gap: 16px;
  }

  .banner-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;

    :deep(.el-icon),
    :deep(svg),
    :deep(img) {
      width: 24px;
      height: 24px;
      font-size: 24px;
    }
  }

  .banner-title {
    font-size: 20px;
    line-height: 1.35;
  }

  .banner-description {
    font-size: 14px;
    line-height: 1.4;
  }
}

@media screen and (max-width: 480px) {
  .banner-container {
    min-height: 96px;
    padding: 16px 12px;
    margin-bottom: 0;
    border-radius: 8px;
  }

  .banner-content {
    gap: 12px;
  }

  .banner-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }

  .banner-icon :deep(svg),
  .banner-icon :deep(img),
  .banner-icon :deep(.el-icon) {
    width: 20px;
    height: 20px;
    font-size: 20px;
  }

  .banner-title {
    font-size: 18px;
  }

  .banner-description {
    font-size: 12px;
  }
}
</style>
