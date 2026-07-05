import fs from 'fs';
let code = fs.readFileSync('src/components/owner/OwnerRegister.tsx', 'utf8');

// 1. Add states
const stateAddition = `
  const [currentStep, setCurrentStep] = useState(1);
  const [draftStatus, setDraftStatus] = useState<string | null>(null);

  // Draft Save Effect
  useEffect(() => {
    if (loading) return; // Don't overwrite draft while loading

    setDraftStatus("saving");
    const timeout = setTimeout(() => {
      const draft = {
        ownerName, mobileNumber, email, shopName, category, district, city, area, address, whatsapp,
        openingTime, closingTime, weeklyOff, template, services
      };
      localStorage.setItem("nexora_owner_registration_draft", JSON.stringify(draft));
      setDraftStatus("saved");
    }, 500);

    return () => clearTimeout(timeout);
  }, [ownerName, mobileNumber, email, shopName, category, district, city, area, address, whatsapp, openingTime, closingTime, weeklyOff, template, services, loading]);

  const clearDraft = () => {
    localStorage.removeItem("nexora_owner_registration_draft");
    setOwnerName("");
    setMobileNumber("");
    setEmail("");
    setShopName("");
    setCategory("Hair Salon");
    setDistrict("");
    setCity("");
    setArea("");
    setAddress("");
    setWhatsapp("");
    setOpeningTime("");
    setClosingTime("");
    setWeeklyOff("None");
    setTemplate("modern_salon");
    setServices([
      { service_name: "", price: "", duration_minutes: "" },
      { service_name: "", price: "", duration_minutes: "" },
      { service_name: "", price: "", duration_minutes: "" }
    ]);
    setDraftStatus("cleared");
  };
`;

code = code.replace(/  useEffect\(\(\) => \{\n    checkAuth\(\);\n  \}, \[\]\);/, stateAddition + '\n  useEffect(() => {\n    checkAuth();\n  }, []);');

// 2. Modify checkAuth to restore draft
const checkAuthOld = `      setUser(session.user);
      
      // Pre-fill profile info if available
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (profile) {
        setOwnerName(profile.full_name || "");
        setMobileNumber(profile.phone || "");
        setEmail(profile.email || session.user.email || "");
      } else {
        setEmail(session.user.email || "");
      }`;

const checkAuthNew = `      setUser(session.user);
      
      let loadedFromDraft = false;
      const draftStr = localStorage.getItem("nexora_owner_registration_draft");
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          if (draft && typeof draft === 'object') {
            if (draft.ownerName !== undefined) setOwnerName(draft.ownerName);
            if (draft.mobileNumber !== undefined) setMobileNumber(draft.mobileNumber);
            if (draft.email !== undefined) setEmail(draft.email);
            if (draft.shopName !== undefined) setShopName(draft.shopName);
            if (draft.category !== undefined) setCategory(draft.category);
            if (draft.district !== undefined) setDistrict(draft.district);
            if (draft.city !== undefined) setCity(draft.city);
            if (draft.area !== undefined) setArea(draft.area);
            if (draft.address !== undefined) setAddress(draft.address);
            if (draft.whatsapp !== undefined) setWhatsapp(draft.whatsapp);
            if (draft.openingTime !== undefined) setOpeningTime(draft.openingTime);
            if (draft.closingTime !== undefined) setClosingTime(draft.closingTime);
            if (draft.weeklyOff !== undefined) setWeeklyOff(draft.weeklyOff);
            if (draft.template !== undefined) setTemplate(draft.template);
            if (draft.services !== undefined && Array.isArray(draft.services)) setServices(draft.services);
            loadedFromDraft = true;
          }
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }

      if (!loadedFromDraft) {
        // Pre-fill profile info if available
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profile) {
          setOwnerName(profile.full_name || "");
          setMobileNumber(profile.phone || "");
          setEmail(profile.email || session.user.email || "");
        } else {
          setEmail(session.user.email || "");
        }
      } else {
         // Show restored message shortly
         setTimeout(() => setDraftStatus("restored"), 100);
         setTimeout(() => setDraftStatus("saved"), 3000);
      }`;

code = code.replace(checkAuthOld, checkAuthNew);

// 3. Clear draft on successful submit
code = code.replace('setSuccess(true);', 'setSuccess(true);\n      localStorage.removeItem("nexora_owner_registration_draft");');

// 4. Inject Progress Stepper UI
const stepperUI = `
        {/* Progress Stepper & Draft Status */}
        <div className="mb-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 px-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Progress</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                {draftStatus === "saving" && <><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Saving draft...</>}
                {draftStatus === "saved" && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Draft saved</>}
                {draftStatus === "restored" && <><Sparkles className="w-3.5 h-3.5 text-blue-500" /> Draft restored</>}
                {draftStatus === "cleared" && <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Draft cleared</>}
              </span>
              {(draftStatus === "saved" || draftStatus === "restored") && (
                <button type="button" onClick={clearDraft} className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer bg-rose-50 px-3 py-1 rounded-full">
                  Clear Draft
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar pb-2 px-2 snap-x">
            {[
              { id: 1, label: "Owner Details" },
              { id: 2, label: "Business Details" },
              { id: 3, label: "Timing" },
              { id: 4, label: "Website Setup" },
              { id: 5, label: "Services" },
            ].map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center shrink-0 snap-start">
                  <div className={"flex flex-col items-center gap-2 " + (isActive ? 'opacity-100' : isCompleted ? 'opacity-100' : 'opacity-40')}>
                    <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 " +
                      (isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' : 
                        isCompleted ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 
                        'bg-slate-50 border-slate-200 text-slate-400')
                    }>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={"text-[10px] font-bold uppercase tracking-wider " + (isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400')}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 4 && (
                    <div className={"w-8 sm:w-16 h-[2px] mx-2 sm:mx-4 rounded-full " + (isCompleted ? 'bg-emerald-200' : 'bg-slate-100')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
`;

code = code.replace('{error && (', stepperUI + '\n        {error && (');

// 5. Add section event handlers for step highlighting
let sectionCounter = 0;
code = code.replace(/<section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">/g, (match) => {
  sectionCounter++;
  return `<section onClickCapture={() => setCurrentStep(${sectionCounter})} onFocusCapture={() => setCurrentStep(${sectionCounter})} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">`;
});

fs.writeFileSync('src/components/owner/OwnerRegister.tsx', code);
console.log('Patched');
