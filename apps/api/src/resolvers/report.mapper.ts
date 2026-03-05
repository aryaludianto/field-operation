import type { InferSelectModel } from 'drizzle-orm';
import { fieldReports } from '../db/schema.js';
import { FieldReport, UserRole } from './report.types.js';

export type ReportRow = InferSelectModel<typeof fieldReports>;

export function mapReportRow(row: ReportRow): FieldReport {
  return {
    id: row.id,
    missionId: row.missionId,
    authorId: row.authorId ?? null,
    authorName: row.authorName,
    authorRole: (row.authorRole ?? UserRole.FIELD_CREW) as UserRole,
    summary: row.summary ?? null,
    details: row.details,
    severity: row.severity ?? 'LOW',
    submittedAt: row.submittedAt ?? new Date(),
    status: row.status ?? null,
  };
}
