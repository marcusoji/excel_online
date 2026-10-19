import type { GridData, Lesson, Level, LevelId } from "@/types";

function grid(cells: Record<string, string>): GridData {
  const g: GridData = {};
  for (const [cell, raw] of Object.entries(cells)) g[cell] = { raw };
  return g;
}

// ---------------------------------------------------------------------------
// Curriculum — a professional Excel course, taught one real task at a time.
//
// Every lesson is framed as a workplace job: a dataset you were handed, the
// figure someone asked you for, and the exact function a working analyst
// reaches for. The scaffolding (short steps, one idea each) is what makes it
// approachable — the content itself is adult, professional work.
// ---------------------------------------------------------------------------

const gridAndReferences: Lesson = {
  id: "l0-grid-and-references",
  levelId: "level-0",
  title: "The Grid, Cells & Cell References",
  tagline: "Learn the coordinate system every spreadsheet formula depends on.",
  brief:
    "You've been handed a small order sheet. Before you can calculate anything, you need fluency in the one thing every spreadsheet is built on: the cell reference. In this lesson you'll navigate a sheet, enter data, and write a formula that points at other cells by their address.",
  objectives: [
    "Select and enter data into a specific cell",
    "Write a formula that references other cells (B2*C2)",
    "Watch a dependent formula recalculate when its input changes",
  ],
  icon: "📋",
  xp: 25,
  estMinutes: 5,
  cols: 4,
  rows: 5,
  initialGrid: grid({
    A1: "Item",
    B1: "Qty",
    C1: "Unit Price",
    D1: "Line Total",
    A2: "Notebook",
    C2: "2.5",
  }),
  steps: [
    {
      id: "select-a-cell",
      objective: "Navigate the grid",
      instruction:
        "Every cell has an address — a column letter plus a row number. Select cell B2 (the Qty column, second row).",
      highlightCells: ["B2"],
      check: { type: "cell-selected", cell: "B2" },
      demo: [{ cell: "B2", pause: 600 }],
    },
    {
      id: "enter-a-value",
      objective: "Enter a value",
      instruction: "Enter a quantity of 20 units into B2, then confirm with ✓ or Enter.",
      hint: "Type the number directly — no equals sign needed for a plain value.",
      targetCell: "B2",
      highlightCells: ["B2"],
      check: { type: "value-equals", cell: "B2", expected: 20 },
      demo: [{ cell: "B2", type: "20", pause: 700 }],
    },
    {
      id: "write-a-formula",
      objective: "Reference other cells",
      instruction:
        "Now calculate the line total. Select D2 and enter =B2*C2 — a formula that multiplies the two cells you just referenced.",
      hint: "Every formula starts with =. B2 and C2 are cell references, not typed numbers — that's what makes a spreadsheet a spreadsheet.",
      targetCell: "D2",
      highlightCells: ["B2", "C2", "D2"],
      check: { type: "formula-result-equals", cell: "D2", expected: 50 },
      demo: [{ cell: "D2", type: "=B2*C2", pause: 1100 }],
    },
    {
      id: "recalculate",
      objective: "Recalculate automatically",
      instruction:
        "Change the unit price in C2 to 3 and watch the Line Total update itself — you never touched D2.",
      hint: "This is the core payoff of references: change an input once, and every dependent formula follows.",
      targetCell: "C2",
      highlightCells: ["C2", "D2"],
      check: { type: "formula-result-equals", cell: "D2", expected: 60 },
      demo: [{ cell: "C2", type: "3", pause: 900 }],
    },
  ],
  celebration: "You can navigate a sheet and wire cells together with references — the foundation for everything else.",
};

const firstFormulas: Lesson = {
  id: "l0-first-formulas",
  levelId: "level-0",
  title: "Formulas & Operator Precedence",
  tagline: "Build a pricing model and control exactly how Excel evaluates it.",
  brief:
    "A product manager needs a selling price derived from a base cost and a markup percentage. You'll build it in two formulas, then prove you understand operator precedence — the order in which Excel performs arithmetic — by using parentheses deliberately.",
  objectives: [
    "Use the arithmetic operators * and + in formulas",
    "Control evaluation order with parentheses",
    "Model a business calculation that updates from its inputs",
  ],
  icon: "➗",
  xp: 30,
  estMinutes: 6,
  cols: 2,
  rows: 5,
  initialGrid: grid({
    A1: "Input",
    B1: "Value",
    A2: "Base cost",
    B2: "250",
    A3: "Markup %",
    B3: "0.2",
    A4: "Markup $",
    A5: "Selling price",
  }),
  steps: [
    {
      id: "markup-amount",
      objective: "Multiply two cells",
      instruction: "Select B4 and enter =B2*B3 to calculate the markup amount.",
      hint: "250 × 0.2 = 50. The formula reads directly from the two input cells.",
      targetCell: "B4",
      highlightCells: ["B2", "B3", "B4"],
      check: { type: "formula-result-equals", cell: "B4", expected: 50 },
      demo: [{ cell: "B4", type: "=B2*B3", pause: 1000 }],
    },
    {
      id: "selling-price",
      objective: "Control evaluation order",
      instruction:
        "Select B5 and enter =B2*(1+B3) to build the selling price. The parentheses force Excel to add first, then multiply.",
      hint: "Without parentheses, =B2*1+B3 would multiply before adding and give the wrong answer. Precedence matters.",
      targetCell: "B5",
      highlightCells: ["B2", "B3", "B5"],
      check: { type: "formula-result-equals", cell: "B5", expected: 300 },
      demo: [{ cell: "B5", type: "=B2*(1+B3)", pause: 1200 }],
    },
    {
      id: "stress-test",
      objective: "Test the model",
      instruction:
        "Stress-test the model: change the markup in B3 to 0.25 and confirm the selling price recalculates to 312.5.",
      hint: "A well-built model has a single input that drives every dependent formula.",
      targetCell: "B3",
      highlightCells: ["B3", "B5"],
      check: { type: "formula-result-equals", cell: "B5", expected: 312.5 },
      demo: [{ cell: "B3", type: "0.25", pause: 900 }],
    },
  ],
  celebration: "You built a live pricing model and controlled evaluation order — real modelling discipline.",
};

