import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { HarvestVO, HarvestForm, HarvestQuery } from '@/api/demo/harvest/types';

/**
 * 查询收获记录列表
 * @param query
 * @returns {*}
 */

export const listHarvest = (query?: HarvestQuery): AxiosPromise<HarvestVO[]> => {
  return request({
    url: '/demo/harvest/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询收获记录详细
 * @param harvestId
 */
export const getHarvest = (harvestId: string | number): AxiosPromise<HarvestVO> => {
  return request({
    url: '/demo/harvest/' + harvestId,
    method: 'get'
  });
};

/**
 * 新增收获记录
 * @param data
 */
export const addHarvest = (data: HarvestForm) => {
  return request({
    url: '/demo/harvest',
    method: 'post',
    data: data
  });
};

/**
 * 修改收获记录
 * @param data
 */
export const updateHarvest = (data: HarvestForm) => {
  return request({
    url: '/demo/harvest',
    method: 'put',
    data: data
  });
};

/**
 * 删除收获记录
 * @param harvestId
 */
export const delHarvest = (harvestId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/harvest/' + harvestId,
    method: 'delete'
  });
};
