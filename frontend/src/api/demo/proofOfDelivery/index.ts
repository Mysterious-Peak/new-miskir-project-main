import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProofOfDeliveryVO, ProofOfDeliveryForm, ProofOfDeliveryQuery } from '@/api/demo/proofOfDelivery/types';

/**
 * 查询交付证明列表
 * @param query
 * @returns {*}
 */

export const listProofOfDelivery = (query?: ProofOfDeliveryQuery): AxiosPromise<ProofOfDeliveryVO[]> => {
  return request({
    url: '/demo/proofOfDelivery/list',
    method: 'get',
    params: query
  });
};

/**
 * Shipment ID 自动补全
 * @param query
 */
export const autoCompleteProofOfDeliveryShipmentId = (query?: ProofOfDeliveryQuery): AxiosPromise<ProofOfDeliveryVO[]> => {
  return request({
    url: '/demo/proofOfDelivery/autoComplete/shipmentId',
    method: 'get',
    params: query
  });
};

/**
 * Shipment ID 自动补全（仅已有 POD 记录中的运单）
 */
export const autoCompleteProofOfDeliveryExistingShipmentId = (query?: ProofOfDeliveryQuery): AxiosPromise<ProofOfDeliveryVO[]> => {
  return request({
    url: '/demo/proofOfDelivery/autoComplete/shipmentId/existing',
    method: 'get',
    params: query
  });
};

/**
 * 查询交付证明详细
 * @param podId
 */
export const getProofOfDelivery = (podId: string | number): AxiosPromise<ProofOfDeliveryVO> => {
  return request({
    url: '/demo/proofOfDelivery/' + podId,
    method: 'get'
  });
};

/**
 * 新增交付证明
 * @param data
 */
export const addProofOfDelivery = (data: ProofOfDeliveryForm) => {
  return request({
    url: '/demo/proofOfDelivery',
    method: 'post',
    data: data
  });
};

/**
 * 修改交付证明
 * @param data
 */
export const updateProofOfDelivery = (data: ProofOfDeliveryForm) => {
  return request({
    url: '/demo/proofOfDelivery',
    method: 'put',
    data: data
  });
};

/**
 * 删除交付证明
 * @param podId
 */
export const delProofOfDelivery = (podId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/proofOfDelivery/' + podId,
    method: 'delete'
  });
};
