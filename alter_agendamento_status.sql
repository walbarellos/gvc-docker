ALTER TABLE agendamentos ALTER COLUMN status DROP DEFAULT;
ALTER TABLE agendamentos ALTER COLUMN status TYPE public."AgendamentoStatus" USING status::text::public."AgendamentoStatus";
ALTER TABLE agendamentos ALTER COLUMN status SET DEFAULT 'pendente';