import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileCheck2,
  LoaderCircle,
  MessageSquareQuote,
  Pencil,
  Plus,
} from 'lucide-react';
import { raiService } from './raiService';
import type { RaiRequest, RaiResponse } from '../../types/documentos';
import { extractErrorMessage } from '../../shared/errorHelper';

interface RaiDisciplinaPanelProps {
  peaId: number;
  nomeDisciplina: string;
  nomeProfessor: string;
}

const OPCOES_FREQUENCIA = [
  'Assíduo (Frequência igual ou superior a 75%)',
  'Frequência Regular com Faltas Pontuais Justificadas',
  'Faltas Recorrentes — Requer Atenção Pedagógica',
  'Baixa Assiduidade — Alerta de Risco de Evasão',
];

function formatarData(iso?: string): string {
  if (!iso) return '—';
  const partes = iso.slice(0, 10).split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return iso;
}

function obterHojeIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RaiDisciplinaPanel({
  peaId,
  nomeDisciplina,
  nomeProfessor,
}: RaiDisciplinaPanelProps) {
  const [expandido, setExpandido] = useState(false);
  const [rais, setRais] = useState<RaiResponse[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [exibirForm, setExibirForm] = useState(false);
  const [raiEmEdicao, setRaiEmEdicao] = useState<RaiResponse | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const [form, setForm] = useState<RaiRequest>(() => ({
    peaDisciplinaId: peaId,
    frequenciaAvaliada: OPCOES_FREQUENCIA[0],
    eficaciaAdaptacoes: '',
    parecerDocente: '',
    ajustesRecomendados: '',
    dataAvaliacao: obterHojeIso(),
  }));

  const carregarRais = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const lista = await raiService.listarPorPea(peaId);
      setRais(lista);
    } catch (err) {
      setErro(
        extractErrorMessage(
          err,
          'Não foi possível carregar os relatórios RAI desta disciplina.',
        ),
      );
    } finally {
      setCarregando(false);
    }
  }, [peaId]);

  useEffect(() => {
    void carregarRais();
  }, [carregarRais]);

  function abrirNovoRai() {
    setErro(null);
    setSucesso(null);
    setRaiEmEdicao(null);
    setForm({
      peaDisciplinaId: peaId,
      frequenciaAvaliada: OPCOES_FREQUENCIA[0],
      eficaciaAdaptacoes: '',
      parecerDocente: '',
      ajustesRecomendados: '',
      dataAvaliacao: obterHojeIso(),
    });
    setExpandido(true);
    setExibirForm(true);
  }

  function abrirEdicaoRai(item: RaiResponse) {
    setErro(null);
    setSucesso(null);
    setRaiEmEdicao(item);
    setForm({
      peaDisciplinaId: peaId,
      frequenciaAvaliada: item.frequenciaAvaliada || OPCOES_FREQUENCIA[0],
      eficaciaAdaptacoes: item.eficaciaAdaptacoes || '',
      parecerDocente: item.parecerDocente || '',
      ajustesRecomendados: item.ajustesRecomendados ?? '',
      dataAvaliacao: item.dataAvaliacao?.slice(0, 10) || obterHojeIso(),
    });
    setExpandido(true);
    setExibirForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!form.dataAvaliacao.trim()) {
      setErro('Informe a data de avaliação do relatório RAI.');
      return;
    }

    if (!form.eficaciaAdaptacoes.trim()) {
      setErro('Descreva a avaliação sobre a eficácia das adaptações adotadas na disciplina.');
      return;
    }

    if (!form.parecerDocente.trim()) {
      setErro('Preencha o parecer pedagógico do docente sobre a evolução do estudante.');
      return;
    }

    setSalvando(true);
    try {
      const payload: RaiRequest = {
        peaDisciplinaId: peaId,
        frequenciaAvaliada: form.frequenciaAvaliada?.trim() || null,
        eficaciaAdaptacoes: form.eficaciaAdaptacoes.trim(),
        parecerDocente: form.parecerDocente.trim(),
        ajustesRecomendados: form.ajustesRecomendados?.trim() || null,
        dataAvaliacao: form.dataAvaliacao.trim(),
      };

      if (raiEmEdicao?.id) {
        const atualizado = await raiService.atualizarRai(raiEmEdicao.id, payload);
        setRais((prev) =>
          prev.map((r) => (r.id === raiEmEdicao.id ? atualizado : r)),
        );
        setSucesso('Relatório RAI docente atualizado com sucesso.');
      } else {
        const criado = await raiService.registrarRai(payload);
        setRais((prev) => [criado, ...prev]);
        setSucesso('Relatório RAI docente registrado com sucesso.');
      }

      setExibirForm(false);
      setRaiEmEdicao(null);
    } catch (err) {
      setErro(
        extractErrorMessage(
          err,
          'Não foi possível salvar o Relatório de Acompanhamento Individualizado (RAI).',
        ),
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      {/* Barra superior do Painel RAI dentro do card da disciplina */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpandido((prev) => !prev)}
          aria-expanded={expandido}
          className="inline-flex items-center gap-2 text-left text-xs font-bold text-slate-800 transition hover:text-indigo-700 focus:outline-none"
        >
          <FileCheck2 className="size-4 text-indigo-600" aria-hidden="true" />
          <span>
            RAI — Relatório de Acompanhamento Individualizado Docente (Fase 04)
          </span>
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
            {rais.length} {rais.length === 1 ? 'parecer' : 'pareceres'}
          </span>
          {expandido ? (
            <ChevronUp className="size-4 text-slate-500" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4 text-slate-500" aria-hidden="true" />
          )}
        </button>

        <div className="flex items-center gap-2">
          {!expandido && rais.length > 0 && (
            <button
              type="button"
              onClick={() => setExpandido(true)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Consultar Pareceres
            </button>
          )}

          <button
            type="button"
            onClick={abrirNovoRai}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Registrar Parecer RAI
          </button>
        </div>
      </div>

      {/* Conteúdo Expandido: Formulário + Histórico de Pareceres RAI */}
      {expandido && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          {erro && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700"
            >
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <span>{sucesso}</span>
            </div>
          )}

          {/* Formulário de Preenchimento / Edição do RAI */}
          {exibirForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-5 space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4"
              noValidate
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                    {raiEmEdicao
                      ? 'Editar Relatório de Acompanhamento Individualizado (RAI)'
                      : 'Novo Relatório de Acompanhamento Individualizado (RAI)'}
                  </h6>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Disciplina: <span className="font-semibold text-slate-800">{nomeDisciplina}</span>{' '}
                    • Docente: <span className="font-semibold text-slate-800">{nomeProfessor}</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`rai-data-${peaId}`}
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Data da Avaliação Docente <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`rai-data-${peaId}`}
                    type="date"
                    required
                    value={form.dataAvaliacao}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, dataAvaliacao: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`rai-frequencia-${peaId}`}
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Frequência e Participação Avaliada
                  </label>
                  <select
                    id={`rai-frequencia-${peaId}`}
                    value={form.frequenciaAvaliada ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        frequenciaAvaliada: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                  >
                    {OPCOES_FREQUENCIA.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`rai-eficacia-${peaId}`}
                  className="block text-xs font-semibold text-slate-700"
                >
                  Eficácia das Adaptações Metodológicas e Avaliativas{' '}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  id={`rai-eficacia-${peaId}`}
                  rows={2}
                  required
                  placeholder="Avalie se as adaptações previstas no PEA atenderam às necessidades do estudante ao longo das aulas e avaliações..."
                  value={form.eficaciaAdaptacoes}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      eficaciaAdaptacoes: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`rai-parecer-${peaId}`}
                  className="block text-xs font-semibold text-slate-700"
                >
                  Parecer Descritivo do(a) Docente sobre a Evolução{' '}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  id={`rai-parecer-${peaId}`}
                  rows={3}
                  required
                  placeholder="Descreva os avanços acadêmicos, autonomia, engajamento e desempenho qualitativo observado na disciplina..."
                  value={form.parecerDocente}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, parecerDocente: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`rai-ajustes-${peaId}`}
                  className="block text-xs font-semibold text-slate-700"
                >
                  Ajustes Recomendados para o Próximo Ciclo / Semestre
                </label>
                <textarea
                  id={`rai-ajustes-${peaId}`}
                  rows={2}
                  placeholder="Caso necessário, sugira novas estratégias ou adequações para subsidiar a revisão do PEI pela CLAI..."
                  value={form.ajustesRecomendados ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ajustesRecomendados: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={salvando}
                  onClick={() => {
                    setExibirForm(false);
                    setRaiEmEdicao(null);
                    setErro(null);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {salvando && (
                    <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                  )}
                  {salvando
                    ? 'Salvando RAI…'
                    : raiEmEdicao
                      ? 'Salvar Alterações do RAI'
                      : 'Emitir Parecer RAI'}
                </button>
              </div>
            </form>
          )}

          {/* Lista de Relatórios RAI Registrados */}
          {carregando ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-6 text-xs text-slate-600"
            >
              <LoaderCircle className="size-4 animate-spin text-indigo-600" aria-hidden="true" />
              <span>Consultando pareceres docentes…</span>
            </div>
          ) : rais.length > 0 ? (
            <div className="space-y-3">
              {rais.map((rai) => (
                <div
                  key={rai.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-800 shadow-2xs">
                        <Calendar className="size-3.5 text-indigo-600" aria-hidden="true" />
                        Avaliado em {formatarData(rai.dataAvaliacao)}
                      </span>
                      {rai.frequenciaAvaliada && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <ClipboardList className="size-3" aria-hidden="true" />
                          {rai.frequenciaAvaliada}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirEdicaoRai(rai)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil className="size-3" aria-hidden="true" />
                      Editar Parecer
                    </button>
                  </div>

                  <div className="mt-2.5 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Eficácia das Adaptações Adotadas
                      </p>
                      <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-slate-800">
                        {rai.eficaciaAdaptacoes}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        <MessageSquareQuote
                          className="size-3.5 text-indigo-600"
                          aria-hidden="true"
                        />
                        Parecer Docente sobre a Evolução
                      </p>
                      <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-slate-800">
                        {rai.parecerDocente}
                      </p>
                    </div>
                  </div>

                  {rai.ajustesRecomendados && (
                    <div className="mt-2.5 border-t border-slate-200/60 pt-2">
                      <p className="text-xs text-slate-700">
                        <span className="font-semibold text-indigo-900">
                          Ajustes recomendados para o PEI:
                        </span>{' '}
                        {rai.ajustesRecomendados}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            !exibirForm && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-center">
                <p className="text-xs font-semibold text-slate-700">
                  Nenhum relatório RAI registrado para esta disciplina
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  O docente ou a equipe da CLAI pode registrar a avaliação periódica das adaptações
                  clicando em &ldquo;Registrar Parecer RAI&rdquo;.
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
