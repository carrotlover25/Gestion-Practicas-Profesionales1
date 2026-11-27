import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { getApiErrorMessage } from '../../services/api';

const inputClass =
  'w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929] transition-colors';
const labelClass =
  'block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5';

export const RegistroPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmar: '',
    creditos_cursados: '0',
    promedio: '3.0',
    semestre: '1',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [campo]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.registrarEstudiante({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        creditos_cursados: Number(form.creditos_cursados),
        promedio: Number(form.promedio),
        semestre: Number(form.semestre),
      });
      // Inicia sesión con la cuenta recién creada
      await login(form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo crear la cuenta. Revisa los datos.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F3] p-6">
      <div className="w-full max-w-md bg-white border border-[#EAE8E2] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#292929] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#C5A04B]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#292929] tracking-tight">
              Crear cuenta de estudiante
            </h1>
            <p className="text-[11px] text-[#777777]">Sistema de Gestión de Prácticas Profesionales</p>
          </div>
        </div>

        {error && <Alert type="error" message={error} className="mb-5" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input className={inputClass} required minLength={3} value={form.nombre} onChange={set('nombre')} placeholder="Luis Mora" />
          </div>
          <div>
            <label className={labelClass}>Correo electrónico</label>
            <input className={inputClass} type="email" required value={form.email} onChange={set('email')} placeholder="usuario@uninorte.edu.co" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Contraseña</label>
              <input className={inputClass} type="password" required value={form.password} onChange={set('password')} placeholder="Mín. 8 caracteres" />
            </div>
            <div>
              <label className={labelClass}>Confirmar</label>
              <input className={inputClass} type="password" required value={form.confirmar} onChange={set('confirmar')} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Créditos</label>
              <input className={inputClass} type="number" min={0} required value={form.creditos_cursados} onChange={set('creditos_cursados')} />
            </div>
            <div>
              <label className={labelClass}>Promedio</label>
              <input className={inputClass} type="number" min={0} max={5} step={0.1} required value={form.promedio} onChange={set('promedio')} />
            </div>
            <div>
              <label className={labelClass}>Semestre</label>
              <input className={inputClass} type="number" min={1} max={14} required value={form.semestre} onChange={set('semestre')} />
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={isLoading} rightIcon={<UserPlus className="w-4 h-4" />}>
            Crear cuenta
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-[#777777]">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-[#8E712B] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
