import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SeasonMasterVO, SeasonMasterForm, SeasonMasterQuery } from '@/api/demo/seasonMaster/types';

/**
 * 查询季节主数据列表
 * @param query
 * @returns {*}
 */

export const listSeasonMaster = (query?: SeasonMasterQuery): AxiosPromise<SeasonMasterVO[]> => {
  return request({
    url: '/demo/seasonMaster/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询季节主数据详细
 * @param id
 */
export const getSeasonMaster = (id: string | number): AxiosPromise<SeasonMasterVO> => {
  return request({
    url: '/demo/seasonMaster/' + id,
    method: 'get'
  });
};

/**
 * 新增季节主数据
 * @param data
 */
export const addSeasonMaster = (data: SeasonMasterForm) => {
  return request({
    url: '/demo/seasonMaster',
    method: 'post',
    data: data
  });
};

/**
 * 修改季节主数据
 * @param data
 */
export const updateSeasonMaster = (data: SeasonMasterForm) => {
  return request({
    url: '/demo/seasonMaster',
    method: 'put',
    data: data
  });
};

/**
 * 删除季节主数据
 * @param id
 */
export const delSeasonMaster = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/seasonMaster/' + id,
    method: 'delete'
  });
};
