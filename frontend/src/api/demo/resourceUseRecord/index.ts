import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ResourceUseRecordVO, ResourceUseRecordForm, ResourceUseRecordQuery } from '@/api/demo/resourceUseRecord/types';

/**
 * 查询生产批次资源使用记录列表
 * @param query
 * @returns {*}
 */

export const listResourceUseRecord = (query?: ResourceUseRecordQuery): AxiosPromise<ResourceUseRecordVO[]> => {
  return request({
    url: '/demo/resourceUseRecord/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询生产批次资源使用记录详细
 * @param resourceRecordId
 */
export const getResourceUseRecord = (resourceRecordId: string | number): AxiosPromise<ResourceUseRecordVO> => {
  return request({
    url: '/demo/resourceUseRecord/' + resourceRecordId,
    method: 'get'
  });
};

/**
 * 新增生产批次资源使用记录
 * @param data
 */
export const addResourceUseRecord = (data: ResourceUseRecordForm) => {
  return request({
    url: '/demo/resourceUseRecord',
    method: 'post',
    data: data
  });
};

/**
 * 修改生产批次资源使用记录
 * @param data
 */
export const updateResourceUseRecord = (data: ResourceUseRecordForm) => {
  return request({
    url: '/demo/resourceUseRecord',
    method: 'put',
    data: data
  });
};

/**
 * 删除生产批次资源使用记录
 * @param resourceRecordId
 */
export const delResourceUseRecord = (resourceRecordId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/resourceUseRecord/' + resourceRecordId,
    method: 'delete'
  });
};
