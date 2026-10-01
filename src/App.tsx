import { useEffect, useMemo, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cloudSecurityQuestions, type CloudQuestion } from './data/cloudSecurityQuestions';
import { interviewAnswers } from './data/interviewAnswers';
import { questionMeta } from './data/questionMeta';
import { followUps } from './data/followUps';

const TOTAL = 50;

function useLocalQuestions() {
  return useQuery({ queryKey: ['cloud-security-questions'], queryFn: async () => cloudSecurityQuestions.slice(0, TOTAL), staleTime: Infinity });
}
function DynIcon({ name, size = 22 }: { name: string; size?: number }) {
  const C = (Icons as any)[name] ?? Icons.Box;
  return <C size={size} />;
}
const shortLabel = (t: string) => t.replace(/^Step \d+:\s*/, '');

function useNarrow(bp = 640) {
  const [n, setN] = useState(() => typeof window !== 'undefined' && window.innerWidth < bp);
  useEffect(() => {
    const f = () => setN(window.innerWidth < bp);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, [bp]);
  return n;
}

/* ---------- Header ---------- */
function Header({ q, onSearch, onMenu, theme, onTheme }: { q: string; onSearch: (v: string) => void; onMenu: () => void; theme: string; onTheme: () => void }) {
  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4 px-4 h-[60px] max-w-[1440px] mx-auto">
        <button className="lg:hidden p-2 border border-slate-200 dark:border-slate-600 rounded-lg" onClick={onMenu} aria-label="menu"><Icons.Menu size={18} /></button>
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-blue-600 grid place-items-center text-white shadow-[0_4px_10px_-2px_rgba(13,148,136,.5)]"><Icons.ShieldCheck size={20} /></span>
          <span className="font-extrabold text-[22px] tracking-tight"><span className="text-blue-600">CloudSec</span><span className="text-slate-900 dark:text-white">Prep</span></span>
        </div>
        <nav className="hidden md:flex items-stretch gap-6 text-[14px] ml-4 h-[60px]">
          <span className="text-blue-600 font-semibold border-b-[3px] border-blue-600 flex items-center">Cloud Security Interview Lab</span>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden sm:block w-[300px]">
            <Icons.Search size={16} className="absolute left-3 top-[10px] text-slate-400" />
            <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search questions, topics or keywords..."
              className="w-full border border-slate-200 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-[13px] bg-slate-50 dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-blue-400" />
          </div>
          <button onClick={onTheme} aria-label="toggle theme" title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600 grid place-items-center text-slate-500 dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            {theme === 'dark' ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
          </button>
          <div className="flex items-center gap-1.5"><span className="w-8 h-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white grid place-items-center text-xs font-bold">CS</span><span className="text-sm font-medium hidden xl:inline dark:text-slate-200">Learner</span></div>
        </div>
      </div>
    </header>
  );
}

/* ---------- Sidebar ---------- */
function Sidebar({ list, active, highlight, done, onPick, sq, onSq, open, onClose, onSheet, onReset }: any) {
  const pct = Math.round((done.size / TOTAL) * 100);
  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900/30 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`${open ? 'fixed inset-y-0 left-0 z-30 w-[320px] bg-white dark:bg-slate-900 shadow-xl overflow-y-auto thin-scroll' : 'hidden'} lg:block lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)] lg:max-h-[calc(100vh-60px)] self-start lg:overflow-y-auto thin-scroll lg:w-[330px] shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900`}>
        <div className="p-5">
          <div className="text-[19px] font-extrabold text-slate-900 dark:text-white">Cloud Security <span className="text-slate-400 font-normal text-[15px]">• {TOTAL} Questions</span></div>
          <div className="h-[7px] bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: pct + '%' }} /></div>
          <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex items-center">{done.size} / {TOTAL} completed
            {done.size > 0 && <button onClick={onReset} className="ml-auto text-[12px] font-semibold text-slate-400 hover:text-red-500">Reset</button>}
          </div>
          <div className="relative mt-4">
            <Icons.Search size={15} className="absolute left-3 top-[10px] text-slate-400" />
            <input value={sq} onChange={(e) => onSq(e.target.value)} placeholder="Search questions..."
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg pl-9 pr-2 py-2 text-[13px] outline-none focus:border-blue-400" />
          </div>
          <div id="q-list" className="mt-2 max-h-[calc(100vh-300px)] min-h-[300px] overflow-y-auto thin-scroll divide-y divide-slate-100 dark:divide-slate-700">
            {list.map((x: CloudQuestion, i: number) => {
              const isA = highlight && active === x.id;
              return (
                <button key={x.id} onClick={() => onPick(x.id)} data-active={isA ? 'true' : undefined}
                  className={`w-full text-left flex items-center gap-3 pl-2 pr-1 py-[11px] rounded-lg border-l-4 ${isA ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <span className={`text-[13px] w-6 font-medium ${isA ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={`text-[13.5px] flex-1 leading-snug ${isA ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>{x.question}</span>
                  {done.has(x.id) ? <Icons.CheckCircle2 size={19} className="text-emerald-500 shrink-0" /> :
                    isA ? <span className="w-[19px] h-[19px] rounded-full border-[2.5px] border-blue-500 grid place-items-center shrink-0"><span className="w-2 h-2 rounded-full bg-blue-500" /></span>
                      : <Icons.Circle size={19} className="text-slate-200 shrink-0" />}
                </button>
              );
            })}
            {list.length === 0 && <div className="text-sm text-slate-500 p-4">No matches.</div>}
          </div>
          <button onClick={onSheet} className="mt-3 w-full border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl px-3 py-2.5 text-[13px] font-bold flex items-center justify-center gap-2">
            <Icons.Printer size={16} /> Interview sheet — print all
          </button>
        </div>
      </aside>
    </>
  );
}

/* ---------- Stepper ---------- */
function Stepper({ q, step }: { q: CloudQuestion; step: number }) {
  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap my-4">
      {q.steps.map((st, i) => (
        <div key={i} className="flex items-center gap-0.5 sm:gap-1">
          <div className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-lg text-[13px] font-semibold ${i === step ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : ''}`}>
            {i < step ? <Icons.CheckCircle2 size={22} className="text-emerald-500" /> :
              i === step ? <span className="w-[26px] h-[26px] rounded-full bg-blue-600 text-white grid place-items-center text-[13px] font-bold">{i + 1}</span>
                : <span className="w-[26px] h-[26px] rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 grid place-items-center text-[13px] font-bold">{i + 1}</span>}
            <span className={`${i === step ? 'text-blue-700 dark:text-blue-300' : i < step ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'} hidden md:inline`}>{shortLabel(st.title)}</span>
          </div>
          {i < q.steps.length - 1 && <Icons.MoveRight size={18} className="text-slate-300" />}
        </div>
      ))}
    </div>
  );
}

/* ---------- Animated simulator canvas ---------- */
function SimCanvas({ q, step, playing }: { q: CloudQuestion; step: number; playing: boolean }) {
  const s = q.steps[step];
  const n = s.nodes.length;
  const narrow = useNarrow();
  const pktM = shortLabel(s.title).slice(0, 18) || 'REQUEST';
  const retM = step > 0 ? shortLabel(q.steps[step - 1].title).slice(0, 18) + ' ✓' : '';
  if (narrow) {
    return (
      <div>
        <ol className="px-1 py-2">
          {s.nodes.map((nd, i) => {
            const lit = i <= s.focus, now = i === s.focus;
            return (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <span className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-extrabold ${lit ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    {i < s.focus ? <Icons.Check size={13} /> : i + 1}
                  </span>
                  {i < n - 1 && <span className={`w-[2.5px] flex-1 min-h-[26px] rounded ${i < s.focus ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                </div>
                <div className={`flex-1 mb-2.5 border-2 rounded-xl px-3 py-2.5 flex items-center gap-3 bg-white dark:bg-slate-900 ${now ? 'border-blue-500 shadow-[0_4px_14px_-6px_rgba(37,99,235,.5)]' : lit ? 'border-emerald-200 dark:border-emerald-900' : 'border-slate-200 dark:border-slate-700 opacity-60'}`}>
                  <span className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${now ? 'bg-blue-600 text-white' : lit ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                    <DynIcon name={nd.icon} size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">{nd.label}</span>
                    <span className="block text-[11.5px] text-slate-400">{nd.sub || `hop ${i + 1}`}</span>
                    {now && <span className="inline-block mt-1 text-[10.5px] font-extrabold rounded px-1.5 py-0.5 bg-blue-600 text-white">▶ {pktM}</span>}
                  </span>
                  {i < s.focus && <Icons.CheckCircle2 size={18} className="text-emerald-500 shrink-0 ml-auto" />}
                </div>
              </li>
            );
          })}
        </ol>
        {step > 0 && (
          <div className="mx-1 mb-2 text-[12px] font-bold rounded-lg px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300">↩ {retM || 'Confirmed'}</div>
        )}
        <div className="mx-1 bg-blue-50/70 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-xl px-4 py-3 text-[13.5px]">
          <span className="inline-block bg-blue-600 text-white text-[11px] font-bold rounded px-1.5 py-0.5 mr-2">STEP {step + 1}</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">{s.title}: </span><span className="text-slate-600 dark:text-slate-300">{s.description}</span>
        </div>
      </div>
    );
  }
  const W = 880, H = 300, pad = 90;
  const xs = (i: number) => (n === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (n - 1));
  const y = 130;
  const pkt = shortLabel(s.title).slice(0, 18) || 'REQUEST';
  const ret = step > 0 ? shortLabel(q.steps[step - 1].title).slice(0, 18) + ' ✓' : '';
  return (
    <div className="dot-bg border border-slate-200 dark:border-slate-700 rounded-2xl bg-[#fbfcfe] dark:bg-slate-950 px-2 pt-2 pb-4 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[640px] w-full h-[280px]">
        {/* base connector */}
        <line x1={xs(0)} y1={y} x2={xs(n - 1)} y2={y} stroke="#2563eb" strokeWidth="2" opacity=".55" />
        {/* return dashed arc */}
        {step > 0 && <path d={`M ${xs(step)} ${y - 34} Q ${(xs(step) + xs(0)) / 2} ${y - 120} ${xs(0)} ${y - 34}`} fill="none" stroke="#10b981" strokeWidth="2.5" className="return-path" />}
        {step > 0 && (
          <g>
            <rect x={(xs(step) + xs(0)) / 2 - 52} y={y - 128} width="104" height="26" rx="7" fill="#10b981" />
            <text x={(xs(step) + xs(0)) / 2} y={y - 110} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">{ret || 'CONFIRMED'}</text>
          </g>
        )}
        {/* hop dots */}
        {s.nodes.map((_, i) => (
          <circle key={i} cx={xs(i)} cy={y} r={i <= s.focus ? 7 : 5} fill={i <= s.focus ? '#2563eb' : '#cbd5e1'}
            className={i === s.focus && playing ? 'pulse-dot' : ''} opacity={i <= s.focus ? 1 : .7} />
        ))}
        {/* forward packet pill */}
        {playing && step < n && (
          <g style={{ offsetPath: `path('M ${xs(0)} ${y - 34} L ${xs(s.focus)} ${y - 34}')` }} className="packet-pill">
            <rect x="-58" y="-14" width="116" height="28" rx="7" fill="#2563eb" />
            <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="12.5" fontWeight="700">{pkt}</text>
          </g>
        )}
        {!playing && (
          <g>
            <rect x={xs(s.focus) - 58} y={y - 62} width="116" height="28" rx="7" fill="#2563eb" />
            <text x={xs(s.focus)} y={y - 43} textAnchor="middle" fill="#fff" fontSize="12.5" fontWeight="700">{pkt}</text>
            <line x1={xs(s.focus)} y1={y - 34} x2={xs(s.focus)} y2={y - 8} stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
          </g>
        )}
        {/* device nodes */}
        {s.nodes.map((nd, i) => {
          const lit = i <= s.focus, now = i === s.focus;
          return (
            <g key={i} opacity={lit ? 1 : .42} className={now && playing ? 'pop' : ''}>
              <g transform={`translate(${xs(i)},${y + 34})`}>
                <rect x="-46" y="-26" width="92" height="62" rx="12" fill="#fff" stroke={now ? '#2563eb' : '#dbe3ef'} strokeWidth={now ? 2.5 : 1.5} />
                <g transform="translate(0,-2)" color={now ? '#2563eb' : '#94a3b8'}>
                  <g transform="translate(-11,-11) scale(0.92)"><DynIcon name={nd.icon} size={24} /></g>
                </g>
              </g>
              <text x={xs(i)} y={y + 88} textAnchor="middle" fontSize="14" fontWeight="800" className="sim-label" fill={lit ? '#0f1e3d' : '#94a3b8'}>{nd.label}</text>
              <text x={xs(i)} y={y + 106} textAnchor="middle" fontSize="11.5" className="sim-sub" fill="#8fa0b8">{nd.sub || `hop-${i + 1}`}</text>
              {i < s.focus && <g transform={`translate(${xs(i) + 30},${y + 78})`}><circle r="9" fill="#10b981" /><path d="M -4 0 L -1 3 L 4 -3" stroke="#fff" strokeWidth="2" fill="none" /></g>}
            </g>
          );
        })}
      </svg>
      <div className="mx-3 bg-blue-50/70 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-xl px-4 py-3 text-[13.5px]">
        <span className="inline-block bg-blue-600 text-white text-[11px] font-bold rounded px-1.5 py-0.5 mr-2">STEP {step + 1}</span>
        <span className="font-bold text-slate-800 dark:text-slate-100">{s.title}: </span><span className="text-slate-600 dark:text-slate-300">{s.description}</span>
      </div>
    </div>
  );
}

/* ---------- Interview sheet (printable) ---------- */
function InterviewSheet({ all, onClose }: { all: CloudQuestion[]; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = all.map((q, i) =>
    `Q${i + 1}. ${q.question}\nTakeaway: ${q.takeaway}\nKey points:\n- ${q.keyPoints.join('\n- ')}`
  ).join('\n\n');
  const copyAll = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 grid place-items-center p-2 sm:p-4 no-print" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-700 no-print">
          <div className="font-extrabold text-[16px] dark:text-white">Interview sheet — all {all.length} takeaways</div>
          <div className="ml-auto flex gap-2">
            <button onClick={copyAll} className="border border-blue-200 text-blue-600 rounded-lg px-3 py-1.5 text-[13px] font-bold flex items-center gap-1.5">
              {copied ? <><Icons.Check size={15} /> Copied!</> : <><Icons.Copy size={15} /> Copy all</>}
            </button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-[13px] font-bold flex items-center gap-1.5"><Icons.Printer size={15} /> Print</button>
            <button onClick={onClose} className="border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-[13px] font-bold text-slate-500 dark:text-slate-300"><Icons.X size={15} /></button>
          </div>
        </div>
        <div id="interview-sheet" className="overflow-y-auto thin-scroll p-6 text-slate-800">
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>CloudSec Prep — Interview Sheet</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>All {all.length} questions with takeaways and key points. One page per few questions when printed.</p>
          {all.map((q, i) => (
            <div key={q.id} style={{ marginBottom: 18, breakInside: 'avoid' }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Q{i + 1}. {q.question}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}><b>Takeaway:</b> {q.takeaway}</div>
              <ul style={{ fontSize: 13, marginTop: 4, paddingLeft: 18, listStyle: 'disc' }}>
                {q.keyPoints.map((k, j) => <li key={j}>{k}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Step-ordering quiz ---------- */
function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  do {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  } while (a.every((v, i) => v === i) && n > 1);
  return a;
}
function loadBest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('cs-quiz-best') || '{}'); } catch { return {}; }
}
function OrderQuiz({ q, onBest }: { q: CloudQuestion; onBest?: (qid: number, val: number) => void }) {
  const n = q.steps.length;
  const [order, setOrder] = useState<number[]>(() => shuffled(n));
  const [sel, setSel] = useState<number | null>(null);
  const [locked, setLocked] = useState<boolean[]>(() => Array(n).fill(false));
  const [attempts, setAttempts] = useState(0);
  const [checkedOnce, setCheckedOnce] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [best, setBest] = useState(loadBest);

  useEffect(() => {
    setOrder(shuffled(q.steps.length));
    setSel(null); setLocked(Array(q.steps.length).fill(false));
    setAttempts(0); setCheckedOnce(false); setRevealed(false);
  }, [q.id, q.steps.length]);

  const correctCount = order.filter((v, i) => v === i).length;
  const solved = correctCount === n;

  const tap = (pos: number) => {
    if (locked[pos] || revealed) return;
    if (sel === null) { setSel(pos); return; }
    if (sel === pos) { setSel(null); return; }
    const o = [...order]; [o[sel], o[pos]] = [o[pos], o[sel]];
    setOrder(o); setSel(null); setCheckedOnce(false);
  };
  const check = () => {
    const l = order.map((v, i) => v === i || locked[i]);
    setLocked(l); setCheckedOnce(true);
    const at = attempts + 1; setAttempts(at);
    const c = order.filter((v, i) => v === i).length;
    const prev = best[q.id] ?? 0;
    if (c > prev) { const nb = { ...best, [q.id]: c }; setBest(nb); localStorage.setItem('cs-quiz-best', JSON.stringify(nb)); onBest?.(q.id, c); }
  };
  const retryWrong = () => { setCheckedOnce(false); setSel(null); };
  const reveal = () => {
    setOrder(Array.from({ length: n }, (_, i) => i));
    setLocked(Array(n).fill(true)); setRevealed(true);
  };

  return (
    <div className="border-2 border-blue-100 dark:border-blue-900 rounded-xl p-4 bg-blue-50/40 dark:bg-blue-950/20">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="font-bold text-[15.5px] dark:text-white flex items-center gap-2"><Icons.ListOrdered size={17} className="text-blue-500" /> Put the flow in order</div>
        <span className="text-[12px] font-extrabold rounded-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-600">{correctCount} of {n} in place</span>
      </div>
      <p className="text-[13.5px] text-slate-500 dark:text-slate-400 mt-1">Tap one card, then tap another to swap them. Lock all {n} in sequence, then check.</p>
      <ol className="mt-3 space-y-2">
        {order.map((stepIdx, pos) => {
          const ok = locked[pos] && order[pos] === pos;
          const wrong = checkedOnce && !locked[pos];
          return (
            <li key={pos}>
              <button onClick={() => tap(pos)} aria-label={`position ${pos + 1}: ${shortLabel(q.steps[stepIdx].title)}`}
                className={`w-full text-left text-[13.5px] flex gap-2.5 items-center border rounded-xl px-3 py-2.5 transition-colors ${ok ? 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-700 dark:text-slate-200' : wrong ? 'shake border-red-300 bg-red-50/60 dark:bg-red-950/30 text-slate-700 dark:text-slate-200' : sel === pos ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-slate-700 dark:text-slate-200 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'}`}>
                <span className={`w-6 h-6 rounded-full grid place-items-center text-[12px] font-extrabold shrink-0 ${ok ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>{ok ? <Icons.Check size={14} /> : pos + 1}</span>
                <span className="flex-1">{shortLabel(q.steps[stepIdx].title)}</span>
                {ok && <Icons.Lock size={14} className="text-emerald-500 shrink-0" />}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {!solved && !revealed && <button onClick={check} className="bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-bold rounded-lg px-4 py-2">Check order</button>}
        {checkedOnce && !solved && !revealed && <button onClick={retryWrong} className="border border-slate-200 dark:border-slate-600 text-[13.5px] font-bold rounded-lg px-4 py-2 text-slate-600 dark:text-slate-300">Try again</button>}
        {!solved && !revealed && <button onClick={reveal} className="text-[13.5px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-2">Reveal order</button>}
        {revealed && <span className="text-[13px] text-slate-500">Order revealed — study it, then switch questions to try a fresh shuffle.</span>}
      </div>
      <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-dashed border-blue-200 dark:border-blue-900">
        {solved ? <span className="font-bold text-emerald-600">Correct order — nailed it{attempts > 0 ? ` in ${attempts} attempt${attempts > 1 ? 's' : ''}` : ''}.</span>
          : <span>{attempts > 0 ? `${attempts} attempt${attempts > 1 ? 's' : ''} so far · keep going` : 'Arrange the cards, then check'}</span>}
        {(best[q.id] ?? 0) > 0 && <span> · best: {best[q.id]}/{n}</span>}
      </div>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const { data } = useLocalQuestions();
  const [active, setActive] = useState(1);
  const [hq, setHq] = useState(''); const [sq, setSq] = useState('');
  const [tab, setTab] = useState<'visual' | 'answer' | 'practice'>('visual');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [done, setDone] = useState<Set<number>>(() => new Set(JSON.parse(localStorage.getItem('cs-done') || '[]')));
  const [drawer, setDrawer] = useState(false);
  const [predict, setPredict] = useState(false);
  const [checks, setChecks] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showIntent, setShowIntent] = useState(false);
  const [seen, setSeen] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('cs-seen') || '{}'); } catch { return {}; }
  });
  const [tLeft, setTLeft] = useState<number | null>(null);
  const tickRef = useRef<any>(null);
  const [follow, setFollow] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('cs-notes') || '{}'); } catch { return {}; }
  });
  const [quizBest, setQuizBest] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('cs-quiz-best') || '{}'); } catch { return {}; }
  });
  const [sheet, setSheet] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('cs-theme') || 'light');
  const timer = useRef<any>(null);
  const qbarRef = useRef<HTMLDivElement>(null);
  const [railTop, setRailTop] = useState(200);

  const all = data ?? [];
  const term = (hq || sq).toLowerCase();
  const list = useMemo(() => all.filter((x) => !term || (x.question + ' ' + x.shortDescription + ' ' + x.keywords.join(' ')).toLowerCase().includes(term)), [all, term]);
  const cur = all.find((x) => x.id === active) ?? all[0];

  useEffect(() => { setStep(0); setPlaying(true); setPredict(false); setTab('visual'); setChecks(new Set()); setCopied(false); setFollow(false); }, [active]);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('q-list')?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  useEffect(() => {
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    if (tickRef.current) clearInterval(tickRef.current);
    setSpeaking(false); setTLeft(null);
  }, [active]);
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } if (tickRef.current) clearInterval(tickRef.current); }, []);
  useEffect(() => {
    if (!cur || !playing || tab !== 'visual') return;
    if (step >= cur.steps.length - 1) { setPlaying(false); return; }
    timer.current = setTimeout(() => setStep((s) => Math.min(s + 1, cur.steps.length - 1)), 2200 / speed);
    return () => clearTimeout(timer.current);
  }, [step, playing, speed, cur, active, tab]);
  useEffect(() => { localStorage.setItem('cs-done', JSON.stringify([...done])); }, [done]);
  useEffect(() => {
    const measure = () => {
      const h = qbarRef.current?.offsetHeight ?? 140;
      setRailTop(60 + h + 16);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active]);
  useEffect(() => {
    setSeen((prev) => {
      const k = `${active}-${tab}`;
      if (prev[k]) return prev;
      const n = { ...prev, [k]: true };
      localStorage.setItem('cs-seen', JSON.stringify(n));
      return n;
    });
  }, [tab, active]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('cs-theme', theme);
  }, [theme]);

  if (!cur) return <div className="p-10 text-slate-500">Loading questions…</div>;
  const markDone = () => setDone((d) => new Set(d).add(cur.id));
  const updateNote = (v: string) => {
    setNotes((prev) => {
      const n = { ...prev, [cur.id]: v };
      localStorage.setItem('cs-notes', JSON.stringify(n));
      return n;
    });
  };
  const fill = (step / Math.max(1, cur.steps.length - 1)) * 100;

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header q={hq} onSearch={setHq} onMenu={() => setDrawer(!drawer)} theme={theme} onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <div className="flex max-w-[1440px] mx-auto items-start">
        <Sidebar list={list} active={active} highlight done={done} sq={sq} onSq={setSq} open={drawer} onSheet={() => setSheet(true)}
          onReset={() => { setDone(new Set()); localStorage.removeItem('cs-done'); }}
          onClose={() => setDrawer(false)} onPick={(id: number) => { setActive(id); setDrawer(false); }} />
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 flex flex-col self-stretch">
          <div ref={qbarRef} className="sticky top-[60px] z-10 bg-[#f7f9fc] dark:bg-slate-950 pt-1 pb-3 -mx-1 px-1">
          <h1 className="text-[26px] sm:text-[32px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{cur.question}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px]">{cur.shortDescription}</p>
          </div>

          <div className="flex gap-3 items-start mt-4 flex-col sm:flex-row">
            <div style={{ top: railTop }} className="flex flex-row sm:flex-col w-full sm:w-auto shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 sm:p-2 shadow-[0_2px_12px_-4px_rgba(15,30,61,.08)] sm:sticky self-start z-10 divide-x sm:divide-x-0 sm:divide-y divide-slate-100 dark:divide-slate-800">
              {([
                { key: 'visual' as const, step: 'STEP 1', name: 'See it', Icon: Icons.Eye, hint: 'Watch the animation' },
                { key: 'answer' as const, step: 'STEP 2', name: 'Say it', Icon: Icons.Mic, hint: 'Speak the 60s script' },
                { key: 'practice' as const, step: 'STEP 3', name: 'Nail it', Icon: Icons.Trophy, hint: 'Quiz + self-test' },
              ]).map(({ key, step, name, Icon, hint }) => {
                const isA = tab === key;
                const done_ = !!seen[`${active}-${key}`] && !isA;
                return (
                  <button key={key} onClick={() => setTab(key)} title={`${name} — ${hint}`}
                    className={`flex-1 sm:flex-none sm:w-[118px] px-2 py-2 sm:py-3 rounded-xl flex sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 text-left transition-all ${isA ? 'bg-blue-600 text-white shadow' : done_ ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <Icon size={20} className="shrink-0" />
                    <span className="flex sm:flex-col flex-row items-baseline sm:items-start gap-1 sm:gap-0 leading-tight min-w-0">
                      <span className={`text-[9px] sm:text-[9.5px] font-extrabold tracking-wide ${isA ? 'text-blue-200' : done_ ? 'text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}>{step}</span>
                      <span className="text-[11.5px] sm:text-[12.5px] font-bold flex items-center gap-1">{name}{done_ && <Icons.Check size={13} className="text-emerald-500" />}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex-1 min-w-0">
          {tab === 'visual' && (
            <>
              <Stepper q={cur} step={step} />
              <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 shadow-[0_2px_12px_-4px_rgba(15,30,61,.08)]">
                <SimCanvas q={cur} step={step} playing={playing} />
                <div className="flex items-center gap-2.5 mt-3 flex-wrap px-1 pb-1">
                  <button onClick={() => { if (step >= cur.steps.length - 1 && !playing) { setStep(0); setPlaying(true); } else setPlaying(!playing); }} className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white grid place-items-center" aria-label="play-pause">
                    {playing ? <Icons.Pause size={17} /> : <Icons.Play size={17} className="ml-0.5" />}
                  </button>
                  <button onClick={() => { setStep((s) => Math.max(0, s - 1)); setPlaying(false); }} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-600 grid place-items-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" aria-label="prev"><Icons.SkipBack size={16} /></button>
                  <button onClick={() => { setStep((s) => Math.min(cur.steps.length - 1, s + 1)); setPlaying(false); if (step >= cur.steps.length - 2) markDone(); }} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-600 grid place-items-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" aria-label="next"><Icons.SkipForward size={16} /></button>
                  <input type="range" min={0} max={cur.steps.length - 1} value={step} onChange={(e) => { setStep(Number(e.target.value)); setPlaying(false); }}
                    className="sim w-full sm:w-auto sm:flex-1 sm:min-w-[140px] order-first sm:order-none" style={{ ['--fill' as any]: fill + '%' }} />
                  <span className="text-[13px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Step {step + 1} of {cur.steps.length}</span>
                  <div className="relative">
                    <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="appearance-none border border-slate-200 dark:border-slate-600 rounded-lg text-[13px] font-semibold pl-3 pr-8 py-2 bg-white dark:bg-slate-800 dark:text-slate-100">
                      <option value={0.5}>0.5x</option><option value={1}>1x</option><option value={1.5}>1.5x</option><option value={2}>2x</option>
                    </select>
                    <Icons.ChevronDown size={15} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                  </div>
                  <button onClick={() => { setStep(0); setPlaying(true); setPredict(false); }} className="border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg px-3.5 py-2 text-[13.5px] font-semibold flex items-center gap-1.5"><Icons.RotateCcw size={15} /> Replay</button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                  <div className="font-bold text-[15.5px] flex items-center gap-2 text-slate-900 dark:text-white"><Icons.Lightbulb size={19} className="text-blue-500" /> What is happening?</div>
                  <p className="text-[13.5px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{cur.steps[step].description}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-[15.5px] flex items-center gap-2 text-slate-900 dark:text-white"><Icons.Target size={19} className="text-blue-500" /> Interview takeaway</div>
                    <button onClick={() => setPredict(!predict)} className="border border-blue-200 text-blue-600 bg-blue-50/60 hover:bg-blue-50 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold flex items-center gap-1.5 whitespace-nowrap"><Icons.TrendingUp size={15} /> Predict the next step</button>
                  </div>
                  <p className="text-[13.5px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{cur.takeaway}</p>
                  {predict && step < cur.steps.length - 1 && (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-[13px] text-emerald-800">
                      <span className="font-bold">Next: </span>{cur.steps[step + 1].title} — {cur.steps[step + 1].description}
                    </div>
                  )}
                  {predict && step >= cur.steps.length - 1 && (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-[13px] text-emerald-800 font-semibold">Flow complete — summarize it in order: {cur.keyPoints[2]}</div>
                  )}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button onClick={() => setActive(active % TOTAL + 1)} className="bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-semibold rounded-lg px-4 py-2">Next question →</button>
                    <button onClick={markDone} className="border border-slate-200 dark:border-slate-600 text-[13.5px] font-semibold rounded-lg px-4 py-2 text-slate-600 dark:text-slate-300">{done.has(cur.id) ? '✓ Completed' : 'Mark complete'}</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'answer' && (() => {
            const script = interviewAnswers[cur.id] ?? `"${cur.shortDescription} ${cur.takeaway}"`;
            const words = script.split(/\s+/).filter(Boolean).length;
            const secs = Math.round((words / 140) * 60);
            const copy = async () => {
              try { await navigator.clipboard.writeText(script); }
              catch { const ta = document.createElement('textarea'); ta.value = script; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
              setCopied(true); setTimeout(() => setCopied(false), 2000);
            };
            const toggleCheck = (i: number) => setChecks((prev) => {
              const k = `${cur.id}-${i}`; const n = new Set(prev);
              if (n.has(k)) n.delete(k); else n.add(k); return n;
            });
            const toggleSpeak = () => {
              try {
                const synth = window.speechSynthesis;
                if (!synth) return;
                if (speaking) { synth.cancel(); setSpeaking(false); return; }
                const u = new SpeechSynthesisUtterance(script);
                u.rate = 0.95;
                u.onend = () => setSpeaking(false);
                u.onerror = () => setSpeaking(false);
                synth.cancel(); synth.speak(u); setSpeaking(true);
              } catch { /* speech unsupported */ }
            };
            const toggleTimer = () => {
              if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; setTLeft(null); return; }
              setTLeft(60);
              tickRef.current = setInterval(() => {
                setTLeft((v) => {
                  if (v === null || v <= 1) { if (tickRef.current) clearInterval(tickRef.current); tickRef.current = null; return 0; }
                  return v - 1;
                });
              }, 1000);
            };
            const mmss = tLeft === null ? '' : `${Math.floor(tLeft / 60)}:${String(tLeft % 60).padStart(2, '0')}`;
            return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 min-w-0 max-w-full overflow-hidden space-y-4">
              <div className="bg-violet-50/70 dark:bg-violet-950/25 border border-violet-200 dark:border-violet-900 border-l-4 border-l-violet-500 rounded-xl p-4">
                <div className="font-bold text-[15.5px] dark:text-white">Interview answer — say it in 60 seconds</div>
                {(() => { const m = questionMeta[cur.id]; return m ? (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[11.5px] font-extrabold rounded-full px-2.5 py-1 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">{m.level}</span>
                  <span className={`text-[11.5px] font-extrabold rounded-full px-2.5 py-1 ${m.priority === 'Must-know' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>{m.priority}</span>
                </div>
                ) : null; })()}
                {questionMeta[cur.id] && (
                  <div className="mt-2">
                    <button onClick={() => setShowIntent(!showIntent)} className="text-[12.5px] font-bold text-violet-600 flex items-center gap-1 hover:text-violet-700">
                      <Icons.Crosshair size={14} /> Why they ask this
                      <Icons.ChevronDown size={14} className={`transition-transform ${showIntent ? 'rotate-180' : ''}`} />
                    </button>
                    {showIntent && (
                      <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-1.5 pl-1">{questionMeta[cur.id].intent}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="border-2 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[12px] font-extrabold tracking-wide text-blue-500 uppercase">Your script</div>
                  <div className="flex gap-2">
                  <button onClick={toggleSpeak} className="border border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold flex items-center gap-1.5">
                    {speaking ? <><Icons.Square size={14} /> Stop</> : <><Icons.Volume2 size={15} /> Listen</>}
                  </button>
                  <button onClick={copy} className="border border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold flex items-center gap-1.5">
                    {copied ? <><Icons.Check size={15} /> Copied!</> : <><Icons.Copy size={15} /> Copy answer</>}
                  </button>
                  </div>
                </div>
                <p className="text-[15px] text-slate-700 dark:text-slate-200 mt-2.5 leading-[1.75] border-l-[3px] border-blue-500 pl-4 min-w-0 break-words">{script}</p>
                <div className="mt-2.5 pt-2.5 border-t border-dashed border-blue-200 dark:border-blue-900 flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-bold rounded-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-600">≈{words} words · ~{secs}s spoken</span>
                  {tLeft === null ? (
                    <button onClick={toggleTimer} className="text-[12px] font-bold rounded-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"><Icons.Timer size={14} /> Rehearse 60s</button>
                  ) : tLeft > 0 ? (
                    <button onClick={toggleTimer} className="text-[12px] font-bold rounded-full px-3 py-1.5 bg-amber-500 text-white flex items-center gap-1.5 tabular-nums"><Icons.Timer size={14} /> {mmss} — stop</button>
                  ) : (
                    <span className="text-[12px] font-bold rounded-full px-3 py-1.5 bg-emerald-500 text-white flex items-center gap-1.5"><Icons.Check size={14} /> Time! Did you finish?</span>
                  )}
                </div>
              </div>
              <div className="border-2 border-emerald-100 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-4">
              <div className="font-bold text-[13.5px] mb-2 dark:text-white">Hit these 3 points:</div>
              <ul className="space-y-2">{cur.keyPoints.map((k, i) => {
                const on = checks.has(`${cur.id}-${i}`);
                return (
                  <li key={i}>
                    <button onClick={() => toggleCheck(i)} className={`w-full text-left text-[13.5px] flex gap-2.5 items-start border rounded-xl px-3 py-2 transition-colors ${on ? 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 text-slate-500 dark:text-slate-400 line-through' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300'}`}>
                      <span className={`w-5 h-5 rounded-md grid place-items-center shrink-0 mt-0.5 ${on ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-500'}`}>
                        {on && <Icons.Check size={13} />}
                      </span>{k}
                    </button>
                  </li>
                );
              })}</ul>
              </div>
              <button onClick={() => setTab('visual')} className="text-blue-600 text-sm font-semibold">← Watch the visual lesson</button>
            </div>
            );
          })()}
          {tab === 'practice' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="font-bold text-[15.5px] dark:text-white">Practice — explain this flow</div>
              <div className="min-w-0"><OrderQuiz q={cur} onBest={(qid, v) => setQuizBest((p) => ({ ...p, [qid]: v }))} /></div>
              <div className="border-2 border-emerald-100 dark:border-emerald-900 rounded-xl p-4 bg-emerald-50/40 dark:bg-emerald-950/20 min-w-0">
              <div className="text-[13.5px] font-bold dark:text-white flex items-center gap-2"><Icons.MessageCircle size={16} className="text-emerald-500" /> Then say the takeaway</div>
              <p className="text-[13.5px] text-slate-500 dark:text-slate-400 mt-1">Cover the order above from memory, then reveal the takeaway to check yourself.</p>
              <button onClick={() => setPredict(!predict)} className="mt-3 border border-emerald-200 text-emerald-600 rounded-lg px-3 py-1.5 text-sm font-semibold">{predict ? 'Hide takeaway' : 'Reveal takeaway'}</button>
              {predict && <p className="mt-2 text-[13.5px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900 rounded-xl p-3">{cur.takeaway}</p>}
              </div>
              {followUps[cur.id] && (
              <div className="border-2 border-violet-100 dark:border-violet-900 rounded-xl p-4 bg-violet-50/40 dark:bg-violet-950/20">
                <div className="text-[13.5px] font-bold dark:text-white flex items-center gap-2"><Icons.MessageCircleQuestion size={16} className="text-violet-500" /> Likely follow-up</div>
                <p className="text-[13.5px] text-slate-700 dark:text-slate-200 mt-1.5 italic">"{followUps[cur.id].q}"</p>
                <button onClick={() => setFollow(!follow)} className="mt-2.5 border border-violet-200 text-violet-600 rounded-lg px-3 py-1.5 text-sm font-semibold">{follow ? 'Hide model answer' : 'Reveal model answer'}</button>
                {follow && <p className="mt-2 text-[13.5px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-violet-100 dark:border-violet-900 rounded-xl p-3">{followUps[cur.id].a}</p>}
              </div>
              )}
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="text-[13.5px] font-bold dark:text-white flex items-center gap-2"><Icons.NotebookPen size={16} className="text-slate-400" /> My notes
                  <span className="ml-auto text-[12px] font-semibold text-slate-400">{(notes[cur.id] || '').trim() ? `${(notes[cur.id] || '').trim().split(/\s+/).length} words · saved` : 'Nothing saved yet'}</span>
                  {(notes[cur.id] || '').trim() && <button onClick={() => updateNote('')} className="text-[12px] font-semibold text-slate-400 hover:text-red-500">Clear</button>}
                </div>
                <textarea value={notes[cur.id] || ''} onChange={(e) => updateNote(e.target.value)} rows={3}
                  placeholder="Your mnemonics, reminders, tricky bits — auto-saved for this question…"
                  className="mt-2 w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl p-3 text-[13.5px] outline-none focus:border-blue-400 resize-y min-h-[76px] placeholder:text-slate-400" />
              </div>
              <div className="flex items-center gap-2.5 flex-wrap border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3">
                <span className="text-[12.5px] font-bold text-slate-600 dark:text-slate-300">Session summary:</span>
                <span className="text-[12px] font-semibold rounded-full px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">Quiz best {(quizBest[cur.id] ?? 0)}/{cur.steps.length}</span>
                <span className={`text-[12px] font-semibold rounded-full px-2.5 py-1 ${predict ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>Takeaway {predict ? 'reviewed ✓' : 'not yet'}</span>
                <span className="text-[12px] font-semibold rounded-full px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">{(notes[cur.id] || '').trim() ? `${(notes[cur.id] || '').trim().split(/\s+/).length} note words` : 'No notes yet'}</span>
                <button onClick={() => setActive(active % TOTAL + 1)} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-lg px-4 py-2">Next question →</button>
              </div>
            </div>
          )}
            </div>
            </div>
        </main>
      </div>
      {sheet && <InterviewSheet all={all} onClose={() => setSheet(false)} />}
    </div>
  );
}
