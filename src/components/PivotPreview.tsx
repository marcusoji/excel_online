interface PivotPreviewProps {
  title?: string;
  groupLabel: string;
  valueLabel: string;
  rows: { group: string; value: number }[];
}

/**
 * A deliberately simplified stand-in for a real PivotTable: it groups and
 * sums live data the same way a Pivot does, without the drag-and-drop field
 * list. Real Excel's PivotTable UI is out of scope for a browser teaching
 * tool — this keeps the underlying idea ("group, then aggregate") honest
 * and interactive rather than a static screenshot.
 */
export function PivotPreview({ title, groupLabel, valueLabel, rows }: PivotPreviewProps) {
  const totals = new Map<string, number>();
  for (const r of rows) totals.set(r.group, (totals.get(r.group) ?? 0) + r.value);
  const entries = Array.from(totals.entries());
  const grandTotal = entries.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4">
      {title && <h3 className="font-display font-bold text-ink dark:text-slate-50 mb-3 text-sm">{title}</h3>}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-300 border-b border-slate-150 dark:border-slate-750">
            <th className="pb-2 font-semibold">{groupLabel}</th>
            <th className="pb-2 font-semibold text-right">Total {valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([group, value]) => (
            <tr key={group} className="border-b border-slate-150/60 dark:border-slate-750/60">
              <td className="py-1.5 text-ink dark:text-slate-50">{group}</td>
              <td className="py-1.5 text-right font-mono text-owl-700 dark:text-owl-300">{value}</td>
            </tr>
          ))}
          <tr>
            <td className="pt-1.5 font-bold text-ink dark:text-slate-50">Grand Total</td>
            <td className="pt-1.5 text-right font-mono font-bold text-ink dark:text-slate-50">{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
