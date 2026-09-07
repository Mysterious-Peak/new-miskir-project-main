import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { QualityInspectionProcessVO, QualityInspectionProcessForm, QualityInspectionProcessQuery } from '@/api/demo/qualityInspectionProcess/types';

/**
 * 查询质量检查列表
 * @param query
 * @returns {*}
 */

export const listQualityInspectionProcess = (query?: QualityInspectionProcessQuery): AxiosPromise<QualityInspectionProcessVO[]> => {
  return request({
    url: '/demo/qualityInspectionProcess/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询质量检查详细
 * @param inspectionId
 */
export const getQualityInspectionProcess = (inspectionId: string | number): AxiosPromise<QualityInspectionProcessVO> => {
  return request({
    url: '/demo/qualityInspectionProcess/' + inspectionId,
    method: 'get'
  });
};

/**
 * 根据批次ID查询质量检查信息
 * @param productionBatchId
 */
export const getQualityInspectionByBatchId = (batchId: string | number): AxiosPromise<any> => {
  return request({
    url: '/demo/qualityInspectionProcess/listByBatchId',
    method: 'get',
    params: { batchId }
  });
};

/**
 * 新增质量检查
 * @param data
 */
export const addQualityInspectionProcess = (data: QualityInspectionProcessForm) => {
  return request({
    url: '/demo/qualityInspectionProcess',
    method: 'post',
    data: data
  });
};

/**
 * 修改质量检查
 * @param data
 */
export const updateQualityInspectionProcess = (data: QualityInspectionProcessForm) => {
  return request({
    url: '/demo/qualityInspectionProcess',
    method: 'put',
    data: data
  });
};

/**
 * 删除质量检查
 * @param inspectionId
 */
export const delQualityInspectionProcess = (inspectionId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/qualityInspectionProcess/' + inspectionId,
    method: 'delete'
  });
};
