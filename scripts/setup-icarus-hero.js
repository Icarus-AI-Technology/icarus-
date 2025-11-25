/* ICARUS v6.0 - HERO UI AGENT
   Stack: Vite + React + Tailwind 4 + HeroUI + Pnpm
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configurações de Diretórios ---
const dirs = [
  'src/components',
  'src/pages',
  'src/assets',
  'src/providers'
];

const files = {
  // 1. Configuração PNPM (Hoisting pattern exigido pelo HeroUI)
  '.npmrc': `public-hoist-pattern[]=*@heroui/*`,

  // 2. Vite Config (Integrando Tailwind 4)
  'vite.config.js': `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})`,

  // 3. Plugin HeroUI para Tailwind 4 (hero.ts)
  // Este arquivo conecta o tema do HeroUI à engine do Tailwind 4
  'hero.ts': `
import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    dark: {
      colors: {
        background: "#0b0d16", // Icarus Dark Navy
        primary: {
          DEFAULT: "#2dd4bf", // Cyber Teal
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#6366f1", // Purple
          foreground: "#ffffff",
        },
        focus: "#2dd4bf",
      }
    }
  }
});`,

  // 4. CSS Global (Tailwind 4 + HeroUI Source)
  'src/index.css': `
@import "tailwindcss";
@plugin './hero.ts';

/* Aponta para os arquivos do HeroUI dentro do node_modules para o T4 escanear */
@source '../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}';

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  
  /* Animações Customizadas */
  --animate-float: float 6s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
}

/* Reset Básico */
body {
  @apply bg-background text-foreground antialiased min-h-screen;
}`,

  // 5. Providers (Contexto do HeroUI)
  'src/providers/Providers.jsx': `
import React from "react";
import { HeroUIProvider } from "@heroui/react";

