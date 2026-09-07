import { defineStore } from 'pinia';
import router, { constantRoutes, dynamicRoutes } from '@/router';
import store from '@/store';
import { getRouters } from '@/api/menu';
import auth from '@/plugins/auth';
import { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';
import ParentView from '@/components/ParentView/index.vue';
import InnerLink from '@/layout/components/InnerLink/index.vue';
import { ref } from 'vue';
import { createCustomNameComponent } from '@/utils/createCustomNameComponent';
import { useUserStore } from './user';

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue');
export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const addRoutes = ref<RouteRecordRaw[]>([]);
  const defaultRoutes = ref<RouteRecordRaw[]>([]);
  const topbarRouters = ref<RouteRecordRaw[]>([]);
  const sidebarRouters = ref<RouteRecordRaw[]>([]);
  let homePath = ''; //新增加主页路径

  const getRoutes = (): RouteRecordRaw[] => {
    return routes.value as RouteRecordRaw[];
  };
  const getDefaultRoutes = (): RouteRecordRaw[] => {
    return defaultRoutes.value as RouteRecordRaw[];
  };
  const getSidebarRoutes = (): RouteRecordRaw[] => {
    return sidebarRouters.value as RouteRecordRaw[];
  };
  const getTopbarRoutes = (): RouteRecordRaw[] => {
    return topbarRouters.value as RouteRecordRaw[];
  };

  const getHomePath = (): string => {
    return homePath; // 添加：获取首页路径
  };

  const setRoutes = (newRoutes: RouteRecordRaw[]): void => {
    addRoutes.value = newRoutes;
    routes.value = constantRoutes.concat(newRoutes);
  };
  const setDefaultRoutes = (routes: RouteRecordRaw[]): void => {
    defaultRoutes.value = constantRoutes.concat(routes);
  };
  const setTopbarRoutes = (routes: RouteRecordRaw[]): void => {
    topbarRouters.value = routes;
  };
  const setSidebarRouters = (routes: RouteRecordRaw[]): void => {
    sidebarRouters.value = routes;
  };

  const setHomePath = (path: string): void => {
    homePath = path;
  };
  const generateRoutes = async (): Promise<RouteRecordRaw[]> => {
    const res = await getRouters();
    const { data } = res;
    const sdata = JSON.parse(JSON.stringify(data));
    const rdata = JSON.parse(JSON.stringify(data));
    const defaultData = JSON.parse(JSON.stringify(data));
    const filterData = filterSideBarMenu(sdata);
    const sidebarRoutes = filterAsyncRouter(filterData);
    const rewriteRoutes = filterAsyncRouter(rdata, undefined, true);
    const defaultRoutes = filterAsyncRouter(defaultData);
    const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
    asyncRoutes.forEach((route) => {
      router.addRoute(route);
    });
    setRoutes(rewriteRoutes);
    setSidebarRouters(constantRoutes.concat(sidebarRoutes));
    setDefaultRoutes(sidebarRoutes);
    setTopbarRoutes(defaultRoutes);
    // 计算首页路径并设置到 userStore
    const homePath = getHomePathFromMenus(filterData);
    //去掉该行 useUserStore().setHomePath(homePath);
    setHomePath(homePath);

    // 路由name重复检查
    duplicateRouteChecker(asyncRoutes, sidebarRoutes);
    return new Promise<RouteRecordRaw[]>((resolve) => resolve(filterData));
  };

  /**
   * 遍历后台传来的路由字符串，转换为组件对象
   * @param asyncRouterMap 后台传来的路由字符串
   * @param lastRouter 上一级路由
   * @param type 是否是重写路由
   */
  const filterAsyncRouter = (asyncRouterMap: RouteRecordRaw[], lastRouter?: RouteRecordRaw, type = false): RouteRecordRaw[] => {
    return asyncRouterMap.filter((route) => {
      if (type && route.children) {
        route.children = filterChildren(route.children, undefined);
      }

      if (route.path === '/system') {
        const roles = useUserStore().roles;
        if (!roles.find((role) => role === 'superadmin')) return false;
      }
      // Layout ParentView 组件特殊处理
      if (route.component?.toString() === 'Layout') {
        route.component = Layout;
      } else if (route.component?.toString() === 'ParentView') {
        route.component = ParentView;
      } else if (route.component?.toString() === 'InnerLink') {
        route.component = InnerLink;
      } else {
        route.component = loadView(route.component, route.name as string);
      }
      if (route.children != null && route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, route, type);
      } else {
        delete route.children;
        delete route.redirect;
      }
      return true;
    });
  };
  const filterChildren = (childrenMap: RouteRecordRaw[], lastRouter?: RouteRecordRaw): RouteRecordRaw[] => {
    let children: RouteRecordRaw[] = [];
    childrenMap.forEach((el) => {
      el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path;
      if (el.children && el.children.length && el.component?.toString() === 'ParentView') {
        children = children.concat(filterChildren(el.children, el));
      } else {
        children.push(el);
      }
    });
    return children;
  };
  return {
    routes,
    topbarRouters,
    sidebarRouters,
    defaultRoutes,
    getHomePath, // 导出获取首页路径的方法
    getRoutes,
    getDefaultRoutes,
    getSidebarRoutes,
    getTopbarRoutes,

    setRoutes,
    generateRoutes,
    setSidebarRouters
  };
});

