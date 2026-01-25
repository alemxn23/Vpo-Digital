import React from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';

// This component replicates the visual structure of the attached image strictly
const PrintView: React.FC = () => {
    const { watch } = useFormContext<VPOData>();
    const data = watch();
    const overrides = data.risk_overrides || {};
    const hasOverrides = Object.keys(overrides).length > 0;

    const Check = ({ val }: { val: boolean }) => (
        <span className="font-bold">{val ? 'X' : ''}</span>
    );

    const getCardioText = () => {
        let text = "Negado";
        if (data.cardiopatiaIsquemica) {
            if (data.cardio_tipo_evento === 'iam') text = `IAM (${data.cardio_fecha_evento})`;
            else if (data.cardio_tipo_evento === 'angina_inestable') text = "Angina Inestable";
            else text = "Angina Estable";
        }
        return text;
    };

    const getICCText = () => {
        if (!data.icc) return "Negado";
        return `NYHA ${data.icc_nyha}, ${data.icc_evolucion === 'aguda' ? 'Aguda' : 'Crónica'} ${data.icc_historia_eap ? '(Antecedente EAP)' : ''}`;
    };

    return (
        <div className="text-[10px] leading-tight font-sans text-black">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 border-b pb-2">
                <div className="w-20 h-20 flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="text-center flex-1 px-4">
                    <h1 className="font-bold text-sm">DIRECCIÓN DE PRESTACIONES MÉDICAS</h1>
                    <h2 className="font-bold text-xs uppercase underline">CMN SIGLO XXI</h2>
                    <h3 className="font-bold text-xs mt-1 uppercase">SERVICIO DE MEDICINA INTERNA</h3>
                    <h1 className="font-bold text-lg mt-2 uppercase border-b-2 border-black inline-block px-4">Valoración Preoperatoria</h1>
                </div>
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-[8px] text-center font-bold text-gray-500">
                    IMSS LOGO
                </div>
            </div>

            {/* Identificación */}
            <div className="border border-black p-1 mb-2">
                <div className="grid grid-cols-12 gap-1 mb-1">
                    <div className="col-span-8 flex border-b border-black border-dotted pb-1">
                        <span className="font-bold mr-2">NOMBRE:</span> {data.nombre}
                    </div>
                    <div className="col-span-4 flex border-b border-black border-dotted pb-1">
                        <span className="font-bold mr-2">FECHA:</span> {data.fecha} {data.hora}
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-1 mb-1">
                    <div className="col-span-4 flex border-b border-black border-dotted">
                        <span className="font-bold mr-2">NSS:</span> {data.nss}
                    </div>
                    <div className="col-span-2 flex border-b border-black border-dotted">
                        <span className="font-bold mr-2">EDAD:</span> {data.edad}
                    </div>
                    <div className="col-span-3 flex border-b border-black border-dotted">
                        <span className="font-bold mr-2">GÉNERO:</span> {data.genero}
                    </div>
                    <div className="col-span-3 flex border-b border-black border-dotted">
                        <span className="font-bold mr-2">CAMA:</span> {data.cama}
                    </div>
                </div>
                <div className="flex border-b border-black border-dotted mb-1">
                    <span className="font-bold mr-2">DX QUIRÚRGICO:</span> {data.diagnosticoQuirurgico}
                </div>
                <div className="flex border-b border-black border-dotted mb-1">
                    <span className="font-bold mr-2">CIRUGÍA PROGRAMADA:</span> {data.cirugiaProgramada}
                </div>
                <div className="grid grid-cols-12 gap-1">
                    <div className="col-span-6 flex border-b border-black border-dotted">
                        <span className="font-bold mr-2">TIPO:</span> {data.tipoCirugia}
                    </div>
                    <div className="col-span-2 flex border-b border-black border-dotted">
                        <span className="font-bold mr-2">PESO:</span> {data.peso} kg
                    </div>
                    <div className="col-span-2 flex border-b border-black border-dotted">
                        <span className="font-bold mr-2">TALLA:</span> {data.talla} m
                    </div>
                    <div className="col-span-2 flex border-b border-black border-dotted bg-gray-100">
                        <span className="font-bold mr-2">IMC:</span> {data.imc}
                    </div>
                </div>
            </div>

            {/* Riesgos */}
            <div className="mb-2">
                <h4 className="font-bold bg-gray-200 px-1 border border-black border-b-0 text-xs">FACTORES DE RIESGO</h4>
                <div className="border border-black p-1">
                    <div className="grid grid-cols-2 gap-x-4">
                        <div className="flex justify-between border-b border-dotted border-gray-400"><span>TABAQUISMO:</span> <span>SI (<Check val={data.tabaquismo} />) IT: {data.indiceTabaquico}</span></div>
                        <div className="flex justify-between border-b border-dotted border-gray-400"><span>ALERGIAS:</span> <span>SI (<Check val={data.alergicos} />)</span></div>
                        <div className="flex justify-between border-b border-dotted border-gray-400">
                            <span>HTA:</span>
                            <span>SI (<Check val={data.hta} />) {data.hta ? `(${data.hta_control})` : ''}</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-gray-400">
                            <span>DIABETES:</span>
                            <span>SI (<Check val={data.diabetes} />) {data.diabetes ? `Tipo: ${data.diabetesTipo}` : ''}</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-gray-400">
                            <span>CARDIOPATÍA ISQUÉMICA:</span>
                            <span>SI (<Check val={data.cardiopatiaIsquemica} />) {getCardioText()}</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-gray-400">
                            <span>INSUF. CARDIACA:</span>
                            <span>SI (<Check val={data.icc} />) {getICCText()}</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-gray-400">
                            <span>ENF. RENAL:</span>
                            <span>SI (<Check val={data.enfRenalCronica} />) {data.enfRenalCronica ? `Estadio ${data.erc_estadio}` : ''} TFG: {data.tfg}</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-gray-400">
                            <span>NEUMOPATÍA:</span>
                            <span>SI (<Check val={data.neumopatia} />) {data.neumo_tipo}</span>
                        </div>
                    </div>

                    <div className="mt-2 border-t border-black pt-1">
                        <span className="font-bold">CIRUGÍAS PREVIAS / COMPLICACIONES:</span>
                        <p className="border-b border-dotted border-black min-h-[1.5em]">{data.cirugiasPrevias}</p>
                    </div>
                    <div className="mt-1">
                        <span className="font-bold">OTRAS ENFERMEDADES / TRATAMIENTO ACTUAL:</span>
                        <p className="border-b border-dotted border-black min-h-[1.5em]">{data.tratamientoActual}</p>
                    </div>
                </div>
            </div>

            {/* Exploración y Labs */}
            <div className="mb-2 border border-black p-1">
                <div className="grid grid-cols-6 gap-2 bg-gray-100 p-1 mb-1 font-bold text-center border-b border-black">
                    <div>TA: {data.taSistolica}/{data.taDiastolica}</div>
                    <div>FC: {data.fc}</div>
                    <div>FR: {data.fr}</div>
                    <div>Temp: {data.temp}</div>
                    <div>SatO2: {data.sato2}%</div>
                    <div>Gluc: {data.glucosaCapilar}</div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center mt-2">
                    <div className="border-r border-dotted border-black">
                        <div className="font-bold border-b">Biometría</div>
                        <div>Hb: {data.hb}</div>
                        <div>Leu: {data.leucocitos}</div>
                        <div>Plaq: {data.plaquetas}</div>
                    </div>
                    <div className="border-r border-dotted border-black">
                        <div className="font-bold border-b">Tiempos</div>
                        <div>TP: {data.tp}</div>
                        <div>TTP: {data.ttp}</div>
                        <div>INR: {data.inr}</div>
                    </div>
                    <div className="border-r border-dotted border-black">
                        <div className="font-bold border-b">QS</div>
                        <div>Glu: {data.glucosaCentral}</div>
                        <div>Urea: {data.urea}</div>
                        <div>Cr: {data.creatinina}</div>
                    </div>
                    <div>
                        <div className="font-bold border-b">E.S.</div>
                        <div>Na: {data.na} K: {data.k}</div>
                        <div>Cl: {data.cl}</div>
                    </div>
                </div>
            </div>

            {/* GABINETE: RX & ECG */}
            <div className="mb-2 border border-black p-1">
                <h4 className="font-bold bg-gray-200 px-1 border-b border-black text-xs mb-1">GABINETE</h4>
                <div className="grid grid-cols-2 gap-4">
                    {/* ECG COLUMN */}
                    <div className="border-r border-dotted border-black pr-2">
                        <div className="font-bold underline text-xs">ELECTROCARDIOGRAMA:</div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                            <div><span className="font-semibold">Frec:</span> {data.ecg_frecuencia || data.frecuenciaEcg} lpm</div>
                            <div><span className="font-semibold">Ritmo:</span> {data.ecg_ritmo_especifico || data.ritmo}</div>
                        </div>
                        <div className="mt-1"><span className="font-semibold">Bloqueo:</span> {data.ecg_bloqueo}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[9px]">
                            {data.ecg_hvi && <span className="border border-black px-1">HVI</span>}
                            {data.ecg_brihh_completo && <span className="border border-black px-1 font-bold">BRIHH</span>}
                            {data.ecg_isquemia && <span className="border border-black px-1 font-bold">ISQUEMIA</span>}
                            {data.ecg_extrasistoles && <span className="border border-black px-1">EXTRASÍS.</span>}
                        </div>
                        <div className="mt-1 italic">{data.ecg_otras_alteraciones}</div>
                    </div>

                    {/* RX COLUMN */}
                    <div className="pl-2">
                        <div className="font-bold underline text-xs">RADIOGRAFÍA DE TÓRAX:</div>
                        <div className="mt-1 min-h-[1.5em] border-b border-dotted border-gray-400">{data.rx_descripcion}</div>
                        <div className="mt-2 border-t border-dotted border-black pt-1">
                            <span className="font-bold">ARISCAT:</span> {data.ariscat_total} pts ({data.ariscat_categoria})
                        </div>
                    </div>
                </div>
            </div>

            {/* INFECTOLOGÍA / ENDOCARDITIS SECTION (NEW) */}
            <div className="mb-2 border border-black p-1">
                <h4 className="font-bold bg-gray-200 px-1 border-b border-black text-xs mb-1">INFECTOLOGÍA (CRITERIOS DE DUKE MODIFICADOS)</h4>
                <div className="text-[9px] px-2 py-1">
                    <span className="font-bold">RESULTADO:</span> {data.duke_resultado || 'Rechazado'}
                    {(data.duke_resultado === 'Definitivo' || data.duke_resultado === 'Posible') && (
                        <div className="mt-1 font-bold text-red-700 border border-red-600 p-1 bg-red-50 uppercase text-center">
                            ALERTA: Riesgo de Endocarditis. Diferir cirugía electiva, iniciar protocolo de antibióticos y solicitar Ecocardiograma Transesofágico (ETE) urgente.
                        </div>
                    )}
                </div>
            </div>

            {/* Escalas */}
            <div className="mb-2 border border-black p-1 bg-gray-50 text-[9px]">
                <div className="grid grid-cols-6 gap-2 text-center">
                    <div><span className="font-bold block">ASA</span> {data.asa}</div>
                    <div><span className="font-bold block">GOLDMAN</span> {data.goldman}</div>
                    <div><span className="font-bold block">DETSKY</span> {data.detsky}</div>
                    <div><span className="font-bold block">LEE</span> {data.lee}</div>
                    <div><span className="font-bold block">GUPTA</span> {data.gupta}%</div>
                    <div><span className="font-bold block">DUKE</span> {data.duke_resultado || '-'}</div>
                </div>
            </div>

            {/* PLAN DE MANEJO INTEGRAL (3 COLUMNS) */}
            <div className="border border-black flex flex-col min-h-[350px]">
                <div className="bg-gray-200 font-bold border-b border-black px-2 py-1 text-center">PLAN DE MANEJO PERIOPERATORIO</div>

                <div className="flex-1 grid grid-cols-3 text-[9px]">

                    {/* PRE-QX */}
                    <div className="border-r border-black p-2">
                        <h5 className="font-bold underline mb-1 text-center bg-gray-100">PRE-QUIRÚRGICO</h5>
                        <p className="whitespace-pre-wrap">{data.plan_pre || data.recomendacionesGenerales || data.ayuno}</p>
                    </div>

                    {/* TRANS-QX */}
                    <div className="border-r border-black p-2">
                        <h5 className="font-bold underline mb-1 text-center bg-gray-100">TRANS-QUIRÚRGICO</h5>
                        <p className="whitespace-pre-wrap">{data.plan_trans || "Ver notas de Anestesiología."}</p>
                    </div>

                    {/* POST-QX */}
                    <div className="p-2">
                        <h5 className="font-bold underline mb-1 text-center bg-gray-100">POST-QUIRÚRGICO</h5>
                        <p className="whitespace-pre-wrap">{data.plan_post || data.tromboprofilaxis}</p>
                    </div>

                </div>

                {/* NOTAS DE AUDITORÍA (NEW SECTION) */}
                {hasOverrides && (
                    <div className="border-t border-black p-2 bg-amber-50">
                        <h5 className="font-bold text-[8px] uppercase text-amber-900 border-b border-amber-200 mb-1">NOTAS DE AUDITORÍA CLÍNICA:</h5>
                        <p className="text-[8px] text-amber-800 italic">
                            * Las escalas de riesgo han sido modificadas manualmente por el médico tratante, alterando la sugerencia automática basada en la evidencia clínica capturada.
                        </p>
                    </div>
                )}

                <div className="border-t border-black p-2 mt-auto">
                    <div className="grid grid-cols-2 gap-8 mt-8">
                        <div className="text-center border-t border-black pt-1">
                            <p className="font-bold">{data.elaboro}</p>
                            <p>MÉDICO INTERNISTA</p>
                        </div>
                        <div className="text-center border-t border-black pt-1">
                            <p>{data.matricula}</p>
                            <p>MATRÍCULA</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintView;