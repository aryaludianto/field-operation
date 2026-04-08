import { gql } from '@apollo/client';

export const CREATE_REPORT_MUTATION = gql`
  mutation CreateFieldReport($input: CreateReportInput!) {
    createFieldReport(input: $input) {
      id
      missionId
      authorName
      authorRole
      summary
      details
      severity
      submittedAt
      status
    }
  }
`;

export type CreateReportInput = {
  missionId: string;
  authorName: string;
  summary?: string;
  details: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type CreatedReport = {
  id: string;
  missionId: string;
  authorName: string;
  authorRole: string;
  summary?: string | null;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  submittedAt: string;
  status?: string | null;
};

export type CreateReportResult = {
  createFieldReport: CreatedReport;
};

export const MISSIONS_QUERY = gql`
  query Missions($filter: MissionFilterInput) {
    missions(filter: $filter) {
      id
      code
      name
      region
      status
      lat
      lng
      scheduledStart
      scheduledEnd
      organizationId
      reports {
        id
        authorName
        summary
        severity
        status
        submittedAt
      }
    }
  }
`;

export type MissionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export type Mission = {
  id: string;
  code: string;
  name: string;
  region: string;
  status: MissionStatus;
  lat: number;
  lng: number;
  scheduledStart: string;
  scheduledEnd: string;
  organizationId?: string | null;
  reports: {
    id: string;
    authorName: string;
    summary?: string | null;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    status?: string | null;
    submittedAt: string;
  }[];
};
