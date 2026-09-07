import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FarmerVO, FarmerForm, FarmerQuery, FarmerSummaryVO } from '@/api/demo/farmer/types';
import { FarmlandVO } from '@/api/demo/farmland/types';

/**
 * 查询Farmer列表 (分页)
 */
export const listFarmer = (query?: FarmerQuery): AxiosPromise<FarmerVO[]> => {
  return request({
    url: '/demo/farmerInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询Farmer列表 (不分页)
 */
export const getFarmerList = (query?: FarmerQuery): AxiosPromise<FarmerVO[]> => {
  return request({
    url: '/demo/farmerInfo/getList',
    method: 'get',
    params: query
  });
};

/**
 * 查询Farmer详细
 * @param id
 */
export const getFarmer = (id: string | number): AxiosPromise<FarmerVO> => {
  return request({
    url: '/demo/farmerInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增Farmer
 * @param data
 */
export const addFarmer = (data: FarmerForm) => {
  return request({
    url: '/demo/farmerInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改Farmer
 * @param data
 */
export const updateFarmer = (data: FarmerForm) => {
  return request({
    url: '/demo/farmerInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除Farmer
 * @param id
 */
export const delFarmer = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/farmerInfo/' + id,
    method: 'delete'
  });
};

/**
 * 获取某个农户的所有地块列表
 * @param farmerId 农户业务ID
 */
export const getFarmerFarmlands = (farmerId: string): AxiosPromise<FarmlandVO[]> => {
  return request({
    url: '/demo/farmerInfo/' + farmerId + '/farmlands',
    method: 'get'
  });
};

/**
 * 根据业务farmerId查询农户基本信息
 */
export const getFarmerByFarmerId = (farmerId: string): AxiosPromise<FarmerVO> => {
  return request({
    url: '/demo/farmerInfo/byFarmer/' + farmerId,
    method: 'get'
  });
};

/**
 * 查询农户汇总信息（含地块列表和聚合统计）
 */
export const getFarmerSummary = (farmerId: string, pageQuery?: { pageNum: number; pageSize: number }): AxiosPromise<FarmerSummaryVO> => {
  return request({
    url: '/demo/farmerInfo/summary/' + farmerId,
    method: 'get',
    params: pageQuery
  });
};

// Compatibility aliases
export const getFarmerInfoList = getFarmerList;