const sumAndRanges: Lesson = {
  id: "l0-sum-and-ranges",
  levelId: "level-0",
  title: "SUM & Ranges: Totalling a Column",
  tagline: "Aggregate a whole column in one function — and keep it live.",
  brief:
    "Quarterly spend is broken out by category. Rather than adding cells one by one, you'll total the column with SUM over a range, then update an input and watch the total hold itself correct. This is the single most-used function in business spreadsheets.",
  objectives: [
    "Aggregate a range of cells with SUM",
    "Understand a range as a rectangle of cells (B2:B5)",
    "Keep a total live as its source data changes",
  ],
  icon: "🧮",
  xp: 30,
  estMinutes: 6,
  cols: 2,
  rows: 6,
  initialGrid: grid({
    A1: "Category",
    B1: "Q1 Spend",
    A2: "Software",
    B2: "4200",
    A3: "Hardware",
    B3: "1850",
    A4: "Travel",
    B4: "640",
    A5: "Training",
    B5: "900",
    A6: "Total",
  }),
  steps: [
    {
      id: "read-the-range",
      objective: "Read a range",
      instruction:
        "Column B holds one spend figure per category. The range B2:B5 covers all four — read it before you aggregate it.",
      highlightRange: { start: "B2", end: "B5" },
      check: { type: "auto" },
    },
    {
      id: "sum-the-range",
      objective: "Aggregate with SUM",
      instruction: "Select B6 and enter =SUM(B2:B5) to total the quarter in a single function.",
      hint: "SUM adds every numeric cell inside the range and ignores anything non-numeric.",
      targetCell: "B6",
      highlightRange: { start: "B2", end: "B5" },
      check: { type: "formula-contains", cell: "B6", mustInclude: ["SUM(B2:B5)"] },
      demo: [{ cell: "B6", type: "=SUM(B2:B5)", pause: 1200 }],
    },
    {
      id: "keep-it-live",
      objective: "Keep the total live",
      instruction:
        "Hardware came in over budget — change B3 to 2100 and confirm the total updates to 7840 without editing B6.",
      targetCell: "B3",
      highlightCells: ["B3", "B6"],
      check: { type: "formula-result-equals", cell: "B6", expected: 7840 },
      demo: [{ cell: "B3", type: "2100", pause: 1000 }],
    },
  ],
  celebration: "You aggregated a column with SUM and kept it live — the workhorse of every financial sheet.",
};

// ---------------------------------------------------------------------------
// Level 1 — Data Literacy & Core Functions
// ---------------------------------------------------------------------------

const coreStatistics: Lesson = {
  id: "l1-core-statistics",
  levelId: "level-1",
  title: "Core Statistics: AVERAGE, MIN, MAX, COUNT",
  tagline: "Turn a column of numbers into the five figures a manager asks for.",
  brief:
    "You have a week of team productivity data and a stand-up meeting in five minutes. You need the total, the average, the best, the worst, and the headcount — all from the same column. This is the standard summary block you'll rebuild in almost every dataset you touch.",
  objectives: [
    "Aggregate with SUM and AVERAGE",
    "Find the top and bottom of a range with MAX and MIN",
    "Count numeric entries with COUNT",
  ],
  icon: "📊",
  xp: 40,
  estMinutes: 8,
  cols: 2,
  rows: 11,
  initialGrid: grid({
    A1: "Rep",
    B1: "Tickets Closed",
    A2: "Dana",
    B2: "34",
    A3: "Luis",
    B3: "41",
    A4: "Priya",
    B4: "28",
    A5: "Sam",
    B5: "37",
    A6: "Mei",
    B6: "30",
    A7: "Total",
    A8: "Average",
    A9: "Max",
    A10: "Min",
    A11: "Reps",
  }),
  steps: [
    {
      id: "total",
      objective: "Aggregate with SUM",
      instruction: "Select B7 and enter =SUM(B2:B6) to total the team's closed tickets.",
      targetCell: "B7",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-result-equals", cell: "B7", expected: 170 },
      demo: [{ cell: "B7", type: "=SUM(B2:B6)", pause: 1000 }],
    },
    {
      id: "average",
      objective: "Average a range",
      instruction: "Select B8 and enter =AVERAGE(B2:B6) for the mean tickets per rep.",
      hint: "AVERAGE divides the total by the count of numeric cells — 170 ÷ 5 = 34.",
      targetCell: "B8",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-result-equals", cell: "B8", expected: 34 },
      demo: [{ cell: "B8", type: "=AVERAGE(B2:B6)", pause: 1000 }],
    },
    {
      id: "max",
      objective: "Find the maximum",
      instruction: "Select B9 and enter =MAX(B2:B6) to surface the top performer's figure.",
      targetCell: "B9",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-result-equals", cell: "B9", expected: 41 },
      demo: [{ cell: "B9", type: "=MAX(B2:B6)", pause: 900 }],
    },
    {
      id: "min",
      objective: "Find the minimum",
      instruction: "Select B10 and enter =MIN(B2:B6) to flag the lowest figure.",
      targetCell: "B10",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-result-equals", cell: "B10", expected: 28 },
      demo: [{ cell: "B10", type: "=MIN(B2:B6)", pause: 900 }],
    },
    {
      id: "count",
      objective: "Count numeric cells",
      instruction: "Select B11 and enter =COUNT(B2:B6) to confirm how many reps contributed data.",
      hint: "COUNT counts numeric cells only — useful for spotting gaps in a dataset.",
      targetCell: "B11",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-result-equals", cell: "B11", expected: 5 },
      demo: [{ cell: "B11", type: "=COUNT(B2:B6)", pause: 900 }],
    },
  ],
  celebration: "You produced the full summary block — total, average, max, min, and count — from one column.",
};

