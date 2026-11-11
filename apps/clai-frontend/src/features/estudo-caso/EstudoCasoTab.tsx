import { useCallback, useEffect, useState } from 'react';
import { estudoCasoService } from './estudoCasoService';
import type { EstudoDeCasoResponse } from '../../types/estudoCaso';
import { extractErrorMessage } from '../../shared/errorHelper';

interface EstudoCasoTabProps {
  matricula: string;
  nomeEstudante: string;
  cursoEstudante: string;
}

export function EstudoCasoTab({
  matricula,
  nomeEstudante,
  cursoEstudante,
}: EstudoCasoTabProps) {
  const [estudo, setEstudo] = useState<EstudoDeCasoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modoFormulario, setModoFormulario] = useState(false);

  const carregarEstudo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await estudoCasoService.buscarPorMatricula(matricula);
      setEstudo(dados);
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao carregar o Estudo de Caso deste estudante.'));
    } finally {
      setLoading(false);
    }
  }, [matricula]);

  useEffect(() => {
    void carregarEstudo();
  }, [carregarEstudo]);

  function formatarData(isoDate: string) {
    if (!isoDate) return '—';
    const partes = isoDate.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return isoDate;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-96 bg-gray-100 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="h-24 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (modoFormulario) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Formulário de Estudo de Caso</h3>
        <p className="text-sm text-gray-600 mb-4">
          O formulário interativo de cadastro e edição de Estudo de Caso é implementado na issue #121.
        </p>
        <button
          type="button"
          onClick={() => setModoFormulario(false)}
          className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          Voltar para visualização
        </button>
      </div>
    );
  }

  if (!estudo) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center max-w-3xl mx-auto">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-left">
            {error}
          </div>
        )}
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
          Pendente de Elaboração
        </span>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Nenhum Estudo de Caso registrado para {nomeEstudante}
        </h2>
        <p className="text-sm text-gray-500 max-w-xl mx-auto mb-6">
          O Estudo de Caso (Anexo II da Resolução AR 57/2023 - IFPB) é a etapa inicial de acolhimento e investigação multiprofissional para identificar necessidades educacionais específicas e subsidiar o acompanhamento e o PEI.
        </p>
        <button
          type="button"
          onClick={() => setModoFormulario(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          + Registrar Estudo de Caso
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card de Cabeçalho do Estudo de Caso */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Estudo de Caso Concluído
              </span>
              <span className="text-xs text-gray-400">
                Anexo II — Resolução AR 57/2023 (IFPB)
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Síntese Diagnóstica e Estudo de Caso
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Estudante: {nomeEstudante} ({matricula}) — {cursoEstudante}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModoFormulario(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
          >
            Editar Estudo de Caso
          </button>
        </div>

        {/* Metadados da Reunião */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-medium text-gray-500">Data de Realização</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {formatarData(estudo.dataRealizacao)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-medium text-gray-500">Período Letivo / Ingresso</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {estudo.periodoLetivo} (Ingresso: {estudo.periodoIngresso})
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
            <p className="text-xs font-medium text-gray-500">Participantes</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {estudo.participantes}
            </p>
          </div>
        </div>

        {/* Parecer Conclusivo (Badges de Destaque) */}
        <div className="flex flex-wrap gap-3 pt-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              estudo.necessitaAcompanhamentoContinuo
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            {estudo.necessitaAcompanhamentoContinuo
              ? '✓ Acompanhamento Contínuo Recomendado'
              : '• Sem indicação de Acompanhamento Contínuo'}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              estudo.necessitaAdaptacaoCurricular
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            {estudo.necessitaAdaptacaoCurricular
              ? '✓ Requer Adaptação Curricular / PEI'
              : '• Sem indicação de Adaptação Curricular / PEI'}
          </span>
        </div>
      </div>

      {/* Triagem de Saúde, Apoios e Documentos */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
          Condições de Saúde, Apoios Externos e Documentação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Deficiência / TEA / TDAH / Comorbidades
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {estudo.possuiComorbidade
                ? estudo.quaisComorbidades || 'Sim (não detalhado)'
                : 'Não informado / Não possui'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Uso de Medicação Contínua
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {estudo.usaMedicacaoContinua
                ? estudo.quaisMedicacoes || 'Sim (não detalhado)'
                : 'Não faz uso contínuo'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Serviços de Apoio / Terapias Externas
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {estudo.frequentaServicosApoio
                ? estudo.quaisServicosApoio || 'Sim (não detalhado)'
                : 'Não frequenta atualmente'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Documentos / Laudos Comprobatórios
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {estudo.apresentouDocumentosComprobatorios
                ? estudo.quaisDocumentosComprobatorios || 'Sim (arquivado na CLAI)'
                : 'Não apresentou documentação comprobatória'}
            </p>
          </div>
        </div>

        {(estudo.nomeResponsavel || estudo.telefoneResponsavel || estudo.emailResponsavel) && (
          <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-6 text-sm text-gray-700">
            {estudo.nomeResponsavel && (
              <div>
                <span className="text-gray-500">Responsável: </span>
                <strong>{estudo.nomeResponsavel}</strong>
                {estudo.parentescoResponsavel ? ` (${estudo.parentescoResponsavel})` : ''}
              </div>
            )}
            {estudo.telefoneResponsavel && (
              <div>
                <span className="text-gray-500">Telefone: </span>
                <strong>{estudo.telefoneResponsavel}</strong>
              </div>
            )}
            {estudo.emailResponsavel && (
              <div>
                <span className="text-gray-500">E-mail: </span>
                <strong>{estudo.emailResponsavel}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quatro Blocos Descritivos do Anexo II */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            1. Identificação das Necessidades Específicas e Contexto Psicossocial
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {estudo.identificacaoNecessidadesEspecificas}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            2. Avanços, Dificuldades e Potencialidades
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {estudo.avancosDificuldadesPotencialidades}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            3. Principais Demandas Identificadas e Implicações na Aprendizagem
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {estudo.principaisDemandasIdentificadas}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            4. Propostas Iniciais de Intervenção e Acessibilidade
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {estudo.propostasIniciaisIntervencao}
          </p>
        </div>
      </div>
    </div>
  );
}
