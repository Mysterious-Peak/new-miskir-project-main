import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CropVO, CropForm, CropQuery } from '@/api/demo/crop/types';

/**
 * 查询Crop Management列表
 * @param query
 * @returns {*}
 */

export const listCrop = (query?: CropQuery): AxiosPromise<CropVO[]> => {
  return request({
    url: '/demo/crop/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询Crop Management详细
 * @param id
 */
export const getCrop = (id: string | number): AxiosPromise<CropVO> => {
  return request({
    url: '/demo/crop/' + id,
    method: 'get'
  });
};

/**
 * 新增Crop Management
 * @param data
 */
export const addCrop = (data: CropForm) => {
  return request({
    url: '/demo/crop',
    method: 'post',
    data: data
  });
};

/**
 * 修改Crop Management
 * @param data
 */
export const updateCrop = (data: CropForm) => {
  return request({
    url: '/demo/crop',
    method: 'put',
    data: data
  });
};

/**
 * 删除Crop Management
 * @param id
 */
export const delCrop = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/crop/' + id,
    method: 'delete'
  });
};