const relativeFill: Lesson = {
  id: "l1-relative-fill",
  levelId: "level-1",
  title: "Relative References & the Fill Handle",
  tagline: "Write one formula, then copy it down a whole column correctly.",
  brief:
    "Revenue is tracked by month, and finance wants a cumulative (running) total. The professional move is to write the pattern once and let the fill handle copy it down — which only works because references shift relative to each row. Understanding that shift is the difference between a formula and a bug.",
  objectives: [
    "Build a running total with a self-referencing formula",
    "Copy a formula down with the fill handle",
    "Explain how relative references shift per row",
  ],
  icon: "⤓",
  xp: 40,
  estMinutes: 8,
  cols: 3,
  rows: 5,
  initialGrid: grid({
    A1: "Month",
    B1: "Revenue",
    C1: "Cumulative",
    A2: "Jan",
    B2: "12000",
    A3: "Feb",
    B3: "15000",
    A4: "Mar",
    B4: "11000",
    A5: "Apr",
    B5: "18500",
  }),
  steps: [
    {
      id: "read-revenue",
      objective: "Read the data",
      instruction: "Column B holds monthly revenue. We'll build a cumulative column in C, month by month.",
      highlightRange: { start: "B2", end: "B5" },
      check: { type: "auto" },
    },
    {
      id: "seed-the-total",
      objective: "Seed the running total",
      instruction: "Select C2 and enter =B2 — the running total starts with January's revenue.",
      targetCell: "C2",
      highlightCells: ["B2", "C2"],
      check: { type: "formula-result-equals", cell: "C2", expected: 12000 },
      demo: [{ cell: "C2", type: "=B2", pause: 800 }],
    },
    {
      id: "add-next-month",
      objective: "Add to the previous total",
      instruction: "Select C3 and enter =C2+B3 — last month's cumulative total plus this month's revenue.",
      hint: 'A running total is always "the row above" plus "this row\'s amount".',
      targetCell: "C3",
      highlightCells: ["C2", "B3", "C3"],
      check: { type: "formula-result-equals", cell: "C3", expected: 27000 },
      demo: [{ cell: "C3", type: "=C2+B3", pause: 1100 }],
    },
    {
      id: "fill-march",
      objective: "Fill the pattern down",
      instruction:
        "Select C3, then use ⤓ Fill Down. Excel copies the formula to C4 and shifts every relative reference down one row for you.",
      hint: "That shift — C2+B3 becoming C3+B4 — is exactly what relative references are for.",
      highlightCells: ["C3", "C4"],
      check: { type: "formula-result-equals", cell: "C4", expected: 38000 },
    },
    {
      id: "finish-april",
      objective: "Complete the series",
      instruction: "Finish the series: select C5 and enter =C4+B5 for April's cumulative total.",
      targetCell: "C5",
      highlightCells: ["C4", "B5", "C5"],
      check: { type: "formula-result-equals", cell: "C5", expected: 56500 },
      demo: [{ cell: "C5", type: "=C4+B5", pause: 1000 }],
    },
  ],
  celebration: "You built a running total and let the fill handle do the repeating — with references that shift correctly.",
};

const ifAndReporting: Lesson = {
  id: "l1-if-and-reporting",
  levelId: "level-1",
  title: "Logic with IF & Live Reporting",
  tagline: "Classify rows automatically and drive a chart from the result.",
  brief:
    "An operations dashboard needs to flag each region as within or breaching its uptime SLA. You'll write one IF formula, fill it down, and watch a live chart built from the same data update as your classification lands. This is how conditional logic feeds reporting.",
  objectives: [
    "Classify data with the IF function",
    "Compare values with a logical operator (>=)",
    "Fill logic down a column and drive a live chart",
  ],
  icon: "🧭",
  xp: 40,
  estMinutes: 8,
  cols: 3,
  rows: 5,
  initialGrid: grid({
    A1: "Region",
    B1: "Uptime %",
    C1: "SLA Status",
    A2: "North",
    B2: "99.2",
    A3: "South",
    B3: "97.4",
    A4: "East",
    B4: "99.8",
    A5: "West",
    B5: "98.1",
  }),
  liveChart: {
    title: "Uptime by Region",
    rows: [
      { label: "A2", value: "B2" },
      { label: "A3", value: "B3" },
      { label: "A4", value: "B4" },
      { label: "A5", value: "B5" },
    ],
    showFromStepIndex: 2,
    color: "#3FA9EA",
  },
  steps: [
    {
      id: "read-uptime",
      objective: "Read the metrics",
      instruction: "Each region has an uptime percentage. Our SLA target is 98% — anything below that is a breach.",
      highlightRange: { start: "B2", end: "B5" },
      check: { type: "auto" },
    },
    {
      id: "classify-north",
      objective: "Write an IF test",
      instruction: 'Select C2 and enter =IF(B2>=98,"Within SLA","Breach") to classify North automatically.',
      hint: "IF takes three parts: a test, the answer if it's true, and the answer if it's false.",
      targetCell: "C2",
      highlightCells: ["B2", "C2"],
      check: { type: "formula-contains", cell: "C2", mustInclude: ["IF(B2>=98"] },
      demo: [{ cell: "C2", type: '=IF(B2>=98,"Within SLA","Breach")', pause: 1300 }],
    },
    {
      id: "fill-the-rule",
      objective: "Apply the rule down",
      instruction: "Select C2, then use ⤓ Fill Down to classify South — the test shifts to row 3 on its own.",
      highlightCells: ["C2", "C3"],
      check: { type: "formula-text-equals", cell: "C3", expected: "Breach" },
    },
    {
      id: "read-the-chart",
      objective: "Read the live report",
      instruction: "The chart below is built from the same cells and updates with the data — no chart rebuild required.",
      check: { type: "auto" },
    },
  ],
  celebration: "You added conditional logic and fed a live report — the pattern behind every status dashboard.",
};

// ---------------------------------------------------------------------------
// Level 2 — Data Integrity & Lookups
// ---------------------------------------------------------------------------

