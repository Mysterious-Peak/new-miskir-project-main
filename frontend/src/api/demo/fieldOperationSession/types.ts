export interface FieldOperationSessionItemVO {
  itemId?: string | number;
  sessionId?: string | number;
  operationCode?: string;
  inputType?: string;
  quantity?: number;
  unit?: string;
  remark?: string;
}

export interface FieldOperationSessionVO {
  sessionId?: string | number;
  prodSeasonId?: string | number;
  operationDate?: string;
  operationCount?: number;
  planId?: string;
  farmlandId?: string;
  cropName?: string;
  seasonName?: string;
  year?: number;
  areaTa?: number;
  status?: string;
  approvedBy?: string;
  approvedUserName?: string;
  approvedAt?: string;
  approvedComment?: string;
  createBy?: string | number;
  createdUserName?: string;
  createTime?: string;
}

export interface FieldOperationSessionQuery extends PageQuery {
  sessionId?: string | number;
  sessionIdLike?: string;
  prodSeasonId?: string | number;
  prodSeasonIdLike?: string;
  operationDate?: string;
  status?: string;
}

export interface IrrigationOptionVO {
  irrigationCode?: string;
  irrigationName?: string;
}

export interface FieldOperationSessionContextVO {
  prodSeasonId?: string | number;
  planId?: string;
  farmlandId?: string;
  cropId?: string;
  cropName?: string;
  seasonName?: string;
  year?: number;
  areaTa?: number;
  plantingWindowStart?: string;
  irrigationOptions?: IrrigationOptionVO[];
}

export interface FieldOperationSessionDetailVO {
  sessionId?: string | number;
  prodSeasonId?: string | number;
  operationDate?: string;
  status?: string;
  approvedBy?: string;
  approvedUserName?: string;
  approvedAt?: string;
  approvedComment?: string;
  context?: FieldOperationSessionContextVO;
  operations?: FieldOperationSessionItemVO[];
}

export interface FieldOperationSessionApprovalForm {
  sessionId?: string | number;
  status?: string;
  approvedComment?: string;
}

export interface FieldOperationSessionForm {
  sessionId?: string | number;
  prodSeasonId?: string | number;
  operationDate?: string;
  operations?: FieldOperationSessionItemVO[];
}

export interface FieldOperationSessionPageForm {
  sessionId?: string | number;
  prodSeasonId?: string | number;
  operationDate?: string;
  planId?: string;
  farmlandId?: string;
  cropName?: string;
  seasonName?: string;
  year?: number;
  areaTa?: number;
  status?: string;
  isEdit?: boolean;
  approvedComment?: string;
}

export type FieldOperationSessionItemForm = FieldOperationSessionItemVO;
