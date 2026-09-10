<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggle-click="toggleSideBar" />
    <logo v-if="showLogo" :collapse="false" class="navbar-logo" />
    <!-- <breadcrumb v-if="!settingsStore.topNav" id="breadcrumb-container" class="breadcrumb-container" /> -->
    <top-nav v-if="settingsStore.topNav" id="topmenu-container" class="topmenu-container" />

    <div class="right-menu flex align-center">
      <div class="back-home-btn" @click="goToHome">
        <svg-icon icon-class="Home" class="home-icon" />
        <span class="btn-text">Back to Home</span>
      </div>
      <!-- <el-select
          v-if="userId === 1 && tenantEnabled"
          v-model="companyName"
          class="min-w-244px"
          clearable
          filterable
          reserve-keyword
          :placeholder="proxy.$t('navbar.selectTenant')"
          @change="dynamicTenantEvent"
          @clear="dynamicClearEvent"
        >
          <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"> </el-option>
          <template #prefix><svg-icon icon-class="company" class="el-input__icon input-icon" /></template>
        </el-select> -->

      <!-- <search-menu ref="searchMenuRef" /> -->
      <!-- <el-tooltip content="搜索" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect" @click="openSearchMenu">
            <svg-icon class-name="search-icon" icon-class="search" />
          </div>
        </el-tooltip> -->
      <!-- 消息 -->
      <!-- <el-tooltip :content="proxy.$t('navbar.message')" effect="dark" placement="bottom">
          <div>
            <el-popover placement="bottom" trigger="click" transition="el-zoom-in-top" :width="300" :persistent="false">
              <template #reference>
                <el-badge :value="newNotice > 0 ? newNotice : ''" :max="99">
                  <div class="right-menu-item hover-effect" style="display: block"><svg-icon icon-class="message" /></div>
                </el-badge>
              </template>
              <template #default>
                <notice></notice>
              </template>
            </el-popover>
          </div>
        </el-tooltip> -->
      <!-- <el-tooltip content="Github" effect="dark" placement="bottom">
          <ruo-yi-git id="ruoyi-git" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip :content="proxy.$t('navbar.document')" effect="dark" placement="bottom">
          <ruo-yi-doc id="ruoyi-doc" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip :content="proxy.$t('navbar.full')" effect="dark" placement="bottom">
          <screenfull id="screenfull" class="right-menu-item hover-effect" />
        </el-tooltip> -->

      <!-- <el-tooltip :content="proxy.$t('navbar.language')" effect="dark" placement="bottom">
          <lang-select id="lang-select" class="right-menu-item hover-effect lang-select-item" />
        </el-tooltip> -->

      <!-- <el-tooltip :content="proxy.$t('navbar.layoutSize')" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip> -->
      <div class="avatar-container">
        <el-dropdown class="right-menu-item hover-effect avatar-dropdown" trigger="click" @command="handleCommand">
          <div class="avatar-wrapper">
            <!-- <img :src="userStore.avatar" class="user-avatar" />
            <span class="user-name">{{ userStore.name }}</span> -->
            <img :src="userStore.avatar" class="user-avatar" />
            <span class="user-name">{{ userStore.nickname }}</span>
            <!-- <el-icon> -->
            <!-- <caret-bottom /> -->

            <!-- <span class="user-name">{{ userStore.nickname }}</span> -->
            <!-- </el-icon> -->
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- <router-link v-if="!dynamic" to="/user/profile">
                <el-dropdown-item>{{ proxy.$t('navbar.personalCenter') }}</el-dropdown-item>
              </router-link>
              <el-dropdown-item v-if="settingsStore.showSettings" command="setLayout">
                <span>{{ proxy.$t('navbar.layoutSetting') }}</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span>{{ proxy.$t('navbar.logout') }}</span>
              </el-dropdown-item> -->
              <el-dropdown-item command="logout">
                <span>{{ proxy.$t('navbar.logout') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchMenu from './TopBar/search.vue';
import { useAppStore } from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';
import { useSettingsStore } from '@/store/modules/settings';
import { useNoticeStore } from '@/store/modules/notice';
import { getTenantList } from '@/api/login';
import { dynamicClear, dynamicTenant } from '@/api/system/tenant';
import { TenantVO } from '@/api/types';
import notice from './notice/index.vue';
import router from '@/router';
import { ElMessageBoxOptions } from 'element-plus/es/components/message-box/src/message-box.type';
import Logo from './Sidebar/Logo.vue';
import Hamburger from '@/components/Hamburger/index.vue';

const appStore = useAppStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const noticeStore = storeToRefs(useNoticeStore());
const newNotice = ref(<number>0);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const showLogo = computed(() => settingsStore.sidebarLogo);
const userId = ref(userStore.userId);
const companyName = ref(undefined);
const tenantList = ref<TenantVO[]>([]);
// 是否切换了租户
const dynamic = ref(false);
// 租户开关
const tenantEnabled = ref(true);
// 搜索菜单
const searchMenuRef = ref<InstanceType<typeof SearchMenu>>();

const openSearchMenu = () => {
  searchMenuRef.value?.openSearch();
};

// 动态切换
const dynamicTenantEvent = async (tenantId: string) => {
  if (companyName.value != null && companyName.value !== '') {
    await dynamicTenant(tenantId);
    dynamic.value = true;
    await proxy?.$router.push('/');
    await proxy?.$tab.closeAllPage();
    await proxy?.$tab.refreshPage();
  }
};

const dynamicClearEvent = async () => {
  await dynamicClear();
  dynamic.value = false;
  await proxy?.$router.push('/');
  await proxy?.$tab.closeAllPage();
  await proxy?.$tab.refreshPage();
};

/** 租户列表 */
const initTenantList = async () => {
  const { data } = await getTenantList(true);
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
  }
};

defineExpose({
  initTenantList
});

const toggleSideBar = () => {
  appStore.toggleSideBar(false);
};

const logout = async () => {
  await ElMessageBox.confirm('Are you sure quit system？', 'Tips', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning'
  } as ElMessageBoxOptions);
  userStore.logout().then(() => {
    const contextPath = import.meta.env.VITE_APP_CONTEXT_PATH || '/';
    // 开发模式：跳转到内部登录页
    if (contextPath === '/') {
      router.replace({
        path: '/login',
        query: {
          redirect: encodeURIComponent(router.currentRoute.value.fullPath || '/')
        }
      });
    } else {
      // 生产/SSO 模式：跳转到 OAuth2 授权地址
      const oauthUrl =
        'http://196.189.236.220:30006/auth/oauth2/authorize?response_type=code&client_id=YY&redirect_uri=http%3A%2F%2F196.189.236.220%3A30006%2Fagriculture%2F%23%2Fcallback';
      window.location.href = oauthUrl;
    }

    proxy?.$tab.closeAllPage();
  });
};

const emits = defineEmits(['setLayout']);
const setLayout = () => {
  emits('setLayout');
};
// 定义Command方法对象 通过key直接调用方法
const commandMap: { [key: string]: any } = {
  setLayout,
  logout
};
const handleCommand = (command: string) => {
  // 判断是否存在该方法
  if (commandMap[command]) {
    commandMap[command]();
  }
};
//用深度监听 消息
watch(
  () => noticeStore.state.value.notices,
  (newVal) => {
    newNotice.value = newVal.filter((item: any) => !item.read).length;
  },
  { deep: true }
);
const goToHome = () => {
  window.location.href = 'http://196.189.236.220:30006/agriculture/';
};
</script>

<style lang="scss" scoped>
:deep(.el-select .el-input__wrapper) {
  height: 30px;
}

:deep(.el-badge__content.is-fixed) {
  top: 12px;
}

.flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.navbar {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, rgb(0, 154, 68) 0%, rgb(0, 179, 80) 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-weight: 600;
  font-family:
    Helvetica Neue,
    Helvetica,
    PingFang SC,
    Hiragino Sans GB,
    Microsoft YaHei,
    微软雅黑,
    Arial,
    sans-serif;

  .hamburger-container {
    display: none;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-right: 12px;
    padding: 0 !important;
    border-radius: 8px;

    :deep(.hamburger) {
      fill: #ffffff;
    }
  }

  .navbar-logo {
    min-width: 0;
    flex: 0 1 auto;
    width: auto;
    max-width: none;
    overflow: hidden;
  }

  .hamburger-container {
    line-height: 40px;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    margin-left: auto;
    height: 52px;
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    line-height: 50px;
    gap: 8px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      // padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #fff;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }

      /* 语言选择器样式 */
      &.lang-select-item {
        display: flex;
        align-items: center;
        height: 32px;

        :deep(.lang-select) {
          display: flex;
          align-items: center;

          .el-dropdown {
            color: #ffffff;

            .el-icon {
              color: #ffffff !important;
              font-size: 18px;
            }
          }
        }
      }

      /* 头像下拉样式 */
      &.avatar-dropdown {
        display: flex;
        align-items: center;
        padding: 6px 12px;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: none;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
          box-shadow: none;
        }

        .avatar-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;

          /* 使用!important确保样式不被覆盖 */
          .user-avatar {
            cursor: pointer;
            width: 38px;
            height: 38px;
            min-width: 38px;
            min-height: 38px;
            max-width: 38px;
            max-height: 38px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 2px 8px rgba(254, 221, 0, 0.3);
            display: block;
          }

          .user-name {
            opacity: 1;
            color: #ffffff;
            font-family:
              Helvetica Neue,
              Helvetica,
              PingFang SC,
              Hiragino Sans GB,
              Microsoft YaHei,
              微软雅黑,
              Arial,
              sans-serif;
            font-weight: 600;
            font-size: 14px;
            line-height: 1.2;
            letter-spacing: 0px;
            text-align: left;
            cursor: pointer;
            white-space: nowrap;
            max-width: 120px;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
  .user-avatar-text {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: linear-gradient(135deg, #fedd00, #ffe94d) !important;
    color: #009a44;
    font-size: 18px;
    font-weight: 700;
    margin-right: 5px;
  }

  .avatar-container {
    margin-right: 0;
    display: flex;
    align-items: center;
    height: 100%;
  }
}

.back-home-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  color: white;
  font-size: 14px;
  font-weight: 600;
  // box-shadow: 0 4px 8px rgba(24, 144, 255, 0.1);
}

.back-home-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.back-home-btn .home-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.user-name {
  font-size: 14px;
  color: #333; /* 根据实际颜色调整 */
}

.navbar-logo {
  float: left;
  left: 10px;
  height: 100%;
  // line-height: 80px; /* 与navbar高度一致 */
}

@media (min-width: 769px) and (max-width: 1024px) {
  .navbar {
    padding: 0 16px;
  }

  .navbar .navbar-logo :deep(.sidebar-title) {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 12px;

    .hamburger-container {
      display: flex;
    }

    .navbar-logo {
      overflow: hidden;
      max-width: min(60%, 240px);
    }

    .navbar-logo :deep(.sidebar-title) {
      font-size: 15px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .right-menu {
      gap: 4px;

      .right-menu-item {
        &.lang-select-item,
        &.avatar-dropdown {
          padding: 6px;
        }

        &.avatar-dropdown .avatar-wrapper .user-avatar {
          width: 38px;
          height: 38px;
        }
      }
    }

    .right-menu .avatar-dropdown .avatar-wrapper .user-name {
      display: none;
    }

    .back-home-btn {
      padding: 8px;
    }

    .back-home-btn .btn-text {
      display: none;
    }
  }
}

@media (max-width: 480px) {
  .navbar-wrapper,
  .navbar {
    height: 56px;
  }

  .navbar .right-menu .avatar-dropdown .avatar-wrapper .user-avatar {
    width: 38px;
    height: 38px;
  }

  .navbar .navbar-logo {
    max-width: 180px;
  }

  .navbar .navbar-logo :deep(.sidebar-title) {
    font-size: 14px;
  }
}
</style>
