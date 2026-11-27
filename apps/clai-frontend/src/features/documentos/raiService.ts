import { http } from '../../api/http';
import type { RaiRequest, RaiResponse } from '../../types/documentos';

export const raiService = {
  async listarRaisPorPea(peaId: number): Promise<RaiResponse[]> {
    try {
      const response = await http.get<
        RaiResponse | RaiResponse[] | { content: RaiResponse[] }
      >(`/rais/pea/${peaId}`);
      const dados = response.data;
      if (!dados) return [];
      if (Array.isArray(dados)) return dados;
      if ('content' in dados && Array.isArray(dados.content)) {
        return dados.content;
      }
      return [dados as RaiResponse];
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return [];
      }
      throw err;
    }
  },

  async listarPorPea(peaId: number): Promise<RaiResponse[]> {
    return this.listarRaisPorPea(peaId);
  },

  async registrarRai(dados: RaiRequest): Promise<RaiResponse> {
    const response = await http.post<RaiResponse>('/rais', dados);
    return response.data;
  },

  async atualizarRai(id: number, dados: RaiRequest): Promise<RaiResponse> {
    const response = await http.put<RaiResponse>(`/rais/${id}`, dados);
    return response.data;
  },
};
