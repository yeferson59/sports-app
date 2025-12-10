ALTER TABLE "price" ALTER COLUMN "currency" SET DEFAULT 'COP';--> statement-breakpoint
ALTER TABLE "timeslot" ALTER COLUMN "field_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "timeslot" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "number_phone" char(10);