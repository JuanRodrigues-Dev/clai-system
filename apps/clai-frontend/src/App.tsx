import { Navigate, Route, Routes } from 'react-router-dom'
//import LoginPage from './features/auth/LoginPage'
//import EstudantesListPage from './features/estudantes/EstudantesListPage'
//import EstudanteFormPage from './features/estudantes/EstudanteFormPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/estudantes" element={<EstudantesListPage />} />
      <Route path="/estudantes/novo" element={<EstudanteFormPage />} />
      <Route path="*" element={<Navigate to="/estudantes" replace />} />
    </Routes>
  )
}