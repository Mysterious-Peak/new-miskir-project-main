import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SowingVO, SowingForm, SowingQuery } from '@/api/demo/sowing/types';

/**
 * 查询播种记录列表
 * @param query
 * @returns {*}
 */

export const listSowing = (query?: SowingQuery): AxiosPromise<SowingVO[]> => {
  return request({
    url: '/demo/sowing/list',
    method: 'get',
    params: query
  });
};

export const listSowingApprove = (query?: SowingQuery): AxiosPromise<SowingVO[]> => {
  return request({
    url: '/demo/sowing/list/approved',
    method: 'get',
    params: query
  });
};

/**
 * 查询播种记录详细
 * @param sowingId
 */
export const getSowing = (sowingId: string | number): AxiosPromise<SowingVO> => {
  return request({
    url: '/demo/sowing/' + sowingId,
    method: 'get'
  });
};

/**
 * 新增播种记录
 * @param data
 */
export const addSowing = (data: SowingForm) => {
  return request({
    url: '/demo/sowing',
    method: 'post',
    data: data
  });
};

/**
 * 修改播种记录
 * @param data
 */
export const updateSowing = (data: SowingForm) => {
  return request({
    url: '/demo/sowing',
    method: 'put',
    data: data
  });
};

/**
 * 删除播种记录
 * @param sowingId
 */
export const delSowing = (sowingId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/sowing/' + sowingId,
    method: 'delete'
  });
};
