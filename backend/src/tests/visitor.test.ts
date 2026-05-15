import { Visitor, Gender } from '../src/domain/entities/Visitor.js';

describe('Visitor Age Authorization Rules', () => {
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

  const twentyYearsAgo = new Date();
  twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);

  it('should block registration for under-12 without parental auth', () => {
    const visitor = new Visitor({
      id: '1',
      fullName: 'Joãozinho Silva',
      birthDate: tenYearsAgo,
      isForeigner: false,
      parentalAuthorization: false,
      authorizationPresented: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = visitor.canRegister();
    expect(validation.allowed).toBe(false);
    expect(validation.reason).toBe("Menores de 12 anos precisam de autorização parental OBRIGATÓRIA.");
  });

  it('should allow registration for under-12 with parental auth and responsible name', () => {
    const visitor = new Visitor({
      id: '1',
      fullName: 'Joãozinho Silva',
      birthDate: tenYearsAgo,
      isForeigner: false,
      parentalAuthorization: true,
      responsibleName: 'Maria Silva',
      authorizationPresented: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = visitor.canRegister();
    expect(validation.allowed).toBe(true);
  });

  it('should block check-in for under-12 without parental auth', () => {
    const visitor = new Visitor({
      id: '1',
      fullName: 'Joãozinho Silva',
      birthDate: tenYearsAgo,
      isForeigner: false,
      parentalAuthorization: false,
      authorizationPresented: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = visitor.canCheckIn();
    expect(validation.allowed).toBe(false);
    expect(validation.reason).toContain("não possui autorização parental registrada");
  });

  it('should allow check-in for over-18 without parental auth', () => {
    const visitor = new Visitor({
      id: '1',
      fullName: 'Adulto Silva',
      birthDate: twentyYearsAgo,
      isForeigner: false,
      parentalAuthorization: false,
      authorizationPresented: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = visitor.canCheckIn();
    expect(validation.allowed).toBe(true);
  });
});
