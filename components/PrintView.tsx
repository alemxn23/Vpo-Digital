import React from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';

const PrintView: React.FC = () => {
    const { watch } = useFormContext<VPOData>();
    const data = watch();
    const overrides = data.risk_overrides || {};
    const hasOverrides = Object.keys(overrides).length > 0;

    const Check = ({ val }: { val: boolean }) => (
        <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{val ? '[X]' : '[ ]'}</span>
    );

    const getCardioText = () => {
        if (!data.cardiopatiaIsquemica) return "Negado";
        if (data.cardio_tipo_evento === 'iam') return `IAM (${data.cardio_fecha_evento})`;
        if (data.cardio_tipo_evento === 'angina_inestable') return "Angina Inestable";
        return "Angina Estable";
    };

    // STYLES - Extremely rigid pixel values
    const containerStyle: React.CSSProperties = {
        width: '794px',
        backgroundColor: 'white',
        color: 'black',
        fontFamily: '-apple-system, sans-serif',
        margin: '0',
        padding: '0',
        lineHeight: '1.3'
    };

    const blockStyle = (width: number, border = false): React.CSSProperties => ({
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        float: 'left',
        boxSizing: 'border-box',
        border: border ? '1px solid black' : 'none',
        overflow: 'hidden'
    });

    const labelStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '10px',
        whiteSpace: 'nowrap'
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '10px',
        borderBottom: '1px solid black',
        display: 'inline-block',
        minHeight: '13px',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    };

    const sectionHeader: React.CSSProperties = {
        width: '100%',
        backgroundColor: '#f1f5f9',
        border: '1px solid black',
        fontWeight: 'bold',
        fontSize: '11px',
        padding: '4px 10px',
        boxSizing: 'border-box',
        clear: 'both'
    };

    const rowWrapper: React.CSSProperties = {
        width: '100%',
        clear: 'both',
        display: 'block'
    };

    const spacer = (h = 10) => <div style={{ height: `${h}px`, clear: 'both', width: '100%' }} />;

    return (
        <div style={containerStyle}>
            {/* PAGE 1 */}
            <div id="print-page-1" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white', minHeight: '1120px' }}>

                {/* HEAD */}
                <div style={{ ...rowWrapper, borderBottom: '2px solid black', paddingBottom: '10px' }}>
                    <div style={blockStyle(70)}>
                        <img src="/logo.png" alt="Logo" style={{ width: '60px', height: '60px' }} />
                    </div>
                    <div style={{ ...blockStyle(344), paddingLeft: '15px' }}>
                        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a' }}>VPO Digital</div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>CMN SIGLO XXI - MEDICINA INTERNA</div>
                    </div>
                    <div style={{ ...blockStyle(300), textAlign: 'right' }}>
                        <div style={{ fontSize: '9px', fontWeight: 'bold' }}>DIRECCIÓN DE PRESTACIONES MÉDICAS</div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', marginTop: '5px' }}>VALORACIÓN PREOPERATORIA</div>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                </div>

                {spacer(15)}

                {/* IDENTIFICACION */}
                <div style={{ border: '1px solid black', padding: '10px', width: '714px', boxSizing: 'border-box' }}>
                    <div style={rowWrapper}>
                        <div style={blockStyle(80)}><span style={labelStyle}>NOMBRE:</span></div>
                        <div style={blockStyle(400)}><span style={valueStyle}>{data.nombre}</span></div>
                        <div style={{ ...blockStyle(60), paddingLeft: '10px' }}><span style={labelStyle}>FECHA:</span></div>
                        <div style={blockStyle(154)}><span style={valueStyle}>{data.fecha}</span></div>
                        <div style={{ clear: 'both' }}></div>
                    </div>
                    {spacer(8)}
                    <div style={rowWrapper}>
                        <div style={blockStyle(40)}><span style={labelStyle}>NSS:</span></div>
                        <div style={blockStyle(140)}><span style={valueStyle}>{data.nss}</span></div>
                        <div style={{ ...blockStyle(50), paddingLeft: '10px' }}><span style={labelStyle}>EDAD:</span></div>
                        <div style={blockStyle(50)}><span style={valueStyle}>{data.edad}</span></div>
                        <div style={{ ...blockStyle(70), paddingLeft: '10px' }}><span style={labelStyle}>GÉNERO:</span></div>
                        <div style={blockStyle(80)}><span style={valueStyle}>{data.genero}</span></div>
                        <div style={{ ...blockStyle(55), paddingLeft: '10px' }}><span style={labelStyle}>CAMA:</span></div>
                        <div style={blockStyle(189)}><span style={valueStyle}>{data.cama}</span></div>
                        <div style={{ clear: 'both' }}></div>
                    </div>
                    {spacer(8)}
                    <div style={rowWrapper}>
                        <div style={blockStyle(110)}><span style={labelStyle}>DX QUIRÚRGICO:</span></div>
                        <div style={blockStyle(584)}><span style={valueStyle}>{data.diagnosticoQuirurgico}</span></div>
                        <div style={{ clear: 'both' }}></div>
                    </div>
                    {spacer(8)}
                    <div style={rowWrapper}>
                        <div style={blockStyle(140)}><span style={labelStyle}>CIRUGÍA PROGRAMADA:</span></div>
                        <div style={blockStyle(554)}><span style={valueStyle}>{data.cirugiaProgramada}</span></div>
                        <div style={{ clear: 'both' }}></div>
                    </div>
                    {spacer(8)}
                    <div style={rowWrapper}>
                        <div style={blockStyle(45)}><span style={labelStyle}>TIPO:</span></div>
                        <div style={blockStyle(150)}><span style={valueStyle}>{data.tipoCirugia}</span></div>
                        <div style={{ ...blockStyle(45), paddingLeft: '10px' }}><span style={labelStyle}>PESO:</span></div>
                        <div style={blockStyle(60)}><span style={valueStyle}>{data.peso} kg</span></div>
                        <div style={{ ...blockStyle(45), paddingLeft: '10px' }}><span style={labelStyle}>TALLA:</span></div>
                        <div style={blockStyle(60)}><span style={valueStyle}>{data.talla} m</span></div>
                        <div style={{ ...blockStyle(50), paddingLeft: '10px', backgroundColor: '#f3f4f6' }}><span style={labelStyle}>IMC:</span></div>
                        <div style={{ ...blockStyle(239), backgroundColor: '#f3f4f6', textAlign: 'center' }}><span style={valueStyle}>{data.imc}</span></div>
                        <div style={{ clear: 'both' }}></div>
                    </div>
                </div>

                {spacer(15)}

                {/* RIESGOS */}
                <div style={{ border: '1px solid black', width: '714px' }}>
                    <div style={sectionHeader}>FACTORES DE RIESGO</div>
                    <div style={{ padding: '10px' }}>
                        <div style={rowWrapper}>
                            <div style={{ ...blockStyle(347), borderBottom: '1px dotted #ccc' }}>
                                <span style={labelStyle}>TABAQUISMO:</span> SI <Check val={data.tabaquismo} /> IT: {data.indiceTabaquico}
                            </div>
                            <div style={{ ...blockStyle(347), borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}>
                                <span style={labelStyle}>ALERGIAS:</span> SI <Check val={data.alergicos} />
                            </div>
                        </div>
                        <div style={rowWrapper}>
                            <div style={{ ...blockStyle(347), borderBottom: '1px dotted #ccc' }}>
                                <span style={labelStyle}>HTA:</span> SI <Check val={data.hta} /> {data.hta ? `(${data.hta_control})` : ''}
                            </div>
                            <div style={{ ...blockStyle(347), borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}>
                                <span style={labelStyle}>DIABETES:</span> SI <Check val={data.diabetes} /> {data.diabetesTipo}
                            </div>
                        </div>
                        <div style={rowWrapper}>
                            <div style={{ ...blockStyle(347), borderBottom: '1px dotted #ccc' }}>
                                <span style={labelStyle}>CARD. ISQUÉMICA:</span> SI <Check val={data.cardiopatiaIsquemica} /> {getCardioText()}
                            </div>
                            <div style={{ ...blockStyle(347), borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}>
                                <span style={labelStyle}>I. CARDIACA:</span> SI <Check val={data.icc} /> NYHA: {data.icc_nyha}
                            </div>
                        </div>
                        <div style={rowWrapper}>
                            <div style={{ ...blockStyle(347), borderBottom: '1px dotted #ccc' }}>
                                <span style={labelStyle}>ENF. RENAL:</span> SI <Check val={data.enfRenalCronica} /> TFG: {data.tfg}
                            </div>
                            <div style={{ ...blockStyle(347), borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}>
                                <span style={labelStyle}>NEUMOPATÍA:</span> SI <Check val={data.neumopatia} /> {data.neumo_tipo}
                            </div>
                        </div>
                        {spacer(10)}
                        <div style={rowWrapper}>
                            <span style={labelStyle}>CIRUGÍAS PREVIAS / COMPLICACIONES:</span>
                            <div style={{ ...valueStyle, width: '100%', minHeight: '1.4em' }}>{data.cirugiasPrevias || '-'}</div>
                        </div>
                        <div style={rowWrapper}>
                            <span style={labelStyle}>OTRAS ENFERMEDADES / TRATAMIENTO ACTUAL:</span>
                            <div style={{ ...valueStyle, width: '100%', minHeight: '1.4em' }}>{data.otrasEnfermedades} {data.tratamientoActual}</div>
                        </div>
                    </div>
                </div>

                {spacer(15)}

                {/* SIGNOS Y LABS */}
                <div style={{ border: '1px solid black', width: '714px' }}>
                    <div style={{ ...rowWrapper, backgroundColor: '#f1f5f9', borderBottom: '1px solid black', textAlign: 'center' }}>
                        <div style={blockStyle(119)}><span style={labelStyle}>TA:</span> {data.taSistolica}/{data.taDiastolica}</div>
                        <div style={blockStyle(119)}><span style={labelStyle}>FC:</span> {data.fc}</div>
                        <div style={blockStyle(119)}><span style={labelStyle}>FR:</span> {data.fr}</div>
                        <div style={blockStyle(119)}><span style={labelStyle}>TEMP:</span> {data.temp}°C</div>
                        <div style={blockStyle(119)}><span style={labelStyle}>SATO2:</span> {data.sato2}%</div>
                        <div style={blockStyle(119)}><span style={labelStyle}>GLUC:</span> {data.glucosaCapilar}</div>
                        <div style={{ clear: 'both' }}></div>
                    </div>
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                        <div style={{ ...blockStyle(173), borderRight: '1px dotted black' }}>
                            <div style={{ ...labelStyle, textDecoration: 'underline' }}>BIOMETRÍA</div>
                            <div style={{ fontSize: '9px' }}>Hb: {data.hb} / Leu: {data.leucocitos} / Plaq: {data.plaquetas}</div>
                        </div>
                        <div style={{ ...blockStyle(173), borderRight: '1px dotted black' }}>
                            <div style={{ ...labelStyle, textDecoration: 'underline' }}>TIEMPOS</div>
                            <div style={{ fontSize: '9px' }}>TP: {data.tp} / TTP: {data.ttp} / INR: {data.inr}</div>
                        </div>
                        <div style={{ ...blockStyle(173), borderRight: '1px dotted black' }}>
                            <div style={{ ...labelStyle, textDecoration: 'underline' }}>QUÍMICA</div>
                            <div style={{ fontSize: '9px' }}>Glu: {data.glucosaCentral} / Urea: {data.urea} / Cr: {data.creatinina}</div>
                        </div>
                        <div style={blockStyle(173)}>
                            <div style={{ ...labelStyle, textDecoration: 'underline' }}>ES</div>
                            <div style={{ fontSize: '9px' }}>Na: {data.na} / K: {data.k} / Cl: {data.cl}</div>
                        </div>
                        <div style={{ clear: 'both' }}></div>
                    </div>
                </div>

                {spacer(15)}

                {/* GABINETE */}
                <div style={{ border: '1px solid black', width: '714px' }}>
                    <div style={sectionHeader}>GABINETE</div>
                    <div style={{ padding: '10px' }}>
                        <div style={rowWrapper}>
                            <div style={{ ...blockStyle(347), borderRight: '1px dotted black', paddingRight: '10px' }}>
                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>ELECTROCARDIOGRAMA:</div>
                                <div style={{ fontSize: '10px' }}>Frec: {data.ecg_frecuencia || data.frecuenciaEcg} lpm / Ritmo: {data.ecg_ritmo_especifico || data.ritmo}</div>
                                <div style={{ fontSize: '10px' }}>Bloqueo: {data.ecg_bloqueo || 'Ninguno'} {data.ecg_hvi ? '/ HVI' : ''}</div>
                            </div>
                            <div style={{ ...blockStyle(347), paddingLeft: '15px' }}>
                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>RADIOGRAFÍA DE TÓRAX:</div>
                                <div style={{ ...valueStyle }}>{data.rx_descripcion || '-'}</div>
                                <div style={{ fontSize: '10px', marginTop: '5px' }}><span style={labelStyle}>ARISCAT:</span> {data.ariscat_total} pts ({data.ariscat_categoria})</div>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                    </div>
                </div>

                {spacer(15)}

                {/* ESCALAS */}
                <div style={{ border: '1px solid black', width: '714px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                    <div style={blockStyle(178)}><span style={labelStyle}>ASA:</span> {data.asa}</div>
                    <div style={blockStyle(178)}><span style={labelStyle}>GOLDMAN:</span> {data.goldman}</div>
                    <div style={blockStyle(178)}><span style={labelStyle}>LEE:</span> {data.lee}</div>
                    <div style={blockStyle(178)}><span style={labelStyle}>DUKE:</span> {data.duke_resultado || '-'}</div>
                    <div style={{ clear: 'both' }}></div>
                </div>
            </div>

            {/* PAGE 2 */}
            <div id="print-page-2" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white', marginTop: '40px', minHeight: '1120px' }}>
                <div style={{ border: '2px solid black', minHeight: '940px', position: 'relative', width: '714px' }}>
                    <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px', width: '100%', boxSizing: 'border-box' }}>PLAN DE MANEJO PERIOPERATORIO</div>

                    <div style={{ padding: '20px' }}>
                        <div style={{ ...blockStyle(224), borderRight: '1px solid black', height: '600px', paddingRight: '10px' }}>
                            <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid black' }}>PRE-QUIRÚRGICO</div>
                            <div style={{ fontSize: '10px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.plan_pre || data.recomendacionesGenerales || data.ayuno}</div>
                        </div>
                        <div style={{ ...blockStyle(224), borderRight: '1px solid black', height: '600px', padding: '0 10px' }}>
                            <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid black' }}>TRANS-QUIRÚRGICO</div>
                            <div style={{ fontSize: '10px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.plan_trans || "Ver notas de Anestesiología."}</div>
                        </div>
                        <div style={{ ...blockStyle(224), height: '600px', paddingLeft: '10px' }}>
                            <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid black' }}>POST-QUIRÚRGICO</div>
                            <div style={{ fontSize: '10px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.plan_post || data.tromboprofilaxis}</div>
                        </div>
                        <div style={{ clear: 'both' }}></div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '0', width: '100%', borderTop: '2px solid black' }}>
                        {hasOverrides && (
                            <div style={{ padding: '8px 15px', backgroundColor: '#fffbeb', fontSize: '10px', fontStyle: 'italic', borderBottom: '1px solid black' }}>
                                NOTA DE AUDITORÍA: Escalas ajustadas según criterio clínico del médico tratante.
                            </div>
                        )}
                        <div style={{ width: '100%', padding: '50px 20px', textAlign: 'center' }}>
                            <div style={blockStyle(307)}>
                                <div style={{ borderTop: '2px solid black', paddingTop: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>{data.elaboro || 'DR. MÉDICO INTERNISTA'}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>MÉDICO INTERNISTA</div>
                                </div>
                            </div>
                            <div style={blockStyle(100)}></div>
                            <div style={blockStyle(307)}>
                                <div style={{ borderTop: '2px solid black', paddingTop: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{data.matricula || '----------'}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>MATRÍCULA</div>
                                </div>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintView;