import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ApprovalTaskVO, ApprovalTaskForm, ApprovalTaskQuery } from '@/api/demo/approvalTask/types';

/**
 * 查询通用审批引擎核心，记录所有业务实体的审批任务列表
 * @param query
 * @returns {*}
 */

export const listApprovalTask = (query?: ApprovalTaskQuery): AxiosPromise<ApprovalTaskVO[]> => {
  return request({
    url: '/demo/approvalTask/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询通用审批引擎核心，记录所有业务实体的审批任务详细
 * @param taskId
 */
export const getApprovalTask = (taskId: string | number): AxiosPromise<ApprovalTaskVO> => {
  return request({
    url: '/demo/approvalTask/' + taskId,
    method: 'get'
  });
};

/**
 * 新增通用审批引擎核心，记录所有业务实体的审批任务
 * @param data
 */
export const addApprovalTask = (data: ApprovalTaskForm) => {
  return request({
    url: '/demo/approvalTask',
    method: 'post',
    data: data
  });
};

/**
 * 修改通用审批引擎核心，记录所有业务实体的审批任务
 * @param data
 */
export const updateApprovalTask = (data: ApprovalTaskForm) => {
  return request({
    url: '/demo/approvalTask',
    method: 'put',
    data: data
  });
};

/**
 * 删除通用审批引擎核心，记录所有业务实体的审批任务
 * @param taskId
 */
export const delApprovalTask = (taskId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/approvalTask/' + taskId,
    method: 'delete'
  });
};
