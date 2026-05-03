"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Zap, 
  User, 
  Store, 
  Mail, 
  Lock, 
  Key, 
  ArrowRight, 
  MessageSquare, 
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
  XCircle,
  Link2,
  Car,
  FileUp,
  ShieldCheck,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  sendOtpAction, 
  loginAction, 
  registerAction, 
  verifyOtpAction, 
  forgotPasswordAction, 
  resetPasswordAction,
  uploadFileAction
} from "@/lib/actions";
import dynamic from "next/dynamic";

const RegistrationMap = dynamic<any>(() => import("@/components/map/registration-map"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl" />
});

export function AuthHub({ initialMode = true }: { initialMode?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode ? "login" : "register");
  const [role, setRole] = useState<"user" | "owner">("user");
  
  const [step, setStep] = useState<"details" | "otp" | "garage_info" | "documents" | "reset">("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [garageName, setGarageName] = useState("");
  const [services, setServices] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [govIdUrl, setGovIdUrl] = useState("");
  const [garageImageUrl, setGarageImageUrl] = useState("");

  const [uploadingGovId, setUploadingGovId] = useState(false);
  const [uploadingGarageImage, setUploadingGarageImage] = useState(false);
  const govIdInputRef = useRef<HTMLInputElement>(null);
  const garageImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "register") setMode("register");
    else if (modeParam === "forgot") setMode("forgot");
    
    const roleParam = searchParams.get("role") as "user" | "owner";
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const resetState = () => {
    setError("");
    setSuccess("");
    setStep("details");
    setDevOtp("");
    setOtp("");
  };

  const handleModeChange = (newMode: "login" | "register" | "forgot") => {
    setMode(newMode);
    resetState();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "govId" | "garageImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "govId") setUploadingGovId(true);
    else setUploadingGarageImage(true);
    
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadFileAction(formData);
      if (res.url) {
        if (type === "govId") setGovIdUrl(res.url);
        else setGarageImageUrl(res.url);
      } else {
        setError(res.error || "File upload failed");
      }
    } catch (err) {
      setError("Server error during upload");
    } finally {
      if (type === "govId") setUploadingGovId(false);
      else setUploadingGarageImage(false);
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (mode === "forgot") {
        const res = await forgotPasswordAction(email);
        if (res.success) {
          setStep("otp");
          if ((res as any).otp) setDevOtp((res as any).otp);
        } else {
          setError(res.error || "No account found");
        }
      } else {
        const res = await sendOtpAction(email, mode as any);
        if (res.success) {
          setStep("otp");
          if ((res as any).otp) setDevOtp((res as any).otp);
        } else {
          setError(res.error || "Failed to send code");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (mode === "login") {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("otp", otp);
        
        const result = await loginAction(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          // If no error, the server action likely redirected. 
          // If not, we force a hard navigation to the redirect URL
          const redirectTo = searchParams.get("redirectTo") || "/dashboard";
          router.push(redirectTo);
        }
      } else if (mode === "forgot") {
        const res = await verifyOtpAction(email, otp, "forgot");
        if (res.success) setStep("reset");
        else setError("Invalid reset code");
      } else {
        const res = await verifyOtpAction(email, otp, "register");
        if (res.success) {
          if (role === "owner") setStep("garage_info");
          else await handleFinalRegister();
        } else {
          setError("Invalid verification code");
        }
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT") || err?.message?.includes("NEXT_REDIRECT")) {
        throw err;
      }
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await resetPasswordAction({ email, otp, newPassword: password });
    setLoading(false);
    if (res.success) {
      setSuccess("Account recovered! You can now log in.");
      setMode("login");
      setStep("details");
    } else {
      setError(res.error || "Reset failed");
    }
  };

  const handleFinalRegister = async () => {
    setLoading(true);
    setError("");
    const result = await registerAction(
      { name, email, password, role, garageName, services, phone, address, lat: location.lat, lng: location.lng },
      { govIdUrl, garageImageUrl, redirectTo: searchParams.get("redirectTo") || undefined }
    );
    setLoading(false);
    if (result?.error) setError(result.error);
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-inter selection:bg-primary selection:text-white">
      {/* Immersive Background */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Floating UI Elements */}
      <div className="absolute top-1/4 right-1/4 animate-pulse pointer-events-none opacity-20 hidden lg:block">
         <Zap className="w-40 h-40 text-primary stroke-[0.5]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-20 flex flex-col md:flex-row bg-[#080808]/90 backdrop-blur-3xl rounded-[48px] border border-white/5 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]"
      >
        {/* Left Side: Brand & Context */}
        <div className="w-full md:w-[40%] p-10 lg:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                    <Zap className="w-6 h-6 text-white fill-current" />
                 </div>
                 <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-white">PitStop<span className="text-primary italic">Live</span></span>
              </div>
              
              <div className="space-y-4">
                 <h1 className="text-4xl lg:text-5xl font-black font-outfit uppercase italic tracking-tighter text-white leading-[0.9]">
                   Ready to <br/><span className="text-primary">Deploy?</span>
                 </h1>
                 <p className="text-white/40 text-sm font-medium leading-relaxed italic">
                   The mission control for India's first real-time emergency roadside assistance network.
                 </p>
              </div>
           </div>

           <div className="pt-12 md:pt-0">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 w-fit">
                 <ShieldCheck className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Neural Encryption Active</span>
              </div>
           </div>
        </div>

        {/* Right Side: Form Logic */}
        <div className="flex-1 p-10 lg:p-20 relative">
          <div className="max-w-md mx-auto space-y-12">
            {/* Form Header */}
            <div className="space-y-4">
               {step !== "details" && (
                  <button 
                    onClick={() => setStep("details")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-all group italic"
                  >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Revert Stream
                  </button>
               )}
               <div className="space-y-1">
                  <h2 className="text-4xl font-black font-outfit uppercase italic tracking-tighter text-white leading-none">
                    {mode === "login" ? "Authentication" : mode === "forgot" ? "Recovery" : "Registration"}
                  </h2>
                  <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                     <span>{mode === "login" ? "Resume your session" : mode === "forgot" ? "Reset security credentials" : "Initialize new node"}</span>
                     <span className="w-1 h-1 rounded-full bg-white/10" />
                     <button 
                      onClick={() => handleModeChange(mode === "login" ? "register" : "login")}
                      className="text-primary hover:text-white underline font-bold transition-colors"
                    >
                      {mode === "login" ? "Join Network" : "Switch to Login"}
                    </button>
                  </div>
               </div>
            </div>

            {/* Error/Success Feed */}
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                   <AlertCircle className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">{error}</p>
              </motion.div>
            )}

            {/* Role Selection High-End Toggle */}
            {step === "details" && mode === "register" && (
              <div className="flex p-2 bg-white/5 rounded-3xl border border-white/5 relative">
                <div className={cn(
                  "absolute inset-y-2 w-[calc(50%-8px)] bg-primary rounded-[22px] transition-all duration-500 ease-out shadow-2xl shadow-primary/40",
                  role === "owner" ? "left-[calc(50%+4px)]" : "left-2"
                )} />
                <button 
                  onClick={() => setRole("user")}
                  className={cn(
                    "flex-1 py-4 relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest italic transition-colors",
                    role === "user" ? "text-white" : "text-white/30 hover:text-white/50"
                  )}
                >
                  <User className="w-4 h-4" /> Node: Driver
                </button>
                <button 
                  onClick={() => setRole("owner")}
                  className={cn(
                    "flex-1 py-4 relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest italic transition-colors",
                    role === "owner" ? "text-white" : "text-white/30 hover:text-white/50"
                  )}
                >
                  <Store className="w-4 h-4" /> Node: Provider
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "details" && (
                <motion.form key="details" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleAction} className="space-y-8">
                  <div className="space-y-6">
                    {mode === "register" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 h-3 block">Subject Name</label>
                        <Input placeholder="OPERATOR NAME" value={name} onChange={(e) => setName(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 text-white font-bold uppercase tracking-widest transition-all focus:bg-white/5 focus:ring-0 focus:border-primary/50 placeholder:text-white/10" required />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 h-3 block">Communication Link (Email)</label>
                       <Input type="email" placeholder="EMAIL@PITSTOP.LIVE" value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 text-white font-bold uppercase tracking-widest transition-all focus:bg-white/5 focus:ring-0 focus:border-primary/50 placeholder:text-white/10" required />
                    </div>

                    {mode !== "forgot" && (
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 h-3 block">Security Hash (Password)</label>
                        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 text-white font-bold tracking-[0.5em] transition-all focus:bg-white/5 focus:ring-0 focus:border-primary/50 placeholder:text-white/10" required />
                        {mode === "login" && (
                          <button 
                            type="button" 
                            onClick={() => handleModeChange("forgot")}
                            className="absolute right-4 bottom-5 text-[9px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors italic"
                          >
                            Lost Credentials?
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={loading} className="w-full h-20 text-sm font-black font-outfit uppercase italic tracking-[0.2em] text-white bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 rounded-3xl mt-4 group">
                    {loading ? <Loader2 className="animate-spin" /> : <>{mode === "login" ? "Execute Login" : mode === "forgot" ? "Request Override" : "Initialize Link"} <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" /></>}
                  </Button>
                </motion.form>
              )}

              {step === "otp" && (
                <motion.form key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleVerifyOtp} className="space-y-10 text-center">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black font-outfit uppercase italic text-white tracking-tighter">Security Captcha</h3>
                     <p className="text-[10px] text-white/30 font-black uppercase tracking-widest italic">Please enter the security code shown below</p>
                  </div>
                  <Input 
                     placeholder="000000" 
                     className="text-center text-6xl font-black tracking-[0.5em] h-32 bg-white/[0.03] border-white/5 text-primary rounded-[32px] focus:bg-white/5 focus:border-primary/50 transition-all shadow-inner" 
                     maxLength={6} 
                     value={otp}
                     onChange={(e) => setOtp(e.target.value)}
                     autoFocus
                  />
                  {devOtp && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-[32px] bg-primary/5 border border-primary/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                         <Zap className="w-20 h-20 text-primary" />
                      </div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 italic">Security Captcha Code</p>
                      <p className="text-5xl font-black text-white tracking-[0.2em] font-outfit">{devOtp}</p>
                    </motion.div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full h-20 bg-white text-black rounded-3xl font-black font-outfit uppercase tracking-widest italic text-sm hover:bg-white/90 shadow-2xl shadow-white/10">
                     {loading ? <Loader2 className="animate-spin" /> : "Authorize Entry"}
                  </Button>
                </motion.form>
              )}
              
              {/* Other steps follow similar high-end redesign */}
              {step === "garage_info" && (
                <motion.div key="garage" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Station Name</label>
                          <Input placeholder="NAME" value={garageName} onChange={(e) => setGarageName(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 font-bold uppercase tracking-widest" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Contact Link</label>
                          <Input placeholder="+12..." value={phone} onChange={(e) => setPhone(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 font-bold uppercase tracking-widest" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Geo-Location Descriptor</label>
                        <Input placeholder="PHYSICAL ADDRESS" value={address} onChange={(e) => setAddress(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 font-bold uppercase tracking-widest" required />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] pl-1 italic">Mapping Matrix</label>
                        <div className="h-[240px] rounded-[32px] overflow-hidden border border-white/10 shadow-inner group">
                          <RegistrationMap location={location} setLocation={setLocation} />
                        </div>
                      </div>
                   </div>
                   <Button onClick={() => setStep("documents")} className="w-full h-20 bg-primary text-white font-black font-outfit uppercase italic tracking-widest rounded-3xl hover:bg-primary/90 shadow-2xl shadow-primary/20 group">
                    Advance to Validation <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {step === "documents" && (
                <motion.div key="docs" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                   <div className="grid grid-cols-2 gap-6">
                     <div 
                        onClick={() => govIdInputRef.current?.click()}
                        className={cn(
                          "group relative h-48 bg-white/[0.02] border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer",
                          govIdUrl ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/5 hover:bg-white/[0.05] hover:border-primary/50"
                        )}
                     >
                        <input type="file" ref={govIdInputRef} onChange={(e) => handleFileUpload(e, "govId")} className="hidden" accept="image/*,.pdf" />
                        {uploadingGovId ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : govIdUrl ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <FileUp className="w-10 h-10 text-white/10 group-hover:text-primary transition-all mb-3" />}
                        <p className={cn("text-[10px] font-black uppercase tracking-widest italic", govIdUrl ? "text-emerald-500" : "text-white/20 group-hover:text-primary")}>{govIdUrl ? "IDENTIFIED" : "GOVT SCAN"}</p>
                     </div>

                     <div 
                        onClick={() => garageImageInputRef.current?.click()}
                        className={cn(
                          "group relative h-48 bg-white/[0.02] border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer",
                          garageImageUrl ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/5 hover:bg-white/[0.05] hover:border-primary/50"
                        )}
                     >
                        <input type="file" ref={garageImageInputRef} onChange={(e) => handleFileUpload(e, "garageImage")} className="hidden" accept="image/*" />
                        {uploadingGarageImage ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : garageImageUrl ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <Store className="w-10 h-10 text-white/10 group-hover:text-primary transition-all mb-3" />}
                        <p className={cn("text-[10px] font-black uppercase tracking-widest italic", garageImageUrl ? "text-emerald-500" : "text-white/20 group-hover:text-primary")}>{garageImageUrl ? "CAPTURED" : "STATION PIC"}</p>
                     </div>
                   </div>

                   <Button 
                    onClick={handleFinalRegister} 
                    disabled={loading || !govIdUrl || !garageImageUrl}
                    className="w-full h-24 bg-primary text-white rounded-[40px] font-black font-outfit uppercase italic tracking-[0.2em] shadow-2xl shadow-primary/40 text-xl hover:bg-primary/95 transition-all active:scale-[0.98]"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : "Engage Protocol"}
                   </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
