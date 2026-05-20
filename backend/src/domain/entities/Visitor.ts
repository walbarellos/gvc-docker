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
  parentalAuthorization: boolean;
  authorizationDate?: Date | null;
  responsibleName?: string | null;
  responsibleId?: string | null;
  authorizationDocType?: string | null;
  authorizationPresented: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Visitor {
  constructor(private props: VisitorProps) {}

  get id() { return this.props.id; }
  get fullName() { return this.props.fullName; }
  get cpf() { return this.props.cpf; }
  get passport() { return this.props.passport; }
  get isForeigner() { return this.props.isForeigner; }
  get gender() { return this.props.gender; }
  get birthDate() { return this.props.birthDate; }
  get email() { return this.props.email; }
  get phone() { return this.props.phone; }
  get address() { return this.props.address; }
  get category() { return this.props.category; }
  get photoUrl() { return this.props.photoUrl; }
  get parentalAuthorization() { return this.props.parentalAuthorization; }
  get authorizationDate() { return this.props.authorizationDate; }
  get responsibleName() { return this.props.responsibleName; }
  get responsibleId() { return this.props.responsibleId; }
  get authorizationDocType() { return this.props.authorizationDocType; }
  get authorizationPresented() { return this.props.authorizationPresented; }

  get age(): number {
    if (!this.props.birthDate) return 0;
    const today = new Date();
    let age = today.getFullYear() - this.props.birthDate.getFullYear();
    const m = today.getMonth() - this.props.birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < this.props.birthDate.getDate())) {
      age--;
    }
    return age;
  }

  get isUnderage(): boolean {
    return this.age < 18;
  }

  get isUnder12(): boolean {
    return this.age < 12;
  }

  canRegister(): { allowed: boolean; reason: string | null } {
    if (this.isUnder12 && !this.props.parentalAuthorization) {
      return { allowed: false, reason: "Menores de 12 anos precisam de autorização parental OBRIGATÓRIA." };
    }
    
    if (this.isUnder12 && this.props.parentalAuthorization && !this.props.responsibleName) {
      return { allowed: false, reason: "Informe o nome do responsável pela autorização." };
    }

    return { allowed: true, reason: null };
  }

  canCheckIn(): { allowed: boolean; reason: string | null } {
    if (this.isUnder12 && !this.props.parentalAuthorization) {
      return { allowed: false, reason: "Este menor não possui autorização parental registrada. Procure a administração." };
    }
    return { allowed: true, reason: null };
  }

  authorizeParental(responsibleName: string, docType: string): Visitor {
    return new Visitor({
      ...this.props,
      parentalAuthorization: true,
      authorizationDate: new Date(),
      responsibleName,
      authorizationDocType: docType,
      authorizationPresented: true,
      updatedAt: new Date()
    });
  }

  toJSON() {
    return {
      ...this.props,
      age: this.age,
      isUnderage: this.isUnderage,
      isUnder12: this.isUnder12
    };
  }
}
