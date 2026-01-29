import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { VPOData, Gender } from './types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Printer,
  Stethoscope,
  User,
  Activity,
  ClipboardCheck,
  FileText,
  Copy,
  CheckCircle2,
  Pill,
  FileImage,
  UploadCloud,
  Loader2,
  Save,
  MessageCircle,
  Settings
} from 'lucide-react';
import PatientInfo from './components/PatientInfo';
import RiskFactors from './components/RiskFactors';
import LabsAndVitals from './components/LabsAndVitals';
import MedicationReconciliation from './components/MedicationReconciliation';
import RiskScales from './components/RiskScales';
import Recommendations from './components/Recommendations';
import PrintView from './components/PrintView';
import Gabinete from './components/Gabinete';
import MedicalNoteGenerator from './components/MedicalNoteGenerator';

// --- Configuration ---
// Google Drive Client ID. Sigue los pasos en GOOGLE_DRIVE_SETUP.md para configurar el tuyo.
const DEFAULT_CLIENT_ID = '147428616428-bafn28uqehgsdhivcs766t6f49o6gpl6.apps.googleusercontent.com';

// --- Badge Component for Header ---
const ScoreBadge = ({ label, value, colorClass = "bg-clinical-navy" }: { label: string, value: string | number | undefined, colorClass?: string }) => (
  <div className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg ${colorClass} text-white min-w-[60px]`}>
    <span className="text-[9px] font-bold opacity-80 uppercase tracking-wider">{label}</span>
    <span className="text-xs font-bold">{value || '-'}</span>
  </div>
);

// --- Header Component ---
const StickyHeader = () => {
  const { watch } = useFormContext<VPOData>();
  const asa = watch('asa');
  const lee = watch('lee');
  const caprini = watch('caprini');
  const unidadMedica = watch('unidadMedica');
  const servicioSolicitante = watch('servicioSolicitante');

  const getSeverityColor = (val: string | number | undefined) => {
    if (!val) return 'bg-gray-400';
    if (val === 'IV' || (typeof val === 'number' && val > 5)) return 'bg-clinical-red';
    if (val === 'III' || (typeof val === 'number' && val > 2)) return 'bg-orange-500';
    return 'bg-clinical-navy';
  };

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-30 shadow-sm transition-all duration-200 no-print">
      <div className="w-full max-w-md md:max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:opacity-0 pointer-events-none">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-clinical-navy leading-none tracking-tight">VPO Digital</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {servicioSolicitante || 'Medicina Interna'} • CMN S. XXI
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <ScoreBadge label="LEE" value={lee} colorClass={getSeverityColor(lee)} />
          <ScoreBadge label="ASA" value={asa} colorClass={getSeverityColor(asa)} />
          <ScoreBadge label="CAPRINI" value={caprini} colorClass={getSeverityColor(caprini)} />
        </div>
      </div>
    </header>
  );
};

const Sidebar = ({ activeStep, setStep }: { activeStep: number, setStep: (s: number) => void }) => {
  const { watch } = useFormContext<VPOData>();
  const unidadMedica = watch('unidadMedica');
  const servicioSolicitante = watch('servicioSolicitante');

  const navItems = [
    { icon: User, label: "Paciente", step: 0 },
    { icon: Activity, label: "Clínica", step: 1 },
    { icon: FileImage, label: "Gabinete", step: 2 },
    { icon: Pill, label: "Fármacos", step: 3 },
    { icon: ClipboardCheck, label: "Escalas", step: 4 },
    { icon: FileText, label: "Nota Médica", step: 5 },
    { icon: Printer, label: "Reporte", step: 6 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 left-0 z-40 overflow-y-auto no-print shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-5 border-b border-gray-100 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-clinical-navy leading-none tracking-tight">VPO Digital</h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em] mt-1 whitespace-nowrap">
              {servicioSolicitante || 'Medicina Interna'}
            </p>
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-0.5 opacity-70">
              CMN S. XXI
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1.5">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mb-1">Módulos</div>
        {navItems.map((item) => {
          const isActive = activeStep === item.step;
          return (
            <button
              key={item.label}
              onClick={() => setStep(item.step)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group
                ${isActive
                  ? 'bg-clinical-navy text-white shadow-md shadow-clinical-navy/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-clinical-navy'} strokeWidth={2} />
              <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-50" />}
            </button>
          )
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 text-center font-medium">
            VPO Digital v2.1 PRO
            <span className="block text-[10px] text-slate-400 mt-1">Ultima Act: {new Date().toLocaleDateString()}</span>
          </p>
        </div>
      </div>
    </aside>
  );
};

const BottomNav = ({ activeStep, setStep }: { activeStep: number, setStep: (s: number) => void }) => {
  const navItems = [
    { icon: User, label: "Paciente", step: 0 },
    { icon: Activity, label: "Clínica", step: 1 },
    { icon: FileImage, label: "Gabinete", step: 2 },
    { icon: Pill, label: "Fármacos", step: 3 },
    { icon: ClipboardCheck, label: "Escalas", step: 4 },
    { icon: FileText, label: "Nota", step: 5 },
    { icon: Printer, label: "PDF", step: 6 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe no-print lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = activeStep === item.step;
          return (
            <button
              key={item.label}
              onClick={() => setStep(item.step)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-clinical-navy' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <item.icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  );
};

const generateClinicalNote = (data: VPOData): string => {
  const risks = [];
  if (data.tabaquismo) risks.push(`Tabaquismo (IT: ${data.indiceTabaquico || '-'})`);
  if (data.hta) risks.push("HTA");
  if (data.diabetes) risks.push(`DM2 (${data.diabetesTipo}, ${data.usaInsulina ? 'Insulina' : 'Oral'})`);
  if (data.icc) risks.push("ICC");
  if (data.enfRenalCronica) risks.push(`ERC (TFG: ${data.tfg || '-'})`);

  const labs = `Hb: ${data.hb || '-'}, Plaq: ${data.plaquetas || '-'}, Leu: ${data.leucocitos || '-'}, Glu: ${data.glucosaCentral || '-'}, Cr: ${data.creatinina || '-'}, K: ${data.k || '-'}`;

  return `VALORACIÓN PREOPERATORIA
Paciente: ${data.nombre || 'Desconocido'} (${data.edad} años)
Dx: ${data.diagnosticoQuirurgico || 'Pendiente'}
Cirugía: ${data.cirugiaProgramada} (${data.tipoCirugia})

FACTORES DE RIESGO:
${risks.length > 0 ? risks.join(', ') : 'Negados'}
${data.cardio_stent ? `• Stent ${data.stent_tipo} (${data.stent_fecha_colocacion})` : ''}
${data.cirugiasPrevias ? `Antecedentes: ${data.cirugiasPrevias}` : ''}

LABORATORIOS:
${labs}
ECG: ${data.ecg_ritmo_especifico || data.ritmo}, Frec: ${data.ecg_frecuencia || data.frecuenciaEcg} lpm.
ARISCAT: ${data.ariscat_total} pts (${data.ariscat_categoria}).

ESCALAS DE RIESGO:
• ASA: ${data.asa || '-'} | Goldman: ${data.goldman || '-'} | Lee: ${data.lee || '-'}
• Caprini: ${data.caprini || '-'} pts | Gupta: ${data.gupta || 0}% | Duke: ${data.duke_resultado || '-'}
${data.arritmia_tipo === 'fa' || data.valvula_protesis ? `• CHA₂DS₂-VASc: ${data.cha2ds2vasc} | HAS-BLED: ${data.hasbled}` : ''}

PLAN / RECOMENDACIONES:
${data.recomendacionesGenerales || 'Sin recomendaciones específicas.'}
${data.ayuno ? `Ayuno: ${data.ayuno}` : ''}
`.trim();
};

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const methods = useForm<VPOData>({
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      genero: Gender.FEMALE,
      tipoCirugia: "Electiva",
      ayuno: "Ayuno de 6-8 horas para sólidos y 2 horas para líquidos claros.",
      soluciones: "Solución Hartmann 1000cc para 8 horas.",
      tabaquismo: false,
      diabetes: false,
      hta: false,
      servicioSolicitante: "Medicina Interna",
      unidadMedica: "CMN SIGLO XXI",
      selectedMeds: []
    },
    mode: "onChange"
  });

  useEffect(() => {
    const savedData = localStorage.getItem('vpo_current_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        methods.reset(parsed);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    const subscription = methods.watch((value) => {
      localStorage.setItem('vpo_current_data', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [methods.watch]);


  const generatePDFDoc = async (): Promise<jsPDF> => {
    const page1 = document.getElementById('print-page-1');
    const page2 = document.getElementById('print-page-2');
    if (!page1 || !page2) throw new Error("Report pages not found");

    const pdf = new jsPDF('p', 'mm', 'letter');
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const capturePage = async (element: HTMLElement) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById(element.id);
          const body = clonedDoc.body;
          if (clonedEl) {
            while (body.firstChild) body.removeChild(body.firstChild);
            body.appendChild(clonedEl);
            clonedEl.style.width = '794px';
            clonedEl.style.margin = '0 auto';
            clonedEl.style.padding = '0';
            clonedEl.style.position = 'static';
            clonedEl.style.transform = 'none';
          }
          body.style.width = '794px';
          body.style.margin = '0';
          body.style.padding = '0';
          body.style.backgroundColor = '#ffffff';
        }
      });
      return canvas.toDataURL('image/png', 1.0);
    };

    const imgData1 = await capturePage(page1);
    const imgProps1 = pdf.getImageProperties(imgData1);
    const imgHeight1 = (imgProps1.height * pdfWidth) / imgProps1.width;
    pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, imgHeight1);

    pdf.addPage();
    const imgData2 = await capturePage(page2);
    const imgProps2 = pdf.getImageProperties(imgData2);
    const imgHeight2 = (imgProps2.height * pdfWidth) / imgProps2.width;
    pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, imgHeight2);

    return pdf;
  };

  const handlePrintPDF = async () => {
    try {
      const doc = await generatePDFDoc();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const dateStr = new Date().toISOString().split('T')[0];
        const rawName = methods.getValues().nombre || 'Paciente';
        const safeName = rawName.replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`VPO_${safeName}_${dateStr}.pdf`);
      } else {
        doc.autoPrint();
        const blobUrl = doc.output('bloburl');
        const printWindow = window.open(blobUrl, '_blank');
        if (!printWindow || printWindow.closed) {
          alert("⚠️ Ventana emergente bloqueada. Se descargará el PDF.");
          const dateStr = new Date().toISOString().split('T')[0];
          const safeName = (methods.getValues().nombre || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
          doc.save(`VPO_${safeName}_${dateStr}.pdf`);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error al generar vista de impresión.");
    }
  };

  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
    return new Blob([uInt8Array], { type: contentType });
  };

  const handleDriveUpload = () => {
    setIsUploading(true);
    const safetyTimeout = setTimeout(() => {
      setIsUploading(false);
    }, 60000);

    if (!window.google || !window.google.accounts) {
      alert("Servicios de Google no listos.");
      setIsUploading(false);
      return;
    }

    const clientId = localStorage.getItem('vpo_google_client_id_v2') || DEFAULT_CLIENT_ID;
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (tokenResponse: any) => {
          clearTimeout(safetyTimeout);
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const doc = await generatePDFDoc();
              const pdfBlob = doc.output('blob');
              const dateStr = new Date().toISOString().split('T')[0];
              const safeName = (methods.getValues().nombre || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
              const fileName = `${dateStr}_${safeName}_VPO.pdf`;
              const folderId = await getOrCreateFolder(tokenResponse.access_token);

              // 1. Subir PDF
              await uploadFileToDrive(tokenResponse.access_token, pdfBlob, fileName, folderId);

              // 2. Subir RX si existe
              const rxData = methods.getValues('rx_imagen');
              if (rxData) {
                const rxBlob = base64ToBlob(rxData);
                const rxName = `${dateStr}_${safeName}_RX.png`;
                await uploadFileToDrive(tokenResponse.access_token, rxBlob, rxName, folderId);
              }

              // 3. Subir EKG si existe
              const ekgData = methods.getValues('ekg_imagen');
              if (ekgData) {
                const ekgBlob = base64ToBlob(ekgData);
                const ekgName = `${dateStr}_${safeName}_EKG.png`;
                await uploadFileToDrive(tokenResponse.access_token, ekgBlob, ekgName, folderId);
              }

              alert("✅ Guardado exitoso en Drive (Reporte + Imágenes).");
            } catch (err) {
              console.error(err);
              alert("Error al guardar.");
            } finally {
              setIsUploading(false);
            }
          }
        }
      });
      client.requestAccessToken();
    } catch (e) {
      setIsUploading(false);
    }
  };

  const getOrCreateFolder = async (accessToken: string): Promise<string> => {
    const q = "mimeType='application/vnd.google-apps.folder' and name='VPO_Expedientes_MedicinaInterna' and trashed=false";
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    if (data.files && data.files.length > 0) return data.files[0].id;
    const create = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'VPO_Expedientes_MedicinaInterna', mimeType: 'application/vnd.google-apps.folder' })
    });
    const folder = await create.json();
    return folder.id;
  };

  const uploadFileToDrive = async (token: string, blob: Blob, name: string, folder: string) => {
    const metadata = { name, parents: [folder] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    if (res.ok) {
      const data = await res.json();
      if (name.endsWith('_VPO.pdf')) methods.setValue('driveLink', data.webViewLink);
    }
  };

  const handleWhatsApp = () => {
    const data = methods.getValues();
    const summary = `VALORACIÓN VPO\nPaciente: ${data.nombre}\nASA: ${data.asa}\nLee: ${data.lee}\nGoldman: ${data.goldman}\nLink: ${data.driveLink || '(Sube a Drive primero)'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank');
  };

  const handleCopyNote = () => {
    const note = generateClinicalNote(methods.getValues());
    navigator.clipboard.writeText(note).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-clinical-bg font-sans pb-20 lg:pb-0 lg:flex items-start">
        <Sidebar activeStep={activeStep} setStep={setActiveStep} />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <StickyHeader />
          <main className="pt-4 md:pt-8 pb-8 px-4 w-full max-w-md md:max-w-3xl lg:max-w-6xl mx-auto flex-1">
            <div className={activeStep === 0 ? 'block' : 'hidden'}><PatientInfo /></div>
            <div className={activeStep === 1 ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><RiskFactors /><LabsAndVitals /></div>
            </div>
            <div className={activeStep === 2 ? 'block' : 'hidden'}><Gabinete /></div>
            <div className={activeStep === 3 ? 'block' : 'hidden'}><MedicationReconciliation /></div>
            <div className={activeStep === 4 ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><RiskScales /><Recommendations /></div>
            </div>
            <div className={activeStep === 5 ? 'block h-full' : 'hidden'}><MedicalNoteGenerator /></div>
            <div className={activeStep === 6 ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border h-[500px] overflow-auto"><PrintView /></div>
                <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
                  <button onClick={handlePrintPDF} className="w-full bg-clinical-navy text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"><Printer size={20} /> IMPRIMIR PDF</button>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleDriveUpload} className="bg-white border-2 border-clinical-navy text-clinical-navy py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs"><Save size={16} /> DRIVE</button>
                    <button onClick={handleWhatsApp} className="bg-[#25D366] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs"><MessageCircle size={16} /> WHATSAPP</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        {activeStep === 6 && (
          <button onClick={handleCopyNote} className="fixed bottom-24 right-4 bg-green-600 text-white p-4 rounded-full shadow-xl z-40 flex items-center gap-2">
            <Copy size={24} /><span className="hidden md:inline font-bold">Copiar Texto</span>
          </button>
        )}
      </div>
      {showToast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full z-50 animate-bounce">Nota copiada</div>}
      <BottomNav activeStep={activeStep} setStep={setActiveStep} />

      {/* Hidden Container for high-res PDF generation - THIS IS THE ONLY ONE WITH IDs print-page-1/2 */}
      <div id="print-content" style={{
        position: 'fixed',
        left: '-10000px',
        top: '0',
        width: '794px',
        zIndex: -1000
      }}>
        <PrintView isPrintMode={true} />
      </div>
    </FormProvider>
  );
};

export default App;