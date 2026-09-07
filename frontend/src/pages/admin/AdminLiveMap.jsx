import { useState, useEffect, Suspense, lazy } from 'react';
import { Layers, Car, Zap, TrendingUp, Grid, Flame, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useMapStore } from '@/stores';
import { locationService } from '@/services';
import { MOCK_GRID_CELLS } from '@/mock/pricing';
import { Card, Spinner, Avatar, Rating, Badge, StatusDot } from '@/components/ui';

const LiveMap = lazy(() => import('@/components/map/LiveMap'));

const LAYERS = [
  { key: 'drivers', label: 'Drivers', icon: Car },
  { key: 'activeRides', label: 'Active Rides', icon: Zap },
  { key: 'surgeZones', label: 'Surge Zones', icon: Flame },
  { key: 'grid', label: 'Grid Cells', icon: Grid },
  { key: 'demand', label: 'Demand', icon: TrendingUp },
];

export default function AdminLiveMap() {
  const { drivers, layers, selectedDriverId, selectDriver, toggleLayer, startSimulation } = useMapStore();
  const [gridCells, setGridCells] = useState([]);
  const [showLayers, setShowLayers] = useState(false);

  useEffect(() => {
    startSimulation();
    locationService.getGridCells().then(setGridCells);
  }, [startSimulation]);

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);
  const onlineDrivers = drivers.filter(d => d.status !== 'OFFLINE');
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');
  const onRideDrivers = drivers.filter(d => d.status === 'ON_RIDE');

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left panel */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200">
          <p className="text-sm font-bold text-slate-900">Live Operations Map</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 text-slate-600"><span className="w-2 h-2 bg-green-500 rounded-full" />{availableDrivers.length} available</span>
            <span className="flex items-center gap-1 text-slate-600"><span className="w-2 h-2 bg-yellow-500 rounded-full" />{onRideDrivers.length} on ride</span>
          </div>
        </div>

        {/* Layer toggles */}
        <div className="px-4 py-3 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Map Layers</p>
          <div className="space-y-1.5">
            {LAYERS.map(({ key, label, icon: Icon }) => (
              <button key={key}
                onClick={() => toggleLayer(key)}
                className={clsx('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors', layers[key] ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50')}>
                <Icon size={14} />
                {label}
                <div className={clsx('ml-auto w-8 h-4 rounded-full transition-colors relative', layers[key] ? 'bg-blue-500' : 'bg-slate-200')}>
                  <div className={clsx('absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform', layers[key] ? 'translate-x-4' : 'translate-x-0.5')} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Driver list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 sticky top-0 bg-white border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Drivers ({onlineDrivers.length})</p>
          </div>
          <div className="space-y-0">
            {drivers.map(driver => (
              <button key={driver.id}
                onClick={() => selectDriver(driver.id === selectedDriverId ? null : driver.id)}
                className={clsx('w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 text-left transition-colors', driver.id === selectedDriverId && 'bg-blue-50')}>
                <div className="relative">
                  <Avatar name={driver.name} size="sm" />
                  <StatusDot status={driver.status} className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{driver.name}</p>
                  <p className="text-xs text-slate-500 truncate">{driver.vehicle.make} {driver.vehicle.model}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-amber-500 font-medium">★{driver.rating}</p>
                  <p className="text-xs text-slate-400">{driver.vehicle.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Suspense fallback={<div className="w-full h-full bg-slate-200 flex items-center justify-center"><Spinner size="xl" /></div>}>
          <LiveMap
            zoom={12}
            tileTheme="light"
            showSurgeZones={layers.surgeZones}
            height="100%"
            onDriverClick={(d) => selectDriver(d.id)}
          />
        </Suspense>

        {/* Grid cells overlay info */}
        {layers.grid && (
          <div className="absolute top-3 left-3 right-3 flex gap-2 flex-wrap pointer-events-none">
            {MOCK_GRID_CELLS.filter(c => c.isSurge).map(cell => (
              <div key={cell.id} className="bg-white/95 border border-red-200 rounded-lg px-3 py-1.5 text-xs shadow-sm">
                <span className="font-semibold text-red-600">{cell.zone}</span>
                <span className="text-slate-600 ml-1">{cell.surge}x surge · {cell.demand} demand</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Driver detail panel */}
      {selectedDriver && (
        <div className="w-72 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0 slide-up">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">Driver Info</p>
            <button onClick={() => selectDriver(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selectedDriver.name} size="lg" />
              <div>
                <p className="font-semibold text-slate-900">{selectedDriver.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusDot status={selectedDriver.status} />
                  <span className="text-xs text-slate-500">{selectedDriver.status.replace('_', ' ')}</span>
                </div>
                <Rating value={selectedDriver.rating} />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {[
                { label: 'Driver ID', value: selectedDriver.id },
                { label: 'Phone', value: selectedDriver.phone },
                { label: 'Vehicle', value: `${selectedDriver.vehicle.make} ${selectedDriver.vehicle.model}` },
                { label: 'Plate', value: selectedDriver.vehicle.plate, mono: true },
                { label: 'Category', value: selectedDriver.vehicle.category },
                { label: 'Location', value: `${selectedDriver.location.lat.toFixed(4)}, ${selectedDriver.location.lng.toFixed(4)}`, mono: true },
                { label: 'Speed', value: `${selectedDriver.speed} km/h` },
                { label: 'Grid Cell', value: selectedDriver.gridCellId, mono: true },
                { label: 'Today rides', value: selectedDriver.todayRides },
                { label: 'Today earnings', value: `₹${selectedDriver.todayEarnings.toLocaleString()}` },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className={clsx('font-medium text-slate-900', mono && 'font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded')}>{value}</span>
                </div>
              ))}
            </div>

            {/* Performance scores */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Performance</p>
              {[
                { label: 'Overall', value: selectedDriver.performanceScore },
                { label: 'Safety', value: selectedDriver.safetyScore },
                { label: 'Punctuality', value: selectedDriver.punctualityScore },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-slate-500 w-20">{label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div className={clsx('h-1.5 rounded-full', value >= 90 ? 'bg-green-500' : value >= 70 ? 'bg-yellow-500' : 'bg-red-500')}
                      style={{ width: `${value}%` }} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-700 w-8">{value}</span>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Documents</p>
              <div className="space-y-1">
                {selectedDriver.documents.map(doc => (
                  <div key={doc.type} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{doc.type.replace('_', ' ')}</span>
                    <Badge variant={doc.status === 'VERIFIED' ? 'green' : doc.status === 'PENDING' ? 'yellow' : 'red'}>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
