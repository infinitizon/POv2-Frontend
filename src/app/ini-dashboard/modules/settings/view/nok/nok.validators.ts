export const ValidationMessages = {
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
  address: {
    required: 'Next of kin address is required',
  },
  name: {
    required: 'Next of kin name is required',
  },
};
export let FormErrors = {
  relationship: '',
  email: '',
  phone: '',
  address: '',
  name: '',
};

export interface Subscribers {
  mothersMaidenName: string;
  placeOfBirth: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bvn: string,
  dob: string,
  offering: string,
  city: string;
  country: string;
  state: string;
  nokRelationship: string;
  nokEmail: string;
  nokPhone: string;
  nokAddress: string;
  nokName: string;
}
