import { ApprovalTaskForm } from '@/api/demo/approvalTask/types';
import { ProcessStepRunsForm } from '@/api/demo/processStepRuns/types';
import { QualityInspectionProcessVO } from '@/api/demo/qualityInspectionProcess/types';

export interface ProductionBatchVO {
  /**
   * Production batch ID (UUID, PK)
   */
  productionBatchId: string | number;

  /**
   * Processor ID, FK → t_agroprocessor.processor_id
   */
  processorId: string | number;

  /**
   * Product ID, FK → t_processor_product.product_id
   */
  productId: string | number;

  /**
   * Processing protocol / SOP version
   */
  protocolVersion: string;

  /**
   * Batch start time
   */
  startTime: string;

  /**
   * Batch end time
   */
  endTime: string;

  /**
   * 0=Planned,1=Running,2=Completed,3=Cancelled,4=Failed
   */
  status: string;

  /**
   * Created by user name
   */
  createdUserName?: string;

  /**
   * Create time
   */
  createTime?: string;

  /**
   * Approving authority user ID
   */
  approvedBy?: number;

  /**
   * Approved by user name
   */
  approvedUserName?: string;

  /**
   * Approval date
   */
  approvedAt?: string;

  /**
   * Approval comment
   */
  approvedComment?: string;
}

export interface ProductionBatchForm extends BaseEntity {
  /**
   * Production batch ID (UUID, PK)
   */
  productionBatchId?: string | number;

  /**
   * Processor ID, FK → t_agroprocessor.processor_id
   */
  processorId?: string | number;

  /**
   * Product ID, FK → t_processor_product.product_id
   */
  productId?: string | number;

  /**
   * Processing protocol / SOP version
   */
  protocolVersion?: string;

  /**
   * Batch start time
   */
  startTime?: string;

  /**
   * Batch end time
   */
  endTime?: string;

  /**
   * 0=Planned,1=Running,2=Completed,3=Cancelled,4=Failed
   */
  status?: string;

  createdUserName?: string;
  createTime?: string;
  approvedBy?: number;
  approvedUserName?: string;
  approvedAt?: string;
  approvedComment?: string;
}

/**
 * 修改生产批次主接口参数（可携带审批任务，同一事务更新）
 */
export interface ProductionBatchUpdateForm extends ProductionBatchForm {
  approvalTaskForm?: ApprovalTaskForm;
}

export interface ProductionBatchQuery extends PageQuery {
  /**
   * Production batch ID (UUID, PK)
   */
  productionBatchId?: string | number;

  /**
   * Processor ID, FK → t_agroprocessor.processor_id
   */
  processorId?: string | number;

  /**
   * Product ID, FK → t_processor_product.product_id
   */
  productId?: string | number;

  /**
   * Processing protocol / SOP version
   */
  protocolVersion?: string;

  /**
   * Batch start time
   */
  startTime?: string;

  /**
   * Batch end time
   */
  endTime?: string;

  /**
   * 0=Planned,1=Running,2=Completed,3=Cancelled,4=Failed
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;

  isAsc?: string;
}

/**
 * 生产批次及步骤数据（用于同时保存）
 */
export interface ProductionBatchWithStepsForm {
  /**
   * 生产批次数据
   */
  productionBatch: ProductionBatchForm;

  /**
   * 处理步骤列表
   */
  processSteps: ProcessStepRunsForm[];

  /**
   * 审批任务（可选，保存批次时一并创建）
   */
  approvalTaskForm?: ApprovalTaskForm;
}

/**
 * 生产批次及质量检查关联数据
 */
export interface ProductionBatchWithQualityInspectionVO {
  /**
   * 生产批次信息
   */
  productionBatch: ProductionBatchVO;

  /**
   * 关联的质量检查列表
   */
  qualityInspections: QualityInspectionProcessVO[];
}

/**
 * 生产批次及质量检查关联数据查询参数
 */
export interface ProductionBatchWithQualityInspectionQuery extends PageQuery {
  /**
   * Production batch ID (UUID, PK)
   */
  productionBatchId?: string | number;

  /**
   * Processor ID, FK → t_agroprocessor.processor_id
   */
  processorId?: string | number;

  /**
   * Product ID, FK → t_processor_product.product_id
   */
  productId?: string | number;

  /**
   * Processing protocol / SOP version
   */
  protocolVersion?: string;

  /**
   * 0=Planned,1=Running,2=Completed,3=Cancelled,4=Failed
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;

  isAsc?: string;
}
