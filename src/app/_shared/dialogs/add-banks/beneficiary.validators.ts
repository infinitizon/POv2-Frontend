export const ValidationMessages = {
  asset: {
    required: 'Asset is required',
  },
  gateway: {
    required: 'Gateway is required',
  },
  sub_account_id: {
    required: 'Please select a sub account id',
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
  currency : {
    required: "Currency is required"
  },
  account_name: {
    required: "Account name is required"
  }
};
export let FormErrors = {
  asset: '',
  gateway: '',
  sub_account_id: '',
  bank_name: '',
  account_number: '',
  currency: '',
  account_name: ''
};

export interface Detail {
  parent: any; // this holds the asset
  gateway: string;
  sub_account_id: string;
  bank: any;
  bankCode: string;
  account_number: string;
  name_on_account: string;
  currency: string;
  account_name: string;
}
