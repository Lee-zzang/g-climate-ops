// Supabase 데이터베이스 타입 정의

export type OperationMode = 'winter' | 'summer' | 'landslide' | 'heat';
export type RiskStatus = '조치필요' | '조치중' | '완료';
export type VehicleStatus = '대기' | '출동중' | '작업중' | '복귀중';
export type MessageType = 'alert' | 'info' | 'action' | 'success' | 'data';

export interface Database {
  public: {
    Tables: {
      risk_zones: {
        Row: {
          id: string;
          name: string;
          lat: number;
          lng: number;
          risk_score: number;
          reason: string;
          status: RiskStatus;
          mode: OperationMode;
          source_layer: string;
          details: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          lat: number;
          lng: number;
          risk_score: number;
          reason: string;
          status?: RiskStatus;
          mode: OperationMode;
          source_layer: string;
          details?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          lat?: number;
          lng?: number;
          risk_score?: number;
          reason?: string;
          status?: RiskStatus;
          mode?: OperationMode;
          source_layer?: string;
          details?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      agent_messages: {
        Row: {
          id: string;
          message: string;
          type: MessageType;
          mode: OperationMode;
          created_at: string;
        };
        Insert: {
          id: string;
          message: string;
          type: MessageType;
          mode: OperationMode;
          created_at?: string;
        };
        Update: {
          id?: string;
          message?: string;
          type?: MessageType;
          mode?: OperationMode;
        };
      };
      vehicles: {
        Row: {
          id: string;
          type: string;
          status: VehicleStatus;
          lat: number;
          lng: number;
          assigned_zone_id: string | null;
          mode: OperationMode;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          type: string;
          status?: VehicleStatus;
          lat: number;
          lng: number;
          assigned_zone_id?: string | null;
          mode: OperationMode;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          status?: VehicleStatus;
          lat?: number;
          lng?: number;
          assigned_zone_id?: string | null;
          mode?: OperationMode;
          updated_at?: string;
        };
      };
      analysis_history: {
        Row: {
          id: string;
          mode: OperationMode;
          total_zones: number;
          high_risk: number;
          medium_risk: number;
          low_risk: number;
          data_sources: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          mode: OperationMode;
          total_zones: number;
          high_risk: number;
          medium_risk: number;
          low_risk: number;
          data_sources?: string[];
          created_at?: string;
        };
        Update: {
          mode?: OperationMode;
          total_zones?: number;
          high_risk?: number;
          medium_risk?: number;
          low_risk?: number;
          data_sources?: string[];
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          default_mode: OperationMode;
          notification_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          default_mode?: OperationMode;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          default_mode?: OperationMode;
          notification_enabled?: boolean;
          updated_at?: string;
        };
      };
    };
    Enums: {
      operation_mode: OperationMode;
      risk_status: RiskStatus;
      vehicle_status: VehicleStatus;
      message_type: MessageType;
    };
  };
}

// 편의 타입
export type RiskZone = Database['public']['Tables']['risk_zones']['Row'];
export type AgentMessage = Database['public']['Tables']['agent_messages']['Row'];
export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type AnalysisHistory = Database['public']['Tables']['analysis_history']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
