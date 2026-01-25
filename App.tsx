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

// --- Configuration ---
// Default ID (may not work on all dynamic WebContainer origins)
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

  // Determine colors based on severity (simple logic)
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
          {/* Logo Hidden on Desktop via opacity since it's in Sidebar, keeps layout spacing */}
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[13px] font-extrabold text-slate-900 leading-none">VPO DIGITAL</h1>
            <p className="text-[9px] text-clinical-navy font-bold tracking-tighter mt-0.5">
              {servicioSolicitante || 'Medicina Interna'} CMN S. XXI
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

  const navItems = [
    { icon: User, label: "Paciente", step: 0 },
    { icon: Activity, label: "Clínica", step: 1 },
    { icon: FileImage, label: "Gabinete", step: 2 },
    { icon: Pill, label: "Fármacos", step: 3 },
    { icon: ClipboardCheck, label: "Escalas", step: 4 },
    { icon: FileText, label: "Reporte", step: 5 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 left-0 z-40 overflow-y-auto no-print shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-5 border-b border-gray-100 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-clinical-navy leading-none tracking-tight">VPO Digital</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">CMN S. XXI</p>
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
            VPO Digital v2.0
            <span className="block text-[10px] text-slate-400 mt-1">Responsive Suite</span>
          </p>
        </div>
      </div>
    </aside>
  );
};

