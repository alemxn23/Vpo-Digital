import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData, Gender } from '../types';
import { User, Calendar, Siren, RotateCcw, Lock } from 'lucide-react';

interface PatientInfoProps {
  isLocked?: boolean;
  onNewPatient?: () => void;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ isLocked = false, onNewPatient }) => {
  const { register, watch, setValue, reset } = useFormContext<VPOData>();

  const peso = watch('peso');
  const talla = watch('talla');
  const fechaNacimiento = watch('fechaNacimiento');
  const isPendingDate = watch('fechaCirugiaPendiente');
  const isUrgencia = watch('esUrgencia');

  // Auto-calculate BMI
  useEffect(() => {
    if (peso && talla) {
      const bmi = peso / (talla * talla);
      setValue('imc', parseFloat(bmi.toFixed(2)));
    }
  }, [peso, talla, setValue]);

  // Auto-calculate Age
  useEffect(() => {
    if (fechaNacimiento) {
      const today = new Date();
      const birthDate = new Date(fechaNacimiento);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setValue('edad', age);
    }
  }, [fechaNacimiento, setValue]);

  // Handle Urgency Logic (Visual & Data)
  useEffect(() => {
    if (isUrgencia) {
      setValue('tipoCirugia', 'Urgencia');
    } else {
      setValue('tipoCirugia', 'Electiva');
    }
  }, [isUrgencia, setValue]);

  const handleReset = () => {
    if (onNewPatient) {
      onNewPatient();
    } else {
      // Fallback if no callback provided
      if (confirm("⚠️ ¿Borrar todos los datos e iniciar nuevo paciente?")) {
        localStorage.removeItem('vpo_current_data');
        reset({ fecha: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), genero: Gender.FEMALE } as unknown as VPOData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <User className="text-clinical-navy" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Ficha Paciente</h2>
          {isLocked && (
            <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Lock size={10} /> SOLO LECTURA
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 active:scale-95 transition-all"
        >
          <RotateCcw size={14} />
          + Nuevo Paciente
        </button>
      </div>

      {isLocked && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold">
          <Lock size={16} className="shrink-0 text-amber-500" />
          <span>VPO bloqueado para edición. Usa <b className="underline">+ Nuevo Paciente</b> para iniciar una nueva valoración.</span>
        </div>
      )}

      <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-start relative ${isLocked ? 'opacity-60 pointer-events-none select-none' : ''}`}>

        {/* --- LEFT COLUMN --- */}
        <div className="space-y-4">
          {/* --- NOMBRE --- */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
            <input {...register('nombre')} className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-clinical-navy outline-none" placeholder="Apellido Nombre" />
          </div>

          {/* --- EDAD & NACIMIENTO --- */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <Calendar size={12} /> F. Nacimiento
              </label>
              <input
                type="date"
                {...register('fechaNacimiento')}
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm"
              />
            </div>
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase">Edad (Auto)</label>
              <input
                type="number"
                readOnly
                {...register('edad')}
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-100 text-sm text-center font-bold text-slate-700"
              />
            </div>
          </div>

          {/* --- GÉNERO & NSS --- */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Género</label>
              <select {...register('genero')} className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                <option value={Gender.FEMALE}>Femenino</option>
                <option value={Gender.MALE}>Masculino</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">NSS</label>
              <input {...register('nss')} className="w-full mt-1 p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Cama</label>
              <input {...register('cama')} className="w-full mt-1 p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" placeholder="123-A" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Servicio</label>
              <input {...register('servicioSolicitante')} className="w-full mt-1 p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" placeholder="Ej. Medicina Interna" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Unidad Médica (Hospital)</label>
            <input {...register('unidadMedica')} className="w-full mt-1 p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" placeholder="Ej. Hospital General" />
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="space-y-4">
          {/* --- CIRUGÍA & URGENCIA --- */}
          <div className="border border-gray-100 p-3 rounded-lg bg-gray-50/50">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Fecha de Cirugía</label>

              {/* URGENCY TOGGLE */}
              <label className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-colors ${isUrgencia ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                <input type="checkbox" {...register('esUrgencia')} className="sr-only" />
                <Siren size={14} className={isUrgencia ? 'animate-pulse' : ''} />
                <span className="text-xs font-bold">URGENCIA</span>
              </label>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="date"
                {...register('fechaQx')}
                disabled={isPendingDate}
                className={`flex-1 p-3 border rounded-lg text-sm ${isPendingDate ? 'bg-gray-100 text-gray-400' : 'bg-white border-gray-300'}`}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('fechaCirugiaPendiente')} className="w-4 h-4 text-clinical-navy rounded" />
              <span className="text-xs font-bold text-slate-600">Pendiente / Por programar</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Diagnóstico Qx</label>
            <input {...register('diagnosticoQuirurgico')} className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
            <label className="text-xs font-bold text-gray-500 uppercase mt-2 block">Cirugía Programada</label>
            <input {...register('cirugiaProgramada')} className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
          </div>

          {/* --- ANTROPOMETRÍA --- */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-blue-900">Antropometría</h3>
              <span className="text-xs text-blue-600">IMC Auto-calculado</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-blue-600 uppercase font-bold">Peso (kg)</label>
                <input type="number" step="0.1" {...register('peso', { valueAsNumber: true })} className="w-full mt-1 p-2 border border-blue-200 rounded bg-white text-center font-bold" />
              </div>
              <div>
                <label className="text-[10px] text-blue-600 uppercase font-bold">Talla (m)</label>
                <input type="number" step="0.01" {...register('talla', { valueAsNumber: true })} className="w-full mt-1 p-2 border border-blue-200 rounded bg-white text-center font-bold" />
              </div>
              <div>
                <label className="text-[10px] text-blue-600 uppercase font-bold">IMC</label>
                <div className="w-full mt-1 p-2 bg-blue-800 text-white rounded text-center font-bold">
                  {watch('imc') || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientInfo;