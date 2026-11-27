import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Briefcase, CalendarCheck, FileCheck, FileText, GraduationCap,
  Home, Layers, PlusCircle, ShieldAlert, Users, Award, Bell, X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Rol } from '../types';

interface SidebarProps { isOpen: boolean; onClose: () => void; }
interface NavItem { name: string; to: string; icon: React.ReactNode; }

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const getNavLinks = (userRole: Rol | null): NavItem[] => {
    switch (userRole) {
      case 'estudiante': return [
        { name: 'Mi Panel', to: '/dashboard', icon: <Home className="w-4 h-4" /> },
        { name: 'Vacantes', to: '/vacantes', icon: <Briefcase className="w-4 h-4" /> },
        { name: 'Mis Postulaciones', to: '/mis-postulaciones', icon: <Layers className="w-4 h-4" /> },
        { name: 'Control de Horas', to: '/control-horas', icon: <CalendarCheck className="w-4 h-4" /> },
        { name: 'Incidencias', to: '/incidencias', icon: <ShieldAlert className="w-4 h-4" /> },
        { name: 'Evaluaciones', to: '/evaluaciones', icon: <Award className="w-4 h-4" /> },
        { name: 'Notificaciones', to: '/notificaciones', icon: <Bell className="w-4 h-4" /> },
      ];
      case 'empresa': return [
        { name: 'Panel Empresa', to: '/dashboard', icon: <Home className="w-4 h-4" /> },
        { name: 'Mis Vacantes', to: '/vacantes', icon: <Briefcase className="w-4 h-4" /> },
        { name: 'Publicar Vacante', to: '/vacantes/crear', icon: <PlusCircle className="w-4 h-4" /> },
        { name: 'Control de Horas', to: '/control-horas', icon: <CalendarCheck className="w-4 h-4" /> },
        { name: 'Prácticas Activas', to: '/practicas', icon: <Users className="w-4 h-4" /> },
        { name: 'Evaluaciones', to: '/evaluaciones', icon: <Award className="w-4 h-4" /> },
        { name: 'Incidencias', to: '/incidencias', icon: <ShieldAlert className="w-4 h-4" /> },
        { name: 'Notificaciones', to: '/notificaciones', icon: <Bell className="w-4 h-4" /> },
      ];
      case 'coordinador': return [
        { name: 'Panel Coordinación', to: '/dashboard', icon: <Home className="w-4 h-4" /> },
        { name: 'Vacantes', to: '/vacantes', icon: <FileCheck className="w-4 h-4" /> },
        { name: 'Prácticas', to: '/practicas', icon: <GraduationCap className="w-4 h-4" /> },
        { name: 'Certificados', to: '/certificados', icon: <Award className="w-4 h-4" /> },
        { name: 'Incidencias', to: '/incidencias', icon: <ShieldAlert className="w-4 h-4" /> },
        { name: 'Notificaciones', to: '/notificaciones', icon: <Bell className="w-4 h-4" /> },
      ];
      case 'gestor': return [
        { name: 'Centro de Casos', to: '/dashboard', icon: <Home className="w-4 h-4" /> },
        { name: 'Bandeja de Incidencias', to: '/incidencias', icon: <ShieldAlert className="w-4 h-4" /> },
        { name: 'Notificaciones', to: '/notificaciones', icon: <Bell className="w-4 h-4" /> },
      ];
      default: return [];
    }
  };

  const navLinks = getNavLinks(role);

  const roleLabels: Partial<Record<Rol, string>> = {
    estudiante: 'Estudiante',
    empresa: 'Empresa',
    coordinador: 'Coordinación',
    gestor: 'Gestor',
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#EAE8E2] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#EAE8E2]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#292929] flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-[#C5A04B]" />
            </div>
            <div>
              <span className="font-semibold text-sm text-[#292929] tracking-tight">SGP</span>
              <span className="block text-[10px] text-[#777777] leading-tight">Prácticas Profesionales</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-[#777777] hover:text-[#292929] hover:bg-[#F5F5F3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role label */}
        <div className="px-5 py-2.5 border-b border-[#EAE8E2] bg-[#FAFAF8] flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#777777]">
            Rol
          </span>
          <span className="text-[11px] font-medium text-[#8E712B] bg-[#F7EDD8] px-2 py-0.5 rounded border border-[#E9DDBD]">
            {roleLabels[role as Rol] || 'Usuario'}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-[#F7EDD8] text-[#8E712B] font-semibold'
                    : 'text-[#777777] hover:text-[#292929] hover:bg-[#F5F5F3] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-[#C5A04B]' : 'text-[#A0A0A0]'}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#EAE8E2] bg-[#FAFAF8]">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#A0A0A0]" />
            <span className="text-[11px] text-[#A0A0A0]">Portal Oficial · Uninorte</span>
          </div>
        </div>
      </aside>
    </>
  );
};