// --- Bottom Navigation ---
const BottomNav = ({ activeStep, setStep }: { activeStep: number, setStep: (s: number) => void }) => {
  const navItems = [
    { icon: User, label: "Paciente", step: 0 },
    { icon: Activity, label: "Clínica", step: 1 },
    { icon: FileImage, label: "Gabinete", step: 2 },
    { icon: Pill, label: "Fármacos", step: 3 },
    { icon: ClipboardCheck, label: "Escalas", step: 4 },
    { icon: FileText, label: "Reporte", step: 5 },
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

// --- Helper to Generate Plain Text Note ---
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
${data.cirugiasPrevias ? `Antecedentes: ${data.cirugiasPrevias}` : ''}

LABORATORIOS:
${labs}
ECG: ${data.ecg_ritmo_especifico || data.ritmo}, Frec: ${data.ecg_frecuencia || data.frecuenciaEcg} lpm.
RX: ${data.rx_descripcion || 'Sin alteraciones'}
ARISCAT: ${data.ariscat_total} pts (${data.ariscat_categoria}).

ESCALAS DE RIESGO:
• ASA: ${data.asa || '-'}
• GOLDMAN: Clase ${data.goldman || '-'}
• DETSKY: Clase ${data.detsky || '-'}
• LEE (RCRI): ${data.lee || '-'}
• CAPRINI: ${data.caprini || '-'} pts
• GUPTA (MICA): ${data.gupta || 0}% Riesgo IAM/Paro.
• DUKE (Endocarditis): ${data.duke_resultado || 'Rechazado'}

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
    mode: "onBlur"
  });

  // --- PERSISTENCE LOGIC (LOCALSTORAGE) ---
  // 1. Load Data on Mount
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
  }, []); // Run once on mount

  // 2. Save Data on Change
  useEffect(() => {
    const subscription = methods.watch((value) => {
      localStorage.setItem('vpo_current_data', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [methods.watch]);


  const generatePDFDoc = async (): Promise<jsPDF> => {
    // 1. Get the Hidden Report Elements
    const page1 = document.getElementById('print-page-1');
    const page2 = document.getElementById('print-page-2');

    if (!page1 || !page2) throw new Error("Report pages not found");

    const pdf = new jsPDF('p', 'mm', 'letter');
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const capturePage = async (element: HTMLElement) => {
      // 800ms delay to ensure the browser has fully rendered the tables
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 1200,
      });
      return canvas.toDataURL('image/png', 0.98);
    };

    // Capture and add Page 1
    const imgData1 = await capturePage(page1);
    const imgProps1 = pdf.getImageProperties(imgData1);
    const imgHeight1 = (imgProps1.height * pdfWidth) / imgProps1.width;
    pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, imgHeight1);

    // Add Page 2
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

      // Detectar si es dispositivo móvil
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // En móviles, autoPrint no funciona bien. Mejor guardar/descargar.
        // El visor nativo del celular (iOS/Android) tiene su propia opción de imprimir.
        const dateStr = new Date().toISOString().split('T')[0];
        const rawName = methods.getValues().nombre || 'Paciente';
        const safeName = rawName.replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`VPO_${safeName}_${dateStr}.pdf`);
      } else {
        // En Desktop, abrir nueva pestaña con diálogo de impresión
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
      }
    } catch (e) {
      console.error("Error generating PDF", e);
      alert("Error al generar vista de impresión.");
    }
  };

  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  };

  const handleDriveUpload = () => {
    setIsUploading(true);

    // Safety Timeout: Reset loading state if nothing happens in 60s
    // useful if popup is blocked without event or network hangs
    const safetyTimeout = setTimeout(() => {
      setIsUploading((current) => {
        if (current) {
          alert("Tiempo de espera agotado. Verifique si hay ventanas emergentes bloqueadas.");
          return false;
        }
        return current;
      });
    }, 60000);

    // Check if Google Scripts loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      alert("Los servicios de Google no están listos. Por favor verifique su conexión o recargue la página.");
      clearTimeout(safetyTimeout);
      setIsUploading(false);
      return;
    }

    // Determine Client ID
    const storedClientId = localStorage.getItem('vpo_google_client_id_v2');
    const clientId = storedClientId || DEFAULT_CLIENT_ID;

    // Init Client logic is synchronous to prevent popup blocking
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (tokenResponse: any) => {
          clearTimeout(safetyTimeout); // Clear safety timer on success callback

          if (tokenResponse && tokenResponse.access_token) {
            // PDF Generation happens AFTER auth success
            try {
              const doc = await generatePDFDoc();
              const pdfBlob = doc.output('blob');

              const dateStr = new Date().toISOString().split('T')[0];
              const rawName = methods.getValues().nombre || 'Paciente';
              const safeName = rawName.replace(/[^a-zA-Z0-9]/g, '_');
              const fileName = `${dateStr}_${safeName}_VPO.pdf`;

              // Get Folder ID first
              const folderId = await getOrCreateFolder(tokenResponse.access_token);

              // 1. Upload PDF
              await uploadFileToDrive(tokenResponse.access_token, pdfBlob, fileName, folderId);

              // 2. Upload RX if exists
              const rxData = methods.getValues('rx_imagen');
              if (rxData) {
                const rxBlob = base64ToBlob(rxData);
                const rxName = `${dateStr}_${safeName}_RX.png`;
                await uploadFileToDrive(tokenResponse.access_token, rxBlob, rxName, folderId);
              }

              // 3. Upload EKG if exists
              const ekgData = methods.getValues('ekg_imagen');
              if (ekgData) {
                const ekgBlob = base64ToBlob(ekgData);
                const ekgName = `${dateStr}_${safeName}_EKG.png`;
                await uploadFileToDrive(tokenResponse.access_token, ekgBlob, ekgName, folderId);
              }

              alert(`✅ Guardado exitoso en Drive con imágenes.`);
            } catch (err) {
              console.error("Error creating PDF", err);
              alert("Error al generar el PDF.");
              setIsUploading(false);
            }
          } else {
            // Auth failed (denied or error)
            // Error object usually not passed here in implicit flow but check just in case
            if (tokenResponse && tokenResponse.error) {
              console.error("Auth Token Error:", tokenResponse);
              alert(`Error de Autenticación: ${tokenResponse.error.message || tokenResponse.error}`);
            }
            setIsUploading(false);
          }
        },
        error_callback: (err: any) => {
          clearTimeout(safetyTimeout); // Clear safety timer on error
          setIsUploading(false); // Stop loading

          // Ignore manual closure
          if (err.type === 'popup_closed_by_user') {
            console.warn("Auth: User closed popup.");
            return;
          }

          // Handle browser blocks
          if (err.type === 'popup_blocked_by_browser') {
            alert("El navegador bloqueó la ventana de Google. Por favor permita ventanas emergentes e intente de nuevo.");
            return;
          }

          // HANDLE INVALID CLIENT (401 / 403 / invalid_client)
          // The error object might be structured differently depending on the library version, 
          // usually err.type or err.message contains helpful info.
          console.error("Auth Error Callback:", err);

          const isInvalidClient = err.type === 'invalid_client' || (err.message && err.message.includes('invalid_client'));

          if (isInvalidClient) {
            const newId = prompt(
              `⚠️ ERROR CRÍTICO DE CONFIGURACIÓN\n\n` +
              `El "Client ID" configurado no es válido o fue eliminado.\n` +
              `Debe ingresar uno nuevo generado en Google Cloud Console para autorizar este dominio.\n\n` +
              `Ingrese nuevo Client ID:`,
              clientId
            );
            if (newId && newId.trim() !== clientId) {
              localStorage.setItem('vpo_google_client_id_v2', newId.trim());
              alert("✅ Client ID actualizado correctamente.\n\nIntente presionar el botón DRIVE nuevamente.");
            }
            return;
          }

          // Generic Fallback
          alert(`Error de Google Auth: ${err.type || err.message || JSON.stringify(err)}`);
        }
      });

      // Trigger Auth Flow IMMEDIATELY on click
      // Use explicit error handling for the prompt trigger itself
      setTimeout(() => {
        try {
          client.requestAccessToken();
        } catch (reqErr) {
          clearTimeout(safetyTimeout);
          setIsUploading(false);
          console.error("RequestAccessToken Error", reqErr);
          alert("Error al solicitar acceso. Verifique consola.");
        }
      }, 0);

    } catch (e) {
      clearTimeout(safetyTimeout);
      console.error("Init Error", e);
      alert("Error al iniciar servicio de autenticación.");
      setIsUploading(false);
    }
  };

  const getOrCreateFolder = async (accessToken: string): Promise<string> => {
    // Search for Folder "VPO_Expedientes_MedicinaInterna"
    const qQuery = "mimeType='application/vnd.google-apps.folder' and name='VPO_Expedientes_MedicinaInterna' and trashed=false";
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(qQuery)}`;

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!searchRes.ok) throw new Error(`Search Failed: ${searchRes.status}`);
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    } else {
      // Create folder if not exists
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'VPO_Expedientes_MedicinaInterna',
          mimeType: 'application/vnd.google-apps.folder'
        })
      });
      const createData = await createRes.json();
      return createData.id;
    }
  };

  const uploadFileToDrive = async (accessToken: string, blob: Blob, fileName: string, folderId: string) => {
    try {
      // Upload File to that folder
      const metadata = {
        name: fileName,
        parents: [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      // Upload URL construction
      const uploadUrl = new URL('https://www.googleapis.com/upload/drive/v3/files');
      uploadUrl.searchParams.append('uploadType', 'multipart');
      uploadUrl.searchParams.append('fields', 'id,webViewLink');

      const uploadRes = await fetch(uploadUrl.toString(), {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });

      if (uploadRes.ok) {
        const fileData = await uploadRes.json();
        // Only set driveLink for the PDF (first file usually or we can check filename)
        if (fileName.endsWith('_VPO.pdf')) {
          methods.setValue('driveLink', fileData.webViewLink);
        }
      } else {
        const errTxt = await uploadRes.text();
        throw new Error(`Upload Failed: ${errTxt}`);
      }
    } catch (error) {
      console.error(error);
      alert(`Error de conexión con Google Drive: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  // --- EXECUTIVE SUMMARY GENERATOR ---
  const generateExecutiveSummary = (data: VPOData): string => {
    // Goldman Risks Mapping
    const goldmanMap: Record<string, string> = { "I": "0.2%", "II": "1%", "III": "7%", "IV": "22%" };
    const goldmanRisk = goldmanMap[data.goldman || "I"];

    // Logic for dynamic text
    const tfg = data.tfg || 0;
    const tfgNote = tfg < 60 ? `TFG Disminuida: ${tfg} ml/min (Ajuste renal fármacos).` : "";

    const meds = data.selectedMeds || [];
    const steroids = meds.filter(m => m.isSteroid && m.action === 'adjust');
    const steroidNote = steroids.length > 0 ? "Dosis de Estrés con Hidrocortisona INDICADA." : "";
    const anticoagNote = meds.some(m => m.isAnticoagulant) ? "Anticoagulación: Ver puenteo/suspensión." : "";

    // Required Template
    const base = `Paciente ${data.edad} años, programado para ${data.cirugiaProgramada || 'Cirugía'}.`;
    const risks = `Riesgo Cardiovascular: Goldman Clase ${data.goldman} (${goldmanRisk}), Lee Clase ${data.lee}. ASA: ${data.asa}. Criterios de Duke: ${data.duke_resultado || 'Rechazado'}.`;

    const recs = `Recomendaciones clave: Metas TA < 180/110, Glu 70-180. ${data.tfg < 30 ? 'AINEs Contraindicados' : 'Suspender AINEs 7 días'}. ${steroidNote} ${anticoagNote} ${tfgNote}`.trim();

    return `${base}\n${risks}\n${recs}`;
  };

  const handleWhatsApp = () => {
    const data = methods.getValues();
    const summary = generateExecutiveSummary(data);

    let text = `*IMPRESIÓN DIAGNÓSTICA VPO*\n${summary}`;

    if (data.driveLink) {
      text += `\n\n📄 *Descargar VPO Oficial (PDF):*\n${data.driveLink}`;
    } else {
      text += `\n\n(Nota: Sube el PDF a Drive para incluir el enlace aquí).`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
            {/* Step 0: Patient */}
            <div className={activeStep === 0 ? 'block animate-fadeIn' : 'hidden'}>
              <PatientInfo />
            </div>

            {/* Step 1: Clinical (Risk & Labs) */}
            <div className={activeStep === 1 ? 'block animate-fadeIn space-y-6' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <RiskFactors />
                <LabsAndVitals />
              </div>
            </div>

            {/* Step 2: Gabinete (NEW) */}
            <div className={activeStep === 2 ? 'block animate-fadeIn space-y-6' : 'hidden'}>
              <Gabinete />
            </div>

            {/* Step 3: Medication Reconciliation */}
            <div className={activeStep === 3 ? 'block animate-fadeIn space-y-6' : 'hidden'}>
              <MedicationReconciliation />
            </div>

            {/* Step 4: Scales & Plan */}
            <div className={activeStep === 4 ? 'block animate-fadeIn space-y-6' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <RiskScales />
                <Recommendations />
              </div>
            </div>

            {/* Step 5: Report & Actions */}
            <div className={activeStep === 5 ? 'block animate-fadeIn' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                  <h3 className="font-bold text-clinical-navy mb-2 flex items-center gap-2">
                    <Printer size={16} /> Vista Previa
                  </h3>
                  <div className="border border-gray-100 rounded bg-gray-50 p-2 overflow-x-auto h-[400px] text-[8px] no-scrollbar shadow-inner">
                    <div className="min-w-[500px] bg-white p-4 shadow scale-75 origin-top-left">
                      <PrintView />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-slate-800 mb-2">Acciones de Exportación</h3>
                  <button
                    onClick={handlePrintPDF}
                    className="w-full bg-clinical-navy text-white py-4 rounded-xl font-bold shadow-lg shadow-clinical-navy/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-800"
                  >
                    <Printer size={20} />
                    IMPRIMIR PDF OFICIAL
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDriveUpload}
                      disabled={isUploading}
                      className="w-full bg-white border-2 border-clinical-navy text-clinical-navy py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 text-xs hover:bg-slate-50"
                    >
                      {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      {isUploading ? "..." : "DRIVE"}
                    </button>

                    <button
                      onClick={handleWhatsApp}
                      className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 text-xs hover:bg-[#1fa851]"
                    >
                      <MessageCircle size={16} />
                      WHATSAPP
                    </button>
                  </div>

                  <div className="pt-2">
                    {methods.watch('driveLink') && (
                      <div className="p-3 bg-green-50 text-green-800 text-xs rounded-lg border border-green-200 text-center animate-fadeIn flex items-center justify-center gap-2">
                        <CheckCircle2 size={14} />
                        Link de Drive generado correctamente.
                      </div>
                    )}

                    {/* Manual Config Trigger */}
                    <button
                      onClick={() => {
                        const current = localStorage.getItem('vpo_google_client_id_v2') || DEFAULT_CLIENT_ID;
                        const newId = prompt("Configuración Manual de Client ID (Google Cloud):\n\nIngrese el Client ID autorizado para este dominio:", current);
                        if (newId && newId.trim() !== current) {
                          localStorage.setItem('vpo_google_client_id_v2', newId.trim());
                          alert("Configuración actualizada.");
                        }
                      }}
                      className="w-full mt-2 text-[10px] text-gray-400 underline hover:text-clinical-navy flex items-center justify-center gap-1"
                    >
                      <Settings size={10} /> Configurar Google ID
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Floating Action Button (Only on Report Step) */}
        {activeStep === 5 && (
          <button
            onClick={handleCopyNote}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl z-40 transition-transform active:scale-90 flex items-center gap-2 no-print"
          >
            <Copy size={24} />
            <span className="font-bold text-sm hidden sm:inline">Copiar Nota</span>
          </button>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:bottom-10 bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-2 text-sm font-medium animate-bounce-short">
            <CheckCircle2 size={18} className="text-green-400" />
            Nota copiada al portapapeles
          </div>
        )}

        <BottomNav activeStep={activeStep} setStep={setActiveStep} />

        {/* Hidden Container for high-res PDF generation using html2canvas */}
        <div id="print-content" style={{ position: 'absolute', left: '-9999px', top: '0', width: '794px', backgroundColor: 'white' }}>
          <PrintView />
        </div>

      </div>
    </FormProvider>
  );
};

export default App;