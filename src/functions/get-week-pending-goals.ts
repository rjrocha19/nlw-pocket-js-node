import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { db } from "../db";
import { goals, goalsCompletions } from "../db/schema";
import { and, count, gte, lte } from "drizzle-orm";

dayjs.extend(weekOfYear);

export async function getWeekPendingGoals() {
  const fristDayOfWeek = dayjs().startOf('week').toDate();
  const lastDayOfWeek = dayjs().endOf('week').toDate();

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  const goalCompletionCounts = db.$with('goal_completion_count').as(
    db
      .select({
        goalId: goalsCompletions.goalId,
        completionCount: count(goalsCompletions.id),
      })
      .from(goalsCompletions)
      .where(and(
        gte(goalsCompletions.createdAt, fristDayOfWeek),
        lte(goals.createdAt, lastDayOfWeek)
      ))
      .groupBy(goalsCompletions.goalId)
  )

  const sql = await db
    .with(goalCompletionCounts, goalsCreatedUpToWeek)
    .select()
    .from(goalsCreatedUpToWeek)
    .toSQL();

  return sql
}