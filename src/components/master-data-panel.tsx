import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, X } from "lucide-react";
import { masterTreeById, type MasterItem } from "@/data/master-trees";
import { studyObjects } from "@/data/study-objects";
import { technicalModels } from "@/data/technical-model";
import { StudyObjectPage } from "@/components/study-object";
import { TechnicalModelCard } from "@/components/technical-model";

export function MasterDataPanel({ treeId, onClose }: { treeId: string | null; onClose: () => void }) {
  const tree = treeId ? masterTreeById(treeId) : undefined;
  const [itemId, setItemId] = useState<string | null>(null);
  const item = tree?.items.find((entry) => entry.id === itemId);

  return (
    <Dialog.Root
      open={Boolean(tree)}
      onOpenChange={(open) => {
        if (!open) {
          setItemId(null);
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-ink/40" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-40 max-h-dvh overflow-y-auto rounded-t-3xl bg-paper-2 px-5 pt-4 pb-8 sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          {tree && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Dialog.Description className="text-xs font-bold tracking-widest text-muted uppercase">
                    {tree.sign} · Master data
                  </Dialog.Description>
                  <Dialog.Title className="mt-1 text-3xl font-semibold">{item ? item.title : tree.sign}</Dialog.Title>
                </div>
                <Dialog.Close className="grid size-11 shrink-0 place-items-center rounded-full border border-line" aria-label="Back to map">
                  <X className="size-5" />
                </Dialog.Close>
              </div>

              {item ? <MasterDetail item={item} onBack={() => setItemId(null)} /> : <MasterList treeIntro={tree.intro} items={tree.items} onOpen={setItemId} />}

              <button
                type="button"
                onClick={() => {
                  setItemId(null);
                  onClose();
                }}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-base font-bold text-paper"
              >
                <ArrowLeft className="size-5" aria-hidden="true" />
                Back to map
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MasterList({
  treeIntro,
  items,
  onOpen,
}: {
  treeIntro: string;
  items: MasterItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <>
      <p className="mt-4 text-base leading-relaxed">{treeIntro}</p>
      <ul className="mt-4 space-y-2">
        {items.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onOpen(entry.id)}
              className="flex w-full min-h-14 flex-col items-start rounded-2xl border border-line bg-paper px-4 py-3 text-left"
            >
              <span className="text-base font-bold">{entry.title}</span>
              <span className="text-sm text-muted">{entry.blurb}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function MasterDetail({ item, onBack }: { item: MasterItem; onBack: () => void }) {
  const sample = studyObjects[item.id];
  const technical = technicalModels[item.id];
  return (
    <>
      <button type="button" onClick={onBack} className="mt-3 inline-flex min-h-10 items-center gap-1 text-sm font-bold text-stamp">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All master data
      </button>
      <p className="mt-3 text-base leading-relaxed">{item.blurb}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-3">
          <dt className="text-xs font-bold tracking-widest text-muted uppercase">Fiori app</dt>
          <dd className="mt-1 text-sm font-semibold">{item.fiori}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-3">
          <dt className="text-xs font-bold tracking-widest text-muted uppercase">Transaction</dt>
          <dd className="mt-1 text-sm font-semibold break-words">{item.tcode}</dd>
        </div>
      </dl>
      <aside className="mt-3 rounded-2xl border border-line bg-paper p-3">
        <h3 className="text-xs font-bold tracking-widest text-stamp uppercase">Compared with ECC</h3>
        <p className="mt-1 text-sm leading-relaxed">{item.versusEcc}</p>
      </aside>
      {sample && <StudyObjectPage page={sample} />}
      {technical && <TechnicalModelCard model={technical} />}
    </>
  );
}
