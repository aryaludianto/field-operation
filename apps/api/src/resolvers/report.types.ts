import { Field, GraphQLISODateTime, ID, ObjectType, registerEnumType } from 'type-graphql';

export enum ReportSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

registerEnumType(ReportSeverity, {
  name: 'ReportSeverity',
});

export enum UserRole {
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
  FIELD_CREW = 'FIELD_CREW',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
export class FieldReport {
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

  @Field(() => String, { nullable: true })
  summary?: string | null;

  @Field(() => String)
  details!: string;

  @Field(() => ReportSeverity)
  severity!: ReportSeverity;

  @Field(() => GraphQLISODateTime)
  submittedAt!: Date;

  @Field(() => String, { nullable: true })
  status?: string | null;
}
