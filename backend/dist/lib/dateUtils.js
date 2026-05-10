export function parseDate(value) {
    if (!value)
        return null;
    if (value instanceof Date)
        return value;
    if (typeof value !== 'string')
        return null;
    const trimmed = value.trim();
    if (!trimmed)
        return null;
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        if (year < 1900 || year > 2100)
            return null;
        return d;
    }
    const parts = trimmed.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (year < 1900 || year > 2100)
            return null;
        const d2 = new Date(year, month, day);
        if (!isNaN(d2.getTime()))
            return d2;
    }
    return null;
}
export function parseISODate(value) {
    if (!value)
        return null;
    if (value instanceof Date)
        return value;
    if (typeof value === 'string') {
        const d = new Date(value);
        if (!isNaN(d.getTime()))
            return d;
    }
    return null;
}
export function formatDateToISO(date) {
    return date.toISOString();
}
export function getDateRange(dateString) {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}
//# sourceMappingURL=dateUtils.js.map