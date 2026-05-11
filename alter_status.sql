ALTER TABLE visits ALTER COLUMN status DROP DEFAULT;
ALTER TABLE visits ALTER COLUMN status TYPE public."VisitStatus" USING status::text::public."VisitStatus";
ALTER TABLE visits ALTER COLUMN status SET DEFAULT 'ativo';