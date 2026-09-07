import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LandPreparationAdvancedVO, LandPreparationAdvancedForm, LandPreparationAdvancedQuery, LandPreparationOperationVO, LandPreparationOperationForm } from '@/api/demo/landPreparationAdvanced/types';

/**
 * 查询进阶土地整理列表
 * @param query
 * @returns {*}
 */

export const listLandPreparationAdvanced = (query?: LandPreparationAdvancedQuery): AxiosPromise<LandPreparationAdvancedVO[]> => {
  return request({
    url: '/demo/landPreparationAdvanced/list',
    method: 'get',
    params: query
  });
};


export const listLandPreparationAdvancedApprove = (query?: LandPreparationAdvancedQuery): AxiosPromise<LandPreparationAdvancedVO[]> => {
  return request({
    url: '/demo/landPreparationAdvanced/list/approved',
    method: 'get',
    params: query
  });
};


/**
 * 查询进阶土地整理详细
 * @param landprepId
 */
export const getLandPreparationAdvanced = (landprepId: string | number): AxiosPromise<LandPreparationAdvancedVO> => {
  return request({
    url: '/demo/landPreparationAdvanced/' + landprepId,
    method: 'get'
  });
};

/**
 * 新增进阶土地整理
 * @param data
 */
export const addLandPreparationAdvanced = (data: LandPreparationAdvancedForm) => {
  return request({
    url: '/demo/landPreparationAdvanced',
    method: 'post',
    data: data
  });
};

/**
 * 修改进阶土地整理
 * @param data
 */
export const updateLandPreparationAdvanced = (data: LandPreparationAdvancedForm) => {
  return request({
    url: '/demo/landPreparationAdvanced',
    method: 'put',
    data: data
  });
};

/**
 * 删除进阶土地整理
 * @param landprepId
 */
export const delLandPreparationAdvanced = (landprepId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/landPreparationAdvanced/' + landprepId,
    method: 'delete'
  });
};

// ==================== 操作记录相关接口 ====================

/**
 * 查询操作记录列表
 * @param landprepId
 */
export const listOperation = (landprepId: string | number): AxiosPromise<LandPreparationOperationVO[]> => {
  return request({
    url: '/demo/landPreparationAdvanced/operation/list',
    method: 'get',
    params: { landprepId }
  });
};

/**
 * 新增操作记录
 * @param data
 */
export const addOperation = (data: LandPreparationOperationForm) => {
  return request({
    url: '/demo/landPreparationAdvanced/operation',
    method: 'post',
    data: data
  });
};

/**
 * 修改操作记录
 * @param data
 */
export const updateOperation = (data: LandPreparationOperationForm) => {
  return request({
    url: '/demo/landPreparationAdvanced/operation',
    method: 'put',
    data: data
  });
};

/**
 * 删除操作记录
 * @param operationId
 */
export const delOperation = (operationId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/landPreparationAdvanced/operation/' + operationId,
    method: 'delete'
  });
};

/**
 * 根据土地准备记录ID删除所有操作记录
 * @param landprepId
 */
export const delOperationByLandprepId = (landprepId: string | number) => {
  return request({
    url: '/demo/landPreparationAdvanced/operation/byLandprep/' + landprepId,
    method: 'delete'
  });
};

