import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { QualityInspectionVO, QualityInspectionForm, QualityInspectionQuery } from '@/api/demo/qualityInspection/types';

/**
 * 查询质量检验列表
 * @param query
 * @returns {*}
 */

export const listQualityInspection = (query?: QualityInspectionQuery): AxiosPromise<QualityInspectionVO[]> => {
  return request({
    url: '/demo/qualityInspection/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询质量检验详细
 * @param id
 */
export const getQualityInspection = (id: string | number): AxiosPromise<QualityInspectionVO> => {
  return request({
    url: '/demo/qualityInspection/' + id,
    method: 'get'
  });
};

/**
 * 新增质量检验
 * @param data
 */
export const addQualityInspection = (data: QualityInspectionForm) => {
  return request({
    url: '/demo/qualityInspection',
    method: 'post',
    data: data
  });
};

/**
 * 修改质量检验
 * @param data
 */
export const updateQualityInspection = (data: QualityInspectionForm) => {
  return request({
    url: '/demo/qualityInspection',
    method: 'put',
    data: data
  });
};

/**
 * 删除质量检验
 * @param id
 */
export const delQualityInspection = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/qualityInspection/' + id,
    method: 'delete'
  });
};
