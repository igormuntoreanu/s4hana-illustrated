import { CDS_CATALOG, type TechnicalModel } from "@/data/technical-model";

export function TechnicalModelCard({ model }: { model: TechnicalModel }) {
  return (
    <section
      className="mt-3 overflow-hidden rounded-2xl border border-[#d1d1d1] bg-white text-[#32363a] shadow-sm [&_h3]:font-sans [&_h4]:font-sans"
      aria-label="Technical reference"
    >
      <header className="border-b border-[#e5e5e5] bg-[#f7f7f7] px-4 py-3">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#0854a0] uppercase">Technical reference</p>
        <h3 className="mt-1 text-lg leading-tight font-semibold text-[#1d2d3e]">Tables, service, and views</h3>
        <p className="mt-1 text-sm text-[#6a6d70]">{model.summary}</p>
      </header>

      {model.tables.length > 0 && (
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {model.tables.map((table) => (
          <fieldset key={table.name} className="rounded-lg border border-[#e5e5e5] px-3 pt-1 pb-2">
            <legend className="px-1 font-mono text-[11px] font-bold tracking-wide text-[#0854a0]">{table.name}</legend>
            <p className="mb-2 text-sm text-[#6a6d70]">{table.description}</p>
            <dl className="space-y-1.5">
              {table.fields.map((field) => (
                <div key={field.name} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-2 text-sm">
                  <dt className="font-mono text-[13px] font-semibold text-[#1d2d3e]">{field.name}</dt>
                  <dd className="text-[#32363a]">{field.description}</dd>
                </div>
              ))}
            </dl>
          </fieldset>
        ))}
      </div>
      )}

      {model.odata && (
        <div className="px-4 pb-4">
          <h4 className="mb-2 text-[11px] font-bold tracking-[0.12em] text-[#0854a0] uppercase">OData service</h4>
          <div className="rounded-lg border border-[#e5e5e5] px-3 py-2">
            <a
              href={model.odata.href}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm font-semibold text-[#0854a0] underline decoration-[#0854a0]/40 underline-offset-2"
            >
              {model.odata.name}
            </a>
            <p className="mt-1 text-sm text-[#32363a]">{model.odata.title}</p>
          </div>
        </div>
      )}

      {model.cds.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="mb-2 text-[11px] font-bold tracking-[0.12em] text-[#0854a0] uppercase">CDS views</h4>
          <ul className="space-y-2">
            {model.cds.map((view) => (
              <li key={view.name} className="rounded-lg border border-[#e5e5e5] px-3 py-2">
                <p className="font-mono text-sm font-semibold text-[#1d2d3e]">{view.name}</p>
                <p className="mt-0.5 text-sm text-[#6a6d70]">{view.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="border-t border-[#e5e5e5] bg-[#fafafa] px-4 py-2.5 text-xs leading-relaxed text-[#6a6d70]">
        Confirm the service on the{" "}
        <a
          href="https://api.sap.com/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#0854a0] underline decoration-[#0854a0]/40 underline-offset-2"
        >
          SAP Business Accelerator Hub
        </a>{" "}
        and the view in the{" "}
        <a
          href={CDS_CATALOG}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#0854a0] underline decoration-[#0854a0]/40 underline-offset-2"
        >
          CDS views for S/4HANA on-premise
        </a>
        . A view’s release status can differ by feature pack.
      </p>
    </section>
  );
}
