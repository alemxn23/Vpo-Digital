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
  MessageCircle
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
const DEFAULT_CLIENT_ID = '731588544070-3hll6fq9l809svj4gb9ccietamndae9.apps.googleusercontent.com';

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

  // Determine colors based on severity (simple logic)
  const getSeverityColor = (val: string | number | undefined) => {
    if (!val) return 'bg-gray-400';
    if (val === 'IV' || (typeof val === 'number' && val > 5)) return 'bg-clinical-red';
    if (val === 'III' || (typeof val === 'number' && val > 2)) return 'bg-orange-500';
    return 'bg-clinical-navy';
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm transition-all duration-200 no-print">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-clinical-navy p-1.5 rounded-lg text-white">
            <Stethoscope size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">VPO Digital</h1>
            <p className="text-[10px] text-gray-500">Medicina Interna</p>
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe no-print">
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
    // 1. Get the Hidden Report Element
    const reportElement = document.getElementById('print-content');
    if (!reportElement) throw new Error("Report element not found");

    // 2. Use html2canvas to capture it
    // Scale 2 for better retina/print resolution
    const canvas = await html2canvas(reportElement, {
      scale: 2, 
      useCORS: true,
      logging: false,
      windowWidth: 816 // Force Letter width approx
    });

    const imgData = canvas.toDataURL('image/png');

    // 3. Create PDF
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate aspect ratio to fit
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Add Image
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);

    return pdf;
  };

  const handlePrintPDF = async () => {
      try {
        const doc = await generatePDFDoc();
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
      } catch (e) {
        console.error("Error generating PDF", e);
        alert("Error al generar vista de impresión.");
      }
  };

  const handleDriveUpload = () => {
    setIsUploading(true);
    
    // Check if Google Scripts loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        alert("Los servicios de Google no están listos. Por favor verifique su conexión o recargue la página.");
        setIsUploading(false);
        return;
    }

    // Determine Client ID
    const storedClientId = localStorage.getItem('vpo_google_client_id');
    const clientId = storedClientId || DEFAULT_CLIENT_ID;

    // Init Client logic is synchronous to prevent popup blocking
    try {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: async (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    // PDF Generation happens AFTER auth success
                    try {
                        const doc = await generatePDFDoc();
                        const pdfBlob = doc.output('blob');
                        
                        const dateStr = new Date().toISOString().split('T')[0];
                        const rawName = methods.getValues().nombre || 'Paciente';
                        const safeName = rawName.replace(/[^a-zA-Z0-9]/g, '_');
                        const fileName = `${dateStr}_${safeName}_VPO.pdf`;
                        
                        await uploadFileToDrive(tokenResponse.access_token, pdfBlob, fileName);
                    } catch (err) {
                        console.error("Error creating PDF", err);
                        alert("Error al generar el PDF.");
                        setIsUploading(false);
                    }
                } else {
                    setIsUploading(false);
                }
            },
            error_callback: (err: any) => {
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
                
                // For other errors (origin_mismatch, invalid_client), prompt for new ID
                console.error("Auth Error:", err);
                const currentOrigin = window.location.origin;
                const newId = prompt(
                    `⚠️ Error de Configuración (${err.type}).\n\n` + 
                    `El Client ID actual no autoriza el origen: ${currentOrigin}\n\n` + 
                    `Ingrese un Client ID válido que autorice este dominio:`, 
                    clientId
                );
                if (newId && newId !== clientId) {
                    localStorage.setItem('vpo_google_client_id', newId.trim());
                    alert("Client ID actualizado. Intente hacer clic en DRIVE nuevamente.");
                }
            }
        });
        
        // Trigger Auth Flow IMMEDIATELY on click
        client.requestAccessToken();

    } catch (e) {
        console.error(e);
        alert("Error al iniciar servicio de autenticación.");
        setIsUploading(false);
    }
  };

  const uploadFileToDrive = async (accessToken: string, blob: Blob, fileName: string) => {
      try {
          // A. Search for Folder "VPO_Expedientes_MedicinaInterna"
          let folderId = "";
          
          // Use encodeURIComponent for 'q' parameter to prevent 400/404 errors with spaces
          const qQuery = "mimeType='application/vnd.google-apps.folder' and name='VPO_Expedientes_MedicinaInterna' and trashed=false";
          const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(qQuery)}`;
          
          const searchRes = await fetch(searchUrl, { 
              headers: { Authorization: `Bearer ${accessToken}` } 
          });
          
          if (!searchRes.ok) throw new Error(`Search Failed: ${searchRes.status}`);
          const searchData = await searchRes.json();
          
          if (searchData.files && searchData.files.length > 0) {
              folderId = searchData.files[0].id;
          } else {
              // B. Create folder if not exists
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
              folderId = createData.id;
          }

          // C. Upload File to that folder
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
              methods.setValue('driveLink', fileData.webViewLink);
              alert(`✅ Guardado exitoso en Drive.\nLink generado para WhatsApp.`);
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
      <div className="min-h-screen bg-clinical-bg font-sans pb-20">
        
        <StickyHeader />

        <main className="pt-20 pb-8 px-4 max-w-md mx-auto">
          {/* Step 0: Patient */}
          <div className={activeStep === 0 ? 'block animate-fadeIn' : 'hidden'}>
            <PatientInfo />
          </div>

          {/* Step 1: Clinical (Risk & Labs) */}
          <div className={activeStep === 1 ? 'block animate-fadeIn space-y-6' : 'hidden'}>
            <RiskFactors />
            <LabsAndVitals />
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
            <RiskScales />
            <Recommendations />
          </div>

          {/* Step 5: Report & Actions */}
          <div className={activeStep === 5 ? 'block animate-fadeIn' : 'hidden'}>
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
             <div className="space-y-3">
               <button 
                  onClick={handlePrintPDF}
                  className="w-full bg-clinical-navy text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  IMPRIMIR PDF OFICIAL
               </button>

               <div className="grid grid-cols-2 gap-3">
                   <button 
                      onClick={handleDriveUpload}
                      disabled={isUploading}
                      className="w-full bg-white border-2 border-clinical-navy text-clinical-navy py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 text-xs"
                    >
                      {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      {isUploading ? "..." : "DRIVE"}
                   </button>

                   <button 
                      onClick={handleWhatsApp}
                      className="w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 text-xs"
                    >
                      <MessageCircle size={16} />
                      WHATSAPP
                   </button>
               </div>
               
               {methods.watch('driveLink') && (
                   <div className="p-2 bg-green-50 text-green-800 text-xs rounded border border-green-200 text-center animate-fadeIn">
                       ✅ Link de Drive listo para compartir.
                   </div>
               )}
             </div>
          </div>
        </main>

        {/* Floating Action Button (Only on Report Step) */}
        {activeStep === 5 && (
          <button
            onClick={handleCopyNote}
            className="fixed bottom-24 right-4 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl z-40 transition-transform active:scale-90 flex items-center gap-2 no-print"
          >
            <Copy size={24} />
            <span className="font-bold text-sm hidden sm:inline">Copiar Nota</span>
          </button>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-2 text-sm font-medium animate-bounce-short">
            <CheckCircle2 size={18} className="text-green-400" />
            Nota copiada al portapapeles
          </div>
        )}

        <BottomNav activeStep={activeStep} setStep={setActiveStep} />

        {/* Hidden Container for high-res PDF generation using html2canvas */}
        <div id="print-content" className="absolute top-0 left-0 bg-white p-8 w-[816px] -z-50" style={{ transform: 'translateX(-9999px)' }}>
          <PrintView />
        </div>

      </div>
    </FormProvider>
  );
};

export default App;