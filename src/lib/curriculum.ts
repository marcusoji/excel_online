import type { GridData, Lesson, Level, LevelId } from "@/types";

function grid(cells: Record<string, string>): GridData {
  const g: GridData = {};
  for (const [cell, raw] of Object.entries(cells)) g[cell] = { raw };
  return g;
}

// ---------------------------------------------------------------------------
// Level 0 — Excel Playground (ages 6–8)
// ---------------------------------------------------------------------------

const magicColorBoxes: Lesson = {
  id: "l0-magic-color-boxes",
  levelId: "level-0",
  title: "Magic Color Boxes",
  tagline: "Meet the grid and cast your very first spell.",
  icon: "🎨",
  xp: 20,
  estMinutes: 4,
  cols: 4,
  rows: 4,
  initialGrid: grid({}),
  steps: [
    {
      id: "select-first-cell",
      instruction: "Every little box is called a cell. Tap the cell at B2 to select it.",
      highlightCells: ["B2"],
      check: { type: "cell-selected", cell: "B2" },
      demo: [{ cell: "B2", pause: 600 }],
    },
    {
      id: "type-name",
      instruction: "Now type your name into B2, then tap ✓ or press Enter.",
      hint: "Any name works — this box is yours!",
      targetCell: "B2",
      highlightCells: ["B2"],
      check: { type: "non-empty", cell: "B2" },
      demo: [{ cell: "B2", type: "Ava", pause: 800 }],
    },
    {
      id: "color-a-cell",
      instruction: "Tap cell C3, then tap the green paint swatch below to fill it with color.",
      hint: "Select the cell first — then the paint swatches will fill whichever cell is selected.",
      highlightCells: ["C3"],
      check: { type: "fill-equals", cell: "C3", expected: "#2E9E5B" },
      demo: [{ cell: "C3", fill: "#2E9E5B", pause: 800 }],
    },
    {
      id: "first-addition-spell",
      instruction: "Time for real magic! Tap D4, type =2+3, and watch Excel do the math.",
      hint: "Every formula starts with an equals sign: =2+3",
      targetCell: "D4",
      highlightCells: ["D4"],
      check: { type: "formula-result-equals", cell: "D4", expected: 5 },
      demo: [{ cell: "D4", type: "=2+3", pause: 900 }],
    },
  ],
  celebration: "You cast your very first Excel spell! ✨",
};

const toyBoxAddUp: Lesson = {
  id: "l0-toy-box-add-up",
  levelId: "level-0",
  title: "The Toy Box Add-Up",
  tagline: "Count your toys, then let Excel add them for you.",
  icon: "🧸",
  xp: 25,
  estMinutes: 5,
  cols: 2,
  rows: 5,
  initialGrid: grid({
    A1: "Toy",
    B1: "Count",
    A2: "Cars",
    A3: "Blocks",
    A4: "Dolls",
    A5: "Total",
  }),
  steps: [
    {
      id: "count-cars",
      instruction: "You have 4 toy cars. Tap B2 and type 4.",
      targetCell: "B2",
      highlightCells: ["B2"],
      check: { type: "value-equals", cell: "B2", expected: 4 },
      demo: [{ cell: "B2", type: "4", pause: 700 }],
    },
    {
      id: "count-blocks",
      instruction: "You have 7 building blocks. Tap B3 and type 7.",
      targetCell: "B3",
      highlightCells: ["B3"],
      check: { type: "value-equals", cell: "B3", expected: 7 },
      demo: [{ cell: "B3", type: "7", pause: 700 }],
    },
    {
      id: "count-dolls",
      instruction: "You have 3 dolls. Tap B4 and type 3.",
      targetCell: "B4",
      highlightCells: ["B4"],
      check: { type: "value-equals", cell: "B4", expected: 3 },
      demo: [{ cell: "B4", type: "3", pause: 700 }],
    },
    {
      id: "add-them-up",
      instruction: "Now the magic part — tap B5 and type =B2+B3+B4 to add every toy together.",
      hint: "Adding cells together uses their names, like B2 + B3 + B4.",
      targetCell: "B5",
      highlightRange: { start: "B2", end: "B4" },
      check: { type: "formula-result-equals", cell: "B5", expected: 14 },
      demo: [{ cell: "B5", type: "=B2+B3+B4", pause: 1000 }],
    },
  ],
  celebration: "14 toys counted — that's real addition, wizard style!",
};

const sumSpell: Lesson = {
  id: "l0-sum-spell",
  levelId: "level-0",
  title: "The SUM Spell",
  tagline: "Learn the one function every Excel wizard knows first.",
  icon: "🍋",
  xp: 30,
  estMinutes: 6,
  cols: 2,
  rows: 7,
  initialGrid: grid({
    A1: "Day",
    B1: "Cups Sold",
    A2: "Monday",
    B2: "5",
    A3: "Tuesday",
    B3: "8",
    A4: "Wednesday",
    B4: "6",
    A5: "Thursday",
    B5: "9",
    A6: "Friday",
    B6: "7",
    A7: "Total",
  }),
  steps: [
    {
      id: "look-at-the-week",
      instruction: "Lily's lemonade stand sold cups all week. Column B already shows how many — take a look!",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "auto" },
    },
    {
      id: "cast-sum",
      instruction: "Tap B7 and type =SUM(B2:B6) to add up the whole week in one spell.",
      hint: "SUM adds up everything inside the parentheses — try =SUM(B2:B6)",
      targetCell: "B7",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-contains", cell: "B7", mustInclude: ["SUM(B2:B6)"] },
      demo: [{ cell: "B7", type: "=SUM(B2:B6)", pause: 1100 }],
    },
    {
      id: "watch-it-update",
      instruction: "Wednesday was actually busier — tap B4 and change it to 12. Watch the Total update itself!",
      targetCell: "B4",
      highlightCells: ["B4", "B7"],
      check: { type: "formula-result-equals", cell: "B7", expected: 41 },
      demo: [{ cell: "B4", type: "12", pause: 900 }],
    },
  ],
  celebration: "You automated your first spreadsheet — SUM does the work for you!",
};

// ---------------------------------------------------------------------------
// Level 1 — Young Explorer
// ---------------------------------------------------------------------------

const gradeTrackerIntro: Lesson = {
  id: "l1-grade-tracker",
  levelId: "level-1",
  title: "Rows, Ranges & the Class Average",
  tagline: "Build a real grade tracker with AVERAGE and a first IF.",
  icon: "📊",
  xp: 35,
  estMinutes: 7,
  cols: 3,
  rows: 6,
  initialGrid: grid({
    A1: "Subject",
    B1: "Score",
    C1: "Result",
    A2: "Math",
    A3: "Reading",
    A4: "Science",
    A5: "Art",
    A6: "Average",
  }),
  steps: [
    {
      id: "score-math",
      instruction: "Tap B2 and type 88 for this week's Math quiz.",
      targetCell: "B2",
      highlightCells: ["B2"],
      check: { type: "value-equals", cell: "B2", expected: 88 },
      demo: [{ cell: "B2", type: "88", pause: 600 }],
    },
    {
      id: "score-reading",
      instruction: "Tap B3 and type 76 for Reading.",
      targetCell: "B3",
      highlightCells: ["B3"],
      check: { type: "value-equals", cell: "B3", expected: 76 },
      demo: [{ cell: "B3", type: "76", pause: 600 }],
    },
    {
      id: "score-science",
      instruction: "Tap B4 and type 95 for Science.",
      targetCell: "B4",
      highlightCells: ["B4"],
      check: { type: "value-equals", cell: "B4", expected: 95 },
      demo: [{ cell: "B4", type: "95", pause: 600 }],
    },
    {
      id: "score-art",
      instruction: "Tap B5 and type 60 for Art.",
      targetCell: "B5",
      highlightCells: ["B5"],
      check: { type: "value-equals", cell: "B5", expected: 60 },
      demo: [{ cell: "B5", type: "60", pause: 600 }],
    },
    {
      id: "average-range",
      instruction: "The range B2:B5 holds all four scores. Tap B6 and type =AVERAGE(B2:B5) to find the average.",
      hint: "AVERAGE adds everything up and divides by how many numbers there are.",
      targetCell: "B6",
      highlightRange: { start: "B2", end: "B5" },
      check: { type: "formula-contains", cell: "B6", mustInclude: ["AVERAGE(B2:B5)"] },
      demo: [{ cell: "B6", type: "=AVERAGE(B2:B5)", pause: 1100 }],
    },
    {
      id: "first-if",
      instruction: 'One more spell: tap C2 and type =IF(B2>=70,"Pass","Needs Practice") to let Excel make a decision.',
      hint: "IF checks a condition first, then answers one way if it's true and another if it's false.",
      targetCell: "C2",
      highlightCells: ["B2", "C2"],
      check: { type: "formula-contains", cell: "C2", mustInclude: ["IF(B2>=70"] },
      demo: [{ cell: "C2", type: '=IF(B2>=70,"Pass","Needs Practice")', pause: 1300 }],
    },
  ],
  celebration: "AVERAGE and IF in one lesson — that's real analyst thinking!",
};

const pocketMoneyJournal: Lesson = {
  id: "l1-pocket-money-journal",
  levelId: "level-1",
  title: "Pocket Money Journal",
  tagline: "Track a running total — and let the fill handle do the repeating.",
  icon: "💰",
  xp: 35,
  estMinutes: 7,
  cols: 3,
  rows: 5,
  initialGrid: grid({
    A1: "Week",
    B1: "Allowance",
    C1: "Running Total",
    A2: "Week 1",
    B2: "5",
    A3: "Week 2",
    B3: "6",
    A4: "Week 3",
    B4: "4",
    A5: "Week 4",
    B5: "7",
  }),
  steps: [
    {
      id: "look-at-allowance",
      instruction: "Every week's allowance already sits in column B — take a look.",
      highlightRange: { start: "B2", end: "B5" },
      check: { type: "auto" },
    },
    {
      id: "start-running-total",
      instruction: "Tap C2 and type =B2 to start the running total with Week 1.",
      targetCell: "C2",
      highlightCells: ["B2", "C2"],
      check: { type: "formula-result-equals", cell: "C2", expected: 5 },
      demo: [{ cell: "C2", type: "=B2", pause: 800 }],
    },
    {
      id: "add-week-two",
      instruction: "Tap C3 and type =C2+B3 to add Week 2's allowance onto the running total.",
      hint: "A running total is just \"last week's total\" plus \"this week's amount.\"",
      targetCell: "C3",
      highlightCells: ["C2", "B3", "C3"],
      check: { type: "formula-result-equals", cell: "C3", expected: 11 },
      demo: [{ cell: "C3", type: "=C2+B3", pause: 1000 }],
    },
    {
      id: "fill-down-to-week-three",
      instruction: "Select C3, then tap ⤓ Fill Down — Excel copies the pattern to C4 and shifts the references down for you.",
      hint: "That's the fill handle in action: no retyping needed.",
      highlightCells: ["C3", "C4"],
      check: { type: "formula-result-equals", cell: "C4", expected: 15 },
    },
    {
      id: "finish-week-four",
      instruction: "Last one — tap C5 and type =C4+B5 to finish the journal.",
      targetCell: "C5",
      highlightCells: ["C4", "B5", "C5"],
      check: { type: "formula-result-equals", cell: "C5", expected: 22 },
      demo: [{ cell: "C5", type: "=C4+B5", pause: 1000 }],
    },
  ],
  celebration: "A running total across four weeks — and the fill handle did half the typing!",
};

const fieldDayScoreboard: Lesson = {
  id: "l1-field-day-scoreboard",
  levelId: "level-1",
  title: "Field Day Scoreboard",
  tagline: "AutoSum, Sort, and your first live chart.",
  icon: "🏁",
  xp: 40,
  estMinutes: 7,
  cols: 2,
  rows: 7,
  initialGrid: grid({
    A1: "Name",
    B1: "Score",
    A2: "Ben",
    B2: "14",
    A3: "Priya",
    B3: "19",
    A4: "Sam",
    B4: "9",
    A5: "Ana",
    B5: "22",
    A6: "Leo",
    B6: "16",
    A7: "Total",
  }),
  liveChart: {
    title: "Field Day Scores",
    rows: [
      { label: "A2", value: "B2" },
      { label: "A3", value: "B3" },
      { label: "A4", value: "B4" },
      { label: "A5", value: "B5" },
      { label: "A6", value: "B6" },
    ],
    showFromStepIndex: 3,
    color: "#3FA9EA",
  },
  steps: [
    {
      id: "look-at-scores",
      instruction: "Five kids ran the Field Day race — here are their scores.",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "auto" },
    },
    {
      id: "autosum-total",
      instruction: "Tap AutoSum to total every score in one click — the same shortcut real Excel uses.",
      targetCell: "B7",
      highlightRange: { start: "B2", end: "B6" },
      autoSumAction: { targetCell: "B7", range: { start: "B2", end: "B6" }, label: "∑ AutoSum" },
      check: { type: "formula-result-equals", cell: "B7", expected: 80 },
    },
    {
      id: "sort-scores",
      instruction: "Now tap Sort to put the highest scores at the top.",
      highlightRange: { start: "A2", end: "B6" },
      sortAction: { range: { start: "A2", end: "B6" }, sortColumn: "B", order: "desc", label: "⇅ Sort High → Low" },
      check: { type: "value-equals", cell: "A2", expected: "Ana" },
    },
    {
      id: "reveal-chart",
      instruction: "Look at the live chart below — it already matches your sorted scoreboard!",
      check: { type: "auto" },
    },
  ],
  celebration: "AutoSum, Sort, and a live chart — a whole scoreboard in one lesson!",
};

