import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  PostharvestBatchVO,
  PostharvestBatchForm,
  PostharvestBatchQuery,
  PostharvestBatchImportValidateVO,
  PostharvestBatchImportConfirmVO
} from '@/api/demo/postharvestBatch/types';

/**
 * 查询产后批次列表
 * @param query
 * @returns {*}
 */

export const listPostharvestBatch = (query?: PostharvestBatchQuery): AxiosPromise<PostharvestBatchVO[]> => {
  return request({
    url: '/demo/postharvestBatch/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询产后批次详细
 * @param id
 */
export const getPostharvestBatch = (id: string | number): AxiosPromise<PostharvestBatchVO> => {
  return request({
    url: '/demo/postharvestBatch/' + id,
    method: 'get'
  });
};

/**
 * 新增产后批次
 * @param data
 */
export const addPostharvestBatch = (data: PostharvestBatchForm) => {
  return request({
    url: '/demo/postharvestBatch',
    method: 'post',
    data: data
  });
};

/**
 * 修改产后批次
 * @param data
 */
export const updatePostharvestBatch = (data: PostharvestBatchForm) => {
  return request({
    url: '/demo/postharvestBatch',
    method: 'put',
    data: data
  });
};

/**
 * 删除产后批次
 * @param id
 */
export const delPostharvestBatch = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/postharvestBatch/' + id,
    method: 'delete'
  });
};

/**
 * CSV 导入预检
 * @param data FormData(file)
 */
export const validatePostharvestBatchImportCsv = (data: FormData): AxiosPromise<PostharvestBatchImportValidateVO> => {
  return request({
    url: '/demo/postharvestBatch/import/validate',
    method: 'post',
    data
  });
};

/**
 * CSV 导入确认
 * @param importToken 预检 token
 */
export const confirmPostharvestBatchImportCsv = (importToken: string): AxiosPromise<PostharvestBatchImportConfirmVO> => {
  return request({
    url: '/demo/postharvestBatch/import/confirm',
    method: 'post',
    data: { importToken }
  });
};
