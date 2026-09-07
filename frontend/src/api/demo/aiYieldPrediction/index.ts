import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AiYieldPredictionVO, AiYieldPredictionForm, AiYieldPredictionQuery } from '@/api/demo/aiYieldPrediction/types';

/**
 * 查询AI产量预测列表
 * @param query
 * @returns {*}
 */

export const listAiYieldPrediction = (query?: AiYieldPredictionQuery): AxiosPromise<AiYieldPredictionVO[]> => {
  return request({
    url: '/demo/aiYieldPrediction/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询AI产量预测详细
 * @param aiPredId
 */
export const getAiYieldPrediction = (aiPredId: string | number): AxiosPromise<AiYieldPredictionVO> => {
  return request({
    url: '/demo/aiYieldPrediction/' + aiPredId,
    method: 'get'
  });
};

/**
 * 新增AI产量预测
 * @param data
 */
export const addAiYieldPrediction = (data: AiYieldPredictionForm) => {
  return request({
    url: '/demo/aiYieldPrediction',
    method: 'post',
    data: data
  });
};

/**
 * 修改AI产量预测
 * @param data
 */
export const updateAiYieldPrediction = (data: AiYieldPredictionForm) => {
  return request({
    url: '/demo/aiYieldPrediction',
    method: 'put',
    data: data
  });
};

/**
 * 删除AI产量预测
 * @param aiPredId
 */
export const delAiYieldPrediction = (aiPredId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/aiYieldPrediction/' + aiPredId,
    method: 'delete'
  });
};
