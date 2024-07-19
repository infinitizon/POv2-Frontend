export const ValidationMessages = {
  unit: {
    required: 'Unit is required',
    multipleOf: 'Unit should be multiple of {{unit}}',
    min: 'Minimum of {{minUnit}} units'
  },
  payment: {
    required: 'Payment is required',
  },
  broker: {
    required: 'Broker is required',
  }
};
export let FormErrors = {
  amount: '',
  payment: '',
  broker: ''
};

export interface Gateway {
  amount: string;
  payment: string;
}
