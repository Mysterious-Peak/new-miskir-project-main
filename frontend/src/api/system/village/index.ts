import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { VillageVO, VillageForm, VillageQuery } from '@/api/system/village/types';

/**
 * 查询village列表
 * @param query
 * @returns {*}
 */

export const listVillage = (query?: VillageQuery): AxiosPromise<VillageVO[]> => {
  return request({
    url: '/system/village/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询village详细
 * @param id
 */
export const getVillage = (id: string | number): AxiosPromise<VillageVO> => {
  return request({
    url: '/system/village/' + id,
    method: 'get'
  });
};

/**
 * 新增village
 * @param data
 */
export const addVillage = (data: VillageForm) => {
  return request({
    url: '/system/village',
    method: 'post',
    data: data
  });
};

/**
 * 修改village
 * @param data
 */
export const updateVillage = (data: VillageForm) => {
  return request({
    url: '/system/village',
    method: 'put',
    data: data
  });
};

/**
 * 删除village
 * @param id
 */
export const delVillage = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/village/' + id,
    method: 'delete'
  });
};
