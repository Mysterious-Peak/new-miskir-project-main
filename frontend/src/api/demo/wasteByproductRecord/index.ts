import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WasteByproductRecordVO, WasteByproductRecordForm, WasteByproductRecordQuery } from '@/api/demo/wasteByproductRecord/types';

/**
 * 查询废弃物和副产品记录列表
 * @param query
 * @returns {*}
 */

export const listWasteByproductRecord = (query?: WasteByproductRecordQuery): AxiosPromise<WasteByproductRecordVO[]> => {
  return request({
    url: '/demo/wasteByproductRecord/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询废弃物和副产品记录详细
 * @param wasteRecordId
 */
export const getWasteByproductRecord = (wasteRecordId: string | number): AxiosPromise<WasteByproductRecordVO> => {
  return request({
    url: '/demo/wasteByproductRecord/' + wasteRecordId,
    method: 'get'
  });
};

/**
 * 新增废弃物和副产品记录
 * @param data
 */
export const addWasteByproductRecord = (data: WasteByproductRecordForm) => {
  return request({
    url: '/demo/wasteByproductRecord',
    method: 'post',
    data: data
  });
};

/**
 * 修改废弃物和副产品记录
 * @param data
 */
export const updateWasteByproductRecord = (data: WasteByproductRecordForm) => {
  return request({
    url: '/demo/wasteByproductRecord',
    method: 'put',
    data: data
  });
};

/**
 * 删除废弃物和副产品记录
 * @param wasteRecordId
 */
export const delWasteByproductRecord = (wasteRecordId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/wasteByproductRecord/' + wasteRecordId,
    method: 'delete'
  });
};