// ---------------------------------------------------------------------------
// Level 2 — Junior Wizard
// ---------------------------------------------------------------------------

const lockingCellsInPlace: Lesson = {
  id: "l2-locking-cells-in-place",
  levelId: "level-2",
  title: "Locking Cells in Place",
  tagline: "Absolute vs. relative references, using the fill handle for real.",
  icon: "🔒",
  xp: 40,
  estMinutes: 8,
  cols: 3,
  rows: 5,
  initialGrid: grid({
    A1: "Discount Rate",
    B1: "0.1",
    A3: "Notebook",
    B3: "4",
    A4: "Pencil Case",
    B4: "8",
    A5: "Backpack",
    B5: "25",
  }),
  steps: [
    {
      id: "spot-the-rate",
      instruction: "B1 holds our 10% discount rate. We'll reuse it for every item without ever retyping it.",
      highlightCells: ["B1"],
      check: { type: "auto" },
    },
    {
      id: "discount-notebook",
      instruction: "Tap C3 and type =B3-(B3*$B$1) to apply the discount to the Notebook.",
      hint: "The $ signs lock B1 in place so it won't shift when we copy this formula down.",
      targetCell: "C3",
      highlightCells: ["B1", "B3", "C3"],
      check: { type: "formula-result-equals", cell: "C3", expected: 3.6 },
      demo: [{ cell: "C3", type: "=B3-(B3*$B$1)", pause: 1300 }],
    },
    {
      id: "fill-down-pencil-case",
      instruction: "Select C3, then tap ⤓ Fill Down to discount the Pencil Case too.",
      highlightCells: ["C3", "C4"],
      check: { type: "formula-result-equals", cell: "C4", expected: 7.2 },
    },
    {
      id: "fill-down-backpack",
      instruction: "Select C4, then Fill Down once more for the Backpack.",
      hint: "Notice $B$1 never moved, even though B3 and B4 shifted down each time.",
      highlightCells: ["C4", "C5"],
      check: { type: "formula-result-equals", cell: "C5", expected: 22.5 },
    },
  ],
  celebration: "You used absolute references like a pro — $B$1 never budged!",
};

const inventoryDetective: Lesson = {
  id: "l2-inventory-detective",
  levelId: "level-2",
  title: "Inventory Detective",
  tagline: "COUNTIF, SUMIF, and clean data entry with Data Validation.",
  icon: "🔍",
  xp: 40,
  estMinutes: 8,
  cols: 3,
  rows: 9,
  initialGrid: grid({
    A1: "Item",
    B1: "Category",
    C1: "Qty",
    A2: "Pencils",
    C2: "12",
    A3: "Notebooks",
    C3: "8",
    A4: "Erasers",
    C4: "20",
    A5: "Folders",
    C5: "5",
    A6: "Markers",
    C6: "15",
    A8: "School items:",
    A9: "Total school qty:",
  }),
  validationLists: {
    B2: ["School", "Craft"],
    B3: ["School", "Craft"],
    B4: ["School", "Craft"],
    B5: ["School", "Craft"],
    B6: ["School", "Craft"],
  },
  steps: [
    {
      id: "categorize-pencils",
      instruction: "Tap B2 and choose School from the dropdown — Data Validation keeps every entry consistent.",
      targetCell: "B2",
      highlightCells: ["B2"],
      check: { type: "value-equals", cell: "B2", expected: "School" },
      demo: [{ cell: "B2", type: "School", pause: 700 }],
    },
    {
      id: "categorize-notebooks",
      instruction: "Tap B3 and choose School.",
      targetCell: "B3",
      highlightCells: ["B3"],
      check: { type: "value-equals", cell: "B3", expected: "School" },
      demo: [{ cell: "B3", type: "School", pause: 700 }],
    },
    {
      id: "categorize-erasers",
      instruction: "Tap B4 and choose School.",
      targetCell: "B4",
      highlightCells: ["B4"],
      check: { type: "value-equals", cell: "B4", expected: "School" },
      demo: [{ cell: "B4", type: "School", pause: 700 }],
    },
    {
      id: "categorize-folders",
      instruction: "Tap B5 and choose Craft.",
      targetCell: "B5",
      highlightCells: ["B5"],
      check: { type: "value-equals", cell: "B5", expected: "Craft" },
      demo: [{ cell: "B5", type: "Craft", pause: 700 }],
    },
    {
      id: "categorize-markers",
      instruction: "Tap B6 and choose Craft.",
      targetCell: "B6",
      highlightCells: ["B6"],
      check: { type: "value-equals", cell: "B6", expected: "Craft" },
      demo: [{ cell: "B6", type: "Craft", pause: 700 }],
    },
    {
      id: "countif-school",
      instruction: 'Tap B8 and type =COUNTIF(B2:B6,"School") to count how many items are School supplies.',
      hint: 'COUNTIF looks through B2:B6 and counts every match for "School".',
      targetCell: "B8",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-contains", cell: "B8", mustInclude: ['COUNTIF(B2:B6,"School")'] },
      demo: [{ cell: "B8", type: '=COUNTIF(B2:B6,"School")', pause: 1200 }],
    },
    {
      id: "sumif-school",
      instruction: 'Tap B9 and type =SUMIF(B2:B6,"School",C2:C6) to total the quantity of School supplies only.',
      hint: "SUMIF only adds the Qty where Category matches — everything else is ignored.",
      targetCell: "B9",
      highlightRange: { start: "C2", end: "C6" },
      check: { type: "formula-contains", cell: "B9", mustInclude: ['SUMIF(B2:B6,"School",C2:C6)'] },
      demo: [{ cell: "B9", type: '=SUMIF(B2:B6,"School",C2:C6)', pause: 1300 }],
    },
  ],
  celebration: "COUNTIF, SUMIF, and spotless Data Validation — real inventory-analyst skills!",
};

