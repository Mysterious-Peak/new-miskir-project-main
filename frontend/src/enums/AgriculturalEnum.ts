// export enum FarmLandApprovalStatus {
//   Draft = 0,
//   Approved = 1,
//   Rejected = 2,
//   NeedRevision = 3
// }

export enum CroppingPlanApprovalStatus {
  Draft = 0,
  Submitted = 1,
  Approved = 2,
  Rejected = 3,
  NeedRevision = 4
}

export enum CroppingSeasonStatus {
  Planned = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

export enum PestDiseaseStatus {
  Reported = 0,
  Approved = 1,
  Rejected = 2,
  NeedRevision = 3,
  Actioned = 4,
  Closed = 5
}

// export enum VerifiedStatus {
//   Unverified = 0,
//   Verified = 1,
//   Rejected = 2
// }

export enum ApprovalStatus {
  Draft = 0,
  Approved = 1,
  Rejected = 2,
  NeedRevision = 3,
  Created = 4,
  Registered = 5
}

export enum ClusterStatus {
  Draft = 0,
  Active = 1,
  Inactive = 2
}

export enum PledgedStatus {
  Active = 0,
  Approved = 1,
  Canceled = 2,
  Rejected = 3
}

export enum LossMonitoringStatus {
  Draft = 0,
  Confirmed = 1
}

export enum buyerStatus {
  Schedule = 0,
  Approved = 1,
  Cancel = 2
}
export enum transportAssignmentStatus {
  Schedule = 0,
  InTransit = 3,
  Deliver = 1,
  Cancel = 2
}

export enum PostHarvestBatchStatus {
  Created = 0,
  Approved = 1,
  Rejected = 2,
  NeedRevision = 3,
  Inspected = 4,
  Stored = 5,
  Dispatched = 6
}

// export enum SoilProfileApprovalStatus {
//   Draft = 0,
//   Approved = 1,
//   Rejected = 2
// }

// export const warehouseTypeOptions = [
//   {
//     value: '0',
//     label: 'Region'
//   },
//   {
//     value: '1',
//     label: 'Union'
//   },
//   {
//     value: '2',
//     label: 'Coop'
//   },
//   {
//     value: '3',
//     label: 'Processor'
//   }
// ];

export enum VehicleInfoStatus {
  Draft = 0,
  Approved = 1,
  Rejected = 2,
  NeedRevision = 3
}

export enum DriverInfoStatus {
  Draft = 0,
  Approved = 1,
  Rejected = 2,
  NeedRevision = 3
}

export enum logisticsProviderStatus {
  Draft = 0,
  Approved = 1,
  Rejected = 2,
  NeedRevision = 3
}

export enum shipmentPlanningStatus {
  Draft = 0,
  Approved = 1,
  Rejected = 2,
  NeedRevision = 3
}

export enum ShipmentOrderStatus {
  Created = 0,
  Planned = 1,
  Assigned = 2,
  InTransit = 3,
  Delivered = 4,
  Rejected = 5
}

export enum ProductionBatchStatus {
  Draft = 0,
  Submitted = 1,
  Planned = 2,
  NeedRevision = 3,
  Running = 4,
  Completed = 5,
  Rejected = 6
}

export enum AgroprocessorStatus {
  Draft = 0,
  Submitted = 2,
  Approved = 1,
  Rejected = 3,
  NeedRevision = 4
}

export enum ProcessorProductStatus {
  Draft = 0,
  Submitted = 2,
  Approved = 1,
  Rejected = 3,
  NeedRevision = 4
}
export enum QualityControlStatus {
  Submitted = 0,
  Approved = 1,
  Rejected = 2
}
export enum QualityControlResultStatus {
  Pass = 0,
  Fail = 1
}

export enum FinishedGoodsBatchStatus {
  Draft = 0,
  Approved = 1,
  Submitted = 2,
  Rejected = 3,
  NeedRevision = 4
}
/**
 * 业务类型 (business_type)
 */
export enum BusinessType {
  /** Agro Processor */
  AgroProcessor = 0,
  /** Processing License */
  ProcessingLicense = 1,
  /** Processor Product */
  ProcessorProduct = 2,
  /** Planning & Protocol */
  PlanningAndProtocol = 3,
  /** Quality Control */
  QualityControl = 4,
  /** Market Authorization */
  MarketAuthorization = 5
}

/**
 * Processor Registration 对应的任务名称
 */
export enum ProcessorRegistrationTaskName {
  /** Initiate Agro Processor */
  InitiateAgroProcessor = 0,
  /** Submit Agro Processor */
  SubmitAgroProcessor = 1,
  /** Request Agro Processor Revisions */
  RequestAgroProcessorRevisions = 2,
  /** Approve Agro Processor */
  ApproveAgroProcessor = 3,
  /** Reject Agro Processor */
  RejectAgroProcessor = 4
}

// Processor Registration task code -> display label
export const ProcessorRegistrationTaskNameLabel: Record<number, string> = {
  0: 'Initiate Agro Processor',
  1: 'Submit Agro Processor',
  2: 'Request Agro Processor Revisions',
  3: 'Approve Agro Processor',
  4: 'Reject Agro Processor'
};

/**
 * Processing License 对应的任务名称
 */
export enum ProcessingLicenseTaskName {
  /** Initiate Processing License */
  InitiateProcessingLicense = 0,
  /** Submit Processing License */
  SubmitProcessingLicense = 1,
  /** Request License Revisions */
  RequestLicenseRevisions = 2,
  /** Approve Processing License */
  ApproveProcessingLicense = 3,
  /** Reject Processing License */
  RejectProcessingLicense = 4
}

// Processing License task code -> display label
export const ProcessingLicenseTaskNameLabel: Record<number, string> = {
  0: 'Initiate Processing License',
  1: 'Submit Processing License',
  2: 'Request License Revisions',
  3: 'Approve Processing License',
  4: 'Reject Processing License'
};

/**
 * Product Registration 对应的任务名称
 */
export enum ProductRegistrationTaskName {
  /** Initiate Processor Product */
  InitiateProcessorProduct = 0,
  /** Submit Processor Product */
  SubmitProcessorProduct = 1,
  /** Request Product Revisions */
  RequestProductRevisions = 2,
  /** Approve Processor Product */
  ApproveProcessorProduct = 3,
  /** Reject Processor Product */
  RejectProcessorProduct = 4
}

// Processor Product task code -> display label
export const ProductRegistrationTaskNameLabel: Record<number, string> = {
  0: 'Initiate Processor Product',
  1: 'Submit Processor Product',
  2: 'Request Product Revisions',
  3: 'Approve Processor Product',
  4: 'Reject Processor Product'
};

/**
 * Planning & Protocol 对应的任务名称
 */
export enum PlanningAndProtocolTaskName {
  /** Initiate Plan */
  InitiatePlan = 0,
  /** Submit Plan for Approval */
  SubmitPlanForApproval = 1,
  /** Request Plan Revisions */
  RequestPlanRevisions = 2,
  /** Approve Plan */
  ApprovePlan = 3,
  /** Reject Plan */
  RejectPlan = 4,
  /** Execute Plan */
  ExecutePlan = 5,
  /** Initiate Plan Rework */
  InitiatePlanRework = 6,
  /** Complete Plan */
  CompletePlan = 7
}

// Planning & Protocol task code -> display label
export const PlanningAndProtocolTaskNameLabel: Record<number, string> = {
  0: 'Initiate Plan',
  1: 'Submit Plan for Approval',
  2: 'Request Plan Revisions',
  3: 'Approve Plan',
  4: 'Reject Plan',
  5: 'Execute Plan',
  6: 'Initiate Plan Rework',
  7: 'Complete Plan'
};

/**
 * Quality Control 对应的任务名称
 */
export enum QualityControlTaskName {
  /** Initiate Quality Control */
  InitiateQualityControl = 0,
  /** Complete Quality Control */
  CompleteQualityControl = 1,
  /** Reject Quality Control */
  RejectQualityControl = 2
}

// Quality Control task code -> display label
export const QualityControlTaskNameLabel: Record<number, string> = {
  0: 'Initiate Quality Control',
  1: 'Complete Quality Control',
  2: 'Reject Quality Control'
};

/**
 * Market Authorization 对应的任务名称
 */
export enum MarketAuthorizationTaskName {
  /** Initiate Market Authorization */
  InitiateMarketAuthorization = 0,
  /** Submit Market Authorization */
  SubmitMarketAuthorization = 1,
  /** Request Authorization Revisions */
  RequestAuthorizationRevisions = 2,
  /** Approve Market Authorization */
  ApproveMarketAuthorization = 3,
  /** Reject Market Authorization */
  RejectMarketAuthorization = 4
}

// Market Authorization task code -> display label
export const MarketAuthorizationTaskNameLabel: Record<number, string> = {
  0: 'Initiate Market Authorization',
  1: 'Submit Market Authorization',
  2: 'Request Authorization Revisions',
  3: 'Approve Market Authorization',
  4: 'Reject Market Authorization'
};
export enum processingLicenseStatus {
  Draft = 0,
  Approved = 2,
  Submitted = 1,
  Rejected = 3,
  NeedRevision = 4,
  Valid = 5,
  Expired = 6
}
