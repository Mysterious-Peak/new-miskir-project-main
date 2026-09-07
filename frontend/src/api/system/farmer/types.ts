export interface FarmerVO {
  /**
   * Primary Key ID
   */
  userId: string | number;

  userName?: string;
  password?: string;
  repeatPassword?: string;

  /**
   * Farmer Name
   */
  nickName: string;

  /**
   * Contact Telephone
   */
  phonenumber: string;

  /**
   * ID Card Number
   */
  idNo: string | number;

  /**
   * ID Card Type
   */
  idType: string | number;

  /**
   * Farmer Type
   */
  tp: string;

  /**
   * ID Validity Period End Date
   */
  periodOfValidatyEndDt: string | number;

  /**
   * ID Validity Period Start Date
   */
  periodOfValidatyStartDt: string | number;

  /**
   * Address
   */
  address: string;

  /**
   * Gender
   */
  sex: string;

  /**
   * Photo URL
   */
  photoUrl: string;

  /**
   * Photo URLUrl
   */
  photoUrlUrl: string;
  /**
   * Age
   */
  age: number;
}

export interface FarmerForm extends BaseEntity {
  /**
   * Primary Key ID
   */
  userId?: string | number;

  userName?: string;
  password?: string;
  repeatPassword?: string;

  /**
   * Farmer Name
   */
  nickName?: string;

  /**
   * Contact Telephone
   */
  phonenumber?: string;

  /**
   * ID Card Number
   */
  idNo?: string | number;

  /**
   * ID Card Type
   */
  idType?: string | number;

  /**
   * Farmer Type
   */
  tp?: string;

  /**
   * ID Validity Period End Date
   */
  periodOfValidatyEndDt?: string | number;

  /**
   * ID Validity Period Start Date
   */
  periodOfValidatyStartDt?: string | number;

  /**
   * Address
   */
  address?: string;

  /**
   * Gender
   */
  sex?: string;

  /**
   * Photo URL
   */
  photoUrl?: string;

  /**
   * Age
   */
  age?: number;
}

export interface FarmerQuery extends PageQuery {
  /**
   * Farmer Name
   */
  nickName?: string;

  /**
   * Contact Telephone
   */
  phonenumber?: string;

  /**
   * ID Card Number
   */
  idNo?: string | number;

  /**
   * ID Card Type
   */
  idType?: string | number;

  /**
   * Farmer Type
   */
  tp?: string;

  /**
   * ID Validity Period End Date
   */
  periodOfValidatyEndDt?: string | number;

  /**
   * ID Validity Period Start Date
   */
  periodOfValidatyStartDt?: string | number;

  /**
   * Address
   */
  address?: string;

  /**
   * Gender
   */
  sex?: string;

  /**
   * Photo URL
   */
  photoUrl?: string;

  /**
   * Age
   */
  age?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
