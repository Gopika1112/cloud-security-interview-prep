import { useEffect, useMemo, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cloudSecurityQuestions, type CloudQuestion } from './data/cloudSecurityQuestions';
import { interviewAnswers } from './data/interviewAnswers';

const TOTAL = 20;

function useLocalQuestions() {
  return useQuery({ queryKey: ['cloud-security-questions'], queryFn: async () => cloudSecurityQuestions.slice(0, TOTAL), staleTime: Infinity });
}
function DynIcon({ name, size = 22 }: { name: string; size?: number }) {
  const C = (Icons as any)[name] ?? Icons.Box;
  return <C size={size} />;
}
const shortLabel = (t: string) => t.replace(/^Step \d+:\s*/, '');

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
function Sidebar({ list, active, done, onPick, sq, onSq, open, onClose }: any) {
  const pct = Math.round((done.size / TOTAL) * 100);
  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900/30 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`${open ? 'fixed inset-y-0 left-0 z-30 w-[320px] bg-white dark:bg-slate-900 shadow-xl' : 'hidden'} lg:block lg:static lg:w-[330px] shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900`}>
        <div className="p-5">
          <div className="text-[19px] font-extrabold text-slate-900 dark:text-white">Cloud Security <span className="text-slate-400 font-normal text-[15px]">• {TOTAL} Questions</span></div>
          <div className="h-[7px] bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: pct + '%' }} /></div>
          <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">{done.size} / {TOTAL} completed</div>
          <div className="relative mt-4">
            <Icons.Search size={15} className="absolute left-3 top-[10px] text-slate-400" />
            <input value={sq} onChange={(e) => onSq(e.target.value)} placeholder="Search questions..."
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg pl-9 pr-2 py-2 text-[13px] outline-none focus:border-blue-400" />
          </div>
          <div className="mt-2 max-h-[calc(100vh-300px)] min-h-[300px] overflow-y-auto thin-scroll divide-y divide-slate-100 dark:divide-slate-700">
            {list.map((x: CloudQuestion, i: number) => {
              const isA = active === x.id;
              return (
                <button key={x.id} onClick={() => onPick(x.id)}
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
  const [theme, setTheme] = useState(() => localStorage.getItem('cs-theme') || 'light');
  const timer = useRef<any>(null);

  const all = data ?? [];
  const term = (hq || sq).toLowerCase();
  const list = useMemo(() => all.filter((x) => !term || (x.question + ' ' + x.shortDescription + ' ' + x.keywords.join(' ')).toLowerCase().includes(term)), [all, term]);
  const cur = all.find((x) => x.id === active) ?? all[0];

  useEffect(() => { setStep(0); setPlaying(true); setPredict(false); setTab('visual'); setChecks(new Set()); setCopied(false); }, [active]);
  useEffect(() => {
    if (!cur || !playing || tab !== 'visual') return;
    if (step >= cur.steps.length - 1) { setPlaying(false); return; }
    timer.current = setTimeout(() => setStep((s) => Math.min(s + 1, cur.steps.length - 1)), 2200 / speed);
    return () => clearTimeout(timer.current);
  }, [step, playing, speed, cur, active, tab]);
  useEffect(() => { localStorage.setItem('cs-done', JSON.stringify([...done])); }, [done]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('cs-theme', theme);
  }, [theme]);

  if (!cur) return <div className="p-10 text-slate-500">Loading questions…</div>;
  const markDone = () => setDone((d) => new Set(d).add(cur.id));
  const fill = (step / Math.max(1, cur.steps.length - 1)) * 100;

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header q={hq} onSearch={setHq} onMenu={() => setDrawer(!drawer)} theme={theme} onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <div className="flex max-w-[1440px] mx-auto items-start">
        <Sidebar list={list} active={active} done={done} sq={sq} onSq={setSq} open={drawer}
          onClose={() => setDrawer(false)} onPick={(id: number) => { setActive(id); setDrawer(false); }} />
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-6">
          <h1 className="text-[26px] sm:text-[32px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{cur.question}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px]">Watch the request travel. Understand every step.</p>

          <div className="flex gap-3 items-start mt-4">
            <div className="flex flex-col shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-[0_2px_12px_-4px_rgba(15,30,61,.08)] lg:sticky lg:top-[76px] divide-y divide-slate-100 dark:divide-slate-800">
              <button onClick={() => setTab('visual')} title="See it — visual lesson" className={`w-[72px] py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tab === 'visual' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <span className={`text-[10px] font-extrabold tracking-wide ${tab === 'visual' ? 'text-blue-200' : 'text-slate-300 dark:text-slate-600'}`}>STEP 1</span>
                <Icons.Eye size={20} /><span className="text-[11.5px] font-bold">See it</span>
              </button>
              <button onClick={() => setTab('answer')} title="Say it — interview answer" className={`w-[72px] py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tab === 'answer' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <span className={`text-[10px] font-extrabold tracking-wide ${tab === 'answer' ? 'text-blue-200' : 'text-slate-300 dark:text-slate-600'}`}>STEP 2</span>
                <Icons.Mic size={20} /><span className="text-[11.5px] font-bold">Say it</span>
              </button>
              <button onClick={() => setTab('practice')} title="Nail it — practice" className={`w-[72px] py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tab === 'practice' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <span className={`text-[10px] font-extrabold tracking-wide ${tab === 'practice' ? 'text-blue-200' : 'text-slate-300 dark:text-slate-600'}`}>STEP 3</span>
                <Icons.Trophy size={20} /><span className="text-[11.5px] font-bold">Nail it</span>
              </button>
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
                    className="sim flex-1 min-w-[140px]" style={{ ['--fill' as any]: fill + '%' }} />
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
            return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 min-w-0 max-w-full overflow-hidden">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="font-bold text-[15.5px] dark:text-white">Interview answer — say it in 60 seconds</div>
                <button onClick={copy} className="border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold flex items-center gap-1.5">
                  {copied ? <><Icons.Check size={15} /> Copied!</> : <><Icons.Copy size={15} /> Copy answer</>}
                </button>
              </div>
              <p className="text-[15px] text-slate-700 dark:text-slate-200 mt-3 leading-[1.75] border-l-[3px] border-blue-500 pl-4 min-w-0 break-words">{script}</p>
              <div className="text-[12px] text-slate-400 mt-2">≈{words} words · ~{secs} seconds spoken</div>
              <div className="font-bold text-[13.5px] mt-5 mb-2 dark:text-white">Hit these 3 points:</div>
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
              <button onClick={() => setTab('visual')} className="mt-4 text-blue-600 text-sm font-semibold">← Watch the visual lesson</button>
            </div>
            );
          })()}
          {tab === 'practice' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <div className="font-bold text-[15.5px] dark:text-white">Practice — explain this flow</div>
              <p className="text-[13.5px] text-slate-500 dark:text-slate-400 mt-1">Cover each step in order, then reveal the takeaway to check yourself.</p>
              <ol className="mt-3 space-y-2">{cur.steps.map((s, i) => <li key={i} className="text-[13.5px] text-slate-600 dark:text-slate-300 flex gap-2"><span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 grid place-items-center text-[11px] font-bold shrink-0 mt-0.5">{i + 1}</span>{shortLabel(s.title)}</li>)}</ol>
              <button onClick={() => setPredict(!predict)} className="mt-4 border border-blue-200 text-blue-600 rounded-lg px-3 py-1.5 text-sm font-semibold">{predict ? 'Hide takeaway' : 'Reveal takeaway'}</button>
              {predict && <p className="mt-2 text-[13.5px] text-slate-700 bg-blue-50/60 border border-blue-100 rounded-xl p-3">{cur.takeaway}</p>}
            </div>
          )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
