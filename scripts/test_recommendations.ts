import { generateRecommendations } from '../utils/RecommendationEngine';
import { VPOData, Gender } from '../types';

const defaultData = (): Partial<VPOData> => ({
    fecha: new Date().toISOString(),
    hora: '12:00',
    nombre: 'Paciente de Prueba',
    nss: '123456',
    fechaNacimiento: '1980-01-01',
    edad: 40,
    genero: Gender.MALE,
    cama: '1',
    servicioSolicitante: 'Urgencias',
    unidadMedica: 'Hospital General',
    diagnosticoQuirurgico: 'Prueba',
    cirugiaProgramada: 'Prueba',
    fechaQx: '2026-03-20',
    fechaCirugiaPendiente: false,
    esUrgencia: false,
    tipoCirugia: 'Electiva',
    peso: 70,
    talla: 170,
    imc: 24,
    // Risk factors
    tabaquismo: false,
    cigarrosDia: 0,
    aniosFumando: 0,
    indiceTabaquico: 0,
    riesgoEPOC: '',
    active_smoking: false,
    alergicos: false,
    alergicosDetalle: '',
    hta: false,
    hta_control: 'controlada',
    hta_tiempo: '0',
    diabetes: false,
    diabetesTipo: '',
    diabetesTiempo: '0',
    usaInsulina: false,
    cardiopatiaIsquemica: false,
    cardio_tipo_evento: 'angina_estable',
    cardio_fecha_evento: '',
    cardio_stent: false,
    stent_fecha_colocacion: '',
    stent_tipo: 'BMS',
    icc: false,
    icc_nyha: 'I',
    icc_evolucion: 'cronica_comp',
    icc_historia_eap: false,
    icc_fecha_eap: '',
    arritmias: false,
    arritmia_tipo: 'otra',
    marcapasos: false,
    valvulopatia: false,
    valvula_afectada: 'aortica',
    valvula_patologia: 'estenosis',
    valvula_severidad: 'leve',
    valvula_protesis: false,
    evc: false,
    evc_fecha: '',
    evc_tipo: 'isquemico',
    evc_secuelas: false,
    neumopatia: false,
    neumo_tipo: '',
    diagnosed_osa: false,
    neumo_o2: false,
    enfRenalCronica: false,
    erc_estadio: 'G1',
    erc_dialisis: false,
    hepatopatia: false,
    hepato_tipo: 'cirrosis',
    hepato_child: 'A',
    hepato_coagulopatia: false,
    coagulopatia: false,
    coag_tipo: '',
    cancer_activo: false,
    cancer_tipo_sitio: '',
    // Gabinete
    tfg: 90,
    hb: 14,
    gupta_surgical_site: 'other',
    selectedMeds: []
});

console.log("================================================");
console.log("ESCENARIO A: Complejo Vascular");
console.log("Masculino, 78 años, DM2, FA, Cr 2.2, Enoxaparina terapeutica, Metformina, Amputación");
const dataA: VPOData = {
    ...defaultData(),
    genero: Gender.MALE,
    edad: 78,
    diabetes: true,
    arritmias: true,
    arritmia_tipo: 'fa',
    creatinina: 2.2,
    tfg: 28, // Cr 2.2 approx TFG 28
    gupta_surgical_site: 'vascular',
    caprini: 6, // high risk
    selectedMeds: [
        { id: '1', name: 'Enoxaparina', category: '', action: 'stop', instructions: '', alertLevel: 'red' },
        { id: '2', name: 'Metformina', category: '', action: 'stop', instructions: '', alertLevel: 'red' }
    ]
} as VPOData;
console.log(generateRecommendations(dataA));

console.log("\n================================================");
console.log("ESCENARIO B: Crítico Coronario");
console.log("Femenino, 65 años, Stent DES 3 meses, Clopidogrel+Aspirina, Colecistectomía Urgencia");
let d = new Date();
d.setMonth(d.getMonth() - 3);

const dataB: VPOData = {
    ...defaultData(),
    genero: Gender.FEMALE,
    edad: 65,
    cardiopatiaIsquemica: true,
    cardio_stent: true,
    stent_tipo: 'DES',
    stent_fecha_colocacion: d.toISOString(),
    esUrgencia: true,
    gupta_surgical_site: 'biliary',
    caprini: 4, // moderate risk
    selectedMeds: [
        { id: '1', name: 'Clopidogrel', category: '', action: 'continue', instructions: '', alertLevel: 'red' },
        { id: '2', name: 'Aspirina', category: '', action: 'continue', instructions: '', alertLevel: 'red' }
    ]
} as VPOData;
console.log(generateRecommendations(dataB));

console.log("\n================================================");
console.log("ESCENARIO C: Sencillo Ambulatorio");
console.log("Femenino, 30 años, sana, Anticonceptivos, Rinoplastia electiva");
const dataC: VPOData = {
    ...defaultData(),
    genero: Gender.FEMALE,
    edad: 30,
    gupta_surgical_site: 'ent',
    caprini: 1, // low risk
    selectedMeds: [
        { id: '1', name: 'Anticonceptivos', category: '', action: 'continue', instructions: '', alertLevel: 'green' }
    ]
} as VPOData;
console.log(generateRecommendations(dataC));
