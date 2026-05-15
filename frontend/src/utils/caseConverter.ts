/**
 * Converte um objeto de snake_case para camelCase
 * Exemplo: { visitor_id: "123", checkin_time: "2026-05-15" }
 *   → { visitorId: "123", checkinTime: "2026-05-15" }
 */
export function snakeToCamel<T = any>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel) as T;
  
  return Object.keys(obj).reduce((acc: any, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel((obj as any)[key]);
    return acc;
  }, {});
}

/**
 * Converte um objeto de camelCase para snake_case (para compatibilidade)
 */
export function camelToSnake<T = any>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake) as T;
  
  return Object.keys(obj).reduce((acc: any, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake((obj as any)[key]);
    return acc;
  }, {});
}