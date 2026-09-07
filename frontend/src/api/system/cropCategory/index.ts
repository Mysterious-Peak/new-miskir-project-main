import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CropCategoryVO, CropCategoryForm, CropCategoryQuery } from '@/api/system/cropCategory/types';

/**
 * 查询Crop Category Management列表
 * @param query
 * @returns {*}
 */

export const listCropCategory = (query?: CropCategoryQuery): AxiosPromise<CropCategoryVO[]> => {
  return request({
    url: '/system/cropCategory/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询Crop Category Management详细
 * @param id
 */
export const getCropCategory = (id: string | number): AxiosPromise<CropCategoryVO> => {
  return request({
    url: '/system/cropCategory/' + id,
    method: 'get'
  });
};

/**
 * 新增Crop Category Management
 * @param data
 */
export const addCropCategory = (data: CropCategoryForm) => {
  return request({
    url: '/system/cropCategory',
    method: 'post',
    data: data
  });
};

/**
 * 修改Crop Category Management
 * @param data
 */
export const updateCropCategory = (data: CropCategoryForm) => {
  return request({
    url: '/system/cropCategory',
    method: 'put',
    data: data
  });
};

/**
 * 删除Crop Category Management
 * @param id
 */
export const delCropCategory = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/cropCategory/' + id,
    method: 'delete'
  });
};
