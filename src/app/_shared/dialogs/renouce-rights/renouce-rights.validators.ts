export const ValidationMessages = {
  unit: {
    required: 'Unit is required',
    // divisionBy: 'Amount should be minimum of {{sharePrice}} for {{minPurchaseUnits}} units'
  },
  unitHeld: {
     required: 'Unit held is required'
  },
  rightEntitled: {
     required: 'Right entitled is required'
  },
  purchaseOption: {
    required: 'Purchase option is required'
  },
  payment: {
    required: 'Payment is required',
  },

};
export let FormErrors = {
  amount: '',
  payment: '',
  purchaseOption: '',
  unit: '',
  unitHeld: '',
  rightEntitled: ''
};

export interface Gateway {
  amount: string;
  payment: string;
  purchaseOption: string;
  unit: string;
  unitHeld: string;
  rightEntitled: string;
}
