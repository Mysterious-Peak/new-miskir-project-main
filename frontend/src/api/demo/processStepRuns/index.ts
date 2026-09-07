import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProcessStepRunsVO, ProcessStepRunsForm, ProcessStepRunsQuery } from '@/api/demo/processStepRuns/types';

/**
 * 查询处理步骤运行列表
 * @param query
 * @returns {*}
 */

export const listProcessStepRuns = (query?: ProcessStepRunsQuery): AxiosPromise<ProcessStepRunsVO[]> => {
  return request({
    url: '/demo/processStepRuns/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询处理步骤运行详细
 * @param stepRunId
 */
export const getProcessStepRuns = (stepRunId: string | number): AxiosPromise<ProcessStepRunsVO> => {
  return request({
    url: '/demo/processStepRuns/' + stepRunId,
    method: 'get'
  });
};

/**
 * 新增处理步骤运行
 * @param data
 */
export const addProcessStepRuns = (data: ProcessStepRunsForm) => {
  return request({
    url: '/demo/processStepRuns',
    method: 'post',
    data: data
  });
};

/**
 * 修改处理步骤运行
 * @param data
 */
export const updateProcessStepRuns = (data: ProcessStepRunsForm) => {
  return request({
    url: '/demo/processStepRuns',
    method: 'put',
    data: data
  });
};

/**
 * 删除处理步骤运行
 * @param stepRunId
 */
export const delProcessStepRuns = (stepRunId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/processStepRuns/' + stepRunId,
    method: 'delete'
  });
};
