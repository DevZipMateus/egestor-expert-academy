-- Adicionar foreign key para profiles (via user_id)
ALTER TABLE public.certificates 
ADD CONSTRAINT fk_certificates_user 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Adicionar foreign key para exam_attempts (via exam_attempt_id)
ALTER TABLE public.certificates 
ADD CONSTRAINT fk_certificates_exam_attempt 
FOREIGN KEY (exam_attempt_id) REFERENCES public.exam_attempts(id) ON DELETE CASCADE;

-- Adicionar foreign key para courses (via course_id)
ALTER TABLE public.certificates 
ADD CONSTRAINT fk_certificates_course 
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;