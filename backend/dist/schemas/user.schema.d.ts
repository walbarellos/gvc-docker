import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodString;
    senha: z.ZodString;
    perfil: z.ZodDefault<z.ZodEnum<["administrador", "coordenador", "funcionario", "monitor"]>>;
    espacoId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ativo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    nome: string;
    senha: string;
    perfil: "administrador" | "coordenador" | "monitor" | "funcionario";
    ativo: boolean;
    espacoId?: string | null | undefined;
}, {
    email: string;
    nome: string;
    senha: string;
    perfil?: "administrador" | "coordenador" | "monitor" | "funcionario" | undefined;
    espacoId?: string | null | undefined;
    ativo?: boolean | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    senha: z.ZodOptional<z.ZodString>;
    perfil: z.ZodOptional<z.ZodEnum<["administrador", "coordenador", "funcionario", "monitor"]>>;
    espacoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    nome?: string | undefined;
    senha?: string | undefined;
    perfil?: "administrador" | "coordenador" | "monitor" | "funcionario" | undefined;
    espacoId?: string | null | undefined;
    ativo?: boolean | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    senha?: string | undefined;
    perfil?: "administrador" | "coordenador" | "monitor" | "funcionario" | undefined;
    espacoId?: string | null | undefined;
    ativo?: boolean | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    senha: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    senha: string;
}, {
    email: string;
    senha: string;
}>;
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
//# sourceMappingURL=user.schema.d.ts.map