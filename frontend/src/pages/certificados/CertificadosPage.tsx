import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  GraduationCap,
  Calendar,
  Clock,
  Building2,
  UserCheck,
  Search,
  Filter,
} from 'lucide-react';
import { practicaService } from '../../services/practica.service';
import { evaluacionService } from '../../services/evaluacion.service';
import { horasService } from '../../services/horas.service';
import { Certificado, Evaluacion, Practica, ProgresoHoras } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { getApiErrorMessage } from '../../services/api';

interface PracticaConDetalle extends Practica {
  progreso?: ProgresoHoras | null;
  evaluaciones?: Evaluacion[];
  certificado?: Certificado | null;
  cargandoDetalle?: boolean;
}

export const CertificadosPage: React.FC = () => {
  const [practicas, setPracticas] = useState<PracticaConDetalle[]>([]);
  const [selectedPracticaId, setSelectedPracticaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<'todas' | 'completas' | 'certificadas' | 'pendientes'>('todas');

  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPracticas = async () => {
    try {
      setLoading(true);
      const data = await practicaService.getPracticas();
      
      // Mapear prácticas iniciales
      const practicasConDetalles: PracticaConDetalle[] = data.map((p) => ({
        ...p,
        progreso: null,
        evaluaciones: [],
        certificado: null,
        cargandoDetalle: true,
      }));
      setPracticas(practicasConDetalles);

      if (practicasConDetalles.length > 0) {
        setSelectedPracticaId(practicasConDetalles[0].id);
      }

      // Cargar detalles de horas, evaluaciones y certificado en paralelo
      const detallesActualizados = await Promise.all(
        data.map(async (p) => {
          try {
            const [progRes, evalsRes, certRes] = await Promise.all([
              horasService.getProgreso(p.id).catch(() => null),
              evaluacionService.getEvaluaciones(p.id).catch(() => []),
              evaluacionService.getCertificado(p.id).catch(() => null),
            ]);
            return {
              ...p,
              progreso: progRes,
              evaluaciones: evalsRes,
              certificado: certRes,
              cargandoDetalle: false,
            };
          } catch {
            return {
              ...p,
              cargandoDetalle: false,
            };
          }
        })
      );

      setPracticas(detallesActualizados);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al consultar las prácticas del sistema.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticas();
  }, []);

  const selectedPractica = practicas.find((p) => p.id === selectedPracticaId) || practicas[0] || null;

  const handleGenerarCertificado = async (practicaId: number) => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const nuevoCert = await evaluacionService.generarCertificado(practicaId);
      setMessage({
        type: 'success',
        text: `¡Certificado expedido con éxito para la práctica #${practicaId}!`,
      });

      // Actualizar estado local
      setPracticas((prev) =>
        prev.map((p) =>
          p.id === practicaId
            ? { ...p, certificado: nuevoCert, estado: 'cerrada' }
            : p
        )
      );
    } catch (err) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(
          err,
          'No se pudo generar el certificado. Comprueba que las horas requeridas estén al 100% confirmadas y existan las dos evaluaciones requeridas.'
        ),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtrado
  const practicasFiltradas = practicas.filter((p) => {
    const matchesSearch =
      p.id.toString().includes(searchTerm) ||
      (p.observaciones && p.observaciones.toLowerCase().includes(searchTerm.toLowerCase()));

    const estaCompleta = p.progreso?.completada || false;
    const tieneCertificado = !!p.certificado;

    if (!matchesSearch) return false;

    if (filterState === 'completas') return estaCompleta && !tieneCertificado;
    if (filterState === 'certificadas') return tieneCertificado;
    if (filterState === 'pendientes') return !estaCompleta && !tieneCertificado;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C5A04B]" />
            <h1 className="text-xl font-semibold text-[#292929]">
              Generación de Certificados de Práctica
            </h1>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Revisión formal de requisitos de cierre, horas completadas y emisión de certificados oficiales.
          </p>
        </div>

        {selectedPractica && selectedPractica.certificado && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5 text-[#C5A04B]" />}
          >
            Imprimir / Guardar Certificado
          </Button>
        )}
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Listado de Prácticas */}
        <div className="lg:col-span-5 space-y-4">
          <Card padding="md">
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#A0A0A0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por ID u observación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B]"
                />
              </div>

              {/* Filtros rápidos */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setFilterState('todas')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterState === 'todas'
                      ? 'bg-[#292929] text-white font-medium'
                      : 'bg-[#F5F5F3] text-[#777777] hover:bg-[#EAE8E2]'
                  }`}
                >
                  Todas ({practicas.length})
                </button>
                <button
                  onClick={() => setFilterState('completas')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterState === 'completas'
                      ? 'bg-[#C5A04B] text-white font-medium'
                      : 'bg-[#F5F5F3] text-[#777777] hover:bg-[#EAE8E2]'
                  }`}
                >
                  Listas para Certificar
                </button>
                <button
                  onClick={() => setFilterState('certificadas')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterState === 'certificadas'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-[#F5F5F3] text-[#777777] hover:bg-[#EAE8E2]'
                  }`}
                >
                  Certificadas
                </button>
              </div>
            </div>
          </Card>

          {/* Listado con selector */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#777777]">
                <div className="w-6 h-6 border-2 border-[#EAE8E2] border-t-[#C5A04B] rounded-full animate-spin mx-auto mb-2" />
                Cargando prácticas...
              </div>
            ) : practicasFiltradas.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#777777] bg-white rounded-xl border border-[#EAE8E2]">
                No se encontraron prácticas con los filtros seleccionados.
              </div>
            ) : (
              practicasFiltradas.map((pr) => {
                const isSelected = selectedPractica?.id === pr.id;
                const estaCompleta = pr.progreso?.completada || false;
                const tieneCertificado = !!pr.certificado;

                return (
                  <div
                    key={pr.id}
                    onClick={() => setSelectedPracticaId(pr.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-[#C5A04B] bg-[#FDFBF4] shadow-sm'
                        : 'border-[#EAE8E2] bg-white hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-[#292929]">
                        Práctica #{pr.id}
                      </span>
                      <StatusBadge status={pr.estado} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#777777] mb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C5A04B]" />
                        <span>
                          {pr.progreso
                            ? `${pr.progreso.horas_confirmadas} / ${pr.horas_requeridas}h`
                            : `${pr.horas_requeridas}h req.`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#C5A04B]" />
                        <span>
                          {pr.evaluaciones ? `${pr.evaluaciones.length} / 2 evals` : '0 / 2 evals'}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    {pr.progreso && (
                      <div className="w-full bg-[#EAE8E2] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pr.progreso.completada ? 'bg-emerald-600' : 'bg-[#C5A04B]'
                          }`}
                          style={{ width: `${Math.min(pr.progreso.porcentaje, 100)}%` }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EAE8E2]/60 text-[10px]">
                      <span className="text-[#777777]">
                        {tieneCertificado
                          ? '✓ Certificado emitido'
                          : estaCompleta
                          ? '★ Lista para emisión'
                          : 'Horas en curso'}
                      </span>
                      <span
                        className={`font-semibold ${
                          tieneCertificado
                            ? 'text-emerald-700'
                            : estaCompleta
                            ? 'text-[#C5A04B]'
                            : 'text-[#777777]'
                        }`}
                      >
                        {tieneCertificado ? 'CERRADA' : `${pr.progreso?.porcentaje || 0}%`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Columna Derecha: Detalle de la Práctica y Emisión / Vista del Certificado */}
        <div className="lg:col-span-7">
          {selectedPractica ? (
            <div className="space-y-6">
              {/* Tarjeta de Verificación de Requisitos */}
              <Card
                header={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#C5A04B]" />
                      <span className="font-semibold text-xs text-[#292929]">
                        Validación de Requisitos – Práctica #{selectedPractica.id}
                      </span>
                    </div>
                    <StatusBadge status={selectedPractica.estado} />
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Requisitos Check */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Horas completas */}
                    <div className="p-3 rounded-lg border border-[#EAE8E2] bg-[#FAFAF8]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-[#292929]">
                          Horas Confirmadas
                        </span>
                        {selectedPractica.progreso?.completada ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#292929]">
                        {selectedPractica.progreso?.horas_confirmadas || 0} /{' '}
                        {selectedPractica.horas_requeridas} h
                      </p>
                      <span className="text-[10px] text-[#777777]">
                        {selectedPractica.progreso?.completada
                          ? '100% cumplimiento'
                          : `Faltan ${
                              selectedPractica.horas_requeridas -
                              (selectedPractica.progreso?.horas_confirmadas || 0)
                            } horas`}
                      </span>
                    </div>

                    {/* Evaluaciones completas */}
                    <div className="p-3 rounded-lg border border-[#EAE8E2] bg-[#FAFAF8]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-[#292929]">
                          Evaluaciones
                        </span>
                        {selectedPractica.evaluaciones &&
                        selectedPractica.evaluaciones.length >= 2 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#292929]">
                        {selectedPractica.evaluaciones?.length || 0} de 2
                      </p>
                      <span className="text-[10px] text-[#777777]">
                        {selectedPractica.evaluaciones && selectedPractica.evaluaciones.length >= 2
                          ? 'Empresa y Practicante'
                          : 'Pendiente calificación'}
                      </span>
                    </div>

                    {/* Estado del Certificado */}
                    <div className="p-3 rounded-lg border border-[#EAE8E2] bg-[#FAFAF8]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-[#292929]">
                          Certificado
                        </span>
                        {selectedPractica.certificado ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#C5A04B]" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#292929]">
                        {selectedPractica.certificado ? 'Emitido' : 'Por Emitir'}
                      </p>
                      <span className="text-[10px] text-[#777777]">
                        {selectedPractica.certificado
                          ? selectedPractica.certificado.fecha_emision
                          : 'Pendiente de firma'}
                      </span>
                    </div>
                  </div>

                  {/* Botón de Emisión si no tiene certificado */}
                  {!selectedPractica.certificado ? (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FDFBF4] p-4 rounded-xl border border-[#E9DDBD]">
                      <div>
                        <h4 className="text-xs font-semibold text-[#292929]">
                          Emisión de Certificado Oficial
                        </h4>
                        <p className="text-[11px] text-[#777777]">
                          Al generar el certificado, la práctica pasa a estado "Cerrada" y se notifica formalmente al estudiante y a la empresa.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="md"
                        isLoading={isGenerating}
                        disabled={
                          !selectedPractica.progreso?.completada ||
                          (selectedPractica.evaluaciones?.length || 0) < 2
                        }
                        onClick={() => handleGenerarCertificado(selectedPractica.id)}
                        leftIcon={<Award className="w-4 h-4" />}
                      >
                        Generar Certificado
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>

              {/* Vista Oficial del Certificado si ya está emitido */}
              {selectedPractica.certificado ? (
                <Card goldAccent className="p-6 sm:p-10 bg-white shadow-card">
                  <div className="flex justify-between items-center mb-4 no-print">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Certificado Registrado Oficialmente
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      leftIcon={<Printer className="w-3.5 h-3.5 text-[#C5A04B]" />}
                    >
                      Imprimir Documento
                    </Button>
                  </div>

                  {/* Diploma Universitario */}
                  <div className="border-2 border-[#E9DDBD] p-8 sm:p-12 rounded-xl bg-[#FAFAF8] relative overflow-hidden text-center text-[#292929]">
                    <div className="w-14 h-14 rounded-full bg-[#F7EDD8] border border-[#E9DDBD] flex items-center justify-center mx-auto mb-4 text-[#C5A04B]">
                      <GraduationCap className="w-7 h-7" />
                    </div>

                    <p className="text-[11px] uppercase tracking-widest text-[#8E712B] font-bold mb-1">
                      República de Colombia • Institución de Educación Superior
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#292929] mb-4">
                      SISTEMA DE GESTIÓN DE PRÁCTICAS PROFESIONALES
                    </h2>

                    <div className="w-24 h-0.5 bg-[#C5A04B] mx-auto mb-6" />

                    <p className="text-xs text-[#777777] mb-2">
                      La Coordinación de Prácticas Profesionales y Desarrollo Institucional hace constar que:
                    </p>

                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#292929] mb-2">
                      {selectedPractica.certificado.estudiante_nombre}
                    </h3>

                    <p className="text-xs text-[#777777] max-w-lg mx-auto leading-relaxed mb-6">
                      ha culminado satisfactoriamente su proceso de práctica profesional en la organización{' '}
                      <strong className="text-[#292929]">
                        {selectedPractica.certificado.empresa_nombre}
                      </strong>{' '}
                      en la posición correspondiente a la vacante{' '}
                      <strong className="text-[#292929]">
                        "{selectedPractica.certificado.vacante_titulo}"
                      </strong>
                      , habiendo cumplido con rigor{' '}
                      <strong className="text-[#292929]">
                        {selectedPractica.certificado.horas_totales} horas
                      </strong>{' '}
                      de formación técnica y profesional con calificación destacada.
                    </p>

                    <div className="mt-8 pt-6 border-t border-[#EAE8E2] grid grid-cols-2 gap-6 max-w-md mx-auto text-center">
                      <div>
                        <div className="w-32 border-b border-[#292929] mx-auto mb-2" />
                        <p className="text-[11px] font-semibold text-[#292929]">
                          Coordinación Académica
                        </p>
                        <p className="text-[9px] text-[#777777]">Validador Institucional</p>
                      </div>
                      <div>
                        <div className="w-32 border-b border-[#292929] mx-auto mb-2" />
                        <p className="text-[11px] font-semibold text-[#292929]">
                          Fecha de Expedición
                        </p>
                        <p className="text-[9px] text-[#777777]">
                          {selectedPractica.certificado.fecha_emision}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="p-8 text-center text-xs text-[#777777] bg-[#FAFAF8] rounded-xl border border-dashed border-[#EAE8E2]">
                  <Award className="w-10 h-10 text-[#C5A04B]/50 mx-auto mb-2" />
                  <p className="font-medium text-[#292929]">
                    Esta práctica aún no cuenta con certificado emitido.
                  </p>
                  <p className="mt-1">
                    Cuando el practicante cumpla las horas requeridas y ambas partes registren sus evaluaciones, podrás generarlo con un solo clic.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-[#777777] bg-white rounded-xl border border-[#EAE8E2]">
              Selecciona una práctica de la columna izquierda para revisar requisitos y emitir el certificado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};