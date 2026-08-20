import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Warehouse, AlertCircle, Info, Lock, Monitor, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SpaceModal from '../modals/SpaceModal';
import ConfirmModal from '../modals/ConfirmModal';
import { spaceService, Space } from '../../services/spaceService';
import { auditService } from '../../services/auditService';
import { useAuth } from '../../contexts/AuthContext';

const SpacesTab: React.FC = () => {
  const { userData: currentAdmin } = useAuth();
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaceToEdit, setSpaceToEdit] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [targetSpace, setTargetSpace] = useState<any>(null);
  const [confirmMode, setConfirmMode] = useState<'delete' | 'disable'>('delete');

  useEffect(() => {
    fetchSpaces();
    return () => {};
  }, []);

  const handleConfirmAction = async () => {
    if (!targetSpace) return;

    try {
      if (confirmMode === 'disable') {
        await spaceService.update(targetSpace.id, { ativo: false });
        await auditService.log({ acao: "editou_espaco", detalhes: `Desativou espaço ${targetSpace.nome}`, entidadeId: targetSpace.id, userProfile: currentAdmin });
      } else {
        await spaceService.delete(targetSpace.id);
        await auditService.log({ acao: "excluiu_espaco", detalhes: `Excluiu espaço ${targetSpace.nome}`, entidadeId: targetSpace.id, userProfile: currentAdmin });
      }
      await fetchSpaces();
    } catch (error) {
      alert('Erro ao processar ação.');
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const fetchSpaces = async () => {
    const { data, error } = await spaceService.listAll();
    if (data) {
      setSpaces(data.map(d => ({
        ...d,
        totalArmarios: d.totalArmarios,
        perfilArmarios: d.perfilArmarios,
        perfilTelecentro: d.perfilTelecentro,
        totalComputadores: d.totalComputadores,
        perfilAgendamento: d.perfilAgendamento,
        capacidadeAgendamento: d.capacidadeAgendamento,
      })));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    await fetchSpaces();
    setIsModalOpen(false);
  };

  const handleDelete = async (space: any) => {
    setTargetSpace(space);
    const { data: users, error } = await spaceService.getUsers(space.id);
    const count = users?.length || 0;
    
    if (count > 0) {
      setConfirmMode('disable');
      setIsConfirmModalOpen(true);
    } else {
      setConfirmMode('delete');
      setIsConfirmModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Espaços Culturais</h3>
          <p className="text-slate-500 text-sm">Gerencie os locais de acesso da instituição.</p>
        </div>
        <button 
          onClick={() => { setSpaceToEdit(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-dark transition-all"
        >
          <Plus size={16} /> Novo Espaço
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Município</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perfis Ativos</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center animate-pulse text-slate-400 italic">Carregando espaços...</td></tr>
            ) : spaces.length > 0 ? spaces.map((space) => (
              <tr key={space.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Warehouse size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-sm">{space.nome}</p>
                        {space.ativo !== false ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-[10px] text-emerald-600 font-bold uppercase rounded-md border border-emerald-100">Ativo</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-400 font-bold uppercase rounded-md border border-slate-200">Inativo</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 font-sans">
                        <MapPin size={12} /> {space.endereco || 'Sem endereço'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                    {space.municipio || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {space.perfilArmarios && (
                      <span className="p-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100" title={`Armários: ${space.totalArmarios}`}><Lock size={12} /></span>
                    )}
                    {space.perfilTelecentro && (
                      <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100" title={`Telecentro: ${space.totalComputadores} PCs`}><Monitor size={12} /></span>
                    )}
                    {space.perfilAgendamento && (
                      <span className="p-1 bg-purple-50 text-purple-600 rounded-md border border-purple-100" title={`Agendamento: ${space.capacidadeAgendamento} assentos`}><CalendarDays size={12} /></span>
                    )}
                    {!space.perfilArmarios && !space.perfilTelecentro && !space.perfilAgendamento && (
                      <span className="text-[10px] text-slate-400 italic">Nenhum perfil</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setSpaceToEdit(space); setIsModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(space)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic flex flex-col items-center gap-3">
                   <Warehouse size={32} className="text-slate-200" />
                   <span>Nenhum espaço cadastrado. Clique em <b>'+ Novo Espaço'</b> para começar.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SpaceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        spaceToEdit={spaceToEdit}
        onSave={handleSave}
      />

      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmMode === 'disable' ? "Desativar Espaço" : "Excluir Espaço"}
        message={confirmMode === 'disable' ? "Este espaço possui usuários vinculados. Ele será desativado em vez de excluído." : "Deseja excluir permanentemente este espaço?"}
        itemText={targetSpace?.nome}
        confirmText={confirmMode === 'disable' ? "Desativar" : "Sim, excluir"}
        confirmVariant={confirmMode === 'disable' ? 'primary' : 'danger'}
      />
    </div>
  );
};

export default SpacesTab;
