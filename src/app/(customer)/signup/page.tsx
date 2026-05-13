"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase/config";
import { useAuth } from "@/lib/contexts/auth-context";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { getRedirectPath, syncSession } from "@/lib/utils/auth";
import { sendEmailNotification } from "@/lib/utils/email";
import {
  Bike,
  MapPin,
  FileCheck,
  Shield,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Upload,
  Camera,
  RefreshCcw,
  ArrowLeft
} from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "delivery">("customer");

  // KYC Specific Data
  const [address, setAddress] = useState("");
  const [bikeModel, setBikeModel] = useState("");
  const [bikeRegNumber, setBikeRegNumber] = useState("");
  const [idType, setIdType] = useState("Ghana Card");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const proceedToNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "customer") {
      handleFinalSubmit();
    } else {
      setStep(2); // Rider proceeds to KYC
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Create Auth Account First
      const loginID = email.includes("@") ? email : `${email}@ghova.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, loginID, password);
      await updateProfile(userCredential.user, { displayName: name });
      const user = userCredential.user;

      let documentUrl = "";
      let licenseUrl = "";
      let photoUrl = "";

      // 2. If Rider, Upload KYC Documents securely since we now have auth
      if (role === "delivery") {
        if (documentFile && licenseFile && photoBlob) {
          // ID Document
          const docExt = documentFile.name.split('.').pop();
          const docRef = ref(storage, `verifications/${user.uid}/id_document.${docExt}`);
          await uploadBytes(docRef, documentFile);
          documentUrl = await getDownloadURL(docRef);

          // Driver's License
          const licenseExt = licenseFile.name.split('.').pop();
          const licenseRef = ref(storage, `verifications/${user.uid}/drivers_license.${licenseExt}`);
          await uploadBytes(licenseRef, licenseFile);
          licenseUrl = await getDownloadURL(licenseRef);

          // Verification Photo
          const photoRef = ref(storage, `verifications/${user.uid}/facial_verification.jpg`);
          await uploadBytes(photoRef, photoBlob);
          photoUrl = await getDownloadURL(photoRef);
          
          // Set as official Auth profile picture
          await updateProfile(user, { photoURL: photoUrl });
        } else {
          throw new Error("KYC documents (ID, License, or Photo) are incomplete.");
        }
      }

      // 3. Write Database Profile
      const userRef = doc(db, "users", user.uid);
      const userPayload: any = {
        name: name,
        email: email,
        phone: "",
        role: role,
        status: role === "delivery" ? "pending" : "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (role === "delivery") {
        userPayload.isActive = false;
        userPayload.verificationDocs = {
          residentialAddress: address,
          bikeModel: bikeModel,
          bikeRegNumber: bikeRegNumber,
          idType: idType,
          idDocumentUrl: documentUrl,
          licenseUrl: licenseUrl,
          facialPhotoUrl: photoUrl
        };
      }

      await setDoc(userRef, userPayload);

      // 4. Sync Session and Handle Redirects
      await syncSession(user);
      // 5. Send Welcome Email
      const notificationEmail = email.includes("@") ? email : `${email}@ghova.com`;
      await sendEmailNotification({
        templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_WELCOME || "template_2xjemmg",
        templateParams: {
          to_email: notificationEmail,
          customer_name: name,
          user_name: name,
          role: role,
          company_name: "Ghova",
          company_logo: "https://ghova.vercel.app/ghova.png", // Update this with your actual live domain logo URL
        },
      });
      
      if (role === "delivery") {
        setIsSubmitted(true);
      } else {
        router.push(getRedirectPath(role));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account. Please ensure all data is correct.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // If it's a rider trying to sign in with Google, we should ideally block or warn, 
    // but we can default route them if successful just in case.
    setLoading(true);
    try {
      await signInWithGoogle();

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const fetchedRole = userDoc.exists() ? userDoc.data().role : "customer";

        await syncSession(currentUser);
        router.push(getRedirectPath(fetchedRole));
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STAGES RENDERING ---

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-orange-100 border border-zinc-100 animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 relative">
              <CheckCircle2 className="w-12 h-12 text-green-600 relative z-10" />
              <div className="absolute inset-0 bg-green-100 rounded-[2.5rem] animate-ping opacity-20" />
           </div>
           <h2 className="text-3xl font-black text-zinc-900 mb-4 uppercase tracking-tight">Application Submitted</h2>
           <p className="text-lg text-zinc-600 font-bold mb-10 max-w-sm mx-auto leading-relaxed">
             Thank you, {name}! Your application is now <span className="text-orange-600 underline decoration-orange-200">pending review by admin</span>. 
           </p>
           <button 
             onClick={() => router.push("/delivery")}
             className="w-full bg-zinc-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95 flex items-center justify-center gap-3"
           >
             Go to Dashboard <ArrowRight className="w-5 h-5" />
           </button>
        </div>
      </div>
    );
  }

  if (step > 1) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-xl border border-zinc-100">

          <div className="flex items-center gap-4 mb-10">
            {[2, 3, 4, 5].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm ${
                  step === s ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : 
                  step > s ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-400"
                }`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : (s - 1)}
                </div>
                {s !== 5 && (
                  <div className={`h-1 flex-1 rounded-full ${step > s ? "bg-green-100" : "bg-zinc-100"}`} />
                )}
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase mb-8">
            Complete Verification
          </h2>

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 text-orange-600 font-black uppercase tracking-widest text-sm mb-4">
                <MapPin className="w-5 h-5" />
                <span>Personal & Transport Info</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AuthInput
                  label="Residential Address"
                  id="address" type="text" required
                  placeholder="e.g. Bankoe Street, Ho"
                  value={address} onChange={(e) => setAddress(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1">Primary Auth Document</label>
                  <select
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 font-bold text-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    value={idType} onChange={(e) => setIdType(e.target.value)}
                  >
                    <option>Ghana Card</option>
                    <option>Driver's License</option>
                    <option>Voters ID</option>
                  </select>
                </div>
                <AuthInput
                  label="Bike Model"
                  id="bikeModel" type="text" required
                  placeholder="e.g. Yamaha Crux"
                  value={bikeModel} onChange={(e) => setBikeModel(e.target.value)}
                />
                <AuthInput
                  label="Registration Number"
                  id="bikeReg" type="text" required
                  placeholder="e.g. GW-2024-X"
                  value={bikeRegNumber} onChange={(e) => setBikeRegNumber(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button" onClick={() => setStep(1)}
                  className="flex-1 bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all flex justify-center items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={!address || !bikeModel || !bikeRegNumber}
                  onClick={() => setStep(3)}
                  className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-orange-300"
                >
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENT UPLOAD */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 text-orange-600 font-black uppercase tracking-widest text-sm mb-4">
                <FileCheck className="w-5 h-5" />
                <span>Upload {idType}</span>
              </div>
              <label className="block border-2 border-dashed border-zinc-200 bg-zinc-50 hover:bg-orange-50 hover:border-orange-200 transition-all rounded-3xl p-10 cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)}
                />
                <div className="flex flex-col items-center justify-center text-center gap-4">
                  {documentFile ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-extrabold text-zinc-900">{documentFile.name}</p>
                        <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">Document Secured</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-zinc-200 text-zinc-500 rounded-2xl flex items-center justify-center mb-2">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-extrabold text-zinc-900">Upload Image or PDF</p>
                        <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">Tap to browse</p>
                      </div>
                    </>
                  )}
                </div>
              </label>
              <div className="flex gap-4 pt-6">
                <button
                  type="button" onClick={() => setStep(2)}
                  className="flex-1 bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all flex justify-center items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={!documentFile}
                  onClick={() => setStep(4)}
                  className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-orange-300"
                >
                  Next: Camera <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DRIVER'S LICENSE UPLOAD */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center gap-3 text-orange-600 font-black uppercase tracking-widest text-sm mb-4">
                  <Shield className="w-5 h-5" />
                  <span>Upload Driver's License</span>
                </div>
                <label className="block border-2 border-dashed border-zinc-200 bg-zinc-50 hover:bg-orange-50 hover:border-orange-200 transition-all rounded-3xl p-10 cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    className="hidden" 
                    onChange={(e) => setLicenseFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <div className="flex flex-col items-center justify-center text-center gap-4">
                    {licenseFile ? (
                      <>
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-extrabold text-zinc-900">{licenseFile.name}</p>
                          <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">License Secured</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-zinc-200 text-zinc-500 rounded-2xl flex items-center justify-center mb-2">
                            <Upload className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-extrabold text-zinc-900">Upload License Image or PDF</p>
                          <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">Tap to browse</p>
                        </div>
                      </>
                    )}
                  </div>
                </label>
                <div className="flex gap-4 pt-6">
                  <button 
                    type="button" onClick={() => setStep(3)}
                    className="flex-1 bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all flex justify-center items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    disabled={!licenseFile}
                    onClick={() => setStep(5)}
                    className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-orange-300"
                  >
                    Next: Camera <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
            </div>
          )}

          {/* STEP 5: FACIAL VERIFICATION & SUBMIT */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center gap-3 text-orange-600 font-black uppercase tracking-widest text-sm mb-4">
                  <Camera className="w-5 h-5" />
                  <span>Facial Verification</span>
                </div>
                
                <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-3xl overflow-hidden">
                  <WebcamCapture onCapture={(blob) => setPhotoBlob(blob)} />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100 mt-4">
                    <p className="text-xs text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button 
                    disabled={loading}
                    type="button" onClick={() => setStep(4)}
                    className="flex-1 bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    disabled={loading || !photoBlob || !documentFile || !licenseFile}
                    onClick={handleFinalSubmit}
                    className="flex-[2] bg-zinc-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-zinc-400"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Finalizing Account...
                      </>
                    ) : (
                      "Create Profile"
                    )}
                  </button>
                </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STEP 1: INITIAL REGISTRATION (DEFAULT) ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-2xl ring-1 ring-zinc-100">
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
        <div className="flex flex-col items-center">
          <Link href="/" className="relative w-40 h-16 mb-2 transition-transform hover:scale-105">
            <Image
              src="/ghova.png"
              alt="GHo-VA Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-zinc-900 tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Join GHo-VA for reliable delivery.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={proceedToNextStep}>
          {/* Role Selection */}
          <div className="flex bg-zinc-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${role === "customer"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
                }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole("delivery")}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${role === "delivery"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
                }`}
            >
              Rider
            </button>
          </div>

          <div className="space-y-4">
            <AuthInput
              label="FullName"
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <AuthInput
              label={role === "delivery" ? "Phone Number" : "Email address"}
              id="email-address"
              type={role === "delivery" ? "tel" : "email"}
              autoComplete={role === "delivery" ? "tel" : "email"}
              placeholder={role === "delivery" ? "+233..." : "jane@example.com"}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthInput
              label="Password"
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl border border-transparent bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400 transition-all"
            >
              {loading ? "Processing..." : role === "customer" ? "Sign up as Customer" : "Continue to Verification"}
            </button>
          </div>
        </form>

        {role === "customer" && (
          <SocialAuth onGoogleSignIn={handleGoogleSignIn} loading={loading} />
        )}

        <p className="mt-8 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Sub-component for Webcam handling
function WebcamCapture({ onCapture }: { onCapture: (blob: Blob | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Webcam error:", err);
      setError("Please allow camera access to complete verification.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    
    // Ensure the video has valid dimensions before capturing
    if (width === 0 || height === 0) return;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      setHasPhoto(true);

      canvasRef.current.toBlob((blob) => {
        onCapture(blob);
      }, "image/jpeg", 0.9);

      // Stop camera stream after capture
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const retakePhoto = () => {
    setHasPhoto(false);
    onCapture(null);
    startCamera();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-red-50 text-red-600 rounded-2xl text-center">
        <Camera className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-bold">{error}</p>
        <button type="button" onClick={startCamera} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-red-700">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative rounded-2xl overflow-hidden shadow-inner w-full flex justify-center bg-black h-64">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`h-64 object-cover object-center max-w-full ${hasPhoto ? "hidden" : "block"}`}
        />
        <canvas
          ref={canvasRef}
          className={`h-64 object-cover object-center max-w-full ${hasPhoto ? "block" : "hidden"}`}
        />

        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
          {!hasPhoto ? (
            <button
              type="button"
              onClick={takePhoto}
              className="w-14 h-14 bg-white rounded-full border-4 border-zinc-300 flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-white rounded-full shadow-inner" />
            </button>
          ) : (
            <button
              type="button"
              onClick={retakePhoto}
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800/80 backdrop-blur-sm text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Retake Photo
            </button>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
        {!hasPhoto ? "Position your face clearly in the frame" : "Check if photo is clear before submitting"}
      </p>
    </div>
  );
}
