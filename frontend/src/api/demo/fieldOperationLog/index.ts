import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { HttpStatus } from '@/enums/RespEnum';
import { FieldOperationLogVO, FieldOperationLogForm, FieldOperationLogQuery } from '@/api/demo/fieldOperationLog/types';
import { isNumericProdSeasonIdQuery } from '@/api/demo/productionSeason';

/**
 * 查询田间操作日志列表
 * @param query
 * @returns {*}
 */

export const listFieldOperationLog = (query?: FieldOperationLogQuery): AxiosPromise<FieldOperationLogVO[]> => {
  return request({
    url: '/demo/fieldOperationLog/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询田间操作日志详细
 * @param operationId
 */
export const getFieldOperationLog = (operationId: string | number): AxiosPromise<FieldOperationLogVO> => {
  return request({
    url: '/demo/fieldOperationLog/' + operationId,
    method: 'get'
  });
};

/**
 * 新增田间操作日志
 * @param data
 */
export const addFieldOperationLog = (data: FieldOperationLogForm) => {
  return request({
    url: '/demo/fieldOperationLog',
    method: 'post',
    data: data
  });
};

/**
 * 修改田间操作日志
 * @param data
 */
export const updateFieldOperationLog = (data: FieldOperationLogForm) => {
  return request({
    url: '/demo/fieldOperationLog',
    method: 'put',
    data: data
  });
};

/**
 * 删除田间操作日志
 * @param operationId
 */
export const delFieldOperationLog = (operationId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/fieldOperationLog/' + operationId,
    method: 'delete'
  });
};

/**
 * Production season ID autocomplete (lightweight, for remote select on main list)
 */
export const autoCompleteFieldOperationLogProdSeasonId = (
  query?: Pick<FieldOperationLogQuery, 'prodSeasonIdLike'>
): AxiosPromise<FieldOperationLogVO[]> => {
  const trimmed = query?.prodSeasonIdLike != null ? String(query.prodSeasonIdLike).trim() : '';
  if (!isNumericProdSeasonIdQuery(trimmed)) {
    return Promise.resolve({
      code: HttpStatus.SUCCESS,
      msg: 'query skipped',
      data: []
    } as any);
  }
  return request({
    url: '/demo/fieldOperationLog/autoComplete/prodSeasonId',
    method: 'get',
    params: { prodSeasonIdLike: trimmed }
  });
};

/**
 * Production season ID autocomplete on approval list (lightweight, for remote select)
 */
export const autoCompleteFieldOperationLogProdSeasonIdApproved = (
  query?: Pick<FieldOperationLogQuery, 'prodSeasonIdLike'>
): AxiosPromise<FieldOperationLogVO[]> => {
  const trimmed = query?.prodSeasonIdLike != null ? String(query.prodSeasonIdLike).trim() : '';
  if (!isNumericProdSeasonIdQuery(trimmed)) {
    return Promise.resolve({
      code: HttpStatus.SUCCESS,
      msg: 'query skipped',
      data: []
    } as any);
  }
  return request({
    url: '/demo/fieldOperationLog/autoComplete/prodSeasonId/approved',
    method: 'get',
    params: { prodSeasonIdLike: trimmed }
  });
};
