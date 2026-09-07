import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProcessingLicenseVO, ProcessingLicenseForm, ProcessingLicenseQuery } from '@/api/demo/processingLicense/types';

/**
 * 查询加工许可证列表
 * @param query
 * @returns {*}
 */

export const listProcessingLicense = (query?: ProcessingLicenseQuery): AxiosPromise<ProcessingLicenseVO[]> => {
  return request({
    url: '/demo/processingLicense/list',
    method: 'get',
    params: query
  });
};

/**
 * License ID 自动补全（仅已有许可证记录）
 */
export const autoCompleteProcessingLicenseExistingLicenseId = (query?: ProcessingLicenseQuery): AxiosPromise<ProcessingLicenseVO[]> => {
  return request({
    url: '/demo/processingLicense/autoComplete/licenseId/existing',
    method: 'get',
    params: query
  });
};

/**
 * 查询加工许可证详细
 * @param licenseId
 */
export const getProcessingLicense = (licenseId: string | number): AxiosPromise<ProcessingLicenseVO> => {
  return request({
    url: '/demo/processingLicense/' + licenseId,
    method: 'get'
  });
};

/**
 * 新增加工许可证
 * @param data
 */
export const addProcessingLicense = (data: ProcessingLicenseForm) => {
  return request({
    url: '/demo/processingLicense',
    method: 'post',
    data: data
  });
};

/**
 * 修改加工许可证
 * @param data
 */
export const updateProcessingLicense = (data: ProcessingLicenseForm) => {
  return request({
    url: '/demo/processingLicense',
    method: 'put',
    data: data
  });
};

/**
 * 删除加工许可证
 * @param licenseId
 */
export const delProcessingLicense = (licenseId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/processingLicense/' + licenseId,
    method: 'delete'
  });
};
