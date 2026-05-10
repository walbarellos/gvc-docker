import { z } from 'zod';
export declare const createVisitSchema: z.ZodObject<{
    visitorId: z.ZodOptional<z.ZodString>;
    espacoId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    nome: z.ZodOptional<z.ZodString>;
    perfil: z.ZodDefault<z.ZodEnum<["general", "estudante", "professor", "turista", "pesquisador", "cultural"]>>;
    local: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodEnum<["ativo", "finalizado", "cancelado"]>>;
    armario: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    perfil: "general" | "estudante" | "professor" | "turista" | "pesquisador" | "cultural";
    status: "ativo" | "finalizado" | "cancelado";
    nome?: string | undefined;
    espacoId?: string | null | undefined;
    local?: string | null | undefined;
    armario?: string | null | undefined;
    visitorId?: string | undefined;
}, {
    nome?: string | undefined;
    perfil?: "general" | "estudante" | "professor" | "turista" | "pesquisador" | "cultural" | undefined;
    espacoId?: string | null | undefined;
    status?: "ativo" | "finalizado" | "cancelado" | undefined;
    local?: string | null | undefined;
    armario?: string | null | undefined;
    visitorId?: string | undefined;
}>;
export declare const checkinSchema: z.ZodObject<{
    visitorId: z.ZodString;
    espacoId: z.ZodNullable<z.ZodString>;
    perfil: z.ZodDefault<z.ZodEnum<["general", "estudante", "professor", "turista", "pesquisador", "cultural"]>>;
    nome: z.ZodOptional<z.ZodString>;
    local: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    perfil: "general" | "estudante" | "professor" | "turista" | "pesquisador" | "cultural";
    espacoId: string | null;
    visitorId: string;
    nome?: string | undefined;
    local?: string | undefined;
}, {
    espacoId: string | null;
    visitorId: string;
    nome?: string | undefined;
    perfil?: "general" | "estudante" | "professor" | "turista" | "pesquisador" | "cultural" | undefined;
    local?: string | undefined;
}>;
export declare const checkoutSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type CreateVisitDTO = z.infer<typeof createVisitSchema>;
export type CheckinDTO = z.infer<typeof checkinSchema>;
export type CheckoutDTO = z.infer<typeof checkoutSchema>;
//# sourceMappingURL=visit.schema.d.ts.map