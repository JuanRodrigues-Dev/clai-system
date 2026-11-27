import { http } from '../../api/http';
import type { EstudoDeCasoRequest, EstudoDeCasoResponse } from '../../types/estudoCaso';

interface BackendEstudoDeCasoPayload {
  matriculaAluno: string;
  dataRealizacao: string;
  participantes: string;
  historicoEscolar: string | null;
  historicoFamiliar: string | null;
  barreirasDificuldades: string | null;
  potencialidades: string | null;
  necessidadesSuporte: string | null;
  necessitaAcompanhamento: boolean;
  necessitaAdaptacaoCurricular: boolean;
  conclusoes: string | null;
  encaminhamentos: string | null;
}

interface BackendEstudoDeCasoResponse extends BackendEstudoDeCasoPayload {
  id: number;
  alunoId?: string;
  nomeAluno?: string;
  cursoAluno?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

interface MetadadosExtrasEstudoCaso {
  periodoLetivo?: string;
  periodoIngresso?: string;
  nomeResponsavel?: string | null;
  parentescoResponsavel?: string | null;
  telefoneResponsavel?: string | null;
  emailResponsavel?: string | null;
  possuiComorbidade?: boolean;
  quaisComorbidades?: string | null;
  usaMedicacaoContinua?: boolean;
  quaisMedicacoes?: string | null;
  frequentaServicosApoio?: boolean;
  quaisServicosApoio?: string | null;
  apresentouDocumentosComprobatorios?: boolean;
  quaisDocumentosComprobatorios?: string | null;
}

function paraPayloadBackend(dados: EstudoDeCasoRequest): BackendEstudoDeCasoPayload {
  const metadados: MetadadosExtrasEstudoCaso = {
    periodoLetivo: dados.periodoLetivo,
    periodoIngresso: dados.periodoIngresso,
    nomeResponsavel: dados.nomeResponsavel ?? null,
    parentescoResponsavel: dados.parentescoResponsavel ?? null,
    telefoneResponsavel: dados.telefoneResponsavel ?? null,
    emailResponsavel: dados.emailResponsavel ?? null,
    possuiComorbidade: Boolean(dados.possuiComorbidade),
    quaisComorbidades: dados.quaisComorbidades ?? null,
    usaMedicacaoContinua: Boolean(dados.usaMedicacaoContinua),
    quaisMedicacoes: dados.quaisMedicacoes ?? null,
    frequentaServicosApoio: Boolean(dados.frequentaServicosApoio),
    quaisServicosApoio: dados.quaisServicosApoio ?? null,
    apresentouDocumentosComprobatorios: Boolean(dados.apresentouDocumentosComprobatorios),
    quaisDocumentosComprobatorios: dados.quaisDocumentosComprobatorios ?? null,
  };

  const historicoEscolar = [
    dados.periodoLetivo ? `Período letivo: ${dados.periodoLetivo}` : null,
    dados.periodoIngresso ? `Período de ingresso: ${dados.periodoIngresso}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const historicoFamiliar = [
    dados.nomeResponsavel ? `Responsável: ${dados.nomeResponsavel}` : null,
    dados.parentescoResponsavel ? `Parentesco: ${dados.parentescoResponsavel}` : null,
    dados.telefoneResponsavel ? `Telefone: ${dados.telefoneResponsavel}` : null,
    dados.emailResponsavel ? `E-mail: ${dados.emailResponsavel}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    matriculaAluno: dados.matriculaAluno,
    dataRealizacao: dados.dataRealizacao,
    participantes: dados.participantes,
    historicoEscolar: historicoEscolar || null,
    historicoFamiliar: historicoFamiliar || null,
    necessidadesSuporte: dados.identificacaoNecessidadesEspecificas || null,
    potencialidades: dados.avancosDificuldadesPotencialidades || null,
    barreirasDificuldades: dados.principaisDemandasIdentificadas || null,
    encaminhamentos: dados.propostasIniciaisIntervencao || null,
    necessitaAcompanhamento: Boolean(dados.necessitaAcompanhamentoContinuo),
    necessitaAdaptacaoCurricular: Boolean(dados.necessitaAdaptacaoCurricular),
    conclusoes: JSON.stringify(metadados),
  };
}

function deResponseBackend(raw: BackendEstudoDeCasoResponse): EstudoDeCasoResponse {
  let extras: MetadadosExtrasEstudoCaso = {};
  if (raw.conclusoes) {
    try {
      const parsed = JSON.parse(raw.conclusoes) as unknown;
      if (parsed && typeof parsed === 'object') {
        extras = parsed as MetadadosExtrasEstudoCaso;
      }
    } catch {
      extras = {};
    }
  }

  return {
    id: raw.id,
    matriculaAluno: raw.matriculaAluno,
    nomeAluno: raw.nomeAluno ?? '',
    cursoAluno: raw.cursoAluno ?? '',
    dataRealizacao: raw.dataRealizacao,
    periodoLetivo: extras.periodoLetivo ?? '2026.2',
    periodoIngresso: extras.periodoIngresso ?? '2026.1',
    participantes: raw.participantes ?? '',
    nomeResponsavel: extras.nomeResponsavel ?? '',
    parentescoResponsavel: extras.parentescoResponsavel ?? '',
    telefoneResponsavel: extras.telefoneResponsavel ?? '',
    emailResponsavel: extras.emailResponsavel ?? '',
    possuiComorbidade: Boolean(extras.possuiComorbidade),
    quaisComorbidades: extras.quaisComorbidades ?? '',
    usaMedicacaoContinua: Boolean(extras.usaMedicacaoContinua),
    quaisMedicacoes: extras.quaisMedicacoes ?? '',
    frequentaServicosApoio: Boolean(extras.frequentaServicosApoio),
    quaisServicosApoio: extras.quaisServicosApoio ?? '',
    apresentouDocumentosComprobatorios: Boolean(extras.apresentouDocumentosComprobatorios),
    quaisDocumentosComprobatorios: extras.quaisDocumentosComprobatorios ?? '',
    identificacaoNecessidadesEspecificas:
      raw.necessidadesSuporte ?? raw.historicoEscolar ?? '',
    avancosDificuldadesPotencialidades: raw.potencialidades ?? '',
    principaisDemandasIdentificadas: raw.barreirasDificuldades ?? '',
    propostasIniciaisIntervencao: raw.encaminhamentos ?? '',
    necessitaAcompanhamentoContinuo: Boolean(raw.necessitaAcompanhamento),
    necessitaAdaptacaoCurricular: Boolean(raw.necessitaAdaptacaoCurricular),
    criadoEm: raw.criadoEm ?? '',
    atualizadoEm: raw.atualizadoEm ?? '',
  };
}

export const estudoCasoService = {
  async buscarPorMatricula(matricula: string): Promise<EstudoDeCasoResponse | null> {
    try {
      const response = await http.get<BackendEstudoDeCasoResponse>(
        `/estudos-caso/aluno/${encodeURIComponent(matricula)}`,
      );
      return deResponseBackend(response.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return null;
      }
      throw err;
    }
  },

  async cadastrar(dados: EstudoDeCasoRequest): Promise<EstudoDeCasoResponse> {
    const response = await http.post<BackendEstudoDeCasoResponse>(
      '/estudos-caso',
      paraPayloadBackend(dados),
    );
    return deResponseBackend(response.data);
  },

  async atualizarPorMatricula(
    matricula: string,
    dados: EstudoDeCasoRequest,
  ): Promise<EstudoDeCasoResponse> {
    const response = await http.put<BackendEstudoDeCasoResponse>(
      `/estudos-caso/aluno/${encodeURIComponent(matricula)}`,
      paraPayloadBackend(dados),
    );
    return deResponseBackend(response.data);
  },
};
