export interface AgroprocessorVO {
  /**
   * Processor ID
   */
  processorId: string | number;

  /**
   * Processor Name
   */
  processorName: string;

  /**
   * Processor Type
   */
  processorType: string;

  /**
   * Registration Number
   */
  registrationNumber: string;

  /**
   * Tin Number
   */
  tinNumber: string;

  /**
   * Ownership Type
   */
  ownershipType: string;

  /**
   * Region
   */
  region: string;

  /**
   * Zone
   */
  zone: string;

  /**
   * Woreda
   */
  woreda: string;

  /**
   * Latitude
   */
  gpsLat: number;

  /**
   * Longitude
   */
  gpsLong: number;

  /**
   * Designed capacity (kg/day)
   */
  processingCapacityPerDay: number;

  /**
   * Technology Level
   */
  technologyLevel: string;

  /**
   * status
   */
  status: string;

  /**
   * Approving authority user ID
   */
  approvedBy: number;

  /**
   * 审批意见
   */
  approvedComment: string;

  /**
   * Approval date
   */
  approvedAt: string;

}

export interface AgroprocessorForm extends BaseEntity {
  /**
   * Processor ID
   */
  processorId?: string | number;

  /**
   * Processor Name
   */
  processorName?: string;

  /**
   * Processor Type
   */
  processorType?: string;

  /**
   * Registration Number
   */
  registrationNumber?: string;

  /**
   * Tin Number
   */
  tinNumber?: string;

  /**
   * Ownership Type
   */
  ownershipType?: string;

  /**
   * Region
   */
  region?: string;

  /**
   * Zone
   */
  zone?: string;

  /**
   * Woreda
   */
  woreda?: string;

  /**
   * Latitude
   */
  gpsLat?: number;

  /**
   * Longitude
   */
  gpsLong?: number;

  /**
   * Designed capacity (kg/day)
   */
  processingCapacityPerDay?: number;

  /**
   * Technology Level
   */
  technologyLevel?: string;

  /**
   * status
   */
  status?: string;

  /**
   * Approving authority user ID
   */
  approvedBy?: number;

  /**
   * 审批意见
   */
  approvedComment?: string;

  /**
   * Approval date
   */
  approvedAt?: string;

}

export interface AgroprocessorQuery extends PageQuery {

  /**
   * Processor ID
   */
  processorId?: string | number;

  /**
   * Processor Name
   */
  processorName?: string;

  /**
   * Processor Type
   */
  processorType?: string;

  /**
   * Registration Number
   */
  registrationNumber?: string;

  /**
   * Tin Number
   */
  tinNumber?: string;

  /**
   * Ownership Type
   */
  ownershipType?: string;

  /**
   * Region
   */
  region?: string;

  /**
   * Zone
   */
  zone?: string;

  /**
   * Woreda
   */
  woreda?: string;

  /**
   * Latitude
   */
  gpsLat?: number;

  /**
   * Longitude
   */
  gpsLong?: number;

  /**
   * Designed capacity (kg/day)
   */
  processingCapacityPerDay?: number;

  /**
   * Technology Level
   */
  technologyLevel?: string;

  /**
   * status
   */
  status?: string;

  /**
   * Approving authority user ID
   */
  approvedBy?: number;

  /**
   * 审批意见
   */
  approvedComment?: string;

  /**
   * Approval date
   */
  approvedAt?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
