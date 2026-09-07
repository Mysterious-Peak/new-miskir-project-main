import { ActiveWaypoint, ActiveWaypoints, PossibleSettings } from './common/types';
import { decode } from './polyline';

export const VALHALLA_OSM_URL = import.meta.env.VITE_APP_VALHALLA_URL;

export type Profile = 'auto' | 'bicycle' | 'pedestrian' | 'car' | 'truck' | 'bus' | 'motor_scooter' | 'motorcycle';

export type Settings = Record<
  'costing' | 'directions',
  {
    [key in keyof PossibleSettings]: PossibleSettings[key];
  }
>;

export const buildLocateRequest = (latLng: { lat: number; lng: number }, profile: Profile) => {
  let valhalla_profile = profile;
  if (profile === 'car') {
    valhalla_profile = 'auto';
  }
  return {
    costing: valhalla_profile,
    locations: [{ lat: latLng.lat, lon: latLng.lng }]
  };
};

export const buildHeightRequest = (latLngs: [number, number][]) => {
  const shape = [];
  for (const latLng of latLngs) {
    shape.push({ lat: latLng[0], lon: latLng[1] });
  }
  return {
    range: latLngs.length > 1,
    shape,
    id: 'valhalla_height'
  };
};

export const buildDirectionsRequest = ({
  profile,
  activeWaypoints,
  settings,
  dateTime
}: {
  profile: Profile;
  activeWaypoints: ActiveWaypoints;
  settings: Settings;
  dateTime: { type: number; value: string };
}) => {
  let valhalla_profile = profile;

  if (profile === 'car') {
    valhalla_profile = 'auto';
  }

  const req = {
    json: {
      costing: valhalla_profile,
      costing_options: {
        [valhalla_profile]: { ...settings.costing }
      },
      exclude_polygons: settings.directions.exclude_polygons,
      locations: makeLocations(activeWaypoints),
      units: 'kilometers',
      alternates: settings.directions.alternates,
      id: 'valhalla_directions'
    }
  };

  if (dateTime.type > -1) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req.json as any).date_time = dateTime;
  }
  return req;
};

export const parseDirectionsGeometry = (data: ValhallaRouteResponse) => {
  const coordinates: number[][] = [];

  for (const feat of data.trip.legs) {
    coordinates.push(...decode(feat.shape, 6));
  }

  return coordinates;
};

export const makeContours = ({ maxRange, interval }: { maxRange: number; interval: number }) => {
  let contours = [];
  while (maxRange > 0) {
    contours.push({ time: maxRange });
    maxRange -= interval;
  }
  contours = contours.reverse();
  return contours;
};

export const makeLocations = (waypoints: ActiveWaypoint[]) => {
  const locations = [];
  for (const [idx, waypoint] of waypoints.entries()) {
    const type = [0, waypoints.length - 1].includes(idx) ? 'break' : 'via';
    locations.push({
      lon: waypoint.displaylnglat[0],
      lat: waypoint.displaylnglat[1],
      type: type
    });
  }

  return locations;
};

export type BicycleType = 'Hybrid' | 'Road' | 'City' | 'Cross' | 'Mountain';

export interface ValhallaRouteResponse {
  id: 'valhalla_directions';
  trip: Trip;
  alternates?: ValhallaRouteResponse[];
}
export interface Trip {
  locations: Location[];
  legs: Leg[];
  summary: Summary;
  status_message: string;
  status: number;
  units: string;
  language: string;
}

export interface Location {
  type: string;
  lat: number;
  lon: number;
  side_of_street: string;
  original_index: number;
}

export interface Leg {
  maneuvers: Maneuver[];
  summary: Summary;
  shape: string;
}

export interface Maneuver {
  type: number;
  instruction: string;
  verbal_succinct_transition_instruction?: string;
  verbal_pre_transition_instruction: string;
  verbal_post_transition_instruction?: string;
  street_names?: string[];
  bearing_after?: number;
  time: number;
  length: number;
  cost: number;
  begin_shape_index: number;
  end_shape_index: number;
  verbal_multi_cue?: boolean;
  travel_mode: string;
  travel_type: string;
  verbal_transition_alert_instruction?: string;
  bearing_before?: number;
  roundabout_exit_count?: number;
  begin_street_names?: string[];
  rough?: boolean;
  toll?: boolean;
  ferry?: boolean;
}

export interface Summary {
  has_time_restrictions: boolean;
  has_toll: boolean;
  has_highway: boolean;
  has_ferry: boolean;
  min_lat: number;
  min_lon: number;
  max_lat: number;
  max_lon: number;
  time: number;
  length: number;
  cost: number;
}