// 动态路由遍历，验证是否具备权限
export const filterDynamicRoutes = (routes: RouteRecordRaw[]) => {
  const res: RouteRecordRaw[] = [];
  routes.forEach((route) => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route);
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route);
      }
    }
  });
  return res;
};

export const loadView = (view: any, name: string) => {
  let res;
  for (const path in modules) {
    const viewsIndex = path.indexOf('/views/');
    let dir = path.substring(viewsIndex + 7);
    dir = dir.substring(0, dir.lastIndexOf('.vue'));
    if (dir === view) {
      res = createCustomNameComponent(modules[path], { name });
      return res;
    }
  }
  return res;
};

// 非setup
export const usePermissionStoreHook = () => {
  return usePermissionStore(store);
};

interface Route {
  name?: string | symbol;
  path: string;
  children?: Route[];
}

/**
 * 检查路由name是否重复
 * @param localRoutes 本地路由
 * @param routes 动态路由
 */
function duplicateRouteChecker(localRoutes: Route[], routes: Route[]) {
  // 展平
  function flatRoutes(routes: Route[]) {
    const res: Route[] = [];
    routes.forEach((route) => {
      if (route.children) {
        res.push(...flatRoutes(route.children));
      } else {
        res.push(route);
      }
    });
    return res;
  }

  const allRoutes = flatRoutes([...localRoutes, ...routes]);

  const nameList: string[] = [];
  allRoutes.forEach((route) => {
    const name = route.name.toString();
    if (name && nameList.includes(name)) {
      const message = `路由名称: [${name}] 重复, 会造成 404`;
      console.error(message);
      ElNotification({
        title: '路由名称重复',
        message,
        type: 'error'
      });
      return;
    }
    nameList.push(route.name.toString());
  });
}

// 获取环境变量
const contextPath = import.meta.env.VITE_APP_CONTEXT_PATH || '/';

// 环境配置映射
const envConfigs = {
  '/': {
    path: '/'
  },
  '/farmland/': {
    path: '/farmland_management'
  },
  '/production/': {
    path: '/production_management'
  },
  '/harvest/': {
    path: '/post_harvest_storage'
  },
  '/logistics/': {
    path: '/logistics_delivery'
  },
  '/processing/': {
    path: '/processing_value_addition'
  },
  '/sustainability/': {
    path: '/sustainability_climate'
  }
};

const isCurrentPath = (path: string) => {
  if (contextPath === '/') {
    return true;
  } else {
    if (path === envConfigs[contextPath as keyof typeof envConfigs].path) {
      return true;
    }
    return false;
  }
};

const filterSideBarMenu = (asyncRouterMap: RouteRecordRaw[]) => {
  const data = asyncRouterMap.filter((route) => isCurrentPath(route.path));
  return data;
};

/**
 * 从菜单数据中获取首页路径
 */
function getHomePathFromMenus(menus: any[]): string {
  // 如果没有菜单数据，返回默认首页
  if (!menus || menus.length === 0) {
    return '';
  }

  // 找到第一个非隐藏的一级菜单
  const firstVisibleMenu = menus.find((menu) => !menu.hidden);
  if (!firstVisibleMenu) {
    return '';
  }

  // 如果这个一级菜单有子菜单，找到第一个非隐藏的子菜单
  if (firstVisibleMenu.children && firstVisibleMenu.children.length > 0) {
    const firstVisibleChild = firstVisibleMenu.children.find((child) => !child.hidden);
    if (firstVisibleChild && firstVisibleChild.component) {
      // 构建完整路径
      if (firstVisibleMenu.path === '/') {
        return `/${firstVisibleChild.path}`;
      }
      return `${firstVisibleMenu.path}/${firstVisibleChild.path}`;
    }
  }

  // 如果一级菜单没有子菜单或子菜单都隐藏，检查一级菜单是否有组件
  if (firstVisibleMenu.component && firstVisibleMenu.component !== 'Layout') {
    return firstVisibleMenu.path;
  }

  // 如果一级菜单是Layout但没有可用的子菜单，尝试找其他菜单
  for (let i = 1; i < menus.length; i++) {
    const menu = menus[i];
    if (!menu.hidden) {
      return menu.path;
    }
  }

  return '';
}
