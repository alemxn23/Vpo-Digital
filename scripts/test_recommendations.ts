import { generateRecommendations } from '../utils/RecommendationEngine';
import { getMedicationRecommendation } from '../custom_services/PharmacologyEngine';
import { MEDICATIONS_DB } from '../data/medications';
import { VPOData, Gender, SelectedMed } from '../types';

// This test intentionally mirrors the real UI flow (see MedicationReconciliation.tsx#handleAddMed):
// 1. Look up the medication in the real database (MEDICATIONS_DB), never hand-roll a SelectedMed.
// 2. Run it through getMedicationRecommendation() to resolve action/daysPrior/instructions,
//    exactly like the app does when a doctor adds a drug.
// A hand-rolled SelectedMed with missing fields (daysPrior, atcCode, etc.) does not reflect
// production behavior and previously produced misleading "NaN horas" output here.
const addRealMed = (name: string, patient: VPOData): SelectedMed => {
    const dbItem = MEDICATIONS_DB.find(m => m.name.toLowerCase() === name.toLowerCase());
    if (!dbItem) throw new Error(`Medicamento de prueba no encontrado en MEDICATIONS_DB: "${name}"`);

    const rec = getMedicationRecommendation(dbItem, patient);
    return {
        ...dbItem,
        action: rec.action,
        daysPrior: rec.daysPrior,
        alertLevel: rec.alertLevel,
        instructions: rec.instructions,
        dose: 0,
        route: 'VO'
    };
};

let failures = 0;
const assertTrue = (condition: boolean, message: string) => {
    if (!condition) {
        failures++;
        console.error(`  ❌ FALLO: ${message}`);
    } else {
        console.log(`  ✅ OK: ${message}`);
    }
};

// A generated plan should never leak placeholder/broken values into the printed report.
const assertNoBrokenText = (label: string, text: string) => {
    assertTrue(!/NaN/.test(text), `${label} no contiene "NaN"`);
    assertTrue(!/Indicación específica: \.\s/.test(text), `${label} no tiene indicaciones vacías`);
    assertTrue(!/undefined/i.test(text), `${label} no contiene "undefined"`);
};

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
    tfg: 90,
    hb: 14,
    gupta_surgical_site: 'other',
    selectedMeds: []
});

console.log("================================================");
console.log("ESCENARIO A: Complejo Vascular");
console.log("Masculino, 78 años, DM2, FA, Cr 2.2, TFG 28, Enoxaparina + Metformina, Amputación");
const dataAPartial: VPOData = {
    ...defaultData(),
    genero: Gender.MALE,
    edad: 78,
    diabetes: true,
    arritmias: true,
    arritmia_tipo: 'fa',
    creatinina: 2.2,
    tfg: 28,
    gupta_surgical_site: 'vascular',
    caprini: 6
} as VPOData;
dataAPartial.selectedMeds = [
    addRealMed('Enoxaparina', dataAPartial),
    addRealMed('Metformina', dataAPartial)
];
const resultA = generateRecommendations(dataAPartial);
console.log(resultA);
assertNoBrokenText('plan_pre (A)', resultA.plan_pre);
assertTrue(resultA.plan_pre.includes('36h antes'), 'Enoxaparina con TFG 28 (renal severo) ajusta a 36h de suspensión');
assertTrue(/Suspender 24h antes.*Acidosis Láctica/i.test(resultA.plan_pre), 'Metformina indica riesgo de acidosis láctica');

console.log("\n================================================");
console.log("ESCENARIO A2: Enoxaparina con función renal normal");
const dataA2: VPOData = { ...defaultData(), tfg: 90 } as VPOData;
dataA2.selectedMeds = [addRealMed('Enoxaparina', dataA2)];
const resultA2 = generateRecommendations(dataA2);
assertNoBrokenText('plan_pre (A2)', resultA2.plan_pre);
assertTrue(resultA2.plan_pre.includes('24h antes') && !resultA2.plan_pre.includes('36h antes'), 'Enoxaparina con TFG normal usa 24h (sin ajuste renal)');

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
    caprini: 4
} as VPOData;
dataB.selectedMeds = [
    addRealMed('Clopidogrel', dataB),
    addRealMed('Aspirina (AAS)', dataB)
];
const resultB = generateRecommendations(dataB);
console.log(resultB);
assertNoBrokenText('plan_pre (B)', resultB.plan_pre);
assertTrue(/MANTENER DUAL|CONTINUAR AAS/i.test(resultB.plan_pre), 'Stent DES < 6 meses evita suspender antiagregantes (riesgo de trombosis)');

console.log("\n================================================");
console.log("ESCENARIO C: Sencillo Ambulatorio");
console.log("Femenino, 30 años, sana, Rinoplastia electiva, sin medicamentos de riesgo");
const dataC: VPOData = {
    ...defaultData(),
    genero: Gender.FEMALE,
    edad: 30,
    gupta_surgical_site: 'ent',
    caprini: 1
} as VPOData;
dataC.selectedMeds = [];
const resultC = generateRecommendations(dataC);
console.log(resultC);
assertNoBrokenText('plan_pre (C)', resultC.plan_pre);
assertTrue(resultC.plan_post.includes('deambulación temprana'), 'Caprini bajo recomienda solo deambulación temprana (sin heparina)');

console.log("\n================================================");
if (failures > 0) {
    console.error(`\n${failures} verificación(es) fallaron.`);
    process.exit(1);
} else {
    console.log('\nTodas las verificaciones pasaron.');
}
