import axios from 'axios';
import { RECEIVE_ROUTE_RESULTS, CLEAR_ROUTES, ZOOM_TO_MNV } from './types';

import { VALHALLA_OSM_URL, parseDirectionsGeometry } from './valhalla';

import type { ParsedDirectionsGeometry, ValhallaRouteResponse, Waypoint } from './common/types';

interface LatLng {
  lng: number;
  lat: number;
}
interface ValhallaRequest {
  json: Record<string, unknown>;
}

interface ZoomObject {
  index: number;
  timeNow: number;
}

export const fetchValhallaDirections = (valhallaRequest: ValhallaRequest): Promise<ParsedDirectionsGeometry | null> => {
  return new Promise((resolve, reject) => {
    const config = {
      params: { json: JSON.stringify(valhallaRequest.json) },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    axios
      .get<ValhallaRouteResponse>(VALHALLA_OSM_URL + '/route', config)
      .then(({ data }) => {
        (data as ParsedDirectionsGeometry).decodedGeometry = parseDirectionsGeometry(data);

        if (data.alternates) {
          for (let i = 0; i < data.alternates.length; i++) {
            const alternate = data.alternates[i];

            if (alternate) {
              (data.alternates[i] as ParsedDirectionsGeometry).decodedGeometry = parseDirectionsGeometry(alternate);
            }
          }
        }
        resolve(data as ParsedDirectionsGeometry);
      })
      .catch(({ response }) => {
        let error_msg = response.data.error;
        if (response.data.error_code === 154) {
          error_msg += ` for ${valhallaRequest.json.costing}.`;
        }
        clearRoutes(VALHALLA_OSM_URL!);
        reject(new Error(error_msg));
      });
  });
};

export const registerRouteResponse = (provider: string, data: ParsedDirectionsGeometry) => ({
  type: RECEIVE_ROUTE_RESULTS,
  payload: {
    provider,
    data
  }
});

export const clearRoutes = (provider?: string) => ({
  type: CLEAR_ROUTES,
  payload: provider
});

export const zoomToManeuver = (zoomObj: ZoomObject) => ({
  type: ZOOM_TO_MNV,
  payload: zoomObj
});
