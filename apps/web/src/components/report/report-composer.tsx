import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'classnames';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import type { Mission } from '../../graphql/missions';

const DRAFT_STORAGE_KEY = 'ecofieldops.reportDrafts.v1';

const severityOptions = [
  {
    value: 'LOW',
    label: 'Low',
    helper: 'Routine observation',
    tone: 'border-green-200 bg-green-50 text-green-800',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    helper: 'Requires follow-up',
    tone: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  {
    value: 'HIGH',
    label: 'High',
    helper: 'Immediate action',
    tone: 'border-rose-200 bg-rose-50 text-rose-900',
  },
] as const;

type AttachmentPreview = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type ReportDraft = {
  id: string;
  missionId: string | null;
  missionName: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  bodyHtml: string;
  attachments: { name: string; size: number; type: string }[];
  createdAt: string;
};

export function ReportComposer({ missions }: { missions: Mission[] }) {
  const [missionId, setMissionId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [bodyHtml, setBodyHtml] = useState('');
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [drafts, setDrafts] = useState<ReportDraft[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const missionOptions = useMemo(
    () =>
      missions
        .map((mission) => ({ value: mission.id, label: mission.name, region: mission.region }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [missions],
  );

  const persistDrafts = useCallback(
    (updater: ReportDraft[] | ((prev: ReportDraft[]) => ReportDraft[])) => {
      setDrafts((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (typeof window !== 'undefined') {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        setDrafts(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to parse stored drafts', error);
    }
  }, []);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleBodyInput = () => {
    if (!editorRef.current) return;
    setBodyHtml(editorRef.current.innerHTML);
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID?.() ?? `${file.name}-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...next]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((attachment) => attachment.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((attachment) => attachment.id !== id);
    });
  };

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => URL.revokeObjectURL(attachment.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFormatting = (command: 'bold' | 'italic' | 'insertUnorderedList') => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    handleBodyInput();
  };

  const handleQueueDraft = () => {
    if (!title.trim() && !bodyHtml.trim() && attachments.length === 0) {
      setFeedback('Add notes or media before queuing a draft.');
      return;
    }

    const missionName = missionId
      ? missionOptions.find((option) => option.value === missionId)?.label ?? 'Unknown mission'
      : 'Unassigned mission';

    const draft: ReportDraft = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      missionId: missionId || null,
      missionName,
      title: title.trim() || 'Untitled report',
      severity,
      bodyHtml,
      attachments: attachments.map(({ name, size, type }) => ({ name, size, type })),
      createdAt: new Date().toISOString(),
    };

    persistDrafts((prev) => [draft, ...prev]);
    setTitle('');
    setBodyHtml('');
    editorRef.current && (editorRef.current.innerHTML = '');
    attachments.forEach((attachment) => URL.revokeObjectURL(attachment.url));
    setAttachments([]);
    setFeedback('Report saved to offline queue. Ready when connectivity returns.');
  };

  const deleteDraft = (id: string) => {
    persistDrafts((prev) => prev.filter((draft) => draft.id !== id));
  };

  const clearDrafts = () => {
    persistDrafts([]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Report composer</p>
          <p className="text-sm text-slate-600">
            Capture field intel, attach media, and queue drafts while offline.
          </p>
        </div>
        <Badge variant={isOnline ? 'green' : 'amber'}>
          {isOnline ? 'Online' : 'Offline mode'}
        </Badge>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-500" htmlFor="mission-select">
          Mission
        </label>
        <select
          id="mission-select"
          value={missionId}
          onChange={(event) => setMissionId(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-leaf-500 focus:outline-none"
        >
          <option value="">Unassigned mission</option>
          {missionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} · {option.region}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-500" htmlFor="report-title">
          Title
        </label>
        <input
          id="report-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="eg. Flooded access road near checkpoint"
          className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-leaf-500 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Severity</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {severityOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setSeverity(option.value)}
              className={clsx(
                'rounded-2xl border px-3 py-2 text-left text-sm shadow-sm transition hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400',
                option.tone,
                severity === option.value ? 'ring-2 ring-offset-2 ring-offset-white' : 'opacity-80',
              )}
            >
              <p className="font-semibold">{option.label}</p>
              <p className="text-xs text-slate-500">{option.helper}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
          <span>Field notes</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8" onClick={() => applyFormatting('bold')}>
              Bold
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => applyFormatting('italic')}
            >
              Italic
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => applyFormatting('insertUnorderedList')}
            >
              Bullets
            </Button>
          </div>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleBodyInput}
          className="min-h-[160px] rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-800 shadow-inner focus-within:border-leaf-500"
          placeholder="Share what you observed, measurements, context, etc."
          suppressContentEditableWarning
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
          <span>Photos & media</span>
          <span className="text-[10px] text-slate-400">Drop files or use the uploader</span>
        </div>
        <div
          className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-sm text-slate-500"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <p>Drag images here or</p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            multiple
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>
        {attachments.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {attachments.map((attachment) => (
              <figure
                key={attachment.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white/70"
              >
                {attachment.type.startsWith('image/') ? (
                  <img src={attachment.url} alt={attachment.name} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center text-xs text-slate-500">
                    {attachment.name}
                  </div>
                )}
                <figcaption className="px-3 py-2 text-xs text-slate-600">
                  {attachment.name} · {(attachment.size / 1024).toFixed(1)} KB
                </figcaption>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-white opacity-0 transition group-hover:opacity-100"
                >
                  ×
                </button>
              </figure>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" size="lg" className="flex-1" onClick={handleQueueDraft}>
          Save to offline queue
        </Button>
        <Button type="button" size="lg" variant="subtle" className="flex-1" disabled>
          Submit to API (coming soon)
        </Button>
      </div>
      {feedback ? <p className="text-sm text-leaf-600">{feedback}</p> : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Offline drafts ({drafts.length})
          </p>
          {drafts.length > 0 ? (
            <Button variant="outline" size="sm" onClick={clearDrafts}>
              Clear all
            </Button>
          ) : null}
        </div>
        {drafts.length === 0 ? (
          <p className="text-sm text-slate-500">No drafts yet. Anything you queue appears here.</p>
        ) : (
          <ol className="space-y-3">
            {drafts.map((draft) => (
              <li key={draft.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{draft.title}</p>
                    <p className="text-xs text-slate-500">
                      {draft.missionName} · {new Date(draft.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => deleteDraft(draft.id)}>
                    Remove
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>Severity: {draft.severity}</span>
                  <span>Attachments: {draft.attachments.length}</span>
                </div>
                {draft.bodyHtml ? (
                  <div
                    className="mt-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm text-slate-700"
                    dangerouslySetInnerHTML={{ __html: draft.bodyHtml }}
                  />
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
}
