export const visitStatusMap = {
    'Ativo': 'ativo',
    'ativo': 'ativo',
    'Concluido': 'finalizado',
    'concluido': 'finalizado',
    'Finalizado': 'finalizado',
    'finalizado': 'finalizado',
    'Cancelado': 'cancelado',
    'cancelado': 'cancelado',
    'Inativo': 'cancelado',
    'inativo': 'cancelado',
};
export const agendamentoStatusMap = {
    'Pendente': 'pendente',
    'pendente': 'pendente',
    'Aprovado': 'aprovado',
    'aprovado': 'aprovado',
    'Rejeitado': 'rejeitado',
    'rejeitado': 'rejeitado',
    'Cancelado': 'cancelado',
    'cancelado': 'cancelado',
};
export const computadorStatusMap = {
    'Livre': 'Livre',
    'livre': 'Livre',
    'EmUso': 'EmUso',
    'emuso': 'EmUso',
    'Em Uso': 'EmUso',
    'Manutencao': 'Manutencao',
    'manutencao': 'Manutencao',
    'Manutenção': 'Manutencao',
    'Indisponivel': 'Indisponivel',
    'indisponivel': 'Indisponivel',
    'Indisponível': 'Indisponivel',
};
export const lockerStatusMap = {
    'Livre': 'Livre',
    'livre': 'Livre',
    'Ocupado': 'Ocupado',
    'ocupado': 'Ocupado',
    'Manutencao': 'Manutencao',
    'manutencao': 'Manutencao',
    'Manutenção': 'Manutencao',
};
export function mapVisitStatus(status) {
    if (Array.isArray(status)) {
        return status.map(s => visitStatusMap[s.trim()] || s.trim());
    }
    return visitStatusMap[status] || status;
}
export function mapAgendamentoStatus(status) {
    if (Array.isArray(status)) {
        return status.map(s => agendamentoStatusMap[s.trim()] || s.trim());
    }
    return agendamentoStatusMap[status] || status;
}
export function mapComputadorStatus(status) {
    return computadorStatusMap[status] || status;
}
export function mapLockerStatus(status) {
    return lockerStatusMap[status] || status;
}
export function parseMultipleStatuses(status, mapper) {
    if (!status)
        return undefined;
    if (status.includes(',')) {
        return {
            in: status.split(',').map((s) => mapper[s.trim()] || s.trim()),
        };
    }
    return mapper[status] || status;
}
//# sourceMappingURL=enumMapper.js.map