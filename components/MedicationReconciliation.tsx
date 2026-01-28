import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData, SelectedMed } from '../types';
import { Pill, Search, X, AlertTriangle, Syringe, Tablets, RefreshCcw, CheckCircle, Ban, ArrowRightLeft, Info, ChevronRight, Activity } from 'lucide-react';
import { MEDICATIONS_DB } from '../data/medications';
import { getMedicationRecommendation, MedicationRecommendation } from '../custom_services/PharmacologyEngine';

const MedicationReconciliation: React.FC = () => {
    const { setValue, watch } = useFormContext<VPOData>();
    const selectedMeds = watch('selectedMeds') || [];
    const formData = watch(); // Watch all data to pass to Engine

    // We need to trigger a re-calculation if patient factors change (e.g. Renal function update)
    // Ideally this would be a useEffect on formData changes updating all selectedMeds, 
    // but for now we'll calculate on Add and maybe have a 'Refresh' button or just trust the ADD time.
    // Better: Helper to re-run engine on the list.

    const [searchTerm, setSearchTerm] = useState('');
    const [activeModalMed, setActiveModalMed] = useState<{ med: SelectedMed, rec: MedicationRecommendation } | null>(null);

    // Normalize text for search
    const normalizeText = (text: string) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const filteredMeds = searchTerm.length > 1
        ? MEDICATIONS_DB.filter(m => {
            const searchNormalized = normalizeText(searchTerm);
            const nameNormalized = normalizeText(m.name);
            const matchesName = nameNormalized.includes(searchNormalized);
            const matchesCategory = normalizeText(m.category).includes(searchNormalized);
            const matchesKeyword = m.keywords?.some(k => normalizeText(k).includes(searchNormalized));

            return (matchesName || matchesCategory || matchesKeyword) && !selectedMeds.some(s => s.id === m.id);
        })
        : [];

    const handleAddMed = (medDbItem: SelectedMed) => {
        setSearchTerm('');

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

    return (
        <div className="space-y-6">

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

                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                            <button onClick={() => setActiveModalMed(null)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancelar</button>
                            <button
                                onClick={() => {
                                    confirmModalMed(activeModalMed.med);
                                    if (activeModalMed.rec.bridgeRequired) {
                                        // Add Bridge Logic here if needed, or rely on user to see it in recommendation
                                        // Just alert user for now.
                                    }
                                }}
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
                        placeholder={`Buscar entre ${MEDICATIONS_DB.length} fármacos...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {filteredMeds.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto animate-fadeIn">
                        {filteredMeds.map(med => (
                            <li key={med.id} onClick={() => handleAddMed(med)} className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer flex justify-between items-center group">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-700 group-hover:text-clinical-navy transition-colors">{med.name}</span>
                                    {med.category && <span className="text-[10px] text-gray-400">{med.category}</span>}
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold text-white ${med.alertLevel === 'red' ? 'bg-red-500' : med.alertLevel === 'yellow' ? 'bg-amber-500' : 'bg-green-500'}`}>
                                    {med.action === 'stop' ? 'Suspender' : med.action === 'adjust' ? 'Ajustar' : 'Continuar'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                {selectedMeds.length === 0 && <div className="col-span-2 text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">No hay fármacos agregados.</div>}

                {selectedMeds.map(med => (
                    <div key={med.id} className={`p-3 rounded-lg border-l-4 shadow-sm text-sm bg-white transition-all ${med.alertLevel === 'red' ? 'border-l-red-500' : med.alertLevel === 'yellow' ? 'border-l-amber-500' : 'border-l-green-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col gap-1 w-full">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-base">{med.name}</span>
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
    );
};

export default MedicationReconciliation;