import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RegionVO, RegionForm, RegionQuery, SysPubRegionVO, SysPubRegionQuery } from '@/api/demo/region/types';

// ==================== 旧接口（保持 regions/index.vue 兼容） ====================

/**
 * 查询行政区域列表
 * @param query
 * @returns {*}
 */
export const listRegion = (query?: RegionQuery): AxiosPromise<RegionVO[]> => {
  return request({
    url: '/demo/region/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询行政区域详细
 * @param id
 */
export const getRegion = (id: string | number): AxiosPromise<RegionVO> => {
  return request({
    url: '/demo/region/' + id,
    method: 'get'
  });
};

/**
 * 新增行政区域
 * @param data
 */
export const addRegion = (data: RegionForm) => {
  return request({
    url: '/demo/region',
    method: 'post',
    data: data
  });
};

/**
 * 修改行政区域
 * @param data
 */
export const updateRegion = (data: RegionForm) => {
  return request({
    url: '/demo/region',
    method: 'put',
    data: data
  });
};

/**
 * 删除行政区域
 * @param id
 */
export const delRegion = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/region/' + id,
    method: 'delete'
  });
};

// ==================== 新接口（CascadingRegionSelect 使用） ====================

/**
 * 查询行政区划列表 (分页)
 */
export const listPubRegion = (query?: SysPubRegionQuery): AxiosPromise<SysPubRegionVO[]> => {
  return request({
    url: '/demo/pubRegion/list',
    method: 'get',
    params: query
  });
};

/**
 * 按父级编码查询子区域 (级联下拉)
 */
export const listRegionByParent = (parentCode?: string): AxiosPromise<SysPubRegionVO[]> => {
  return request({
    url: '/demo/pubRegion/listByParent',
    method: 'get',
    params: { parentCode }
  });
};

/**
 * 按层级查询区域列表
 */
export const listRegionByGrade = (grade: string): AxiosPromise<SysPubRegionVO[]> => {
  return request({
    url: '/demo/pubRegion/listByGrade/' + grade,
    method: 'get'
  });
};

/**
 * 查询Kebele列表 (层级=5), 支持名称筛选
 */
export const listKebele = (name?: string): AxiosPromise<SysPubRegionVO[]> => {
  return request({
    url: '/demo/pubRegion/kebeleList',
    method: 'get',
    params: { name }
  });
};

/**
 * 获取区域编码的完整路径（级联选择器回显）
 */
export const getRegionPath = (code: string): AxiosPromise<string[]> => {
  return request({
    url: '/demo/pubRegion/path/' + code,
    method: 'get'
  });
};