const absoluteReferences: Lesson = {
  id: "l2-absolute-references",
  levelId: "level-2",
  title: "Absolute vs. Relative References",
  tagline: "Anchor a single rate so it survives every copy down.",
  brief:
    "You have a price list and one tax rate that applies to every product. If you write the formula carelessly, the reference to the rate breaks the moment you copy it down. The $ lock is what makes a shared input stay put — a classic source of spreadsheet errors, and a classic interview question.",
  objectives: [
    "Write a formula that references a shared input",
    "Lock a reference with $ (absolute vs. relative)",
    "Fill the formula down without breaking the anchor",
  ],
  icon: "🔒",
  xp: 45,
  estMinutes: 9,
  cols: 3,
  rows: 6,
  initialGrid: grid({
    A1: "Tax Rate",
    B1: "0.0825",
    A3: "Product",
    B3: "Net Price",
    C3: "Gross Price",
    A4: "Starter Plan",
    B4: "49",
    A5: "Pro Plan",
    B5: "129",
    A6: "Enterprise",
    B6: "499",
  }),
  steps: [
    {
      id: "read-the-rate",
      objective: "Identify the shared input",
      instruction: "B1 holds the tax rate (8.25%) and applies to every product below — we never want to retype it.",
      highlightCells: ["B1"],
      check: { type: "auto" },
    },
    {
      id: "gross-starter",
      objective: "Lock a reference with $",
      instruction: "Select C4 and enter =B4*(1+$B$1) to gross up the Starter Plan using the locked rate.",
      hint: "The $ signs make B1 absolute — it stays pointed at B1 no matter where this formula is copied.",
      targetCell: "C4",
      highlightCells: ["B1", "B4", "C4"],
      check: { type: "formula-result-equals", cell: "C4", expected: 53.04 },
      demo: [{ cell: "C4", type: "=B4*(1+$B$1)", pause: 1400 }],
    },
    {
      id: "fill-pro",
      objective: "Fill down, keeping the lock",
      instruction: "Select C4, then use ⤓ Fill Down for the Pro Plan. Notice $B$1 didn't move.",
      highlightCells: ["C4", "C5"],
      check: { type: "formula-result-equals", cell: "C5", expected: 139.64 },
    },
    {
      id: "fill-enterprise",
      objective: "Complete the column",
      instruction: "Select C5 and Fill Down once more for Enterprise. The relative B reference shifts; the locked rate holds.",
      highlightCells: ["C5", "C6"],
      check: { type: "formula-result-equals", cell: "C6", expected: 540.17 },
    },
  ],
  celebration: "You anchored a shared input with an absolute reference — the fix for the most common copying bug in Excel.",
};

const conditionalAggregation: Lesson = {
  id: "l2-conditional-aggregation",
  levelId: "level-2",
  title: "Conditional Aggregation: COUNTIF & SUMIF",
  tagline: "Count and total only the rows that meet a condition.",
  brief:
    "You're reviewing an incident log and the post-mortem needs two numbers: how many Sev1 incidents there were, and the total downtime they caused. Both require aggregating a subset of rows — exactly what COUNTIF and SUMIF are for. You'll also use Data Validation so severity values stay consistent enough to be counted reliably.",
  objectives: [
    "Enforce consistent entries with Data Validation",
    "Count matching rows with COUNTIF",
    "Sum a different column where a condition matches, with SUMIF",
  ],
  icon: "🔍",
  xp: 45,
  estMinutes: 9,
  cols: 3,
  rows: 9,
  initialGrid: grid({
    A1: "Incident",
    B1: "Severity",
    C1: "Downtime (min)",
    A2: "INC-1041",
    C2: "45",
    A3: "INC-1042",
    C3: "30",
    A4: "INC-1043",
    C4: "15",
    A5: "INC-1044",
    C5: "60",
    A6: "INC-1045",
    C6: "20",
    A8: "Sev1 incidents:",
    A9: "Sev1 downtime (min):",
  }),
  validationLists: {
    B2: ["Sev1", "Sev2", "Sev3"],
    B3: ["Sev1", "Sev2", "Sev3"],
    B4: ["Sev1", "Sev2", "Sev3"],
    B5: ["Sev1", "Sev2", "Sev3"],
    B6: ["Sev1", "Sev2", "Sev3"],
  },
  steps: [
    {
      id: "sev-inc-1041",
      objective: "Enforce valid entries",
      instruction: "Select B2 and choose Sev1 from the dropdown — Data Validation keeps every severity consistent.",
      targetCell: "B2",
      highlightCells: ["B2"],
      check: { type: "value-equals", cell: "B2", expected: "Sev1" },
      demo: [{ cell: "B2", type: "Sev1", pause: 700 }],
    },
    {
      id: "sev-inc-1042",
      objective: "Apply the same rule",
      instruction: "Select B3 and choose Sev1.",
      targetCell: "B3",
      highlightCells: ["B3"],
      check: { type: "value-equals", cell: "B3", expected: "Sev1" },
      demo: [{ cell: "B3", type: "Sev1", pause: 600 }],
    },
    {
      id: "sev-inc-1043",
      objective: "Classify a Sev2",
      instruction: "Select B4 and choose Sev2.",
      targetCell: "B4",
      highlightCells: ["B4"],
      check: { type: "value-equals", cell: "B4", expected: "Sev2" },
      demo: [{ cell: "B4", type: "Sev2", pause: 600 }],
    },
    {
      id: "sev-inc-1044",
      objective: "Classify a Sev3",
      instruction: "Select B5 and choose Sev3.",
      targetCell: "B5",
      highlightCells: ["B5"],
      check: { type: "value-equals", cell: "B5", expected: "Sev3" },
      demo: [{ cell: "B5", type: "Sev3", pause: 600 }],
    },
    {
      id: "sev-inc-1045",
      objective: "Finish the log",
      instruction: "Select B6 and choose Sev2.",
      targetCell: "B6",
      highlightCells: ["B6"],
      check: { type: "value-equals", cell: "B6", expected: "Sev2" },
      demo: [{ cell: "B6", type: "Sev2", pause: 600 }],
    },
    {
      id: "count-sev1",
      objective: "Count matching rows",
      instruction: 'Select B8 and enter =COUNTIF(B2:B6,"Sev1") to count how many incidents were Sev1.',
      hint: "COUNTIF scans the range and counts cells equal to the criteria.",
      targetCell: "B8",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-contains", cell: "B8", mustInclude: ['COUNTIF(B2:B6,"Sev1")'] },
      demo: [{ cell: "B8", type: '=COUNTIF(B2:B6,"Sev1")', pause: 1200 }],
    },
    {
      id: "sum-sev1-downtime",
      objective: "Sum a conditional subset",
      instruction: 'Select B9 and enter =SUMIF(B2:B6,"Sev1",C2:C6) to total the downtime caused by Sev1 incidents only.',
      hint: "SUMIF checks the severity column, then adds the matching rows from the downtime column.",
      targetCell: "B9",
      highlightRange: { start: "C2", end: "C6" },
      check: { type: "formula-contains", cell: "B9", mustInclude: ['SUMIF(B2:B6,"Sev1",C2:C6)'] },
      demo: [{ cell: "B9", type: '=SUMIF(B2:B6,"Sev1",C2:C6)', pause: 1400 }],
    },
  ],
  celebration: "You produced the two figures a post-mortem leads with — count and impact — using COUNTIF and SUMIF.",
};

const lookupAndTables: Lesson = {
  id: "l2-lookup-and-tables",
  levelId: "level-2",
  title: "XLOOKUP, Tables & Conditional Formatting",
  tagline: "Resolve a value from a reference table, and make outliers obvious.",
  brief:
    "A pricing sheet lists SKUs and unit prices. Downstream, other sheets will look values up by SKU rather than hard-code prices. You'll set up the table, add conditional formatting that flags anything over $10, and write the XLOOKUP that resolves a price from a SKU — the modern replacement for VLOOKUP.",
  objectives: [
    "Recognise an Excel Table and what Freeze Panes does",
    "Highlight outliers with Conditional Formatting",
    "Resolve a value from a table with XLOOKUP",
  ],
  icon: "🧙",
  xp: 50,
  estMinutes: 10,
  cols: 4,
  rows: 6,
  initialGrid: grid({
    A1: "SKU",
    B1: "Unit Price",
    C1: "Lookup SKU:",
    D1: "Resolved Price:",
    A2: "SKU-1001",
    B2: "4",
    A3: "SKU-1002",
    B3: "8",
    A4: "SKU-1003",
    B4: "25",
    A5: "SKU-1004",
    B5: "2",
    A6: "SKU-1005",
    B6: "1",
  }),
  bandedRange: { start: "A2", end: "B6" },
  conditionalFormats: [{ range: { start: "B2", end: "B6" }, operator: ">=", threshold: 10, color: "#FFE59A" }],
  validationLists: {
    C2: ["SKU-1001", "SKU-1002", "SKU-1003", "SKU-1004", "SKU-1005"],
  },
  steps: [
    {
      id: "read-the-table",
      objective: "Read a structured table",
      instruction:
        "This is a product table: banded rows and a header that stays visible as you scroll — the effect Freeze Panes gives you in desktop Excel.",
      highlightRange: { start: "A1", end: "B6" },
      check: { type: "auto" },
    },
    {
      id: "spot-the-outlier",
      objective: "Flag outliers automatically",
      instruction:
        "SKU-1003 is already tinted — Conditional Formatting is highlighting anything priced $10 or more, without any manual colouring.",
      highlightCells: ["B4"],
      check: { type: "auto" },
    },
    {
      id: "choose-a-sku",
      objective: "Drive a lookup input",
      instruction: "Select C2 and choose SKU-1003 from the dropdown — that will be our lookup key.",
      targetCell: "C2",
      highlightCells: ["C2"],
      check: { type: "value-equals", cell: "C2", expected: "SKU-1003" },
      demo: [{ cell: "C2", type: "SKU-1003", pause: 700 }],
    },
    {
      id: "resolve-price",
      objective: "Resolve a value with XLOOKUP",
      instruction: "Select D2 and enter =XLOOKUP(C2,A2:A6,B2:B6) to resolve the price for the chosen SKU.",
      hint: "XLOOKUP searches C2's value in the SKU column, then returns the value from the same position in the price column.",
      targetCell: "D2",
      highlightCells: ["C2"],
      highlightRange: { start: "A2", end: "B6" },
      check: { type: "formula-result-equals", cell: "D2", expected: 25 },
      demo: [{ cell: "D2", type: "=XLOOKUP(C2,A2:A6,B2:B6)", pause: 1400 }],
    },
  ],
  celebration: "You resolved a value from a reference table with XLOOKUP — the lookup you'll write most in real workbooks.",
};

// ---------------------------------------------------------------------------
// Level 3 — Business Analysis
// ---------------------------------------------------------------------------

