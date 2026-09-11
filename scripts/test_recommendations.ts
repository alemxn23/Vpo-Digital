import { generateRecommendations } from '../utils/RecommendationEngine';
import { getMedicationRecommendation, formatStopWindow } from '../custom_services/PharmacologyEngine';
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
    stent_indicacion: '',
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
assertTrue(/MITAD de la dosis/.test(resultA.plan_pre) && /24h antes/.test(resultA.plan_pre), 'Enoxaparina terapéutica: última dosis 24h antes a mitad de dosis');
assertTrue(/1 mg\/kg c\/24h|heparina no fraccionada/.test(resultA.plan_pre), 'Enoxaparina con TFG 28: indica ajuste de dosis / HNF por acumulación (no sólo alargar intervalo)');
assertTrue(!/1\.5 días/.test(resultA.plan_pre), 'Enoxaparina no produce "1.5 días"');
assertTrue(/Suspender 24h antes.*Acidosis Láctica/i.test(resultA.plan_pre), 'Metformina indica riesgo de acidosis láctica');

console.log("\n================================================");
console.log("ESCENARIO A2: Enoxaparina con función renal normal");
const dataA2: VPOData = { ...defaultData(), tfg: 90 } as VPOData;
dataA2.selectedMeds = [addRealMed('Enoxaparina', dataA2)];
const resultA2 = generateRecommendations(dataA2);
assertNoBrokenText('plan_pre (A2)', resultA2.plan_pre);
assertTrue(resultA2.plan_pre.includes('24h antes') && !/1 mg\/kg c\/24h/.test(resultA2.plan_pre), 'Enoxaparina con TFG normal usa 24h sin nota renal');

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
assertTrue(/mantener terapia antiagregante dual/i.test(resultB.plan_pre) && !/Suspender fármaco/.test(resultB.plan_pre), 'Stent DES < 12 meses en urgencia mantiene DAPT (no suspende antiagregantes)');

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


// ============================================================================
// BLOQUE GUÍAS 2024: PAUSE exacto, IECA/ARA-II en HFrEF, formato de ventana
// ============================================================================

const medById = (id: string): SelectedMed => {
    const m = MEDICATIONS_DB.find(x => x.id === id);
    if (!m) throw new Error(`No existe en MEDICATIONS_DB: ${id}`);
    return m;
};
const pauseCase = (id: string, tfg: number, highBleed: boolean) =>
    getMedicationRecommendation(medById(id), { ...defaultData(), tfg, gupta_surgical_site: highBleed ? 'intracranial' : 'other', capB_cxMayor: false } as VPOData);

console.log("\n================================================");
console.log("ESCENARIO D: Protocolo PAUSE (8 celdas de la tabla)");
// Apixabán / rivaroxabán / edoxabán: bajo 1 día, alto 2 días, sin ajuste por TFG (>=30)
assertTrue(pauseCase('api', 90, false).daysPrior === 1, 'PAUSE apixabán bajo riesgo TFG 90 → 1 día');
assertTrue(pauseCase('api', 90, true).daysPrior === 2, 'PAUSE apixabán alto riesgo TFG 90 → 2 días');
assertTrue(pauseCase('riva', 40, true).daysPrior === 2, 'PAUSE rivaroxabán alto riesgo TFG 40 → 2 días (sin ajuste renal)');
assertTrue(pauseCase('edoxa', 40, false).daysPrior === 1, 'PAUSE edoxabán bajo riesgo TFG 40 → 1 día');
// Dabigatrán
assertTrue(pauseCase('dabi', 60, false).daysPrior === 1, 'PAUSE dabigatrán TFG ≥50 bajo riesgo → 1 día');
assertTrue(pauseCase('dabi', 60, true).daysPrior === 2, 'PAUSE dabigatrán TFG ≥50 alto riesgo → 2 días');
assertTrue(pauseCase('dabi', 40, false).daysPrior === 2, 'PAUSE dabigatrán TFG 30-49 bajo riesgo → 2 días');
assertTrue(pauseCase('dabi', 40, true).daysPrior === 4, 'PAUSE dabigatrán TFG 30-49 alto riesgo → 4 días');
const dabiCkd = pauseCase('dabi', 20, false);
assertTrue(dabiCkd.alertLevel === 'red' && /CONTRAINDICADO/.test(dabiCkd.instructions), 'Dabigatrán TFG <30 → alerta roja, contraindicado');
assertTrue(/NO requiere puente/i.test(pauseCase('api', 90, true).instructions), 'DOAC nunca indica puente');
assertTrue(/Reiniciar 48-72 h/.test(pauseCase('api', 90, true).instructions), 'DOAC alto riesgo indica reinicio 48-72 h');

