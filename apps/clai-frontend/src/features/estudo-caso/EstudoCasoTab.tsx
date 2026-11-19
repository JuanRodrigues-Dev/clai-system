import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { estudoCasoService } from './estudoCasoService';
import type { EstudoDeCasoRequest, EstudoDeCasoResponse } from '../../types/estudoCaso';
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
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const hojeIso = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState<EstudoDeCasoRequest>({
    matriculaAluno: matricula,
    dataRealizacao: hojeIso,
    periodoLetivo: '2026.2',
    periodoIngresso: '2026.1',
    participantes: '',
    nomeResponsavel: '',
    parentescoResponsavel: '',
    telefoneResponsavel: '',
    emailResponsavel: '',
    possuiComorbidade: false,
    quaisComorbidades: '',
    usaMedicacaoContinua: false,
    quaisMedicacoes: '',
    frequentaServicosApoio: false,
    quaisServicosApoio: '',
    apresentouDocumentosComprobatorios: false,
    quaisDocumentosComprobatorios: '',
    identificacaoNecessidadesEspecificas: '',
    avancosDificuldadesPotencialidades: '',
    principaisDemandasIdentificadas: '',
    propostasIniciaisIntervencao: '',
    necessitaAcompanhamentoContinuo: true,
    necessitaAdaptacaoCurricular: false,
  });

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

  function iniciarCadastro() {
    setMensagemSucesso(null);
    setError(null);
    setForm({
      matriculaAluno: matricula,
      dataRealizacao: hojeIso,
      periodoLetivo: '2026.2',
      periodoIngresso: '2026.1',
      participantes: '',
      nomeResponsavel: '',
      parentescoResponsavel: '',
      telefoneResponsavel: '',
      emailResponsavel: '',
      possuiComorbidade: false,
      quaisComorbidades: '',
      usaMedicacaoContinua: false,
      quaisMedicacoes: '',
      frequentaServicosApoio: false,
      quaisServicosApoio: '',
      apresentouDocumentosComprobatorios: false,
      quaisDocumentosComprobatorios: '',
      identificacaoNecessidadesEspecificas: '',
      avancosDificuldadesPotencialidades: '',
      principaisDemandasIdentificadas: '',
      propostasIniciaisIntervencao: '',
      necessitaAcompanhamentoContinuo: true,
      necessitaAdaptacaoCurricular: false,
    });
    setModoFormulario(true);
  }

  function iniciarEdicao(atual: EstudoDeCasoResponse) {
    setMensagemSucesso(null);
    setError(null);
    setForm({
      matriculaAluno: matricula,
      dataRealizacao: atual.dataRealizacao,
      periodoLetivo: atual.periodoLetivo,
      periodoIngresso: atual.periodoIngresso,
      participantes: atual.participantes,
      nomeResponsavel: atual.nomeResponsavel ?? '',
      parentescoResponsavel: atual.parentescoResponsavel ?? '',
      telefoneResponsavel: atual.telefoneResponsavel ?? '',
      emailResponsavel: atual.emailResponsavel ?? '',
      possuiComorbidade: atual.possuiComorbidade,
      quaisComorbidades: atual.quaisComorbidades ?? '',
      usaMedicacaoContinua: atual.usaMedicacaoContinua,
      quaisMedicacoes: atual.quaisMedicacoes ?? '',
      frequentaServicosApoio: atual.frequentaServicosApoio,
      quaisServicosApoio: atual.quaisServicosApoio ?? '',
      apresentouDocumentosComprobatorios: atual.apresentouDocumentosComprobatorios,
      quaisDocumentosComprobatorios: atual.quaisDocumentosComprobatorios ?? '',
      identificacaoNecessidadesEspecificas: atual.identificacaoNecessidadesEspecificas,
      avancosDificuldadesPotencialidades: atual.avancosDificuldadesPotencialidades,
      principaisDemandasIdentificadas: atual.principaisDemandasIdentificadas,
      propostasIniciaisIntervencao: atual.propostasIniciaisIntervencao,
      necessitaAcompanhamentoContinuo: atual.necessitaAcompanhamentoContinuo,
      necessitaAdaptacaoCurricular: atual.necessitaAdaptacaoCurricular,
    });
    setModoFormulario(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setError(null);
    setMensagemSucesso(null);

    try {
      const payload: EstudoDeCasoRequest = {
        ...form,
        matriculaAluno: matricula,
      };
      if (estudo) {
        const atualizado = await estudoCasoService.atualizarPorMatricula(matricula, payload);
        setEstudo(atualizado);
        setMensagemSucesso('Estudo de Caso atualizado com sucesso!');
      } else {
        const criado = await estudoCasoService.cadastrar(payload);
        setEstudo(criado);
        setMensagemSucesso('Estudo de Caso registrado com sucesso!');
      }
      setModoFormulario(false);
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível salvar o Estudo de Caso.'));
    } finally {
      setSalvando(false);
    }
  }

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
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
              Anexo II — Resolução AR 57/2023 (IFPB)
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              {estudo ? 'Editar Estudo de Caso' : 'Registrar Estudo de Caso'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Estudante: <strong className="text-gray-700">{nomeEstudante}</strong> ({matricula}) — {cursoEstudante}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModoFormulario(false)}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Bloco 1: Dados da Reunião e Responsável */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            1. Contexto de Realização e Responsável Familiar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Realização *
              </label>
              <input
                type="date"
                required
                value={form.dataRealizacao}
                onChange={(e) => setForm({ ...form, dataRealizacao: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período Letivo Atual *
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: 2026.2"
                value={form.periodoLetivo}
                onChange={(e) => setForm({ ...form, periodoLetivo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período de Ingresso *
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: 2025.1"
                value={form.periodoIngresso}
                onChange={(e) => setForm({ ...form, periodoIngresso: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participantes do Estudo de Caso (Equipe CLAI / Docentes / Coordenação) *
            </label>
            <input
              type="text"
              required
              placeholder="Ex.: Psicóloga escolar, Pedagoga CLAI, Coordenador de Curso e Estudante"
              value={form.participantes}
              onChange={(e) => setForm({ ...form, participantes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Responsável (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nome completo"
                value={form.nomeResponsavel ?? ''}
                onChange={(e) => setForm({ ...form, nomeResponsavel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parentesco / Vínculo
              </label>
              <input
                type="text"
                placeholder="Ex.: Mãe, Pai, Cônjuge"
                value={form.parentescoResponsavel ?? ''}
                onChange={(e) => setForm({ ...form, parentescoResponsavel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone do Responsável
              </label>
              <input
                type="text"
                placeholder="(83) 99999-9999"
                value={form.telefoneResponsavel ?? ''}
                onChange={(e) => setForm({ ...form, telefoneResponsavel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail do Responsável
              </label>
              <input
                type="email"
                placeholder="responsavel@email.com"
                value={form.emailResponsavel ?? ''}
                onChange={(e) => setForm({ ...form, emailResponsavel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Triagem Clínica e Documental */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            2. Condições de Saúde, Apoios Externos e Documentação Comprobatória
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Comorbidade */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.possuiComorbidade}
                  onChange={(e) =>
                    setForm({ ...form, possuiComorbidade: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-800">
                  Apresenta deficiência, TEA, TDAH ou comorbidade associada?
                </span>
              </label>
              {form.possuiComorbidade && (
                <input
                  type="text"
                  placeholder="Especifique quais condições ou CID informados..."
                  value={form.quaisComorbidades ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, quaisComorbidades: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                />
              )}
            </div>

            {/* Medicação */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.usaMedicacaoContinua}
                  onChange={(e) =>
                    setForm({ ...form, usaMedicacaoContinua: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-800">
                  Faz uso de medicação contínua?
                </span>
              </label>
              {form.usaMedicacaoContinua && (
                <input
                  type="text"
                  placeholder="Quais medicações e possíveis efeitos no turno escolar..."
                  value={form.quaisMedicacoes ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, quaisMedicacoes: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                />
              )}
            </div>

            {/* Serviços de apoio */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.frequentaServicosApoio}
                  onChange={(e) =>
                    setForm({ ...form, frequentaServicosApoio: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-800">
                  Frequenta serviços externos de apoio / terapia?
                </span>
              </label>
              {form.frequentaServicosApoio && (
                <input
                  type="text"
                  placeholder="Ex.: Psicoterapia, Fonoaudiologia, Psiquiatria, AEE..."
                  value={form.quaisServicosApoio ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, quaisServicosApoio: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                />
              )}
            </div>

            {/* Documentos comprobatórios */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.apresentouDocumentosComprobatorios}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      apresentouDocumentosComprobatorios: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-800">
                  Apresentou laudos ou documentos comprobatórios?
                </span>
              </label>
              {form.apresentouDocumentosComprobatorios && (
                <input
                  type="text"
                  placeholder="Ex.: Laudo médico neuropsicológico, parecer pedagógico..."
                  value={form.quaisDocumentosComprobatorios ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quaisDocumentosComprobatorios: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bloco 3: Seções Descritivas do Estudo de Caso (Anexo II) */}
        <div className="space-y-5 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            3. Síntese Multiprofissional do Estudo de Caso (Anexo II - IFPB)
          </h3>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Identificação das Necessidades Educacionais Específicas e Contexto Psicossocial *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Descreva as idiossincrasias do estudante, grau de autonomia nas atividades escolares e sociais, contexto familiar e fatores emocionais relevantes.
            </p>
            <textarea
              required
              rows={3}
              value={form.identificacaoNecessidadesEspecificas}
              onChange={(e) =>
                setForm({
                  ...form,
                  identificacaoNecessidadesEspecificas: e.target.value,
                })
              }
              placeholder="Descreva as necessidades específicas identificadas pela equipe..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Avanços, Dificuldades e Potencialidades no Percurso Educacional *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Relato sistematizado sobre o histórico escolar anterior e atual, habilidades em destaque, estilos de aprendizagem e pontos de atenção.
            </p>
            <textarea
              required
              rows={3}
              value={form.avancosDificuldadesPotencialidades}
              onChange={(e) =>
                setForm({
                  ...form,
                  avancosDificuldadesPotencialidades: e.target.value,
                })
              }
              placeholder="Relate os avanços, dificuldades e potencialidades observados..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Principais Demandas Identificadas e Implicações na Aprendizagem *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Indique as principais barreiras (arquitetônicas, comunicacionais, metodológicas ou atitudinais) e componentes curriculares com maior dificuldade.
            </p>
            <textarea
              required
              rows={3}
              value={form.principaisDemandasIdentificadas}
              onChange={(e) =>
                setForm({
                  ...form,
                  principaisDemandasIdentificadas: e.target.value,
                })
              }
              placeholder="Liste as demandas prioritárias e disciplinas críticas..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Propostas Iniciais de Intervenção e Ações de Acessibilidade *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Recomendações para docentes, tempo adicional em avaliações, ledor/transcritor, intérprete de Libras, monitoria inclusiva ou encaminhamentos internos.
            </p>
            <textarea
              required
              rows={3}
              value={form.propostasIniciaisIntervencao}
              onChange={(e) =>
                setForm({
                  ...form,
                  propostasIniciaisIntervencao: e.target.value,
                })
              }
              placeholder="Especifique as intervenções e apoios pedagógicos propostos..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bloco 4: Parecer Conclusivo */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            4. Parecer Conclusivo da Equipe CLAI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.necessitaAcompanhamentoContinuo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    necessitaAcompanhamentoContinuo: e.target.checked,
                  })
                }
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="block text-sm font-semibold text-gray-900">
                  Necessita de Acompanhamento Contínuo pela CLAI
                </span>
                <span className="block text-xs text-gray-600 mt-0.5">
                  Indica abertura de ciclo de acompanhamento sistemático e atendimentos periódicos.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.necessitaAdaptacaoCurricular}
                onChange={(e) =>
                  setForm({
                    ...form,
                    necessitaAdaptacaoCurricular: e.target.checked,
                  })
                }
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="block text-sm font-semibold text-gray-900">
                  Necessita de Adaptação Curricular / PEI (Res. AR 57/2023)
                </span>
                <span className="block text-xs text-gray-600 mt-0.5">
                  Habilita a elaboração do Plano Educacional Individualizado junto aos docentes.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setModoFormulario(false)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm cursor-pointer"
          >
            {salvando
              ? 'Salvando...'
              : estudo
                ? 'Salvar Alterações do Estudo de Caso'
                : 'Concluir e Salvar Estudo de Caso'}
          </button>
        </div>
      </form>
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
          onClick={iniciarCadastro}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          + Registrar Estudo de Caso
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          </div>

          <button
            type="button"
            onClick={() => iniciarEdicao(estudo)}
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
