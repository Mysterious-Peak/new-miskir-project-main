import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LandPreparationVO, LandPreparationForm, LandPreparationQuery } from '@/api/demo/landPreparation/types';

/**
 * 查询土地准备记录列表
 * @param query
 * @returns {*}
 */

export const listLandPreparation = (query?: LandPreparationQuery): AxiosPromise<LandPreparationVO[]> => {
  return request({
    url: '/demo/landPreparation/list',
    method: 'get',
    params: query
  });
};

export const listLandPreparationApprove = (query?: LandPreparationQuery): AxiosPromise<LandPreparationVO[]> => {
  return request({
    url: '/demo/landPreparation/list/approved',
    method: 'get',
    params: query
  });
};

/**
 * 查询土地准备记录详细
 * @param landprepId
 */
export const getLandPreparation = (landprepId: string | number): AxiosPromise<LandPreparationVO> => {
  return request({
    url: '/demo/landPreparation/' + landprepId,
    method: 'get'
  });
};

/** Load the latest record for a production season when creating a new record. */
export const getLatestLandPreparationByProdSeason = (prodSeasonId: string | number): AxiosPromise<LandPreparationVO> => {
  return request({
    url: '/demo/landPreparation/latestByProdSeason/' + prodSeasonId,
    method: 'get'
  });
};

/**
 * 新增土地准备记录
 * @param data
 */
export const addLandPreparation = (data: LandPreparationForm) => {
  return request({
    url: '/demo/landPreparation',
    method: 'post',
    data: data
  });
};

/**
 * 修改土地准备记录
 * @param data
 */
export const updateLandPreparation = (data: LandPreparationForm) => {
  return request({
    url: '/demo/landPreparation',
    method: 'put',
    data: data
  });
};

/**
 * 删除土地准备记录
 * @param landprepId
 */
export const delLandPreparation = (landprepId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/landPreparation/' + landprepId,
    method: 'delete'
  });
};