console.log("\n================================================");
console.log("ESCENARIO E: IECA/ARA-II según ACC/AHA 2024");
const losartan = medById('losa');
const htaControlada = getMedicationRecommendation(losartan, { ...defaultData(), hta: true, hta_control: 'controlada', icc: false } as VPOData);
assertTrue(htaControlada.action === 'stop' && htaControlada.hoursPrior === 24, 'HTA controlada sin IC → suspender 24h');
const hfref = getMedicationRecommendation(losartan, { ...defaultData(), icc: true, icc_nyha: 'II', eco_fevi: 32 } as VPOData);
assertTrue(hfref.action === 'continue' && /FEVI 32%/.test(hfref.instructions), 'HFrEF (FEVI 32%) → continuar IECA/ARA-II');
const hfpef = getMedicationRecommendation(losartan, { ...defaultData(), icc: true, icc_nyha: 'II', eco_fevi: 58 } as VPOData);
assertTrue(hfpef.action === 'stop', 'IC con FEVI 58% (preservada) → se aplica la regla de HTA: suspender 24h');
const icSinFevi = getMedicationRecommendation(losartan, { ...defaultData(), icc: true, icc_nyha: 'III', eco_fevi: 0 } as VPOData);
assertTrue(icSinFevi.action === 'continue', 'IC sin FEVI registrada → se asume FE reducida y se continúa');

console.log("\n================================================");
console.log("ESCENARIO F: formato de ventana de suspensión");
assertTrue(formatStopWindow({ action: 'stop', daysPrior: 1.5, hoursPrior: 36 }) === 'Suspender 36h antes', 'formatStopWindow 36h no muestra "1.5 días"');
assertTrue(formatStopWindow({ action: 'stop', daysPrior: 2, hoursPrior: 48 }) === 'Suspender 2 días antes', 'formatStopWindow 48h → 2 días');
assertTrue(formatStopWindow({ action: 'stop', daysPrior: 0, hoursPrior: 0 }) === 'Omitir dosis el día de la cirugía', 'formatStopWindow 0h → omitir dosis');
assertTrue(formatStopWindow({ action: 'stop', daysPrior: 5 }) === 'Suspender 5 días antes', 'formatStopWindow sin horas usa días');
assertTrue(formatStopWindow({ action: 'continue' }) === 'Continuar', 'formatStopWindow continue');


console.log("\n================================================");
console.log("ESCENARIO G: GLP-1 según guía multisociedad 2024");
const sema = medById('sema');
const glpSinRiesgo = getMedicationRecommendation(sema, { ...defaultData() } as VPOData);
assertTrue(glpSinRiesgo.action === 'continue' && glpSinRiesgo.alertLevel === 'green', 'GLP-1 sin factores de riesgo → continuar, ayuno estándar');
const glpEscalada = getMedicationRecommendation({ ...sema, glp1EscalationPhase: true }, { ...defaultData() } as VPOData);
assertTrue(glpEscalada.action === 'continue' && /DIETA LÍQUIDA CLARA/.test(glpEscalada.instructions) && /diferir/.test(glpEscalada.instructions), 'GLP-1 en escalada de dosis → continuar + dieta líquida 24h + valorar diferir electiva');
const glpUrgente = getMedicationRecommendation({ ...sema, glp1GiSymptoms: true }, { ...defaultData(), esUrgencia: true } as VPOData);
assertTrue(/anestesiología/.test(glpUrgente.instructions) && !/diferir/.test(glpUrgente.instructions), 'GLP-1 con síntomas GI en urgencia → aviso a anestesiología sin sugerir diferir');
assertTrue(!/SUSPENDER 1 SEMANA/i.test(glpSinRiesgo.instructions + glpEscalada.instructions), 'GLP-1 ya no aplica la regla ASA 2023 de suspender 1 semana');

