import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { VillageVO, VillageForm, VillageQuery } from '@/api/demo/village/types';

/**
 * 查询村子列表
 * @param query
 * @returns {*}
 */

export const listVillage = (query?: VillageQuery): AxiosPromise<VillageVO[]> => {
  return request({
    url: '/demo/village/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询村子详细
 * @param id
 */
export const getVillage = (id: string | number): AxiosPromise<VillageVO> => {
  return request({
    url: '/demo/village/' + id,
    method: 'get'
  });
};

/**
 * 新增村子
 * @param data
 */
export const addVillage = (data: VillageForm) => {
  return request({
    url: '/demo/village',
    method: 'post',
    data: data
  });
};

/**
 * 修改村子
 * @param data
 */
export const updateVillage = (data: VillageForm) => {
  return request({
    url: '/demo/village',
    method: 'put',
    data: data
  });
};

/**
 * 删除村子
 * @param id
 */
export const delVillage = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/village/' + id,
    method: 'delete'
  });
};
