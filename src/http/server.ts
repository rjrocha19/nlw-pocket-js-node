import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createGoalRoute } from "./routes/create-goals";
import { createCompletionRoute } from "./routes/create-completions";
import { getWeekSummaryRoute } from "./routes/get-week-summaru";
import { getWeekPendingGoalsRoute } from "./routes/get-pending-goals";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);



app.register(createGoalRoute)
app.register(createCompletionRoute)
app.register(getWeekPendingGoalsRoute)
app.register(getWeekSummaryRoute)



app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running!🚀");
  });
