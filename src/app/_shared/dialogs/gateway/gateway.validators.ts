export const ValidationMessages = {
  amount: {
    required: 'Amount is required',
    divisionBy: 'Amount should be minimum of {{sharePrice}} for {{minPurchaseUnits}} units'
  },
  payment: {
    required: 'Payment is required',
  }
};
export let FormErrors = {
  amount: '',
  payment: ''
};

export interface Gateway {
  amount: string;
  payment: string;
}