const lookupWizard: Lesson = {
  id: "l2-lookup-wizard",
  levelId: "level-2",
  title: "Lookup Wizard",
  tagline: "XLOOKUP, Conditional Formatting, Tables, and Freeze Panes.",
  icon: "🧙",
  xp: 45,
  estMinutes: 9,
  cols: 4,
  rows: 6,
  initialGrid: grid({
    A1: "Product",
    B1: "Price",
    C1: "Search for:",
    D1: "Price found:",
    A2: "Notebook",
    B2: "4",
    A3: "Pencil Case",
    B3: "8",
    A4: "Backpack",
    B4: "25",
    A5: "Ruler",
    B5: "2",
    A6: "Eraser",
    B6: "1",
  }),
  bandedRange: { start: "A2", end: "B6" },
  conditionalFormats: [{ range: { start: "B2", end: "B6" }, operator: ">=", threshold: 10, color: "#FFE59A" }],
  validationLists: {
    C2: ["Notebook", "Pencil Case", "Backpack", "Ruler", "Eraser"],
  },
  steps: [
    {
      id: "notice-table",
      instruction:
        "This is your product table. See the light stripes? That's what an Excel Table looks like — and the header row stays put no matter how far you scroll (that's Freeze Panes).",
      highlightRange: { start: "A1", end: "B6" },
      check: { type: "auto" },
    },
    {
      id: "notice-conditional-format",
      instruction: "Notice Backpack is already tinted gold — Conditional Formatting automatically highlights anything $10 or more.",
      highlightCells: ["B4"],
      check: { type: "auto" },
    },
    {
      id: "pick-a-product",
      instruction: "Tap C2 and choose Backpack from the dropdown.",
      targetCell: "C2",
      highlightCells: ["C2"],
      check: { type: "value-equals", cell: "C2", expected: "Backpack" },
      demo: [{ cell: "C2", type: "Backpack", pause: 700 }],
    },
    {
      id: "xlookup-price",
      instruction: "Tap D2 and type =XLOOKUP(C2,A2:A6,B2:B6) to find its price automatically.",
      hint: "XLOOKUP searches C2's value inside A2:A6, then returns the matching price from B2:B6.",
      targetCell: "D2",
      highlightCells: ["C2"],
      highlightRange: { start: "A2", end: "B6" },
      check: { type: "formula-result-equals", cell: "D2", expected: 25 },
      demo: [{ cell: "D2", type: "=XLOOKUP(C2,A2:A6,B2:B6)", pause: 1300 }],
    },
  ],
  celebration: "XLOOKUP, Conditional Formatting, Tables, and Freeze Panes — a full Junior Wizard toolkit!",
};

// ---------------------------------------------------------------------------
// Level 3 — Office Apprentice
// ---------------------------------------------------------------------------

