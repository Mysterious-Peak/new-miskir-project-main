import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { GpsTrackVO, GpsTrackForm, GpsTrackQuery } from '@/api/demo/gpsTrack/types';

/**
 * 查询GPS轨迹列表
 * @param query
 * @returns {*}
 */

export const listGpsTrack = (query?: GpsTrackQuery): AxiosPromise<GpsTrackVO[]> => {
  return request({
    url: '/demo/gpsTrack/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询GPS轨迹详细
 * @param gpsTrackId
 */
export const getGpsTrack = (gpsTrackId: string | number): AxiosPromise<GpsTrackVO> => {
  return request({
    url: '/demo/gpsTrack/' + gpsTrackId,
    method: 'get'
  });
};

/**
 * 新增GPS轨迹
 * @param data
 */
export const addGpsTrack = (data: GpsTrackForm) => {
  return request({
    url: '/demo/gpsTrack',
    method: 'post',
    data: data
  });
};

/**
 * 修改GPS轨迹
 * @param data
 */
export const updateGpsTrack = (data: GpsTrackForm) => {
  return request({
    url: '/demo/gpsTrack',
    method: 'put',
    data: data
  });
};

/**
 * 删除GPS轨迹
 * @param gpsTrackId
 */
export const delGpsTrack = (gpsTrackId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/gpsTrack/' + gpsTrackId,
    method: 'delete'
  });
};
