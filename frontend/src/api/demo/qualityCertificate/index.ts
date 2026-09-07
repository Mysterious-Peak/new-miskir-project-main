import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { QualityCertificateVO, QualityCertificateForm, QualityCertificateQuery } from '@/api/demo/qualityCertificate/types';

/**
 * 查询质量认证证书列表
 * @param query
 * @returns {*}
 */

export const listQualityCertificate = (query?: QualityCertificateQuery): AxiosPromise<QualityCertificateVO[]> => {
  return request({
    url: '/demo/qualityCertificate/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询质量认证证书详细
 * @param certificateId
 */
export const getQualityCertificate = (certificateId: string | number): AxiosPromise<QualityCertificateVO> => {
  return request({
    url: '/demo/qualityCertificate/' + certificateId,
    method: 'get'
  });
};

/**
 * 新增质量认证证书
 * @param data
 */
export const addQualityCertificate = (data: QualityCertificateForm) => {
  return request({
    url: '/demo/qualityCertificate',
    method: 'post',
    data: data
  });
};

/**
 * 修改质量认证证书
 * @param data
 */
export const updateQualityCertificate = (data: QualityCertificateForm) => {
  return request({
    url: '/demo/qualityCertificate',
    method: 'put',
    data: data
  });
};

/**
 * 删除质量认证证书
 * @param certificateId
 */
export const delQualityCertificate = (certificateId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/qualityCertificate/' + certificateId,
    method: 'delete'
  });
};