const nestedFormulasProtection: Lesson = {
  id: "l3-nested-formulas-protection",
  levelId: "level-3",
  title: "Nested Formulas & Protecting Your Work",
  tagline: "One IF inside another — and cells locked the way Protect Sheet would.",
  icon: "🛡️",
  xp: 45,
  estMinutes: 9,
  cols: 3,
  rows: 5,
  initialGrid: grid({
    A1: "Student",
    B1: "Score",
    C1: "Grade",
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
      instruction: "Notice you can't edit the Score column — in real Excel, Protect Sheet does exactly this to stop accidental changes to source data.",
      highlightRange: { start: "B2", end: "B5" },
      check: { type: "auto" },
    },
    {
      id: "nested-if-omar",
      instruction: 'Tap C2 and type =IF(B2>=90,"A",IF(B2>=80,"B","C")) to grade Omar with a nested IF.',
      hint: 'A nested IF puts a whole second IF inside the "false" answer of the first one.',
      targetCell: "C2",
      highlightCells: ["B2", "C2"],
      check: { type: "formula-text-equals", cell: "C2", expected: "A" },
      demo: [{ cell: "C2", type: '=IF(B2>=90,"A",IF(B2>=80,"B","C"))', pause: 1400 }],
    },
    {
      id: "fill-down-zara",
      instruction: "Select C2, then tap ⤓ Fill Down to grade Zara automatically.",
      highlightCells: ["C2", "C3"],
      check: { type: "formula-text-equals", cell: "C3", expected: "B" },
    },
    {
      id: "fill-down-kai",
      instruction: "Select C3, then Fill Down again for Kai.",
      highlightCells: ["C3", "C4"],
      check: { type: "formula-text-equals", cell: "C4", expected: "C" },
    },
    {
      id: "fill-down-mia",
      instruction: "One more Fill Down for Mia.",
      highlightCells: ["C4", "C5"],
      check: { type: "formula-text-equals", cell: "C5", expected: "C" },
    },
  ],
  celebration: "Nested IFs and a protected sheet — real office-analyst hygiene.",
};

const namedRangesSalesTotal: Lesson = {
  id: "l3-named-ranges-sales-total",
  levelId: "level-3",
  title: "Named Ranges & the Sales Total",
  tagline: "Give a range a name, and every formula gets easier to read.",
  icon: "🏷️",
  xp: 40,
  estMinutes: 7,
  cols: 2,
  rows: 8,
  initialGrid: grid({
    A1: "Region",
    B1: "Sales",
    A2: "North",
    B2: "120",
    A3: "South",
    B3: "95",
    A4: "East",
    B4: "140",
    A5: "West",
    B5: "110",
    A6: "Central",
    B6: "75",
    A7: "Total (via named range)",
    A8: "Average (via named range)",
  }),
  namedRanges: { Sales: "B2:B6" },
  steps: [
    {
      id: "notice-named-range",
      instruction: 'We\'ve named the range B2:B6 "Sales" — formulas can refer to it by name instead of cell letters.',
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "auto" },
    },
    {
      id: "sum-named-range",
      instruction: "Tap B7 and type =SUM(Sales) to total every region using the named range.",
      hint: '"Sales" already means B2:B6 — you never have to type the range itself.',
      targetCell: "B7",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-result-equals", cell: "B7", expected: 540 },
      demo: [{ cell: "B7", type: "=SUM(Sales)", pause: 1000 }],
    },
    {
      id: "average-named-range",
      instruction: "Now tap B8 and type =AVERAGE(Sales) to find the regional average with the same named range.",
      targetCell: "B8",
      highlightRange: { start: "B2", end: "B6" },
      check: { type: "formula-result-equals", cell: "B8", expected: 108 },
      demo: [{ cell: "B8", type: "=AVERAGE(Sales)", pause: 1000 }],
    },
  ],
  celebration: "One name, endless formulas — that's how named ranges keep big workbooks readable.",
};

const miniPivotDashboard: Lesson = {
  id: "l3-mini-pivot-dashboard",
  levelId: "level-3",
  title: "Mini Pivot & Sparkline Dashboard",
  tagline: "Group raw data into totals, then watch a trend in one glance.",
  icon: "📈",
  xp: 45,
  estMinutes: 8,
  cols: 5,
  rows: 9,
  initialGrid: grid({
    A1: "Region",
    B1: "Amount",
    A2: "North",
    B2: "50",
    A3: "South",
    B3: "30",
    A4: "North",
    B4: "20",
    A5: "East",
    B5: "40",
    A6: "South",
    B6: "25",
    A7: "East",
    B7: "15",
    A9: "Weekly Visitors",
    B9: "120",
    C9: "150",
    D9: "90",
    E9: "180",
  }),
  customPanel: [
    {
      kind: "pivot",
      showFromStepIndex: 1,
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
    { kind: "sparkline", showFromStepIndex: 2, title: "Weekly Visitors Trend", valueCells: ["B9", "C9", "D9", "E9"] },
  ],
  steps: [
    {
      id: "look-at-raw-data",
      instruction: "Here's raw sales data — six transactions across three regions, in no particular order.",
      highlightRange: { start: "A2", end: "B7" },
      check: { type: "auto" },
    },
    {
      id: "reveal-pivot",
      instruction: "Look below — that's every region grouped and totaled automatically, the same idea behind a real PivotTable.",
      check: { type: "auto" },
    },
    {
      id: "reveal-sparkline",
      instruction: "Now look at Weekly Visitors — the sparkline shows the whole trend in one glance, no chart required.",
      highlightRange: { start: "B9", end: "E9" },
      check: { type: "auto" },
    },
  ],
  celebration: "PivotTables and Sparklines — you're building a real dashboard now.",
};

// ---------------------------------------------------------------------------
// Level 4 — Office Professional
// ---------------------------------------------------------------------------

const dataCleanupCrew: Lesson = {
  id: "l4-data-cleanup-crew",
  levelId: "level-4",
  title: "Data Cleanup Crew",
  tagline: "TRIM + PROPER now, Power Query automating the same idea later.",
  icon: "🧹",
  xp: 45,
  estMinutes: 8,
  cols: 2,
  rows: 5,
  initialGrid: grid({
    A1: "Messy Entry",
    B1: "Cleaned Result",
    A2: "  john SMITH  ",
    A3: "  MARY jones  ",
    A4: "  pat OBRIEN  ",
    A5: "  ALEX chen  ",
  }),
  steps: [
    {
      id: "notice-mess",
      instruction: "Real-world data is messy — extra spaces, shouting capitals. Power Query automates cleanup like this at scale; let's do it with formulas first so you see exactly what's happening.",
      highlightRange: { start: "A2", end: "A5" },
      check: { type: "auto" },
    },
    {
      id: "clean-first-entry",
      instruction: "Tap B2 and type =PROPER(TRIM(A2)) to trim the extra spaces and fix the capitalization.",
      hint: "TRIM removes the extra spaces first, then PROPER capitalizes each word.",
      targetCell: "B2",
      highlightCells: ["A2", "B2"],
      check: { type: "formula-text-equals", cell: "B2", expected: "John Smith" },
      demo: [{ cell: "B2", type: "=PROPER(TRIM(A2))", pause: 1200 }],
    },
    {
      id: "fill-down-second",
      instruction: "Select B2, then tap ⤓ Fill Down to clean the second entry.",
      highlightCells: ["B2", "B3"],
      check: { type: "formula-text-equals", cell: "B3", expected: "Mary Jones" },
    },
    {
      id: "fill-down-third",
      instruction: "Select B3, then Fill Down again.",
      highlightCells: ["B3", "B4"],
      check: { type: "formula-text-equals", cell: "B4", expected: "Pat Obrien" },
    },
    {
      id: "fill-down-fourth",
      instruction: "One more Fill Down to finish the list.",
      highlightCells: ["B4", "B5"],
      check: { type: "formula-text-equals", cell: "B5", expected: "Alex Chen" },
    },
  ],
  celebration: "TRIM + PROPER cleaned every name — Power Query does exactly this, automatically, for entire columns.",
};

const dynamicArraysLesson: Lesson = {
  id: "l4-dynamic-arrays",
  levelId: "level-4",
  title: "Dynamic Arrays: One Formula, Many Answers",
  tagline: "SORT an entire range with a single formula.",
  icon: "🔀",
  xp: 45,
  estMinutes: 7,
  cols: 3,
  rows: 7,
  initialGrid: grid({
    A1: "Daily Sales",
    C1: "Smallest → Largest",
    A2: "340",
    A3: "120",
    A4: "500",
    A5: "210",
    A6: "90",
    A7: "275",
  }),
  customPanel: [
    { kind: "dynamic-array", showFromStepIndex: 2, title: "Full spilled result (what modern Excel shows automatically)", sourceCells: ["A2", "A3", "A4", "A5", "A6", "A7"], order: "asc" },
  ],
  steps: [
    {
      id: "look-at-sales",
      instruction: "Here are six days of sales, in no particular order.",
      highlightRange: { start: "A2", end: "A7" },
      check: { type: "auto" },
    },
    {
      id: "sort-formula",
      instruction: "Tap C2 and type =SORT(A2:A7) — one formula that would normally spill a whole sorted list across cells automatically.",
      hint: "Modern Excel spills SORT's full result automatically; this teaching grid shows the formula's first value, plus a full preview below.",
      targetCell: "C2",
      highlightRange: { start: "A2", end: "A7" },
      check: { type: "formula-contains", cell: "C2", mustInclude: ["SORT(A2:A7)"] },
      demo: [{ cell: "C2", type: "=SORT(A2:A7)", pause: 1200 }],
    },
    {
      id: "reveal-full-spill",
      instruction: "Here's what the full spilled list would look like, all from that one formula.",
      check: { type: "auto" },
    },
  ],
  celebration: "One formula, a whole sorted list — that's the power of Dynamic Arrays.",
};

const recordYourFirstMacro: Lesson = {
  id: "l4-record-your-first-macro",
  levelId: "level-4",
  title: "Record Your First Macro",
  tagline: "Every action you take gets logged, just like Excel's Macro Recorder.",
  icon: "🎬",
  xp: 50,
  estMinutes: 8,
  cols: 2,
  rows: 3,
  initialGrid: grid({
    A1: "Item",
    B1: "Status",
    A2: "Laptop",
  }),
  isMacroLesson: true,
  steps: [
    {
      id: "type-status",
      instruction: "Recording has started! Tap B2 and type Shipped to update this order's status.",
      targetCell: "B2",
      highlightCells: ["B2"],
      check: { type: "value-equals", cell: "B2", expected: "Shipped" },
      demo: [{ cell: "B2", type: "Shipped", pause: 800 }],
    },
    {
      id: "color-status",
      instruction: "Now tap B2 again and fill it green to mark the order complete.",
      highlightCells: ["B2"],
      check: { type: "fill-equals", cell: "B2", expected: "#2E9E5B" },
      demo: [{ cell: "B2", fill: "#2E9E5B", pause: 800 }],
    },
    {
      id: "stop-recording",
      instruction: "Stop recording — look at what Excel would have written down for you.",
      check: { type: "auto" },
    },
  ],
  celebration: "That's exactly how VBA macros start: real actions recorded, ready to replay anytime.",
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const LESSONS: Record<string, Lesson> = {
  [magicColorBoxes.id]: magicColorBoxes,
  [toyBoxAddUp.id]: toyBoxAddUp,
  [sumSpell.id]: sumSpell,
  [gradeTrackerIntro.id]: gradeTrackerIntro,
  [pocketMoneyJournal.id]: pocketMoneyJournal,
  [fieldDayScoreboard.id]: fieldDayScoreboard,
  [lockingCellsInPlace.id]: lockingCellsInPlace,
  [inventoryDetective.id]: inventoryDetective,
  [lookupWizard.id]: lookupWizard,
  [nestedFormulasProtection.id]: nestedFormulasProtection,
  [namedRangesSalesTotal.id]: namedRangesSalesTotal,
  [miniPivotDashboard.id]: miniPivotDashboard,
  [dataCleanupCrew.id]: dataCleanupCrew,
  [dynamicArraysLesson.id]: dynamicArraysLesson,
  [recordYourFirstMacro.id]: recordYourFirstMacro,
};

export const LEVELS: Level[] = [
  {
    id: "level-0",
    order: 0,
    title: "Excel Playground",
    ageRange: "Ages 6–8",
    description: "Magic boxes, coloring cells, and your first addition spells.",
    color: "owl",
    lessonIds: [magicColorBoxes.id, toyBoxAddUp.id, sumSpell.id],
  },
  {
    id: "level-1",
    order: 1,
    title: "Young Explorer",
    ageRange: "Ages 8–11",
    description: "Ranges, AutoSum, AVERAGE, the fill handle, sorting, and your first chart.",
    color: "sky",
    lessonIds: [gradeTrackerIntro.id, pocketMoneyJournal.id, fieldDayScoreboard.id],
  },
  {
    id: "level-2",
    order: 2,
    title: "Junior Wizard",
    ageRange: "Ages 11–14",
    description: "Absolute references, COUNTIF/SUMIF, XLOOKUP, conditional formatting, Tables, and Data Validation.",
    color: "coral",
    lessonIds: [lockingCellsInPlace.id, inventoryDetective.id, lookupWizard.id],
  },
  {
    id: "level-3",
    order: 3,
    title: "Office Apprentice",
    ageRange: "Teens & up",
    description: "Nested formulas, sheet protection, named ranges, a mini PivotTable, and sparklines.",
    color: "gold",
    lessonIds: [nestedFormulasProtection.id, namedRangesSalesTotal.id, miniPivotDashboard.id],
  },
  {
    id: "level-4",
    order: 4,
    title: "Office Professional",
    ageRange: "Adults",
    description: "Data cleanup (a Power Query preview), Dynamic Arrays, and recording your first macro.",
    color: "owl",
    lessonIds: [dataCleanupCrew.id, dynamicArraysLesson.id, recordYourFirstMacro.id],
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
