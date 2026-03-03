import 'dotenv/config';
import { db, pool } from '../apps/api/src/db/client';
import { organizations, missions, users, fieldReports } from '../apps/api/src/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const existingOrg = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, 'gaia-ecologie'))
    .limit(1);

  const orgId = existingOrg[0]?.id ||
    (await db
      .insert(organizations)
      .values({ name: 'Gaia Ecologie', slug: 'gaia-ecologie' })
      .returning({ id: organizations.id }))[0].id;

  const missionResult = await db
    .insert(missions)
    .values([
      {
        organizationId: orgId,
        code: 'AMS-WETLAND-01',
        name: 'Wetland Sampling – Markermeer',
        region: 'Noord-Holland',
        status: 'IN_PROGRESS',
        lat: 52.5667,
        lng: 5.1333,
        scheduledStart: new Date(Date.now() - 3600_000),
        scheduledEnd: new Date(Date.now() + 4 * 3600_000),
      },
      {
        organizationId: orgId,
        code: 'AMS-FOREST-07',
        name: 'Veluwe Canopy Survey',
        region: 'Gelderland',
        status: 'PLANNED',
        lat: 52.2,
        lng: 5.8,
        scheduledStart: new Date(Date.now() + 24 * 3600_000),
        scheduledEnd: new Date(Date.now() + 26 * 3600_000),
      },
    ])
    .onConflictDoNothing()
    .returning({ id: missions.id, code: missions.code });

  const coordinator = await db
    .insert(users)
    .values({
      organizationId: orgId,
      email: 'daphne@gaia.eco',
      displayName: 'Daphne Koeman',
      role: 'COORDINATOR',
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  if (missionResult.length > 0) {
    await db
      .insert(fieldReports)
      .values({
        missionId: missionResult[0].id,
        authorId: coordinator[0]?.id,
        authorName: 'Daphne Koeman',
        authorRole: 'COORDINATOR',
        severity: 'MEDIUM',
        details:
          'Field crew reporting algal bloom near buoy M-12. Requesting drone imagery to confirm extent.',
        summary: 'Algal bloom detected near buoy M-12',
      })
      .onConflictDoNothing();
  }

  console.log('Seed data inserted.');
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
