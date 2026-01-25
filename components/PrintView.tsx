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

    // Dedicated Table Styling for extreme stability
    const tableBase: React.CSSProperties = {
        display: 'table',
        width: '714px',
        tableLayout: 'fixed',
        borderCollapse: 'collapse',
        margin: '0 auto',
        backgroundColor: 'white',
        color: 'black',
        fontFamily: 'Arial, sans-serif'
    };

    const tableRow: React.CSSProperties = {
        display: 'table-row',
        width: '100%'
    };

    const tableCell = (width?: string): React.CSSProperties => ({
        display: 'table-cell',
        width: width || 'auto',
        verticalAlign: 'top',
        boxSizing: 'border-box',
        padding: '2px 0'
    });

    const labelStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '10px'
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '10px',
        borderBottom: '1px solid black',
        minHeight: '1.2em'
    };

    const sectionHeader: React.CSSProperties = {
        backgroundColor: '#f1f5f9',
        border: '1px solid black',
        fontWeight: 'bold',
        fontSize: '11px',
        padding: '5px 10px',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '5px'
    };

    return (
        <div style={{ background: 'white', width: '794px', minHeight: '2000px' }}>
            {/* PAGE 1 */}
            <div id="print-page-1" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white' }}>

                {/* HEAD */}
                <div style={{ ...tableBase, borderBottom: '2px solid black', paddingBottom: '10px' }}>
                    <div style={tableRow}>
                        <div style={{ ...tableCell('70px'), verticalAlign: 'middle' }}>
                            <img src="/logo.png" alt="Logo" style={{ width: '60px', height: '60px' }} />
                        </div>
                        <div style={{ ...tableCell('344px'), paddingLeft: '15px', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a' }}>VPO Digital</div>
                            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>CMN SIGLO XXI - MEDICINA INTERNA</div>
                        </div>
                        <div style={{ ...tableCell('300px'), textAlign: 'right' }}>
                            <div style={{ fontSize: '9px', fontWeight: 'bold' }}>DIRECCIÓN DE PRESTACIONES MÉDICAS</div>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', marginTop: '5px' }}>VALORACIÓN PREOPERATORIA</div>
                        </div>
                    </div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* IDENTIFICACION */}
                <div style={{ border: '1px solid black', padding: '10px' }}>
                    <div style={tableBase}>
                        <div style={tableRow}>
                            <div style={tableCell('80px')}><span style={labelStyle}>NOMBRE:</span></div>
                            <div style={tableCell('400px')}><div style={valueStyle}>{data.nombre}</div></div>
                            <div style={{ ...tableCell('60px'), paddingLeft: '10px' }}><span style={labelStyle}>FECHA:</span></div>
                            <div style={tableCell('174px')}><div style={valueStyle}>{data.fecha}</div></div>
                        </div>
                    </div>
                    <div style={{ height: '5px' }}></div>
                    <div style={tableBase}>
                        <div style={tableRow}>
                            <div style={tableCell('40px')}><span style={labelStyle}>NSS:</span></div>
                            <div style={tableCell('150px')}><div style={valueStyle}>{data.nss}</div></div>
                            <div style={{ ...tableCell('50px'), paddingLeft: '10px' }}><span style={labelStyle}>EDAD:</span></div>
                            <div style={tableCell('50px')}><div style={valueStyle}>{data.edad}</div></div>
                            <div style={{ ...tableCell('70px'), paddingLeft: '10px' }}><span style={labelStyle}>GÉNERO:</span></div>
                            <div style={tableCell('80px')}><div style={valueStyle}>{data.genero}</div></div>
                            <div style={{ ...tableCell('50px'), paddingLeft: '10px' }}><span style={labelStyle}>CAMA:</span></div>
                            <div style={tableCell('224px')}><div style={valueStyle}>{data.cama}</div></div>
                        </div>
                    </div>
                    <div style={{ height: '5px' }}></div>
                    <div style={tableBase}>
                        <div style={tableRow}>
                            <div style={tableCell('110px')}><span style={labelStyle}>DX QUIRÚRGICO:</span></div>
                            <div style={tableCell('604px')}><div style={valueStyle}>{data.diagnosticoQuirurgico}</div></div>
                        </div>
                    </div>
                    <div style={{ height: '5px' }}></div>
                    <div style={tableBase}>
                        <div style={tableRow}>
                            <div style={tableCell('140px')}><span style={labelStyle}>CIRUGÍA PROGRAMADA:</span></div>
                            <div style={tableCell('574px')}><div style={valueStyle}>{data.cirugiaProgramada}</div></div>
                        </div>
                    </div>
                    <div style={{ height: '5px' }}></div>
                    <div style={tableBase}>
                        <div style={tableRow}>
                            <div style={tableCell('40px')}><span style={labelStyle}>TIPO:</span></div>
                            <div style={tableCell('150px')}><div style={valueStyle}>{data.tipoCirugia}</div></div>
                            <div style={{ ...tableCell('40px'), paddingLeft: '10px' }}><span style={labelStyle}>PESO:</span></div>
                            <div style={tableCell('50px')}><div style={valueStyle}>{data.peso} kg</div></div>
                            <div style={{ ...tableCell('40px'), paddingLeft: '10px' }}><span style={labelStyle}>TALLA:</span></div>
                            <div style={tableCell('50px')}><div style={valueStyle}>{data.talla} m</div></div>
                            <div style={{ ...tableCell('50px'), paddingLeft: '10px', backgroundColor: '#f1f5f9' }}><span style={labelStyle}>IMC:</span></div>
                            <div style={{ ...tableCell('294px'), backgroundColor: '#f1f5f9' }}><div style={{ ...valueStyle, textAlign: 'center' }}>{data.imc}</div></div>
                        </div>
                    </div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* RIESGOS */}
                <div style={{ border: '1px solid black' }}>
                    <div style={sectionHeader}>FACTORES DE RIESGO</div>
                    <div style={{ padding: '10px' }}>
                        <div style={tableBase}>
                            <div style={tableRow}>
                                <div style={{ ...tableCell('50%'), borderBottom: '1px dotted #ccc' }}>
                                    <span style={labelStyle}>TABAQUISMO:</span> SI <Check val={data.tabaquismo} /> IT: {data.indiceTabaquico}
                                </div>
                                <div style={{ ...tableCell('50%'), borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}>
                                    <span style={labelStyle}>ALERGIAS:</span> SI <Check val={data.alergicos} />
                                </div>
                            </div>
                            <div style={tableRow}>
                                <div style={{ ...tableCell('50%'), borderBottom: '1px dotted #ccc' }}>
                                    <span style={labelStyle}>HTA:</span> SI <Check val={data.hta} /> {data.hta ? `(${data.hta_control})` : ''}
                                </div>
                                <div style={{ ...tableCell('50%'), borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}>
                                    <span style={labelStyle}>DIABETES:</span> SI <Check val={data.diabetes} /> {data.diabetesTipo}
                                </div>
                            </div>
                            <div style={tableRow}>
                                <div style={{ ...tableCell('50%'), borderBottom: '1px dotted #ccc' }}>
                                    <span style={labelStyle}>CARD. ISQUÉMICA:</span> SI <Check val={data.cardiopatiaIsquemica} />
                                </div>
                                <div style={{ ...tableCell('50%'), borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}>
                                    <span style={labelStyle}>I. CARDIACA:</span> SI <Check val={data.icc} /> NYHA: {data.icc_nyha}
                                </div>
                            </div>
                            <div style={tableRow}>
                                <div style={{ ...tableCell('50%'), borderBottom: '1px dotted #ccc' }}>
                                    <span style={labelStyle}>ENF. RENAL:</span> SI <Check val={data.enfRenalCronica} /> TFG: {data.tfg}
                                </div>
                                <div style={{ ...tableCell('50%'), borderBottom: '1px dotted #ccc', paddingLeft: '20px' }}>
                                    <span style={labelStyle}>NEUMOPATÍA:</span> SI <Check val={data.neumopatia} /> {data.neumo_tipo}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <div style={labelStyle}>CIRUGÍAS PREVIAS / COMPLICACIONES:</div>
                            <div style={{ ...valueStyle, minHeight: '1.4em', borderBottom: '1px solid black' }}>{data.cirugiasPrevias || '-'}</div>
                        </div>
                        <div style={{ marginTop: '5px' }}>
                            <div style={labelStyle}>OTRAS ENFERMEDADES / TRATAMIENTO ACTUAL:</div>
                            <div style={{ ...valueStyle, minHeight: '1.4em', borderBottom: '1px solid black' }}>{data.otrasEnfermedades} {data.tratamientoActual}</div>
                        </div>
                    </div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* SIGNOS VITALES */}
                <div style={{ border: '1px solid black' }}>
                    <div style={{ ...tableBase, backgroundColor: '#f1f5f9', borderBottom: '1px solid black', textAlign: 'center' }}>
                        <div style={tableRow}>
                            <div style={{ ...tableCell('16.6%'), height: '25px', verticalAlign: 'middle' }}><span style={labelStyle}>TA:</span> {data.taSistolica}/{data.taDiastolica}</div>
                            <div style={{ ...tableCell('16.6%'), verticalAlign: 'middle' }}><span style={labelStyle}>FC:</span> {data.fc}</div>
                            <div style={{ ...tableCell('16.6%'), verticalAlign: 'middle' }}><span style={labelStyle}>FR:</span> {data.fr}</div>
                            <div style={{ ...tableCell('16.6%'), verticalAlign: 'middle' }}><span style={labelStyle}>TEMP:</span> {data.temp}°C</div>
                            <div style={{ ...tableCell('16.6%'), verticalAlign: 'middle' }}><span style={labelStyle}>SATO2:</span> {data.sato2}%</div>
                            <div style={{ ...tableCell('17%'), verticalAlign: 'middle' }}><span style={labelStyle}>GLUC:</span> {data.glucosaCapilar}</div>
                        </div>
                    </div>
                    <div style={{ ...tableBase, textAlign: 'center', padding: '5px 0' }}>
                        <div style={tableRow}>
                            <div style={{ ...tableCell('25%'), borderRight: '1px dotted black' }}>
                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>BIOMETRÍA</div>
                                <div style={{ fontSize: '10px' }}>Hb: {data.hb} / Leu: {data.leucocitos} / Plaq: {data.plaquetas}</div>
                            </div>
                            <div style={{ ...tableCell('25%'), borderRight: '1px dotted black' }}>
                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>TIEMPOS</div>
                                <div style={{ fontSize: '10px' }}>TP: {data.tp} / TTP: {data.ttp} / INR: {data.inr}</div>
                            </div>
                            <div style={{ ...tableCell('25%'), borderRight: '1px dotted black' }}>
                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>QUÍMICA</div>
                                <div style={{ fontSize: '10px' }}>Glu: {data.glucosaCentral} / Urea: {data.urea} / Cr: {data.creatinina}</div>
                            </div>
                            <div style={tableCell('25%')}>
                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>ELECTROLITOS</div>
                                <div style={{ fontSize: '10px' }}>Na: {data.na} / K: {data.k} / Cl: {data.cl}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* GABINETE */}
                <div style={{ border: '1px solid black' }}>
                    <div style={sectionHeader}>GABINETE</div>
                    <div style={{ ...tableBase, padding: '10px' }}>
                        <div style={tableRow}>
                            <div style={{ ...tableCell('350px'), borderRight: '1px dotted black', paddingRight: '10px' }}>
                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>ELECTROCARDIOGRAMA:</div>
                                <div style={{ fontSize: '10px' }}>Frec: {data.ecg_frecuencia || data.frecuenciaEcg} lpm / Ritmo: {data.ecg_ritmo_especifico || data.ritmo}</div>
                                <div style={{ fontSize: '10px' }}>Bloqueo: {data.ecg_bloqueo || 'Ninguno'} {data.ecg_hvi ? '/ HVI' : ''}</div>
                            </div>
                            <div style={{ ...tableCell('364px'), paddingLeft: '15px' }}>
                                <div style={{ ...labelStyle, textDecoration: 'underline' }}>RADIOGRAFÍA DE TÓRAX:</div>
                                <div style={{ ...valueStyle, borderBottom: '1px solid black' }}>{data.rx_descripcion || '-'}</div>
                                <div style={{ fontSize: '10px', marginTop: '5px' }}><span style={labelStyle}>ARISCAT:</span> {data.ariscat_total} pts ({data.ariscat_categoria})</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ height: '15px' }}></div>

                {/* ESCALAS */}
                <div style={{ border: '2px solid black', padding: '10px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                    <div style={tableBase}>
                        <div style={tableRow}>
                            <div style={tableCell('25%')}><span style={labelStyle}>ASA:</span> {data.asa}</div>
                            <div style={tableCell('25%')}><span style={labelStyle}>GOLDMAN:</span> {data.goldman}</div>
                            <div style={tableCell('25%')}><span style={labelStyle}>LEE:</span> {data.lee}</div>
                            <div style={tableCell('25%')}><span style={labelStyle}>DUKE:</span> {data.duke_resultado || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAGE 2 */}
            <div id="print-page-2" style={{ width: '794px', padding: '40px', boxSizing: 'border-box', backgroundColor: 'white', marginTop: '40px' }}>
                <div style={{ border: '2px solid black', minHeight: '940px', position: 'relative' }}>
                    <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>PLAN DE MANEJO PERIOPERATORIO</div>

                    <div style={{ ...tableBase, height: '700px', width: '100%', padding: '20px' }}>
                        <div style={tableRow}>
                            <div style={{ ...tableCell('33.3%'), borderRight: '1px solid black', paddingRight: '15px' }}>
                                <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid black' }}>PRE-QUIRÚRGICO</div>
                                <div style={{ fontSize: '10px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{data.plan_pre || data.recomendacionesGenerales || data.ayuno}</div>
                            </div>
                            <div style={{ ...tableCell('33.3%'), borderRight: '1px solid black', padding: '0 15px' }}>
                                <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid black' }}>TRANS-QUIRÚRGICO</div>
                                <div style={{ fontSize: '10px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{data.plan_trans || "Ver notas de Anestesiología."}</div>
                            </div>
                            <div style={{ ...tableCell('33.4%'), paddingLeft: '15px' }}>
                                <div style={{ ...labelStyle, textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid black' }}>POST-QUIRÚRGICO</div>
                                <div style={{ fontSize: '10px', marginTop: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{data.plan_post || data.tromboprofilaxis}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '0', width: '100%', borderTop: '2px solid black' }}>
                        {hasOverrides && (
                            <div style={{ padding: '8px 15px', backgroundColor: '#fffbeb', fontSize: '10px', fontStyle: 'italic', borderBottom: '1px solid black' }}>
                                NOTA DE AUDITORÍA: Escalas ajustadas según criterio clínico del médico tratante.
                            </div>
                        )}
                        <div style={{ ...tableBase, width: '100%', padding: '50px 20px' }}>
                            <div style={tableRow}>
                                <div style={tableCell('5%')}></div>
                                <div style={{ ...tableCell('40%'), textAlign: 'center', borderTop: '2px solid black', paddingTop: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>{data.elaboro || 'DR. MÉDICO INTERNISTA'}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>MÉDICO INTERNISTA</div>
                                </div>
                                <div style={tableCell('10%')}></div>
                                <div style={{ ...tableCell('40%'), textAlign: 'center', borderTop: '2px solid black', paddingTop: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{data.matricula || '----------'}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>MATRÍCULA</div>
                                </div>
                                <div style={tableCell('5%')}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintView;