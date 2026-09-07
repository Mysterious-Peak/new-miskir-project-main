import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CropMasterVO, CropMasterForm, CropMasterQuery } from '@/api/demo/cropMaster/types';

/**
 * 查询作物主数据列表
 * @param query
 * @returns {*}
 */

export const listCropMaster = (query?: CropMasterQuery): AxiosPromise<CropMasterVO[]> => {
  return request({
    url: '/demo/cropMaster/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询作物主数据详细
 * @param id
 */
export const getCropMaster = (id: string | number): AxiosPromise<CropMasterVO> => {
  return request({
    url: '/demo/cropMaster/' + id,
    method: 'get'
  });
};

/**
 * 新增作物主数据
 * @param data
 */
export const addCropMaster = (data: CropMasterForm) => {
  return request({
    url: '/demo/cropMaster',
    method: 'post',
    data: data
  });
};

/**
 * 修改作物主数据
 * @param data
 */
export const updateCropMaster = (data: CropMasterForm) => {
  return request({
    url: '/demo/cropMaster',
    method: 'put',
    data: data
  });
};

/**
 * 删除作物主数据
 * @param id
 */
export const delCropMaster = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/cropMaster/' + id,
    method: 'delete'
  });
};
