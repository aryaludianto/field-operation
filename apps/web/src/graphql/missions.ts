import { gql } from '@apollo/client';

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