const nestedLogicProtection: Lesson = {
  id: "l3-nested-logic-protection",
  levelId: "level-3",
  title: "Nested Logic & Input Protection",
  tagline: "Band a roster with layered IFs against protected source data.",
  brief:
    "Performance review season: attainment scores are locked (as they would be with sheet protection) and you must band each employee into Exceeds / Meets / Below. That needs a nested IF — one decision layered inside another — written once and filled down the roster.",
  objectives: [
    "Understand how Protect Sheet guards source data",
    "Write a nested IF for multi-tier logic",
    "Fill a nested formula down a column",
  ],
  icon: "🛡️",
  xp: 50,
  estMinutes: 9,
  cols: 3,
  rows: 5,
  initialGrid: grid({
    A1: "Employee",
    B1: "Attainment %",
    C1: "Band",
    A2: "Omar",
    B2: "95",
    A3: "Zara",
    B3: "82",
    A4: "Kai",
    B4: "71",
    A5: "Mia",
    B5: "58",
  }),
  steps: [
    {
      id: "notice-protection",
      objective: "Recognise protected inputs",
      instruction:
        "The Attainment column is read-only — in desktop Excel that's Protect Sheet, stopping accidental edits to source figures.",
      highlightRange: { start: "B2", end: "B5" },
      check: { type: "auto" },
    },
    {
      id: "band-omar",
      objective: "Write nested IF logic",
      instruction: 'Select C2 and enter =IF(B2>=90,"Exceeds",IF(B2>=80,"Meets","Below")) to band Omar.',
      hint: "The second IF sits inside the first one's false branch, so it only runs when the first test fails.",
      targetCell: "C2",
      highlightCells: ["B2", "C2"],
      check: { type: "formula-text-equals", cell: "C2", expected: "Exceeds" },
      demo: [{ cell: "C2", type: '=IF(B2>=90,"Exceeds",IF(B2>=80,"Meets","Below"))', pause: 1500 }],
    },
    {
      id: "band-zara",
      objective: "Fill nested logic down",
      instruction: "Select C2, then ⤓ Fill Down to band Zara automatically.",
      highlightCells: ["C2", "C3"],
      check: { type: "formula-text-equals", cell: "C3", expected: "Meets" },
    },
    {
      id: "band-kai",
      objective: "Continue the fill",
      instruction: "Select C3 and Fill Down for Kai.",
      highlightCells: ["C3", "C4"],
      check: { type: "formula-text-equals", cell: "C4", expected: "Below" },
    },
    {
      id: "band-mia",
      objective: "Complete the roster",
      instruction: "Select C4 and Fill Down one last time for Mia.",
      highlightCells: ["C4", "C5"],
      check: { type: "formula-text-equals", cell: "C5", expected: "Below" },
    },
  ],
  celebration: "You banded an entire roster with one nested formula — and left the protected source data untouched.",
};

const namedRanges: Lesson = {
  id: "l3-named-ranges",
  levelId: "level-3",
  title: "Named Ranges & Readable Formulas",
  tagline: "Give a range a name and make every formula self-documenting.",
  brief:
    "On a large workbook, =SUM(B2:B6) tells a reviewer nothing. Naming that range Revenue turns the same formula into something that reads like plain English — and protects against the range drifting when rows are inserted. This is the single highest-leverage readability habit in Excel.",
  objectives: [
    "Understand what a named range is and why it helps",
    "Use a name inside aggregate functions",
    "Write formulas that document their own intent",
  ],
  icon: "🏷️",
  xp: 45,
  estMinutes: 7,
  cols: 2,
  rows: 8,
  initialGrid: grid({
    A1: "Region",
    B1: "Revenue",
    A2: "North",
    B2: "1200",
    A3: "South",
    B3: "950",
    A4: "East",
    B4: "1400",
    A5: "West",
    B5: "1100",
    A6: "Central",
    B6: "750",
    A7: "Total (Revenue)",
    A8: "Average (Revenue)",
  }),
  namedRanges: { Revenue: "B2:B6" },
  steps: [
    {
      id: "read-the-name",
      objective: "Inspect the named range",
      instruction:
        'The range B2:B6 has been named "Revenue" — formulas can now refer to it by name instead of by cell addresses.',
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "auto" },
    },
    {
      id: "sum-the-name",
      objective: "Use a name in SUM",
      instruction: "Select B7 and enter =SUM(Revenue) to total all regions using the name.",
      hint: '"Revenue" already means B2:B6, so the formula reads almost like a sentence.',
      targetCell: "B7",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-result-equals", cell: "B7", expected: 5400 },
      demo: [{ cell: "B7", type: "=SUM(Revenue)", pause: 1000 }],
    },
    {
      id: "average-the-name",
      objective: "Reuse the name",
      instruction: "Select B8 and enter =AVERAGE(Revenue) to find the regional average from the same name.",
      targetCell: "B8",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-result-equals", cell: "B8", expected: 1080 },
      demo: [{ cell: "B8", type: "=AVERAGE(Revenue)", pause: 1000 }],
    },
  ],
  celebration: "One name, reusable everywhere — that's how analysts keep large workbooks readable.",
};

const pivotAndSparkline: Lesson = {
  id: "l3-pivot-and-sparkline",
  levelId: "level-3",
  title: "Grouping Data: Pivot & Sparkline Dashboard",
  tagline: "Summarise raw transactions and read a trend in a single cell.",
  brief:
    "You have a list of raw transactions — no structure, just rows. Before presenting, you total them, then group them by region the way a PivotTable does, and finish with a sparkline that shows the weekly trend at a glance. This is the assembly line of a one-page dashboard.",
  objectives: [
    "Total a raw dataset with SUM",
    "Group and aggregate by category (the PivotTable idea)",
    "Read a trend from an in-cell sparkline",
  ],
  icon: "📈",
  xp: 50,
  estMinutes: 9,
  cols: 5,
  rows: 9,
  initialGrid: grid({
    A1: "Region",
    B1: "Amount",
    A2: "North",
    B2: "5000",
    A3: "South",
    B3: "3000",
    A4: "North",
    B4: "2000",
    A5: "East",
    B5: "4000",
    A6: "South",
    B6: "2500",
    A7: "East",
    B7: "1500",
    A8: "Total",
    A9: "Weekly Sessions",
    B9: "1200",
    C9: "1500",
    D9: "900",
    E9: "1800",
  }),
  customPanel: [
    {
      kind: "pivot",
      showFromStepIndex: 2,
      title: "Sales by Region",
      groupLabel: "Region",
      valueLabel: "Amount",
      rows: [
        { groupCell: "A2", valueCell: "B2" },
        { groupCell: "A3", valueCell: "B3" },
        { groupCell: "A4", valueCell: "B4" },
        { groupCell: "A5", valueCell: "B5" },
        { groupCell: "A6", valueCell: "B6" },
        { groupCell: "A7", valueCell: "B7" },
      ],
    },
    { kind: "sparkline", showFromStepIndex: 3, title: "Weekly Sessions Trend", valueCells: ["B9", "C9", "D9", "E9"] },
  ],
  steps: [
    {
      id: "read-raw-data",
      objective: "Read unstructured data",
      instruction:
        "Six raw transactions across three regions, in no particular order — the state most exported data arrives in.",
      highlightRange: { start: "A2", end: "B7" },
      check: { type: "auto" },
    },
    {
      id: "total-the-data",
      objective: "Total the dataset",
      instruction: "Select B8 and enter =SUM(B2:B7) to total every transaction.",
      targetCell: "B8",
      highlightRange: { start: "B2", end: "B7" },
      check: { type: "formula-result-equals", cell: "B8", expected: 18000 },
      demo: [{ cell: "B8", type: "=SUM(B2:B7)", pause: 1000 }],
    },
    {
      id: "reveal-pivot",
      objective: "Group by category",
      instruction:
        "The panel below groups every transaction by region and totals each group — the same group-then-aggregate idea a PivotTable automates.",
      check: { type: "auto" },
    },
    {
      id: "reveal-sparkline",
      objective: "Read a trend at a glance",
      instruction: "Weekly Sessions is rendered as a sparkline — a whole trend inside one cell, no chart object required.",
      highlightRange: { start: "B9", end: "E9" },
      check: { type: "auto" },
    },
  ],
  celebration: "You built the spine of a dashboard: a total, a grouped summary, and a trend line.",
};

