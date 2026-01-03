/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';
import type {
  OperationMode,
  RiskZone,
  AgentMessage,
  Vehicle,
  AnalysisHistory,
  RiskStatus,
  VehicleStatus,
} from '@/types/database';

// ============================================
// Risk Zones API
// ============================================

export async function getRiskZones(mode: OperationMode) {
  const { data, error } = await (supabase as any)
    .from('risk_zones')
    .select('*')
    .eq('mode', mode)
    .order('risk_score', { ascending: false });

  if (error) throw error;
  return data as RiskZone[];
}

export async function getRiskZoneById(id: string) {
  const { data, error } = await (supabase as any)
    .from('risk_zones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as RiskZone;
}

export async function updateRiskZoneStatus(id: string, status: RiskStatus) {
  const { data, error } = await (supabase as any)
    .from('risk_zones')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as RiskZone;
}

export async function createRiskZone(zone: Omit<RiskZone, 'created_at' | 'updated_at'>) {
  const { data, error } = await (supabase as any)
    .from('risk_zones')
    .insert(zone)
    .select()
    .single();

  if (error) throw error;
  return data as RiskZone;
}

// ============================================
// Risk Summary
// ============================================

export async function getRiskSummary(mode: OperationMode) {
  const { data, error } = await (supabase as any)
    .from('risk_zones')
    .select('risk_score')
    .eq('mode', mode);

  if (error) throw error;

  const zones = (data || []) as { risk_score: number }[];
  return {
    total_zones: zones.length,
    high_risk: zones.filter((z) => z.risk_score >= 80).length,
    medium_risk: zones.filter((z) => z.risk_score >= 50 && z.risk_score < 80).length,
    low_risk: zones.filter((z) => z.risk_score < 50).length,
  };
}

// ============================================
// Agent Messages API
// ============================================

export async function getAgentMessages(mode: OperationMode, limit = 50) {
  const { data, error } = await (supabase as any)
    .from('agent_messages')
    .select('*')
    .eq('mode', mode)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AgentMessage[];
}

export async function createAgentMessage(message: Omit<AgentMessage, 'created_at'>) {
  const { data, error } = await (supabase as any)
    .from('agent_messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data as AgentMessage;
}

// ============================================
// Vehicles API
// ============================================

export async function getVehicles(mode: OperationMode) {
  const { data, error } = await (supabase as any)
    .from('vehicles')
    .select('*')
    .eq('mode', mode)
    .order('status');

  if (error) throw error;
  return data as Vehicle[];
}

export async function updateVehicleStatus(id: string, status: VehicleStatus, assignedZoneId?: string | null) {
  const updateData: { status: VehicleStatus; assigned_zone_id?: string | null } = { status };
  if (assignedZoneId !== undefined) {
    updateData.assigned_zone_id = assignedZoneId;
  }

  const { data, error } = await (supabase as any)
    .from('vehicles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export async function updateVehicleLocation(id: string, lat: number, lng: number) {
  const { data, error } = await (supabase as any)
    .from('vehicles')
    .update({ lat, lng })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

// ============================================
// Analysis History API
// ============================================

export async function saveAnalysisHistory(
  mode: OperationMode,
  summary: { total_zones: number; high_risk: number; medium_risk: number; low_risk: number },
  dataSources: string[]
) {
  const { data, error } = await (supabase as any)
    .from('analysis_history')
    .insert({
      mode,
      total_zones: summary.total_zones,
      high_risk: summary.high_risk,
      medium_risk: summary.medium_risk,
      low_risk: summary.low_risk,
      data_sources: dataSources,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AnalysisHistory;
}

export async function getAnalysisHistory(mode?: OperationMode, limit = 10) {
  let query = (supabase as any)
    .from('analysis_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (mode) {
    query = query.eq('mode', mode);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as AnalysisHistory[];
}

// ============================================
// Real-time Subscriptions
// ============================================

export function subscribeToRiskZones(
  mode: OperationMode,
  callback: (zone: RiskZone) => void
) {
  return supabase
    .channel(`risk_zones_${mode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'risk_zones',
        filter: `mode=eq.${mode}`,
      },
      (payload) => {
        callback(payload.new as RiskZone);
      }
    )
    .subscribe();
}

export function subscribeToAgentMessages(
  mode: OperationMode,
  callback: (message: AgentMessage) => void
) {
  return supabase
    .channel(`agent_messages_${mode}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_messages',
        filter: `mode=eq.${mode}`,
      },
      (payload) => {
        callback(payload.new as AgentMessage);
      }
    )
    .subscribe();
}

export function subscribeToVehicles(
  mode: OperationMode,
  callback: (vehicle: Vehicle) => void
) {
  return supabase
    .channel(`vehicles_${mode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'vehicles',
        filter: `mode=eq.${mode}`,
      },
      (payload) => {
        callback(payload.new as Vehicle);
      }
    )
    .subscribe();
}
