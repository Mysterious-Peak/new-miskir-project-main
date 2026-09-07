export interface PostharvestBatchVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 产后批次编码（如 BATCH-001）
   */
  batchId: string | number;

  /**
   * 关联的收获记录ID列表（JSON数组，如 ["HC-0001", "HC-0002"]）
   */
  harvestIdsJson: string | number;

  /**
   * 作物品类编码
   */
  cropCode: string;

  /**
   * 作物名称（展示用）
   */
  cropName?: string;

  /**
   * 批次总重量（单位：quintal）
   */
  batchWeightQt: number;

  /**
   * 批次创建日期时间
   */
  creationDate: string;

  /**
   * 批次状态：Created=已创建, Inspected=已质检, Stored=已入库, Dispatched=已发货
   */
  status: string;
}

export interface PostharvestBatchForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 产后批次编码（如 BATCH-001）
   */
  batchId?: string | number;

  /**
   * 关联的收获记录ID列表（JSON数组，如 ["HC-0001", "HC-0002"]）
   */
  harvestIdsJson?: string | number;

  /**
   * 作物品类编码
   */
  cropCode?: string;

  /**
   * 作物名称（展示用）
   */
  cropName?: string;

  /**
   * 批次总重量（单位：quintal）
   */
  batchWeightQt?: number;

  /**
   * 批次创建日期时间
   */
  creationDate?: string;

  /**
   * 批次状态：Created=已创建, Inspected=已质检, Stored=已入库, Dispatched=已发货
   */
  status?: string;

  createdUserName?: string;
  createTime?: string;

  approvedBy?: number;
  approvedUserName?: string;
  approvedAt?: string;
  approvedComment?: string;
}

export interface PostharvestBatchQuery extends PageQuery {
  id?: string | number;
  /**
   * 产后批次编码（如 BATCH-001）
   */
  batchId?: string | number;

  /**
   * 关联的收获记录ID列表（JSON数组，如 ["HC-0001", "HC-0002"]）
   */
  harvestIdsJson?: string | number;

  /**
   * 作物品类编码
   */
  cropCode?: string;

  /**
   * 作物名称（展示用）
   */
  cropName?: string;

  /**
   * 批次总重量（单位：quintal）
   */
  batchWeightQt?: number;

  /**
   * 批次创建日期时间
   */
  creationDate?: string;

  /**
   * 批次状态：Created=已创建, Inspected=已质检, Stored=已入库, Dispatched=已发货
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;
  isAsc?: string;
}

export interface PostharvestBatchImportRowErrorVO {
  rowNo: number;
  errorMessage: string;
}

export interface PostharvestBatchImportPreviewVO {
  rowNo: number;
  batchId?: string;
  cropCode?: string;
  batchWeightQt?: number;
  creationDate?: string;
  harvestIdsJson?: string;
  harvestIdsRaw?: string;
  status?: string;
  approvedComment?: string;
}

export interface PostharvestBatchImportValidateVO {
  importToken: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errorTruncated: boolean;
  errorRows: PostharvestBatchImportRowErrorVO[];
  previewRows: PostharvestBatchImportPreviewVO[];
}

export interface PostharvestBatchImportConfirmVO {
  totalRows: number;
  successRows: number;
  failRows: number;
  failDetails: PostharvestBatchImportRowErrorVO[];
}
