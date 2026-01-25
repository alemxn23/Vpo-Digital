import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData, Gender } from '../types';
import { User, Calendar, Siren, RotateCcw } from 'lucide-react';

const PatientInfo: React.FC = () => {
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
      if(confirm("⚠️ ¿Desea borrar todos los datos e iniciar un nuevo paciente?\n\nEsta acción no se puede deshacer.")) {
          // Clear persistence
          localStorage.removeItem('vpo_current_data');
          
          // Construct a clean initial state
          const resetValues: VPOData = {
              fecha: new Date().toISOString().split('T')[0],
              hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              genero: Gender.FEMALE,
              tipoCirugia: "Electiva",
              ayuno: "Ayuno de 6-8 horas para sólidos y 2 horas para líquidos claros.",
              soluciones: "Solución Hartmann 1000cc para 8 horas.",
              tabaquismo: false,
              cigarrosDia: 0,
              aniosFumando: 0,
              indiceTabaquico: 0,
              riesgoEPOC: "",
              alergicos: false,
              alergicosDetalle: "",
              hta: false,
              hta_control: "controlada",
              hta_tiempo: "",
              diabetes: false,
              diabetesTipo: "",
              diabetesTiempo: "",
              usaInsulina: false,
              cardiopatiaIsquemica: false,
              cardio_tipo_evento: "angina_estable",
              cardio_fecha_evento: "",
              icc: false,
              icc_nyha: "I",
              icc_evolucion: "cronica_comp",
              icc_historia_eap: false,
              icc_fecha_eap: "",
              arritmias: false,
              arritmia_tipo: "otra",
              marcapasos: false,
              valvulopatia: false,
              valvula_afectada: "aortica",
              valvula_patologia: "estenosis",
              valvula_severidad: "leve",
              evc: false,
              evc_fecha: "",
              evc_tipo: "isquemico",
              evc_secuelas: false,
              neumopatia: false,
              neumo_tipo: "epoc",
              neumo_o2: false,
              enfRenalCronica: false,
              erc_estadio: "G1",
              erc_dialisis: false,
              hepatopatia: false,
              hepato_tipo: "higado_graso",
              hepato_child: "A",
              hepato_coagulopatia: false,
              coagulopatia: false,
              coag_tipo: "",
              flag_iam_reciente: false,
              flag_iam_antiguo: false,
              flag_angina_inestable: false,
              flag_estenosis_aortica_severa: false,
              flag_eap_agudo: false,
              flag_evc_agudo: false,
              functional_status: "independent",
              gupta_surgical_site: "other",
              cirugiasPrevias: "",
              otrasEnfermedades: "",
              tratamientoActual: "",
              selectedMeds: [],
              taSistolica: 0,
              taDiastolica: 0,
              fc: 0,
              fr: 0,
              temp: 0,
              sato2: 0,
              glucosaCapilar: 0,
              exploracion_ingurgitacion: false,
              exploracion_s3: false,
              exploracion_estertores: false,
              exploracion_estenosis_aortica: false,
              exploracion_edema: false,
              exploracion_soplo_carotideo: false,
              hb: 0,
              ht: 0,
              leucocitos: 0,
              plaquetas: 0,
              tp: 0,
              ttp: 0,
              inr: 0,
              glucosaCentral: 0,
              urea: 0,
              creatinina: 0,
              na: 0,
              k: 0,
              cl: 0,
              tfg: 0,
              rx_fecha: "",
              rx_imagen: "",
              rx_descripcion: "",
              ariscat_infeccion: false,
              ariscat_incision: "periferica",
              ariscat_duracion: "menos_2",
              ariscat_total: 0,
              ariscat_categoria: "",
              ecg_fecha: "",
              ecg_frecuencia: 0,
              ecg_ritmo_especifico: "Sinusal",
              ecg_bloqueo: "Ninguno",
              ecg_hvi: false,
              ecg_brihh_incompleto: false,
              ecg_brihh_completo: false,
              ecg_isquemia: false,
              ecg_extrasistoles: false,
              ecg_otras_alteraciones: "",
              duke_mayor_hemocultivo: false,
              duke_mayor_eco: false,
              duke_mayor_regurgitacion: false,
              duke_menor_predisposicion: false,
              duke_menor_fiebre: false,
              duke_menor_vascular: false,
              duke_menor_inmuno: false,
              duke_menor_micro: false,
              duke_resultado: "Rechazado",
              duke_manual_add: false,
              ritmo: "",
              frecuenciaEcg: 0,
              asa: "I",
              goldman: "I",
              detsky: "I",
              caprini: 0,
              lee: "I",
              gupta: 0,
              asa_manual_class: "",
              asa_justification: "",
              risk_overrides: {},
              capA_cxMenor: false,
              capA_cxMayorAnt: false,
              capA_varices: false,
              capA_eii: false,
              capA_iam: false,
              capA_epoc: false,
              capA_reposo: false,
              capB_cxMayor: false,
              capB_laparoscopia: false,
              capB_confinado: false,
              capB_ferula: false,
              capB_cancer: false,
              capB_cateter: false,
              capC_historiaTVP: false,
              capC_historiaFam: false,
              capC_leiden: false,
              capC_lupico: false,
              capC_hit: false,
              capD_evc: false,
              capD_artroplastia: false,
              capD_fxCadera: false,
              capD_trauma: false,
              plan_pre: "",
              plan_trans: "",
              plan_post: "",
              antibioticos: "",
              tromboprofilaxis: "",
              recomendacionesGenerales: "",
              metasTerapeuticas: false,
              insulinaEsquema: false,
              elaboro: "",
              matricula: "",
              driveLink: "",
              nombre: "",
              nss: "",
              fechaNacimiento: "",
              edad: 0,
              cama: "",
              servicioSolicitante: "",
              diagnosticoQuirurgico: "",
              cirugiaProgramada: "",
              fechaQx: "",
              fechaCirugiaPendiente: false,
              esUrgencia: false,
              peso: 0,
              talla: 0,
              imc: 0
          };
          
          reset(resetValues);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
            <User className="text-clinical-navy" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Ficha Paciente</h2>
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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
        
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

        {/* --- CIRUGÍA & URGENCIA --- */}
        <div className="border-t border-gray-100 pt-4 mt-2">
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

        <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Cama / Servicio</label>
            <input {...register('cama')} className="w-full mt-1 p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
        </div>

      </div>
    </div>
  );
};

export default PatientInfo;