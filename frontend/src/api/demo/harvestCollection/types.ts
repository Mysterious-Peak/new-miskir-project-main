export interface HarvestCollectionVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 收获记录编码（如 HC-0001）
   */
  harvestId: string | number;

  /**
   * 农户ID（逻辑外键，关联 t_user 或 t_farmer）
   */
  farmerId: string;

  /**
   * 作物品类编码（如 WHT=小麦）
   */
  cropCode: string;

  cropName?: string;

  /**
   * 收获数量（单位：quintal，公担）
   */
  quantityQt: number;

  /**
   * 收获时水分含量百分比（%）
   */
  moisturePercentage: number;

  /**
   * 收获采集日期时间
   */
  collectionDate: string;

  /**
   * 生产季节 ID
   */
  prodSeasonId: string | number;

  harvestDate?: string;
  harvestedAreaTa?: number;
  harvestYieldQt?: number;
  actualYieldQt?: number;
  standardMoisturePct?: number;
  standardMoistureSource?: string;
  standardMoistureNeedsReview?: boolean;
  moisturePct?: number;
  measuredMoistureValue?: number;
  qualityGrade?: string;
  methods?: string;
  status?: string;
  recordedUserName?: string;
  createdUserName?: string;
  createTime?: string;
  approvedUserName?: string;
  approvedAt?: string;
  approvedComment?: string;
}

export interface HarvestCollectionForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 收获记录编码（如 HC-0001）
   */
  harvestId?: string | number;

  /**
   * 农户ID（逻辑外键，关联 t_user 或 t_farmer）
   */
  farmerId?: string;

  /**
   * 作物品类编码（如 WHT=小麦）
   */
  cropCode?: string;

  /**
   * 收获数量（单位：quintal，公担）
   */
  quantityQt?: number;

  /**
   * 收获时水分含量百分比（%）
   */
  moisturePercentage?: number;

  /**
   * 收获采集日期时间
   */
  collectionDate?: string;

  cropName?: string;

  /** 品种名称（展示用，来自播种记录 seedLotCode） */
  varietyName?: string;

  /** 实测水分（展示用，优先 Yield Estimate，其次 Crop Master measured_moisture_value） */
  measuredMoistureValue?: number;

  status?: string;

  createdUserName?: string;
  createTime?: string;

  approvedBy?: number;
  approvedUserName?: string;
  approvedAt?: string;
  approvedComment?: string;
  /**
   * 生产季节 ID
   */
  prodSeasonId?: string | number;
  /**
   * 收获日期
   */
  harvestDate?: string;
  seasonName?: string;
  seasonId?: number;
  /**
   * 已收获面积 (公顷)
   */
  harvestedAreaTa?: number;
  /**
   * 收获产量 (公担)，原始实测产量
   */
  harvestYieldQt?: number;
  /**
   * 实际产量 (公担)，系统按水分自动修正
   */
  actualYieldQt?: number;
  standardMoisturePct?: number;
  standardMoistureSource?: string;
  standardMoistureNeedsReview?: boolean;
  /**
   * 水分百分比
   */
  moisturePct?: number;
  /**
   * 质量等级
   */
  qualityGrade?: string;
  methods?: string;
}

export interface HarvestCollectionQuery extends PageQuery {
  /**
   * 收获记录编码（如 HC-0001）
   */
  harvestId?: string | number;

  /**
   * 农户ID（逻辑外键，关联 t_user 或 t_farmer）
   */
  farmerId?: string;

  /**
   * 作物品类编码（如 WHT=小麦）
   */
  cropCode?: string;

  /**
   * 作物名称
   */
  cropName?: string;

  /**
   * 收获数量（单位：quintal，公担）
   */
  quantityQt?: number;

  /**
   * 收获时水分含量百分比（%）
   */
  moisturePercentage?: number;

  /**
   * 收获采集日期时间
   */
  collectionDate?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;
  isAsc?: string;

  /**
   * 生产季节 ID
   */
  prodSeasonId?: string | number;
}
