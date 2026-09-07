export interface QualityCertificateVO {
  /**
   * certificate_id
   */
  certificateId: string | number;

  /**
   * production_batch_id
   */
  productionBatchId: string | number;

  /**
   * ISO / Organic / Export
   */
  certificateType: string;

  /**
   * issuing_body
   */
  issuingBody: string;

  /**
   * valid_until
   */
  validUntil: string | number;

  /**
   * document_url
   */
  documentUrl: string;

  /**
   * approved_by
   */
  approvedBy: number;

  /**
   * approved_by
   */
  approvedComment: string;

  /**
   * Approval Time
   */
  approvedAt: string;

}

export interface QualityCertificateForm extends BaseEntity {
  /**
   * certificate_id
   */
  certificateId?: string | number;

  /**
   * inspection_id
   */
  inspectionId?: string | number;

  /**
   * production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * ISO / Organic / Export
   */
  certificateType?: string;

  /**
   * issuing_body
   */
  issuingBody?: string;

  /**
   * valid_until
   */
  validUntil?: string | number;

  /**
   * document_url
   */
  documentUrl?: string;

  /**
   * approved_by
   */
  approvedBy?: number;

  /**
   * approved_by
   */
  approvedComment?: string;

  /**
   * Approval Time
   */
  approvedAt?: string;

}

export interface QualityCertificateQuery extends PageQuery {

  /**
   * inspection_id
   */
  inspectionId?: string | number;

  /**
   * production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * ISO / Organic / Export
   */
  certificateType?: string;

  /**
   * issuing_body
   */
  issuingBody?: string;

  /**
   * valid_until
   */
  validUntil?: string | number;

  /**
   * document_url
   */
  documentUrl?: string;

  /**
   * approved_by
   */
  approvedBy?: number;

  /**
   * approved_by
   */
  approvedComment?: string;

  /**
   * Approval Time
   */
  approvedAt?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