console.log("\n================================================");
console.log("ESCENARIO H: Stent DES por SCA vs enfermedad crónica (ACC/AHA 2024)");
const monthsAgo = (n: number) => { const x = new Date(); x.setMonth(x.getMonth() - n); return x.toISOString(); };
const clopi = medById('clopi');
const stentBase = { ...defaultData(), cardiopatiaIsquemica: true, cardio_stent: true, stent_tipo: 'DES' as const };
const sca8m = getMedicationRecommendation(clopi, { ...stentBase, stent_indicacion: 'sca', stent_fecha_colocacion: monthsAgo(8) } as VPOData);
assertTrue(sca8m.alertLevel === 'red' && /≥ 12 meses/.test(sca8m.instructions) && /POSPONER/.test(sca8m.instructions), 'DES por SCA de 8 meses, electiva → posponer (≥ 12 meses)');
assertTrue(/tiempo-sensible/.test(sca8m.instructions), 'DES por SCA de 8 meses ofrece la vía tiempo-sensible (≥ 3 meses)');
const cron8m = getMedicationRecommendation(clopi, { ...stentBase, stent_indicacion: 'cronica', stent_fecha_colocacion: monthsAgo(8) } as VPOData);
assertTrue(cron8m.action === 'stop' && cron8m.daysPrior === 5, 'DES por enfermedad crónica de 8 meses → seguro, suspender clopidogrel 5 días');
const sinIndic8m = getMedicationRecommendation(clopi, { ...stentBase, stent_indicacion: '', stent_fecha_colocacion: monthsAgo(8) } as VPOData);
assertTrue(sinIndic8m.alertLevel === 'red', 'DES sin indicación registrada → se asume SCA (conservador)');
const sca2mUrg = getMedicationRecommendation(clopi, { ...stentBase, stent_indicacion: 'sca', stent_fecha_colocacion: monthsAgo(2), esUrgencia: true } as VPOData);
assertTrue(/MANTENER terapia antiagregante dual/.test(sca2mUrg.instructions), 'DES de 2 meses en urgencia → mantener DAPT');
const sca14m = getMedicationRecommendation(clopi, { ...stentBase, stent_indicacion: 'sca', stent_fecha_colocacion: monthsAgo(14) } as VPOData);
assertTrue(sca14m.action === 'stop', 'DES por SCA de 14 meses → seguro suspender P2Y12');
const bms20d = getMedicationRecommendation(clopi, { ...stentBase, stent_tipo: 'BMS', stent_fecha_colocacion: new Date(Date.now() - 20 * 86400000).toISOString() } as VPOData);
assertTrue(bms20d.alertLevel === 'red' && /30 días/.test(bms20d.instructions), 'BMS de 20 días → alerta (< 30 días)');


console.log("\n================================================");
console.log("ESCENARIO I: enfoque de medicina interna (plan_trans, reinicio, MINS)");
const dataI: VPOData = { ...defaultData(), edad: 70, cardiopatiaIsquemica: true, gupta_surgical_site: 'vascular', lee: 'II', alergicos: true, alergicosDetalle: 'Penicilina', esUrgencia: true } as VPOData;
dataI.selectedMeds = [addRealMed('Apixaban', dataI), addRealMed('Metformina', dataI)];
const resultI = generateRecommendations(dataI);
console.log(resultI);
assertNoBrokenText('plan_post (I)', resultI.plan_post);
assertTrue(!/cristaloides|secuencia rápida|re-dosificación/i.test(resultI.plan_pre + resultI.plan_trans), 'plan_trans ya no dicta decisiones anestésicas (fluidos, ISR, redosificación)');
assertTrue(/evitar betalactámicos/.test(resultI.plan_trans), 'Alergia a penicilina se traduce en aviso sobre profilaxis');
assertTrue(/\[APIXABAN\] Reiniciar 48-72 horas/.test(resultI.plan_post), 'Reinicio posoperatorio de DOAC tras cirugía de alto riesgo de sangrado: 48-72 h');
assertTrue(/\[METFORMINA\] Reiniciar/.test(resultI.plan_post), 'Reinicio posoperatorio de metformina');
assertTrue(/troponina de alta sensibilidad basal y a las 24 y 48 horas/.test(resultI.plan_post), 'Vigilancia MINS con troponina en paciente de alto riesgo');
const dataI2: VPOData = { ...defaultData(), edad: 30 } as VPOData;
const resultI2 = generateRecommendations(dataI2);
assertTrue(!/troponina/.test(resultI2.plan_post), 'Sin riesgo cardiaco no se pide troponina posoperatoria');

console.log("\n================================================");
if (failures > 0) {
    console.error(`\n${failures} verificación(es) fallaron.`);
    process.exit(1);
} else {
    console.log('\nTodas las verificaciones pasaron.');
}
