"use client";

import { useState } from "react";
import { COLORS, FONT_SANS, FONT_MONO, INPUT_STYLE } from "@/lib/constants";
import { DEFAULT_CUT_TEMPLATE, autoGeneratePhases, autoGenerateMilestones } from "@/lib/defaults";
import { daysBetween, formatDate } from "@/lib/helpers";
import type { Cut, Phase, Milestone, MealItem, DinnerRecipe, Workout, Activity, Supplement } from "@/lib/types";

type CutData = Omit<Cut, "id" | "user_id" | "created_at" | "updated_at">;

interface CutWizardProps {
  onComplete: (cutData: CutData) => void;
  onCancel?: () => void;
}

const STEP_LABELS = [
  "Basics",
  "Phases",
  "Milestones",
  "Meals",
  "Recipes",
  "Workouts",
  "Lists",
  "Review",
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: COLORS.mt,
  fontFamily: FONT_MONO,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  marginBottom: 8,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: COLORS.lime,
  fontFamily: FONT_MONO,
  letterSpacing: 1,
  textTransform: "uppercase",
  marginBottom: 10,
  marginTop: 16,
};

const smallBtnStyle = (color: string): React.CSSProperties => ({
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid " + color + "44",
  background: color + "15",
  color: color,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: FONT_MONO,
});

const removeBtnStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 6,
  border: "1px solid " + COLORS.red + "44",
  background: COLORS.red + "15",
  color: COLORS.red,
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: FONT_MONO,
};

