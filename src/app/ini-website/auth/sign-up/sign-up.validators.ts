export const ValidationMessages = {
  bvn: {
    required: 'BVN is required',
    minlength: 'Minimum of 11 digits',
    maxlength: 'Maximum of 11 digits',
    onlyDigits: 'Must be only digits',
  },
  dob: {
    required: 'Date of birth is required',
  },
};

export let FormErrors = {
  bvn: '',
  dob: '',
};

export interface SignUp {
  bvn: string;
  dob: string;
}
