export interface FarmerVO {
  /**
   * Primary key, auto-increment
   */
  id: string | number;

  /**
   * Farmer ID
   */
  farmerId: string | number;

  /**
   * Farmer name
   */
  name: string;

  /**
   * Phone number
   */
  telephone: string;

  /**
   * ID card number
   */
  idNo: string | number;

  /**
   * ID card type
   */
  idType: string | number;

  /**
   * Type
   */
  tp: number;

  /**
   * ID validity period end date
   */
  periodOfValidatyEndDt: string | number;

  /**
   * ID validity period start date
   */
  periodOfValidatyStartDt: string | number;

  /**
   * Address
   */
  address: string;

  /**
   * Gender
   */
  gender: number;

  /**
   * Photo URL
   */
  photoUrl: string;

  /**
   * Age
   */
  age: number;

  /**
   * Review status (0: pending, 1: approved, 2: rejected)
   */
  reviewStatus: number;

  /**
   * UserID
   */
  userId: string | number;
}

export interface FarmerForm extends BaseEntity {
  /**
   * Primary key, auto-increment
   */
  id?: string | number;

  /**
   * Farmer name
   */
  name?: string;

  /**
   * Phone number
   */
  telephone?: string;

  /**
   * ID card number
   */
  idNo?: string | number;

  /**
   * ID card type
   */
  idType?: string | number;

  /**
   * Type
   */
  tp?: number;

  /**
   * ID validity period end date
   */
  periodOfValidatyEndDt?: string | number;

  /**
   * ID validity period start date
   */
  periodOfValidatyStartDt?: string | number;

  /**
   * Address
   */
  address?: string;

  /**
   * Gender
   */
  gender?: number;

  /**
   * Photo URL
   */
  photoUrl?: string;

  /**
   * Age
   */
  age?: number;

  /**
   * Review status (0: pending, 1: approved, 2: rejected)
   */
  reviewStatus?: number;

  /**
   * UserID
   */
  userId?: string | number;
}

export interface FarmerQuery extends PageQuery {
  farmerId?: string | number;

  /**
   * Farmer name
   */
  name?: string;

  /**
   * Phone number
   */
  telephone?: string;

  /**
   * ID card number
   */
  idNo?: string | number;

  /**
   * ID card type
   */
  idType?: string | number;

  /**
   * Type
   */
  tp?: number;

  /**
   * ID validity period end date
   */
  periodOfValidatyEndDt?: string | number;

  /**
   * ID validity period start date
   */
  periodOfValidatyStartDt?: string | number;

  /**
   * Address
   */
  address?: string;

  /**
   * Gender
   */
  gender?: number;

  /**
   * Photo URL
   */
  photoUrl?: string;

  /**
   * Age
   */
  age?: number;

  /**
   * Review status (0: pending, 1: approved, 2: rejected)
   */
  reviewStatus?: number;

  /**
   * UserID
   */
  userId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}

import type { FarmlandVO } from '@/api/demo/farmland/types';

export interface ProductionByCrop {
  seasonId: number;
  seasonName: string;
  cropCode: string;
  cropName: string;
  totalYieldQt: number;
}

/** Farmer summary with farmlands and aggregated stats */
export interface FarmerSummaryVO {
  farmerId: string;
  farmerName: string;
  totalLandArea: number;
  landCount: number;
  farmlandTotal: number;
  farmlands: FarmlandVO[];
  productionByCrop: ProductionByCrop[];
}
