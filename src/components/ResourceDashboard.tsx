'use client';

import { ResourceSummary, Personnel, Vehicle, VehicleType } from '@/types/advisor';
import { OperationMode, MODE_INFO } from '@/types';
import {
  Truck,
  Droplets,
  Construction,
  Home,
  Ambulance,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
} from 'lucide-react';

interface ResourceDashboardProps {
  mode: OperationMode;
  resources: ResourceSummary[];
  personnel: Personnel;
  vehicles: Vehicle[];
}

const vehicleIcons: Record<VehicleType, React.ReactNode> = {
  '제설차': <Truck className="w-4 h-4" />,
  '양수기': <Droplets className="w-4 h-4" />,
  '굴착기': <Construction className="w-4 h-4" />,
  '이동쉼터': <Home className="w-4 h-4" />,
  '구급차': <Ambulance className="w-4 h-4" />,
  '소방차': <Truck className="w-4 h-4 text-red-400" />,
};

export default function ResourceDashboard({
  mode,
  resources,
  personnel,
  vehicles,
}: ResourceDashboardProps) {
  const modeInfo = MODE_INFO[mode];

  const getModeColor = () => {
    switch (mode) {
      case 'winter': return 'purple';
      case 'summer': return 'blue';
      case 'landslide': return 'orange';
      case 'heat': return 'red';
    }
  };

  const color = getModeColor();

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-4">
      <h3 className={`text-sm font-bold text-${color}-400 mb-3 flex items-center gap-2`}>
        <Truck className="w-4 h-4" />
        자원 현황
      </h3>

      {/* 장비 현황 */}
      <div className="space-y-3 mb-4">
        {resources.map((resource) => {
          const percentage = (resource.available / resource.total) * 100;
          return (
            <div key={resource.type} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  {vehicleIcons[resource.type]}
                  <span>{resource.type}</span>
                </div>
                <span className="text-slate-400">
                  {resource.available}/{resource.total}대
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all bg-${color}-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  대기 {resource.available}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  출동 {resource.deployed}
                </span>
                <span className="flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-slate-400" />
                  정비 {resource.maintenance}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 인력 현황 */}
      <div className="border-t border-slate-700 pt-3 mb-4">
        <div className="flex items-center gap-2 text-slate-300 text-xs mb-2">
          <Users className="w-4 h-4" />
          <span>투입 인력</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-500">근무중</div>
            <div className="text-lg font-bold text-white">{personnel.onDuty}명</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-500">출동</div>
            <div className="text-lg font-bold text-yellow-400">{personnel.deployed}명</div>
          </div>
        </div>
      </div>

      {/* 출동 차량 목록 */}
      <div className="border-t border-slate-700 pt-3">
        <div className="text-xs text-slate-400 mb-2">출동 현황</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {vehicles
            .filter(v => v.status !== '대기')
            .slice(0, 5)
            .map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between text-xs bg-slate-800/50 rounded px-2 py-1"
              >
                <div className="flex items-center gap-2">
                  {vehicleIcons[vehicle.type]}
                  <span className="text-slate-300">{vehicle.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      vehicle.status === '작업중'
                        ? 'bg-green-500/20 text-green-400'
                        : vehicle.status === '출동중'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                  {vehicle.eta && vehicle.eta > 0 && (
                    <span className="text-slate-500">{vehicle.eta}분</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
