import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AgroprocessorVO, AgroprocessorForm, AgroprocessorQuery } from '@/api/demo/agroprocessor/types';

/**
 * 查询注册加工企业主列表
 * @param query
 * @returns {*}
 */

export const listAgroprocessor = (query?: AgroprocessorQuery): AxiosPromise<AgroprocessorVO[]> => {
  return request({
    url: '/demo/agroprocessor/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询注册加工企业主详细
 * @param processorId
 */
export const getAgroprocessor = (processorId: string | number): AxiosPromise<AgroprocessorVO> => {
  return request({
    url: '/demo/agroprocessor/' + processorId,
    method: 'get'
  });
};

/**
 * 新增注册加工企业主
 * @param data
 */
export const addAgroprocessor = (data: AgroprocessorForm) => {
  return request({
    url: '/demo/agroprocessor',
    method: 'post',
    data: data
  });
};

/**
 * 修改注册加工企业主
 * @param data
 */
export const updateAgroprocessor = (data: AgroprocessorForm) => {
  return request({
    url: '/demo/agroprocessor',
    method: 'put',
    data: data
  });
};

/**
 * 删除注册加工企业主
 * @param processorId
 */
export const delAgroprocessor = (processorId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/agroprocessor/' + processorId,
    method: 'delete'
  });
};
