export const ValidationMessages = {
  mothersMaidenName: {
    required: 'Mother Maiden Name is required',
  },
  placeOfBirth: {
    required: 'Place of birth is required',
  },
  email: {
    required: 'Email is required',
    pattern: 'Enter valid email'
  },
  phone: {
    required: 'Phone number is required',
    minlength: 'Phone Number must be at least 11 digits',
  },
  password: {
    required: 'Password is required',
    minlength: 'Must be minimum of 6 characters',
    oneDigit: 'Must contain one digit',
    oneLowerCase: 'Must contain one lowercase letter',
    oneUpperCase: 'Must contain one uppercase letter',
    specialChar: 'Must contain one special character e.g _, !, @, etc',
  },
  confirmPassword: {
    required: 'Confirm Password is required',
    mustMatch: 'Password  and Confirm password fields do not match',
  },
};
export let FormErrors = {
  mothersMaidenName: '',
  placeOfBirth: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',

};

export interface SignUp {
  mothersMaidenName: string;
  placeOfBirth: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
