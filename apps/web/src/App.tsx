import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Sidebar } from './components/layout/sidebar';
import { MissionMap } from './components/map/mission-map';
import { StatCard } from './components/ui/stat-card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { ReportComposer } from './components/report/report-composer';
import { MISSIONS_QUERY, type Mission, type MissionStatus } from './graphql/missions';

const statusOptions: { value: 'ALL' | MissionStatus; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'Live now' },
  { value: 'COMPLETED', label: 'Completed' },
];

function computeStats(missions: Mission[]) {
  const liveMissions = missions.filter((mission) => mission.status !== 'COMPLETED').length;
  const totalMissions = missions.length;
  const reportsToday = missions
    .flatMap((mission) => mission.reports)
    .filter((report) => isDateToday(report.submittedAt)).length;
  const totalReports = missions.reduce((sum, mission) => sum + mission.reports.length, 0);

  return [
    {
      label: 'Live missions',
      value: liveMissions,
      trend: `${totalMissions} total`,
    },
    {
      label: 'Reports today',
      value: reportsToday,
      trend: `${totalReports} overall`,
    },
  ];
}

function computeHighlights(missions: Mission[]) {
  return [...missions]
    .filter((mission) => mission.status !== 'COMPLETED')
    .sort(
      (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime(),
    )
    .slice(0, 2)
    .map((mission) => ({
      label: mission.name,
      value: formatRange(mission.scheduledStart, mission.scheduledEnd),
    }));
}

function isDateToday(date: string) {
  const target = new Date(date);
  const today = new Date();
  return target.getUTCFullYear() === today.getUTCFullYear() && target.getUTCMonth() === today.getUTCMonth() && target.getUTCDate() === today.getUTCDate();
}

function formatRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${formatter.format(start)} → ${formatter.format(end)}`;
}

function formatRelativeTime(dateISO: string) {
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = Date.now();
  const value = new Date(dateISO).getTime();
  const diffMinutes = Math.round((value - now) / (1000 * 60));

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minutes');
  }

  const diffHours = Math.round(diffMinutes / 60);
  return formatter.format(diffHours, 'hours');
}

function MissionFilters({
  active,
  onChange,
}: {
  active: 'ALL' | MissionStatus;
  onChange: (value: 'ALL' | MissionStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          variant={active === option.value ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function HighlightList({ cards }: { cards: { label: string; value: string }[] }) {
  if (cards.length === 0) {
    return (
      <StatCard label="No upcoming missions" value="" trend="Plan your next deployment" />
    );
  }

  return (
    <div className="grid gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} />
      ))}
    </div>
  );
}

function MissionDetailDrawer({ mission, onClose }: { mission: Mission | null; onClose: () => void }) {
  if (!mission) return null;
  const recentReports = mission.reports.slice(0, 3);

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Mission</p>
          <h3 className="text-2xl font-semibold text-slate-900">{mission.name}</h3>
          <p className="text-sm text-slate-500">{mission.region}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <Badge>{mission.status.replace('_', ' ')}</Badge>
        <span>Code · {mission.code}</span>
        <span>{formatRange(mission.scheduledStart, mission.scheduledEnd)}</span>
      </div>
      <div className="mt-6 space-y-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Recent reports</p>
        {recentReports.length === 0 ? (
          <p className="text-sm text-slate-500">No reports yet for this mission.</p>
        ) : (
          <ol className="space-y-3">
            {recentReports.map((report) => (
              <li key={report.id} className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                <p className="text-sm font-semibold text-slate-800">{report.authorName}</p>
                <p className="text-xs text-slate-500">{formatRelativeTime(report.submittedAt)}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {report.summary ?? 'Pending AI summary'}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 text-center text-slate-600">
      <div>
        <p className="text-sm font-semibold">Unable to load missions</p>
        <p className="text-xs text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function App() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | MissionStatus>('ALL');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<{ missions: Mission[] }>(MISSIONS_QUERY, {
    variables: {
      filter: statusFilter === 'ALL' ? undefined : { status: statusFilter },
    },
    fetchPolicy: 'cache-and-network',
  });

  const missions = useMemo(() => data?.missions ?? [], [data?.missions]);

  const stats = useMemo(() => computeStats(missions), [missions]);
  const highlights = useMemo(() => computeHighlights(missions), [missions]);
  const selectedMission = missions.find((mission) => mission.id === selectedMissionId) ?? null;

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-50/60 lg:grid-cols-[380px_1fr]">
      <Sidebar
        subtitle="EcoFieldOps"
        title="Mission Control"
        description="Live missions pulled from the GraphQL API. Filter by status and drill into individual deployments."
        stats={stats}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Filter status</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
          <MissionFilters active={statusFilter} onChange={(next) => {
            setStatusFilter(next);
            setSelectedMissionId(null);
          }} />
          <div className="pt-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Upcoming deployments</p>
            <HighlightList cards={highlights} />
          </div>
          <div className="pt-6">
            <ReportComposer missions={missions} />
          </div>
        </div>
      </Sidebar>
      <main className="relative overflow-hidden">
        <MissionMap
          missions={missions}
          onSelectMission={setSelectedMissionId}
          selectedMissionId={selectedMissionId}
          isLoading={loading}
        />
        {error ? <ErrorBanner message={error.message} /> : null}
        <MissionDetailDrawer mission={selectedMission} onClose={() => setSelectedMissionId(null)} />
      </main>
    </div>
  );
}

export default App;
