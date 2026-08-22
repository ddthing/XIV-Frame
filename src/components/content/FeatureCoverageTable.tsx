interface FeatureCoverageRow {
  area: string
  support: string
  notes: string
}

interface FeatureCoverageTableProps {
  intro?: string
  areaLabel: string
  supportLabel: string
  notesLabel: string
  rows: FeatureCoverageRow[]
}

export function FeatureCoverageTable({ intro, areaLabel, supportLabel, notesLabel, rows }: FeatureCoverageTableProps) {
  return (
    <div className="space-y-4">
      {intro && <p>{intro}</p>}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[38rem] border-collapse text-left font-body text-sm">
          <caption className="sr-only">{areaLabel}, {supportLabel}, {notesLabel}</caption>
          <thead className="bg-muted/45 text-xs font-semibold text-foreground">
            <tr>
              <th scope="col" className="border-b border-border px-4 py-3">{areaLabel}</th>
              <th scope="col" className="border-b border-border px-4 py-3">{supportLabel}</th>
              <th scope="col" className="border-b border-border px-4 py-3">{notesLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground/75">
            {rows.map((row) => (
              <tr key={row.area} className="align-top transition-colors hover:bg-muted/25">
                <th scope="row" className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">{row.area}</th>
                <td className="px-4 py-3 leading-6">{row.support}</td>
                <td className="px-4 py-3 leading-6">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
