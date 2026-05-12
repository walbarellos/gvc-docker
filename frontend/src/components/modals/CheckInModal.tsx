import React, { useState, useEffect } from 'react';
import { X, User, Globe, Heart, Mail, Phone, Camera, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { visitorService } from '../../services/visitorService';
import { VisitorCategory, OperationType, Gender, Visitor } from '../../types';
import { validateCPF, formatCPF, formatPhone } from '../../lib/validators';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitorToEdit?: Visitor | null;
  onSuccess?: () => void;
}

export default function CheckInModal({ isOpen, onClose, visitorToEdit, onSuccess }: CheckInModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    passport: '',
    isForeigner: false,
    gender: Gender.MALE,
    birthDate: '',
    email: '',
    phone: '',
    address: '',
    category: VisitorCategory.GENERAL
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (visitorToEdit) {
      setFormData({
        fullName: visitorToEdit.fullName,
        cpf: visitorToEdit.cpf || '',
        passport: visitorToEdit.passport || '',
        isForeigner: visitorToEdit.isForeigner || false,
        gender: visitorToEdit.gender || Gender.MALE,
        birthDate: (() => {
          const bd = (visitorToEdit as any).birthDate;
          if (!bd) return '';
          let dateStr = '';
          if (typeof bd === 'string') dateStr = bd.split('T')[0];
          else if (bd instanceof Date) {
            const y = bd.getFullYear();
            const m = String(bd.getMonth() + 1).padStart(2, '0');
            const d = String(bd.getDate()).padStart(2, '0');
            dateStr = `${y}-${m}-${d}`;
          }
          if (dateStr) {
            const parts = dateStr.split('-');
            const year = parts[0];
            if (year.length > 4) return '';
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
          return '';
        })(),
        email: visitorToEdit.email || '',
        phone: visitorToEdit.phone || '',
        address: (visitorToEdit as any).address || '',
        category: visitorToEdit.category
      });
    } else {
      setFormData({
        fullName: '',
        cpf: '',
        passport: '',
        isForeigner: false,
        gender: Gender.MALE,
        birthDate: '',
        email: '',
        phone: '',
        address: '',
        category: VisitorCategory.GENERAL
      });
    }
    setErrors({});
  }, [visitorToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Nome é obrigatório';

    if (!formData.isForeigner) {
      const cleanCPF = formData.cpf.replace(/[^\d]/g, '');
      if (!cleanCPF) {
        newErrors.cpf = 'CPF é obrigatório';
      } else if (!validateCPF(cleanCPF)) {
        newErrors.cpf = 'CPF inválido';
      }
    } else {
      if (!formData.passport.trim()) newErrors.passport = 'Passaporte é obrigatório';
    }

    const cleanPhone = formData.phone.replace(/[^\d]/g, '');
    if (cleanPhone && cleanPhone.length < 10) {
      newErrors.phone = 'Telefone inválido';
    }

    if (formData.birthDate) {
      const parts = formData.birthDate.split('/');
      if (parts.length !== 3) {
        newErrors.birthDate = 'Data inválida';
      } else {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        if (year < 1900 || year > 2100) {
          newErrors.birthDate = 'Ano inválido';
        } else if (month < 1 || month > 12) {
          newErrors.birthDate = 'Mês inválido';
        } else if (day < 1 || day > 31) {
          newErrors.birthDate = 'Dia inválido';
        } else {
          const birth = new Date(year, month - 1, day);
          const now = new Date();
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - 110);
          
          if (birth > now) {
            newErrors.birthDate = 'Data de nascimento não pode ser no futuro';
          } else if (birth < minDate) {
            newErrors.birthDate = 'Data de nascimento inválida (mais de 110 anos)';
          }
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const cleanCPF = formData.cpf.replace(/[^\d]/g, '');
      const cleanPhone = formData.phone.replace(/[^\d]/g, '');

      // Usa visitorService para verificar duplicata
      if (!formData.isForeigner && cleanCPF) {
        const { data: existingVisitors } = await visitorService.findByDocument(cleanCPF, false);
        if (existingVisitors) {
          if (!(visitorToEdit && existingVisitors.id === visitorToEdit.id)) {
            const existingName = existingVisitors?.full_name || existingVisitors?.fullName || 'Visitante';
            alert(`CPF já cadastrado para: ${existingName}`);
            setLoading(false);
            return;
          }
        }
      }

      const dataToSave = {
        full_name: formData.fullName,
        cpf: formData.isForeigner ? '' : cleanCPF,
        passport: formData.passport,
        is_foreigner: formData.isForeigner,
        gender: formData.gender,
        birth_date: (() => {
          if (!formData.birthDate) return '';
          const parts = formData.birthDate.split('/');
          if (parts.length === 3) {
            const year = parts[2];
            if (year.length > 4) return '';
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          return formData.birthDate;
        })(),
        email: formData.email,
        phone: cleanPhone,
        address: formData.address,
        category: formData.category
      };

      // Usa visitorService para criar ou atualizar
      let successMsg = visitorToEdit ? 'Visitante atualizado com sucesso!' : 'Visitante criado com sucesso!';
      
      if (visitorToEdit) {
        const res = await visitorService.update(visitorToEdit.id as string, dataToSave);
        if (res.error) {
          console.error('Update error:', res.error);
          throw new Error(res.error.message || 'Erro ao atualizar visitante');
        }
      } else {
        const res = await visitorService.create(dataToSave);
        if (res.error) {
          console.error('Create error:', res.error);
          throw new Error(res.error.message || 'Erro ao criar visitante');
        }
      }

      if (onSuccess) onSuccess();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar visitante:', error);
      alert('Erro ao processar registro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[calc(100vh-2rem)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-modal-title"
      >
        {success ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Sucesso!</h2>
            <p className="text-slate-500">O visitante foi registrado e o acesso foi liberado.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 id="checkin-modal-title" className="text-3xl font-display font-bold text-slate-900">
                    {visitorToEdit ? 'Editar Visitante' : 'Registrar Novo Visitante'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {visitorToEdit ? 'Atualize as informações do registro.' : 'Complete o formulário abaixo para emitir um passe de acesso.'}
                  </p>
                </div>
                <button onClick={onClose} aria-label="Fechar modal" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form id="checkin-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-primary">
                      <User size={18} />
                      <h3 className="font-bold uppercase text-[10px] tracking-widest">Informações Pessoais</h3>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.isForeigner}
                        onChange={e => setFormData({ ...formData, isForeigner: e.target.checked })}
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">Estrangeiro</span>
                      <Globe size={14} className={formData.isForeigner ? 'text-primary' : 'text-slate-300'} />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome Completo *</label>
                      <input
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Ex: Maria Oliveira"
                        className={`w-full bg-slate-50 border ${errors.fullName ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
                      />
                      {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.fullName}</p>}
                    </div>
                    <div>
                      {formData.isForeigner ? (
                        <>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Passaporte *</label>
                          <input
                            required
                            type="text"
                            value={formData.passport}
                            onChange={e => setFormData({ ...formData, passport: e.target.value })}
                            placeholder="AA000000"
                            className={`w-full bg-slate-50 border ${errors.passport ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
                          />
                          {errors.passport && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.passport}</p>}
                        </>
                      ) : (
                        <>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">CPF *</label>
                          <input
                            required={!formData.isForeigner}
                            type="text"
                            value={formData.cpf}
                            onChange={e => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                            placeholder="000.000.000-00"
                            className={`w-full bg-slate-50 border ${errors.cpf ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
                          />
                          {errors.cpf && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.cpf}</p>}
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Data de Nascimento</label>
                      <input
                        type="text"
                        value={formData.birthDate}
                        onChange={e => {
                          let val = e.target.value.replace(/[^\d]/g, '');
                          if (val.length > 8) val = val.slice(0, 8);
                          if (val.length >= 5) {
                            val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
                          } else if (val.length >= 3) {
                            val = val.slice(0, 2) + '/' + val.slice(2);
                          }
                          if (val.length === 10) {
                            const parts = val.split('/');
                            if (parts[2].length > 4) parts[2] = parts[2].slice(0, 4);
                            val = parts[0] + '/' + parts[1] + '/' + parts[2];
                          }
                          setFormData({ ...formData, birthDate: val });
                        }}
                        onPaste={e => {
                          e.preventDefault();
                          let val = (e.clipboardData.getData('text') || '').replace(/[^\d]/g, '');
                          if (val.length > 8) val = val.slice(0, 8);
                          if (val.length >= 5) {
                            val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
                          } else if (val.length >= 3) {
                            val = val.slice(0, 2) + '/' + val.slice(2);
                          }
                          setFormData({ ...formData, birthDate: val });
                        }}
                        placeholder="DD/MM/AAAA"
                        className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none ${errors.birthDate ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200'}`}
                      />
                      {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                    </div>
                  </div>
                </div>

                {/* Gender selection */}
                <div>
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Heart size={18} />
                    <h3 className="font-bold uppercase text-[10px] tracking-widest">Gênero</h3>
                  </div>
                  <div className="flex gap-4">
                    {[
                      { id: Gender.MALE, label: 'Masculino' },
                      { id: Gender.FEMALE, label: 'Feminino' }
                    ].map(g => (
                      <label key={g.id} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.gender === g.id ? 'bg-primary text-white border-primary shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'
                        }`}>
                        <input
                          type="radio"
                          name="gender"
                          className="hidden"
                          checked={formData.gender === g.id}
                          onChange={() => setFormData({ ...formData, gender: g.id })}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider">{g.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Contact & Address */}
                <div>
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Mail size={18} />
                    <h3 className="font-bold uppercase text-[10px] tracking-widest">Contato & Endereço</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">E-mail</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="maria@exemplo.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Telefone *</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        placeholder="(11) 99999-9999"
                        className={`w-full bg-slate-50 border ${errors.phone ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
                      />
                      {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.phone}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Endereço Completo</label>
                      <textarea
                        rows={2}
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua Exemplo, 123 - Apt 4..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="w-full md:w-80 bg-slate-50 border-l border-slate-100 p-8 flex flex-col">
              <div className="flex-1 space-y-6">
                <div>
                  <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-primary hover:text-primary transition-all cursor-pointer group mb-4">
                    <Camera size={40} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Enviar Foto</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-tighter">Foto frontal recomendada para impressão de crachá</p>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest text-primary mb-4">Classificação</h3>
                  <div className="space-y-2">
                    {[
                      { id: VisitorCategory.GENERAL, label: 'Público Geral', desc: 'Direitos de acesso padrão' },
                      { id: VisitorCategory.STUDENT, label: 'Estudante', desc: 'Acesso a áreas educacionais' },
                      { id: VisitorCategory.RESEARCHER, label: 'Pesquisador', desc: 'Acesso a arquivos e cofres' }
                    ].map(cat => (
                      <label key={cat.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.category === cat.id ? 'bg-white border-primary shadow-sm' : 'border-slate-200 hover:bg-white'
                        }`}>
                        <input
                          type="radio"
                          name="category"
                          checked={formData.category === cat.id}
                          onChange={() => setFormData({ ...formData, category: cat.id })}
                          className="text-primary focus:ring-primary h-3 w-3"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">{cat.label}</p>
                          <p className="text-[10px] text-slate-400">{cat.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex flex-col gap-2">
                  <button
                    form="checkin-form"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                  >
                    {loading ? 'Processando...' : (visitorToEdit ? 'Atualizar Registro' : 'Registrar Visitante')}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}