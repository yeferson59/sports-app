CREATE TYPE "public"."role_enum" AS ENUM('client', 'admin', 'instructor');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('futbol-6', 'padel');--> statement-breakpoint
CREATE TYPE "public"."weekday_enum" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "role_enum" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"with_instructor" boolean DEFAULT false NOT NULL,
	"instructor_id" text,
	"timeslot_id" uuid,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"price_id" uuid,
	"price_snapshot" numeric,
	"currency_snapshot" text,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "field_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"timeslot_id" uuid,
	"price_amount" numeric NOT NULL,
	"currency" text DEFAULT 'ARS' NOT NULL,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeslot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid,
	"user_id" text,
	"day_of_week" "weekday_enum",
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_field_id_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."field"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_timeslot_id_timeslot_id_fk" FOREIGN KEY ("timeslot_id") REFERENCES "public"."timeslot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_price_id_price_id_fk" FOREIGN KEY ("price_id") REFERENCES "public"."price"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price" ADD CONSTRAINT "price_field_id_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."field"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price" ADD CONSTRAINT "price_timeslot_id_timeslot_id_fk" FOREIGN KEY ("timeslot_id") REFERENCES "public"."timeslot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeslot" ADD CONSTRAINT "timeslot_field_id_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."field"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeslot" ADD CONSTRAINT "timeslot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "booking_field_idx" ON "booking" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "booking_user_idx" ON "booking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booking_timeslot_idx" ON "booking" USING btree ("timeslot_id");--> statement-breakpoint
CREATE INDEX "price_field_idx" ON "price" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "price_timeslot_idx" ON "price" USING btree ("timeslot_id");--> statement-breakpoint
CREATE INDEX "timeslot_field_idx" ON "timeslot" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "timeslot_user_idx" ON "timeslot" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "timeslot_day_idx" ON "timeslot" USING btree ("day_of_week");