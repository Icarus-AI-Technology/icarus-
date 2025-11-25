// React is automatically imported in JSX transform

export default function RHGestaoPessoas(): JSX.Element {
  return (
    <div className="p-6">
      <h1 className="orx-text-xl orx-orx-font-semibold mb-2">RHGestaoPessoas</h1>
      <p className="orx-text-sm text-muted-foreground mb-4">
        Stub do módulo RHGestaoPessoas. Conteúdo será implementado conforme o manual.
      </p>
      <div className="grid gap-3">
        <section>
          <h2 className="orx-orx-font-medium">Objetivo</h2>
          <p className="orx-text-sm">Descrição breve do objetivo do módulo.</p>
        </section>
        <section>
          <h2 className="orx-orx-font-medium">Funcionalidades</h2>
          <ul className="list-disc ml-6 orx-text-sm">
            <li>Placeholder 1</li>
            <li>Placeholder 2</li>
          </ul>
        </section>
        <section>
          <h2 className="orx-orx-font-medium">Passo a passo</h2>
          <ol className="list-decimal ml-6 orx-text-sm">
            <li>Passo 1</li>
            <li>Passo 2</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
