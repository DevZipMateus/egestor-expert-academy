-- Add randomization options to course_exams table
ALTER TABLE course_exams 
ADD COLUMN randomize_questions boolean DEFAULT false,
ADD COLUMN randomize_options boolean DEFAULT false;

COMMENT ON COLUMN course_exams.randomize_questions IS 'When true, shuffles the order of exam questions for each attempt';
COMMENT ON COLUMN course_exams.randomize_options IS 'When true, shuffles the order of answer options within each question';