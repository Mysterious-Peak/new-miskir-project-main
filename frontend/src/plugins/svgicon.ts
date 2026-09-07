import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import * as RemixIcons from './remixIcons';
import { App } from 'vue';

export default {
  install: (app: App) => {
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component);
    }
    // RemixIcon 同名覆盖（后注册覆盖先注册）：Search/Refresh/Plus/View/Edit/Delete/Tickets + 新增 SendPlane
    for (const [key, component] of Object.entries(RemixIcons)) {
      app.component(key, component);
    }
  }
};
