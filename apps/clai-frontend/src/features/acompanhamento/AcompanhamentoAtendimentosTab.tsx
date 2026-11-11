import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { acompanhamentoService } from './acompanhamentoService';
import { atendimentoService } from './atendimentoService';
import type {
  AcompanhamentoRequest,
  AcompanhamentoResponse,
  AtendimentoRequest,
  AtendimentoResponse,
} from '../../types/acompanhamento';
import { extractErrorMessage } from '../../shared/errorHelper';

interface AcompanhamentoAtendimentosTabProps {
  matricula: string;
  nomeEstudante: string;
}

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  EM_ANDAMENTO: {
    label: 'Em Andamento',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  PAUSADO: {
    label: 'Pausado / Trancado',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ALTA: {
    label: 'Alta do Acompanhamento',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  CONCLUIDO: {
    label: 'Concluído (Formatura)',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  EVASAO: {
    label: 'Interrompido por Evasão',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  },
};

export function AcompanhamentoAtendimentosTab({
  matricula,
  nomeEstudante,
}: AcompanhamentoAtendimentosTabProps) {
  const hojeIso = new Date().toISOString().slice(0, 10);

  const [acompanhamento, setAcompanhamento] = useState<AcompanhamentoResponse | null>(null);
  const [atendimentos, setAtendimentos] = useState<AtendimentoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Estado do formulário de Acompanhamento (macro)
  const [exibirFormAcompanhamento, setExibirFormAcompanhamento] = useState(false);
  const [salvandoAcompanhamento, setSalvandoAcompanhamento] = useState(false);
  const [formAcompanhamento, setFormAcompanhamento] = useState<AcompanhamentoRequest>({
    matriculaAluno: matricula,
    dataInicio: hojeIso,
    status: 'EM_ANDAMENTO',
    frequenciaMonitoramento: 'Quinzenal',
    profissionaisResponsaveis: '',
    objetivosGerais: '',
    observacoesEvolucao: '',
  });

  // Estado do formulário de Atendimento Pontual
  const [exibirFormAtendimento, setExibirFormAtendimento] = useState(false);
  const [idAtendimentoEmEdicao, setIdAtendimentoEmEdicao] = useState<number | null>(null);
  const [salvandoAtendimento, setSalvandoAtendimento] = useState(false);
  const [formAtendimento, setFormAtendimento] = useState<AtendimentoRequest>({
    matriculaAluno: matricula,
    dataAtendimento: hojeIso,
    horarioInicio: '09:00',
    horarioFim: '10:00',
    modalidadeLocal: 'Presencial - Sala da CLAI',
    tipo: 'Atendimento Psicopedagógico Individual',
    profissionais: '',
    participantes: 'Estudante',
    demanda: '',
    descricao: '',
    resultado: '',
    encaminhamentos: '',
    observacoes: '',
    proximoAtendimento: '',
  });

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErroGeral(null);
    try {
      const [acomp, listaAtend] = await Promise.all([
        acompanhamentoService.buscarPorMatricula(matricula),
        atendimentoService.listarPorMatricula(matricula),
      ]);
      setAcompanhamento(acomp);
      setAtendimentos(listaAtend);
    } catch (err) {
      setErroGeral(
        extractErrorMessage(
          err,
          'Não foi possível carregar o acompanhamento e histórico de atendimentos.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [matricula]);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  function abrirNovoAcompanhamento() {
    setErroGeral(null);
    setMensagemSucesso(null);
    setFormAcompanhamento({
      matriculaAluno: matricula,
      dataInicio: hojeIso,
      status: 'EM_ANDAMENTO',
      frequenciaMonitoramento: 'Quinzenal',
      profissionaisResponsaveis: '',
      objetivosGerais: '',
      observacoesEvolucao: '',
    });
    setExibirFormAcompanhamento(true);
  }

  function abrirEdicaoAcompanhamento(atual: AcompanhamentoResponse) {
    setErroGeral(null);
    setMensagemSucesso(null);
    setFormAcompanhamento({
      matriculaAluno: matricula,
      dataInicio: atual.dataInicio,
      status: atual.status,
      frequenciaMonitoramento: atual.frequenciaMonitoramento,
      profissionaisResponsaveis: atual.profissionaisResponsaveis,
      objetivosGerais: atual.objetivosGerais,
      observacoesEvolucao: atual.observacoesEvolucao ?? '',
    });
    setExibirFormAcompanhamento(true);
  }

  async function handleSalvarAcompanhamento(e: FormEvent) {
    e.preventDefault();
    setSalvandoAcompanhamento(true);
    setErroGeral(null);
    setMensagemSucesso(null);
    try {
      const payload: AcompanhamentoRequest = {
        ...formAcompanhamento,
        matriculaAluno: matricula,
      };
      if (acompanhamento) {
        const atualizado = await acompanhamentoService.atualizar(
          acompanhamento.id,
          payload,
        );
        setAcompanhamento(atualizado);
        setMensagemSucesso('Ciclo de acompanhamento atualizado com sucesso!');
      } else {
        const iniciado = await acompanhamentoService.iniciar(payload);
        setAcompanhamento(iniciado);
        setMensagemSucesso('Ciclo de acompanhamento iniciado com sucesso!');
      }
      setExibirFormAcompanhamento(false);
    } catch (err) {
      setErroGeral(
        extractErrorMessage(err, 'Não foi possível salvar os dados do acompanhamento.'),
      );
    } finally {
      setSalvandoAcompanhamento(false);
    }
  }

  function abrirNovoAtendimento() {
    setErroGeral(null);
    setMensagemSucesso(null);
    setIdAtendimentoEmEdicao(null);
    setFormAtendimento({
      matriculaAluno: matricula,
      dataAtendimento: hojeIso,
      horarioInicio: '09:00',
      horarioFim: '10:00',
      modalidadeLocal: 'Presencial - Sala da CLAI',
      tipo: 'Atendimento Psicopedagógico Individual',
      profissionais: acompanhamento?.profissionaisResponsaveis ?? '',
      participantes: 'Estudante',
      demanda: '',
      descricao: '',
      resultado: '',
      encaminhamentos: '',
      observacoes: '',
      proximoAtendimento: '',
    });
    setExibirFormAtendimento(true);
  }

  function abrirEdicaoAtendimento(item: AtendimentoResponse) {
    setErroGeral(null);
    setMensagemSucesso(null);
    setIdAtendimentoEmEdicao(item.id);
    setFormAtendimento({
      matriculaAluno: matricula,
      dataAtendimento: item.dataAtendimento,
      horarioInicio: item.horarioInicio.slice(0, 5),
      horarioFim: item.horarioFim.slice(0, 5),
      modalidadeLocal: item.modalidadeLocal,
      tipo: item.tipo,
      profissionais: item.profissionais,
      participantes: item.participantes,
      demanda: item.demanda,
      descricao: item.descricao,
      resultado: item.resultado,
      encaminhamentos: item.encaminhamentos,
      observacoes: item.observacoes ?? '',
      proximoAtendimento: item.proximoAtendimento ?? '',
    });
    setExibirFormAtendimento(true);
  }

  async function handleSalvarAtendimento(e: FormEvent) {
    e.preventDefault();
    setSalvandoAtendimento(true);
    setErroGeral(null);
    setMensagemSucesso(null);
    try {
      const payload: AtendimentoRequest = {
        ...formAtendimento,
        matriculaAluno: matricula,
        proximoAtendimento: formAtendimento.proximoAtendimento
          ? formAtendimento.proximoAtendimento
          : null,
      };
      if (idAtendimentoEmEdicao !== null) {
        await atendimentoService.atualizar(idAtendimentoEmEdicao, payload);
        setMensagemSucesso('Registro de atendimento atualizado com sucesso!');
      } else {
        await atendimentoService.registrar(payload);
        setMensagemSucesso('Novo atendimento pontual registrado com sucesso!');
      }
      const listaAtualizada = await atendimentoService.listarPorMatricula(matricula);
      setAtendimentos(listaAtualizada);
      setExibirFormAtendimento(false);
      setIdAtendimentoEmEdicao(null);
    } catch (err) {
      setErroGeral(
        extractErrorMessage(err, 'Não foi possível salvar o atendimento pontual.'),
      );
    } finally {
      setSalvandoAtendimento(false);
    }
  }

  function formatarData(isoDate?: string | null) {
    if (!isoDate) return '—';
    const partes = isoDate.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return isoDate;
  }

  function formatarHorario(hora: string) {
    if (!hora) return '';
    return hora.slice(0, 5);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-72 bg-gray-200 rounded" />
          <div className="h-28 bg-gray-100 rounded-xl" />
          <div className="h-36 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {erroGeral && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {erroGeral}
        </div>
      )}

      {mensagemSucesso && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center justify-between">
          <span>{mensagemSucesso}</span>
          <button
            type="button"
            onClick={() => setMensagemSucesso(null)}
            className="text-emerald-700 hover:underline text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* SEÇÃO 1: CICLO MACRO DE ACOMPANHAMENTO (US 10)                      */}
      {/* =================================================================== */}
      {exibirFormAcompanhamento ? (
        <form
          onSubmit={handleSalvarAcompanhamento}
          className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {acompanhamento
                  ? 'Editar Ciclo de Acompanhamento'
                  : 'Iniciar Ciclo de Acompanhamento Contínuo'}
              </h2>
              <p className="text-sm text-gray-500">
                Estudante: <strong className="text-gray-700">{nomeEstudante}</strong> ({matricula})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExibirFormAcompanhamento(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                required
                value={formAcompanhamento.dataInicio}
                onChange={(e) =>
                  setFormAcompanhamento({
                    ...formAcompanhamento,
                    dataInicio: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status do Ciclo *
              </label>
              <select
                value={formAcompanhamento.status}
                onChange={(e) =>
                  setFormAcompanhamento({
                    ...formAcompanhamento,
                    status: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="PAUSADO">Pausado / Trancado</option>
                <option value="ALTA">Alta do Acompanhamento</option>
                <option value="CONCLUIDO">Concluído (Formatura)</option>
                <option value="EVASAO">Interrompido por Evasão</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência de Monitoramento *
              </label>
              <select
                value={formAcompanhamento.frequenciaMonitoramento}
                onChange={(e) =>
                  setFormAcompanhamento({
                    ...formAcompanhamento,
                    frequenciaMonitoramento: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semanal">Semanal</option>
                <option value="Quinzenal">Quinzenal</option>
                <option value="Mensal">Mensal</option>
                <option value="Bimestral">Bimestral</option>
                <option value="Sob Demanda">Sob Demanda</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profissionais de Referência Responsáveis *
            </label>
            <input
              type="text"
              required
              placeholder="Ex.: Maria Clara (Psicopedagoga) e Carlos Eduardo (Psicólogo)"
              value={formAcompanhamento.profissionaisResponsaveis}
              onChange={(e) =>
                setFormAcompanhamento({
                  ...formAcompanhamento,
                  profissionaisResponsaveis: e.target.value,
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objetivos Gerais do Acompanhamento *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descreva as metas de permanência, organização de rotina de estudos, autonomia e redução de barreiras..."
              value={formAcompanhamento.objetivosGerais}
              onChange={(e) =>
                setFormAcompanhamento({
                  ...formAcompanhamento,
                  objetivosGerais: e.target.value,
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações Gerais de Evolução (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Anotações gerais sobre o progresso do estudante no semestre..."
              value={formAcompanhamento.observacoesEvolucao ?? ''}
              onChange={(e) =>
                setFormAcompanhamento({
                  ...formAcompanhamento,
                  observacoesEvolucao: e.target.value,
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setExibirFormAcompanhamento(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvandoAcompanhamento}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {salvandoAcompanhamento
                ? 'Salvando...'
                : acompanhamento
                  ? 'Salvar Alterações'
                  : 'Confirmar Início do Acompanhamento'}
            </button>
          </div>
        </form>
      ) : !acompanhamento ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
            Ciclo Não Iniciado
          </span>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Acompanhamento Contínuo ainda não iniciado para {nomeEstudante}
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-6">
            Inicie o ciclo de acompanhamento para definir a frequência de monitoramento, os profissionais de referência e habilitar o registro cronológico de atendimentos pontuais.
          </p>
          <button
            type="button"
            onClick={abrirNovoAcompanhamento}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            + Iniciar Ciclo de Acompanhamento
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    STATUS_LABELS[acompanhamento.status]?.badgeClass ??
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {STATUS_LABELS[acompanhamento.status]?.label ?? acompanhamento.status}
                </span>
                <span className="text-xs text-gray-500">
                  Iniciado em {formatarData(acompanhamento.dataInicio)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Ciclo Macro de Acompanhamento (CLAI)
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => abrirEdicaoAcompanhamento(acompanhamento)}
                className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Editar Ciclo
              </button>
              <button
                type="button"
                onClick={abrirNovoAtendimento}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                + Novo Atendimento Pontual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-medium text-gray-500">
                Frequência de Monitoramento
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {acompanhamento.frequenciaMonitoramento}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
              <p className="text-xs font-medium text-gray-500">
                Profissionais de Referência
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {acompanhamento.profissionaisResponsaveis}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Objetivos Gerais do Acompanhamento
              </p>
              <p className="text-sm text-gray-800 whitespace-pre-line">
                {acompanhamento.objetivosGerais}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Observações de Evolução
              </p>
              <p className="text-sm text-gray-800 whitespace-pre-line">
                {acompanhamento.observacoesEvolucao || 'Sem observações adicionais registradas.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SEÇÃO 2: FORMULÁRIO E LINHA DO TEMPO DE ATENDIMENTOS PONTUAIS (US11) */}
      {/* =================================================================== */}
      {acompanhamento && exibirFormAtendimento && (
        <form
          onSubmit={handleSalvarAtendimento}
          className="bg-white rounded-2xl border-2 border-blue-200 p-6 md:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-1">
                Registro de Sessão / Atendimento
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                {idAtendimentoEmEdicao !== null
                  ? 'Editar Atendimento Pontual'
                  : 'Registrar Novo Atendimento Pontual'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setExibirFormAtendimento(false);
                setIdAtendimentoEmEdicao(null);
              }}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do Atendimento *
              </label>
              <input
                type="date"
                required
                value={formAtendimento.dataAtendimento}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    dataAtendimento: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário de Início *
              </label>
              <input
                type="time"
                required
                value={formAtendimento.horarioInicio}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    horarioInicio: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário de Término *
              </label>
              <input
                type="time"
                required
                value={formAtendimento.horarioFim}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    horarioFim: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidade / Local *
              </label>
              <select
                value={formAtendimento.modalidadeLocal}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    modalidadeLocal: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
              >
                <option value="Presencial - Sala da CLAI">Presencial - Sala da CLAI</option>
                <option value="Remoto - Google Meet">Remoto - Google Meet</option>
                <option value="Observação em Sala de Aula">Observação em Sala de Aula</option>
                <option value="Contato Telefônico / WhatsApp">Contato Telefônico / WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo do Atendimento *
              </label>
              <select
                value={formAtendimento.tipo}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    tipo: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
              >
                <option value="Atendimento Psicopedagógico Individual">
                  Atendimento Psicopedagógico Individual
                </option>
                <option value="Escuta Psicológica">Escuta Psicológica</option>
                <option value="Orientação Pedagógica / Rotina de Estudos">
                  Orientação Pedagógica / Rotina de Estudos
                </option>
                <option value="Reunião com Família / Responsáveis">
                  Reunião com Família / Responsáveis
                </option>
                <option value="Articulação com Docentes / Coordenação">
                  Articulação com Docentes / Coordenação
                </option>
                <option value="Acompanhamento de Monitoria / AEE">
                  Acompanhamento de Monitoria / AEE
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profissionais Presentes (CLAI) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: Psicopedagoga e Pedagoga"
                value={formAtendimento.profissionais}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    profissionais: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participantes da Sessão *
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: Estudante e Mãe"
                value={formAtendimento.participantes}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    participantes: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demanda / Motivo da Sessão *
            </label>
            <input
              type="text"
              required
              placeholder="Ex.: Revisão do cronograma de avaliações e manejo de ansiedade em provas"
              value={formAtendimento.demanda}
              onChange={(e) =>
                setFormAtendimento({ ...formAtendimento, demanda: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Síntese / Descrição do Atendimento *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Relate o que foi trabalhado durante a sessão..."
                value={formAtendimento.descricao}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    descricao: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resultado / Evolução Observada *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Indique a receptividade do estudante e os avanços percebidos..."
                value={formAtendimento.resultado}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    resultado: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encaminhamentos e Combinados *
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: Comunicar docente de Algoritmos sobre tempo adicional de prova"
                value={formAtendimento.encaminhamentos}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    encaminhamentos: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previsão de Próximo Retorno (Opcional)
              </label>
              <input
                type="date"
                value={formAtendimento.proximoAtendimento ?? ''}
                onChange={(e) =>
                  setFormAtendimento({
                    ...formAtendimento,
                    proximoAtendimento: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setExibirFormAtendimento(false);
                setIdAtendimentoEmEdicao(null);
              }}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvandoAtendimento}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {salvandoAtendimento
                ? 'Salvando...'
                : idAtendimentoEmEdicao !== null
                  ? 'Salvar Alterações do Atendimento'
                  : 'Registrar Atendimento'}
            </button>
          </div>
        </form>
      )}

      {/* Linha do Tempo de Atendimentos Pontuais */}
      {acompanhamento && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Histórico Cronológico de Atendimentos Pontuais ({atendimentos.length})
              </h3>
              <p className="text-xs text-gray-500">
                Sessões individuais, escutas, orientações familiares e articulações docentes registradas.
              </p>
            </div>
          </div>

          {atendimentos.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-gray-200 text-center">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Nenhum atendimento pontual registrado até o momento.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Clique em "+ Novo Atendimento Pontual" para registrar a primeira sessão deste estudante.
              </p>
              <button
                type="button"
                onClick={abrirNovoAtendimento}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
              >
                + Registrar Primeiro Atendimento
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {atendimentos.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-gray-50/40 hover:bg-white transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold">
                        {formatarData(item.dataAtendimento)}
                      </span>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {formatarHorario(item.horarioInicio)} às {formatarHorario(item.horarioFim)}
                      </span>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                        {item.tipo}
                      </span>
                      <span className="text-xs text-gray-500">
                        • {item.modalidadeLocal}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirEdicaoAtendimento(item)}
                      className="self-start sm:self-auto text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Editar Registro
                    </button>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Demanda / Objetivo da Sessão
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {item.demanda}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-xl bg-white border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        Relato / Síntese da Sessão
                      </p>
                      <p className="text-gray-800 whitespace-pre-line">{item.descricao}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        Resultado / Evolução Observada
                      </p>
                      <p className="text-gray-800 whitespace-pre-line">{item.resultado}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-600">
                    <div>
                      <strong>Encaminhamentos:</strong> {item.encaminhamentos}
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <span>
                        <strong>Profissionais:</strong> {item.profissionais}
                      </span>
                      <span>
                        <strong>Participantes:</strong> {item.participantes}
                      </span>
                      {item.proximoAtendimento && (
                        <span className="text-blue-700 font-semibold">
                          Próximo Retorno: {formatarData(item.proximoAtendimento)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
