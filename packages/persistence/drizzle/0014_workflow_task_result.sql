CREATE TYPE "workflow_task_result" AS ENUM ('approved', 'rejected');

ALTER TABLE "workflow_tasks"
ADD COLUMN "result" "workflow_task_result";
