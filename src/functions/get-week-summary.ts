import { lte } from "drizzle-orm";
import { db } from "../db";
import { goals } from "../db/schema";
import dayjs from "dayjs";

export async function getWeekSummary() {
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalsCreatedUpToWeek = db.$with("goals_created_up_to_week").as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  );

  return (
    summary: 'test',
  )
};