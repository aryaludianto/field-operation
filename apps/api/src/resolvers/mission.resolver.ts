import { Arg, Field, FieldResolver, Float, GraphQLISODateTime, ID, InputType, ObjectType, Query, Resolver, Root, registerEnumType } from 'type-graphql';
import { SQL, and, desc, eq, ilike, or } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { db } from '../db/client';
import { fieldReports, missions } from '../db/schema';

type MissionRow = InferSelectModel<typeof missions>;
type ReportRow = InferSelectModel<typeof fieldReports>;

enum MissionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

registerEnumType(MissionStatus, {
  name: 'MissionStatus',
});

enum ReportSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

registerEnumType(ReportSeverity, {
  name: 'ReportSeverity',
});

enum UserRole {
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
  FIELD_CREW = 'FIELD_CREW',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
class FieldReport {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  missionId!: string;

  @Field(() => String, { nullable: true })
  authorId?: string | null;

  @Field(() => String)
  authorName!: string;

  @Field(() => UserRole)
  authorRole!: UserRole;

  @Field({ nullable: true })
  summary?: string | null;

  @Field()
  details!: string;

  @Field(() => ReportSeverity)
  severity!: ReportSeverity;

  @Field(() => GraphQLISODateTime)
  submittedAt!: Date;

  @Field({ nullable: true })
  status?: string | null;
}

@ObjectType()
class Mission {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  code!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  region!: string;

  @Field(() => MissionStatus)
  status!: MissionStatus;

  @Field(() => Float)
  lat!: number;

  @Field(() => Float)
  lng!: number;

  @Field(() => GraphQLISODateTime)
  scheduledStart!: Date;

  @Field(() => GraphQLISODateTime)
  scheduledEnd!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt?: Date | null;

  @Field(() => ID, { nullable: true })
  organizationId?: string | null;

  @Field(() => [FieldReport])
  reports!: FieldReport[];
}

@InputType()
class MissionFilterInput {
  @Field(() => MissionStatus, { nullable: true })
  status?: MissionStatus;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  search?: string;
}

@Resolver(() => Mission)
export class MissionResolver {
  @Query(() => [Mission])
  async missions(
    @Arg('filter', () => MissionFilterInput, { nullable: true }) filter?: MissionFilterInput,
  ): Promise<MissionRow[]> {
    const whereClause = this.buildWhere(filter);

    const rows = await db
      .select()
      .from(missions)
      .where(whereClause)
      .orderBy(desc(missions.scheduledStart));

    return rows;
  }

  @Query(() => Mission, { nullable: true })
  async mission(@Arg('id', () => ID) id: string): Promise<MissionRow | null> {
    const result = await db
      .select()
      .from(missions)
      .where(eq(missions.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  @FieldResolver(() => [FieldReport])
  async reports(@Root() mission: MissionRow): Promise<ReportRow[]> {
    return db
      .select()
      .from(fieldReports)
      .where(eq(fieldReports.missionId, mission.id))
      .orderBy(desc(fieldReports.submittedAt));
  }

  private buildWhere(filter?: MissionFilterInput): SQL | undefined {
    if (!filter) {
      return undefined;
    }

    const clauses: SQL[] = [];

    if (filter.status) {
      clauses.push(eq(missions.status, filter.status));
    }

    if (filter.region) {
      clauses.push(ilike(missions.region, `%${filter.region}%`));
    }

    if (filter.search) {
      const pattern = `%${filter.search}%`;
      clauses.push(
        or(
          ilike(missions.name, pattern),
          ilike(missions.code, pattern),
          ilike(missions.region, pattern),
        ),
      );
    }

    if (clauses.length === 0) {
      return undefined;
    }

    if (clauses.length === 1) {
      return clauses[0];
    }

    return and(...clauses);
  }
}
