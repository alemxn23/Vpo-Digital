import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import { ClipboardCheck, Calculator, AlertCircle, Bug, Search, CheckSquare, XSquare, Info, ShieldAlert, HeartPulse, User, Check } from 'lucide-react';

interface ScaleCardProps {
    label: string;
    desc: string;
    children?: React.ReactNode;
    autoCalc?: boolean;
    onClick?: () => void;
}

const ScaleCard = ({ label, desc, children, autoCalc = false, onClick }: ScaleCardProps) => (
    <div
        onClick={onClick}
        className={`bg-white p-4 rounded-xl border shadow-sm transition-all relative group 
    ${autoCalc ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'} 
    ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300' : ''}`}
    >
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <label className={`text-base font-bold text-clinical-navy ${onClick ? 'group-hover:underline' : ''}`}>{label}</label>
                {autoCalc && <Calculator size={14} className="text-blue-500" />}
            </div>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{desc}</span>
        </div>
        {children}
        {/* Hint for interactivity - Only render if onClick is present */}
        {onClick && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none z-10">
                <span className="text-xs font-bold text-clinical-navy flex items-center gap-1"><Search size={14} /> Ver Desglose</span>
            </div>
        )}
    </div>
);

// --- HELPER: Month Diff ---
const getMonthsDiff = (dateString: string) => {
    if (!dateString) return 999;
    const now = new Date();
    const event = new Date(dateString);
    let months = (now.getFullYear() - event.getFullYear()) * 12;
    months -= event.getMonth();
    months += now.getMonth();
    return months <= 0 ? 0 : months;
};

// --- HELPER: Week Diff ---
const getWeeksDiff = (dateString: string) => {
    if (!dateString) return 999;
    const now = new Date().getTime();
    const event = new Date(dateString).getTime();
    const diffInDays = (now - event) / (1000 * 3600 * 24);
    return diffInDays / 7;
};