// ---------------------------------------------------------------------------
// Level 4 — Professional Tooling & Automation
// ---------------------------------------------------------------------------

const dataCleanup: Lesson = {
  id: "l4-data-cleanup",
  levelId: "level-4",
  title: "Cleaning Messy Data: TRIM & PROPER",
  tagline: "Normalise a messy import with composable text functions.",
  brief:
    "A CSV import has landed with stray spaces and inconsistent capitalisation — the exact mess that breaks lookups and grouping downstream. You'll clean it with TRIM and PROPER, then fill the fix down. This is the manual version of what Power Query automates at scale, and understanding it makes Power Query far less magical.",
  objectives: [
    "Remove stray whitespace with TRIM",
    "Normalise capitalisation with PROPER",
    "Compose functions (PROPER(TRIM(...))) and fill them down",
  ],
  icon: "🧹",
  xp: 50,
  estMinutes: 8,
  cols: 2,
  rows: 5,
  initialGrid: grid({
    A1: "Raw Import",
    B1: "Cleaned Name",
    A2: "  john SMITH  ",
    A3: "  MARY jones  ",
    A4: "  pat OBRIEN  ",
    A5: "  ALEX chen  ",
  }),
  steps: [
    {
      id: "inspect-the-mess",
      objective: "Diagnose the problem",
      instruction:
        "Leading and trailing spaces plus inconsistent casing. Power Query automates exactly this at scale; we'll do it with formulas first so you can see each step.",
      highlightRange: { start: "A2", end: "A5" },
      check: { type: "auto" },
    },
    {
      id: "clean-first",
      objective: "Compose text functions",
      instruction: "Select B2 and enter =PROPER(TRIM(A2)) to trim the spaces and fix the capitalisation in one formula.",
      hint: "TRIM runs first and removes the extra spaces; PROPER then capitalises each word.",
      targetCell: "B2",
      highlightCells: ["A2", "B2"],
      check: { type: "formula-text-equals", cell: "B2", expected: "John Smith" },
      demo: [{ cell: "B2", type: "=PROPER(TRIM(A2))", pause: 1300 }],
    },
    {
      id: "fill-second",
      objective: "Fill the cleanup down",
      instruction: "Select B2, then ⤓ Fill Down to clean the second record.",
      highlightCells: ["B2", "B3"],
      check: { type: "formula-text-equals", cell: "B3", expected: "Mary Jones" },
    },
    {
      id: "fill-third",
      objective: "Continue the fill",
      instruction: "Select B3 and Fill Down again.",
      highlightCells: ["B3", "B4"],
      check: { type: "formula-text-equals", cell: "B4", expected: "Pat Obrien" },
    },
    {
      id: "fill-fourth",
      objective: "Complete the import",
      instruction: "Select B4 and Fill Down to finish the list.",
      highlightCells: ["B4", "B5"],
      check: { type: "formula-text-equals", cell: "B5", expected: "Alex Chen" },
    },
  ],
  celebration: "You normalised a dirty import with composable text functions — the manual half of what Power Query automates.",
};

const dynamicArrays: Lesson = {
  id: "l4-dynamic-arrays",
  levelId: "level-4",
  title: "Dynamic Arrays & Spill",
  tagline: "One formula that returns a whole list, not a single value.",
  brief:
    "Modern Excel changed the rules: some functions return an array that spills into neighbouring cells. You'll sort a list of transactions with a single SORT formula and see the full spilled result — the feature that replaced a whole category of helper columns and manual copy-paste.",
  objectives: [
    "Understand what a dynamic array spills",
    "Sort a range with a single SORT formula",
    "Read the spilled result as one logical operation",
  ],
  icon: "🔀",
  xp: 50,
  estMinutes: 7,
  cols: 3,
  rows: 7,
  initialGrid: grid({
    A1: "Transaction",
    C1: "Sorted (asc)",
    A2: "340",
    A3: "120",
    A4: "500",
    A5: "210",
    A6: "90",
    A7: "275",
  }),
  customPanel: [
    {
      kind: "dynamic-array",
      showFromStepIndex: 2,
      title: "Full spilled result (what modern Excel returns automatically)",
      sourceCells: ["A2", "A3", "A4", "A5", "A6", "A7"],
      order: "asc",
    },
  ],
  steps: [
    {
      id: "read-transactions",
      objective: "Read the source list",
      instruction: "Six transaction amounts, unsorted — the input to a dynamic array.",
      highlightRange: { start: "A2", end: "A7" },
      check: { type: "auto" },
    },
    {
      id: "sort-formula",
      objective: "Sort with a dynamic array",
      instruction: "Select C2 and enter =SORT(A2:A7) — one formula that returns the entire sorted list in modern Excel.",
      hint: "A classic formula returns one value; a dynamic array returns a list and spills it across cells. This teaching grid shows the first value here and the full spill in the panel below.",
      targetCell: "C2",
      highlightRange: { start: "A2", end: "A7" },
      check: { type: "formula-contains", cell: "C2", mustInclude: ["SORT(A2:A7)"] },
      demo: [{ cell: "C2", type: "=SORT(A2:A7)", pause: 1300 }],
    },
    {
      id: "read-the-spill",
      objective: "Read the spilled result",
      instruction: "That entire sorted column came from the one formula you wrote — that's a spilled array.",
      check: { type: "auto" },
    },
  ],
  celebration: "You wrote a formula that returns a list, not a value — the dynamic-array model modern Excel is built on.",
};

