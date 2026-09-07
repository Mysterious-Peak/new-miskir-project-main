import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { HarvestCollectionVO, HarvestCollectionForm, HarvestCollectionQuery } from '@/api/demo/harvestCollection/types';

/**
 * 查询收获登记列表
 * @param query
 * @returns {*}
 */

export const listHarvestCollection = (query?: HarvestCollectionQuery): AxiosPromise<HarvestCollectionVO[]> => {
  return request({
    url: '/demo/harvestCollection/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询收获登记详细
 * @param id
 */
export const getHarvestCollection = (id: string | number): AxiosPromise<HarvestCollectionVO> => {
  return request({
    url: '/demo/harvestCollection/' + id,
    method: 'get'
  });
};

/**
 * 新增收获登记
 * @param data
 */
export const addHarvestCollection = (data: HarvestCollectionForm) => {
  return request({
    url: '/demo/harvestCollection',
    method: 'post',
    data: data
  });
};

/**
 * 修改收获登记
 * @param data
 */
export const updateHarvestCollection = (data: HarvestCollectionForm) => {
  return request({
    url: '/demo/harvestCollection',
    method: 'put',
    data: data
  });
};

/**
 * 删除收获登记
 * @param id
 */
export const delHarvestCollection = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/harvestCollection/' + id,
    method: 'delete'
  });
};
