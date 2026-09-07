// RemixIcon 同名包装组件：渲染 <i class="ri-..."> 字体图标
// 与 R&D 门户同源（remixicon v4.9.1 字体，本地自托管，见 assets/remixicon/remixicon.css）
// 在 plugins/svgicon.ts 中于 Element Plus 全套注册之后追加注册，覆盖同名 EP 图标，
// 因此模板中 icon="Search" / <Tickets /> 等用法无需任何改动。
import { h } from 'vue';
import type { FunctionalComponent, VNode } from 'vue';

const createIcon = (cls: string): FunctionalComponent => {
  const render = (): VNode => h('i', { class: cls, 'aria-hidden': 'true' });
  return render;
};

// Search 按钮 -> ri-search-line
export const Search = createIcon('ri-search-line');
// Reset 按钮 -> ri-refresh-line
export const Refresh = createIcon('ri-refresh-line');
// Add 按钮 -> ri-add-line（模板用 EP 名称 Plus）
export const Plus = createIcon('ri-add-line');
// View 按钮 -> ri-eye-line
export const View = createIcon('ri-eye-line');
// Edit 按钮 -> ri-edit-line
export const Edit = createIcon('ri-edit-line');
// Delete 按钮 -> ri-delete-bin-line
export const Delete = createIcon('ri-delete-bin-line');
// 表格标题（XXX List）图标 -> ri-file-list-3-line（模板用 EP 名称 Tickets）
export const Tickets = createIcon('ri-file-list-3-line');
// Submit 按钮 -> ri-send-plane-line（新增组件名 SendPlane）
export const SendPlane = createIcon('ri-send-plane-line');