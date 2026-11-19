import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/LoginPage'
import MeuPerfilPage from './features/auth/MeuPerfilPage'
import ProtectedRoute from './features/auth/ProtectedRoute'
import Layout from './shared/Layout'
import InicioPage from './features/inicio/InicioPage'
import EstudantesListPage from './features/estudantes/EstudantesListPage'
import EstudanteFormPage from './features/estudantes/EstudanteFormPage'
import EstudanteDetalhePage from './features/estudantes/EstudanteDetalhePage'
import InformacoesAcademicasPage from './features/academico/InformacoesAcademicasPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/inicio" element={<InicioPage />} />
          <Route path="/estudantes" element={<EstudantesListPage />} />
          <Route path="/estudantes/novo" element={<EstudanteFormPage />} />
          <Route path="/estudantes/:matricula" element={<EstudanteDetalhePage />} />
          <Route path="/estudantes/:matricula/editar" element={<EstudanteFormPage />} />
          <Route path="/informacoes-academicas" element={<InformacoesAcademicasPage />} />
          <Route path="/perfil" element={<MeuPerfilPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/estudantes" replace />} />
    </Routes>
  )
}
