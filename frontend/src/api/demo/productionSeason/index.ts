import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProductionSeasonVO, ProductionSeasonForm, ProductionSeasonQuery } from '@/api/demo/productionSeason/types';
import { HttpStatus } from '@/enums/RespEnum';

/** prod_season_id is bigint — remote search query must be numeric digits only */
export const isNumericProdSeasonIdQuery = (value?: string | number | null): boolean => {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 && /^\d+$/.test(trimmed);
};

/**
 * 查询生产季节列表
 * @param query
 * @returns {*}
 */

export const listProductionSeason = (query?: ProductionSeasonQuery): AxiosPromise<ProductionSeasonVO[]> => {
  const prodSeasonId = query?.prodSeasonId;
  if (prodSeasonId != null && String(prodSeasonId).trim() !== '') {
    const trimmed = String(prodSeasonId).trim();
    if (!isNumericProdSeasonIdQuery(trimmed)) {
      return Promise.resolve({
        code: HttpStatus.SUCCESS,
        msg: 'query skipped',
        rows: [],
        total: 0
      } as any);
    }
    query = { ...query, prodSeasonId: trimmed };
  }
  return request({
    url: '/demo/productionSeason/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询生产季节详细
 * @param prodSeasonId
 */
export const getProductionSeason = (prodSeasonId: string | number): AxiosPromise<ProductionSeasonVO> => {
  return request({
    url: '/demo/productionSeason/' + prodSeasonId,
    method: 'get'
  });
};

/**
 * 新增生产季节
 * @param data
 */
export const addProductionSeason = (data: ProductionSeasonForm) => {
  return request({
    url: '/demo/productionSeason',
    method: 'post',
    data: data
  });
};

/**
 * 修改生产季节
 * @param data
 */
export const updateProductionSeason = (data: ProductionSeasonForm) => {
  return request({
    url: '/demo/productionSeason',
    method: 'put',
    data: data
  });
};

/**
 * 删除生产季节
 * @param prodSeasonId
 */
export const delProductionSeason = (prodSeasonId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/productionSeason/' + prodSeasonId,
    method: 'delete'
  });
};
