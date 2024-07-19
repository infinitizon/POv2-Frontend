export const ValidationMessages  = {
  'bvn' : {
      'required': 'BVN is required',
      'minlength': 'Minimum of 11 digits',
      'maxlength': 'Maximum of 11 digits',
      'onlyDigits': 'BVN can only be digits',
  },
  'dob' : {
      'required': 'Date of birth is required',
  },
  'mothersMaidenName' : {
      'required': 'Mother Maiden Name is required',
  },
  'placeOfBirth' : {
      'required': 'Place Of Birth is required',
  },
  'chn' : {
    'required': 'CHN Number is required',
    'maxlength': 'CHN number cannot be greater than 15 characters'
  },
  'cscsNo' : {
    'required': 'CSCS Number is required',
    'maxlength': 'CSCS number cannot be greater than 15 characters'
  },
  'brokerName' : {
    'required': 'Broker Number is required',
  },

  'bankCode' : {
    'required': 'Please select a bank',
  },
  'nuban' : {
      'required': 'NUBAN is required',
      'minlength': 'NUBAN must be at least 10 characters',
      'maxlength': 'NUBAN cannot be more than 10 characters',
      'pattern': 'Must be valid NUBAN digits',
  },
  'password' : {
      'required': 'Password is required',
      'minlength': 'Password must be at least 6 characters',
  },

  'fullName' : {
    'required': 'Full Name is required',
  },
  'MaidenName' : {
    'required': 'Mother\'s Maiden Name is required',
  },
  'City' : {
    'required': 'City is required',
  },
  'Country' : {
    'required': 'Country is required',
  },
  'State' : {
    'required': 'State is required',
  },
  'LGA' : {
    'required': 'Local Government is required',
  },
  'Citizen' : {
    'required': 'Nationality is required',
  },
  'PostalCode' : {
    'required': 'Postal Code is required',
  },
  'nin' : {
    'required':  'NIN is required'
  },
  currency : {
    required: "Currency is required"
  },
  bank_name: {
    required: 'Please select a bank',
  },
  account_number: {
    required: 'NUBAN is required',
    minlength: 'NUBAN must be at least 10 characters',
    maxlength: 'NUBAN cannot be more than 10 characters',
    pattern: 'Must be valid NUBAN digits',
  },
  account_name: {
    required: "Account name is required"
  },
  relationship: {
    required: 'Next of kin relationship is required',
  },
  email: {
    required: 'Next of kin email is required',
    email: 'The email field must be a valid email',
  },
  phone: {
    required: 'Next of kin phone is required',
    maxlength: 'Maximum of 21 digits',
  },
  address1: {
    required: 'Address is required',
  },
  address: {
    required: 'Next of kin address is required',
  },
  name: {
    required: 'Next of kin name is required',
  },
  city: {
    required: 'City is required',
  },
  lga: {
    required: 'LGA is required',
  },
  country: {
    required: 'Country is required',
  },
  state: {
    required: 'State is required',
  },
};
export let FormErrors = {
  bvn: '', dob: '',
  mothersMaidenName: '', placeOfBirth: '',
  chn: '',
  cscsNo: '',
  brokerName: '',
  bank_name: '',
  account_number: '',
  currency: '',
  account_name: '',
  bankCode: '',
  nuban: '',
  bankName: '',
  bankAccountName: '',
  password: '',
  city: '',
  lga: '',
  country: '',
  state: '',
  address1: '',

  fullName: '',
  MaidenName: '',
  City: '',
  Country: '',
  State: '',
  LGA: '',
  Citizen: '',
  PostalCode: '',
  nin: '',
  relationship: '',
  email: '',
  phone: '',
  address: '',
  name: '',
};

export interface KYCDetail {
  bvn: string; dob: string;
  mothersMaidenName: string, placeOfBirth: string;
  chn: number;
  cscsNo: number;
  brokerName: string;

  bankCode: string;
  nuban: string;
  bankName: string;
  bankAccountName: string;
  password: string;
  currency: string;
  fullName: string;
  MaidenName: string;
  City: string;
  Country: string;
  State: string;
  LGA: string;
  Citizen: string;
  PostalCode: string;
  bank: any;
  account_number: string;
  name_on_account: string;
  account_name: string;
}
