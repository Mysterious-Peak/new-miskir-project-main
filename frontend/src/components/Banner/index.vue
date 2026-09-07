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
  // 基础尺寸
  width: 100%;
  // max-width: 1580px;
  height: 128px;

  // 颜色和渐变
  background: linear-gradient(135deg, #009a44 0%, #15b04f 100%);

  // 圆角
  border-radius: 12px;

  // 内边距
  padding: 24px;

  // 阴影（可选，增强视觉效果）
  box-shadow: 0 4px 20px rgba(0, 154, 68, 0.2);

  // 布局
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  // 文字颜色
  color: #ffffff;

  // 过渡效果
  transition: all 0.3s ease;

  padding: 20px;
}

// 内容布局
.banner-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

// 左侧内容区
.banner-left {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: left;
  gap: 12px;

  // 居中模式
  .banner-center & {
    text-align: center;
  }
}

// 主标题样式
.banner-title {
  opacity: 1;
  color: #ffffff;
  opacity: 1;
  font-family:
    Helvetica Neue,
    Helvetica,
    PingFang SC,
    Hiragino Sans GB,
    Microsoft YaHei,
    微软雅黑,
    Arial,
    sans-serif;
  font-weight: semibold;
  font-size: 24px;
  line-height: normal;
  letter-spacing: 1px;
  text-align: left;

  margin: 0;

  // 文本阴影增强可读性
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

// 副标题/描述样式
.banner-description {
  opacity: 1;
  color: #ffffff;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, 微软雅黑, Arial, sans-serif;
  font-weight: regular;
  font-size: 18px;
  line-height: normal;
  letter-spacing: 0px;
  text-align: left;
}

// 右侧操作区
.banner-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

// 自定义内容区
.banner-custom {
  margin-top: 8px;

  :deep(*) {
    color: rgba(255, 255, 255, 0.9);
  }
}

// 内容布局
.banner-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 左侧内容区
.banner-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;

  // 居中模式
  .banner-center & {
    justify-content: center;
    text-align: center;
  }
}

// 图标容器
.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  background-color: #15b04f;
  border-radius: 16px;
  cursor: pointer;

  // 图标默认大小
  :deep(.el-icon),
  :deep(svg),
  :deep(img) {
    width: 32px; // 默认大小
    height: 32px; // 默认大小
    color: #ffffff;
  }

  // Element Plus 图标
  :deep(.el-icon) {
    font-size: 24px;
  }
}

// 文字区域
.banner-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px; // 标题和描述之间的间距
}

// 主标题样式
.banner-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 18px; // 根据你的字体规范
  line-height: 27px; // 根据你的字体规范（1.5倍）
  margin: 0;

  // 文本阴影增强可读性
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

// 副标题/描述样式
.banner-description {
  font-size: 14px; // 根据你的字体规范
  font-weight: 400;
  line-height: 21px; // 根据你的字体规范（1.5倍）
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

// 右侧操作区
.banner-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

// 固定在顶部的模式
.banner-fixed {
  position: sticky;
  top: 24px;
  z-index: 99;
}

// @media (max-width: 768px) {
//   .banner-container {
//     height: auto;
//     min-height: 128px;
//     padding: 20px;
//   }

//   .banner-content {
//     flex-direction: column;
//     align-items: flex-start;
//     gap: 16px;
//   }

//   .banner-right {
//     width: 100%;
//     justify-content: flex-end;
//   }

//   .banner-center {
//     .banner-content {
//       align-items: center;
//       text-align: center;
//     }

//     .banner-right {
//       justify-content: center;
//     }
//   }
// }
</style>
