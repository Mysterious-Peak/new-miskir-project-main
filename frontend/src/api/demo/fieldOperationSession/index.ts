import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { HttpStatus } from '@/enums/RespEnum';
import {
  FieldOperationSessionApprovalForm,
  FieldOperationSessionContextVO,
  FieldOperationSessionDetailVO,
  FieldOperationSessionForm,
  FieldOperationSessionQuery,
  FieldOperationSessionVO
} from '@/api/demo/fieldOperationSession/types';

/** session_id is bigint — remote search query must be numeric digits only */
export const isNumericSessionIdQuery = (value?: string | number | null): boolean => {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 && /^\d+$/.test(trimmed);
};

/** prod_season_id is bigint — remote search query must be numeric digits only */
export const isNumericProdSeasonIdQuery = (value?: string | number | null): boolean => {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 && /^\d+$/.test(trimmed);
};

export const listFieldOperationSession = (query?: FieldOperationSessionQuery): AxiosPromise<FieldOperationSessionVO[]> => {
  const params: FieldOperationSessionQuery = { ...query };
  const sessionIdLike = params.sessionIdLike;
  if (sessionIdLike != null && String(sessionIdLike).trim() !== '') {
    const trimmed = String(sessionIdLike).trim();
    if (!isNumericSessionIdQuery(trimmed)) {
      return Promise.resolve({
        code: HttpStatus.SUCCESS,
        msg: 'query skipped',
        rows: [],
        total: 0
      } as any);
    }
    params.sessionIdLike = trimmed;
  }
  if (params.sessionId != null && String(params.sessionId).trim() !== '') {
    const trimmed = String(params.sessionId).trim();
    if (!isNumericSessionIdQuery(trimmed)) {
      delete params.sessionId;
    } else {
      params.sessionId = trimmed;
    }
  }
  return request({
    url: '/demo/fieldOperationSession/list',
    method: 'get',
    params
  });
};

export const listFieldOperationSessionApproved = (query?: FieldOperationSessionQuery): AxiosPromise<FieldOperationSessionVO[]> => {
  const params: FieldOperationSessionQuery = { ...query };
  if (params.sessionId != null && String(params.sessionId).trim() !== '') {
    const trimmed = String(params.sessionId).trim();
    if (!isNumericSessionIdQuery(trimmed)) {
      delete params.sessionId;
    } else {
      params.sessionId = trimmed;
    }
  }
  return request({
    url: '/demo/fieldOperationSession/list/approved',
    method: 'get',
    params
  });
};

export const updateFieldOperationSessionApproval = (data: FieldOperationSessionApprovalForm) => {
  return request({
    url: '/demo/fieldOperationSession/approval',
    method: 'put',
    data
  });
};

export const getFieldOperationSessionContext = (prodSeasonId: string | number): AxiosPromise<FieldOperationSessionContextVO> => {
  return request({
    url: '/demo/fieldOperationSession/context/' + prodSeasonId,
    method: 'get'
  });
};

export const getFieldOperationSessionDetail = (sessionId: string | number): AxiosPromise<FieldOperationSessionDetailVO> => {
  return request({
    url: '/demo/fieldOperationSession/detail/' + sessionId,
    method: 'get'
  });
};

export const saveFieldOperationSessionWithOperations = (data: FieldOperationSessionForm) => {
  return request({
    url: '/demo/fieldOperationSession/withOperations',
    method: 'post',
    data
  });
};

export const updateFieldOperationSessionWithOperations = (data: FieldOperationSessionForm) => {
  return request({
    url: '/demo/fieldOperationSession/withOperations',
    method: 'put',
    data
  });
};

export const delFieldOperationSession = (sessionId: string | number) => {
  return request({
    url: '/demo/fieldOperationSession/' + sessionId,
    method: 'delete'
  });
};

/**
 * Session ID autocomplete (lightweight, for remote select)
 */
export const autoCompleteFieldOperationSessionId = (
  query?: Pick<FieldOperationSessionQuery, 'sessionIdLike'>
): AxiosPromise<FieldOperationSessionVO[]> => {
  const trimmed = query?.sessionIdLike != null ? String(query.sessionIdLike).trim() : '';
  if (!isNumericSessionIdQuery(trimmed)) {
    return Promise.resolve({
      code: HttpStatus.SUCCESS,
      msg: 'query skipped',
      data: []
    } as any);
  }
  return request({
    url: '/demo/fieldOperationSession/autoComplete/sessionId',
    method: 'get',
    params: { sessionIdLike: trimmed }
  });
};

/**
 * Session ID autocomplete on approval list (lightweight, for remote select)
 */
export const autoCompleteFieldOperationSessionIdApproved = (
  query?: Pick<FieldOperationSessionQuery, 'sessionIdLike'>
): AxiosPromise<FieldOperationSessionVO[]> => {
  const trimmed = query?.sessionIdLike != null ? String(query.sessionIdLike).trim() : '';
  if (!isNumericSessionIdQuery(trimmed)) {
    return Promise.resolve({
      code: HttpStatus.SUCCESS,
      msg: 'query skipped',
      data: []
    } as any);
  }
  return request({
    url: '/demo/fieldOperationSession/autoComplete/sessionId/approved',
    method: 'get',
    params: { sessionIdLike: trimmed }
  });
};

/**
 * Production season ID autocomplete (lightweight, for remote select on list filter)
 */
export const autoCompleteFieldOperationSessionProdSeasonId = (
  query?: Pick<FieldOperationSessionQuery, 'prodSeasonIdLike'>
): AxiosPromise<FieldOperationSessionVO[]> => {
  const trimmed = query?.prodSeasonIdLike != null ? String(query.prodSeasonIdLike).trim() : '';
  if (!isNumericProdSeasonIdQuery(trimmed)) {
    return Promise.resolve({
      code: HttpStatus.SUCCESS,
      msg: 'query skipped',
      data: []
    } as any);
  }
  return request({
    url: '/demo/fieldOperationSession/autoComplete/prodSeasonId',
    method: 'get',
    params: { prodSeasonIdLike: trimmed }
  });
};

/**
 * Production season ID autocomplete on approval list filter (lightweight, for remote select)
 */
export const autoCompleteFieldOperationSessionProdSeasonIdApproved = (
  query?: Pick<FieldOperationSessionQuery, 'prodSeasonIdLike'>
): AxiosPromise<FieldOperationSessionVO[]> => {
  const trimmed = query?.prodSeasonIdLike != null ? String(query.prodSeasonIdLike).trim() : '';
  if (!isNumericProdSeasonIdQuery(trimmed)) {
    return Promise.resolve({
      code: HttpStatus.SUCCESS,
      msg: 'query skipped',
      data: []
    } as any);
  }
  return request({
    url: '/demo/fieldOperationSession/autoComplete/prodSeasonId/approved',
    method: 'get',
    params: { prodSeasonIdLike: trimmed }
  });
};
