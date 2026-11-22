import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
  ListChecks,
  LoaderCircle,
  Pencil,
  Plus,
  Target,
  Users,
} from 'lucide-react';
import { planoAcaoService } from './planoAcaoService';
import type {
  PlanoAcaoRequest,
  PlanoAcaoResponse,
  StatusPlanoAcao,
} from '../../types/documentos';
import type { AcompanhamentoResponse } from '../../types/acompanhamento';
import { extractErrorMessage } from '../../shared/errorHelper';

interface PlanoAcaoSectionProps {
  matricula: string;
  nomeEstudante: string;
  acompanhamento: AcompanhamentoResponse | null;
}

const STATUS_PLANO_LABELS: Record<
  string,
  { label: string; badgeClass: string; description: string }
> = {
  RASCUNHO: {
    label: 'Em Elaboração (Rascunho)',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Plano em construção pela equipe multiprofissional da CLAI.',
  },
  ATIVO: {
    label: 'Ativo / Homologado',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Plano vigente com diretrizes e ações em execução no campus.',
  },
  REVISADO: {
    label: 'Revisado / Atualizado',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Plano atualizado após reavaliação periódica do estudante.',
  },
};

const SEMESTRES_SUGERIDOS = ['2026.1', '2026.2', '2027.1', '2027.2'];

