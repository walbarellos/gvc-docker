CREATE TYPE public."AgendamentoStatus" AS ENUM ('pendente', 'confirmado', 'cancelado', 'concluido');
CREATE TYPE public."ComputadorStatus" AS ENUM ('Livre', 'EmUso', 'Manutencao');
CREATE TYPE public."Gender" AS ENUM ('masculino', 'feminino', 'outro', 'nao_informar');
CREATE TYPE public."PerfilUsuario" AS ENUM ('cidadao', 'monitor', 'funcionario', 'coordenador', 'administrador');
CREATE TYPE public."LockerStatus" AS ENUM ('available', 'occupied', 'maintenance');