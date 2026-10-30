const fs = require('fs');
const path = require('path');

// 1. Fix AuthScreen.jsx
const authPath = path.resolve('src/app/components/AuthScreen.jsx');
let authContent = fs.readFileSync(authPath, 'utf8');

// Replace bg-linear-to-r with bg-gradient-to-r
authContent = authContent.replace(
  'from-sky-500 via-teal-400 to-indigo-600"></div>',
  'from-sky-500 via-teal-400 to-indigo-600"></div>'
);

authContent = authContent.replace(
  'bg-linear-to-r from-sky-500 via-teal-400 to-indigo-600',
  'bg-gradient-to-r from-sky-500 via-teal-400 to-indigo-600'
);

// Login Submit Button - Make super prominent and visible
const oldLoginBtnPattern = /<button\s*type="submit"\s*disabled=\{isLoading\}\s*className="w-full py-3 rounded-2xl bg-linear-to-r from-sky-600[\s\S]*?<\/button>/;

const newLoginBtn = `<button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-black text-sm tracking-wide transition cursor-pointer shadow-lg shadow-sky-600/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border border-sky-400"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In / Login Karo</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>`;

authContent = authContent.replace(oldLoginBtnPattern, newLoginBtn);

// Signup Submit Button - Make super prominent and visible
const oldSignupBtnPattern = /<button\s*type="submit"\s*disabled=\{isLoading\}\s*className="w-full mt-2 py-3 rounded-2xl bg-linear-to-r from-emerald-600[\s\S]*?<\/button>/;

const newSignupBtn = `<button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm tracking-wide transition cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-400"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Create {selectedRole === 'admin' ? 'Admin' : 'Sales'} Account / Submit</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>`;

authContent = authContent.replace(oldSignupBtnPattern, newSignupBtn);

// Outer wrapper padding & scroll fix
authContent = authContent.replace(
  '<div className="min-h-screen bg-slate-100/90 flex items-center justify-center p-4 font-sans text-slate-800">',
  '<div className="min-h-screen bg-slate-100/90 flex items-center justify-center py-8 px-4 font-sans text-slate-800 overflow-y-auto">'
);

fs.writeFileSync(authPath, authContent, 'utf8');
console.log('Fixed AuthScreen.jsx');

// 2. Fix page.jsx bg-linear-to-r
const pagePath = path.resolve('src/app/page.jsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');
pageContent = pageContent.replace('bg-linear-to-r', 'bg-gradient-to-r');
fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Fixed page.jsx');

// 3. Fix preview page bg-linear-to-br
const prevPath = path.resolve('src/app/preview/[domain]/page.jsx');
let prevContent = fs.readFileSync(prevPath, 'utf8');
prevContent = prevContent.replace('bg-linear-to-br', 'bg-gradient-to-br');
fs.writeFileSync(prevPath, prevContent, 'utf8');
console.log('Fixed preview page.jsx');

