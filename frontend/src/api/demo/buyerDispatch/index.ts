import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BuyerDispatchVO, BuyerDispatchForm, BuyerDispatchQuery } from '@/api/demo/buyerDispatch/types';

/**
 * 查询买家发货列表
 * @param query
 * @returns {*}
 */

export const listBuyerDispatch = (query?: BuyerDispatchQuery): AxiosPromise<BuyerDispatchVO[]> => {
  return request({
    url: '/demo/buyerDispatch/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询买家发货详细
 * @param id
 */
export const getBuyerDispatch = (id: string | number): AxiosPromise<BuyerDispatchVO> => {
  return request({
    url: '/demo/buyerDispatch/' + id,
    method: 'get'
  });
};

/**
 * 新增买家发货
 * @param data
 */
export const addBuyerDispatch = (data: BuyerDispatchForm) => {
  return request({
    url: '/demo/buyerDispatch',
    method: 'post',
    data: data
  });
};

/**
 * 修改买家发货
 * @param data
 */
export const updateBuyerDispatch = (data: BuyerDispatchForm) => {
  return request({
    url: '/demo/buyerDispatch',
    method: 'put',
    data: data
  });
};

/**
 * 删除买家发货
 * @param id
 */
export const delBuyerDispatch = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/buyerDispatch/' + id,
    method: 'delete'
  });
};
