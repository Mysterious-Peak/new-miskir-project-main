import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { QualityGradeMasterVO, QualityGradeMasterForm, QualityGradeMasterQuery } from '@/api/demo/qualityGradeMaster/types';

/**
 * 查询质量等级标准列表
 * @param query
 * @returns {*}
 */

export const listQualityGradeMaster = (query?: QualityGradeMasterQuery): AxiosPromise<QualityGradeMasterVO[]> => {
  return request({
    url: '/demo/qualityGradeMaster/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询质量等级标准详细
 * @param id
 */
export const getQualityGradeMaster = (id: string | number): AxiosPromise<QualityGradeMasterVO> => {
  return request({
    url: '/demo/qualityGradeMaster/' + id,
    method: 'get'
  });
};

/**
 * 新增质量等级标准
 * @param data
 */
export const addQualityGradeMaster = (data: QualityGradeMasterForm) => {
  return request({
    url: '/demo/qualityGradeMaster',
    method: 'post',
    data: data
  });
};

/**
 * 修改质量等级标准
 * @param data
 */
export const updateQualityGradeMaster = (data: QualityGradeMasterForm) => {
  return request({
    url: '/demo/qualityGradeMaster',
    method: 'put',
    data: data
  });
};

/**
 * 删除质量等级标准
 * @param id
 */
export const delQualityGradeMaster = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/qualityGradeMaster/' + id,
    method: 'delete'
  });
};
