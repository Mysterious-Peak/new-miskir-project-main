import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RawMaterialIntakeVO, RawMaterialIntakeForm, RawMaterialIntakeQuery } from '@/api/demo/rawMaterialIntake/types';

/**
 * 查询原料入厂记录列表
 * @param query
 * @returns {*}
 */

export const listRawMaterialIntake = (query?: RawMaterialIntakeQuery): AxiosPromise<RawMaterialIntakeVO[]> => {
  return request({
    url: '/demo/rawMaterialIntake/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询原料入厂记录详细
 * @param intakeId
 */
export const getRawMaterialIntake = (intakeId: string | number): AxiosPromise<RawMaterialIntakeVO> => {
  return request({
    url: '/demo/rawMaterialIntake/' + intakeId,
    method: 'get'
  });
};

/**
 * 新增原料入厂记录
 * @param data
 */
export const addRawMaterialIntake = (data: RawMaterialIntakeForm) => {
  return request({
    url: '/demo/rawMaterialIntake',
    method: 'post',
    data: data
  });
};

/**
 * 修改原料入厂记录
 * @param data
 */
export const updateRawMaterialIntake = (data: RawMaterialIntakeForm) => {
  return request({
    url: '/demo/rawMaterialIntake',
    method: 'put',
    data: data
  });
};

/**
 * 删除原料入厂记录
 * @param intakeId
 */
export const delRawMaterialIntake = (intakeId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/rawMaterialIntake/' + intakeId,
    method: 'delete'
  });
};
