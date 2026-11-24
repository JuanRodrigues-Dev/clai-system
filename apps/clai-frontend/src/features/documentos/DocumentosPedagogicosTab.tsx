import { useCallback, useEffect, useState } from 'react';
import { BookOpenCheck, CheckCircle2, Info, LoaderCircle } from 'lucide-react';
import { acompanhamentoService } from '../acompanhamento/acompanhamentoService';
import { estudoCasoService } from '../estudo-caso/estudoCasoService';
import type { AcompanhamentoResponse } from '../../types/acompanhamento';
import type { EstudoDeCasoResponse } from '../../types/estudoCaso';
import { PlanoAcaoSection } from './PlanoAcaoSection';
import { PeiPeaSection } from './PeiPeaSection';

interface DocumentosPedagogicosTabProps {
  matricula: string;
  nomeEstudante: string;
  cursoEstudante?: string;
}

export function DocumentosPedagogicosTab({
  matricula,
  nomeEstudante,
  cursoEstudante,
}: DocumentosPedagogicosTabProps) {
  const [acompanhamento, setAcompanhamento] = useState<AcompanhamentoResponse | null>(null);
  const [estudoCaso, setEstudoCaso] = useState<EstudoDeCasoResponse | null>(null);
  const [carregandoContexto, setCarregandoContexto] = useState(true);

  const carregarContexto = useCallback(async () => {
    setCarregandoContexto(true);
    try {
      const [acomp, estudo] = await Promise.all([
        acompanhamentoService.buscarPorMatricula(matricula).catch(() => null),
        estudoCasoService.buscarPorMatricula(matricula).catch(() => null),
      ]);
      setAcompanhamento(acomp);
      setEstudoCaso(estudo);
    } finally {
      setCarregandoContexto(false);
    }
  }, [matricula]);

  useEffect(() => {
    void carregarContexto();
  }, [carregarContexto]);

  if (carregandoContexto) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm"
      >
        <LoaderCircle className="size-7 animate-spin text-blue-600" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600">
          Carregando documentação pedagógica do estudante…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Contexto Pedagógico do Estudo de Caso */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <BookOpenCheck className="mt-0.5 size-5 shrink-0 text-blue-600" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hierarquia de Documentos Regulamentares da CLAI (Fases 02 a 04)
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                Fluxo institucional: Identificação &rarr; Estudo de Caso &rarr;{' '}
                <span className="font-semibold text-blue-700">Plano de Ação da CLAI</span> &rarr;
                PEI &amp; PEA por Disciplina (quando indicado) &rarr; RAI Docente.
              </p>
            </div>
          </div>

          {estudoCaso ? (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  estudoCaso.necessitaAcompanhamentoContinuo
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {estudoCaso.necessitaAcompanhamentoContinuo
                  ? 'Acompanhamento Indicado'
                  : 'Sem Acompanhamento Contínuo'}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  estudoCaso.necessitaAdaptacaoCurricular
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Info className="size-3.5" aria-hidden="true" />
                {estudoCaso.necessitaAdaptacaoCurricular
                  ? 'Adaptação Curricular (PEI) Indicada'
                  : 'PEI Não Necessário'}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Estudo de Caso pendente na Aba 1
            </span>
          )}
        </div>
      </div>

      {/* US 12 — Plano de Ação Institucional da CLAI */}
      <PlanoAcaoSection
        matricula={matricula}
        nomeEstudante={nomeEstudante}
        acompanhamento={acompanhamento}
      />

      {/* US 13 — PEI e PEAs por Disciplina (Fase 03) */}
      <PeiPeaSection
        matricula={matricula}
        nomeEstudante={nomeEstudante}
        cursoEstudante={cursoEstudante}
        acompanhamento={acompanhamento}
        necessitaAdaptacaoCurricular={estudoCaso?.necessitaAdaptacaoCurricular}
      />
    </div>
  );
}