export function Providers({ children }) {
  // navigate={navigate} pode ser adicionado se usar useHref do router
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}`,

  // 6. Main Entry (Forçando Dark Mode)
  'src/main.jsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Providers } from "./providers/Providers";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="dark text-foreground bg-background min-h-screen">
      <Providers>
        <App />
      </Providers>
    </div>
  </React.StrictMode>,
)`,

  // 7. Dashboard Icarus com Componentes HeroUI
  'src/App.jsx': `
import React from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter, 
  Input, 
  Avatar, 
  Badge, 
  Progress,
  Chip,
  Divider
} from "@heroui/react";
import { Search, Bell, Activity, Users, MoreHorizontal, MapPin } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const chartData = [
  { name: 'Jan', v: 40 }, { name: 'Feb', v: 30 }, { name: 'Mar', v: 60 }, 
  { name: 'Apr', v: 45 }, { name: 'May', v: 80 }, { name: 'Jun', v: 55 }
];

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-background p-4 gap-6 font-sans">
      
      {/* SIDEBAR (Simulada) */}
      <aside className="w-72 hidden md:flex flex-col gap-4">
        <Card className="h-full bg-content1/50 backdrop-blur-md border-white/5">
          <CardHeader className="flex gap-3 px-6 pt-8">
            <div className="p-2 bg-gradient-to-tr from-primary to-secondary rounded-lg">
              <Activity className="text-black" size={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                ICARUS v6
              </p>
              <p className="text-tiny text-default-500">HeroUI Edition</p>
            </div>
          </CardHeader>
          <CardBody className="px-4">
             <div className="flex flex-col gap-2">
               {['Dashboard', 'Analytics', 'Doctors', 'Patients', 'Finance'].map((item, i) => (
                 <Button 
                   key={item} 
                   variant={i === 0 ? "shadow" : "light"} 
                   color={i === 0 ? "primary" : "default"}
                   className="justify-start"
                   startContent={<div className="w-2 h-2 rounded-full bg-current" />}
                 >
                   {item}
                 </Button>
               ))}
             </div>
          </CardBody>
          <CardFooter className="px-6 pb-6">
            <Card className="w-full bg-default-100/50">
               <CardBody className="flex flex-row gap-3 items-center p-3">
                 <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" isBordered color="secondary" />
                 <div>
                   <p className="text-sm font-bold">Dr. Silva</p>
                   <p className="text-xs text-default-400">Admin</p>
                 </div>
               </CardBody>
            </Card>
          </CardFooter>
        </Card>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide pb-6">
        
        {/* TOP BAR */}
        <header className="flex justify-between items-center">
          <div className="w-96">
            <Input 
              classNames={{
                base: "max-w-full sm:max-w-[20rem] h-10",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
              }}
              placeholder="Type to search..."
              size="sm"
              startContent={<Search size={18} />}
              type="search"
            />
          </div>
          <div className="flex items-center gap-4">
            <Badge content="5" color="danger" shape="circle">
              <Button isIconOnly radius="full" variant="light">
                <Bell size={22} />
              </Button>
            </Badge>
          </div>
        </header>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* KPI CARDS */}
          <div className="col-span-12 md:col-span-8 grid grid-cols-3 gap-6">
             {[
               { title: 'Total Revenue', val: '$128K', color: 'primary', trend: '+12%' },
               { title: 'Active Users', val: '1,432', color: 'secondary', trend: '+5%' },
               { title: 'System Load', val: '45%', color: 'warning', trend: '-2%' }
             ].map((kpi, i) => (
               <Card key={i} className="border-none bg-gradient-to-br from-content1 to-content2 shadow-lg">
                 <CardBody>
                   <p className="text-default-500 text-xs uppercase font-bold">{kpi.title}</p>
                   <h2 className="text-3xl font-bold mt-2">{kpi.val}</h2>
                   <Chip size="sm" variant="flat" color={kpi.color} className="mt-2">{kpi.trend}</Chip>
                 </CardBody>
               </Card>
             ))}

             {/* LARGE CHART */}
             <Card className="col-span-3 min-h-[300px] bg-content1/60 backdrop-blur-lg">
               <CardHeader className="flex justify-between">
                 <h3 className="font-bold text-lg">Performance Overview</h3>
                 <Button size="sm" variant="flat">Weekly</Button>
               </CardHeader>
               <CardBody>
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                     <defs>
                       <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <Tooltip contentStyle={{backgroundColor: '#18181b', border: 'none', borderRadius: '12px'}} />
                     <Area type="monotone" dataKey="v" stroke="#2dd4bf" strokeWidth={3} fill="url(#colorV)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </CardBody>
             </Card>
          </div>

          {/* RIGHT COLUMN (List & Progress) */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
            <Card className="flex-1 bg-content1">
              <CardHeader className="justify-between">
                <h3 className="font-bold">Recent Activity</h3>
                <MoreHorizontal size={18} className="text-default-400" />
              </CardHeader>
              <CardBody className="gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex gap-3 items-center">
                    <Avatar src={\`https://i.pravatar.cc/150?img=\${i+10}\`} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">New Registration</p>
                      <p className="text-xs text-default-400">2 mins ago</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card className="bg-secondary-50/10 border border-secondary/20">
              <CardBody>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold">Server Goal</span>
                  <span className="text-sm text-secondary">85%</span>
                </div>
                <Progress value={85} color="secondary" className="h-2" />
                <p className="text-xs text-default-400 mt-3">Optimized for neural processing.</p>
              </CardBody>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}`
};

// --- Execução do Agente ---
console.log("🚀 Icarus Agent (HeroUI Edition): Iniciando configuração...");

// Criar Pastas
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[DIR] ${dir}`);
  }
});

// Escrever Arquivos
Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(process.cwd(), filepath);
  fs.writeFileSync(fullPath, content.trim());
  console.log(`[FILE] ${filepath}`);
});

// Limpeza Final
const legacyFiles = ['tailwind.config.js', 'postcss.config.js'];
legacyFiles.forEach(f => {
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    console.log(`[CLEAN] ${f} removido (incompatível com T4/HeroUI)`);
  }
});

console.log("\n✅ Configuração Concluída!");
console.log("👉 1. Certifique-se que rodou 'pnpm install'");
console.log("👉 2. Rode 'pnpm run dev'");