const RiskScales: React.FC = () => {
    const { register, watch, setValue } = useFormContext<VPOData>();
    const [selectedScale, setSelectedScale] = useState<string | null>(null);

    // Watch fields for Automatic Logic
    const data = watch();
    const overrides = data.risk_overrides || {};

    // --- MASTER SCORE FUNCTION LOGIC ---
    useEffect(() => {
        // --- 0. PRE-CALCULATE FLAGS ---
        const monthsPostIAM = data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'iam' ? getMonthsDiff(data.cardio_fecha_evento) : 999;
        const isIAMReciente = monthsPostIAM < 6;
        const isIAMAntiguo = monthsPostIAM >= 6 && monthsPostIAM < 999;

        const isAnginaInestable = data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'angina_inestable';
        const isEstenosisSevera = (data.valvulopatia && data.valvula_afectada === 'aortica' && data.valvula_patologia === 'estenosis' && data.valvula_severidad === 'severa') || data.exploracion_estenosis_aortica;
        const weeksPostEAP = data.icc && data.icc_historia_eap ? getWeeksDiff(data.icc_fecha_eap) : 999;
        const isEAPAgudo = weeksPostEAP < 1;
        const monthsPostEVC = data.evc ? getMonthsDiff(data.evc_fecha) : 999;
        const isEVCAgudo = monthsPostEVC < 1;

        if (data.flag_iam_reciente !== isIAMReciente) setValue('flag_iam_reciente', isIAMReciente);
        if (data.flag_angina_inestable !== isAnginaInestable) setValue('flag_angina_inestable', isAnginaInestable);
        if (data.flag_estenosis_aortica_severa !== isEstenosisSevera) setValue('flag_estenosis_aortica_severa', isEstenosisSevera);

        const getVal = (key: string, auto: boolean) => {
            if (overrides && overrides[key] !== undefined) return overrides[key];
            return auto;
        };

        // --- 1. Lee (RCRI) ---
        // Updated Logic: TFG < 60 adds point
        let leePoints = 0;
        if (getVal('lee_cx_high', data.capB_cxMayor)) leePoints++;
        if (getVal('lee_ischem', data.cardiopatiaIsquemica || data.capA_iam || data.ecg_isquemia || data.ecg_brihh_completo)) leePoints++;
        if (getVal('lee_icc', data.icc || data.exploracion_s3 || data.exploracion_ingurgitacion)) leePoints++;
        if (getVal('lee_evc', data.evc || data.capD_evc)) leePoints++;
        if (getVal('lee_insulin', data.diabetes && data.usaInsulina)) leePoints++;
        if (getVal('lee_renal', data.creatinina > 2.0 || (data.tfg && data.tfg < 60))) leePoints++;

        let leeClass: "I" | "II" | "III" | "IV" = "I";
        if (leePoints === 0) leeClass = "I";
        else if (leePoints === 1) leeClass = "II";
        else if (leePoints === 2) leeClass = "III";
        else if (leePoints >= 3) leeClass = "IV";

        if (data.lee !== leeClass) setValue('lee', leeClass);

        // --- 2. Caprini ---
        let capPoints = 0;
        const age = data.edad || 0;
        if (age >= 75) capPoints += 3;
        else if (age >= 61) capPoints += 2;
        else if (age >= 41) capPoints += 1;
        if ((data.imc || 0) > 25) capPoints += 1;
        // ... Caprini logic mostly direct from booleans
        if (data.capA_cxMenor) capPoints += 1;
        if (data.capA_cxMayorAnt) capPoints += 1;
        if (data.capA_varices) capPoints += 1;
        if (data.capA_eii) capPoints += 1;
        if (isIAMReciente || isIAMAntiguo) capPoints += 1;
        if (data.neumopatia || data.capA_epoc) capPoints += 1;
        if (data.capA_reposo) capPoints += 1;
        if (data.exploracion_edema) capPoints += 1;
        if (data.capB_cxMayor) capPoints += 2;
        if (data.capB_laparoscopia) capPoints += 2;
        if (data.capB_confinado) capPoints += 2;
        if (data.capB_ferula) capPoints += 2;
        if (data.capB_cancer) capPoints += 2;
        if (data.capB_cateter) capPoints += 2;
        if (data.capC_historiaTVP) capPoints += 3;
        if (data.capC_historiaFam) capPoints += 3;
        if (data.capC_leiden) capPoints += 3;
        if (data.capC_lupico) capPoints += 3;
        if (data.capC_hit) capPoints += 3;
        if (isEVCAgudo) capPoints += 5;
        else if (data.evc) capPoints += 1;
        if (data.capD_artroplastia) capPoints += 5;
        if (data.capD_fxCadera) capPoints += 5;
        if (data.capD_trauma) capPoints += 5;

        if (data.caprini !== capPoints) setValue('caprini', capPoints);

        // --- 3. ASA Autopuntaje ---
        let asaBase: "I" | "II" | "III" | "IV" = "I";
        if (data.tabaquismo || (data.imc > 30 && data.imc < 40) || (data.hta && data.hta_control === 'controlada') || (data.diabetes && !data.usaInsulina)) asaBase = "II";
        if (data.imc >= 40 || data.enfRenalCronica || data.neumopatia || (data.icc && data.icc_nyha !== 'IV') || isIAMAntiguo || (data.hta && data.hta_control === 'descontrolada') || data.erc_dialisis) asaBase = "III";
        if (isIAMReciente || (data.icc && data.icc_nyha === 'IV') || isAnginaInestable || isEstenosisSevera || monthsPostEVC < 3 || data.hepato_child === 'C' || data.erc_estadio === 'G5') asaBase = "IV";

        // Override Logic
        let finalASA = data.asa_manual_class ? (data.asa_manual_class as any) : asaBase;
        if (data.esUrgencia && !finalASA.includes('-E')) finalASA = `${finalASA}-E`;

        if (data.asa !== finalASA) setValue('asa', finalASA);

        // --- 4. GOLDMAN ---
        let goldmanPoints = 0;
        if (getVal('gold_s3', data.exploracion_s3 || data.exploracion_ingurgitacion || data.exploracion_estertores || (data.icc && (data.icc_nyha === 'IV' || data.icc_evolucion === 'aguda')))) goldmanPoints += 11;
        if (getVal('gold_iam', isIAMReciente)) goldmanPoints += 10;
        if (getVal('gold_ritmo', (data.arritmias && data.arritmia_tipo !== 'otra') || (data.ecg_ritmo_especifico && data.ecg_ritmo_especifico !== 'Sinusal'))) goldmanPoints += 7;
        if (getVal('gold_pvc', (data.arritmias && data.arritmia_tipo === 'extrasistoles') || data.ecg_extrasistoles)) goldmanPoints += 7;
        if (getVal('gold_age', data.edad > 70)) goldmanPoints += 5;
        if (getVal('gold_urg', data.esUrgencia)) goldmanPoints += 4;
        if (getVal('gold_ao', isEstenosisSevera)) goldmanPoints += 3;
        if (getVal('gold_gen', (data.k && data.k < 3) || (data.creatinina > 3) || (data.urea > 50) || data.hepatopatia || data.capA_reposo)) goldmanPoints += 3;
        if (getVal('gold_cx', data.ariscat_incision === 'abdominal_sup' || data.ariscat_incision === 'intratoracica')) goldmanPoints += 3;

        let goldmanClass: "I" | "II" | "III" | "IV" = "I";
        if (goldmanPoints >= 26) goldmanClass = "IV";
        else if (goldmanPoints >= 13) goldmanClass = "III";
        else if (goldmanPoints >= 6) goldmanClass = "II";

        if (data.goldman !== goldmanClass) setValue('goldman', goldmanClass);

        // --- 5. DETSKY ---
        let detskyPoints = 0;
        if (getVal('det_iam_rec', isIAMReciente)) detskyPoints += 10;
        else if (getVal('det_iam_ant', isIAMAntiguo)) detskyPoints += 5;
        if (getVal('det_ang_inest', isAnginaInestable)) detskyPoints += 20;
        else if (getVal('det_ang_est', data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'angina_estable')) detskyPoints += 10;
        if (getVal('det_eap', isEAPAgudo)) detskyPoints += 10;
        else if (getVal('det_eap_hist', data.icc_historia_eap)) detskyPoints += 5;
        if (getVal('det_ao', isEstenosisSevera)) detskyPoints += 20;
        if (getVal('det_ritmo', (data.arritmias && data.arritmia_tipo !== 'otra') || (data.ecg_ritmo_especifico && data.ecg_ritmo_especifico !== 'Sinusal'))) detskyPoints += 5;
        if (getVal('det_gen', (data.k && data.k < 3) || (data.creatinina > 3) || (data.urea > 50) || data.hepatopatia || data.capA_reposo)) detskyPoints += 5;
        if (getVal('det_age', data.edad > 70)) detskyPoints += 5;
        if (getVal('det_urg', data.esUrgencia)) detskyPoints += 10;

        let detskyClass: "I" | "II" | "III" = "I";
        if (detskyPoints >= 31) detskyClass = "III";
        else if (detskyPoints >= 15) detskyClass = "II";

        if (data.detsky !== detskyClass) setValue('detsky', detskyClass);

        // --- 6. GUPTA ---
        const intercept = -5.31;
        const coeffAge = 0.003 * data.edad;
        const coeffCr = data.creatinina > 1.5 ? 0.6 : 0;
        let coeffAsa = 0;
        // We use calculated ASA base for Gupta to avoid circular logic or user error, or use current ASA
        const asaVal = data.asa ? data.asa.replace('-E', '') : 'I';
        if (asaVal === "II") coeffAsa = 0.11;
        if (asaVal === "III") coeffAsa = 0.69;
        if (asaVal === "IV" || asaVal === "V") coeffAsa = 1.99;

        let coeffFunc = 0;
        if (data.functional_status === 'partial') coeffFunc = 0.65;
        if (data.functional_status === 'total') coeffFunc = 0.88;

        let coeffSite = 0;
        switch (data.gupta_surgical_site) {
            case 'anorectal': coeffSite = -1.5; break;
            case 'orthopedic': coeffSite = 0.2; break;
            case 'bariatric': coeffSite = 0.3; break;
            case 'thoracic': coeffSite = 0.9; break;
            case 'cardiac': coeffSite = 1.4; break;
            case 'vascular': coeffSite = 0.9; break;
            case 'aortic': coeffSite = 1.2; break;
            case 'intracranial': coeffSite = 0.9; break;
            default: coeffSite = 0;
        }
        const logit = intercept + coeffAge + coeffCr + coeffAsa + coeffFunc + coeffSite;
        const risk = Math.exp(logit) / (1 + Math.exp(logit));
        const riskPercent = parseFloat((risk * 100).toFixed(1));

        if (data.gupta !== riskPercent) setValue('gupta', riskPercent);


        if (data.gupta !== riskPercent) setValue('gupta', riskPercent);

        // --- 7. CHA2DS2-VASc ---
        let chaPoints = 0;
        if (data.icc) chaPoints += 1; // C
        if (data.hta) chaPoints += 1; // H
        if (data.edad >= 75) chaPoints += 2; // A2
        if (data.diabetes) chaPoints += 1; // D
        if (data.evc || isEVCAgudo) chaPoints += 2; // S2
        if (data.cardiopatiaIsquemica || isEAPAgudo || isEstenosisSevera || data.icc_historia_eap) chaPoints += 1; // V ( Vascular disease)
        if (data.edad >= 65 && data.edad < 75) chaPoints += 1; // A
        if (data.genero === 'Fem') chaPoints += 1; // Sc (Sex category)

        if (data.cha2ds2vasc !== chaPoints) setValue('cha2ds2vasc', chaPoints);

        // --- 8. HAS-BLED ---
        let hasbledPoints = 0;
        if (data.hta && data.hta_control === 'descontrolada') hasbledPoints += 1; // H (Uncontrolled HTN)
        if (data.creatinina > 2.26 || data.erc_dialisis || data.erc_estadio === 'G4' || data.erc_estadio === 'G5' || (data.tfg && data.tfg < 60)) hasbledPoints += 1; // A (Renal)
        if (data.hepatopatia || data.hepato_child === 'B' || data.hepato_child === 'C') hasbledPoints += 1; // A (Liver) - Simplified
        if (data.evc) hasbledPoints += 1; // S (Stroke history)
        if (data.coagulopatia || data.inr > 1.2 || data.hasbled_inr_labil) hasbledPoints += 1; // B (Bleeding) or L (Labile INR)
        if (data.edad > 65) hasbledPoints += 1; // E (Elderly)
        if (data.tabaquismo || data.hasbled_alcohol) hasbledPoints += 1; // D (Drugs/Alcohol) - Using Smoking as proxy for lifestyle risk or add Alcohol field if needed. Plan says Alcohol manual toggle.
        // Note: 'Drugs' part of D is medications which we might check from meds list, but for now manual or proxy. 
        // We will rely on manual toggle/logic if we want strictly 'Alcohol'. Here combining.

        if (data.hasbled !== hasbledPoints) setValue('hasbled', hasbledPoints);

    }, [data, setValue]);

    // --- INTERACTIVE AUDIT MODAL LOGIC ---
    const toggleOverride = (key: string, autoValue: boolean) => {
        const current = overrides[key] !== undefined ? overrides[key] : autoValue;
        if (autoValue === true && current === true) {
            const confirm = window.confirm(`⚠️ ADVERTENCIA DE SEGURIDAD\n\nEste criterio fue detectado automáticamente por datos clínicos (Labs/Exploración).\nDesmarcarlo podría subestimar el riesgo real del paciente.\n\n¿Desea forzar la modificación manual?`);
            if (!confirm) return;
        }
        const newOverrides = { ...overrides, [key]: !current };
        setValue('risk_overrides', newOverrides);
    };

    const CapriniCheckbox = ({ name, label, detected }: { name: keyof VPOData, label: string, detected?: boolean }) => {
        const isChecked = watch(name);

        return (
            <label className={`flex items-start gap-2 p-2 rounded cursor-pointer border-b border-gray-50 transition-colors ${detected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <div className="mt-1 relative">
                    <input type="checkbox" {...register(name)} className="peer w-4 h-4 text-clinical-navy rounded border-gray-300 focus:ring-clinical-navy" />
                </div>
                <div className="flex-1">
                    <span className={`text-xs leading-tight ${isChecked || detected ? 'text-clinical-navy font-medium' : 'text-gray-700'}`}>{label}</span>
                    {detected && (
                        <div className="flex items-center gap-1 mt-0.5 text-[9px] text-blue-600 font-bold">
                            <Check size={10} /> Detectado en Historia Clínica
                        </div>
                    )}
                </div>
            </label>
        );
    };

    const AuditModal = () => {
        if (!selectedScale) return null;

        let content = null;
        let title = "";
        let riskStr = "";

        // 1. ASA BREAKDOWN
        if (selectedScale === 'asa') {
            title = "Estado Físico ASA";
            content = (
                <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-900">
                        <p>Clasificación subjetiva del estado físico. Puede forzar la clase si considera que el algoritmo subestima la severidad.</p>
                    </div>
                    <table className="w-full text-[10px] border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left"><th className="p-1">Clase</th><th className="p-1">Definición</th></tr>
                        </thead>
                        <tbody>
                            {[
                                { c: 'I', d: 'Sano' },
                                { c: 'II', d: 'Enfermedad sistémica leve (HTA controlada, Fumador)' },
                                { c: 'III', d: 'Enfermedad sistémica severa limitante (EPOC, IAM antiguo, ERC)' },
                                { c: 'IV', d: 'Enfermedad sistémica con amenaza constante a la vida (IAM reciente, Sepsis)' },
                            ].map(row => (
                                <tr key={row.c} className={`border-b ${data.asa?.includes(row.c) && !data.asa?.includes(row.c + 'I') ? 'bg-blue-100 font-bold' : ''}`}>
                                    <td className="p-1 font-bold">ASA {row.c}</td>
                                    <td className="p-1">{row.d}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="border-t pt-2">
                        <label className="text-xs font-bold block mb-1">Forzar Clase ASA (Manual)</label>
                        <select
                            value={data.asa_manual_class || ""}
                            onChange={(e) => setValue('asa_manual_class', e.target.value)}
                            className="w-full p-2 border rounded text-sm mb-2"
                        >
                            <option value="">-- Usar Calculado (Auto) --</option>
                            <option value="I">ASA I</option>
                            <option value="II">ASA II</option>
                            <option value="III">ASA III</option>
                            <option value="IV">ASA IV</option>
                            <option value="IV">ASA V (Moribundo)</option>
                        </select>
                        {data.asa_manual_class && (
                            <textarea
                                placeholder="Justificación obligatoria..."
                                {...register('asa_justification')}
                                className="w-full p-2 border rounded text-xs h-16"
                            />
                        )}
                    </div>
                </div>
            );
        }

        // 2. CAPRINI DRAWER
        else if (selectedScale === 'caprini') {
            title = "Checklist Caprini (40+ Variables)";
            // Prepare Auto-detected flags for cleaner UI
            const isIAM = (data.cardiopatiaIsquemica && (data.cardio_tipo_evento === 'iam' || data.cardio_tipo_evento === 'angina_inestable'));

            content = (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">

                    {/* BASAL FACTORS */}
                    <div className="bg-gray-100 p-2 rounded text-[10px] space-y-1 mb-2">
                        <p className="font-bold text-gray-500 uppercase">Factores Basales Detectados:</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex justify-between"><span>Edad ({data.edad}a):</span> <b>+{data.edad >= 75 ? '3' : data.edad >= 61 ? '2' : data.edad >= 41 ? '1' : '0'}</b></div>
                            <div className="flex justify-between"><span>IMC ({data.imc}):</span> <b>+{data.imc > 25 ? '1' : '0'}</b></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase bg-blue-50 p-1 rounded border border-blue-100 text-blue-800">Grupo A (1 Punto)</h4>
                            <CapriniCheckbox name="capA_cxMenor" label="Cirugía menor (<45 min)" />
                            <CapriniCheckbox name="capA_cxMayorAnt" label="Antecedente Cx Mayor (<1 mes)" />
                            <CapriniCheckbox name="capA_varices" label="Venas varicosas / Edema" />
                            <CapriniCheckbox name="capA_eii" label="Enf. Inflamatoria Intestinal" />
                            <CapriniCheckbox name="capA_iam" label="IAM (Historia)" detected={isIAM} />
                            <CapriniCheckbox name="capA_epoc" label="EPOC / Neumonía (<1 mes)" detected={data.neumopatia} />
                            <CapriniCheckbox name="capA_reposo" label="Paciente en cama (>72h)" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase bg-blue-50 p-1 rounded border border-blue-100 text-blue-800">Grupo B (2 Puntos)</h4>
                            <CapriniCheckbox name="capB_cxMayor" label="Cirugía Mayor (>45 min)" />
                            <CapriniCheckbox name="capB_laparoscopia" label="Laparoscopía (>45 min)" />
                            <CapriniCheckbox name="capB_confinado" label="Confinado a cama (>72h)" />
                            <CapriniCheckbox name="capB_ferula" label="Inmovilización yeso/férula" />
                            <CapriniCheckbox name="capB_cancer" label="Cáncer activo (o tx <6m)" />
                            <CapriniCheckbox name="capB_cateter" label="Acceso Venoso Central" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase bg-blue-50 p-1 rounded border border-blue-100 text-blue-800">Grupo C (3 Puntos)</h4>
                            <CapriniCheckbox name="capC_historiaTVP" label="Historia TVP / TEP" />
                            <CapriniCheckbox name="capC_historiaFam" label="Historia Fam. Trombosis" />
                            <CapriniCheckbox name="capC_leiden" label="Factor V Leiden" />
                            <CapriniCheckbox name="capC_lupico" label="Anticoagulante Lúpico" />
                            <CapriniCheckbox name="capC_hit" label="Trombocitopenia Inducida Heparina (HIT)" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase bg-blue-50 p-1 rounded border border-blue-100 text-blue-800">Grupo D (5 Puntos)</h4>
                            <CapriniCheckbox name="capD_evc" label="EVC (< 1 mes)" detected={data.evc && getMonthsDiff(data.evc_fecha) < 1} />
                            <CapriniCheckbox name="capD_artroplastia" label="Artroplastía (Cadera/Rodilla)" />
                            <CapriniCheckbox name="capD_fxCadera" label="Fractura de Cadera/Pelvis/Pierna" />
                            <CapriniCheckbox name="capD_trauma" label="Trauma Agudo Medular (Parálisis)" />
                        </div>
                    </div>
                </div>
            );
        }

        // 3. GENERIC CRITERIA LIST (GOLDMAN, DETSKY, LEE)
        else {
            let criteria: any[] = [];

            if (selectedScale === 'goldman') {
                title = "Goldman (1977)";
                const pts = [0, 5, 12, 25]; // Thresholds
                const risks = ["0.2%", "1%", "7%", "22%"]; // Complication risk
                // Determine risk
                let cls = data.goldman;
                let r = cls === 'I' ? risks[0] : cls === 'II' ? risks[1] : cls === 'III' ? risks[2] : risks[3];
                riskStr = `Riesgo Complicaciones Mayores: ${r}`;

                criteria = [
                    { id: 'gold_s3', label: "S3 / Ingurgitación / Estertores", points: 11, auto: !!(data.exploracion_s3 || data.exploracion_ingurgitacion || data.exploracion_estertores || (data.icc && data.icc_nyha === 'IV')), source: "Exploración Física" },
                    { id: 'gold_iam', label: "IAM < 6 meses", points: 10, auto: !!data.flag_iam_reciente, source: "Interrogatorio" },
                    { id: 'gold_ritmo', label: "Ritmo No Sinusal / FA", points: 7, auto: !!(data.ecg_ritmo_especifico && data.ecg_ritmo_especifico !== 'Sinusal'), source: "ECG" },
                    { id: 'gold_pvc', label: "> 5 Extrasístoles Vent/min", points: 7, auto: !!(data.ecg_extrasistoles), source: "ECG" },
                    { id: 'gold_age', label: "Edad > 70 años", points: 5, auto: !!(data.edad > 70), source: "Ficha ID" },
                    { id: 'gold_urg', label: "Cirugía de Urgencia", points: 4, auto: !!(data.esUrgencia), source: "Ficha ID" },
                    { id: 'gold_ao', label: "Estenosis Aórtica Severa", points: 3, auto: !!(data.flag_estenosis_aortica_severa), source: "Exploración/Eco" },
                    { id: 'gold_gen', label: "Mal Estado General (Renal/Hepático/Resp)", points: 3, auto: !!(data.creatinina > 3 || data.urea > 50 || data.hepatopatia), source: "Labs" },
                    { id: 'gold_cx', label: "Cx Intraperitoneal / Torácica", points: 3, auto: !!(data.ariscat_incision === 'abdominal_sup' || data.ariscat_incision === 'intratoracica'), source: "Gabinete" },
                ];
            }
            else if (selectedScale === 'detsky') {
                title = "Detsky Modificado";
                riskStr = data.detsky === 'I' ? "Riesgo Bajo (<15 pts)" : data.detsky === 'II' ? "Riesgo Intermedio (15-30 pts)" : "Riesgo Alto (>31 pts)";
                criteria = [
                    { id: 'det_ang_inest', label: "Angina Inestable (CCS IV)", points: 20, auto: !!data.flag_angina_inestable, source: "Historia" },
                    { id: 'det_ao', label: "Estenosis Aórtica Crítica", points: 20, auto: !!data.flag_estenosis_aortica_severa, source: "Exploración" },
                    { id: 'det_iam_rec', label: "IAM Reciente (<6m)", points: 10, auto: !!data.flag_iam_reciente, source: "Historia" },
                    { id: 'det_eap', label: "Edema Agudo Pulmón (<1sem)", points: 10, auto: !!(data.icc && data.icc_historia_eap), source: "Historia" },
                    { id: 'det_urg', label: "Cirugía de Urgencia", points: 10, auto: !!data.esUrgencia, source: "ID" },
                    { id: 'det_iam_ant', label: "IAM Antiguo (>6m)", points: 5, auto: !!(data.flag_iam_antiguo), source: "Historia" },
                    { id: 'det_ritmo', label: "Ritmo No Sinusal", points: 5, auto: !!(data.ecg_ritmo_especifico !== 'Sinusal'), source: "ECG" },
                ];
            }
            else if (selectedScale === 'lee') {
                title = "Lee (RCRI)";
                const r = data.lee === 'I' ? "0.4%" : data.lee === 'II' ? "0.9%" : data.lee === 'III' ? "6.6%" : "11%";
                riskStr = `Riesgo Evento Cardiaco Mayor: ${r}`;
                criteria = [
                    { id: 'lee_cx_high', label: "Cirugía Alto Riesgo (Vasc/Abd/Tor)", points: 1, auto: !!(data.capB_cxMayor), source: "Tipo Cx" },
                    { id: 'lee_ischem', label: "Cardiopatía Isquémica", points: 1, auto: !!(data.cardiopatiaIsquemica), source: "Historia" },
                    { id: 'lee_icc', label: "Insuficiencia Cardiaca", points: 1, auto: !!(data.icc), source: "Historia/Física" },
                    { id: 'lee_evc', label: "Historia EVC / AIT", points: 1, auto: !!(data.evc), source: "Neuro" },
                    { id: 'lee_insulin', label: "Diabetes con Insulina", points: 1, auto: !!(data.diabetes && data.usaInsulina), source: "Endocrino" },
                    { id: 'lee_renal', label: "Creatinina > 2.0 mg/dL o TFG < 60", points: 1, auto: !!(data.creatinina > 2.0 || (data.tfg && data.tfg < 60)), source: "Labs" },
                ];
            }
            else if (selectedScale === 'gupta') {
                title = "Gupta MICA (NSQIP)";
                riskStr = `Probabilidad IAM/Paro 30 días: ${data.gupta}%`;
                content = (
                    <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded text-center">
                            <span className="text-3xl font-bold text-clinical-navy">{data.gupta}%</span>
                            <p className="text-[10px] uppercase text-gray-500">Riesgo Calculado</p>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b pb-1"><span>Edad:</span> <b>{data.edad} años</b></div>
                            <div className="flex justify-between border-b pb-1"><span>Creatinina:</span> <b>{data.creatinina}</b></div>
                            <div className="flex justify-between border-b pb-1"><span>Estado Funcional:</span> <b>{data.functional_status === 'independent' ? 'Independiente' : 'Dependiente'}</b></div>
                            <div className="flex justify-between border-b pb-1"><span>ASA:</span> <b>{data.asa}</b></div>
                            <div className="flex justify-between border-b pb-1"><span>Sitio Qx:</span> <b>{data.gupta_surgical_site}</b></div>
                        </div>
                    </div>
                );
            }
            else if (selectedScale === 'duke') {
                title = "Criterios de Duke (Endocarditis)";
                riskStr = `Diagnóstico: ${data.duke_resultado}`;
                // Simplified Duke View
                content = (
                    <div className="space-y-3">
                        <div className={`p-2 text-center text-white font-bold rounded ${data.duke_resultado === 'Definitivo' ? 'bg-red-600' : data.duke_resultado === 'Posible' ? 'bg-amber-500' : 'bg-green-600'}`}>
                            {data.duke_resultado}
                        </div>
                        <div className="text-xs space-y-2">
                            <p className="font-bold border-b">Mayores (Detectados)</p>
                            {data.duke_mayor_hemocultivo && <div className="text-red-600">• Hemocultivos (+)</div>}
                            {data.duke_mayor_eco && <div className="text-red-600">• Ecocardiograma (+)</div>}
                            {data.duke_mayor_regurgitacion && <div className="text-red-600">• Nueva Regurgitación</div>}
                            {!data.duke_mayor_hemocultivo && !data.duke_mayor_eco && !data.duke_mayor_regurgitacion && <span className="text-gray-400 italic">Ninguno</span>}

                            <p className="font-bold border-b mt-2">Menores (Detectados)</p>
                            {data.duke_menor_fiebre && <div className="text-red-600">• Fiebre ({data.temp}°C)</div>}
                            {data.duke_menor_predisposicion && <div className="text-red-600">• Predisposición Cardíaca</div>}
                            {/* ... others ... */}
                        </div>
                    </div>
                );
            }
            else if (selectedScale === 'cha2ds2vasc') {
                title = "CHA₂DS₂-VASc (Riesgo Ictus)";
                riskStr = `Riesgo Anual Ictus: ${data.cha2ds2vasc === 0 ? '0%' : data.cha2ds2vasc === 1 ? '1.3%' : data.cha2ds2vasc === 2 ? '2.2%' : data.cha2ds2vasc === 3 ? '3.2%' : data.cha2ds2vasc === 4 ? '4.0%' : data.cha2ds2vasc === 5 ? '6.7%' : data.cha2ds2vasc === 6 ? '9.8%' : '9.6 - 15.2%'}`;
                criteria = [
                    { id: 'cha_c', label: "Insuficiencia Cardíaca (C)", points: 1, auto: !!data.icc, source: "Historia" },
                    { id: 'cha_h', label: "Hipertensión (H)", points: 1, auto: !!data.hta, source: "Historia" },
                    { id: 'cha_a2', label: "Edad >= 75 años (A₂)", points: 2, auto: data.edad >= 75, source: "ID" },
                    { id: 'cha_d', label: "Diabetes (D)", points: 1, auto: !!data.diabetes, source: "Historia" },
                    { id: 'cha_s2', label: "Ictus / AIT / Tromboembolismo (S₂)", points: 2, auto: !!data.evc, source: "Neuro" },
                    { id: 'cha_v', label: "Enf. Vascular (IAM, EAP, Placa) (V)", points: 1, auto: !!(data.cardiopatiaIsquemica || data.icc_historia_eap || data.flag_iam_reciente || data.flag_evc_agudo), source: "Historia" }, // Simplified vascular check
                    { id: 'cha_a', label: "Edad 65-74 años (A)", points: 1, auto: data.edad >= 65 && data.edad < 75, source: "ID" },
                    { id: 'cha_sc', label: "Sexo Femenino (Sc)", points: 1, auto: data.genero === 'Fem', source: "ID" },
                ];
            }
            else if (selectedScale === 'hasbled') {
                title = "HAS-BLED (Riesgo Sangrado)";
                riskStr = `Puntaje: ${data.hasbled} (${data.hasbled >= 3 ? 'ALTO RIESGO' : 'Riesgo Bajo/Mod'})`;

                // For HAS-BLED we have some manual toggles mixed with auto
                content = (
                    <div className="space-y-4">
                        <div className="bg-orange-50 p-2 rounded text-xs text-orange-900 border border-orange-100">
                            <p>Evalúa riesgo de sangrado mayor en pacientes con FA anticoagulados.</p>
                        </div>

                        <div className="space-y-2">
                            {/* Auto Items */}
                            <div className={`flex justify-between p-2 rounded border ${data.hta && data.hta_control === 'descontrolada' ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">H: Hipertensión Descontrolada</span>
                                <span className="text-xs font-bold">{data.hta && data.hta_control === 'descontrolada' ? '+1' : '0'}</span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.creatinina > 2.26 || data.erc_dialisis || (data.tfg && data.tfg < 60) || data.hepatopatia ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold">A: Fx Renal o Hepática Anormal (1 pto c/u)</span>
                                    <span className="text-[9px] text-gray-500">Cr &gt; 2.26, TFG &lt; 60, Diálisis, Cirrosis</span>
                                </div>
                                <span className="text-xs font-bold inline-flex items-center">
                                    {((data.creatinina > 2.26 || data.erc_dialisis || (data.tfg && data.tfg < 60)) ? 1 : 0) + (data.hepatopatia ? 1 : 0)} pts
                                </span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.evc ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">S: Stroke (Ictus previo)</span>
                                <span className="text-xs font-bold">{data.evc ? '+1' : '0'}</span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.coagulopatia || data.inr > 1.2 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">B: Bleeding (Hx o Predisposición)</span>
                                <span className="text-xs font-bold">{data.coagulopatia || data.inr > 1.2 ? '+1' : '0'}</span>
                            </div>

                            {/* Manual / Mixed Items */}
                            <label className={`flex justify-between items-center p-2 rounded border cursor-pointer ${watch('hasbled_inr_labil') ? 'bg-red-50 border-red-200' : 'bg-white hover:bg-gray-50'}`}>
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <input type="checkbox" {...register('hasbled_inr_labil')} className="w-4 h-4 text-clinical-navy rounded" />
                                    L: INR Lábil (TTR {'<'} 60%)
                                </span>
                                <span className="text-xs font-bold">{watch('hasbled_inr_labil') ? '+1' : '0'}</span>
                            </label>

                            <div className={`flex justify-between p-2 rounded border ${data.edad > 65 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">E: Elderly (Edad &gt; 65)</span>
                                <span className="text-xs font-bold">{data.edad > 65 ? '+1' : '0'}</span>
                            </div>

                            <label className={`flex justify-between items-center p-2 rounded border cursor-pointer ${watch('hasbled_alcohol') ? 'bg-red-50 border-red-200' : 'bg-white hover:bg-gray-50'}`}>
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <input type="checkbox" {...register('hasbled_alcohol')} className="w-4 h-4 text-clinical-navy rounded" />
                                    D: Drogas / Alcohol ({'>'} 8 copas/sem)
                                </span>
                                <span className="text-xs font-bold">{watch('hasbled_alcohol') ? '+1' : '0'}</span>
                            </label>
                        </div>
                    </div>
                );
            }

            if (!content) {
                content = (
                    <div className="space-y-2">
                        <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded mb-3 flex items-start gap-2">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <p>Los criterios en <span className="font-bold text-red-600">ROJO</span> están presentes. <span className="font-bold text-green-600">VERDE</span> ausentes.</p>
                        </div>
                        {criteria.map((c) => {
                            const isAuto = c.auto === true;
                            const isChecked = overrides[c.id] !== undefined ? overrides[c.id] : isAuto;

                            return (
                                <div
                                    key={c.id}
                                    onClick={() => toggleOverride(c.id, isAuto)}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none 
                                    ${isChecked ? 'bg-red-50 border-red-200' : 'bg-green-50/50 border-green-100 hover:bg-green-100'}`}
                                >
                                    <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded border transition-colors 
                                      ${isChecked ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 bg-white'}`}>
                                        {isChecked && <CheckSquare size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className={`text-sm font-bold ${isChecked ? 'text-red-900' : 'text-slate-500'}`}>{c.label}</span>
                                            <span className="text-xs font-bold text-gray-400">+{c.points}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] uppercase tracking-wide text-gray-400 bg-white px-1 rounded border">{c.source}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            }
        }

        return (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scaleIn">
                    <div className="bg-clinical-navy p-4 flex justify-between items-center text-white shrink-0 rounded-t-xl">
                        <div>
                            <h3 className="font-bold flex items-center gap-2 text-lg"><Search size={20} /> {title}</h3>
                            {riskStr && <p className="text-xs text-blue-200 mt-1 font-mono">{riskStr}</p>}
                        </div>
                        <button onClick={() => setSelectedScale(null)}><XSquare size={24} /></button>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1">
                        {content}
                    </div>

                    <div className="p-3 border-t bg-gray-50 text-right shrink-0 rounded-b-xl">
                        <button onClick={() => setSelectedScale(null)} className="px-5 py-2.5 bg-clinical-navy text-white text-sm font-bold rounded-lg shadow hover:bg-blue-900 transition-colors">
                            Cerrar Panel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {selectedScale && <AuditModal />}

            <div className="flex items-center gap-2 mb-2 px-1">
                <ClipboardCheck className="text-clinical-navy" size={20} />
                <h2 className="text-lg font-bold text-slate-800">Escalas y Riesgo</h2>
            </div>

            <div className="space-y-3">

                {/* ASA */}
                <ScaleCard label="ASA" desc="Estado Físico" autoCalc={true} onClick={() => setSelectedScale('asa')}>
                    <div className="relative">
                        <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <span className="text-2xl font-bold text-blue-900">{watch('asa')}</span>
                            {data.asa_manual_class && <span className="block text-[10px] text-amber-600 font-bold uppercase">(Forzado Manual)</span>}
                        </div>
                    </div>
                </ScaleCard>

                {/* --- CAPRINI (TRIGGER ONLY) --- */}
                <ScaleCard
                    label="CAPRINI"
                    desc="Riesgo Trombótico"
                    autoCalc={true}
                    onClick={() => setSelectedScale('caprini')} // Restore full clickability
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-16 p-2 bg-blue-50 border border-blue-200 rounded-lg text-center font-bold text-xl text-blue-900">
                                {watch('caprini')}
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block">Puntos Totales</span>
                                <span className={`text-xs font-bold ${watch('caprini') >= 5 ? 'text-red-600' : 'text-slate-700'}`}>
                                    {watch('caprini') >= 5 ? 'ALTO RIESGO' : watch('caprini') >= 3 ? 'MODERADO' : 'BAJO'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Dedicated Button for Caprini - Z-Index 20 to sit above overlay */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScale('caprini');
                        }}
                        className="relative z-20 w-full py-2 bg-white border border-clinical-navy text-clinical-navy hover:bg-blue-50 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors mt-1"
                    >
                        <AlertCircle size={14} />
                        Abrir Checklist Completo
                    </button>
                </ScaleCard>

                {/* --- CARDIAC SCALES GRID (CLICKABLE AUDIT) --- */}
                <div className="grid grid-cols-2 gap-3">
                    <ScaleCard label="LEE (RCRI)" desc="Riesgo CV" autoCalc={true} onClick={() => setSelectedScale('lee')}>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-clinical-navy">{watch('lee')}</span>
                            <p className="text-[10px] text-gray-400">Clase I-IV</p>
                        </div>
                    </ScaleCard>

                    <ScaleCard label="GOLDMAN" desc="Original '77" autoCalc={true} onClick={() => setSelectedScale('goldman')}>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-clinical-navy">{watch('goldman')}</span>
                            <p className="text-[10px] text-gray-400">Clase I-IV</p>
                        </div>
                    </ScaleCard>

                    <ScaleCard label="DETSKY" desc="Modificado" autoCalc={true} onClick={() => setSelectedScale('detsky')}>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-clinical-navy">{watch('detsky')}</span>
                            <p className="text-[10px] text-gray-400">Clase I-III</p>
                        </div>
                    </ScaleCard>

                    <ScaleCard label="GUPTA" desc="MICA (NSQIP)" autoCalc={true} onClick={() => setSelectedScale('gupta')}>
                        <div className="text-center flex flex-col items-center justify-center">
                            <span className={`text-xl font-bold ${(watch('gupta') || 0) > 1 ? 'text-red-600' : 'text-clinical-navy'}`}>
                                {watch('gupta') || 0}%
                            </span>
                            <p className="text-[10px] text-gray-400">Riesgo IAM/Paro</p>
                        </div>
                    </ScaleCard>

                    {/* DUKE CARD */}
                    <ScaleCard label="DUKE" desc="Endocarditis" autoCalc={true} onClick={() => setSelectedScale('duke')}>
                        <div className="text-center flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1 mb-1">
                                <Bug size={14} className={watch('duke_resultado') === 'Definitivo' ? 'text-red-600' : 'text-gray-400'} />
                            </div>
                            <span className={`text-lg font-bold ${watch('duke_resultado') === 'Definitivo' ? 'text-red-600 animate-pulse' :
                                watch('duke_resultado') === 'Posible' ? 'text-amber-600' : 'text-clinical-navy'
                                }`}>
                                {watch('duke_resultado') || 'Rechazado'}
                            </span>
                            <p className="text-[10px] text-gray-400">Criterios Modificados</p>
                        </div>
                    </ScaleCard>

                    {/* CHA2DS2-VASc CARD */}
                    <ScaleCard label="CHA₂DS₂-VASc" desc="Riesgo Cardioembólico" autoCalc={true} onClick={() => setSelectedScale('cha2ds2vasc')}>
                        <div className="text-center flex flex-col items-center justify-center">
                            <span className={`text-xl font-bold ${(watch('cha2ds2vasc') || 0) >= 2 ? 'text-red-600' : 'text-clinical-navy'}`}>
                                {watch('cha2ds2vasc') || 0}
                            </span>
                            <p className="text-[10px] text-gray-400">Puntos</p>
                        </div>
                    </ScaleCard>

                    {/* HAS-BLED CARD */}
                    <ScaleCard label="HAS-BLED" desc="Riesgo Sangrado" autoCalc={true} onClick={() => setSelectedScale('hasbled')}>
                        <div className="text-center flex flex-col items-center justify-center">
                            <span className={`text-xl font-bold ${(watch('hasbled') || 0) >= 3 ? 'text-red-600' : 'text-clinical-navy'}`}>
                                {watch('hasbled') || 0}
                            </span>
                            <p className="text-[10px] text-gray-400">Puntos</p>
                        </div>
                    </ScaleCard>
                </div>

            </div>
        </div>
    );
};

export default RiskScales;