import React from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';

const PrintView: React.FC = () => {
    const { watch } = useFormContext<VPOData>();
    const data = watch();
    const overrides = data.risk_overrides || {};
    const hasOverrides = Object.keys(overrides).length > 0;

    const Check = ({ val }: { val: boolean }) => (
        <span style={{ fontWeight: 'bold' }}>{val ? '[X]' : '[ ]'}</span>
    );

    // Global Reset for Print
    const containerStyle: React.CSSProperties = {
        background: 'white',
        width: '794px',
        color: 'black',
        fontFamily: 'Arial, sans-serif',
        margin: '0',
        padding: '0',
        boxSizing: 'border-box'
    };

    const rowStyle: React.CSSProperties = {
        width: '100%',
        clear: 'both',
        display: 'block',
        marginBottom: '6px'
    };

    const colStyle = (width: number): React.CSSProperties => ({
        width: `${width}px`,
        float: 'left',
        boxSizing: 'border-box',
        minHeight: '1px'
    });

    const clearfix: React.CSSProperties = {
        clear: 'both',
        display: 'table',
        content: '""'
    };

    const labelStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '10px',
        color: '#333'
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '10px',
        borderBottom: '1px solid black',
        paddingBottom: '1px'
    };

    return (
        <div style={containerStyle}>
            {/* PAGE 1 */}
            <div id="print-page-1" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white', minHeight: '1120px' }}>

                {/* Header Row */}
                <div style={rowStyle}>
                    <div style={colStyle(70)}>
                        <img src="/logo.png" alt="Logo" style={{ width: '60px', height: '60px' }} />
                    </div>
                    <div style={{ ...colStyle(340), paddingLeft: '15px' }}>
                        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>VPO Digital</div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666' }}>CMN SIGLO XXI - MEDICINA INTERNA</div>
                    </div>
                    <div style={{ ...colStyle(304), textAlign: 'right' }}>
                        <div style={{ fontSize: '9px', fontWeight: 'bold' }}>DIRECCIÓN DE PRESTACIONES MÉDICAS</div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', marginTop: '5px', display: 'block' }}>VALORACIÓN PREOPERATORIA</div>
                    </div>
                    <div style={clearfix}></div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* Identification Section */}
                <div style={{ border: '1px solid black', padding: '10px' }}>
                    <div style={rowStyle}>
                        <div style={colStyle(500)}><span style={labelStyle}>NOMBRE: </span><span style={valueStyle}>{data.nombre}</span></div>
                        <div style={colStyle(214)}><span style={labelStyle}>FECHA: </span><span style={valueStyle}>{data.fecha}</span></div>
                        <div style={clearfix}></div>
                    </div>
                    <div style={rowStyle}>
                        <div style={colStyle(180)}><span style={labelStyle}>NSS: </span><span style={valueStyle}>{data.nss}</span></div>
                        <div style={colStyle(100)}><span style={labelStyle}>EDAD: </span><span style={valueStyle}>{data.edad}</span></div>
                        <div style={colStyle(180)}><span style={labelStyle}>GÉNERO: </span><span style={valueStyle}>{data.genero}</span></div>
                        <div style={colStyle(254)}><span style={labelStyle}>CAMA: </span><span style={valueStyle}>{data.cama}</span></div>
                        <div style={clearfix}></div>
                    </div>
                    <div style={rowStyle}>
                        <div style={colStyle(714)}><span style={labelStyle}>DX QUIRÚRGICO: </span><span style={valueStyle}>{data.diagnosticoQuirurgico}</span></div>
                        <div style={clearfix}></div>
                    </div>
                    <div style={rowStyle}>
                        <div style={colStyle(714)}><span style={labelStyle}>CIRUGÍA PROGRAMADA: </span><span style={valueStyle}>{data.cirugiaProgramada}</span></div>
                        <div style={clearfix}></div>
                    </div>
                    <div style={rowStyle}>
                        <div style={colStyle(200)}><span style={labelStyle}>TIPO: </span><span style={valueStyle}>{data.tipoCirugia}</span></div>
                        <div style={colStyle(120)}><span style={labelStyle}>PESO: </span><span style={valueStyle}>{data.peso} kg</span></div>
                        <div style={colStyle(120)}><span style={labelStyle}>TALLA: </span><span style={valueStyle}>{data.talla} m</span></div>
                        <div style={{ ...colStyle(274), background: '#f0f0f0', paddingLeft: '10px' }}>
                            <span style={labelStyle}>IMC: </span><span style={valueStyle}>{data.imc}</span>
                        </div>
                        <div style={clearfix}></div>
                    </div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* Risk Factors Section */}
                <div style={{ border: '1px solid black' }}>
                    <div style={{ backgroundColor: '#f0f0f0', padding: '6px', fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid black' }}>FACTORES DE RIESGO</div>
                    <div style={{ padding: '10px' }}>
                        <div style={rowStyle}>
                            <div style={colStyle(357)}><span style={labelStyle}>TABAQUISMO:</span> SI <Check val={data.tabaquismo} /> IT: {data.indiceTabaquico}</div>
                            <div style={colStyle(357)}><span style={labelStyle}>ALERGIAS:</span> SI <Check val={data.alergicos} /></div>
                            <div style={clearfix}></div>
                        </div>
                        <div style={rowStyle}>
                            <div style={colStyle(357)}><span style={labelStyle}>HTA:</span> SI <Check val={data.hta} /> {data.hta ? `(${data.hta_control})` : ''}</div>
                            <div style={colStyle(357)}><span style={labelStyle}>DIABETES:</span> SI <Check val={data.diabetes} /> {data.diabetesTipo}</div>
                            <div style={clearfix}></div>
                        </div>
                        <div style={rowStyle}>
                            <div style={colStyle(357)}><span style={labelStyle}>CARD. ISQUÉMICA:</span> SI <Check val={data.cardiopatiaIsquemica} /></div>
                            <div style={colStyle(357)}><span style={labelStyle}>I. CARDIACA:</span> SI <Check val={data.icc} /> NYHA: {data.icc_nyha}</div>
                            <div style={clearfix}></div>
                        </div>
                        <div style={rowStyle}>
                            <div style={colStyle(357)}><span style={labelStyle}>ENF. RENAL:</span> SI <Check val={data.enfRenalCronica} /> TFG: {data.tfg}</div>
                            <div style={colStyle(357)}><span style={labelStyle}>NEUMOPATÍA:</span> SI <Check val={data.neumopatia} /> {data.neumo_tipo}</div>
                            <div style={clearfix}></div>
                        </div>
                        <div style={{ height: '10px', borderBottom: '1px solid #ccc', margin: '10px 0' }}></div>
                        <div style={rowStyle}>
                            <div style={labelStyle}>CIRUGÍAS PREVIAS / COMPLICACIONES:</div>
                            <div style={{ ...valueStyle, minHeight: '1.5em' }}>{data.cirugiasPrevias || '-'}</div>
                        </div>
                        <div style={rowStyle}>
                            <div style={labelStyle}>OTRAS ENFERMEDADES / TRATAMIENTO ACTUAL:</div>
                            <div style={{ ...valueStyle, minHeight: '1.5em' }}>{data.otrasEnfermedades} {data.tratamientoActual ? `/ ${data.tratamientoActual}` : ''}</div>
                        </div>
                    </div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* Vital Signs Row */}
                <div style={{ border: '1px solid black' }}>
                    <div style={{ ...rowStyle, backgroundColor: '#f0f0f0', padding: '6px', textAlign: 'center', borderBottom: '1px solid black' }}>
                        <div style={colStyle(119)}><span style={labelStyle}>TA:</span> {data.taSistolica}/{data.taDiastolica}</div>
                        <div style={colStyle(119)}><span style={labelStyle}>FC:</span> {data.fc}</div>
                        <div style={colStyle(119)}><span style={labelStyle}>FR:</span> {data.fr}</div>
                        <div style={colStyle(119)}><span style={labelStyle}>T:</span> {data.temp}°C</div>
                        <div style={colStyle(119)}><span style={labelStyle}>Sat:</span> {data.sato2}%</div>
                        <div style={colStyle(119)}><span style={labelStyle}>Gluc:</span> {data.glucosaCapilar}</div>
                        <div style={clearfix}></div>
                    </div>
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                        <div style={colStyle(178)}><div style={{ ...labelStyle, textDecoration: 'underline' }}>BIOMETRÍA</div>Hb: {data.hb} / Leu: {data.leucocitos}</div>
                        <div style={colStyle(178)}><div style={{ ...labelStyle, textDecoration: 'underline' }}>TIEMPOS</div>TP: {data.tp} / TTP: {data.ttp}</div>
                        <div style={colStyle(178)}><div style={{ ...labelStyle, textDecoration: 'underline' }}>QS</div>Glu: {data.glucosaCentral} / Cr: {data.creatinina}</div>
                        <div style={colStyle(178)}><div style={{ ...labelStyle, textDecoration: 'underline' }}>ES</div>Na: {data.na} / K: {data.k}</div>
                        <div style={clearfix}></div>
                    </div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* Gabinete Row */}
                <div style={{ border: '1px solid black' }}>
                    <div style={{ backgroundColor: '#f0f0f0', padding: '6px', fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid black' }}>GABINETE</div>
                    <div style={{ padding: '10px' }}>
                        <div style={colStyle(350)}>
                            <div style={{ ...labelStyle, textDecoration: 'underline' }}>ELECTROCARDIOGRAMA:</div>
                            <div style={{ fontSize: '10px', marginTop: '4px' }}>Frec: {data.ecg_frecuencia || data.frecuenciaEcg} lpm / Ritmo: {data.ecg_ritmo_especifico || data.ritmo}</div>
                        </div>
                        <div style={{ ...colStyle(350), paddingLeft: '14px' }}>
                            <div style={{ ...labelStyle, textDecoration: 'underline' }}>RADIOGRAFÍA DE TÓRAX:</div>
                            <div style={{ ...valueStyle, width: '100%' }}>{data.rx_descripcion || '-'}</div>
                            <div style={{ fontSize: '10px', marginTop: '5px' }}><span style={labelStyle}>ARISCAT:</span> {data.ariscat_total} pts</div>
                        </div>
                        <div style={clearfix}></div>
                    </div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* Summary Box */}
                <div style={{ border: '1px solid black', padding: '10px', textAlign: 'center' }}>
                    <div style={colStyle(178)}><span style={labelStyle}>ASA:</span> {data.asa}</div>
                    <div style={colStyle(178)}><span style={labelStyle}>GOLDMAN:</span> {data.goldman}</div>
                    <div style={colStyle(178)}><span style={labelStyle}>LEE:</span> {data.lee}</div>
                    <div style={colStyle(178)}><span style={labelStyle}>DUKE:</span> {data.duke_resultado || '-'}</div>
                    <div style={clearfix}></div>
                </div>

            </div>

            {/* PAGE 2 */}
            <div id="print-page-2" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white', minHeight: '1120px', marginTop: '20px' }}>
                <div style={{ border: '2px solid black', minHeight: '940px', position: 'relative' }}>
                    <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>PLAN DE MANEJO PERIOPERATORIO</div>

                    <div style={{ padding: '20px' }}>
                        <div style={{ ...colStyle(220), borderRight: '1px solid black', height: '600px', paddingRight: '10px' }}>
                            <div style={{ ...labelStyle, textAlign: 'center', background: '#f0f0f0', padding: '5px', border: '1px solid black' }}>PRE-QUIRÚRGICO</div>
                            <div style={{ fontSize: '11px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.plan_pre || data.recomendacionesGenerales || data.ayuno}</div>
                        </div>
                        <div style={{ ...colStyle(220), borderRight: '1px solid black', height: '600px', padding: '0 10px' }}>
                            <div style={{ ...labelStyle, textAlign: 'center', background: '#f0f0f0', padding: '5px', border: '1px solid black' }}>TRANS-QUIRÚRGICO</div>
                            <div style={{ fontSize: '11px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.plan_trans || "Ver notas de Anestesiología."}</div>
                        </div>
                        <div style={{ ...colStyle(220), height: '600px', paddingLeft: '10px' }}>
                            <div style={{ ...labelStyle, textAlign: 'center', background: '#f0f0f0', padding: '5px', border: '1px solid black' }}>POST-QUIRÚRGICO</div>
                            <div style={{ fontSize: '11px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.plan_post || data.tromboprofilaxis}</div>
                        </div>
                        <div style={clearfix}></div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '0', width: '100%', borderTop: '1px solid black' }}>
                        {hasOverrides && (
                            <div style={{ padding: '10px', backgroundColor: '#fffbeb', fontSize: '10px', fontStyle: 'italic', borderBottom: '1px solid black' }}>
                                NOTA: Escalas ajustadas según criterio clínico individual.
                            </div>
                        )}
                        <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                            <div style={{ ...colStyle(300), borderTop: '1px solid black' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{data.elaboro || 'DR. MÉDICO INTERNISTA'}</div>
                                <div style={{ fontSize: '9px', color: '#333' }}>MÉDICO INTERNISTA</div>
                            </div>
                            <div style={colStyle(110)}></div>
                            <div style={{ ...colStyle(300), borderTop: '1px solid black' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{data.matricula || '----------'}</div>
                                <div style={{ fontSize: '9px', color: '#333' }}>MATRÍCULA</div>
                            </div>
                            <div style={clearfix}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintView;