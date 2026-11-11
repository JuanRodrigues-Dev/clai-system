import { http } from '../../api/http';
import type { EstudoDeCasoRequest, EstudoDeCasoResponse } from '../../types/estudoCaso';

export const estudoCasoService = {
  async buscarPorMatricula(matricula: string): Promise<EstudoDeCasoResponse | null> {
    try {
      const response = await http.get<EstudoDeCasoResponse>(
        `/estudos-caso/aluno/${encodeURIComponent(matricula)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return null;
      }
      throw err;
    }
  },

  async cadastrar(dados: EstudoDeCasoRequest): Promise<EstudoDeCasoResponse> {
    const response = await http.post<EstudoDeCasoResponse>('/estudos-caso', dados);
    return response.data;
  },

  async atualizarPorMatricula(
    matricula: string,
    dados: EstudoDeCasoRequest,
  ): Promise<EstudoDeCasoResponse> {
    const response = await http.put<EstudoDeCasoResponse>(
      `/estudos-caso/aluno/${encodeURIComponent(matricula)}`,
      dados,
    );
    return response.data;
  },
};
