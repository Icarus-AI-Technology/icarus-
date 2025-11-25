import { NeuCard } from '../components/ui/NeuCard';
import { NeuButton } from '../components/ui/NeuButton';
import { NeuInput } from '../components/ui/NeuInput';
import { Search, Mail, Lock } from 'lucide-react';

export default function DesignSystemShowcase() {
  return (
    <div className="min-h-screen bg-[#ECF0F3] dark:bg-[#0F1217] p-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
        OraclusX Design System Showcase
      </h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <NeuButton>Primary Button</NeuButton>
          <NeuButton variant="success">Success Button</NeuButton>
          <NeuButton variant="danger">Danger Button</NeuButton>
          <NeuButton variant="ghost">Ghost Button</NeuButton>
          <NeuButton disabled>Disabled</NeuButton>
          <NeuButton isLoading>Loading</NeuButton>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NeuInput placeholder="Default Input" />
          <NeuInput placeholder="Search..." icon={Search} />
          <NeuInput placeholder="Email" icon={Mail} type="email" />
          <NeuInput placeholder="Password" icon={Lock} type="password" />
          <NeuInput placeholder="Error State" error="Invalid email address" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NeuCard>
            <h3 className="text-lg font-bold mb-2">Basic Card</h3>
            <p className="text-slate-600 dark:text-slate-400">
              This is a standard NeuCard with the default neumorphic shadow. It floats above the
              background.
            </p>
          </NeuCard>
          <NeuCard className="flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold mb-2">Centered Content</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Cards can contain any content.
            </p>
            <NeuButton>Action</NeuButton>
          </NeuCard>
        </div>
      </section>
    </div>
  );
}
