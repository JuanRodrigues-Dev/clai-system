import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  GraduationCap,
  LoaderCircle,
  Pencil,
  Plus,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { peiService } from './peiService';
import { listarDisciplinas } from '../academico/academicoService';
import type {
  PeaRequest,
  PeaResponse,
  PeiRequest,
  PeiResponse,
  StatusPei,
} from '../../types/documentos';
import type { Disciplina } from '../../types/academico';
import type { AcompanhamentoResponse } from '../../types/acompanhamento';
import { extractErrorMessage } from '../../shared/errorHelper';

interface PeiPeaSectionProps {
  matricula: string;
  nomeEstudante: string;
  cursoEstudante?: string;
  acompanhamento: AcompanhamentoResponse | null;
  necessitaAdaptacaoCurricular?: boolean;
}

const STATUS_PEI_LABELS: Record<
  string,
  { label: string; badgeClass: string; description: string }
> = {
  EM_ELABORACAO: {
    label: 'Em Elaboração',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Em construção conjunta entre CLAI, coordenação e docentes.',
  },
  AGUARDANDO_ASSINATURAS: {
    label: 'Aguardando Assinaturas',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Aguardando validação e ciência do estudante/responsável e docentes.',
  },
  HOMOLOGADO: {
    label: 'Homologado / Vigente',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'PEI validado e em vigor para as disciplinas adaptadas.',
  },
};

