import { supabase } from '../supabase/client';
import { BuildingParams } from '../types';
import { DEFAULT_PERSONAL_DETAILS, PersonalDetails } from '../types/profile';

export interface UserProfileResult {
  personalDetails: PersonalDetails;
  onboardingCompleted: boolean;
}

const mapProfileToPersonalDetails = (record: any): PersonalDetails => ({
  ...DEFAULT_PERSONAL_DETAILS,
  fullName: record?.full_name ?? DEFAULT_PERSONAL_DETAILS.fullName,
  title: record?.title ?? DEFAULT_PERSONAL_DETAILS.title,
  email: record?.email ?? DEFAULT_PERSONAL_DETAILS.email,
  phone: record?.phone ?? DEFAULT_PERSONAL_DETAILS.phone,
  organization: record?.organization ?? DEFAULT_PERSONAL_DETAILS.organization,
  registrationId: record?.registration_id ?? DEFAULT_PERSONAL_DETAILS.registrationId,
  location: record?.location ?? DEFAULT_PERSONAL_DETAILS.location,
  expertise: record?.expertise ?? DEFAULT_PERSONAL_DETAILS.expertise,
  experience: record?.experience ?? DEFAULT_PERSONAL_DETAILS.experience,
});

export const fetchUserProfile = async (userId: string): Promise<UserProfileResult | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    personalDetails: mapProfileToPersonalDetails(data),
    onboardingCompleted: Boolean(data.onboarding_completed),
  };
};

export const upsertUserProfile = async (
  userId: string,
  details: PersonalDetails,
  onboardingCompleted?: boolean
) => {
  const payload: Record<string, any> = {
    user_id: userId,
    full_name: details.fullName,
    title: details.title,
    email: details.email,
    phone: details.phone,
    organization: details.organization,
    registration_id: details.registrationId,
    location: details.location,
    expertise: details.expertise,
    experience: details.experience,
  };

  if (typeof onboardingCompleted === 'boolean') {
    payload.onboarding_completed = onboardingCompleted;
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    throw error;
  }
};

export const updateOnboardingStatus = async (userId: string, completed: boolean) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ onboarding_completed: completed })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
};

export interface BuildingRecord {
  id: string;
  user_id: string;
  name: string;
  building_params: BuildingParams;
}

export const fetchPrimaryBuilding = async (userId: string): Promise<BuildingRecord | null> => {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data as BuildingRecord | null;
};

export const upsertPrimaryBuilding = async (
  userId: string,
  buildingParams: BuildingParams,
  options: { buildingId?: string; name?: string } = {}
): Promise<BuildingRecord> => {
  const payload: Record<string, any> = {
    user_id: userId,
    name: options.name ?? 'Primary Building',
    building_params: buildingParams,
  };

  if (options.buildingId) {
    payload.id = options.buildingId;
  }

  const { data, error } = await supabase
    .from('buildings')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as BuildingRecord;
};
