import { S4_HELP, type StudyObject } from "@/data/study-objects";

export function StudyObjectPage({ page }: { page: StudyObject }) {
  return (
    <section
      className="mt-3 overflow-hidden rounded-2xl border border-[#d1d1d1] bg-white text-[#32363a] shadow-sm [&_h3]:font-sans [&_h4]:font-sans"
      aria-label={`${page.title} sample`}
    >
      <header className="border-b border-[#e5e5e5] bg-[#f7f7f7] px-4 py-3">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#0854a0] uppercase">{page.eyebrow}</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg leading-tight font-semibold text-[#1d2d3e]">{page.title}</h3>
          {page.status && (
            <span className="rounded-full bg-[#f1fdf6] px-2.5 py-0.5 text-xs font-semibold text-[#256f3a] ring-1 ring-[#b8e0c8]">
              {page.status}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[#6a6d70]">{page.subtitle}</p>
      </header>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {page.groups.map((group) => (
          <fieldset key={group.title} className="rounded-lg border border-[#e5e5e5] px-3 pt-1 pb-2">
            <legend className="px-1 text-[11px] font-bold tracking-[0.12em] text-[#0854a0] uppercase">{group.title}</legend>
            <dl className="space-y-1.5">
              {group.fields.map((field) => (
                <div key={field.label} className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-2 text-sm">
                  <dt className="text-[#6a6d70]">{field.label}</dt>
                  <dd className="font-semibold text-[#1d2d3e]">{field.value}</dd>
                </div>
              ))}
            </dl>
          </fieldset>
        ))}
      </div>

      {page.tables?.map((table) => (
        <div key={table.title} className="px-4 pb-4">
          <h4 className="mb-2 text-[11px] font-bold tracking-[0.12em] text-[#0854a0] uppercase">{table.title}</h4>
          <div className="overflow-x-auto rounded-lg border border-[#e5e5e5]">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead className="bg-[#f7f7f7] text-xs text-[#6a6d70]">
                <tr>
                  {table.columns.map((column) => (
                    <th key={column} className="px-3 py-2 font-semibold whitespace-nowrap">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.join("|")} className="border-t border-[#e5e5e5]">
                    {row.map((cell, index) => (
                      <td key={`${cell}-${index}`} className="px-3 py-2 whitespace-nowrap text-[#1d2d3e]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p className="border-t border-[#e5e5e5] bg-[#fafafa] px-4 py-2.5 text-xs leading-relaxed text-[#6a6d70]">
        Sample for study, not a live system.{" "}
        <a
          href={S4_HELP}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#0854a0] underline decoration-[#0854a0]/40 underline-offset-2"
        >
          Confirm on SAP Help for S/4HANA on-premise
        </a>
        .
      </p>
    </section>
  );
}
