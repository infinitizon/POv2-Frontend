export const ValidationMessages = {
  unit: {
    required: 'Number of shares accepted is required',
    plusBy: 'Number of shares accepted cannot be greater than  available rights'
  },
  unitHeld: {
     required: 'Unit held is required'
  },
  rightEntitled: {
     required: 'Right entitled is required',
     unitBy: 'Right entitled should be more than 0'
  },
  purchaseOption: {
    required: 'Purchase option is required'
  },
  payment: {
    required: 'Payment is required',
  },
  renounced: {
    plusBy: 'Number of shares accepted and renounced cannot be greater than Rights entitled',
    unitBy: 'Number of shares accepted should be more than 0'
  },
  additional: {
    required: 'Additional right is required',
    checkBy: 'Complete purchase of rights entitled before proceeding',
    min: 'Unit must be greater than zero'
  }

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
