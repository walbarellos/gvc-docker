export interface FieldMappingConfig {
    [key: string]: {
        target: string;
        type?: 'string' | 'number' | 'boolean' | 'date' | 'dateArray';
        required?: boolean;
        transform?: (value: any) => any;
    };
}
export declare function mapFields(data: any, config?: FieldMappingConfig): any;
export declare function mapVisitorFields(data: any): any;
export declare function mapAgendamentoFields(data: any): any;
export declare function mapVisitFields(data: any): any;
export declare function mapSpaceFields(data: any): any;
//# sourceMappingURL=fieldMapper.d.ts.map