function formatarDataHora(iso?: string): string {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function PlanoAcaoSection({
  matricula,
  nomeEstudante,
  acompanhamento,
}: PlanoAcaoSectionProps) {
  const [plano, setPlano] = useState<PlanoAcaoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exibirForm, setExibirForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const [form, setForm] = useState<PlanoAcaoRequest>({
    matriculaAluno: matricula,
    acompanhamentoId: acompanhamento?.id,
    semestreVigencia: '2026.2',
    diretrizesObjetivos: '',
    acoesPrevistas: '',
    responsaveisSetor: acompanhamento?.profissionaisResponsaveis ?? '',
    status: 'RASCUNHO',
  });

  const carregarPlano = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await planoAcaoService.buscarPlanoPorMatricula(matricula);
      setPlano(dados);
    } catch (err) {
      setErro(
        extractErrorMessage(
          err,
          'Não foi possível carregar o Plano de Ação Institucional.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [matricula]);

  useEffect(() => {
    void carregarPlano();
  }, [carregarPlano]);

  function abrirCriacao() {
    setErro(null);
    setSucesso(null);
    setForm({
      matriculaAluno: matricula,
      acompanhamentoId: acompanhamento?.id,
      semestreVigencia: '2026.2',
      diretrizesObjetivos: acompanhamento?.objetivosGerais ?? '',
      acoesPrevistas: '',
      responsaveisSetor: acompanhamento?.profissionaisResponsaveis ?? '',
      status: 'RASCUNHO',
    });
    setExibirForm(true);
  }

  function abrirEdicao(atual: PlanoAcaoResponse) {
    setErro(null);
    setSucesso(null);
    setForm({
      matriculaAluno: matricula,
      acompanhamentoId: atual.acompanhamentoId ?? acompanhamento?.id,
      semestreVigencia: atual.semestreVigencia || '2026.2',
      diretrizesObjetivos: atual.diretrizesObjetivos || '',
      acoesPrevistas: atual.acoesPrevistas ?? '',
      responsaveisSetor: atual.responsaveisSetor ?? '',
      status: (atual.status as StatusPlanoAcao) || 'RASCUNHO',
    });
    setExibirForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!form.semestreVigencia.trim()) {
      setErro('Informe o semestre letivo de vigência do Plano de Ação (ex.: 2026.2).');
      return;
    }

    if (!form.diretrizesObjetivos.trim()) {
      setErro('Descreva as diretrizes e objetivos institucionais do Plano de Ação.');
      return;
    }

    setSalvando(true);
    try {
      const payload: PlanoAcaoRequest = {
        matriculaAluno: matricula,
        acompanhamentoId: acompanhamento?.id,
        semestreVigencia: form.semestreVigencia.trim(),
        diretrizesObjetivos: form.diretrizesObjetivos.trim(),
        acoesPrevistas: form.acoesPrevistas?.trim() || null,
        responsaveisSetor: form.responsaveisSetor?.trim() || null,
        status: form.status,
      };

      let resultado: PlanoAcaoResponse;
      if (plano?.id) {
        resultado = await planoAcaoService.atualizarPlanoAcao(plano.id, payload);
        setSucesso('Plano de Ação Institucional atualizado com sucesso.');
      } else {
        resultado = await planoAcaoService.criarPlanoAcao(payload);
        setSucesso('Plano de Ação Institucional emitido com sucesso.');
      }

      setPlano(resultado);
      setExibirForm(false);
    } catch (err) {
      setErro(
        extractErrorMessage(
          err,
          'Não foi possível salvar o Plano de Ação Institucional.',
        ),
      );
    } finally {
      setSalvando(false);
    }
  }

  const statusInfo =
    (plano && STATUS_PLANO_LABELS[plano.status]) || STATUS_PLANO_LABELS.RASCUNHO;

  return (
    <section
      aria-labelledby="titulo-plano-acao"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* Cabeçalho da Seção */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 id="titulo-plano-acao" className="text-lg font-bold text-slate-900">
                Plano de Ação Institucional da CLAI (Fase 02)
              </h3>
              {plano && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badgeClass}`}
                >
                  {statusInfo.label}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Documento institucional que consolida as diretrizes gerais, recursos de
              acessibilidade e compromissos da CLAI para permanência e êxito de{' '}
              <span className="font-medium text-slate-800">{nomeEstudante}</span>.
            </p>
          </div>
        </div>

        {!loading && !exibirForm && (
          <div>
            {plano ? (
              <button
                type="button"
                onClick={() => abrirEdicao(plano)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <Pencil className="size-4" aria-hidden="true" />
                Editar Plano de Ação
              </button>
            ) : (
              <button
                type="button"
                onClick={abrirCriacao}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
              >
                <Plus className="size-4" aria-hidden="true" />
                Emitir Plano de Ação
              </button>
            )}
          </div>
        )}
      </div>

      {/* Aviso caso não haja acompanhamento aberto */}
      {!acompanhamento && (
        <div
          role="note"
          className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
          <div>
            <p className="font-semibold">Acompanhamento contínuo ainda não iniciado</p>
            <p className="mt-0.5 text-xs text-amber-700">
              O Plano de Ação Institucional é vinculado ao ciclo de Acompanhamento (US 10).
              Certifique-se de abrir o Acompanhamento na aba{' '}
              <span className="font-semibold">&ldquo;Acompanhamento e Atendimentos&rdquo;</span>{' '}
              para garantir o vínculo no servidor.
            </p>
          </div>
        </div>
      )}

      {/* Feedback de Erro e Sucesso */}
      {erro && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{erro}</span>
        </div>
      )}

      {sucesso && (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{sucesso}</span>
        </div>
      )}

      {/* Estado de Carregamento */}
      {loading && (
        <div
          role="status"
          className="flex flex-col items-center justify-center gap-2 py-12 text-center"
        >
          <LoaderCircle className="size-7 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-600">
            Consultando Plano de Ação do estudante…
          </p>
        </div>
      )}

      {/* Formulário de Cadastro / Edição */}
      {!loading && exibirForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              {plano ? 'Editar Plano de Ação Institucional' : 'Novo Plano de Ação Institucional'}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Preencha as diretrizes pedagógicas e ações de suporte que serão asseguradas pela CLAI
              no semestre letivo.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="plano-semestre-vigencia"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Semestre de Vigência <span className="text-red-600">*</span>
                </label>
                <input
                  id="plano-semestre-vigencia"
                  type="text"
                  list="semestres-sugeridos-list"
                  required
                  maxLength={20}
                  placeholder="Ex.: 2026.2"
                  value={form.semestreVigencia}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, semestreVigencia: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                />
                <datalist id="semestres-sugeridos-list">
                  {SEMESTRES_SUGERIDOS.map((sem) => (
                    <option key={sem} value={sem} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="plano-status"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Status do Documento <span className="text-red-600">*</span>
                </label>
                <select
                  id="plano-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as StatusPlanoAcao,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                >
                  <option value="RASCUNHO">Em Elaboração (Rascunho)</option>
                  <option value="ATIVO">Ativo / Homologado</option>
                  <option value="REVISADO">Revisado / Atualizado</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="plano-diretrizes-objetivos"
                className="block text-sm font-semibold text-slate-700"
              >
                Diretrizes e Objetivos Institucionais <span className="text-red-600">*</span>
              </label>
              <textarea
                id="plano-diretrizes-objetivos"
                rows={4}
                required
                placeholder="Descreva as metas institucionais de acessibilidade, apoios pedagógicos e orientações gerais para o acompanhamento do estudante..."
                value={form.diretrizesObjetivos}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, diretrizesObjetivos: e.target.value }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="plano-acoes-previstas"
                className="block text-sm font-semibold text-slate-700"
              >
                Ações de Suporte e Recursos Previstos
              </label>
              <textarea
                id="plano-acoes-previstas"
                rows={3}
                placeholder="Ex.: Articulação com coordenação de curso, disponibilização de tecnologia assistiva, mediação psicopedagógica quinzenal, orientação aos docentes..."
                value={form.acoesPrevistas ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, acoesPrevistas: e.target.value }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="plano-responsaveis-setor"
                className="block text-sm font-semibold text-slate-700"
              >
                Profissionais e Setores Responsáveis (CLAI / Equipe Multiprofissional)
              </label>
              <input
                id="plano-responsaveis-setor"
                type="text"
                placeholder="Ex.: Coordenação da CLAI, Psicopedagogia, Intérprete de Libras, Assistência Estudantil"
                value={form.responsaveisSetor ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, responsaveisSetor: e.target.value }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              disabled={salvando}
              onClick={() => {
                setExibirForm(false);
                setErro(null);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
            >
              {salvando && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
              {salvando
                ? 'Salvando Plano…'
                : plano
                  ? 'Salvar Alterações'
                  : 'Emitir Plano de Ação'}
            </button>
          </div>
        </form>
      )}

      {/* Visualização do Plano de Ação Existente */}
      {!loading && !exibirForm && plano && (
        <div className="mt-6 space-y-5">
          {/* Metadados Rápidos */}
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Calendar className="size-3.5 text-blue-600" aria-hidden="true" />
                Semestre de Vigência
              </dt>
              <dd className="mt-1 text-base font-bold text-slate-900">
                {plano.semestreVigencia}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Users className="size-3.5 text-blue-600" aria-hidden="true" />
                Responsáveis no Setor
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {plano.responsaveisSetor || 'Equipe Multiprofissional CLAI'}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Calendar className="size-3.5 text-blue-600" aria-hidden="true" />
                Última Atualização
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {formatarDataHora(plano.atualizadoEm ?? plano.criadoEm)}
              </dd>
            </div>
          </dl>

          {/* Blocos Descritivos */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Target className="size-4 text-blue-600" aria-hidden="true" />
                Diretrizes e Objetivos Institucionais
              </h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {plano.diretrizesObjetivos}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <ListChecks className="size-4 text-blue-600" aria-hidden="true" />
                Ações de Suporte e Recursos Previstos
              </h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {plano.acoesPrevistas ||
                  'Nenhuma ação específica detalhada além das diretrizes gerais.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && !exibirForm && !plano && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FileText className="size-6" aria-hidden="true" />
          </div>
          <h4 className="mt-3 text-base font-bold text-slate-900">
            Nenhum Plano de Ação Institucional emitido
          </h4>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Após a conclusão do Estudo de Caso e abertura do Acompanhamento, emita o Plano de Ação
            da CLAI para formalizar os apoios institucionais do semestre letivo.
          </p>
          <button
            type="button"
            onClick={abrirCriacao}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
          >
            <Plus className="size-4" aria-hidden="true" />
            Emitir Plano de Ação Agora
          </button>
        </div>
      )}
    </section>
  );
}
