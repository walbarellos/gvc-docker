export enum Gender {
  MASCULINO = 'masculino',
  FEMININO = 'feminino',
  OUTRO = 'outro',
  PREFIRO_NAO_DIZER = 'prefiro_nao_dizer'
}

export interface VisitorProps {
  id: string;
  fullName: string;
  cpf?: string | null;
  passport?: string | null;
  isForeigner: boolean;
  gender?: Gender | null;
  birthDate?: Date | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  category?: string | null;
  photoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Visitor {
  constructor(private props: VisitorProps) {}

  get id() { return this.props.id; }
  get fullName() { return this.props.fullName; }
  get cpf() { return this.props.cpf; }
  get gender() { return this.props.gender; }
  get birthDate() { return this.props.birthDate; }

  // Exemplo de regra de negócio no domínio
  get isUnderage(): boolean {
    if (!this.props.birthDate) return false;
    const today = new Date();
    const age = today.getFullYear() - this.props.birthDate.getFullYear();
    return age < 18;
  }

  toJSON() {
    return {
      ...this.props,
      isUnderage: this.isUnderage
    };
  }
}
