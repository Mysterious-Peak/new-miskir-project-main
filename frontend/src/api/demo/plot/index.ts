import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PlotVO, PlotForm, PlotQuery } from '@/api/demo/plot/types';

/**
 * 查询Original plot information table列表
 * @param query
 * @returns {*}
 */

export const listPlot = (query?: PlotQuery): AxiosPromise<PlotVO[]> => {
  return request({
    url: '/demo/plot/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询Original plot information table详细
 * @param id
 */
export const getPlot = (id: string | number): AxiosPromise<PlotVO> => {
  return request({
    url: '/demo/plot/' + id,
    method: 'get'
  });
};

/**
 * 新增Original plot information table
 * @param data
 */
export const addPlot = (data: PlotForm) => {
  return request({
    url: '/demo/plot',
    method: 'post',
    data: data
  });
};

/**
 * 修改Original plot information table
 * @param data
 */
export const updatePlot = (data: PlotForm) => {
  return request({
    url: '/demo/plot',
    method: 'put',
    data: data
  });
};

/**
 * 删除Original plot information table
 * @param id
 */
export const delPlot = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/plot/' + id,
    method: 'delete'
  });
};
