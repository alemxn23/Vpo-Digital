import React from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';

const PrintView: React.FC = () => {
    const { watch } = useFormContext<VPOData>();
    const data = watch();
    const overrides = data.risk_overrides || {};
    const hasOverrides = Object.keys(overrides).length > 0;

    const Check = ({ val }: { val: boolean }) => (
        <span style={{ fontWeight: 'bold', fontSize: '11px', fontFamily: 'Arial' }}>{val ? 'X' : ''}</span>
    );

    const getCardioText = () => {
        if (!data.cardiopatiaIsquemica) return "Negado";
        if (data.cardio_tipo_evento === 'iam') return `IAM (${data.cardio_fecha_evento})`;
        if (data.cardio_tipo_evento === 'angina_inestable') return "Angina Inestable";
        return "Angina Estable";
    };

    // Shared Styles
    const baseTable: React.CSSProperties = {
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        width: '714px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        color: 'black',
        backgroundColor: 'white'
    };

    const labelStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '10px'
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '10px',
        borderBottom: '1px solid black',
        height: '14px',
        overflow: 'hidden'
    };

    return (
        <div style={{ background: 'white', width: '794px' }}>
            {/* PAGE 1 */}
            <div id="print-page-1" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white' }}>

                {/* HEADER SECTION - LEGACY TABLE */}
                <table width="714" border={0} cellPadding={0} cellSpacing={0} style={baseTable}>
                    <tbody>
                        <tr>
                            <td width="70" valign="middle" style={{ borderBottom: '2px solid black', paddingBottom: '10px' }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '60px', height: '60px' }} />
                            </td>
                            <td width="344" valign="middle" style={{ paddingLeft: '15px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
                                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.2' }}>VPO Digital</div>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#444' }}>CMN SIGLO XXI - MEDICINA INTERNA</div>
                            </td>
                            <td width="300" align="right" valign="top" style={{ borderBottom: '2px solid black', paddingBottom: '10px' }}>
                                <div style={{ fontSize: '9px', fontWeight: 'bold' }}>DIRECCIÓN DE PRESTACIONES MÉDICAS</div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', marginTop: '5px' }}>VALORACIÓN PREOPERATORIA</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* IDENTIFICATION SECTION */}
                <table width="714" border={1} cellPadding={10} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr>
                            <td>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed' }}>
                                    <tbody>
                                        <tr>
                                            <td width="70" style={labelStyle}>NOMBRE:</td>
                                            <td width="400" style={valueStyle}>{data.nombre}</td>
                                            <td width="60" style={{ ...labelStyle, paddingLeft: '10px' }}>FECHA:</td>
                                            <td width="154" style={valueStyle}>{data.fecha}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td width="40" style={labelStyle}>NSS:</td>
                                            <td width="140" style={valueStyle}>{data.nss}</td>
                                            <td width="50" style={{ ...labelStyle, paddingLeft: '10px' }}>EDAD:</td>
                                            <td width="50" style={valueStyle}>{data.edad}</td>
                                            <td width="70" style={{ ...labelStyle, paddingLeft: '10px' }}>GÉNERO:</td>
                                            <td width="80" style={valueStyle}>{data.genero}</td>
                                            <td width="50" style={{ ...labelStyle, paddingLeft: '10px' }}>CAMA:</td>
                                            <td style={valueStyle}>{data.cama}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td width="110" style={labelStyle}>DX QUIRÚRGICO:</td>
                                            <td style={valueStyle}>{data.diagnosticoQuirurgico}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td width="140" style={labelStyle}>CIRUGÍA PROGRAMADA:</td>
                                            <td style={valueStyle}>{data.cirugiaProgramada}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td width="40" style={labelStyle}>TIPO:</td>
                                            <td width="150" style={valueStyle}>{data.tipoCirugia}</td>
                                            <td width="45" style={{ ...labelStyle, paddingLeft: '10px' }}>PESO:</td>
                                            <td width="60" style={valueStyle}>{data.peso} kg</td>
                                            <td width="45" style={{ ...labelStyle, paddingLeft: '10px' }}>TALLA:</td>
                                            <td width="60" style={valueStyle}>{data.talla} m</td>
                                            <td width="45" style={{ ...labelStyle, paddingLeft: '10px', backgroundColor: '#eee' }}>IMC:</td>
                                            <td style={{ ...valueStyle, backgroundColor: '#eee', textAlign: 'center' }}>{data.imc}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* RISK FACTORS SECTION */}
                <table width="714" border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr>
                            <td height="25" style={{ backgroundColor: '#f3f4f6', paddingLeft: '10px', fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid black' }}>FACTORES DE RIESGO</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '10px' }}>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed' }}>
                                    <tbody>
                                        <tr>
                                            <td width="347" style={{ borderBottom: '1px dotted #ccc' }}><span style={labelStyle}>TABAQUISMO:</span> SI (<Check val={data.tabaquismo} />) IT: {data.indiceTabaquico}</td>
                                            <td width="347" style={{ borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}><span style={labelStyle}>ALERGIAS:</span> SI (<Check val={data.alergicos} />)</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px dotted #ccc' }}><span style={labelStyle}>HTA:</span> SI (<Check val={data.hta} />) {data.hta ? `(${data.hta_control})` : ''}</td>
                                            <td style={{ borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}><span style={labelStyle}>DIABETES:</span> SI (<Check val={data.diabetes} />) {data.diabetesTipo}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px dotted #ccc' }}><span style={labelStyle}>CARD. ISQUÉMICA:</span> SI (<Check val={data.cardiopatiaIsquemica} />) {getCardioText()}</td>
                                            <td style={{ borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}><span style={labelStyle}>I. CARDIACA:</span> SI (<Check val={data.icc} />) NYHA: {data.icc_nyha}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px dotted #ccc' }}><span style={labelStyle}>ENF. RENAL:</span> SI (<Check val={data.enfRenalCronica} />) TFG: {data.tfg}</td>
                                            <td style={{ borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}><span style={labelStyle}>NEUMOPATÍA:</span> SI (<Check val={data.neumopatia} />) {data.neumo_tipo}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '8px' }}>
                                    <tbody>
                                        <tr><td style={labelStyle}>CIRUGÍAS PREVIAS / COMPLICACIONES:</td></tr>
                                        <tr><td style={{ ...valueStyle, borderBottom: '1px dotted black' }}>{data.cirugiasPrevias || '-'}</td></tr>
                                        <tr><td height="5"></td></tr>
                                        <tr><td style={labelStyle}>OTRAS ENFERMEDADES / TRATAMIENTO ACTUAL:</td></tr>
                                        <tr><td style={{ ...valueStyle, borderBottom: '1px dotted black' }}>{data.otrasEnfermedades} {data.tratamientoActual ? `/ ${data.tratamientoActual}` : ''}</td></tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* VITAL SIGNS SECTION */}
                <table width="714" border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr height="25" bgcolor="#f3f4f6" align="center">
                            <td width="119" style={labelStyle}>TA: {data.taSistolica}/{data.taDiastolica}</td>
                            <td width="119" style={labelStyle}>FC: {data.fc}</td>
                            <td width="119" style={labelStyle}>FR: {data.fr}</td>
                            <td width="119" style={labelStyle}>TEMP: {data.temp}°C</td>
                            <td width="119" style={labelStyle}>SATO2: {data.sato2}%</td>
                            <td width="119" style={labelStyle}>GLUC: {data.glucosaCapilar}</td>
                        </tr>
                        <tr align="center">
                            <td colSpan={6} style={{ padding: '8px' }}>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed' }}>
                                    <tbody>
                                        <tr>
                                            <td width="178" style={{ borderRight: '1px dotted black' }}>
                                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>BIOMETRÍA</div>
                                                <div style={{ fontSize: '9px' }}>Hb: {data.hb} / Leu: {data.leucocitos} / Plaq: {data.plaquetas}</div>
                                            </td>
                                            <td width="178" style={{ borderRight: '1px dotted black' }}>
                                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>TIEMPOS</div>
                                                <div style={{ fontSize: '9px' }}>TP: {data.tp} / TTP: {data.ttp} / INR: {data.inr}</div>
                                            </td>
                                            <td width="178" style={{ borderRight: '1px dotted black' }}>
                                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>QUÍMICA</div>
                                                <div style={{ fontSize: '9px' }}>Glu: {data.glucosaCentral} / Urea: {data.urea} / Cr: {data.creatinina}</div>
                                            </td>
                                            <td width="180">
                                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>ELECTROLITOS</div>
                                                <div style={{ fontSize: '9px' }}>Na: {data.na} / K: {data.k} / Cl: {data.cl}</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* GABINETE SECTION */}
                <table width="714" border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr><td height="25" bgcolor="#f3f4f6" style={{ paddingLeft: '10px', fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid black' }}>GABINETE</td></tr>
                        <tr>
                            <td style={{ padding: '10px' }}>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed' }}>
                                    <tbody>
                                        <tr>
                                            <td width="350" valign="top" style={{ borderRight: '1px dotted black', paddingRight: '10px' }}>
                                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>ELECTROCARDIOGRAMA:</div>
                                                <div style={{ fontSize: '10px', marginTop: '4px' }}>Frec: {data.ecg_frecuencia || data.frecuenciaEcg} lpm / Ritmo: {data.ecg_ritmo_especifico || data.ritmo}</div>
                                                <div style={{ fontSize: '10px' }}>Bloqueo: {data.ecg_bloqueo || 'Ninguno'} {data.ecg_hvi ? '/ HVI' : ''} {data.ecg_isquemia ? '/ ISQUEMIA' : ''}</div>
                                            </td>
                                            <td width="364" valign="top" style={{ paddingLeft: '15px' }}>
                                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>RADIOGRAFÍA DE TÓRAX:</div>
                                                <div style={{ ...valueStyle, borderBottom: '1px solid black' }}>{data.rx_descripcion || '-'}</div>
                                                <div style={{ fontSize: '10px', marginTop: '5px' }}><span style={labelStyle}>ARISCAT:</span> {data.ariscat_total} pts ({data.ariscat_categoria})</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* SCALES SECTION */}
                <table width="714" border={1} cellPadding={10} cellSpacing={0} style={{ ...baseTable, border: '1px solid black', textAlign: 'center', backgroundColor: '#fafafa' }}>
                    <tbody>
                        <tr>
                            <td>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed' }}>
                                    <tbody>
                                        <tr>
                                            <td width="25%" style={{ borderRight: '1px solid #ddd' }}><span style={labelStyle}>ASA:</span> {data.asa}</td>
                                            <td width="25%" style={{ borderRight: '1px solid #ddd' }}><span style={labelStyle}>GOLDMAN:</span> {data.goldman}</td>
                                            <td width="25%" style={{ borderRight: '1px solid #ddd' }}><span style={labelStyle}>LEE:</span> {data.lee}</td>
                                            <td width="25%"><span style={labelStyle}>DUKE:</span> {data.duke_resultado || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* PAGE 2 */}
            <div id="print-page-2" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white', marginTop: '40px' }}>
                <table width="714" border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '2px solid black', minHeight: '940px' }}>
                    <tbody>
                        <tr><td height="40" bgcolor="#1e3a8a" align="center" style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>PLAN DE MANEJO PERIOPERATORIO</td></tr>
                        <tr>
                            <td valign="top" style={{ height: '700px', padding: '15px' }}>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed', height: '100%' }}>
                                    <tbody>
                                        <tr>
                                            <td width="228" valign="top" style={{ borderRight: '1px solid black', paddingRight: '15px' }}>
                                                <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid black' }}>PRE-QUIRÚRGICO</div>
                                                <div style={{ fontSize: '11px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.plan_pre || data.recomendacionesGenerales || data.ayuno}</div>
                                            </td>
                                            <td width="228" valign="top" style={{ borderRight: '1px solid black', padding: '0 15px' }}>
                                                <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid black' }}>TRANS-QUIRÚRGICO</div>
                                                <div style={{ fontSize: '11px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.plan_trans || "Ver notas de Anestesiología.\nVigilancia de constantes vitales."}</div>
                                            </td>
                                            <td width="228" valign="top" style={{ paddingLeft: '15px' }}>
                                                <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid black' }}>POST-QUIRÚRGICO</div>
                                                <div style={{ fontSize: '11px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.plan_post || data.tromboprofilaxis}</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td valign="bottom" style={{ borderTop: '2px solid black' }}>
                                {hasOverrides && (
                                    <div style={{ padding: '8px 15px', backgroundColor: '#fffbeb', fontSize: '10px', fontStyle: 'italic', borderBottom: '1px solid black' }}>
                                        NOTA DE AUDITORÍA: Escalas ajustadas manualmente por el facultativo basándose en criterio clínico.
                                    </div>
                                )}
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ marginTop: '60px', marginBottom: '60px' }}>
                                    <tbody>
                                        <tr>
                                            <td width="5%"></td>
                                            <td width="40%" align="center" style={{ borderTop: '2px solid black', paddingTop: '10px' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>{data.elaboro || 'DR. MÉDICO INTERNISTA'}</div>
                                                <div style={{ fontSize: '10px', color: '#666' }}>MÉDICO INTERNISTA</div>
                                            </td>
                                            <td width="10%"></td>
                                            <td width="40%" align="center" style={{ borderTop: '2px solid black', paddingTop: '10px' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{data.matricula || '----------'}</div>
                                                <div style={{ fontSize: '10px', color: '#666' }}>MATRÍCULA</div>
                                            </td>
                                            <td width="5%"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PrintView;