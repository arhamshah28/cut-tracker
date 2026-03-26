"use client";
import { useState, useCallback } from "react";
import {
  START_DATE, END_DATE, START_W, TARGET_W, BMR_V, NEAT_V,
  WCD, TARGETS, MG, AM, DR, WKS, ACTS, SUPPS, EMPTY_DAY,
  lime, red, blue, org, cyn, prp, pnk,
  bg, cd, bd, tx, mt, dm,
  FONT_SANS, FONT_MONO,
  catLabels, catAccents, inputStyle,
  DayData,
} from "@/lib/constants";
import { toD, fm, now, dB, cl, wd, dn, msh, gP, gCT, gWT } from "@/lib/helpers";
import Bx from "./Card";
import MI from "./MealItem";
import OB from "./OptionButton";
import CB from "./Checkbox";
import Toast from "./Toast";

interface TrackerProps {
  data: Record<string, DayData>;
  updateDay: (date: string, patch: Partial<DayData>) => void;
  toast: boolean;
  onSignOut: () => void;
  exportData: () => void;
}

export default function Tracker({ data, updateDay, toast, onSignOut, exportData }: TrackerProps) {
  const [sel, setSel] = useState(now());
  const [tab, setTab] = useState("food");
  const [dO, setDO] = useState(false);
  const [dS, setDS] = useState("");
  const [dF, setDF] = useState("All");
  const [cO, setCO] = useState(false);
  const [cN, setCN] = useState("");
  const [cC, setCC] = useState("");
  const [cP, setCP] = useState("");

  const day: DayData = { ...EMPTY_DAY, ...data[sel] };
  const ph = gP(sel);
  const calT = gCT(sel);
  const waterT = gWT(sel);
  const wc = WCD[sel] || null;
  const dIn = cl(dB(START_DATE, sel) + 1, 1, 38);
  const dLeft = cl(dB(sel, END_DATE), 0, 38);

  const upd = useCallback(
    (p: Partial<DayData>) => {
      updateDay(sel, p);
    },
    [sel, updateDay]
  );

  function tog(f: "meals" | "walks" | "supplements", id: string) {
    const a = (day[f] as string[]) || [];
    upd({ [f]: a.includes(id) ? a.filter((x) => x !== id) : [...a, id] });
  }

  // Calorie calculations
  const mC = day.meals.reduce((s, id) => { const m = AM.find((x) => x.id === id); return s + (m ? m.c : 0); }, 0);
  const mP = day.meals.reduce((s, id) => { const m = AM.find((x) => x.id === id); return s + (m ? m.p : 0); }, 0);
  const dR = DR.find((r) => r.i === day.dinner);
  const dC = dR ? dR.c : 0;
  const dP = dR ? dR.p : 0;
  const xC = (day.custom || []).reduce((s, m) => s + (m.c || 0), 0);
  const xP = (day.custom || []).reduce((s, m) => s + (m.p || 0), 0);
  const tIn = mC + dC + xC;
  const tPr = mP + dP + xP;
  const tef = Math.round(tIn * 0.08);
  const wB = day.workout ? (WKS.find((w) => w.id === day.workout) || { b: 0 }).b : 0;
  const aB = (day.walks || []).reduce((s, id) => { const a = ACTS.find((x) => x.id === id); return s + (a ? a.b : 0); }, 0);
  const tOut = BMR_V + NEAT_V + tef + wB + aB;
  const def = tOut - tIn;
  const ou = tIn - calT;

  // Weight tracking
  const wE = Object.entries(data)
    .filter((e) => e[1] && e[1].weight)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const lW = wE.length > 0 ? wE[wE.length - 1][1].weight! : START_W;
  const cW = day.weight || lW;
  const tL = START_W - cW;
  const pct = cl((tL / (START_W - TARGET_W)) * 100, 0, 100);

  // Completion checks
  const cks = [
    (day.meals || []).length >= 4,
    day.dinner !== null,
    day.workout !== null || wd(sel) === "Sun",
    (day.water || 0) >= waterT,
    tPr >= 85,
    (day.supplements || []).length >= 5,
    day.sleep !== null && day.sleep >= 7,
  ];
  const comp = Math.round((cks.filter(Boolean).length / cks.length) * 100);

  // Date navigation
  const nD: string[] = [];
  for (let i = -3; i <= 3; i++) {
    const dd = toD(sel);
    dd.setDate(dd.getDate() + i);
    nD.push(fm(dd));
  }
  function sh(n: number) {
    const dd = toD(sel);
    dd.setDate(dd.getDate() + n);
    setSel(fm(dd));
  }

  // Dinner filter
  const fDR = DR.filter((r) => dF === "All" || r.g === dF).filter((r) => r.n.toLowerCase().includes(dS.toLowerCase()));

  function addCM() {
    if (!cN || !cC) return;
    upd({ custom: [...(day.custom || []), { n: cN, c: parseInt(cC) || 0, p: parseInt(cP) || 0, id: Date.now() }] });
    setCN("");
    setCC("");
    setCP("");
    setCO(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: tx, fontFamily: FONT_SANS, maxWidth: 480, margin: "0 auto" }}>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg,#0c0c1a," + bg + ")", padding: "16px 16px 0", borderBottom: "1px solid " + bd }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: lime, boxShadow: "0 0 10px " + lime + "88" }} />
              <span style={{ fontSize: 16, fontWeight: 800, color: lime, letterSpacing: 1 }}>CUT TRACKER</span>
            </div>
            <p style={{ fontSize: 12, color: mt, fontFamily: FONT_MONO, marginTop: 4 }}>
              P{ph.id} {ph.name} • Day {dIn}/38 • {dLeft}d left
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: FONT_MONO, color: def > 0 ? lime : red, lineHeight: 1 }}>
              {def > 0 ? "-" : "+"}
              {Math.abs(def).toLocaleString()}
            </div>
            <p style={{ fontSize: 11, color: mt, fontFamily: FONT_MONO, marginTop: 2 }}>DEFICIT KCAL</p>
          </div>
        </div>

        {wc && (
          <div style={{ margin: "12px 0 6px", padding: "10px 14px", borderRadius: 10, background: "linear-gradient(135deg,#2a0a0a,#1a0505)", border: "1px solid #4a1515" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: red, fontFamily: FONT_MONO }}>⚠ WATER CUT DAY</div>
            <div style={{ fontSize: 14, color: "#ff8888", marginTop: 3 }}>{wc.note}</div>
            <div style={{ fontSize: 11, color: mt, fontFamily: FONT_MONO, marginTop: 2 }}>Water: {wc.wL}L • Salt: {wc.salt}</div>
          </div>
        )}

        {/* Date nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 12, paddingBottom: 10 }}>
          <button onClick={() => sh(-7)} style={{ background: "none", border: "none", color: mt, cursor: "pointer", padding: 4, fontSize: 20, fontWeight: 700 }}>
            ‹
          </button>
          {nD.map((d) => {
            const s = d === sel;
            const t = d === now();
            const h = data[d] && ((data[d].meals || []).length > 0 || data[d].dinner || data[d].weight);
            return (
              <button
                key={d}
                onClick={() => setSel(d)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 10,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all .15s",
                  background: s ? lime : "transparent",
                  color: s ? "#080808" : t ? lime : mt,
                  border: t && !s ? "1px solid #2a3a1a" : "1px solid transparent",
                }}
              >
                <div style={{ fontSize: 10, fontFamily: FONT_MONO, fontWeight: 600, opacity: 0.7 }}>{wd(d)}</div>
                <div style={{ fontSize: 16, fontWeight: s ? 800 : 500 }}>{dn(d)}</div>
                {h && !s && <div style={{ width: 4, height: 4, borderRadius: 2, background: "#3a5a1a", margin: "2px auto 0" }} />}
              </button>
            );
          })}
          <button onClick={() => sh(7)} style={{ background: "none", border: "none", color: mt, cursor: "pointer", padding: 4, fontSize: 20, fontWeight: 700 }}>
            ›
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, padding: "10px 14px" }}>
        {[
          { l: "IN", v: tIn, u: "kcal", col: Math.abs(ou) < 100 ? lime : ou > 100 ? red : blue },
          { l: "OUT", v: tOut, u: "kcal", col: blue },
          { l: "PROTEIN", v: tPr, u: "g", col: tPr >= 85 ? lime : red },
          { l: "WATER", v: day.water || 0, u: "/" + waterT + "L", col: (day.water || 0) >= waterT ? lime : org },
        ].map((s, i) => (
          <div key={i} style={{ background: cd, borderRadius: 12, padding: "8px 4px", textAlign: "center", border: "1px solid " + bd }}>
            <div style={{ fontSize: 10, color: dm, fontFamily: FONT_MONO, letterSpacing: 1, fontWeight: 600 }}>{s.l}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.col, fontFamily: FONT_MONO, marginTop: 2 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: dm }}>{s.u}</div>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div style={{ padding: "0 14px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: dm, fontFamily: FONT_MONO }}>vs {calT} kcal target</span>
          <span style={{ fontSize: 13, fontWeight: 800, fontFamily: FONT_MONO, color: ou > 100 ? red : ou > 0 ? org : lime }}>
            {ou > 0 ? "+" : ""}
            {ou}
          </span>
        </div>
        <div style={{ height: 7, background: bd, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: 7, borderRadius: 4, transition: "width .4s", width: cl((tIn / calT) * 100, 0, 120) + "%", background: ou > 100 ? red : ou > 0 ? org : lime }} />
        </div>
      </div>
      <div style={{ padding: "4px 14px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 11, color: dm, fontFamily: FONT_MONO }}>COMPLETION</span>
          <span style={{ fontSize: 13, fontWeight: 800, fontFamily: FONT_MONO, color: comp === 100 ? lime : mt }}>{comp}%</span>
        </div>
        <div style={{ height: 5, background: bd, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: 5, borderRadius: 3, width: comp + "%", background: comp === 100 ? lime : mt, transition: "width .4s" }} />
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
          {["Meals", "Dinner", "Train", "Water", "Protein", "Supps", "Sleep"].map((l, i) => (
            <span
              key={i}
              style={{
                fontSize: 9,
                fontFamily: FONT_MONO,
                fontWeight: 600,
                padding: "3px 6px",
                borderRadius: 5,
                background: cks[i] ? "#1a2a10" : "#15152a",
                color: cks[i] ? lime : dm,
              }}
            >
              {cks[i] ? "✓" : "○"} {l}
            </span>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", padding: "0 14px", marginBottom: 8 }}>
        {[
          { id: "food", l: "FOOD", c: lime },
          { id: "burn", l: "BURN", c: red },
          { id: "body", l: "BODY", c: blue },
          { id: "more", l: "MORE", c: prp },
        ].map((t, i) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                cursor: "pointer",
                background: active ? cd : "transparent",
                color: active ? t.c : dm,
                fontSize: 11,
                fontWeight: 800,
                fontFamily: FONT_MONO,
                letterSpacing: 1,
                borderTop: active ? "3px solid " + t.c : "3px solid transparent",
                borderRadius: i === 0 ? "8px 0 0 8px" : i === 3 ? "0 8px 8px 0" : 0,
                transition: "all .15s",
              }}
            >
              {t.l}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "0 14px 120px" }}>
        {/* FOOD TAB */}
        {tab === "food" && (
          <div>
            {Object.entries(MG).map(([cat, meals]) => (
              <Bx key={cat} title={catLabels[cat]} accent={catAccents[cat]}>
                {meals.map((m) => (
                  <MI key={m.id} meal={m} on={day.meals.includes(m.id)} onTap={() => tog("meals", m.id)} />
                ))}
                {cat === "lunch" && (
                  <div style={{ fontSize: 11, color: dm, fontStyle: "italic", paddingTop: 4 }}>
                    Pick one: Roti (P1) • Chilla 3x/wk (P2) • No roti 4x (P3)
                  </div>
                )}
              </Bx>
            ))}

            <Bx title="🍳 DINNER — 200g PANEER" accent={pnk}>
              {day.dinner ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>
                      <span style={{ color: mt, fontFamily: FONT_MONO, fontSize: 12 }}>#{dR && dR.i} </span>
                      {dR && dR.n}
                    </div>
                    <div style={{ fontSize: 12, color: mt, fontFamily: FONT_MONO, marginTop: 3 }}>
                      {dC} kcal • {dP}g protein • {dR && dR.g}
                    </div>
                  </div>
                  <button
                    onClick={() => { upd({ dinner: null }); setDO(true); }}
                    style={{ background: bd, border: "none", borderRadius: 8, padding: "6px 12px", color: lime, fontSize: 11, cursor: "pointer", fontFamily: FONT_MONO, fontWeight: 700 }}
                  >
                    Swap
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDO(!dO)}
                  style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px dashed " + bd, background: "transparent", color: mt, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
                >
                  + Pick tonight&apos;s recipe
                </button>
              )}
              {dO && (
                <div style={{ marginTop: 8 }}>
                  <input value={dS} onChange={(e) => setDS(e.target.value)} placeholder="Search recipes..." style={inputStyle} />
                  <div style={{ display: "flex", gap: 4, margin: "6px 0" }}>
                    {["All", "Indian", "Intl", "Soup", "Bowl"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setDF(f)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          fontFamily: FONT_MONO,
                          background: dF === f ? lime : bd,
                          color: dF === f ? "#080808" : mt,
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {fDR.map((r) => (
                      <button
                        key={r.i}
                        onClick={() => { upd({ dinner: r.i }); setDO(false); setDS(""); }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid " + bd,
                          background: bg,
                          color: tx,
                          cursor: "pointer",
                          textAlign: "left",
                          marginBottom: 3,
                          fontSize: 13,
                        }}
                      >
                        <span>
                          <span style={{ color: dm, fontFamily: FONT_MONO, fontSize: 11 }}>#{r.i} </span>
                          {r.n}
                        </span>
                        <span style={{ fontSize: 12, color: mt, fontFamily: FONT_MONO, whiteSpace: "nowrap", marginLeft: 8, fontWeight: 700 }}>
                          {r.c} • {r.p}g
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Bx>

            <Bx title="📝 UNPLANNED FOOD" accent={org}>
              {(day.custom || []).map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid " + bd }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.n}</div>
                    <div style={{ fontSize: 11, color: mt, fontFamily: FONT_MONO }}>{m.c} kcal • {m.p}g</div>
                  </div>
                  <button
                    onClick={() => upd({ custom: (day.custom || []).filter((x) => x.id !== m.id) })}
                    style={{ background: "transparent", border: "none", color: red, cursor: "pointer", fontSize: 20, fontWeight: 700 }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {cO ? (
                <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: 6 }}>
                  <input value={cN} onChange={(e) => setCN(e.target.value)} placeholder="What did you eat?" style={inputStyle} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={cC} onChange={(e) => setCC(e.target.value)} placeholder="Calories" type="number" style={{ ...inputStyle, flex: 1 }} />
                    <input value={cP} onChange={(e) => setCP(e.target.value)} placeholder="Protein g" type="number" style={{ ...inputStyle, flex: 1 }} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={addCM} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: lime, color: "#080808", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                      Add
                    </button>
                    <button onClick={() => setCO(false)} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid " + bd, background: "transparent", color: mt, fontSize: 13, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setCO(true)}
                  style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px dashed " + bd, background: "transparent", color: dm, cursor: "pointer", fontSize: 13, fontWeight: 600, marginTop: 4 }}
                >
                  + Log unplanned food (party, eating out)
                </button>
              )}
            </Bx>

            <Bx title={"💧 WATER — " + waterT + "L TARGET"} accent={blue}>
              <div style={{ display: "flex", gap: 6, padding: "6px 0" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                  const active = (day.water || 0) >= n;
                  return (
                    <button
                      key={n}
                      onClick={() => upd({ water: day.water === n ? n - 1 : n })}
                      style={{
                        width: 34,
                        height: 40,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        background: active ? "linear-gradient(180deg,#4da6ff,#2563eb)" : bd,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        paddingBottom: 4,
                        opacity: n > waterT && !active ? 0.25 : 1,
                        transition: "all .2s",
                      }}
                    >
                      <span style={{ fontSize: 10, fontFamily: FONT_MONO, fontWeight: 700, color: active ? "#fff" : dm }}>{n}</span>
                    </button>
                  );
                })}
              </div>
            </Bx>

            <Bx title="📋 NOTES" accent={prp}>
              <textarea
                value={day.notes || ""}
                onChange={(e) => upd({ notes: e.target.value })}
                placeholder="How do you feel today? Struggles? Energy?"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" as const, fontSize: 13 }}
              />
            </Bx>
          </div>
        )}

        {/* BURN TAB */}
        {tab === "burn" && (
          <div>
            <Bx title="🏋️ WORKOUT SESSION" accent={red}>
              {WKS.map((w) => {
                const s = day.workout === w.id;
                return <OB key={w.id} on={s} label={w.n} sub={w.d} val={w.b > 0 ? "-" + w.b : "—"} color={red} onTap={() => upd({ workout: s ? null : w.id })} />;
              })}
            </Bx>
            <Bx title="🚶 WALKING + 🔥 HIIT" accent={org}>
              {ACTS.map((a) => {
                const s = (day.walks || []).includes(a.id);
                return <OB key={a.id} on={s} label={a.n} val={"-" + a.b} color={a.id.startsWith("hiit") ? pnk : org} onTap={() => tog("walks", a.id)} />;
              })}
            </Bx>
            <Bx title="📊 CALORIE BREAKDOWN" accent={blue}>
              {[
                { l: "BMR (resting metabolism)", v: BMR_V },
                { l: "NEAT (daily activity)", v: NEAT_V },
                { l: "TEF (food digestion)", v: tef },
                { l: "Workout session", v: wB },
                { l: "Walking + HIIT", v: aB },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                  <span style={{ fontSize: 13, color: mt }}>{r.l}</span>
                  <span style={{ fontSize: 14, fontFamily: FONT_MONO, fontWeight: 600, color: r.v > 0 ? tx : dm }}>{r.v}</span>
                </div>
              ))}
              <div style={{ borderTop: "2px solid " + bd, marginTop: 6, paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Total Burn</span>
                  <span style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT_MONO, color: blue }}>{tOut}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Total Intake</span>
                  <span style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT_MONO, color: org }}>{tIn}</span>
                </div>
                <div style={{ borderTop: "2px solid " + bd, marginTop: 6, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: lime }}>NET DEFICIT</span>
                  <span style={{ fontSize: 24, fontWeight: 800, fontFamily: FONT_MONO, color: def > 0 ? lime : red }}>
                    {def > 0 ? "-" : "+"}
                    {Math.abs(def)}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: mt, textAlign: "center", marginTop: 6, fontFamily: FONT_MONO, fontWeight: 600 }}>
                  = {(def / 7700).toFixed(2)} kg fat burned today
                </div>
              </div>
            </Bx>
          </div>
        )}

        {/* BODY TAB */}
        {tab === "body" && (
          <div>
            <Bx title="⚖️ MORNING WEIGH-IN" accent={cyn}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={day.weight || ""}
                  onChange={(e) => upd({ weight: e.target.value ? parseFloat(e.target.value) : null })}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    border: "2px solid " + bd,
                    background: bg,
                    color: tx,
                    fontSize: 32,
                    fontWeight: 800,
                    fontFamily: FONT_MONO,
                    outline: "none",
                    textAlign: "center",
                  }}
                />
                <span style={{ fontSize: 20, color: mt, fontWeight: 700 }}>kg</span>
              </div>
              {day.weight && (
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT_MONO, color: lime }}>{(START_W - day.weight).toFixed(1)}</div>
                    <div style={{ fontSize: 10, color: mt, fontWeight: 600 }}>KG LOST</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT_MONO, color: org }}>{(day.weight - TARGET_W).toFixed(1)}</div>
                    <div style={{ fontSize: 10, color: mt, fontWeight: 600 }}>TO GO</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT_MONO, color: blue }}>{pct.toFixed(0)}%</div>
                    <div style={{ fontSize: 10, color: mt, fontWeight: 600 }}>DONE</div>
                  </div>
                </div>
              )}
            </Bx>

            <Bx title="😴 SLEEP HOURS" accent={prp}>
              <div style={{ display: "flex", gap: 5, padding: "6px 0" }}>
                {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((h) => (
                  <button
                    key={h}
                    onClick={() => upd({ sleep: day.sleep === h ? null : h })}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      background: day.sleep === h ? (h >= 7 ? lime : red) : bd,
                      color: day.sleep === h ? "#080808" : dm,
                      fontSize: 12,
                      fontWeight: 800,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: mt, marginTop: 5, fontWeight: 500 }}>
                {day.sleep
                  ? day.sleep >= 7
                    ? "✓ " + day.sleep + "h — Cortisol low. Recovery on track."
                    : "⚠ " + day.sleep + "h — Under 7! Water retention risk."
                  : "Tap your hours. Target: 7-8h."}
              </div>
            </Bx>

            <Bx title="📊 OVERALL PROGRESS" accent={lime}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: mt, fontFamily: FONT_MONO, fontWeight: 600 }}>111 kg</span>
                <span style={{ fontSize: 12, color: lime, fontFamily: FONT_MONO, fontWeight: 600 }}>90 kg</span>
              </div>
              <div style={{ height: 16, background: bd, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 8, width: pct + "%", background: "linear-gradient(90deg," + lime + ",#8bbc14)", transition: "width .5s" }} />
              </div>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <span style={{ fontSize: 42, fontWeight: 800, fontFamily: FONT_MONO, color: lime }}>{tL.toFixed(1)}</span>
                <span style={{ fontSize: 16, color: mt, marginLeft: 6, fontWeight: 600 }}>kg lost</span>
              </div>
            </Bx>

            <Bx title="🎯 MILESTONES" accent={cyn}>
              {TARGETS.map((tg, i) => {
                const a = data[tg.d] ? data[tg.d].weight : null;
                const cur = sel >= (i > 0 ? TARGETS[i - 1].d : START_DATE) && sel <= tg.d;
                return (
                  <div
                    key={tg.d}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "7px 0",
                      borderBottom: "1px solid " + bd,
                      opacity: tg.d < sel && !cur ? 0.3 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {cur && <div style={{ width: 6, height: 6, borderRadius: 3, background: lime, boxShadow: "0 0 6px " + lime }} />}
                      <span style={{ fontSize: 13, fontWeight: cur ? 700 : 500, color: cur ? tx : mt }}>{tg.l}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontFamily: FONT_MONO, color: dm, fontWeight: 600 }}>{tg.t}kg</span>
                      {a != null && (
                        <span style={{ fontSize: 14, fontFamily: FONT_MONO, fontWeight: 800, color: a <= tg.t ? lime : red }}>
                          {a} {a <= tg.t ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </Bx>

            <Bx title="📋 WEIGHT LOG" accent={blue}>
              {wE.length === 0 ? (
                <p style={{ fontSize: 13, color: dm }}>No entries yet. Start logging!</p>
              ) : (
                wE
                  .slice(-14)
                  .reverse()
                  .map((entry, i, arr) => {
                    const d = entry[0];
                    const v = entry[1];
                    const prev = i < arr.length - 1 ? arr[i + 1][1].weight : null;
                    const diff = prev ? (v.weight! - prev).toFixed(1) : null;
                    return (
                      <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid " + bd }}>
                        <span style={{ fontSize: 11, color: dm, fontFamily: FONT_MONO }}>
                          {msh(d)} {dn(d)}
                        </span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {diff && (
                            <span style={{ fontSize: 11, fontFamily: FONT_MONO, fontWeight: 700, color: parseFloat(diff) <= 0 ? lime : red }}>
                              {parseFloat(diff) > 0 ? "+" : ""}
                              {diff}
                            </span>
                          )}
                          <span style={{ fontSize: 15, fontWeight: 800, fontFamily: FONT_MONO }}>{v.weight}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </Bx>
          </div>
        )}

        {/* MORE TAB */}
        {tab === "more" && (
          <div>
            <Bx title={"💊 SUPPLEMENTS — " + (day.supplements || []).length + "/" + SUPPS.length} accent={prp}>
              {SUPPS.map((s) => {
                const on = (day.supplements || []).includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => tog("supplements", s.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 0",
                      cursor: "pointer",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid " + bd,
                      color: tx,
                      textAlign: "left",
                    }}
                  >
                    <CB on={on} color={prp} />
                    <span style={{ fontSize: 14, fontWeight: 600, opacity: on ? 1 : 0.4 }}>{s.n}</span>
                  </button>
                );
              })}
              {ph.id >= 4 && (
                <div style={{ fontSize: 12, color: red, paddingTop: 6, fontFamily: FONT_MONO, fontWeight: 700 }}>⚠ Stop ORS after April 28</div>
              )}
            </Bx>

            <Bx title="📅 DAILY SCHEDULE" accent={cyn}>
              {[
                ["6:45", "ACV + warm water"],
                ["7:00", "Green tea + chia seeds"],
                ["9:30", "Protein shake + almonds"],
                ["1:00", "Lunch"],
                ["4:30", "Americano (pre-workout)"],
                ["5:00", "Walk to gym (1km)"],
                ["5:15", "Workout + cardio"],
                ["6:30", "Walk home (1km)"],
                ["6:45", "Post-workout shake"],
                ["8:30", "Dinner (paneer recipe)"],
                ["9:00", "Evening walk 60-90 min"],
                ["10:00", "Isabgol + warm water"],
                ["10:15", "Sleep"],
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid " + bd }}>
                  <span style={{ fontSize: 12, color: cyn, fontFamily: FONT_MONO, fontWeight: 700, width: 42, flexShrink: 0 }}>{item[0]}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{item[1]}</span>
                </div>
              ))}
            </Bx>

            <Bx title="⚠️ THE RULES" accent={red}>
              {[
                "No cheat meals. 38 days. ZERO.",
                "Protein above 85g/day always",
                "Sleep 7-8 hours minimum",
                "No alcohol",
                "No packaged or outside food",
                "Walk BRISK to gym — not stroll",
                "Weigh every morning, same time",
                "Dizzy or faint? EAT IMMEDIATELY.",
              ].map((r, i) => (
                <div key={i} style={{ fontSize: 13, color: mt, padding: "5px 0", borderBottom: "1px solid " + bd, fontWeight: 500 }}>
                  <span style={{ color: red, fontWeight: 800 }}>{i + 1}.</span> {r}
                </div>
              ))}
            </Bx>

            <Bx title="🛒 WEEKLY GROCERY" accent={lime}>
              {[
                "Paneer 1.4kg (200g × 7)",
                "Whey protein (14 scoops)",
                "Chia seeds 100g",
                "Green tea bags × 7",
                "Almonds ~25",
                "Besan 250g",
                "Sabzi 3-4 types",
                "Fresh veg + coriander + lemon",
                "Low-fat dahi ~500g",
                "Whole wheat atta 500g",
                "Isabgol",
                "ORS/Electral × 10",
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: mt, padding: "4px 0", borderBottom: "1px solid " + bd, fontWeight: 500 }}>
                  • {item}
                </div>
              ))}
            </Bx>

            {/* Export + Logout */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={exportData}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid " + bd,
                  background: cd,
                  color: blue,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: FONT_SANS,
                }}
              >
                📥 Export Data (JSON)
              </button>
              <button
                onClick={onSignOut}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #4a1515",
                  background: "#1a0505",
                  color: red,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: FONT_SANS,
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <Toast show={toast} />
    </div>
  );
}
