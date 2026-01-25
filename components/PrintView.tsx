import React from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';

const PrintView: React.FC = () => {
    const { watch } = useFormContext<VPOData>();
    const data = watch();
    const overrides = data.risk_overrides || {};
    const hasOverrides = Object.keys(overrides).length > 0;

    const Check = ({ val }: { val: boolean }) => (
        <span style={{ fontWeight: 'bold' }}>{val ? 'X' : ''}</span>
    );

    const getCardioText = () => {
        if (!data.cardiopatiaIsquemica) return "Negado";
        if (data.cardio_tipo_evento === 'iam') return `IAM (${data.cardio_fecha_evento})`;
        if (data.cardio_tipo_evento === 'angina_inestable') return "Angina Inestable";
        return "Angina Estable";
    };

    const getICCText = () => {
        if (!data.icc) return "Negado";
        return `NYHA ${data.icc_nyha}, ${data.icc_evolucion === 'aguda' ? 'Aguda' : 'Crónica'}`;
    };

    const safeStyle = {
        fontFamily: 'Arial, sans-serif',
        color: 'black',
        lineHeight: '1.4',
    };

    return (
        <div style={{ ...safeStyle, background: 'white' }}>
            {/* PAGE 1 */}
            <div id="print-page-1" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white' }}>
                {/* Header Table for stability */}
                <table style={{ width: '100%', borderBottom: '2px solid black', marginBottom: '20px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '80px', verticalAlign: 'middle' }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                            </td>
                            <td style={{ paddingLeft: '20px', verticalAlign: 'middle' }}>
                                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1A365D' }}>VPO Digital</div>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#718096', textTransform: 'uppercase' }}>CMN SIGLO XXI</div>
                                <div style={{ fontSize: '10px', color: '#A0AEC0' }}>Medicina Interna</div>
                            </td>
                            <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#4A5568', textTransform: 'uppercase' }}>Dirección de Prestaciones Médicas</div>
                                <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#A0AEC0', marginBottom: '10px' }}>{data.unidadMedica || 'CMN S. XXI'}</div>
                                <div style={{ borderBottom: '2px solid black', display: 'inline-block', paddingBottom: '2px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{data.servicioSolicitante || 'SERVICIO DE MEDICINA INTERNA'}</div>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Valoración Preoperatoria</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Identificación Table */}
                <div style={{ border: '1px solid black', padding: '10px', marginBottom: '15px' }}>
                    <table style={{ width: '100%', marginBottom: '8px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '70%', borderBottom: '1px dotted black' }}><span style={{ fontWeight: 'bold' }}>NOMBRE:</span> {data.nombre}</td>
                                <td style={{ width: '30%', borderBottom: '1px dotted black', paddingLeft: '10px' }}><span style={{ fontWeight: 'bold' }}>FECHA:</span> {data.fecha}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table style={{ width: '100%', marginBottom: '8px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '30%', borderBottom: '1px dotted black' }}><span style={{ fontWeight: 'bold' }}>NSS:</span> {data.nss}</td>
                                <td style={{ width: '20%', borderBottom: '1px dotted black', paddingLeft: '10px' }}><span style={{ fontWeight: 'bold' }}>EDAD:</span> {data.edad}</td>
                                <td style={{ width: '25%', borderBottom: '1px dotted black', paddingLeft: '10px' }}><span style={{ fontWeight: 'bold' }}>GÉNERO:</span> {data.genero}</td>
                                <td style={{ width: '25%', borderBottom: '1px dotted black', paddingLeft: '10px' }}><span style={{ fontWeight: 'bold' }}>CAMA:</span> {data.cama}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style={{ borderBottom: '1px dotted black', marginBottom: '8px' }}><span style={{ fontWeight: 'bold' }}>DX QUIRÚRGICO:</span> {data.diagnosticoQuirurgico}</div>
                    <div style={{ borderBottom: '1px dotted black', marginBottom: '8px' }}><span style={{ fontWeight: 'bold' }}>CIRUGÍA PROGRAMADA:</span> {data.cirugiaProgramada}</div>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%', borderBottom: '1px dotted black' }}><span style={{ fontWeight: 'bold' }}>TIPO:</span> {data.tipoCirugia}</td>
                                <td style={{ width: '15%', borderBottom: '1px dotted black', textAlign: 'center' }}><span style={{ fontWeight: 'bold' }}>PESO:</span> {data.peso}kg</td>
                                <td style={{ width: '15%', borderBottom: '1px dotted black', textAlign: 'center' }}><span style={{ fontWeight: 'bold' }}>TALLA:</span> {data.talla}m</td>
                                <td style={{ width: '20%', borderBottom: '1px dotted black', textAlign: 'center', backgroundColor: '#EDF2F7' }}><span style={{ fontWeight: 'bold' }}>IMC:</span> {data.imc}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Riesgos */}
                <div style={{ border: '1px solid black', marginBottom: '15px' }}>
                    <div style={{ backgroundColor: '#EDF2F7', padding: '6px 12px', borderBottom: '1px solid black', fontWeight: 'bold', fontSize: '11px' }}>FACTORES DE RIESGO</div>
                    <div style={{ padding: '10px' }}>
                        <table style={{ width: '100%', fontSize: '10px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '50%', borderBottom: '1px dotted #CBD5E0', padding: '4px 0' }}>TABAQUISMO: SI (<Check val={data.tabaquismo} />) IT: {data.indiceTabaquico}</td>
                                    <td style={{ width: '50%', borderBottom: '1px dotted #CBD5E0', padding: '4px 0', paddingLeft: '20px' }}>ALERGIAS: SI (<Check val={data.alergicos} />)</td>
                                </tr>
                                <tr>
                                    <td style={{ borderBottom: '1px dotted #CBD5E0', padding: '4px 0' }}>HTA: SI (<Check val={data.hta} />) {data.hta ? `(${data.hta_control})` : ''}</td>
                                    <td style={{ borderBottom: '1px dotted #CBD5E0', padding: '4px 0', paddingLeft: '20px' }}>DIABETES: SI (<Check val={data.diabetes} />)</td>
                                </tr>
                                <tr>
                                    <td style={{ borderBottom: '1px dotted #CBD5E0', padding: '4px 0' }}>CARD. ISQUÉMICA: SI (<Check val={data.cardiopatiaIsquemica} />) {getCardioText()}</td>
                                    <td style={{ borderBottom: '1px dotted #CBD5E0', padding: '4px 0', paddingLeft: '20px' }}>I. CARDIACA: SI (<Check val={data.icc} />) {getICCText()}</td>
                                </tr>
                                <tr>
                                    <td style={{ borderBottom: '1px dotted #CBD5E0', padding: '4px 0' }}>ENF. RENAL: SI (<Check val={data.enfRenalCronica} />) TFG: {data.tfg}</td>
                                    <td style={{ borderBottom: '1px dotted #CBD5E0', padding: '4px 0', paddingLeft: '20px' }}>NEUMOPATÍA: SI (<Check val={data.neumopatia} />) {data.neumo_tipo}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div style={{ marginTop: '10px', borderTop: '1px solid black', paddingTop: '5px', fontSize: '10px' }}>
                            <div style={{ fontWeight: 'bold' }}>CIRUGÍAS PREVIAS / COMPLICACIONES:</div>
                            <div style={{ borderBottom: '1px dotted black', minHeight: '1.5em' }}>{data.cirugiasPrevias}</div>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '10px' }}>
                            <div style={{ fontWeight: 'bold' }}>OTRAS ENFERMEDADES / TRATAMIENTO ACTUAL:</div>
                            <div style={{ borderBottom: '1px dotted black', minHeight: '1.5em' }}>{data.otrasEnfermedades} {data.tratamientoActual}</div>
                        </div>
                    </div>
                </div>

                {/* Signos y Labs */}
                <div style={{ border: '1px solid black', marginBottom: '15px' }}>
                    <table style={{ width: '100%', textAlign: 'center', backgroundColor: '#EDF2F7', borderBottom: '1px solid black', fontSize: '10px', fontWeight: 'bold' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '6px' }}>TA: {data.taSistolica}/{data.taDiastolica}</td>
                                <td>FC: {data.fc}</td>
                                <td>FR: {data.fr}</td>
                                <td>Temp: {data.temp}</td>
                                <td>SatO2: {data.sato2}%</td>
                                <td>Gluc: {data.glucosaCapilar}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table style={{ width: '100%', textAlign: 'center', fontSize: '10px', padding: '10px 0' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '25%', borderRight: '1px dotted black' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', textDecoration: 'underline' }}>Biometría</div>
                                    <div>Hb: {data.hb}</div>
                                    <div>Leu: {data.leucocitos}</div>
                                    <div>Plaq: {data.plaquetas}</div>
                                </td>
                                <td style={{ width: '25%', borderRight: '1px dotted black' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', textDecoration: 'underline' }}>Tiempos</div>
                                    <div>TP: {data.tp}</div>
                                    <div>TTP: {data.ttp}</div>
                                    <div>INR: {data.inr}</div>
                                </td>
                                <td style={{ width: '25%', borderRight: '1px dotted black' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', textDecoration: 'underline' }}>Química</div>
                                    <div>Glu: {data.glucosaCentral}</div>
                                    <div>Urea: {data.urea}</div>
                                    <div>Cr: {data.creatinina}</div>
                                </td>
                                <td style={{ width: '25%' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', textDecoration: 'underline' }}>E.S.</div>
                                    <div>Na: {data.na} K: {data.k}</div>
                                    <div>Cl: {data.cl}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Gabinete */}
                <div style={{ border: '1px solid black', marginBottom: '15px' }}>
                    <div style={{ backgroundColor: '#EDF2F7', padding: '6px 12px', borderBottom: '1px solid black', fontWeight: 'bold', fontSize: '11px' }}>GABINETE</div>
                    <div style={{ padding: '10px' }}>
                        <table style={{ width: '100%', fontSize: '10px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '50%', borderRight: '1px dotted black', paddingRight: '10px' }}>
                                        <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>ELECTROCARDIOGRAMA</div>
                                        <div><span style={{ fontWeight: 'bold' }}>Frec:</span> {data.ecg_frecuencia || data.frecuenciaEcg} lpm</div>
                                        <div><span style={{ fontWeight: 'bold' }}>Ritmo:</span> {data.ecg_ritmo_especifico || data.ritmo}</div>
                                        <div style={{ marginTop: '5px' }}>
                                            {data.ecg_hvi && <span style={{ border: '1px solid black', padding: '1px 3px', marginRight: '4px' }}>HVI</span>}
                                            {data.ecg_isquemia && <span style={{ border: '1px solid black', padding: '1px 3px', fontWeight: 'bold' }}>ISQUEMIA</span>}
                                        </div>
                                    </td>
                                    <td style={{ width: '50%', paddingLeft: '10px' }}>
                                        <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>RADIOGRAFÍA DE TÓRAX</div>
                                        <div style={{ borderBottom: '1px dotted black', minHeight: '1.5em' }}>{data.rx_descripcion}</div>
                                        <div style={{ marginTop: '8px' }}><span style={{ fontWeight: 'bold' }}>ARISCAT:</span> {data.ariscat_total} pts</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Escalas Summary */}
                <div style={{ border: '1px solid black', backgroundColor: '#F7FAFC' }}>
                    <table style={{ width: '100%', textAlign: 'center', fontSize: '10px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '6px', borderRight: '1px solid #E2E8F0' }}><span style={{ fontWeight: 'bold', display: 'block', borderBottom: '1px solid #CBD5E0', marginBottom: '3px' }}>ASA</span> {data.asa}</td>
                                <td style={{ padding: '6px', borderRight: '1px solid #E2E8F0' }}><span style={{ fontWeight: 'bold', display: 'block', borderBottom: '1px solid #CBD5E0', marginBottom: '3px' }}>GOLDMAN</span> {data.goldman}</td>
                                <td style={{ padding: '6px', borderRight: '1px solid #E2E8F0' }}><span style={{ fontWeight: 'bold', display: 'block', borderBottom: '1px solid #CBD5E0', marginBottom: '3px' }}>LEE</span> {data.lee}</td>
                                <td style={{ padding: '6px' }}><span style={{ fontWeight: 'bold', display: 'block', borderBottom: '1px solid #CBD5E0', marginBottom: '3px' }}>DUKE</span> {data.duke_resultado || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGE 2 */}
            <div id="print-page-2" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white', marginTop: '20px' }}>
                <div style={{ border: '1px solid black', minHeight: '900px', position: 'relative' }}>
                    <div style={{ backgroundColor: '#EDF2F7', padding: '10px', borderBottom: '2px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>PLAN DE MANEJO PERIOPERATORIO</div>

                    <table style={{ width: '100%', height: '650px', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '33.3%', borderRight: '1px solid black', verticalAlign: 'top', padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center', backgroundColor: '#F7FAFC', padding: '5px', marginBottom: '10px' }}>PRE-QUIRÚRGICO</div>
                                    <div style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>{data.plan_pre || data.recomendacionesGenerales || data.ayuno}</div>
                                </td>
                                <td style={{ width: '33.3%', borderRight: '1px solid black', verticalAlign: 'top', padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center', backgroundColor: '#F7FAFC', padding: '5px', marginBottom: '10px' }}>TRANS-QUIRÚRGICO</div>
                                    <div style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>{data.plan_trans || "Ver notas de Anestesiología."}</div>
                                </td>
                                <td style={{ width: '33.4%', verticalAlign: 'top', padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center', backgroundColor: '#F7FAFC', padding: '5px', marginBottom: '10px' }}>POST-QUIRÚRGICO</div>
                                    <div style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>{data.plan_post || data.tromboprofilaxis}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ borderTop: '1px solid black', position: 'absolute', bottom: '0', width: '100%' }}>
                        {hasOverrides && (
                            <div style={{ padding: '10px', borderBottom: '1px solid black', backgroundColor: '#FFFBEB', fontSize: '9px' }}>
                                <span style={{ fontWeight: 'bold' }}>AUDITORÍA:</span> Las escalas automáticas fueron modificadas por el médico.
                            </div>
                        )}
                        <table style={{ width: '100%', padding: '40px 20px 20px 20px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '45%', textAlign: 'center', verticalAlign: 'top' }}>
                                        <div style={{ borderTop: '1px solid black', paddingTop: '5px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{data.elaboro || 'DR. MÉDICO INTERNISTA'}</div>
                                            <div style={{ fontSize: '10px', color: '#718096' }}>MÉDICO INTERNISTA</div>
                                        </div>
                                    </td>
                                    <td style={{ width: '10%' }}></td>
                                    <td style={{ width: '45%', textAlign: 'center', verticalAlign: 'top' }}>
                                        <div style={{ borderTop: '1px solid black', paddingTop: '5px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{data.matricula || '----------'}</div>
                                            <div style={{ fontSize: '10px', color: '#718096' }}>MATRÍCULA</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintView;