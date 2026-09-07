import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  ClusterFarmingForm,
  ClusterFarmingQuery,
  ClusterFarmingVO,
  ClusterParcelVO,
  ClusterReportVO,
  ClusterSummaryVO,
  ClusterReportFilterOptionsVO,
  ClusterKebeleOptionVO
} from '@/api/demo/clusterFarming/types';

export const listClusterFarming = (query?: ClusterFarmingQuery): AxiosPromise<ClusterFarmingVO[]> => {
  return request({
    url: '/demo/clusterFarming/list',
    method: 'get',
    params: query
  });
};

export const getClusterFarming = (id: string | number): AxiosPromise<ClusterFarmingVO> => {
  return request({
    url: '/demo/clusterFarming/' + id,
    method: 'get'
  });
};

export const addClusterFarming = (data: ClusterFarmingForm) => {
  return request({
    url: '/demo/clusterFarming',
    method: 'post',
    data
  });
};

export const updateClusterFarming = (data: ClusterFarmingForm) => {
  return request({
    url: '/demo/clusterFarming',
    method: 'put',
    data
  });
};

export const delClusterFarming = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/clusterFarming/' + id,
    method: 'delete'
  });
};

export const listAvailableFarmlands = (kebeleId: string, excludeClusterId?: string | number): AxiosPromise<ClusterParcelVO[]> => {
  return request({
    url: '/demo/clusterFarming/availableFarmlands',
    method: 'get',
    params: { kebeleId, excludeClusterId }
  });
};

export const listClusterKebeleOptions = (kebeleId?: string): AxiosPromise<ClusterKebeleOptionVO[]> => {
  return request({
    url: '/demo/clusterFarming/kebeleOptions',
    method: 'get',
    params: { kebeleId }
  });
};

export interface ClusterSeasonFilter {
  year?: string | number;
  seasonId?: string | number;
  cropId?: string;
}

export const getClusterSummary = (id: string | number, filter?: ClusterSeasonFilter): AxiosPromise<ClusterSummaryVO> => {
  return request({
    url: '/demo/clusterFarming/' + id + '/summary',
    method: 'get',
    params: filter
  });
};

export const getClusterReport = (id: string | number, filter?: ClusterSeasonFilter): AxiosPromise<ClusterReportVO[]> => {
  return request({
    url: '/demo/clusterFarming/' + id + '/report',
    method: 'get',
    params: filter
  });
};

export const getClusterReportFilterOptions = (id: string | number): AxiosPromise<ClusterReportFilterOptionsVO> => {
  return request({
    url: '/demo/clusterFarming/' + id + '/reportFilterOptions',
    method: 'get'
  });
};
