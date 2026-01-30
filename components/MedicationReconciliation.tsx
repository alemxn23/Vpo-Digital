import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData, SelectedMed } from '../types';
import { Pill, Search, X, AlertTriangle, Syringe, Tablets, RefreshCcw, CheckCircle, Ban, ArrowRightLeft, Info, ChevronRight, Activity, ShieldAlert } from 'lucide-react';
import { MEDICATIONS_DB } from '../data/medications';
import { fetchDrugSafetyInfo, FDASafetyInfo } from '../custom_services/OpenFDAClient';
import { getMedicationRecommendation, MedicationRecommendation } from '../custom_services/PharmacologyEngine';
import { searchOpenFDAMeds } from '../custom_services/UniversalSearchService';
import { Shield, CloudOff, FileText, Database, Zap } from 'lucide-react';
import { checkMedicationInteractions, InteractionResult } from '../custom_services/DDIClient';

const MedicationReconciliation: React.FC = () => {
    const { setValue, watch } = useFormContext<VPOData>();
    const selectedMeds = watch('selectedMeds') || [];
    const formData = watch();

    // State for Search & Modals
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMeds, setFilteredMeds] = useState<SelectedMed[]>([]);

    // API Search State
    const [apiResults, setApiResults] = useState<any[]>([]);
    const [isSearchingApi, setIsSearchingApi] = useState(false);
    const [interactions, setInteractions] = useState<InteractionResult[]>([]);
    const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);

    const [activeModalMed, setActiveModalMed] = useState<{ med: SelectedMed, rec: MedicationRecommendation, fda?: FDASafetyInfo | null, loadingFda?: boolean, isChronic?: boolean, fdaWarning?: string, dose?: number } | null>(null);
    const [isBlackBoxOpen, setIsBlackBoxOpen] = useState(false);

    // FDA Verification Handler
    // -------------------------------------------------------------------------
    //  AUTO-VERIFY FDA & STRESS DOSE PERSISTENCE
    // -------------------------------------------------------------------------

    // Enhanced wrapper for verify FDA that returns the warning string
    const performFDACheck = async (medToCheck: SelectedMed): Promise<string | undefined> => {
        try {
            const searchTerm = medToCheck.englishName || medToCheck.name; // Corrected to medToCheck.name
            const info = await fetchDrugSafetyInfo(searchTerm);
            if (info && info.hasBoxedWarning) {
                return info.boxedWarning[0] || 'Boxed Warning Detectado';
            }
            return undefined;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    };

    const handleConfirmAddMed = async () => {
        if (!activeModalMed) return;

        // 1. Get Recommendation from Engine (Centralized Logic)
        // This calculates Stress Doses, Bridge needs, etc. based on updated Patient Data
        const engineRec = getMedicationRecommendation(
            { ...activeModalMed.med, isChronic: activeModalMed.isChronic }, // Pass updated chronic state
            formData
        );

        let stressDoseRec = engineRec.stressDoseRecommendation;

        // 2. Add Med to List (Opt-in to wait for FDA check or do it in background? Doing it before add for simplicity)
        // Check FDA if not already checked manually in modal
        let fdaWarn = activeModalMed.fdaWarning;
        if (!fdaWarn) {
            // Try auto-fetch one last time or rely on what was found
            const foundWarn = await performFDACheck(activeModalMed.med);
            if (foundWarn) fdaWarn = foundWarn;
        }

        const newMed: SelectedMed = {
            ...activeModalMed.med,
            // Override with specific logic from modal
            instructions: activeModalMed.isChronic ? (engineRec.instructions) : activeModalMed.med.instructions, // Use Engine instructions if chronic/modified
            alertLevel: engineRec.alertLevel, // Use Engine alert level
            isChronic: activeModalMed.isChronic,
            stressDoseRecommendation: stressDoseRec,
            fdaWarning: fdaWarn,
            dose: activeModalMed.dose !== undefined ? activeModalMed.dose : activeModalMed.med.dose
        };

        // If it was already in list (editing), replace it. Else add.
        const exists = selectedMeds.find(m => m.id === newMed.id);
        let updatedMeds;
        if (exists) {
            updatedMeds = selectedMeds.map(m => m.id === newMed.id ? newMed : m);
        } else {
            updatedMeds = [...selectedMeds, newMed];
        }
        setValue('selectedMeds', updatedMeds);

        setActiveModalMed(null);
    };

    // Auto-trigger FDA check when opening specific meds? Or just do it on 'Confirm'.
    // Better UX: Do it when opening modal so user sees it.
    useEffect(() => {
        if (activeModalMed && !activeModalMed.fda && !activeModalMed.loadingFda) {
            // Auto-fetch FDA on modal open
            setActiveModalMed(prev => prev ? { ...prev, loadingFda: true } : null);

            let searchTerm = activeModalMed.med.englishName;
            if (!searchTerm) {
                searchTerm = activeModalMed.med.name.split('(')[0].trim();
            }
            fetchDrugSafetyInfo(searchTerm).then(info => {
                setActiveModalMed(prev => prev ? {
                    ...prev,
                    fda: info || null,
                    loadingFda: false,
                    fdaWarning: (info && info.hasBoxedWarning) ? (info.boxedWarning[0]) : undefined
                } : null);
            });
        }
    }, [activeModalMed?.med.id]); // Only run when med ID changes (modal opens)


    const handleVerifyFDA = async () => {
        // Manual trigger already handled by effect mostly, but keep button
        if (!activeModalMed) return;
        setActiveModalMed(prev => prev ? { ...prev, loadingFda: true } : null);
        let searchTerm = activeModalMed.med.englishName;

        if (!searchTerm) {
            // Fallback: Clean up Spanish name (remove parens like "(Ozempic)")
            searchTerm = activeModalMed.med.name.split('(')[0].trim();
        }
        const info = await fetchDrugSafetyInfo(searchTerm);
        setActiveModalMed(prev => prev ? {
            ...prev,
            fda: info || null,
            loadingFda: false,
            fdaWarning: (info && info.hasBoxedWarning) ? (info.boxedWarning[0]) : undefined
        } : null);
    };

    // ... (rest of component logic)

    // Debounce for API
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                // 1. Filter Local
                const normalizeText = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                const searchNormalized = normalizeText(searchTerm);

                const local = MEDICATIONS_DB.filter(m => {
                    const nameNormalized = normalizeText(m.name);
                    const matchesName = nameNormalized.includes(searchNormalized);
                    const matchesCategory = normalizeText(m.category).includes(searchNormalized);
                    const matchesKeyword = m.keywords?.some(k => normalizeText(k).includes(searchNormalized));
                    return (matchesName || matchesCategory || matchesKeyword) && !selectedMeds.some(s => s.id === m.id);
                });
                setFilteredMeds(local);

                // 2. If low local results, fetch API (Universal Search)
                if (searchTerm.length >= 3) {
                    setIsSearchingApi(true);
                    try {
                        const results = await searchOpenFDAMeds(searchTerm);
                        // Filter out duplicates that match local DB by name (approx)
                        const newResults = results.filter(r =>
                            !local.some(l => l.name.toLowerCase() === r.openfda.brand_name?.[0]?.toLowerCase())
                        );
                        setApiResults(newResults);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setIsSearchingApi(false);
                    }
                } else {
                    setApiResults([]);
                }
            } else {
                setFilteredMeds([]);
                setApiResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedMeds]);

    // DDI Checker Effect
    useEffect(() => {
        const checkInteractions = async () => {
            if (selectedMeds.length < 2) {
                setInteractions([]);
                return;
            }
            setIsLoadingInteractions(true);
            try {
                const names = selectedMeds.map(m => m.englishName || m.name);
                const results = await checkMedicationInteractions(names);
                setInteractions(results);
            } catch (error) {
                console.error("DDI Check failed", error);
            } finally {
                setIsLoadingInteractions(false);
            }
        };

        const timeout = setTimeout(checkInteractions, 1500);
        return () => clearTimeout(timeout);
    }, [selectedMeds.length]);

    const handleAddApiMed = (apiResult: any) => {
        const brandName = apiResult.openfda.brand_name?.[0] || "Desconocido";
        const genericName = apiResult.openfda.generic_name?.[0] || "Fármaco Extendido";

        const newUnclassifiedMed: SelectedMed = {
            id: apiResult.id,
            name: brandName,
            englishName: brandName,
            category: 'No Clasificado',
            action: 'adjust',
            alertLevel: 'yellow',
            daysPrior: 0,
            instructions: `Fármaco no protocolizado (${genericName}). Verifique Boxed Warning.`,
            fdaWarning: undefined
        };
        handleAddMed(newUnclassifiedMed);
    };

    const handleAddMed = (medDbItem: SelectedMed) => {
        setSearchTerm('');
        setFilteredMeds([]);
        setApiResults([]);

        // 1. Run Engine Logic
        const rec = getMedicationRecommendation(medDbItem, formData);

        // 2. Prepare Base Med Object
        const newMed: SelectedMed = {
            ...medDbItem,
            action: rec.action,
            daysPrior: rec.daysPrior,
            alertLevel: rec.alertLevel,
            instructions: rec.instructions,
            dose: 0,
            route: 'VO' // Default
        };

        // 3. Check for specific modals needed based on Med Type or Engine Flags
        if (medDbItem.isSteroid || medDbItem.isAnticoagulant || medDbItem.isGLP1 || rec.alertLevel === 'red') {
            setActiveModalMed({ med: newMed, rec: rec });
        } else {
            // Direct Add
            setValue('selectedMeds', [...selectedMeds, newMed]);
        }
    };

    const confirmModalMed = (finalMed: SelectedMed) => {
        setValue('selectedMeds', [...selectedMeds, finalMed]);
        setActiveModalMed(null);
    };

    const removeMed = (id: string) => setValue('selectedMeds', selectedMeds.filter(m => m.id !== id));

    const updateDose = (id: string, newDoseStr: string) => {
        const newDose = parseFloat(newDoseStr);
        const updated = selectedMeds.map(m => m.id === id ? { ...m, dose: isNaN(newDose) ? 0 : newDose } : m);
        setValue('selectedMeds', updated);
    };

    const changeRoute = (id: string, newRoute: string) => {
        const updated = selectedMeds.map(m => m.id === id ? { ...m, route: newRoute as any } : m);
        setValue('selectedMeds', updated);
        // Note: Use Engine to re-eval if route changes? 
        // For now, bioequivalence logic is a bit specific, we can keep it simple or re-add it.
    };

    // Re-run Engine on entire list (Manual Refresh or Effect)
    const refreshRecommendations = () => {
        const updatedList = selectedMeds.map(med => {
            const rec = getMedicationRecommendation(med, formData);
            return {
                ...med,
                action: rec.action,
                daysPrior: rec.daysPrior,
                alertLevel: rec.alertLevel,
                instructions: rec.instructions
            };
        });
        setValue('selectedMeds', updatedList);
    };

    // Auto-refresh when critical factors change? 
    // Careful with infinite loops. Let's provide a visual indicator or just do it on Mount.

    // --- BRIDGE THERAPY LOGIC ---
    const isHighRiskThrombotic = (formData.cha2ds2vasc || 0) > 5 || (formData.caprini || 0) >= 5 || formData.evc || formData.valvula_protesis;
    const hasEnoxaparin = selectedMeds.some(m => m.name.toLowerCase().includes('enoxaparina'));

    const addEnoxaparinBridge = () => {
        const weight = formData.peso || 70;
        const renalAdjust = (formData.tfg || 90) < 30;
        const dose = weight; // 1mg/kg
        const freq = renalAdjust ? '24h' : '12h';

        const enoxaparin: SelectedMed = {
            id: `enox-${Date.now()}`,
            name: "Enoxaparina (Terapia Puente)",
            category: "Anticoagulante",
            dose: dose,
            route: "SC",
            action: "continue",
            alertLevel: "green",
            instructions: `Dosis Terapéutica: ${dose}mg subcutánea cada ${freq}. Iniciar 24h después del procedimiento.`,
            isAnticoagulant: true,
            daysPrior: 0
        };
        setValue('selectedMeds', [...selectedMeds, enoxaparin]);
    };

    const renderSearchResults = () => {
        if (filteredMeds.length === 0 && apiResults.length === 0 && !isSearchingApi && searchTerm.length > 3) {
            return (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-4 text-center text-xs text-gray-400 italic">
                    No se encontraron resultados.
                </ul>
            );
        }

        if (filteredMeds.length === 0 && apiResults.length === 0 && !isSearchingApi) return null;

        return (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto animate-fadeIn divide-y divide-gray-100">
                {/* Local Matches */}
                {filteredMeds.length > 0 && (
                    <li className="bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Base de Datos Curada
                    </li>
                )}
                {filteredMeds.map(med => (
                    <li key={med.id} onClick={() => handleAddMed(med)} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700 group-hover:text-clinical-navy">{med.name}</span>
                            {med.category && <span className="text-[10px] text-gray-400">{med.category}</span>}
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold text-white ${med.alertLevel === 'red' ? 'bg-red-500' : med.alertLevel === 'yellow' ? 'bg-amber-500' : 'bg-green-500'}`}>
                            {med.action === 'stop' ? 'Suspender' : med.action === 'adjust' ? 'Ajustar' : 'Continuar'}
                        </span>
                    </li>
                ))}

                {/* API Matches */}
                {(apiResults.length > 0 || isSearchingApi) && (
                    <li className="bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-t flex justify-between items-center">
                        <span>Búsqueda Universal (FDA)</span>
                        {isSearchingApi && <span className="animate-pulse text-clinical-navy">Buscando...</span>}
                    </li>
                )}

                {apiResults.map(res => (
                    <li key={res.id} onClick={() => handleAddApiMed(res)} className="p-3 hover:bg-yellow-50 cursor-pointer flex justify-between items-center group transition-colors">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700 group-hover:text-clinical-navy flex items-center gap-1">
                                {res.openfda.brand_name?.[0]}
                                <Shield size={10} className="text-gray-300" />
                            </span>
                            <span className="text-[10px] text-gray-400 italic">{res.openfda.generic_name?.[0]?.substring(0, 30)}...</span>
                        </div>
                        <span className="text-[9px] px-2 py-1 rounded border border-gray-200 text-gray-500 font-medium">
                            No Clasificado
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="space-y-6">

            {/* BRIDGE THERAPY ALERT */}
            {isHighRiskThrombotic && !hasEnoxaparin && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex justify-between items-center animate-pulse-gentle">
                    <div className="flex items-start gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                            <ShieldAlert className="text-red-600" size={24} />
                        </div>
                        <div>
                            <h4 className="text-red-900 font-bold text-sm uppercase">ALTO RIESGO TROMBÓTICO DETECTADO</h4>
                            <p className="text-red-700 text-xs mt-1 max-w-lg">
                                Paciente con CHA₂DS₂-VASc {'>'} 5, Antecedente de EVC o Prótesis Valvular.
                                Se recomienda considerar <b>Esquema de Puente (Bridge Therapy)</b>.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={addEnoxaparinBridge}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow flex items-center gap-2 transition-colors"
                    >
                        <Syringe size={16} />
                        Agregar Enoxaparina ({formData.peso || 70}mg)
                    </button>
                </div>
            )}

            {/* --- MODAL FOR CONFIRMATION / WARNINGS --- */}
            {activeModalMed && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className={`p-4 text-white flex justify-between items-center ${activeModalMed.rec.alertLevel === 'red' ? 'bg-red-600' : 'bg-clinical-navy'}`}>
                            <h3 className="font-bold flex items-center gap-2">
                                {activeModalMed.rec.alertLevel === 'red' ? <AlertTriangle size={20} /> : <Info size={20} />}
                                {activeModalMed.med.name}
                            </h3>
                            <button onClick={() => setActiveModalMed(null)}><X size={20} /></button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className={`p-4 rounded-lg border ${activeModalMed.rec.alertLevel === 'red' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                                <h4 className="font-bold text-sm uppercase mb-2">Recomendación del Motor (Basada en Evidencia)</h4>
                                <p className="text-sm font-medium leading-relaxed">
                                    {activeModalMed.rec.instructions}
                                </p>
                                {activeModalMed.rec.rationale && (
                                    <p className="text-xs mt-2 opacity-80 italic">Razonamiento: {activeModalMed.rec.rationale}</p>
                                )}
                                <div className="mt-3 flex items-center justify-end">
                                    <span className="text-[10px] bg-white/50 px-2 py-1 rounded text-blue-900 flex items-center gap-1 font-bold">
                                        {activeModalMed.med.category === 'No Clasificado' ? (
                                            <>
                                                <CloudOff size={10} /> Fuente: OpenFDA Label Data (FDA.gov)
                                            </>
                                        ) : (
                                            <>
                                                <Database size={10} /> Fuente: Protocolo VPO / Guías ACC/AHA
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Special Inputs based on Type */}
                            {activeModalMed.med.isSteroid && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Dosis Habitual (mg)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-2 text-lg font-bold"
                                        placeholder="0"
                                        autoFocus
                                        onChange={(e) => setActiveModalMed({
                                            ...activeModalMed,
                                            med: { ...activeModalMed.med, dose: parseFloat(e.target.value) }
                                        })}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Ingrese dosis diaria para cálculo de equivalencia.</p>
                                </div>
                            )}

                            {activeModalMed.rec.bridgeRequired && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs font-bold">
                                    ⚠️ REQUIERE TERAPIA PUENTE. Se agregará Enoxaparina automáticamente.
                                </div>
                            )}

                            {/* STEROID SPECIFIC LOGIC */}
                            {activeModalMed.med.isSteroid && (
                                <div className="space-y-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <div className="flex items-start gap-2">
                                        <input
                                            type="checkbox"
                                            id="chronicCheck"
                                            className="mt-1"
                                            checked={activeModalMed.isChronic || false}
                                            onChange={(e) => setActiveModalMed({ ...activeModalMed, isChronic: e.target.checked })}
                                        />
                                        <label htmlFor="chronicCheck" className="text-xs text-indigo-900 font-medium cursor-pointer">
                                            <b>¿Uso Crónico?</b> ({'>'}3 semanas, dosis altas, o fenotipo Cushingoide)
                                        </label>
                                    </div>

                                    {activeModalMed.isChronic && (
                                        <div className="bg-white p-3 rounded border border-indigo-200 animate-fadeIn">
                                            <h5 className="font-bold text-xs text-indigo-800 uppercase mb-1">Pauta Dosis de Estrés</h5>
                                            <p className="text-[10px] text-gray-500 mb-2">
                                                Basado en Cirugía: <b>{formData.gupta_surgical_site || 'No especificada'}</b>
                                            </p>

                                            {(() => {
                                                // Stress Dose Calculator Logic inline
                                                const site = formData.gupta_surgical_site || 'minor';
                                                let risk = 'minor';

                                                const modRisk = ['abdominal', 'orthopedic', 'spine', 'head-neck'];
                                                const highRisk = ['cardiac', 'aortic', 'transplant', 'esopha'];
                                                // Mapping simplistic for demo
                                                if (modRisk.some(r => site.includes(r))) risk = 'moderate';
                                                if (highRisk.some(r => site.includes(r))) risk = 'severe';
                                                if (formData.capB_cxMayor) risk = 'moderate'; // Default major

                                                const weight = formData.peso || 70;
                                                const hydroDose = weight < 40 ? '25mg' : (risk === 'severe' ? '100mg' : (risk === 'moderate' ? '50mg' : '25mg'));
                                                const maintainDose = risk === 'severe' ? '50mg c/8h' : (risk === 'moderate' ? '25mg c/8h' : 'Dosis usual');

                                                return (
                                                    <ul className="text-xs space-y-1 text-indigo-900">
                                                        <li>🛡️ <b>Inducción:</b> Hidrocortisona {hydroDose} IV.</li>
                                                        {risk !== 'minor' && (
                                                            <li>🕓 <b>Mantenimiento:</b> Hidrocortisona {maintainDose} por 24h, luego reducir.</li>
                                                        )}
                                                        {risk === 'minor' && (
                                                            <li>💊 <b>Post-op:</b> Continuar dosis habitual en cuanto tolere VO.</li>
                                                        )}
                                                        <li className="text-[10px] italic text-indigo-500 mt-1">
                                                            *Ajustado a peso ({weight}kg) y riesgo Qx.
                                                        </li>
                                                    </ul>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FDA VERIFICATION SECTION */}
                            <div className="border-t pt-3 mt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-xs uppercase text-gray-400 flex items-center gap-1">
                                        <ShieldAlert size={12} /> Verificación Externa (OpenFDA)
                                    </h4>
                                    {!activeModalMed.fda && !activeModalMed.loadingFda && (
                                        <button
                                            onClick={handleVerifyFDA}
                                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded transition-colors"
                                        >
                                            Consultar Advertencias
                                        </button>
                                    )}
                                </div>

                                {activeModalMed.loadingFda && (
                                    <div className="p-3 bg-gray-50 rounded text-center text-xs text-gray-400 animate-pulse">
                                        Conectando con api.fda.gov...
                                    </div>
                                )}

                                {activeModalMed.fda && (
                                    <div className="space-y-2 animate-fadeIn">
                                        {activeModalMed.fda.hasBoxedWarning ? (
                                            <div className="border border-red-800 rounded overflow-hidden">
                                                {/* Collapsible Header */}
                                                <div
                                                    onClick={() => setIsBlackBoxOpen(!isBlackBoxOpen)}
                                                    className="p-3 bg-black text-white flex items-center justify-between cursor-pointer hover:bg-gray-900 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                                                        <span className="font-bold text-xs uppercase tracking-wider text-red-500">
                                                            ⚠️ BLACK BOX WARNING DETECTADO
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={16} className={`text-gray-400 transition-transform ${isBlackBoxOpen ? 'rotate-90' : ''}`} />
                                                </div>

                                                {/* Collapsible Content */}
                                                {isBlackBoxOpen && (
                                                    <div className="p-3 bg-gray-900 text-gray-300 text-[10px] leading-relaxed border-t border-gray-800 animate-slideDown">
                                                        <p className="opacity-90">{activeModalMed.fda.boxedWarning[0]}</p>
                                                        <p className="mt-2 text-xs italic text-gray-500">
                                                            *Texto original de la FDA (Inglés).
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-green-50 text-green-800 rounded text-center text-xs font-bold border border-green-100">
                                                ✓ No se detectó Advertencia de Recuadro Negro (Black Box).
                                            </div>
                                        )}

                                        {activeModalMed.fda.contraindications.length > 0 && (
                                            <div className="text-[10px] text-gray-600 bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
                                                <span className="font-bold text-gray-700 block mb-1">Contraindicaciones (FDA):</span>
                                                {activeModalMed.fda.contraindications[0]}
                                            </div>
                                        )}

                                        <div className="text-[9px] text-right text-gray-300">
                                            Fuente: OpenFDA | {activeModalMed.fda.lastUpdated || 'Reciente'}
                                        </div>
                                    </div>
                                )}

                                {activeModalMed.fda === null && !activeModalMed.loadingFda && activeModalMed.loadingFda !== undefined && (
                                    <div className="p-2 bg-gray-50 text-gray-400 rounded text-center text-[10px] italic">
                                        No se encontró información oficial para "{activeModalMed.med.englishName || activeModalMed.med.name}".
                                        {(activeModalMed.med.englishName) ? ' (Búsqueda realizada en Inglés)' : ' Intente agregar el nombre en inglés.'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* (Original Buttons Section of Modal) */}
                        <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                            <button onClick={() => setActiveModalMed(null)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancelar</button>
                            <button
                                onClick={handleConfirmAddMed}
                                className="bg-clinical-navy text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-900"
                            >
                                Confirmar y Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <div className="flex items-center gap-2 mb-2 px-1 justify-between">
                <div className="flex items-center gap-2">
                    <Pill className="text-clinical-navy" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">Conciliación de Fármacos</h2>
                </div>
                <button onClick={refreshRecommendations} className="text-xs flex items-center gap-1 text-clinical-navy hover:underline">
                    <RefreshCcw size={12} /> Recalcular Riesgos
                </button>
            </div>

            <div className="relative">
                <div className="flex items-center bg-white border border-gray-300 rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-clinical-navy">
                    <Search className="text-gray-400 mr-2" size={20} />
                    <input
                        type="text"
                        className="w-full outline-none text-sm"
                        placeholder={`Buscar entre ${MEDICATIONS_DB.length} locales + Base Mundial FDA (Miles)...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearchingApi && <RefreshCcw size={14} className="animate-spin text-clinical-navy ml-2" />}
                </div>
                {renderSearchResults()}
            </div>

            <div className="space-y-3">
                {isLoadingInteractions && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs animate-pulse border border-blue-100">
                        <Zap size={14} className="animate-bounce" />
                        <span>Analizando interacciones medicamentosas en tiempo real...</span>
                    </div>
                )}

                {interactions.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {interactions.map((inter, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border flex items-start gap-3 animate-slideIn ${inter.severity === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'
                                }`}>
                                <AlertTriangle size={18} className={inter.severity === 'high' ? 'text-red-600 shrink-0 mt-0.5' : 'text-orange-600 shrink-0 mt-0.5'} />
                                <div>
                                    <div className="font-bold text-xs uppercase tracking-tight flex items-center gap-2">
                                        Interacción {inter.severity === 'high' ? 'CRÍTICA' : 'Importante'} Detectada
                                        <span className="bg-white/50 px-1.5 py-0.5 rounded text-[9px] border border-current/20 font-mono">
                                            {inter.pair[0]} + {inter.pair[1]}
                                        </span>
                                    </div>
                                    <p className="text-[11px] leading-tight mt-1 opacity-90">{inter.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                    {selectedMeds.length === 0 && <div className="col-span-2 text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">No hay fármacos agregados.</div>}

                    {selectedMeds.map(med => (
                        <div key={med.id} className={`p-3 rounded-lg border-l-4 shadow-sm text-sm bg-white transition-all ${med.alertLevel === 'red' ? 'border-l-red-500' : med.alertLevel === 'yellow' ? 'border-l-amber-500' : 'border-l-green-500'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800 text-base">{med.name} {med.isChronic && <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded border border-indigo-200">Crónico</span>}</span>
                                        <button onClick={() => removeMed(med.id)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1 bg-gray-50 border rounded px-1">
                                            <input type="number" placeholder="Dosis" value={med.dose || ''} onChange={(e) => updateDose(med.id, e.target.value)} className="w-12 bg-transparent text-xs p-1 outline-none text-right font-bold" />
                                            <span className="text-[10px] text-gray-500 mr-1">mg</span>
                                        </div>
                                        <div className="flex items-center bg-gray-100 rounded px-2 py-0.5">
                                            {med.route === 'IV' || med.route === 'SC' ? <Syringe size={12} className="mr-1 text-slate-500" /> : <Tablets size={12} className="mr-1 text-slate-500" />}
                                            <select
                                                value={med.route}
                                                onChange={(e) => changeRoute(med.id, e.target.value)}
                                                className="bg-transparent text-[10px] font-bold text-slate-600 outline-none uppercase cursor-pointer"
                                            >
                                                <option value="VO">VO</option><option value="IV">IV</option><option value="SC">SC</option><option value="Topica">Top</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Persistent FDA Warning */}
                            {med.fdaWarning && (
                                <div className="mb-2 p-2 bg-red-50 border border-red-100 rounded text-[10px] text-red-800 flex items-start gap-2">
                                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                    <span className="leading-tight font-medium">{med.fdaWarning}</span>
                                </div>
                            )}

                            {/* Persistent Stress Dose */}
                            {med.stressDoseRecommendation && (
                                <div className="mb-2 p-2 bg-indigo-50 border border-indigo-100 rounded text-[10px] text-indigo-800 flex items-start gap-2">
                                    <Activity size={12} className="shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="font-bold uppercase text-[9px] mb-0.5">Pauta Estrés Quirúrgico</span>
                                        <span className="leading-tight font-medium">{med.stressDoseRecommendation}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-2 mt-2 border-t pt-2 border-dashed border-gray-100">
                                {med.action === 'stop' && <Ban className="text-red-500 mt-0.5 shrink-0" size={14} />}
                                {med.action === 'adjust' && <RefreshCcw className="text-amber-500 mt-0.5 shrink-0" size={14} />}
                                {med.action === 'continue' && <CheckCircle className="text-green-500 mt-0.5 shrink-0" size={14} />}

                                <div className="w-full">
                                    <p className="font-bold text-xs uppercase mb-0.5" style={{ color: med.alertLevel === 'red' ? '#dc2626' : med.alertLevel === 'yellow' ? '#d97706' : '#16a34a' }}>
                                        {med.action === 'stop' ? `Suspender ${med.daysPrior} días antes` : med.action === 'adjust' ? 'Modificar Dosis' : 'Continuar'}
                                    </p>
                                    <p className="text-xs text-slate-600 font-medium leading-tight">{med.instructions}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MedicationReconciliation;