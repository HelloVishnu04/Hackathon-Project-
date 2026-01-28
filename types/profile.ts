export interface PersonalDetails {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  organization: string;
  registrationId: string;
  location: string;
  expertise: string;
  experience: string;
}

export const DEFAULT_PERSONAL_DETAILS: PersonalDetails = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  organization: '',
  registrationId: '',
  location: '',
  expertise: '',
  experience: '',
};
