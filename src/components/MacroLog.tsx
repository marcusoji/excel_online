interface MacroLogProps {
  lines: string[];
}

/**
 * Renders the learner's own actions as pseudo-VBA — genuinely generated
 * from what they just did (see LessonPlayer's macro logging), not a canned
 * sample. It's still a simplified illustration, not executable VBA; the
 * lesson copy says so explicitly.
 */
export function MacroLog({ lines }: MacroLogProps) {
  return (
    <div className="rounded-2xl bg-slate-925 text-slate-50 p-4 font-mono text-xs overflow-x-auto">
      <div className="text-owl-300">Sub MyFirstMacro()</div>
      {lines.length === 0 ? (
        <div className="pl-4 text-slate-500 italic">Waiting for your first action…</div>
      ) : (
        lines.map((line, i) => (
          <div key={i} className="pl-4">
            {line}
          </div>
        ))
      )}
      <div className="text-owl-300">End Sub</div>
    </div>
  );
}
