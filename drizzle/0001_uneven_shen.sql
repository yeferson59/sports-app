ALTER TABLE "price" ALTER COLUMN "timeslot_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "timeslot" ALTER COLUMN "field_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "timeslot" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "timeslot" ALTER COLUMN "day_of_week" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "booking_instructor_time_idx" ON "booking" USING btree ("instructor_id","start_time","end_time");--> statement-breakpoint
CREATE OR REPLACE FUNCTION check_instructor_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.instructor_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM booking
      WHERE instructor_id = NEW.instructor_id
        AND id != NEW.id
        AND (
          (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)
        )
    ) THEN
      RAISE EXCEPTION 'Instructor % is already booked during this time period', NEW.instructor_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
DROP TRIGGER IF EXISTS trigger_check_instructor_overlap ON booking;--> statement-breakpoint
CREATE TRIGGER trigger_check_instructor_overlap
BEFORE INSERT OR UPDATE ON booking
FOR EACH ROW
EXECUTE FUNCTION check_instructor_overlap();