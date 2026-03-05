import { Arg, Field, ID, InputType, Mutation, Resolver } from "type-graphql";
import { db } from "../db/client.js";
import { fieldReports } from "../db/schema.js";
import { eq, type InferInsertModel } from "drizzle-orm";
import { FieldReport, ReportSeverity, UserRole } from "./report.types.js";
import { mapReportRow } from "./report.mapper.js";

type FieldReportInsert = InferInsertModel<typeof fieldReports>;

@InputType()
class CreateReportInput {
  @Field(() => ID)
  missionId!: string;

  @Field(() => ID, { nullable: true })
  authorId?: string;

  @Field(() => String)
  authorName!: string;

  @Field(() => UserRole, { nullable: true })
  authorRole?: UserRole;

  @Field(() => String, { nullable: true })
  summary?: string;

  @Field(() => String)
  details!: string;

  @Field(() => ReportSeverity, { nullable: true })
  severity?: ReportSeverity;

  @Field(() => String, { nullable: true })
  status?: string;
}

@InputType()
class UpdateReportInput {
  @Field(() => String, { nullable: true })
  authorName?: string;

  @Field(() => UserRole, { nullable: true })
  authorRole?: UserRole;

  @Field(() => String, { nullable: true })
  summary?: string;

  @Field(() => String, { nullable: true })
  details?: string;

  @Field(() => ReportSeverity, { nullable: true })
  severity?: ReportSeverity;

  @Field(() => String, { nullable: true })
  status?: string;
}

@Resolver(() => FieldReport)
export class FieldReportResolver {
  @Mutation(() => FieldReport)
  async createFieldReport(
    @Arg("input", () => CreateReportInput) input: CreateReportInput,
  ): Promise<FieldReport> {
    const [created] = await db
      .insert(fieldReports)
      .values({
        missionId: input.missionId,
        authorId: input.authorId,
        authorName: input.authorName,
        authorRole: input.authorRole ?? UserRole.FIELD_CREW,
        summary: input.summary,
        details: input.details,
        severity: input.severity ?? ReportSeverity.LOW,
        status: input.status ?? "PENDING",
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create field report");
    }

    return mapReportRow(created);
  }

  @Mutation(() => FieldReport)
  async updateFieldReport(
    @Arg("id", () => ID) id: string,
    @Arg("input", () => UpdateReportInput) input: UpdateReportInput,
  ): Promise<FieldReport> {
    const payload: Partial<FieldReportInsert> = {};

    if (typeof input.authorName === "string")
      payload.authorName = input.authorName;
    if (input.authorRole) payload.authorRole = input.authorRole;
    if (typeof input.summary !== "undefined") payload.summary = input.summary;
    if (typeof input.details === "string") payload.details = input.details;
    if (input.severity) payload.severity = input.severity;
    if (typeof input.status === "string") payload.status = input.status;

    if (Object.keys(payload).length === 0) {
      throw new Error("No fields provided to update");
    }

    const [updated] = await db
      .update(fieldReports)
      .set(payload)
      .where(eq(fieldReports.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Report ${id} not found`);
    }

    return mapReportRow(updated);
  }

  @Mutation(() => Boolean)
  async deleteFieldReport(@Arg("id", () => ID) id: string): Promise<boolean> {
    const deleted = await db
      .delete(fieldReports)
      .where(eq(fieldReports.id, id))
      .returning();
    return deleted.length > 0;
  }
}
