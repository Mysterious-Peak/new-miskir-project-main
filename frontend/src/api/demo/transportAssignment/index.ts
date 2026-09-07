import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TransportAssignmentVO, TransportAssignmentForm, TransportAssignmentQuery } from '@/api/demo/transportAssignment/types';

/**
 * 查询运输分配列表
 * @param query
 * @returns {*}
 */

export const listTransportAssignment = (query?: TransportAssignmentQuery): AxiosPromise<TransportAssignmentVO[]> => {
  return request({
    url: '/demo/transportAssignment/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询运输分配详细
 * @param id
 */
export const getTransportAssignment = (id: string | number): AxiosPromise<TransportAssignmentVO> => {
  return request({
    url: '/demo/transportAssignment/' + id,
    method: 'get'
  });
};

/**
 * 新增运输分配
 * @param data
 */
export const addTransportAssignment = (data: TransportAssignmentForm) => {
  return request({
    url: '/demo/transportAssignment',
    method: 'post',
    data: data
  });
};

/**
 * 修改运输分配
 * @param data
 */
export const updateTransportAssignment = (data: TransportAssignmentForm) => {
  return request({
    url: '/demo/transportAssignment',
    method: 'put',
    data: data
  });
};

/**
 * 删除运输分配
 * @param id
 */
export const delTransportAssignment = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/transportAssignment/' + id,
    method: 'delete'
  });
};
