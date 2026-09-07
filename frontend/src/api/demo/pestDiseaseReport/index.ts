import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PestDiseaseReportVO, PestDiseaseReportForm, PestDiseaseReportQuery } from '@/api/demo/pestDiseaseReport/types';

/**
 * 查询病虫害报告列表
 * @param query
 * @returns {*}
 */

export const listPestDiseaseReport = (query?: PestDiseaseReportQuery): AxiosPromise<PestDiseaseReportVO[]> => {
  return request({
    url: '/demo/pestDiseaseReport/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询病虫害报告详细
 * @param pestId
 */
export const getPestDiseaseReport = (pestId: string | number): AxiosPromise<PestDiseaseReportVO> => {
  return request({
    url: '/demo/pestDiseaseReport/' + pestId,
    method: 'get'
  });
};

/**
 * 新增病虫害报告
 * @param data
 */
export const addPestDiseaseReport = (data: PestDiseaseReportForm) => {
  return request({
    url: '/demo/pestDiseaseReport',
    method: 'post',
    data: data
  });
};

/**
 * 修改病虫害报告
 * @param data
 */
export const updatePestDiseaseReport = (data: PestDiseaseReportForm) => {
  return request({
    url: '/demo/pestDiseaseReport',
    method: 'put',
    data: data
  });
};

/**
 * 删除病虫害报告
 * @param pestId
 */
export const delPestDiseaseReport = (pestId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/pestDiseaseReport/' + pestId,
    method: 'delete'
  });
};
