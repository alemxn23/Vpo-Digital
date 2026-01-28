import React from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';

// PDF Version: 2026-01-25.10 (Signature & Alignment Fix)

const PrintView: React.FC = () => {
    const { watch } = useFormContext<VPOData>();
    const data = watch();
    const overrides = data.risk_overrides || {};
    const hasOverrides = Object.keys(overrides).length > 0;

    // Helper functions for text display
    const getCardioText = () => {
        if (!data.cardiopatiaIsquemica) return "Negado";
        if (data.cardio_tipo_evento === 'iam') return `IAM (${data.cardio_fecha_evento})`;
        if (data.cardio_tipo_evento === 'angina_inestable') return "Angina Inestable - CCS IV";
        return "Angina Estable";
    };

    const getIccText = () => {
        if (!data.icc) return "Negado";
        return `NYHA: ${data.icc_nyha} (${data.icc_evolucion === 'aguda' ? 'AGUDA' : 'CRÓNICA'}) ${data.icc_historia_eap ? '/ Hx EAP' : ''}`;
    };

    const getNeumoText = () => {
        if (!data.neumopatia) return "Negado";
        return `${data.neumo_tipo.toUpperCase()} ${data.neumo_o2 ? '(REQ. O2)' : ''}`;
    };

    const getRenalText = () => {
        if (!data.enfRenalCronica) return "Negado";
        return `ERC G${data.erc_estadio || '?'} ${data.erc_dialisis ? '(DIÁLISIS)' : '(Conservador)'}`;
    };

    const getHepatoText = () => {
        if (!data.hepatopatia) return "Negado";
        return `${data.hepato_tipo.toUpperCase()} (CHILD: ${data.hepato_child}) ${data.hepato_coagulopatia ? '+COAG' : ''}`;
    };

    const Check = ({ val }: { val: boolean }) => (
        <span style={{ fontWeight: 'bold', fontSize: '10px' }}>{val ? '(SI)' : 'NEGADO'}</span>
    );

    // Shared Styles
    const baseTable: React.CSSProperties = {
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        width: '714px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        color: 'black',
        backgroundColor: 'white',
        lineHeight: '1.2',
        fontSize: '10px'
    };

    const labelStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '10px',
        whiteSpace: 'nowrap',
        lineHeight: '1.1',
        color: '#1a1a1a'
    };

    const labelTitleStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '11px',
        backgroundColor: '#f3f4f6',
        padding: '6px 10px',
        borderBottom: '1px solid black',
        borderTop: '1px solid black'
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '10px',
        borderBottom: '1px solid #ccc',
        height: '18px',
        textAlign: 'left',
        paddingLeft: '4px',
        verticalAlign: 'middle',
        lineHeight: '1.4'
    };

    return (
        <div style={{ background: 'white', width: '794px', paddingBottom: '40px' }}>
            {/* PAGE 1 */}
            <div id="print-page-1" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white' }}>

                {/* HEADER SECTION */}
                <table border={0} cellPadding={0} cellSpacing={0} style={baseTable}>
                    <tbody>
                        <tr>
                            <td width="70" valign="middle" style={{ width: '70px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '60px', height: '60px' }} />
                            </td>
                            <td width="344" valign="middle" style={{ paddingLeft: '15px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
                                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.2' }}>VPO Digital</div>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#444' }}>{data.unidadMedica || 'CMN SIGLO XXI'} - MEDICINA INTERNA</div>
                            </td>
                            <td width="300" align="right" valign="top" style={{ borderBottom: '2px solid black', paddingBottom: '10px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>DIRECCIÓN DE PRESTACIONES MÉDICAS</div>
                                <div style={{ fontSize: '10px', fontWeight: 'bold', textDecoration: 'underline', marginTop: '5px' }}>VALORACIÓN PREOPERATORIA</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* IDENTIFICATION SECTION */}
                <table border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '10px' }}>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, width: '60px' }}>NOMBRE:</td>
                                            <td style={valueStyle}>{data.nombre}</td>
                                            <td style={{ ...labelStyle, width: '50px', paddingLeft: '10px' }}>FECHA:</td>
                                            <td style={{ ...valueStyle, width: '100px' }}>{data.fecha}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, width: '35px' }}>NSS:</td>
                                            <td style={{ ...valueStyle, width: '150px' }}>{data.nss}</td>
                                            <td style={{ ...labelStyle, width: '45px', paddingLeft: '10px' }}>EDAD:</td>
                                            <td style={{ ...valueStyle, width: '40px' }}>{data.edad}</td>
                                            <td style={{ ...labelStyle, width: '65px', paddingLeft: '10px' }}>GÉNERO:</td>
                                            <td style={{ ...valueStyle, width: '60px' }}>{data.genero}</td>
                                            <td style={{ ...labelStyle, width: '45px', paddingLeft: '10px' }}>CAMA:</td>
                                            <td style={valueStyle}>{data.cama}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, width: '100px' }}>DX QUIRÚRGICO:</td>
                                            <td style={valueStyle}>{data.diagnosticoQuirurgico}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, width: '130px' }}>CIRUGÍA PROGRAMADA:</td>
                                            <td style={valueStyle}>{data.cirugiaProgramada}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '6px' }}>
                                    <tbody>
                                        <tr height="20">
                                            <td style={{ ...labelStyle, width: '35px' }}>TIPO:</td>
                                            <td style={{ ...valueStyle, width: '130px' }}>{data.esUrgencia ? 'URGENCIA' : 'ELECTIVA'}</td>
                                            <td style={{ ...labelStyle, width: '40px', paddingLeft: '10px' }}>PESO:</td>
                                            <td style={{ ...valueStyle, width: '45px' }}>{data.peso} kg</td>
                                            <td style={{ ...labelStyle, width: '45px', paddingLeft: '10px' }}>TALLA:</td>
                                            <td style={{ ...valueStyle, width: '45px' }}>{data.talla} m</td>
                                            <td style={{ ...labelStyle, width: '40px', paddingLeft: '10px', backgroundColor: '#f3f4f6', textAlign: 'center' }}>IMC:</td>
                                            <td style={{ ...valueStyle, backgroundColor: '#f3f4f6', textAlign: 'center', fontWeight: 'bold' }}>{data.imc}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* VITAL SIGNS & PHYSICAL EXPLORATION */}
                <table border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr height="30" bgcolor="#f3f4f6" align="center">
                            <td style={{ ...labelStyle, textAlign: 'center' }}>TA: {data.taSistolica}/{data.taDiastolica}</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>FC: {data.fc}</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>FR: {data.fr}</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>TEMP: {data.temp}°C</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>SATO2: {data.sato2}%</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>GLUC: {data.glucosaCapilar}</td>
                        </tr>
                        <tr>
                            <td colSpan={6} style={{ padding: '8px 10px', backgroundColor: '#fff' }}>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, textDecoration: 'underline', width: '300px' }}>EXPLORACIÓN FÍSICA Y HALLAZGOS CRÍTICOS:</td>
                                            <td align="right">
                                                {(data.exploracion_ingurgitacion || data.exploracion_s3 || data.exploracion_estertores || data.exploracion_soplo_carotideo || data.exploracion_estenosis_aortica) && (
                                                    <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '8px', fontWeight: 'bold', padding: '3px 8px', border: '1px solid #fecaca', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                                        ⚠️ HALLAZGOS DE ALTO RIESGO
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '6px' }}>
                                    <tbody>
                                        <tr style={{ fontSize: '9.5px' }}>
                                            <td style={{ color: data.exploracion_ingurgitacion ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_ingurgitacion ? 'bold' : 'normal' }}>
                                                Ing. Yugular: {data.exploracion_ingurgitacion ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_s3 ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_s3 ? 'bold' : 'normal' }}>
                                                Ruidos S3: {data.exploracion_s3 ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_estertores ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_estertores ? 'bold' : 'normal' }}>
                                                Estertores: {data.exploracion_estertores ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_edema ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_edema ? 'bold' : 'normal' }}>
                                                Edema: {data.exploracion_edema ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_soplo_carotideo ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_soplo_carotideo ? 'bold' : 'normal' }}>
                                                Soplo: {data.exploracion_soplo_carotideo ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_estenosis_aortica ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_estenosis_aortica ? 'bold' : 'normal' }}>
                                                Est. Aórtica: {data.exploracion_estenosis_aortica ? 'SI' : 'NO'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* RISK FACTORS SECTION */}
                <table border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr>
                            <td height="25" style={labelTitleStyle}>FACTORES DE RIESGO Y COMORBILIDADES</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '10px' }}>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0}>
                                    <tbody>
                                        <tr>
                                            <td width="50%" style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>TABAQUISMO:</span> <Check val={data.tabaquismo} /> {data.tabaquismo && `IT: ${data.indiceTabaquico} (${data.riesgoEPOC})`}</td>
                                            <td width="50%" style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>ALERGIAS:</span> {data.alergicos ? `(SI) ${data.alergicosDetalle || ''}` : 'NEGADO'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>HTA:</span> <Check val={data.hta} /> {data.hta && `(${data.hta_control?.toUpperCase()} - ${data.hta_tiempo} años)`}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>DIABETES:</span> <Check val={data.diabetes} /> {data.diabetes && `(Tipo ${data.diabetesTipo} - ${data.diabetesTiempo} años) ${data.usaInsulina ? '[INSULINA]' : ''}`}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>CARD. ISQUÉMICA:</span> <Check val={data.cardiopatiaIsquemica} /> {data.cardiopatiaIsquemica && getCardioText()}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>I. CARDIACA:</span> <Check val={data.icc} /> {data.icc && getIccText()}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>ARRITMIAS:</span> <Check val={data.arritmias} /> {data.arritmias && `${data.arritmia_tipo?.toUpperCase()} ${data.marcapasos ? '[MARCAPASOS]' : ''}`}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>VALVULOPATÍA:</span> <Check val={data.valvulopatia} /> {data.valvulopatia && `${data.valvula_afectada} ${data.valvula_patologia} (${data.valvula_severidad})`}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>ENF. RENAL:</span> <Check val={data.enfRenalCronica} /> {data.enfRenalCronica && getRenalText()}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>NEUMOPATÍA:</span> <Check val={data.neumopatia} /> {data.neumopatia && getNeumoText()}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>EVC (NEURO):</span> <Check val={data.evc} /> {data.evc && `${data.evc_tipo?.toUpperCase()} (${data.evc_fecha})`}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>HEPATOPATÍA:</span> <Check val={data.hepatopatia} /> {data.hepatopatia && getHepatoText()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>COAGULOPATÍA:</span> <Check val={data.coagulopatia} /> {data.coagulopatia && data.coag_tipo}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ marginTop: '8px' }}>
                                    <tbody>
                                        <tr><td style={labelStyle}>ANTECEDENTES QUIRÚRGICOS / COMPLICACIONES:</td></tr>
                                        <tr><td style={{ ...valueStyle, borderBottom: '1px dotted black', minHeight: '30px', verticalAlign: 'top' }}>{data.cirugiasPrevias || '-'}</td></tr>
                                        <tr><td height="5"></td></tr>
                                        <tr><td style={labelStyle}>OTROS DIAGNÓSTICOS Y TRATAMIENTO ACTUAL:</td></tr>
                                        <tr><td style={{ ...valueStyle, borderBottom: '1px dotted black', minHeight: '30px', verticalAlign: 'top' }}>{data.otrasEnfermedades} {data.tratamientoActual ? `/ ${data.tratamientoActual}` : ''}</td></tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* LABS & CABINET SUMMARY */}
                <table border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <thead>
                        <tr bgcolor="#f3f4f6" height="25">
                            <td width="357" style={{ ...labelStyle, paddingLeft: '10px', borderRight: '1px solid black' }}>EXÁMENES DE LABORATORIO</td>
                            <td width="357" style={{ ...labelStyle, paddingLeft: '10px' }}>ESTUDIOS DE GABINETE</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td valign="top" style={{ padding: '4px', borderRight: '1px solid black' }}>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed' }}>
                                    <tbody>
                                        <tr height="20">
                                            <td style={{ paddingLeft: '4px', fontSize: '9.5px' }}><span style={labelStyle}>BH:</span> Hb {data.hb} / Leu {data.leucocitos} / Plaq {data.plaquetas}</td>
                                        </tr>
                                        <tr height="20">
                                            <td style={{ paddingLeft: '4px', fontSize: '9.5px' }}><span style={labelStyle}>Tiempos:</span> TP {data.tp} / TTP {data.ttp} / INR {data.inr}</td>
                                        </tr>
                                        <tr height="20">
                                            <td style={{ paddingLeft: '4px', fontSize: '9.5px' }}><span style={labelStyle}>Química:</span> Glu {data.glucosaCentral} / Urea {data.urea} / Cr {data.creatinina}</td>
                                        </tr>
                                        <tr height="20">
                                            <td style={{ paddingLeft: '4px', fontSize: '9.5px' }}><span style={labelStyle}>Electrolitos:</span> Na {data.na} / K {data.k} / Cl {data.cl}</td>
                                        </tr>
                                        <tr height="25">
                                            <td style={{ backgroundColor: '#f3f4f6', fontSize: '9.5px', fontWeight: 'bold', borderTop: '1px solid #ccc', paddingLeft: '4px' }}>TFG Calculada: {data.tfg} ml/min</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td valign="top" style={{ padding: '8px' }}>
                                <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                                    <span style={labelStyle}>ECG:</span> {data.ecg_ritmo_especifico}, FC {data.ecg_frecuencia} lpm.
                                    {data.ecg_bloqueo !== 'Ninguno' ? ` Bloqueo: ${data.ecg_bloqueo}.` : ''}<br />
                                    {data.ecg_isquemia && <span style={{ color: 'red', fontWeight: 'bold' }}>[ISQUEMIA (+)] </span>}
                                    {data.ecg_hvi && <span style={{ fontWeight: 'bold' }}>[HVI (+)] </span>}<br />
                                    <span style={labelStyle}>Rx Tórax:</span> {data.rx_descripcion || 'Sin hallazgos.'}<br />
                                    <span style={labelStyle}>ARISCAT:</span> {data.ariscat_total} pts ({data.ariscat_categoria})
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* SCALES SUMMARY TABLE */}
                <table border={1} cellPadding={5} cellSpacing={0} style={{ ...baseTable, border: '1px solid black', backgroundColor: '#fafafa' }}>
                    <thead>
                        <tr bgcolor="#f3f4f6" height="25">
                            <th style={{ ...labelStyle, fontSize: '10px' }}>ASA</th>
                            <th style={{ ...labelStyle, fontSize: '10px' }}>GOLDMAN</th>
                            <th style={{ ...labelStyle, fontSize: '10px' }}>DETSKY</th>
                            <th style={{ ...labelStyle, fontSize: '10px' }}>LEE</th>
                            <th style={{ ...labelStyle, fontSize: '10px' }}>CAPRINI</th>
                            <th style={{ ...labelStyle, fontSize: '10px' }}>GUPTA %</th>
                            <th style={{ ...labelStyle, fontSize: '10px' }}>DUKE (METs)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr align="center" height="30">
                            <td style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.asa}</td>
                            <td style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.goldman}</td>
                            <td style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.detsky}</td>
                            <td style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.lee}</td>
                            <td style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.caprini}</td>
                            <td style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.gupta}%</td>
                            <td style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.duke_resultado || '-'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* PAGE BREAK (Visual representation) */}
            <div style={{ height: '2px', backgroundColor: '#eee', margin: '20px 0', borderStyle: 'dashed', borderWidth: '1px 0' }}></div>

            {/* PAGE 2 */}
            <div id="print-page-2" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white' }}>
                <table border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '2px solid black', minHeight: '850px' }}>
                    <tbody>
                        <tr><td height="40" bgcolor="#1e3a8a" align="center" style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>PLAN DE MANEJO PERIOPERATORIO</td></tr>
                        <tr>
                            <td valign="top" style={{ padding: '20px' }}>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ height: '100%' }}>
                                    <tbody>
                                        <tr>
                                            <td width="33%" valign="top" style={{ borderRight: '1px solid #ccc', paddingRight: '15px' }}>
                                                <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '8px', border: '1px solid black', marginBottom: '15px' }}>PRE-QUIRÚRGICO</div>
                                                <div style={{ fontSize: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{data.plan_pre}</div>
                                            </td>
                                            <td width="33%" valign="top" style={{ borderRight: '1px solid #ccc', padding: '0 15px' }}>
                                                <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '8px', border: '1px solid black', marginBottom: '15px' }}>TRANS-QUIRÚRGICO</div>
                                                <div style={{ fontSize: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{data.plan_trans}</div>
                                            </td>
                                            <td width="33%" valign="top" style={{ paddingLeft: '15px' }}>
                                                <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '8px', border: '1px solid black', marginBottom: '15px' }}>POST-QUIRÚRGICO</div>
                                                <div style={{ fontSize: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{data.plan_post}</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td valign="bottom" style={{ borderTop: '2px solid black', padding: '30px 20px 100px 20px' }}>
                                {hasOverrides && (
                                    <div style={{ padding: '10px', backgroundColor: '#fffbeb', fontSize: '10px', fontStyle: 'italic', border: '1px solid #ffeeb3', marginBottom: '60px' }}>
                                        <b>NOTA DE AUDITORÍA CLÍNICA:</b> Los puntajes de riesgo y escalas presentadas incluyen ajustes manuales realizados por el facultativo basados en la complejidad clínica individual del paciente.
                                    </div>
                                )}

                                <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
                                    <tbody>
                                        <tr>
                                            <td width="42%" align="center">
                                                <div style={{ borderTop: '1px solid black', width: '90%', paddingTop: '15px' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>{data.residente || 'DR. MÉDICO RESIDENTE'}</div>
                                                    <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>MÉDICO RESIDENTE</div>
                                                    <div style={{ fontSize: '9px', color: '#666' }}>MATRÍCULA: {data.residente_matricula || '---'}</div>
                                                </div>
                                            </td>
                                            <td width="16%"></td>
                                            <td width="42%" align="center">
                                                <div style={{ borderTop: '1px solid black', width: '90%', paddingTop: '15px' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>{data.elaboro || 'DR. MÉDICO ADSCRITO'}</div>
                                                    <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>MÉDICO ADSCRITO</div>
                                                    <div style={{ fontSize: '9px', color: '#666' }}>MATRÍCULA: {data.matricula || '---'}</div>
                                                </div>
                                            </td>
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