-- Add time limit configuration to course_exams table
ALTER TABLE course_exams 
ADD COLUMN time_limit_minutes integer DEFAULT NULL;

COMMENT ON COLUMN course_exams.time_limit_minutes IS 'Time limit for the exam in minutes. NULL means no time limit.';

-- Add check constraint to ensure positive time limits
ALTER TABLE course_exams
ADD CONSTRAINT time_limit_positive CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0);