import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LabTestVO, LabTestForm, LabTestQuery } from '@/api/demo/labTest/types';

/**
 * 查询实验室测试列表
 * @param query
 * @returns {*}
 */

export const listLabTest = (query?: LabTestQuery): AxiosPromise<LabTestVO[]> => {
  return request({
    url: '/demo/labTest/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询实验室测试详细
 * @param labTestId
 */
export const getLabTest = (labTestId: string | number): AxiosPromise<LabTestVO> => {
  return request({
    url: '/demo/labTest/' + labTestId,
    method: 'get'
  });
};

/**
 * 新增实验室测试
 * @param data
 */
export const addLabTest = (data: LabTestForm) => {
  return request({
    url: '/demo/labTest',
    method: 'post',
    data: data
  });
};

/**
 * 修改实验室测试
 * @param data
 */
export const updateLabTest = (data: LabTestForm) => {
  return request({
    url: '/demo/labTest',
    method: 'put',
    data: data
  });
};

/**
 * 删除实验室测试
 * @param labTestId
 */
export const delLabTest = (labTestId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/labTest/' + labTestId,
    method: 'delete'
  });
};
