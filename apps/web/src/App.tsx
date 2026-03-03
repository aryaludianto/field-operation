import { Sidebar } from './components/layout/sidebar';
import { MissionMap } from './components/map/mission-map';
import { StatCard } from './components/ui/stat-card';

const mockStats = [
  { label: 'Live missions', value: 3, trend: '+1 vs yesterday' },
  { label: 'Reports today', value: 12, trend: '4 awaiting review' },
];

const highlightCards = [
  { label: 'Amsterdam Delta Sweep', value: 'In progress' },
  { label: 'Veluwe canopy survey', value: 'Planned for 09:30' },
];

function App() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-50/60 lg:grid-cols-[380px_1fr]">
      <Sidebar
        subtitle="EcoFieldOps"
        title="Mission Control"
        description="Map-based dashboard for tracking field activity. GraphQL + Mapbox integration coming soon."
        stats={mockStats}
      >
        <div className="grid gap-3">
          {highlightCards.map((card) => (
            <StatCard key={card.label} label={card.label} value={card.value} />
          ))}
        </div>
      </Sidebar>
      <main className="relative overflow-hidden">
        <MissionMap />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
      </main>
    </div>
  );
}

export default App;
