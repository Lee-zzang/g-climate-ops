-- G-Climate Ops 시드 데이터
-- 경기도 기후 재난 초기 데이터

-- ============================================
-- 겨울 모드: 블랙아이스 위험 구간
-- ============================================
INSERT INTO risk_zones (id, name, lat, lng, risk_score, reason, status, mode, source_layer, details) VALUES
('W001', '수원시 영통구 1번국도 A구간', 37.2636, 127.0286, 95, '음지 급경사 구간 - 태양광 잠재량 최하위', '조치필요', 'winter', 'slop_20_ovr', '{"temperature": -2, "slope": 12.5, "sunlight": "일일 일조량 2시간 미만 (음지)"}'),
('W002', '용인시 처인구 산악도로 B구간', 37.2341, 127.2017, 88, '북향 경사면 - 결빙 잔존 시간 최장', '조치필요', 'winter', 'slop_20_ovr', '{"temperature": -3, "slope": 15.2, "sunlight": "일일 일조량 3시간 미만"}'),
('W003', '성남시 분당구 고가도로 하부', 37.3595, 127.1086, 82, '고가 그늘 구간 - 상시 음지', '조치중', 'winter', 'sprd_rw_41', '{"temperature": -1, "slope": 3.5, "sunlight": "고가 차폐로 일조량 0"}'),
('W004', '과천시 관악산 진입로', 37.4292, 126.9876, 91, '산악 음지 + 급경사 복합 위험', '조치필요', 'winter', 'mountdstc_rvr', '{"temperature": -4, "slope": 18.7, "sunlight": "산 그림자 영향 일조량 1시간"}'),
('W005', '안양시 만안구 터널 출구', 37.3943, 126.9568, 78, '터널 출구 급격한 온도차', '조치중', 'winter', 'sprd_rw_41', '{"temperature": -2, "slope": 5.2, "sunlight": "터널 내외부 온도차 8도"}'),
('W006', '의왕시 백운호수 주변 도로', 37.3447, 126.9683, 85, '호수 인접 습기 + 음지', '조치필요', 'winter', 'sprd_rw_41', '{"temperature": -3, "slope": 7.8, "sunlight": "수면 반사 습기로 결빙 촉진"}'),
('W007', '광명시 철산동 육교 하부', 37.4786, 126.8656, 72, '육교 그늘 + 교통량 적어 제설 지연', '완료', 'winter', 'sprd_rw_41', '{"temperature": -1, "slope": 2.1, "sunlight": "육교 차폐 구간"}');

-- ============================================
-- 여름 모드: 침수 위험 구간
-- ============================================
INSERT INTO risk_zones (id, name, lat, lng, risk_score, reason, status, mode, source_layer, details) VALUES
('S001', '수원시 권선구 B교차로', 37.2577, 127.0286, 88, '배수 불량 + 불투수면 밀집 저지대', '조치필요', 'summer', 'impvs', '{"rainfall": 50, "impervious_rate": 92, "elevation": 15}'),
('S002', '부천시 원미구 지하차도', 37.5034, 126.7660, 95, '지하차도 구조 + 집중호우 시 급속 침수', '조치필요', 'summer', 'cfm_sgg_41_100yr_1h', '{"rainfall": 60, "impervious_rate": 100, "elevation": -5}'),
('S003', '안산시 단원구 저지대 상가', 37.3180, 126.8309, 82, '해안 저지대 + 배수 시설 노후', '조치중', 'summer', 'cfm_sgg_41_100yr_1h', '{"rainfall": 45, "impervious_rate": 88, "elevation": 8}'),
('S004', '시흥시 정왕동 산업단지', 37.3459, 126.7380, 79, '대규모 불투수면 + 우수관 용량 부족', '조치필요', 'summer', 'impvs', '{"rainfall": 55, "impervious_rate": 95, "elevation": 12}'),
('S005', '평택시 팽성읍 농경지 인접 도로', 37.0052, 127.0286, 75, '농경지 유출수 집중 구간', '조치중', 'summer', 'tm_fldn_trce', '{"rainfall": 70, "impervious_rate": 45, "elevation": 5}'),
('S006', '고양시 일산동구 호수공원 주변', 37.6584, 126.7742, 68, '호수 범람 위험 + 저지대', '완료', 'summer', 'tm_fldn_trce', '{"rainfall": 40, "impervious_rate": 60, "elevation": 18}'),
('S007', '파주시 금촌동 하천 인접 도로', 37.7628, 126.7810, 86, '하천 범람 위험 + 배수 불량', '조치필요', 'summer', 'ntn_rvr', '{"rainfall": 65, "impervious_rate": 78, "elevation": 10}');

