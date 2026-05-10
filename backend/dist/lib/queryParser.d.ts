export interface QueryParams {
    [key: string]: any;
}
export interface ParsedWhere {
    where: QueryParams;
    orderBy?: QueryParams;
    take?: number;
    skip?: number;
}
export declare function parseQueryParams(params: QueryParams): ParsedWhere;
export declare function buildPrismaWhere(params: QueryParams): QueryParams;
//# sourceMappingURL=queryParser.d.ts.map