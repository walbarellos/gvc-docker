-- Add responsible_accompanied column to visits
ALTER TABLE visits ADD COLUMN IF NOT EXISTS responsible_accompanied Boolean DEFAULT false;

-- Create enum type if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'perfilusuario') THEN
        CREATE TYPE "PerfilUsuario" AS ENUM ('administrador', 'coordenador', 'operador', 'monitor', 'funcionario', 'cidadao');
    END IF;
END
$$;

-- Add temporary column with enum type
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perfil_new "PerfilUsuario";

-- Copy data from old column to new column
UPDATE usuarios SET perfil_new = perfil::"PerfilUsuario";

-- Drop old column and rename new one
ALTER TABLE usuarios DROP COLUMN perfil;
ALTER TABLE usuarios RENAME COLUMN perfil_new TO perfil;

-- Add not null constraint (with a default for any edge cases)
ALTER TABLE usuarios ALTER COLUMN perfil SET DEFAULT 'funcionario';
ALTER TABLE usuarios ALTER COLUMN perfil SET NOT NULL;