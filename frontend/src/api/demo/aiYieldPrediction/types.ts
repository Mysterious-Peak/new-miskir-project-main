export interface AiYieldPredictionVO {
  /**
   * AI预测ID
   */
  aiPredId: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId: string | number;

  /**
   * 使用的AI模型版本
   */
  modelVersion: string;

  /**
   * 模型名称
   */
  modelName: string;

  /**
   * 预测产量 (公担)
   */
  predictedYieldQt: number;

  /**
   * 预测单产(quintal/ha)
   */
  predictedYieldPerHa: number;

  /**
   * 置信度百分比
   */
  confidencePct: string | number;

  /**
   * 预测范围最小值
   */
  predictionRangeMin: number;

  /**
   * 预测范围最大值
   */
  predictionRangeMax: number;

  /**
   * 天气因素评分
   */
  weatherFactorScore: number;

  /**
   * 土壤因素评分
   */
  soilFactorScore: number;

  /**
   * 管理因素评分
   */
  managementFactorScore: number;

  /**
   * 病虫害影响
   */
  pestDiseaseImpact: number;

  /**
   * 输入特征(JSON格式)
   */
  inputFeatures: string;

  /**
   * 生成时间
   */
  generatedAt: string;

  /**
   * 生成者ID
   */
  generatedBy: string;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 备注
   */
  remark: string;

}

export interface AiYieldPredictionForm extends BaseEntity {
  /**
   * AI预测ID
   */
  aiPredId?: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 使用的AI模型版本
   */
  modelVersion?: string;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 预测产量 (公担)
   */
  predictedYieldQt?: number;

  /**
   * 预测单产(quintal/ha)
   */
  predictedYieldPerHa?: number;

  /**
   * 置信度百分比
   */
  confidencePct?: string | number;

  /**
   * 预测范围最小值
   */
  predictionRangeMin?: number;

  /**
   * 预测范围最大值
   */
  predictionRangeMax?: number;

  /**
   * 天气因素评分
   */
  weatherFactorScore?: number;

  /**
   * 土壤因素评分
   */
  soilFactorScore?: number;

  /**
   * 管理因素评分
   */
  managementFactorScore?: number;

  /**
   * 病虫害影响
   */
  pestDiseaseImpact?: number;

  /**
   * 输入特征(JSON格式)
   */
  inputFeatures?: string;

  /**
   * 生成时间
   */
  generatedAt?: string;

  /**
   * 生成者ID
   */
  generatedBy?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 备注
   */
  remark?: string;

}

export interface AiYieldPredictionQuery extends PageQuery {

  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 使用的AI模型版本
   */
  modelVersion?: string;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 预测产量 (公担)
   */
  predictedYieldQt?: number;

  /**
   * 预测单产(quintal/ha)
   */
  predictedYieldPerHa?: number;

  /**
   * 置信度百分比
   */
  confidencePct?: string | number;

  /**
   * 预测范围最小值
   */
  predictionRangeMin?: number;

  /**
   * 预测范围最大值
   */
  predictionRangeMax?: number;

  /**
   * 天气因素评分
   */
  weatherFactorScore?: number;

  /**
   * 土壤因素评分
   */
  soilFactorScore?: number;

  /**
   * 管理因素评分
   */
  managementFactorScore?: number;

  /**
   * 病虫害影响
   */
  pestDiseaseImpact?: number;

  /**
   * 输入特征(JSON格式)
   */
  inputFeatures?: string;

  /**
   * 生成时间
   */
  generatedAt?: string;

  /**
   * 生成者ID
   */
  generatedBy?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
