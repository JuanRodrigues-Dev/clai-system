import { http } from '../../api/http';
import type {
  PeaRequest,
  PeaResponse,
  PeiRequest,
  PeiResponse,
  PeiUpdateRequest,
  StatusPei,
} from '../../types/documentos';

export const peiService = {
  async buscarPeiPorMatricula(matricula: string): Promise<PeiResponse | null> {
    try {
      const response = await http.get<PeiResponse | PeiResponse[]>(
        `/peis/aluno/${encodeURIComponent(matricula)}`,
      );
      if (Array.isArray(response.data)) {
        return response.data[0] ?? null;
      }
      return response.data ?? null;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return null;
      }
      throw err;
    }
  },

  async criarPei(dados: PeiRequest): Promise<PeiResponse> {
    const response = await http.post<PeiResponse>('/peis', dados);
    return response.data;
  },

  async atualizarPei(id: number, dados: PeiUpdateRequest): Promise<PeiResponse> {
    const response = await http.put<PeiResponse>(`/peis/${id}`, dados);
    return response.data;
  },

  async atualizarStatusPei(
    id: number,
    status: StatusPei | string,
  ): Promise<PeiResponse> {
    const response = await http.put<PeiResponse>(`/peis/${id}/status`, { status });
    return response.data;
  },

  async listarPeasPorPei(peiId: number): Promise<PeaResponse[]> {
    try {
      const response = await http.get<PeaResponse[] | { content: PeaResponse[] }>(
        `/peis/${peiId}/peas`,
      );
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.content ?? [];
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return [];
      }
      throw err;
    }
  },

  async adicionarPea(peiId: number, dados: PeaRequest): Promise<PeaResponse> {
    const response = await http.post<PeaResponse>(`/peis/${peiId}/peas`, dados);
    return response.data;
  },

  async atualizarPea(
    peiId: number,
    peaId: number,
    dados: PeaRequest,
  ): Promise<PeaResponse> {
    const response = await http.put<PeaResponse>(
      `/peis/${peiId}/peas/${peaId}`,
      dados,
    );
    return response.data;
  },
};
