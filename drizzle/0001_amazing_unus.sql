ALTER TABLE "timeslot" DROP CONSTRAINT "timeslot_field_id_field_id_fk";
--> statement-breakpoint
DROP INDEX "timeslot_field_idx";--> statement-breakpoint
ALTER TABLE "timeslot" DROP COLUMN "field_id";