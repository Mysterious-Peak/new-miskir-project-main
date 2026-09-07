import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProcessorProductVO, ProcessorProductForm, ProcessorProductQuery } from '@/api/demo/processorProduct/types';

/**
 * 查询加工厂产品注册列表
 * @param query
 * @returns {*}
 */

export const listProcessorProduct = (query?: ProcessorProductQuery): AxiosPromise<ProcessorProductVO[]> => {
  return request({
    url: '/demo/processorProduct/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询加工厂产品注册详细
 * @param productId
 */
export const getProcessorProduct = (productId: string | number): AxiosPromise<ProcessorProductVO> => {
  return request({
    url: '/demo/processorProduct/' + productId,
    method: 'get'
  });
};

/**
 * 新增加工厂产品注册
 * @param data
 */
export const addProcessorProduct = (data: ProcessorProductForm) => {
  return request({
    url: '/demo/processorProduct',
    method: 'post',
    data: data
  });
};

/**
 * 修改加工厂产品注册
 * @param data
 */
export const updateProcessorProduct = (data: ProcessorProductForm) => {
  return request({
    url: '/demo/processorProduct',
    method: 'put',
    data: data
  });
};

/**
 * 删除加工厂产品注册
 * @param productId
 */
export const delProcessorProduct = (productId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/processorProduct/' + productId,
    method: 'delete'
  });
};
