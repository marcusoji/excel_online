export interface FormulaEntry {
  name: string;
  syntax: string;
  description: string;
  example: string;
  level: "Level 0" | "Level 1" | "Level 2" | "Level 3" | "Level 4";
}

export const FORMULA_LIBRARY: FormulaEntry[] = [
  { name: "Addition", syntax: "=A1+A2", description: "Adds two cells together.", example: "=2+3 → 5", level: "Level 0" },
  { name: "SUM", syntax: "=SUM(range)", description: "Adds up every number in a range.", example: "=SUM(B2:B6) → total of B2 through B6", level: "Level 0" },
  { name: "AVERAGE", syntax: "=AVERAGE(range)", description: "Finds the mean of a range of numbers.", example: "=AVERAGE(B2:B5)", level: "Level 1" },
  { name: "MAX", syntax: "=MAX(range)", description: "Returns the largest number in a range.", example: "=MAX(B2:B10)", level: "Level 1" },
  { name: "MIN", syntax: "=MIN(range)", description: "Returns the smallest number in a range.", example: "=MIN(B2:B10)", level: "Level 1" },
  { name: "COUNT", syntax: "=COUNT(range)", description: "Counts how many cells in a range contain numbers.", example: "=COUNT(B2:B10)", level: "Level 1" },
  { name: "IF", syntax: '=IF(condition, value_if_true, value_if_false)', description: "Makes a decision based on a condition.", example: '=IF(B2>=70,"Pass","Needs Practice")', level: "Level 1" },
  { name: "COUNTIF", syntax: "=COUNTIF(range, criteria)", description: "Counts cells that match a condition.", example: '=COUNTIF(A2:A20,"Shipped")', level: "Level 2" },
  { name: "SUMIF", syntax: "=SUMIF(range, criteria, sum_range)", description: "Adds only the cells that match a condition.", example: '=SUMIF(C2:C20,"East",D2:D20)', level: "Level 2" },
  { name: "Absolute reference", syntax: "$A$1", description: "Locks a row and column so it doesn't shift when you copy a formula.", example: "=A2*$B$1", level: "Level 2" },
  { name: "XLOOKUP", syntax: "=XLOOKUP(lookup_value, lookup_array, return_array)", description: "Looks up a value in one column and returns a matching value from another.", example: "=XLOOKUP(A2,Products!A:A,Products!C:C)", level: "Level 2" },
  { name: "ROUND", syntax: "=ROUND(number, digits)", description: "Rounds a number to a set number of decimal places.", example: "=ROUND(4.567,2) → 4.57", level: "Level 2" },
  { name: "Named range", syntax: "=SUM(Revenue)", description: "A friendly name that stands in for a cell range.", example: "Define \"Revenue\" for C2:C50, then =SUM(Revenue)", level: "Level 3" },
  { name: "PivotTable", syntax: "Insert → PivotTable", description: "Summarizes and groups large tables without writing formulas.", example: "Drag \"Region\" to Rows and \"Sales\" to Values", level: "Level 3" },
  { name: "Sparkline", syntax: "Insert → Sparkline", description: "A tiny in-cell chart that shows a trend at a glance.", example: "One sparkline per row of monthly sales", level: "Level 3" },
  { name: "Dynamic array (SORT)", syntax: "=SORT(range)", description: "Spills a sorted list into neighboring cells automatically.", example: "=SORT(A2:A20, 1, -1)", level: "Level 4" },
  { name: "LET", syntax: "=LET(name, value, calculation)", description: "Names a value inside a formula so you can reuse it without repeating it.", example: "=LET(total,SUM(B2:B10),total/12)", level: "Level 4" },
];