const macroAutomation: Lesson = {
  id: "l4-macro-automation",
  levelId: "level-4",
  title: "Recording a Repeatable Macro",
  tagline: "Capture a manual edit sequence as replayable automation.",
  brief:
    "You update order statuses the same way every day: set a status, then colour it. The Macro Recorder turns those steps into reusable automation. Here, every action you take is logged as the VBA Excel would have written — so you can see how recorded automation is built before you ever open the editor.",
  objectives: [
    "Recognise repetitive steps worth automating",
    "Perform an edit sequence as a macro would record it",
    "Read the generated VBA and understand its structure",
  ],
  icon: "🎬",
  xp: 55,
  estMinutes: 8,
  cols: 2,
  rows: 3,
  initialGrid: grid({
    A1: "Order",
    B1: "Status",
    A2: "PO-4471",
  }),
  isMacroLesson: true,
  steps: [
    {
      id: "set-status",
      objective: "Record a value edit",
      instruction: "Recording is on. Select B2 and enter Approved to update the order status.",
      targetCell: "B2",
      highlightCells: ["B2"],
      check: { type: "value-equals", cell: "B2", expected: "Approved" },
      demo: [{ cell: "B2", type: "Approved", pause: 800 }],
    },
    {
      id: "colour-status",
      objective: "Record a formatting edit",
      instruction: "Select B2 again and fill it green to mark the order as actioned.",
      highlightCells: ["B2"],
      check: { type: "fill-equals", cell: "B2", expected: "#2E9E5B" },
      demo: [{ cell: "B2", fill: "#2E9E5B", pause: 800 }],
    },
    {
      id: "read-the-macro",
      objective: "Read the generated VBA",
      instruction: "Stop recording and review the macro Excel would have written from your two actions.",
      check: { type: "auto" },
    },
  ],
  celebration: "That's how recorded automation works: real actions captured as VBA, ready to replay on the next order.",
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const LESSONS: Record<string, Lesson> = {
  [gridAndReferences.id]: gridAndReferences,
  [firstFormulas.id]: firstFormulas,
  [sumAndRanges.id]: sumAndRanges,
  [coreStatistics.id]: coreStatistics,
  [relativeFill.id]: relativeFill,
  [ifAndReporting.id]: ifAndReporting,
  [absoluteReferences.id]: absoluteReferences,
  [conditionalAggregation.id]: conditionalAggregation,
  [lookupAndTables.id]: lookupAndTables,
  [nestedLogicProtection.id]: nestedLogicProtection,
  [namedRanges.id]: namedRanges,
  [pivotAndSparkline.id]: pivotAndSparkline,
  [dataCleanup.id]: dataCleanup,
  [dynamicArrays.id]: dynamicArrays,
  [macroAutomation.id]: macroAutomation,
};

export const LEVELS: Level[] = [
  {
    id: "level-0",
    order: 0,
    title: "Spreadsheet Foundations",
    audience: "New to spreadsheets",
    tier: "Foundations",
    description: "The grid, cell references, formulas, and your first aggregate function.",
    color: "owl",
    lessonIds: [gridAndReferences.id, firstFormulas.id, sumAndRanges.id],
  },
  {
    id: "level-1",
    order: 1,
    title: "Data Literacy & Core Functions",
    audience: "Building day-to-day skills",
    tier: "Core functions",
    description:
      "Summary statistics, relative references and the fill handle, and conditional logic that drives reporting.",
    color: "sky",
    lessonIds: [coreStatistics.id, relativeFill.id, ifAndReporting.id],
  },
  {
    id: "level-2",
    order: 2,
    title: "Data Integrity & Lookups",
    audience: "Working with real datasets",
    tier: "Data integrity",
    description: "Absolute references, conditional aggregation with COUNTIF/SUMIF, XLOOKUP, Tables, and validation.",
    color: "coral",
    lessonIds: [absoluteReferences.id, conditionalAggregation.id, lookupAndTables.id],
  },
  {
    id: "level-3",
    order: 3,
    title: "Business Analysis",
    audience: "Analysts & coordinators",
    tier: "Analysis",
    description: "Nested logic and protection, named ranges, and grouping raw data into a Pivot-and-sparkline view.",
    color: "gold",
    lessonIds: [nestedLogicProtection.id, namedRanges.id, pivotAndSparkline.id],
  },
  {
    id: "level-4",
    order: 4,
    title: "Professional Tooling & Automation",
    audience: "Power users & professionals",
    tier: "Automation",
    description: "Cleaning messy data, dynamic arrays and spill, and recording repeatable macros.",
    color: "owl",
    lessonIds: [dataCleanup.id, dynamicArrays.id, macroAutomation.id],
  },
];

export function getLevel(levelId: string): Level | undefined {
  return LEVELS.find((l) => l.id === levelId);
}

export function getLesson(lessonId: string): Lesson | undefined {
  return LESSONS[lessonId];
}

export function getAllLessonsInOrder(): Lesson[] {
  return LEVELS.flatMap((level) => level.lessonIds.map((id) => LESSONS[id]).filter((l): l is Lesson => Boolean(l)));
}

export function getNextLesson(currentLessonId: string): Lesson | undefined {
  const all = getAllLessonsInOrder();
  const idx = all.findIndex((l) => l.id === currentLessonId);
  if (idx === -1 || idx === all.length - 1) return undefined;
  return all[idx + 1];
}

export const PALETTE_COLORS = [
  { name: "Owl Green", value: "#2E9E5B" },
  { name: "Coral", value: "#FF7A45" },
  { name: "Sky Blue", value: "#3FA9EA" },
  { name: "Gold", value: "#F5B800" },
];

export function isValidLevelId(id: string): id is LevelId {
  return LEVELS.some((l) => l.id === id);
}
