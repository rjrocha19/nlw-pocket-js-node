import { count, and, gte, lte, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { goals, goalsCompletions } from "../db/schema";
import dayjs from "dayjs";

interface CreateGoalCompletion {
  goalId: string;
}

export async function createGoalCompletion({ goalId }: CreateGoalCompletion) {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalCompletionCounts = db.$with("goal_completion_counts").as(
    db
      .select({
        goalId: goalsCompletions.goalId,
        completionCount: count(goalsCompletions.id).as("completionCount"),
      })
      .from(goalsCompletions)
      .where(
        and(
          gte(goalsCompletions.createdAt, firstDayOfWeek),
          lte(goalsCompletions.createdAt, lastDayOfWeek),
          eq(goalsCompletions.goalId, goalId)
        )
      )
      .groupBy(goalsCompletions.goalId)
  );

  const result = await db
    .with(goalCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql/*sql*/ `
      COALESCE(${goalCompletionCounts.completionCount}, 0 )
      `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1);

  const { desiredWeeklyFrequency, completionCount } = result[0];

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error("Goal already completed");
  }

  const insertResult = await db
    .insert(goalsCompletions)
    .values({ goalId })
    .returning();

  const goalsCompletion = insertResult[0];

  return {
    goalsCompletion,
  };
}