function formatarData(iso?: string): string {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function PeiPeaSection({
  matricula,
  nomeEstudante,
  cursoEstudante,
  acompanhamento,
  necessitaAdaptacaoCurricular,
}: PeiPeaSectionProps) {
  const [pei, setPei] = useState<PeiResponse | null>(null);
  const [peas, setPeas] = useState<PeaResponse[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de feedback do PEI
  const [erroPei, setErroPei] = useState<string | null>(null);
  const [sucessoPei, setSucessoPei] = useState<string | null>(null);
  const [exibirFormPei, setExibirFormPei] = useState(false);
  const [salvandoPei, setSalvandoPei] = useState(false);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  const [formPei, setFormPei] = useState<PeiRequest>({
    matriculaAluno: matricula,
    acompanhamentoId: acompanhamento?.id,
    diagnosticoPedagogico: '',
    recursosTecnologiaAssistiva: '',
    status: 'EM_ELABORACAO',
  });

  // Estados do Gerenciador de PEAs por Disciplina
  const [exibirFormPea, setExibirFormPea] = useState(false);
  const [peaEmEdicao, setPeaEmEdicao] = useState<PeaResponse | null>(null);
  const [salvandoPea, setSalvandoPea] = useState(false);
  const [erroPea, setErroPea] = useState<string | null>(null);
  const [sucessoPea, setSucessoPea] = useState<string | null>(null);

  const [formPea, setFormPea] = useState<PeaRequest>({
    disciplinaId: 0,
    nomeProfessor: '',
    adaptacoesMetodologicas: '',
    criteriosAvaliacao: '',
    observacoes: '',
  });

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErroPei(null);
    try {
      const [peiCarregado, listaDisciplinas] = await Promise.all([
        peiService.buscarPeiPorMatricula(matricula),
        listarDisciplinas().catch(() => [] as Disciplina[]),
      ]);

      setPei(peiCarregado);
      setDisciplinas(listaDisciplinas.filter((d) => d.ativo !== false));

      if (peiCarregado?.id) {
        if (Array.isArray(peiCarregado.peas) && peiCarregado.peas.length > 0) {
          setPeas(peiCarregado.peas);
        } else {
          const peasCarregados = await peiService
            .listarPeasPorPei(peiCarregado.id)
            .catch(() => [] as PeaResponse[]);
          setPeas(peasCarregados);
        }
      } else {
        setPeas([]);
      }
    } catch (err) {
      setErroPei(
        extractErrorMessage(
          err,
          'Não foi possível carregar o Plano Educacional Individualizado (PEI).',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [matricula]);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  function abrirCriacaoPei() {
    setErroPei(null);
    setSucessoPei(null);
    setFormPei({
      matriculaAluno: matricula,
      acompanhamentoId: acompanhamento?.id,
      diagnosticoPedagogico: '',
      recursosTecnologiaAssistiva: '',
      status: 'EM_ELABORACAO',
    });
    setExibirFormPei(true);
  }

  function abrirEdicaoPei(atual: PeiResponse) {
    setErroPei(null);
    setSucessoPei(null);
    setFormPei({
      matriculaAluno: matricula,
      acompanhamentoId: atual.acompanhamentoId ?? acompanhamento?.id,
      diagnosticoPedagogico: atual.diagnosticoPedagogico || '',
      recursosTecnologiaAssistiva: atual.recursosTecnologiaAssistiva ?? '',
      status: (atual.status as StatusPei) || 'EM_ELABORACAO',
    });
    setExibirFormPei(true);
  }

  async function handleSalvarPei(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroPei(null);
    setSucessoPei(null);

    if (!formPei.diagnosticoPedagogico.trim()) {
      setErroPei(
        'Informe o diagnóstico pedagógico consolidado (habilidades, estilo de aprendizagem e necessidades).',
      );
      return;
    }

    setSalvandoPei(true);
    try {
      const payload: PeiRequest = {
        matriculaAluno: matricula,
        acompanhamentoId: acompanhamento?.id,
        diagnosticoPedagogico: formPei.diagnosticoPedagogico.trim(),
        recursosTecnologiaAssistiva: formPei.recursosTecnologiaAssistiva?.trim() || null,
        status: formPei.status,
      };

      let salvo: PeiResponse;
      if (pei?.id) {
        try {
          salvo = await peiService.atualizarPei(pei.id, payload);
        } catch {
          salvo = await peiService.atualizarStatusPei(pei.id, payload.status);
        }
        setSucessoPei('Plano Educacional Individualizado (PEI) atualizado com sucesso.');
      } else {
        salvo = await peiService.criarPei(payload);
        setSucessoPei('Plano Educacional Individualizado (PEI) criado com sucesso.');
      }

      setPei(salvo);
      setExibirFormPei(false);
    } catch (err) {
      setErroPei(
        extractErrorMessage(
          err,
          'Não foi possível salvar o Plano Educacional Individualizado (PEI).',
        ),
      );
    } finally {
      setSalvandoPei(false);
    }
  }

  async function handleAlterarStatusRapido(novoStatus: StatusPei) {
    if (!pei?.id || pei.status === novoStatus) return;
    setErroPei(null);
    setSucessoPei(null);
    setAtualizandoStatus(true);
    try {
      const atualizado = await peiService.atualizarStatusPei(pei.id, novoStatus);
      setPei(atualizado);
      setSucessoPei(
        `Status do PEI alterado para "${STATUS_PEI_LABELS[novoStatus]?.label ?? novoStatus}".`,
      );
    } catch (err) {
      setErroPei(
        extractErrorMessage(err, 'Não foi possível atualizar o status de homologação do PEI.'),
      );
    } finally {
      setAtualizandoStatus(false);
    }
  }

  function abrirNovoPea() {
    setErroPea(null);
    setSucessoPea(null);
    setPeaEmEdicao(null);
    const primeiraDisciplinaId =
      disciplinas.length > 0 ? Number(disciplinas[0].id) : 0;
    setFormPea({
      disciplinaId: primeiraDisciplinaId,
      nomeProfessor: '',
      adaptacoesMetodologicas: '',
      criteriosAvaliacao: '',
      observacoes: '',
    });
    setExibirFormPea(true);
  }

  function abrirEdicaoPea(item: PeaResponse) {
    setErroPea(null);
    setSucessoPea(null);
    setPeaEmEdicao(item);
    setFormPea({
      disciplinaId: Number(item.disciplinaId),
      nomeProfessor: item.nomeProfessor || '',
      adaptacoesMetodologicas: item.adaptacoesMetodologicas || '',
      criteriosAvaliacao: item.criteriosAvaliacao || '',
      observacoes: item.observacoes ?? '',
    });
    setExibirFormPea(true);
  }

  async function handleSalvarPea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pei?.id) return;

    setErroPea(null);
    setSucessoPea(null);

    if (!formPea.disciplinaId || Number(formPea.disciplinaId) <= 0) {
      setErroPea('Selecione uma disciplina válida no combobox.');
      return;
    }

    if (!formPea.nomeProfessor.trim()) {
      setErroPea('Informe o nome do(a) docente responsável pela disciplina.');
      return;
    }

    if (!formPea.adaptacoesMetodologicas.trim()) {
      setErroPea('Descreva as adaptações metodológicas e didáticas para a disciplina.');
      return;
    }

    if (!formPea.criteriosAvaliacao.trim()) {
      setErroPea('Descreva os critérios e instrumentos avaliativos adaptados.');
      return;
    }

    setSalvandoPea(true);
    try {
      const payload: PeaRequest = {
        disciplinaId: Number(formPea.disciplinaId),
        nomeProfessor: formPea.nomeProfessor.trim(),
        adaptacoesMetodologicas: formPea.adaptacoesMetodologicas.trim(),
        criteriosAvaliacao: formPea.criteriosAvaliacao.trim(),
        observacoes: formPea.observacoes?.trim() || null,
      };

      if (peaEmEdicao?.id) {
        const atualizado = await peiService.atualizarPea(
          pei.id,
          peaEmEdicao.id,
          payload,
        );
        setPeas((prev) =>
          prev.map((p) => (p.id === peaEmEdicao.id ? atualizado : p)),
        );
        setSucessoPea('Plano de Ensino Adaptado (PEA) atualizado com sucesso.');
      } else {
        const criado = await peiService.adicionarPea(pei.id, payload);
        setPeas((prev) => [...prev, criado]);
        setSucessoPea('Disciplina adaptada (PEA) vinculada ao PEI com sucesso.');
      }

      setExibirFormPea(false);
      setPeaEmEdicao(null);
    } catch (err) {
      setErroPea(
        extractErrorMessage(
          err,
          'Não foi possível salvar o Plano de Ensino Adaptado (PEA) da disciplina.',
        ),
      );
    } finally {
      setSalvandoPea(false);
    }
  }

  function obterNomeDisciplina(item: PeaResponse): string {
    if (item.disciplinaNome) {
      return item.disciplinaCodigo
        ? `${item.disciplinaNome} (${item.disciplinaCodigo})`
        : item.disciplinaNome;
    }
    const encontrada = disciplinas.find(
      (d) => Number(d.id) === Number(item.disciplinaId),
    );
    if (encontrada) {
      return encontrada.codigo
        ? `${encontrada.nome} (${encontrada.codigo})`
        : encontrada.nome;
    }
    return `Disciplina #${item.disciplinaId}`;
  }

  const statusPeiInfo =
    (pei && STATUS_PEI_LABELS[pei.status]) || STATUS_PEI_LABELS.EM_ELABORACAO;

  return (
    <section
      aria-labelledby="titulo-pei-pea"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* Cabeçalho do PEI */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <GraduationCap className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 id="titulo-pei-pea" className="text-lg font-bold text-slate-900">
                PEI — Plano Educacional Individualizado e PEAs por Disciplina (Fase 03)
              </h3>
              {pei && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusPeiInfo.badgeClass}`}
                >
                  {statusPeiInfo.label}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Instrumento de adaptação curricular construído em conjunto entre CLAI, coordenação de
              curso e docentes para{' '}
              <span className="font-medium text-slate-800">{nomeEstudante}</span>
              {cursoEstudante ? ` (${cursoEstudante})` : ''}.
            </p>
          </div>
        </div>

        {!loading && !exibirFormPei && (
          <div>
            {pei ? (
              <button
                type="button"
                onClick={() => abrirEdicaoPei(pei)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                <Pencil className="size-4" aria-hidden="true" />
                Editar PEI
              </button>
            ) : (
              <button
                type="button"
                onClick={abrirCriacaoPei}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none"
              >
                <Plus className="size-4" aria-hidden="true" />
                Elaborar PEI
              </button>
            )}
          </div>
        )}
      </div>

      {/* Nota caso o Estudo de Caso tenha marcado que não necessita adaptação curricular */}
      {necessitaAdaptacaoCurricular === false && !pei && (
        <div
          role="note"
          className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
          <div>
            <p className="font-semibold">
              Estudo de Caso sem indicação obrigatória de adaptação curricular
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              O PEI é destinado prioritariamente aos estudantes que demandam flexibilização ou
              adaptação curricular. Caso a equipe identifique nova demanda ao longo do semestre, o
              PEI pode ser elaborado a qualquer momento.
            </p>
          </div>
        </div>
      )}

      {/* Alertas de Erro / Sucesso do PEI */}
      {erroPei && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{erroPei}</span>
        </div>
      )}

      {sucessoPei && (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{sucessoPei}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          role="status"
          className="flex flex-col items-center justify-center gap-2 py-12 text-center"
        >
          <LoaderCircle className="size-7 animate-spin text-indigo-600" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-600">
            Carregando PEI e disciplinas adaptadas…
          </p>
        </div>
      )}

      {/* Formulário de Criação / Edição do PEI */}
      {!loading && exibirFormPei && (
        <form onSubmit={handleSalvarPei} className="mt-6 space-y-5" noValidate>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
              {pei
                ? 'Editar Plano Educacional Individualizado (PEI)'
                : 'Elaborar Plano Educacional Individualizado (PEI)'}
            </h4>
            <p className="mt-1 text-xs text-slate-600">
              Registre a síntese diagnóstica pedagógica e os recursos de tecnologia assistiva
              autorizados para o estudante.
            </p>

            <div className="mt-4">
              <label
                htmlFor="pei-status"
                className="block text-sm font-semibold text-slate-700"
              >
                Status de Homologação do PEI <span className="text-red-600">*</span>
              </label>
              <select
                id="pei-status"
                value={formPei.status}
                onChange={(e) =>
                  setFormPei((prev) => ({
                    ...prev,
                    status: e.target.value as StatusPei,
                  }))
                }
                className="mt-1.5 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
              >
                <option value="EM_ELABORACAO">Em Elaboração</option>
                <option value="AGUARDANDO_ASSINATURAS">Aguardando Assinaturas</option>
                <option value="HOMOLOGADO">Homologado / Vigente</option>
              </select>
            </div>

            <div className="mt-4">
              <label
                htmlFor="pei-diagnostico-pedagogico"
                className="block text-sm font-semibold text-slate-700"
              >
                Diagnóstico Pedagógico Consolidado <span className="text-red-600">*</span>
              </label>
              <textarea
                id="pei-diagnostico-pedagogico"
                rows={4}
                required
                placeholder="Descreva as potencialidades, estilo de aprendizagem, especificidades cognitivas/sensoriais e orientações pedagógicas gerais para os docentes..."
                value={formPei.diagnosticoPedagogico}
                onChange={(e) =>
                  setFormPei((prev) => ({
                    ...prev,
                    diagnosticoPedagogico: e.target.value,
                  }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="pei-recursos-assistivos"
                className="block text-sm font-semibold text-slate-700"
              >
                Recursos de Tecnologia Assistiva e Apoios Autorizados
              </label>
              <textarea
                id="pei-recursos-assistivos"
                rows={3}
                placeholder="Ex.: Tempo adicional de 50% em avaliações, provas impressas em fonte ampliada (tamanho 24), apoio de ledor/transcritor, intérprete de Libras, uso de calculadora ou software leitor de tela..."
                value={formPei.recursosTecnologiaAssistiva ?? ''}
                onChange={(e) =>
                  setFormPei((prev) => ({
                    ...prev,
                    recursosTecnologiaAssistiva: e.target.value,
                  }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              disabled={salvandoPei}
              onClick={() => {
                setExibirFormPei(false);
                setErroPei(null);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvandoPei}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
            >
              {salvandoPei && (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              )}
              {salvandoPei
                ? 'Salvando PEI…'
                : pei
                  ? 'Salvar Alterações do PEI'
                  : 'Criar PEI'}
            </button>
          </div>
        </form>
      )}

      {/* Visualização do PEI + Gerenciador de PEAs por Disciplina */}
      {!loading && !exibirFormPei && pei && (
        <div className="mt-6 space-y-6">
          {/* Barra de Homologação e Metadados do PEI */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Situação atual:</span>{' '}
              {statusPeiInfo.description}
              {pei.atualizadoEm || pei.criadoEm ? (
                <span className="ml-2 text-slate-500">
                  (Atualizado em {formatarData(pei.atualizadoEm ?? pei.criadoEm)})
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-slate-500">
                Alterar status:
              </span>
              {(
                ['EM_ELABORACAO', 'AGUARDANDO_ASSINATURAS', 'HOMOLOGADO'] as StatusPei[]
              ).map((st) => {
                const ativo = pei.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={ativo || atualizandoStatus}
                    onClick={() => void handleAlterarStatusRapido(st)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      ativo
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50'
                    }`}
                  >
                    {STATUS_PEI_LABELS[st].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards de Diagnóstico e Tecnologia Assistiva */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Sparkles className="size-4 text-indigo-600" aria-hidden="true" />
                Diagnóstico Pedagógico Consolidado
              </h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {pei.diagnosticoPedagogico}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Cpu className="size-4 text-indigo-600" aria-hidden="true" />
                Recursos de Tecnologia Assistiva e Apoios
              </h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {pei.recursosTecnologiaAssistiva ||
                  'Nenhum recurso específico de tecnologia assistiva registrado.'}
              </p>
            </div>
          </div>

          {/* Subseção: Gerenciador de PEAs por Disciplina */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <BookOpen className="size-4 text-indigo-600" aria-hidden="true" />
                  PEAs por Disciplina — Planos de Ensino Adaptados ({peas.length})
                </h4>
                <p className="mt-0.5 text-xs text-slate-600">
                  Vincule cada disciplina cursada que necessita de flexibilização metodológica ou
                  avaliativa com o(a) respectivo(a) docente.
                </p>
              </div>

              {!exibirFormPea && (
                <button
                  type="button"
                  onClick={abrirNovoPea}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Adicionar Disciplina Adaptada (PEA)
                </button>
              )}
            </div>

            {/* Feedback do PEA */}
            {erroPea && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
                <span>{erroPea}</span>
              </div>
            )}

            {sucessoPea && (
              <div
                role="status"
                className="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <span>{sucessoPea}</span>
              </div>
            )}

            {/* Formulário de Adição / Edição de PEA por Disciplina */}
            {exibirFormPea && (
              <form
                onSubmit={handleSalvarPea}
                className="mt-4 space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-5"
                noValidate
              >
                <h5 className="text-sm font-bold text-indigo-950">
                  {peaEmEdicao
                    ? `Editar Adaptação da Disciplina (${obterNomeDisciplina(peaEmEdicao)})`
                    : 'Vincular Nova Disciplina Adaptada (PEA)'}
                </h5>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="pea-disciplina-select"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Disciplina (Combobox Acadêmico) <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="pea-disciplina-select"
                      required
                      value={formPea.disciplinaId}
                      onChange={(e) =>
                        setFormPea((prev) => ({
                          ...prev,
                          disciplinaId: Number(e.target.value),
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                    >
                      <option value={0}>Selecione uma disciplina cadastrada…</option>
                      {disciplinas.map((disc) => (
                        <option key={disc.id} value={Number(disc.id)}>
                          {disc.nome}
                          {disc.codigo ? ` (${disc.codigo})` : ''}
                          {disc.periodo ? ` — ${disc.periodo}º Período` : ''}
                          {disc.cursoNome ? ` • ${disc.cursoNome}` : ''}
                        </option>
                      ))}
                    </select>
                    {disciplinas.length === 0 && (
                      <p className="mt-1 text-xs text-amber-700">
                        Nenhuma disciplina ativa encontrada. Cadastre disciplinas em
                        &ldquo;Informações Acadêmicas&rdquo;.
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="pea-nome-professor"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Docente Responsável <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="pea-nome-professor"
                      type="text"
                      required
                      maxLength={160}
                      placeholder="Ex.: Prof. Dr. Carlos Alberto"
                      value={formPea.nomeProfessor}
                      onChange={(e) =>
                        setFormPea((prev) => ({ ...prev, nomeProfessor: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pea-adaptacoes-metodologicas"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Adaptações Metodológicas e Didáticas <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="pea-adaptacoes-metodologicas"
                    rows={3}
                    required
                    placeholder="Descreva como os conteúdos serão ministrados e flexibilizados (ex.: envio prévio de slides, roteiros passo a passo em laboratório, mediação individualizada)..."
                    value={formPea.adaptacoesMetodologicas}
                    onChange={(e) =>
                      setFormPea((prev) => ({
                        ...prev,
                        adaptacoesMetodologicas: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pea-criterios-avaliacao"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Critérios e Instrumentos Avaliativos Adaptados{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="pea-criterios-avaliacao"
                    rows={3}
                    required
                    placeholder="Descreva as adaptações nas provas e trabalhos (ex.: avaliações fracionadas em duas etapas, enunciados objetivos, tempo adicional de 50%, entrega prática guiada)..."
                    value={formPea.criteriosAvaliacao}
                    onChange={(e) =>
                      setFormPea((prev) => ({
                        ...prev,
                        criteriosAvaliacao: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pea-observacoes"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Observações Adicionais da Disciplina
                  </label>
                  <textarea
                    id="pea-observacoes"
                    rows={2}
                    placeholder="Acordos específicos com o docente, horários de monitoria ou observações complementares..."
                    value={formPea.observacoes ?? ''}
                    onChange={(e) =>
                      setFormPea((prev) => ({ ...prev, observacoes: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={salvandoPea}
                    onClick={() => {
                      setExibirFormPea(false);
                      setPeaEmEdicao(null);
                      setErroPea(null);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={salvandoPea}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {salvandoPea && (
                      <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                    )}
                    {salvandoPea
                      ? 'Salvando PEA…'
                      : peaEmEdicao
                        ? 'Atualizar PEA da Disciplina'
                        : 'Vincular PEA ao PEI'}
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Cards de PEAs por Disciplina */}
            {peas.length > 0 ? (
              <div className="mt-4 grid gap-4">
                {peas.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-indigo-200"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-3.5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
                            <BookOpen className="size-3.5" aria-hidden="true" />
                            {obterNomeDisciplina(item)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                            <UserCheck className="size-3.5 text-slate-500" aria-hidden="true" />
                            Docente: {item.nomeProfessor}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => abrirEdicaoPea(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Editar PEA
                      </button>
                    </div>

                    <div className="mt-3.5 grid gap-4 md:grid-cols-2">
                      <div>
                        <h6 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Adaptações Metodológicas e Didáticas
                        </h6>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-800">
                          {item.adaptacoesMetodologicas}
                        </p>
                      </div>

                      <div>
                        <h6 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <ClipboardCheck className="size-3.5 text-indigo-600" aria-hidden="true" />
                          Critérios e Instrumentos Avaliativos
                        </h6>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-800">
                          {item.criteriosAvaliacao}
                        </p>
                      </div>
                    </div>

                    {item.observacoes && (
                      <div className="mt-3 border-t border-slate-200/60 pt-2.5">
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Observações:</span>{' '}
                          {item.observacoes}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              !exibirFormPea && (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    Nenhuma disciplina adaptada (PEA) vinculada a este PEI
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Clique em &ldquo;Adicionar Disciplina Adaptada (PEA)&rdquo; para selecionar uma
                    matéria do combobox e registrar as adaptações junto ao professor.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Estado Vazio do PEI */}
      {!loading && !exibirFormPei && !pei && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <GraduationCap className="size-6" aria-hidden="true" />
          </div>
          <h4 className="mt-3 text-base font-bold text-slate-900">
            Nenhum Plano Educacional Individualizado (PEI) cadastrado
          </h4>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Elabore o PEI quando o estudante necessitar de adaptações curriculares, metodológicas ou
            avaliativas em uma ou mais disciplinas do curso.
          </p>
          <button
            type="button"
            onClick={abrirCriacaoPei}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none"
          >
            <Plus className="size-4" aria-hidden="true" />
            Elaborar PEI e Vincular Disciplinas
          </button>
        </div>
      )}
    </section>
  );
}
