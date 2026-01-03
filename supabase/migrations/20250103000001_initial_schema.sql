-- G-Climate Ops 데이터베이스 스키마
-- 경기도 기후 재난 관리 시스템

-- ENUM 타입 정의
CREATE TYPE operation_mode AS ENUM ('winter', 'summer', 'landslide', 'heat');
CREATE TYPE risk_status AS ENUM ('조치필요', '조치중', '완료');
CREATE TYPE vehicle_status AS ENUM ('대기', '출동중', '작업중', '복귀중');
CREATE TYPE message_type AS ENUM ('alert', 'info', 'action', 'success', 'data');

-- 위험 구역 테이블
CREATE TABLE risk_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  reason TEXT NOT NULL,
  status risk_status NOT NULL DEFAULT '조치필요',
  mode operation_mode NOT NULL,
  source_layer TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent 메시지 테이블
CREATE TABLE agent_messages (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  type message_type NOT NULL,
  mode operation_mode NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 차량/장비 테이블
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status vehicle_status NOT NULL DEFAULT '대기',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  assigned_zone_id TEXT REFERENCES risk_zones(id),
  mode operation_mode NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 분석 이력 테이블
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode operation_mode NOT NULL,
  total_zones INTEGER NOT NULL,
  high_risk INTEGER NOT NULL,
  medium_risk INTEGER NOT NULL,
  low_risk INTEGER NOT NULL,
  data_sources TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 설정 테이블 (Supabase Auth 연동용)
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_mode operation_mode DEFAULT 'winter',
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_risk_zones_mode ON risk_zones(mode);
CREATE INDEX idx_risk_zones_status ON risk_zones(status);
CREATE INDEX idx_risk_zones_risk_score ON risk_zones(risk_score DESC);
CREATE INDEX idx_agent_messages_mode ON agent_messages(mode);
CREATE INDEX idx_agent_messages_created_at ON agent_messages(created_at DESC);
CREATE INDEX idx_vehicles_mode ON vehicles(mode);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- Row Level Security (RLS) 활성화
ALTER TABLE risk_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (인증된 사용자만)
CREATE POLICY "Allow authenticated read" ON risk_zones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON agent_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON vehicles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON analysis_history
  FOR SELECT TO authenticated USING (true);

-- 사용자 설정은 본인만 접근
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 적용
CREATE TRIGGER risk_zones_updated_at
  BEFORE UPDATE ON risk_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
