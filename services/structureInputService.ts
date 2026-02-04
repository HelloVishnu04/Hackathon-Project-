import { supabase } from '../supabase/client';
import { BuildingParams } from '../types';

export interface StructureInputLog {
  userId: string;
  buildingId?: string | null;
  params: BuildingParams;
  metadata?: Record<string, unknown> | null;
}

export const logStructureInput = async ({
  userId,
  buildingId,
  params,
  metadata,
}: StructureInputLog): Promise<void> => {
  const payload = {
    user_id: userId,
    building_id: buildingId ?? null,
    input_params: params,
    metadata: metadata ?? null,
  };

  const { error } = await supabase
    .from('structure_inputs')
    .insert(payload);

  if (error) {
    throw error;
  }
};
