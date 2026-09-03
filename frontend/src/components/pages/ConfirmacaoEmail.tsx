import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';

export default function ConfirmacaoEmail() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (token) {
      api.get(`/public/agendamentos/confirmar/${token}`, false)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl text-center">
        {status === 'loading' && (
          <div>
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-slate-800">Confirmando seu e-mail...</h2>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">E-mail Confirmado!</h2>
            <p className="text-slate-600 mb-6">Seu agendamento foi validado e enviado para a análise da coordenação.</p>
            <Link to="/agendamento" className="inline-block bg-indigo-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-indigo-700 transition">Voltar ao Início</Link>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✕</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Erro na Confirmação</h2>
            <p className="text-slate-600 mb-6">Link inválido ou agendamento já confirmado.</p>
            <Link to="/agendamento" className="inline-block bg-slate-200 text-slate-800 font-medium py-3 px-6 rounded-xl hover:bg-slate-300 transition">Tentar Novamente</Link>
          </div>
        )}
      </div>
    </div>
  );
}