const inputSmall: React.CSSProperties = {
  ...INPUT_STYLE,
  padding: "8px 10px",
  fontSize: 13,
};

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function CutWizard({ onComplete, onCancel }: CutWizardProps) {
  const [step, setStep] = useState(0);
  const today = formatDate(new Date());
  const defaultEnd = formatDate(
    new Date(new Date().getTime() + 38 * 86400000)
  );

  const [state, setState] = useState<CutData>({
    name: "",
    status: "active",
    start_date: today,
    end_date: defaultEnd,
    start_weight: 0,
    target_weight: 0,
    phases: [],
    milestones: [],
    water_cut_days: {},
    meal_groups: {},
    dinner_recipes: [],
    workouts: [],
    activities: [],
    supplements: [],
    schedule: [],
    rules: [],
    grocery: [],
  });

  function set<K extends keyof CutData>(key: K, val: CutData[K]) {
    setState((s) => ({ ...s, [key]: val }));
  }

  function applyTemplate() {
    setState((s) => ({
      ...s,
      ...DEFAULT_CUT_TEMPLATE,
    }));
  }

  function clearTemplate() {
    setState((s) => ({
      ...s,
      phases: [],
      milestones: [],
      water_cut_days: {},
      meal_groups: {},
      dinner_recipes: [],
      workouts: [],
      activities: [],
      supplements: [],
      schedule: [],
      rules: [],
      grocery: [],
    }));
  }

  const totalDays = daysBetween(state.start_date, state.end_date);

  // ─── STEP 0: Basics ────────────────────────────────────────────
  function renderBasics() {
    return (
      <div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Cut Name</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. May 2026 Cut"
            style={INPUT_STYLE}
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Date</label>
            <input
              type="date"
              value={state.start_date}
              onChange={(e) => set("start_date", e.target.value)}
              style={{ ...INPUT_STYLE, colorScheme: "dark" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End Date</label>
            <input
              type="date"
              value={state.end_date}
              onChange={(e) => set("end_date", e.target.value)}
              style={{ ...INPUT_STYLE, colorScheme: "dark" }}
            />
          </div>
        </div>
        {totalDays > 0 && (
          <div
            style={{
              fontSize: 13,
              fontFamily: FONT_MONO,
              color: COLORS.org,
              fontWeight: 700,
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            {totalDays} days total
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Weight (kg)</label>
            <input
              type="number"
              min={30}
              max={250}
              step={0.1}
              value={state.start_weight || ""}
              onChange={(e) => set("start_weight", Number(e.target.value))}
              placeholder="e.g. 111"
              style={INPUT_STYLE}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Target Weight (kg)</label>
            <input
              type="number"
              min={30}
              max={250}
              step={0.1}
              value={state.target_weight || ""}
              onChange={(e) => set("target_weight", Number(e.target.value))}
              placeholder="e.g. 90"
              style={INPUT_STYLE}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={applyTemplate}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: "1px solid " + COLORS.lime + "44",
              background: COLORS.lime + "15",
              color: COLORS.lime,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Start from Template
          </button>
          <button
            type="button"
            onClick={clearTemplate}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: "1px solid " + COLORS.bd,
              background: "transparent",
              color: COLORS.mt,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Start from Scratch
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 1: Phases ─────────────────────────────────────────────
  function renderPhases() {
    const phases = state.phases;

    function updatePhase(idx: number, updates: Partial<Phase>) {
      const next = [...phases];
      next[idx] = { ...next[idx], ...updates };
      set("phases", next);
    }

    function addPhase() {
      const lastEnd = phases.length
        ? phases[phases.length - 1].end
        : state.start_date;
      const nextStart = formatDate(
        new Date(new Date(lastEnd + "T12:00:00").getTime() + 86400000)
      );
      set("phases", [
        ...phases,
        {
          id: phases.length + 1,
          name: "Phase " + (phases.length + 1),
          start: nextStart,
          end: nextStart,
          calT: 1000,
          wL: 6,
        },
      ]);
    }

    function removePhase(idx: number) {
      set(
        "phases",
        phases.filter((_, i) => i !== idx).map((p, i) => ({ ...p, id: i + 1 }))
      );
    }

    function autoGen() {
      if (state.start_date && state.end_date) {
        set("phases", autoGeneratePhases(state.start_date, state.end_date));
      }
    }

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button type="button" onClick={autoGen} style={smallBtnStyle(COLORS.cyn)}>
            Auto-Generate
          </button>
          <button type="button" onClick={addPhase} style={smallBtnStyle(COLORS.lime)}>
            + Add Phase
          </button>
        </div>
        {phases.length === 0 && (
          <div style={{ color: COLORS.dm, fontSize: 13, textAlign: "center", padding: 20 }}>
            No phases yet. Click Auto-Generate or add manually.
          </div>
        )}
        {phases.map((p, idx) => (
          <div
            key={p.id}
            style={{
              background: COLORS.bg,
              border: "1px solid " + COLORS.bd,
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.cyn, fontFamily: FONT_MONO }}>
                Phase {idx + 1}
              </span>
              <button type="button" onClick={() => removePhase(idx)} style={removeBtnStyle}>
                Remove
              </button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <input
                type="text"
                value={p.name}
                onChange={(e) => updatePhase(idx, { name: e.target.value })}
                placeholder="Phase name"
                style={inputSmall}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type="date"
                value={p.start}
                onChange={(e) => updatePhase(idx, { start: e.target.value })}
                style={{ ...inputSmall, flex: 1, colorScheme: "dark" }}
              />
              <input
                type="date"
                value={p.end}
                onChange={(e) => updatePhase(idx, { end: e.target.value })}
                style={{ ...inputSmall, flex: 1, colorScheme: "dark" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ ...labelStyle, fontSize: 10, marginBottom: 4 }}>Calories</label>
                <input
                  type="number"
                  value={p.calT}
                  onChange={(e) => updatePhase(idx, { calT: Number(e.target.value) })}
                  style={inputSmall}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ ...labelStyle, fontSize: 10, marginBottom: 4 }}>Water (L)</label>
                <input
                  type="number"
                  value={p.wL}
                  onChange={(e) => updatePhase(idx, { wL: Number(e.target.value) })}
                  style={inputSmall}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── STEP 2: Milestones ─────────────────────────────────────────
  function renderMilestones() {
    const milestones = state.milestones;

    function updateMilestone(idx: number, updates: Partial<Milestone>) {
      const next = [...milestones];
      next[idx] = { ...next[idx], ...updates };
      set("milestones", next);
    }

    function addMilestone() {
      set("milestones", [
        ...milestones,
        { d: state.end_date, t: state.target_weight || 0, l: "Milestone" },
      ]);
    }

    function removeMilestone(idx: number) {
      set("milestones", milestones.filter((_, i) => i !== idx));
    }

    function autoGen() {
      if (state.start_date && state.end_date && state.start_weight && state.target_weight) {
        set(
          "milestones",
          autoGenerateMilestones(state.start_date, state.end_date, state.start_weight, state.target_weight)
        );
      }
    }

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button type="button" onClick={autoGen} style={smallBtnStyle(COLORS.cyn)}>
            Auto-Generate
          </button>
          <button type="button" onClick={addMilestone} style={smallBtnStyle(COLORS.lime)}>
            + Add Milestone
          </button>
        </div>
        {milestones.length === 0 && (
          <div style={{ color: COLORS.dm, fontSize: 13, textAlign: "center", padding: 20 }}>
            No milestones yet. Click Auto-Generate or add manually.
          </div>
        )}
        {milestones.map((m, idx) => (
          <div
            key={idx}
            style={{
              background: COLORS.bg,
              border: "1px solid " + COLORS.bd,
              borderRadius: 12,
              padding: 14,
              marginBottom: 8,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              type="date"
              value={m.d}
              onChange={(e) => updateMilestone(idx, { d: e.target.value })}
              style={{ ...inputSmall, flex: 1, colorScheme: "dark" }}
            />
            <input
              type="number"
              value={m.t}
              onChange={(e) => updateMilestone(idx, { t: Number(e.target.value) })}
              placeholder="kg"
              style={{ ...inputSmall, width: 70, flex: "none" }}
            />
            <input
              type="text"
              value={m.l}
              onChange={(e) => updateMilestone(idx, { l: e.target.value })}
              placeholder="Label"
              style={{ ...inputSmall, flex: 1 }}
            />
            <button type="button" onClick={() => removeMilestone(idx)} style={removeBtnStyle}>
              X
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ─── STEP 3: Meals ──────────────────────────────────────────────
  function renderMeals() {
    const groups = state.meal_groups;
    const groupNames = Object.keys(groups);

    function updateMeal(group: string, idx: number, updates: Partial<MealItem>) {
      const next = { ...groups };
      next[group] = [...next[group]];
      next[group][idx] = { ...next[group][idx], ...updates };
      set("meal_groups", next);
    }

    function addMeal(group: string) {
      const next = { ...groups };
      next[group] = [
        ...next[group],
        { id: uid(), n: "", c: 0, p: 0, t: "" },
      ];
      set("meal_groups", next);
    }

    function removeMeal(group: string, idx: number) {
      const next = { ...groups };
      next[group] = next[group].filter((_, i) => i !== idx);
      set("meal_groups", next);
    }

    function addGroup() {
      const name = "group_" + uid();
      set("meal_groups", { ...groups, [name]: [] });
    }

    function removeGroup(group: string) {
      const next = { ...groups };
      delete next[group];
      set("meal_groups", next);
    }

    return (
      <div>
        <button type="button" onClick={addGroup} style={{ ...smallBtnStyle(COLORS.lime), marginBottom: 16 }}>
          + Add Group
        </button>
        {groupNames.length === 0 && (
          <div style={{ color: COLORS.dm, fontSize: 13, textAlign: "center", padding: 20 }}>
            No meal groups. Use template or add groups manually.
          </div>
        )}
        {groupNames.map((gName) => (
          <div
            key={gName}
            style={{
              background: COLORS.bg,
              border: "1px solid " + COLORS.bd,
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.org, fontFamily: FONT_MONO, textTransform: "uppercase", letterSpacing: 1 }}>
                {gName}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" onClick={() => addMeal(gName)} style={smallBtnStyle(COLORS.lime)}>
                  + Meal
                </button>
                <button type="button" onClick={() => removeGroup(gName)} style={removeBtnStyle}>
                  Remove Group
                </button>
              </div>
            </div>
            {groups[gName].map((meal, idx) => (
              <div
                key={meal.id}
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 6,
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  value={meal.n}
                  onChange={(e) => updateMeal(gName, idx, { n: e.target.value })}
                  placeholder="Name"
                  style={{ ...inputSmall, flex: 2 }}
                />
                <input
                  type="number"
                  value={meal.c || ""}
                  onChange={(e) => updateMeal(gName, idx, { c: Number(e.target.value) })}
                  placeholder="Cal"
                  style={{ ...inputSmall, width: 60, flex: "none" }}
                />
                <input
                  type="number"
                  value={meal.p || ""}
                  onChange={(e) => updateMeal(gName, idx, { p: Number(e.target.value) })}
                  placeholder="Pro"
                  style={{ ...inputSmall, width: 55, flex: "none" }}
                />
                <input
                  type="text"
                  value={meal.t}
                  onChange={(e) => updateMeal(gName, idx, { t: e.target.value })}
                  placeholder="Time"
                  style={{ ...inputSmall, width: 70, flex: "none" }}
                />
                <button type="button" onClick={() => removeMeal(gName, idx)} style={removeBtnStyle}>
                  X
                </button>
              </div>
            ))}
            {groups[gName].length === 0 && (
              <div style={{ color: COLORS.dm, fontSize: 12, textAlign: "center", padding: 8 }}>
                No meals in this group.
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ─── STEP 4: Dinner Recipes ─────────────────────────────────────
  function renderRecipes() {
    const recipes = state.dinner_recipes;

    function updateRecipe(idx: number, updates: Partial<DinnerRecipe>) {
      const next = [...recipes];
      next[idx] = { ...next[idx], ...updates };
      set("dinner_recipes", next);
    }

    function addRecipe() {
      set("dinner_recipes", [
        ...recipes,
        { i: recipes.length + 1, n: "", c: 0, p: 0, g: "Indian" },
      ]);
    }

    function removeRecipe(idx: number) {
      set(
        "dinner_recipes",
        recipes.filter((_, i) => i !== idx).map((r, i) => ({ ...r, i: i + 1 }))
      );
    }

    return (
      <div>
        <button type="button" onClick={addRecipe} style={{ ...smallBtnStyle(COLORS.lime), marginBottom: 16 }}>
          + Add Recipe
        </button>
        {recipes.length === 0 && (
          <div style={{ color: COLORS.dm, fontSize: 13, textAlign: "center", padding: 20 }}>
            No recipes. Use template or add manually.
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          {recipes.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "8px 0",
                borderBottom: "1px solid " + COLORS.bd,
                marginBottom: 6,
              }}
            >
              <span style={{ ...labelStyle, flex: 2, marginBottom: 0, fontSize: 10 }}>#</span>
              <span style={{ ...labelStyle, flex: 6, marginBottom: 0, fontSize: 10 }}>Name</span>
              <span style={{ ...labelStyle, flex: 2, marginBottom: 0, fontSize: 10 }}>Cal</span>
              <span style={{ ...labelStyle, flex: 2, marginBottom: 0, fontSize: 10 }}>Pro</span>
              <span style={{ ...labelStyle, flex: 3, marginBottom: 0, fontSize: 10 }}>Category</span>
              <span style={{ flex: "none", width: 36 }} />
            </div>
          )}
          {recipes.map((r, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 4,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  flex: 2,
                  fontSize: 12,
                  fontFamily: FONT_MONO,
                  color: COLORS.dm,
                  textAlign: "center",
                }}
              >
                {idx + 1}
              </span>
              <input
                type="text"
                value={r.n}
                onChange={(e) => updateRecipe(idx, { n: e.target.value })}
                placeholder="Recipe name"
                style={{ ...inputSmall, flex: 6 }}
              />
              <input
                type="number"
                value={r.c || ""}
                onChange={(e) => updateRecipe(idx, { c: Number(e.target.value) })}
                style={{ ...inputSmall, flex: 2 }}
              />
              <input
                type="number"
                value={r.p || ""}
                onChange={(e) => updateRecipe(idx, { p: Number(e.target.value) })}
                style={{ ...inputSmall, flex: 2 }}
              />
              <input
                type="text"
                value={r.g}
                onChange={(e) => updateRecipe(idx, { g: e.target.value })}
                placeholder="Category"
                style={{ ...inputSmall, flex: 3 }}
              />
              <button type="button" onClick={() => removeRecipe(idx)} style={{ ...removeBtnStyle, flex: "none" }}>
                X
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── STEP 5: Workouts & Activities ──────────────────────────────
  function renderWorkouts() {
    const workouts = state.workouts;
    const activities = state.activities;

    function updateWorkout(idx: number, updates: Partial<Workout>) {
      const next = [...workouts];
      next[idx] = { ...next[idx], ...updates };
      set("workouts", next);
    }
    function addWorkout() {
      set("workouts", [
        ...workouts,
        { id: uid(), d: "Mon", n: "", b: 0 },
      ]);
    }
    function removeWorkout(idx: number) {
      set("workouts", workouts.filter((_, i) => i !== idx));
    }

    function updateActivity(idx: number, updates: Partial<Activity>) {
      const next = [...activities];
      next[idx] = { ...next[idx], ...updates };
      set("activities", next);
    }
    function addActivity() {
      set("activities", [
        ...activities,
        { id: uid(), n: "", b: 0 },
      ]);
    }
    function removeActivity(idx: number) {
      set("activities", activities.filter((_, i) => i !== idx));
    }

    return (
      <div>
        {/* Workouts */}
        <div style={sectionTitle}>Workouts</div>
        <button type="button" onClick={addWorkout} style={{ ...smallBtnStyle(COLORS.lime), marginBottom: 12 }}>
          + Add Workout
        </button>
        {workouts.length === 0 && (
          <div style={{ color: COLORS.dm, fontSize: 13, textAlign: "center", padding: 16 }}>
            No workouts.
          </div>
        )}
        {workouts.map((w, idx) => (
          <div
            key={w.id}
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 6,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={w.n}
              onChange={(e) => updateWorkout(idx, { n: e.target.value })}
              placeholder="Name"
              style={{ ...inputSmall, flex: 3 }}
            />
            <select
              value={w.d}
              onChange={(e) => updateWorkout(idx, { d: e.target.value })}
              style={{ ...inputSmall, flex: 1, appearance: "auto" as React.CSSProperties["appearance"] }}
            >
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <input
              type="number"
              value={w.b || ""}
              onChange={(e) => updateWorkout(idx, { b: Number(e.target.value) })}
              placeholder="Burn"
              style={{ ...inputSmall, width: 70, flex: "none" }}
            />
            <button type="button" onClick={() => removeWorkout(idx)} style={removeBtnStyle}>
              X
            </button>
          </div>
        ))}

        {/* Activities */}
        <div style={{ ...sectionTitle, marginTop: 24 }}>Activities</div>
        <button type="button" onClick={addActivity} style={{ ...smallBtnStyle(COLORS.lime), marginBottom: 12 }}>
          + Add Activity
        </button>
        {activities.length === 0 && (
          <div style={{ color: COLORS.dm, fontSize: 13, textAlign: "center", padding: 16 }}>
            No activities.
          </div>
        )}
        {activities.map((a, idx) => (
          <div
            key={a.id}
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 6,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={a.n}
              onChange={(e) => updateActivity(idx, { n: e.target.value })}
              placeholder="Activity name"
              style={{ ...inputSmall, flex: 3 }}
            />
            <input
              type="number"
              value={a.b || ""}
              onChange={(e) => updateActivity(idx, { b: Number(e.target.value) })}
              placeholder="Burn"
              style={{ ...inputSmall, width: 70, flex: "none" }}
            />
            <button type="button" onClick={() => removeActivity(idx)} style={removeBtnStyle}>
              X
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ─── STEP 6: Supplements, Schedule, Rules, Grocery ──────────────
  function renderLists() {
    function renderStringList(
      label: string,
      items: string[],
      setItems: (val: string[]) => void,
      color: string
    ) {
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...sectionTitle, color, marginTop: 0 }}>{label}</div>
          <button
            type="button"
            onClick={() => setItems([...items, ""])}
            style={{ ...smallBtnStyle(color), marginBottom: 10 }}
          >
            + Add
          </button>
          {items.length === 0 && (
            <div style={{ color: COLORS.dm, fontSize: 12, textAlign: "center", padding: 8 }}>
              None added.
            </div>
          )}
          {items.map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = e.target.value;
                  setItems(next);
                }}
                style={{ ...inputSmall, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setItems(items.filter((_, i) => i !== idx))}
                style={removeBtnStyle}
              >
                X
              </button>
            </div>
          ))}
        </div>
      );
    }

    function renderSupplements() {
      const supps = state.supplements;
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...sectionTitle, color: COLORS.prp, marginTop: 0 }}>Supplements</div>
          <button
            type="button"
            onClick={() => set("supplements", [...supps, { id: uid(), n: "" }])}
            style={{ ...smallBtnStyle(COLORS.prp), marginBottom: 10 }}
          >
            + Add
          </button>
          {supps.length === 0 && (
            <div style={{ color: COLORS.dm, fontSize: 12, textAlign: "center", padding: 8 }}>
              None added.
            </div>
          )}
          {supps.map((s, idx) => (
            <div key={s.id} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}>
              <input
                type="text"
                value={s.n}
                onChange={(e) => {
                  const next = [...supps];
                  next[idx] = { ...next[idx], n: e.target.value };
                  set("supplements", next);
                }}
                placeholder="Supplement name"
                style={{ ...inputSmall, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => set("supplements", supps.filter((_, i) => i !== idx))}
                style={removeBtnStyle}
              >
                X
              </button>
            </div>
          ))}
        </div>
      );
    }

    function renderScheduleList() {
      const sched = state.schedule;
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...sectionTitle, color: COLORS.blue, marginTop: 0 }}>Schedule</div>
          <button
            type="button"
            onClick={() => set("schedule", [...sched, ["", ""]])}
            style={{ ...smallBtnStyle(COLORS.blue), marginBottom: 10 }}
          >
            + Add
          </button>
          {sched.length === 0 && (
            <div style={{ color: COLORS.dm, fontSize: 12, textAlign: "center", padding: 8 }}>
              None added.
            </div>
          )}
          {sched.map((entry, idx) => (
            <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}>
              <input
                type="text"
                value={entry[0] || ""}
                onChange={(e) => {
                  const next = [...sched];
                  next[idx] = [e.target.value, next[idx][1] || ""];
                  set("schedule", next);
                }}
                placeholder="Time"
                style={{ ...inputSmall, width: 70, flex: "none" }}
              />
              <input
                type="text"
                value={entry[1] || ""}
                onChange={(e) => {
                  const next = [...sched];
                  next[idx] = [next[idx][0] || "", e.target.value];
                  set("schedule", next);
                }}
                placeholder="Activity"
                style={{ ...inputSmall, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => set("schedule", sched.filter((_, i) => i !== idx))}
                style={removeBtnStyle}
              >
                X
              </button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div>
        {renderSupplements()}
        {renderScheduleList()}
        {renderStringList("Rules", state.rules, (val) => set("rules", val), COLORS.red)}
        {renderStringList("Grocery List", state.grocery, (val) => set("grocery", val), COLORS.org)}
      </div>
    );
  }

  // ─── STEP 7: Review ─────────────────────────────────────────────
  function renderReview() {
    const totalMeals = Object.values(state.meal_groups).reduce((s, g) => s + g.length, 0);

    function ReviewRow({ label, value }: { label: string; value: string | number }) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            borderBottom: "1px solid " + COLORS.bd,
          }}
        >
          <span style={{ fontSize: 13, color: COLORS.mt }}>{label}</span>
          <span style={{ fontSize: 13, color: COLORS.tx, fontFamily: FONT_MONO, fontWeight: 700 }}>{value}</span>
        </div>
      );
    }

    return (
      <div>
        <div
          style={{
            background: COLORS.bg,
            border: "1px solid " + COLORS.bd,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <ReviewRow label="Cut Name" value={state.name || "Untitled"} />
          <ReviewRow label="Dates" value={state.start_date + " to " + state.end_date} />
          <ReviewRow label="Duration" value={totalDays + " days"} />
          <ReviewRow label="Weight" value={state.start_weight + " → " + state.target_weight + " kg"} />
          <ReviewRow label="Phases" value={state.phases.length} />
          <ReviewRow label="Milestones" value={state.milestones.length} />
          <ReviewRow label="Meal Groups" value={Object.keys(state.meal_groups).length} />
          <ReviewRow label="Total Meals" value={totalMeals} />
          <ReviewRow label="Recipes" value={state.dinner_recipes.length} />
          <ReviewRow label="Workouts" value={state.workouts.length} />
          <ReviewRow label="Activities" value={state.activities.length} />
          <ReviewRow label="Supplements" value={state.supplements.length} />
          <ReviewRow label="Schedule Items" value={state.schedule.length} />
          <ReviewRow label="Rules" value={state.rules.length} />
          <ReviewRow label="Grocery Items" value={state.grocery.length} />
        </div>

        <button
          type="button"
          onClick={() => onComplete(state)}
          disabled={!state.name || !state.start_weight || !state.target_weight}
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 12,
            border: "none",
            background: COLORS.lime,
            color: "#080808",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: FONT_SANS,
            opacity: !state.name || !state.start_weight || !state.target_weight ? 0.5 : 1,
          }}
        >
          Create Cut
        </button>
      </div>
    );
  }

  // ─── Render step content ────────────────────────────────────────
  function renderStep() {
    switch (step) {
      case 0: return renderBasics();
      case 1: return renderPhases();
      case 2: return renderMilestones();
      case 3: return renderMeals();
      case 4: return renderRecipes();
      case 5: return renderWorkouts();
      case 6: return renderLists();
      case 7: return renderReview();
      default: return null;
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        fontFamily: FONT_SANS,
      }}
    >
      {/* Step indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                fontFamily: FONT_MONO,
                background:
                  i === step
                    ? COLORS.lime
                    : i < step
                    ? COLORS.lime + "33"
                    : COLORS.bd,
                color:
                  i === step
                    ? "#080808"
                    : i < step
                    ? COLORS.lime
                    : COLORS.dm,
                border:
                  i === step
                    ? "2px solid " + COLORS.lime
                    : i < step
                    ? "2px solid " + COLORS.lime + "55"
                    : "2px solid " + COLORS.bd,
              }}
            >
              {i + 1}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                fontFamily: FONT_MONO,
                color: i === step ? COLORS.lime : COLORS.dm,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step title */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: COLORS.lime,
          marginBottom: 20,
          fontFamily: FONT_SANS,
        }}
      >
        {STEP_LABELS[step]}
      </div>

      {/* Content area */}
      <div
        style={{
          background: COLORS.cd,
          borderRadius: 16,
          border: "1px solid " + COLORS.bd,
          padding: 20,
          marginBottom: 20,
          minHeight: 200,
        }}
      >
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        {onCancel && step === 0 && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              border: "1px solid " + COLORS.bd,
              background: "transparent",
              color: COLORS.mt,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Cancel
          </button>
        )}
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              border: "1px solid " + COLORS.bd,
              background: "transparent",
              color: COLORS.mt,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Back
          </button>
        )}
        {step < STEP_LABELS.length - 1 && (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: COLORS.lime,
              color: "#080808",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
