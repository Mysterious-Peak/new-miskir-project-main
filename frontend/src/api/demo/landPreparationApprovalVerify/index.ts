import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LandPreparationApprovalVerifyVO, LandPreparationApprovalVerifyForm, LandPreparationApprovalVerifyQuery } from '@/api/demo/landPreparationApprovalVerify/types';

/**
 * 查询进阶土地整理审批列表
 * @param query
 * @returns {*}
 */

export const listLandPreparationApprovalVerify = (query?: LandPreparationApprovalVerifyQuery): AxiosPromise<LandPreparationApprovalVerifyVO[]> => {
  return request({
    url: '/demo/landPreparationAdvancedApproval/verify/list',
    method: 'get',
    params: query
  });
};


export const listLandPreparationApprovalVerifyApprove = (query?: LandPreparationApprovalVerifyQuery): AxiosPromise<LandPreparationApprovalVerifyVO[]> => {
  return request({
    url: '/demo/landPreparationAdvancedApproval/verify/list/approved',
    method: 'get',
    params: query
  });
};


/**
 * 查询进阶土地整理审批详细
 * @param landprepId
 */
export const getLandPreparationApprovalVerify = (landprepId: string | number): AxiosPromise<LandPreparationApprovalVerifyVO> => {
  return request({
    url: '/demo/landPreparationAdvancedApproval/verify/' + landprepId,
    method: 'get'
  });
};

/**
 * 新增进阶土地整理审批
 * @param data
 */
export const addLandPreparationApprovalVerify = (data: LandPreparationApprovalVerifyForm) => {
  return request({
    url: '/demo/landPreparationAdvancedApproval/verify',
    method: 'post',
    data: data
  });
};

/**
 * 修改进阶土地整理审批
 * @param data
 */
export const updateLandPreparationApprovalVerify = (data: LandPreparationApprovalVerifyForm) => {
  return request({
    url: '/demo/landPreparationAdvancedApproval/verify',
    method: 'put',
    data: data
  });
};

/**
 * 删除进阶土地整理审批
 * @param landprepId
 */
export const delLandPreparationApprovalVerify = (landprepId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/landPreparationAdvancedApproval/verify/' + landprepId,
    method: 'delete'
  });
};
