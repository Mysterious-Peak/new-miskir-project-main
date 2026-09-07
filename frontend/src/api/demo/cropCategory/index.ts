import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CropCategoryVO, CropCategoryForm, CropCategoryQuery } from '@/api/demo/cropCategory/types';

/**
 * 查询Crop category Management列表
 * @param query
 * @returns {*}
 */

export const listCropCategory = (query?: CropCategoryQuery): AxiosPromise<CropCategoryVO[]> => {
  return request({
    url: '/demo/cropCategory/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询Crop category Management详细
 * @param id
 */
export const getCropCategory = (id: string | number): AxiosPromise<CropCategoryVO> => {
  return request({
    url: '/demo/cropCategory/' + id,
    method: 'get'
  });
};

/**
 * 新增Crop category Management
 * @param data
 */
export const addCropCategory = (data: CropCategoryForm) => {
  return request({
    url: '/demo/cropCategory',
    method: 'post',
    data: data
  });
};

/**
 * 修改Crop category Management
 * @param data
 */
export const updateCropCategory = (data: CropCategoryForm) => {
  return request({
    url: '/demo/cropCategory',
    method: 'put',
    data: data
  });
};

/**
 * 删除Crop category Management
 * @param id
 */
export const delCropCategory = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/cropCategory/' + id,
    method: 'delete'
  });
};