-- ============================================
-- 산사태 위험 구간
-- ============================================
INSERT INTO risk_zones (id, name, lat, lng, risk_score, reason, status, mode, source_layer, details) VALUES
('L001', '가평군 청평면 산지 도로', 37.7321, 127.4567, 92, '산사태 1등급 구역 + 급경사', '조치필요', 'landslide', 'ldsld_grd1', '{"slope": 35, "soil_type": "화강암 풍화토", "vegetation": "소나무림"}'),
('L002', '양평군 용문면 계곡 인접', 37.5234, 127.5678, 87, '과거 산사태 이력 + 집중호우 취약', '조치필요', 'landslide', 'ldsld_ocrn_prst', '{"slope": 28, "history_count": 3, "last_occurrence": "2022-08"}'),
('L003', '포천시 이동면 산악지대', 37.8945, 127.2345, 84, '산사태 취약지역 지정', '조치중', 'landslide', 'ldsld_weak_rgn', '{"slope": 32, "drainage": "불량", "rock_type": "편마암"}');

-- ============================================
-- 폭염 위험 구간 (무더위쉼터 포함)
-- ============================================
INSERT INTO risk_zones (id, name, lat, lng, risk_score, reason, status, mode, source_layer, details) VALUES
('H001', '수원시 팔달구 재래시장', 37.2845, 127.0156, 88, '기후취약지역 최상위 + 고령인구 밀집', '조치필요', 'heat', 'clim_weak_rgn_scr', '{"vulnerability_score": 92, "elderly_ratio": 35, "shelter_distance": 800}'),
('H002', '안양시 동안구 공단지역', 37.3912, 126.9234, 82, '열섬효과 + 야외근로자 다수', '조치필요', 'heat', 'clim_weak_rgn_scr', '{"vulnerability_score": 85, "surface_temp": 42, "worker_count": 2500}'),
('H003', '성남시 수정구 구도심', 37.4523, 127.1456, 79, '노후주택 밀집 + 냉방취약계층', '조치중', 'heat', 'clim_weak_rgn_scr', '{"vulnerability_score": 78, "old_building_ratio": 65, "low_income_ratio": 28}');

-- ============================================
-- 차량/장비 데이터
-- ============================================
INSERT INTO vehicles (id, type, status, lat, lng, assigned_zone_id, mode) VALUES
-- 제설차 (겨울)
('V-W001', '제설차', '대기', 37.2700, 127.0300, NULL, 'winter'),
('V-W002', '제설차', '출동중', 37.2636, 127.0286, 'W001', 'winter'),
('V-W003', '제설차', '작업중', 37.3595, 127.1086, 'W003', 'winter'),
('V-W004', '제설차', '대기', 37.4292, 126.9876, NULL, 'winter'),
-- 양수기 (여름)
('V-S001', '양수기', '대기', 37.2600, 127.0300, NULL, 'summer'),
('V-S002', '양수기', '출동중', 37.5034, 126.7660, 'S002', 'summer'),
('V-S003', '양수기', '작업중', 37.3180, 126.8309, 'S003', 'summer'),
-- 굴착기 (산사태)
('V-L001', '굴착기', '대기', 37.7400, 127.4600, NULL, 'landslide'),
('V-L002', '굴착기', '출동중', 37.7321, 127.4567, 'L001', 'landslide'),
-- 이동쉼터 (폭염)
('V-H001', '이동쉼터', '대기', 37.2900, 127.0200, NULL, 'heat'),
('V-H002', '이동쉼터', '작업중', 37.2845, 127.0156, 'H001', 'heat');
