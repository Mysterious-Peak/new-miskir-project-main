export interface ClusterFarmingVO {
  id: string | number;
  clusterId: string;
  clusterName: string;
  kebeleId: string;
  status: string;
  remark?: string;
  createTime?: string;
  parcelCount?: number;
  totalAreaTa?: number;
  parcels?: ClusterParcelVO[];
}

export interface ClusterParcelVO {
  farmlandId: string | number;
  farmerId?: string;
  farmerName?: string;
  kebeleId?: string;
  areaTa?: number;
  occupied?: boolean;
  occupiedClusterId?: string;
}

export interface ClusterSummaryVO {
  clusterId: string;
  clusterName: string;
  kebeleId: string;
  kebeleName?: string;
  parcelCount?: number;
  farmerCount?: number;
  totalAreaHa?: number;
  totalPlannedAreaHa?: number;
  totalHarvestedAreaHa?: number;
  totalActualYieldQt?: number;
  avgYieldPerHa?: number;
  seasonLabel?: string;
  prodSeasonId?: string | number;
  year?: number;
  seasonId?: number;
}

export interface ClusterReportVO {
  farmlandId: string | number;
  harvestId?: string;
  farmerId?: string;
  farmerName?: string;
  areaTa?: number;
  plannedAreaTa?: number;
  cropName?: string;
  harvestedAreaTa?: number;
  actualYieldQt?: number;
  year?: number;
  seasonId?: number;
  seasonName?: string;
  prodSeasonId?: string | number;
}

export interface ClusterSeasonOptionVO {
  prodSeasonId: string | number;
  prodSeasonCode?: string;
  year?: number;
  seasonId?: number;
  seasonName?: string;
  label: string;
}

export interface ClusterCropOptionVO {
  cropId: string;
  cropName?: string;
}

export interface ClusterKebeleOptionVO {
  kebeleId: string;
  kebeleName?: string;
}

/** Sentinel cropId for parcels without production season (must match backend NO_CROP_ID) */
export const CLUSTER_NO_CROP_ID = '-1';

/** Sentinel year (must match backend NO_YEAR) */
export const CLUSTER_NO_YEAR = -1;

/** Sentinel seasonId (must match backend NO_SEASON_ID) */
export const CLUSTER_NO_SEASON_ID = -1;

export interface ClusterReportFilterMetaVO {
  showNoYear?: boolean;
  showNoSeason?: boolean;
  showNoCrop?: boolean;
}

export interface ClusterReportFilterOptionVO {
  year?: number;
  seasonId?: number;
  seasonName?: string;
  cropId?: string;
  cropName?: string;
  label?: string;
}

export interface ClusterReportFilterOptionsVO extends ClusterReportFilterMetaVO {
  options?: ClusterReportFilterOptionVO[];
}

export interface ClusterFarmingForm extends BaseEntity {
  id?: string | number;
  clusterId?: string;
  clusterName?: string;
  kebeleId?: string;
  status?: string;
  remark?: string;
  farmlandIds?: Array<string | number>;
}

export interface ClusterFarmingQuery extends PageQuery {
  clusterId?: string;
  clusterName?: string;
  kebeleId?: string;
  status?: string;
  params?: any;
}
