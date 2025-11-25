import { Accordion, AccordionItem } from "@heroui/react";

export default function FAQAccordion() {
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Perguntas Frequentes</h2>
      <Accordion 
        variant="splitted" 
        selectionMode="multiple"
        itemClasses={{
          base: "group-[.is-splitted]:px-4 group-[.is-splitted]:bg-white/5 group-[.is-splitted]:shadow-[0_0_15px_rgba(0,0,0,0.2)] group-[.is-splitted]:backdrop-blur-xl group-[.is-splitted]:border-white/5",
          title: "font-medium text-slate-200",
          trigger: "px-2 py-4 data-[hover=true]:bg-white/5 rounded-lg flex items-center",
          indicator: "text-slate-400",
          content: "text-slate-400 px-2 pb-4",
        }}
      >
        <AccordionItem key="1" aria-label="Como funciona o Icarus?" title="Como funciona o Icarus?">
          {defaultContent}
        </AccordionItem>
        <AccordionItem key="2" aria-label="É seguro?" title="É seguro usar a plataforma?">
          {defaultContent}
        </AccordionItem>
        <AccordionItem key="3" aria-label="Integrações" title="Quais integrações estão disponíveis?">
          {defaultContent}
        </AccordionItem>
      </Accordion>
    </div>
  );
}

