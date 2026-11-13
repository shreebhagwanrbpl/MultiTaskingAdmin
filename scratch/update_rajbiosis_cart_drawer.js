const fs = require('fs');

const targetPath = 'c:/Users/Admin/Documents/GitHub/rajbiosis.com/src/components/CartDrawer.jsx';
let content = fs.readFileSync(targetPath, 'utf8');

// Normalize all CRLF to LF for reliable string replacement
content = content.replace(/\r\n/g, '\n');

// 1. Update countdown useEffect
const oldCountdownEffect = `  // Handle countdown on success
  useEffect(() => {
    let timer = null;
    if (quoteStep === 'success') {
      if (redirectCountdown > 0) {
        timer = setTimeout(() => {
          setRedirectCountdown(prev => prev - 1);
        }, 1000);
      } else {
        setIsOpen(false);
        router.push('/profile');
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [quoteStep, redirectCountdown, router]);`;

const newCountdownEffect = `  // Handle countdown on success - ONLY redirect if profile is incomplete!
  useEffect(() => {
    let timer = null;
    if (quoteStep === 'success') {
      const prof = typeof window !== 'undefined' ? getUserProfile() : null;
      const isComplete = Boolean(
        prof && (
          prof.isProfileComplete ||
          (prof.hospitalName && prof.hospitalName.trim() && prof.hospitalName.trim().toUpperCase() !== 'NA')
        )
      );

      // Only auto-redirect if hospital & billing details are NOT complete!
      if (!isComplete) {
        if (redirectCountdown > 0) {
          timer = setTimeout(() => {
            setRedirectCountdown(prev => prev - 1);
          }, 1000);
        } else {
          setIsOpen(false);
          router.push('/profile');
        }
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [quoteStep, redirectCountdown, router]);`;

if (content.includes(oldCountdownEffect)) {
  content = content.replace(oldCountdownEffect, newCountdownEffect);
  console.log('2. Successfully updated countdown useEffect with isComplete check');
} else {
  console.error('2. oldCountdownEffect not found!');
}

// 2. Update handleVerifyOtp finally block
const oldOtpFinally = `    } finally {
      setIsSubmitting(false);
      setQuoteStep('success');
      setCustomerLoggedIn(true);
      setIsOpen(false);
      router.push('/profile');
    }`;

const newOtpFinally = `    } finally {
      setIsSubmitting(false);
      setQuoteStep('success');
      setCustomerLoggedIn(true);
      const prof = typeof window !== 'undefined' ? getUserProfile() : null;
      const isComplete = Boolean(
        prof && (
          prof.isProfileComplete ||
          (prof.hospitalName && prof.hospitalName.trim() && prof.hospitalName.trim().toUpperCase() !== 'NA')
        )
      );
      if (!isComplete) {
        setRedirectCountdown(5);
      }
    }`;

if (content.includes(oldOtpFinally)) {
  content = content.replace(oldOtpFinally, newOtpFinally);
  console.log('3. Successfully updated handleVerifyOtp finally block');
} else {
  console.error('3. oldOtpFinally not found!');
}

// 3. Update Profile Completion Alert block to only show when profile is incomplete
const oldProfileAlert = `              {/* Profile Completion Alert */}
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={15} className="text-amber-700" />
                    <span>Complete Hospital &amp; Billing Profile</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-mono text-[11px] font-extrabold flex items-center gap-1">
                    <Clock size={11} />
                    <span>Auto-redirect in {redirectCountdown}s</span>
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Add your hospital name, department, designation, and GST details so the official institutional proforma invoice is ready.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/profile');
                  }}
                  className="w-full mt-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Profile Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>`;

const newProfileAlert = `              {/* Profile Completion Alert - ONLY show if hospital details are incomplete */}
              {(() => {
                const prof = typeof window !== 'undefined' ? getUserProfile() : null;
                const isComplete = Boolean(
                  prof && (
                    prof.isProfileComplete ||
                    (prof.hospitalName && prof.hospitalName.trim() && prof.hospitalName.trim().toUpperCase() !== 'NA')
                  )
                );

                if (isComplete) return null;

                return (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <Building2 size={15} className="text-amber-700" />
                        <span>Complete Hospital &amp; Billing Profile</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-mono text-[11px] font-extrabold flex items-center gap-1">
                        <Clock size={11} />
                        <span>Auto-redirect in {redirectCountdown}s</span>
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Add your hospital name, department, designation, and GST details so the official institutional proforma invoice is ready.
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/profile');
                      }}
                      className="w-full mt-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Go to Profile Now</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })()}`;

if (content.includes(oldProfileAlert)) {
  content = content.replace(oldProfileAlert, newProfileAlert);
  console.log('4. Successfully wrapped Profile Completion Alert with isComplete condition');
} else {
  console.error('4. oldProfileAlert not found!');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Finished updating CartDrawer.jsx successfully!');
