import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  Building2,
  UserCheck,
  LifeBuoy,
  BookOpen,
  Award,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { getApiErrorMessage } from '../../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Credenciales inválidas. Por favor verifica tu correo y contraseña.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Clave123!');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F5F5F3]">
      {/* Left side: Login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-white border-r border-[#EAE8E2]">
        {/* Brand header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292929] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#C5A04B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg text-[#292929] tracking-tight">SGP</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F7EDD8] text-[#8E712B] border border-[#E9DDBD]">
                Portal Institucional
              </span>
            </div>
            <p className="text-[11px] text-[#777777]">
              Sistema de Gestión de Prácticas Profesionales
            </p>
          </div>
        </div>

        {/* Center: Main Form */}
        <div className="max-w-sm w-full mx-auto my-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[#292929] tracking-tight mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-[#777777] leading-relaxed">
              Ingresa con tus credenciales universitarias o empresariales para acceder al sistema.
            </p>
          </div>

          {error && <Alert type="error" message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@uninorte.edu.co"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#292929]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<LogIn className="w-4 h-4" />}
            >
              Ingresar al Sistema
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-[#777777]">
            ¿Eres estudiante y no tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-[#8E712B] hover:underline">
              Regístrate aquí
            </Link>
          </p>

          {/* Quick switcher */}
          <div className="mt-8 pt-6 border-t border-[#EAE8E2]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#777777] mb-2.5">
              Accesos rápidos para pruebas:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillTestAccount('estudiante@uninorte.edu.co')}
                className="flex items-center gap-2 p-2 rounded-lg border border-[#EAE8E2] hover:border-[#C5A04B] hover:bg-[#FDFBF4] text-left transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#C5A04B] shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-[#292929] text-[11px] truncate">Estudiante</p>
                  <p className="text-[10px] text-[#777777] truncate">Ana Pérez</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillTestAccount('empresa@acme.com')}
                className="flex items-center gap-2 p-2 rounded-lg border border-[#EAE8E2] hover:border-[#C5A04B] hover:bg-[#FDFBF4] text-left transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-[#C5A04B] shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-[#292929] text-[11px] truncate">Empresa</p>
                  <p className="text-[10px] text-[#777777] truncate">ACME S.A.S.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillTestAccount('coordinador@uninorte.edu.co')}
                className="flex items-center gap-2 p-2 rounded-lg border border-[#EAE8E2] hover:border-[#C5A04B] hover:bg-[#FDFBF4] text-left transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#C5A04B] shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-[#292929] text-[11px] truncate">Coordinador</p>
                  <p className="text-[10px] text-[#777777] truncate">Carlos Gómez</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillTestAccount('gestor@uninorte.edu.co')}
                className="flex items-center gap-2 p-2 rounded-lg border border-[#EAE8E2] hover:border-[#C5A04B] hover:bg-[#FDFBF4] text-left transition-colors"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-[#C5A04B] shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-[#292929] text-[11px] truncate">Gestor</p>
                  <p className="text-[10px] text-[#777777] truncate">Laura Ríos</p>
                </div>
              </button>
            </div>
            <p className="text-[10px] text-[#A0A0A0] mt-2 text-center">
              Clave general: <code className="text-[#8E712B] font-semibold">Clave123!</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-[#777777] flex items-center justify-between border-t border-[#EAE8E2] pt-4">
          <span>&copy; {new Date().getFullYear()} SGP · Universidad del Norte</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#C5A04B]" />
            Entorno Seguro
          </span>
        </div>
      </div>

      {/* Right side: University prestige showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#292929] p-12 lg:p-16 flex-col justify-between text-white relative">
        <div className="flex justify-end">
          <div className="px-3.5 py-1 rounded-full bg-white/10 border border-[#C5A04B]/30 text-xs text-[#E9DDBD] flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-[#C5A04B]" />
            Supervisión Académica Oficial
          </div>
        </div>

        <div className="max-w-md my-auto space-y-6">
          <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-[#C5A04B]">
            <BookOpen className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-3xl font-semibold text-white leading-tight">
              Vinculación profesional con rigor institucional.
            </h2>
            <p className="mt-3 text-sm text-[#A0A0A0] leading-relaxed">
              Supervisión de créditos, validación de horas en bitácora, resolución de incidencias y certificación universitaria oficial.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xl font-bold text-[#C5A04B] block mb-1">
                100%
              </span>
              <p className="text-xs text-[#A0A0A0]">
                Trazabilidad y validación institucional de horas.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xl font-bold text-[#C5A04B] block mb-1">
                4 Roles
              </span>
              <p className="text-xs text-[#A0A0A0]">
                Estudiante, Empresa, Coordinación y Gestor en sincronía.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-white/10 text-xs text-[#A0A0A0]">
          <div className="w-8 h-8 rounded-full border border-[#C5A04B]/40 flex items-center justify-center bg-white/5 text-[#C5A04B] font-bold text-xs">
            UN
          </div>
          <div>
            <p className="text-white font-medium">Dirección de Prácticas Profesionales</p>
            <p className="text-[10px] text-[#777777]">Comité de Coordinación Académica</p>
          </div>
        </div>
      </div>
    </div>
  );
};
