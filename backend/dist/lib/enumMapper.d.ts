export type VisitStatusEnum = 'ativo' | 'finalizado' | 'cancelado';
export type AgendamentoStatusEnum = 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';
export type ComputadorStatusEnum = 'Livre' | 'EmUso' | 'Manutencao' | 'Indisponivel';
export type LockerStatusEnum = 'Livre' | 'Ocupado' | 'Manutencao';
export declare const visitStatusMap: Record<string, VisitStatusEnum>;
export declare const agendamentoStatusMap: Record<string, AgendamentoStatusEnum>;
export declare const computadorStatusMap: Record<string, any>;
export declare const lockerStatusMap: Record<string, any>;
export declare function mapVisitStatus(status: string | string[]): VisitStatusEnum | VisitStatusEnum[] | string;
export declare function mapAgendamentoStatus(status: string | string[]): AgendamentoStatusEnum | AgendamentoStatusEnum[] | string;
export declare function mapComputadorStatus(status: string): any;
export declare function mapLockerStatus(status: string): any;
export declare function parseMultipleStatuses(status: string, mapper: Record<string, any>): any;
//# sourceMappingURL=enumMapper.d.ts.map