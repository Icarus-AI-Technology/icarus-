/**
 * OraclusX Design System - Component Examples
 * Complete usage examples for all consolidated components
 */

import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  ChatbotFAB,
  ChatbotWindow,
  SuggestionsPanel,
  type ChatSuggestion
} from '@/components/oraclusx-ds';

import { 
  Plus, 
  Mail, 
  Lock, 
  Search, 
  User, 
  Bell, 
  GraduationCap, 
  HelpCircle,
  Download,
  Filter,
  Settings
} from 'lucide-react';

// ============================================
// BUTTON EXAMPLES
// ============================================

export function ButtonExamples() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="neumo">Neumo (Default)</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
          <Button size="icon"><Settings /></Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Buttons with Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={Plus} variant="primary">Add New</Button>
          <Button rightIcon={Download} variant="secondary">Download</Button>
          <Button leftIcon={Filter} variant="ghost">Filter</Button>
          <Button leftIcon={Search} rightIcon={Settings}>Advanced Search</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="primary" 
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
          >
            Click to Load
          </Button>
          <Button disabled>Disabled</Button>
          <Button variant="success" fullWidth>Full Width Button</Button>
        </div>
      </section>
    </div>
  );
}

// ============================================
// INPUT EXAMPLES
// ============================================

export function InputExamples() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="space-y-8 p-8 max-w-2xl">
      <section>
        <h2 className="text-2xl font-bold mb-4">Input Variants</h2>
        <div className="space-y-4">
          <Input variant="neumo" placeholder="Neumorphic (Default)" />
          <Input variant="flat" placeholder="Flat variant" />
          <Input variant="ghost" placeholder="Ghost variant" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Input Sizes</h2>
        <div className="space-y-4">
          <Input inputSize="sm" placeholder="Small input" />
          <Input inputSize="md" placeholder="Medium input (Default)" />
          <Input inputSize="lg" placeholder="Large input" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Inputs with Icons</h2>
        <div className="space-y-4">
          <Input leftIcon={Mail} placeholder="Email address" />
          <Input rightIcon={User} placeholder="Username" />
          <Input leftIcon={Search} rightIcon={Filter} placeholder="Search with filter" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Inputs with Labels</h2>
        <div className="space-y-4">
          <Input 
            label="Email Address"
            leftIcon={Mail}
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Input 
            label="Password"
            leftIcon={Lock}
            type="password"
            placeholder="Enter your password"
            required
            hint="Must be at least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Input States</h2>
        <div className="space-y-4">
          <Input 
            label="Email with Error"
            leftIcon={Mail}
            error="Please enter a valid email address"
            value="invalid-email"
          />
          
          <Input 
            label="Disabled Input"
            leftIcon={User}
            disabled
            value="Disabled value"
          />
          
          <Input 
            label="Input with Hint"
            leftIcon={User}
            hint="Only letters, numbers, and underscores allowed"
          />
        </div>
      </section>
    </div>
  );
}

// ============================================
// CARD EXAMPLES
// ============================================

export function CardExamples() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-2xl font-bold mb-6">Card Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="neumo">
            <CardContent>
              <p className="text-center py-8">Neumorphic Card (Default)</p>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent>
              <p className="text-center py-8">Glassmorphism Card</p>
            </CardContent>
          </Card>
          
          <Card variant="elevated">
            <CardContent>
              <p className="text-center py-8">Elevated Card</p>
            </CardContent>
          </Card>
          
          <Card variant="flat">
            <CardContent>
              <p className="text-center py-8">Flat Card</p>
            </CardContent>
          </Card>
          
          <Card variant="pressed">
            <CardContent>
              <p className="text-center py-8">Pressed Card</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Card Padding</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card padding="sm" className="border-2 border-dashed border-gray-300">
            <CardContent>Small Padding</CardContent>
          </Card>
          
          <Card padding="md" className="border-2 border-dashed border-gray-300">
            <CardContent>Medium Padding (Default)</CardContent>
          </Card>
          
          <Card padding="lg" className="border-2 border-dashed border-gray-300">
            <CardContent>Large Padding</CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Interactive Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="neumo" hoverable>
            <CardContent className="text-center py-8">
              Hoverable Card (Lift Effect)
            </CardContent>
          </Card>
          
          <Card variant="neumo" clickable onClick={() => alert('Card clicked!')}>
            <CardContent className="text-center py-8">
              Clickable Card
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Complete Card Example</h2>
        <Card variant="neumo" padding="lg" className="max-w-md">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Input 
              label="Full Name"
              leftIcon={User}
              placeholder="John Doe"
            />
            
            <Input 
              label="Email"
              leftIcon={Mail}
              type="email"
              placeholder="john@example.com"
            />
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Save Changes</Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

// ============================================
// CHATBOT EXAMPLES
// ============================================

export function ChatbotExamples() {
  const [isOpen, setIsOpen] = useState(false);
  
  const suggestions: ChatSuggestion[] = [
    {
      id: '1',
      text: 'Ver alertas ativos',
      icon: Bell,
      action: () => console.log('Ver alertas')
    },
    {
      id: '2',
      text: 'Iniciar treinamento',
      icon: GraduationCap,
      action: () => console.log('Iniciar treinamento')
    },
    {
      id: '3',
      text: 'Como registrar um novo OPME?',
      icon: HelpCircle,
      action: () => console.log('Ajuda OPME')
    }
  ];

  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-2xl font-bold mb-6">Chatbot FAB Variants</h2>
        <div className="flex flex-wrap gap-8">
          <div className="relative w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <ChatbotFAB 
              moduleColor="violet-500"
              iconVariant="bot"
              position="bottom-right"
              onClick={() => setIsOpen(true)}
            />
          </div>
          
          <div className="relative w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <ChatbotFAB 
              moduleColor="blue-500"
              iconVariant="brain"
              badge={3}
              position="bottom-right"
              onClick={() => setIsOpen(true)}
            />
          </div>
          
          <div className="relative w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <ChatbotFAB 
              moduleColor="green-500"
              iconVariant="sparkles"
              badge={9}
              position="bottom-right"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Suggestions Panel</h2>
        <div className="max-w-md">
          <SuggestionsPanel 
            suggestions={suggestions}
            onSelect={(suggestion) => console.log('Selected:', suggestion)}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Complete Chatbot</h2>
        <div className="flex gap-4">
          <Button onClick={() => setIsOpen(true)} leftIcon={Bell}>
            Open Chatbot
          </Button>
          
          <ChatbotWindow 
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            moduleContext={{
              name: "ICARUS AI Assistant",
              color: "violet-500"
            }}
            suggestions={suggestions}
            enableVoice
            enableFileUpload
            onSendMessage={(msg) => console.log('Message:', msg)}
          />
        </div>
      </section>
    </div>
  );
}

// ============================================
// FORM EXAMPLE (Complete Pattern)
// ============================================

export function CompleteFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    alert('Form submitted successfully!');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card variant="neumo" padding="lg">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Fill in your details to create a new account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input 
              label="Full Name"
              leftIcon={User}
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />
            
            <Input 
              label="Email Address"
              leftIcon={Mail}
              type="email"
              placeholder="john@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />
            
            <Input 
              label="Password"
              leftIcon={Lock}
              type="password"
              placeholder="Enter password"
              required
              hint="Must be at least 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
            />
            
            <Input 
              label="Confirm Password"
              leftIcon={Lock}
              type="password"
              placeholder="Confirm password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
            />
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              loading={isSubmitting}
              loadingText="Creating account..."
            >
              Create Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// ============================================
// DASHBOARD PATTERN
// ============================================

export function DashboardPattern() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-orx-text-muted">Overview of your system</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" leftIcon={Filter}>Filter</Button>
          <Button variant="ghost" leftIcon={Download}>Export</Button>
          <Button variant="primary" leftIcon={Plus}>Add New</Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '1,847', trend: '+12.5%', color: 'violet' },
          { label: 'Revenue', value: 'R$ 3.8M', trend: '+15.3%', color: 'green' },
          { label: 'Products', value: '12.4K', trend: '+5.2%', color: 'blue' },
          { label: 'Orders', value: '89', trend: '-8.1%', color: 'orange' }
        ].map((kpi, index) => (
          <Card key={index} variant="neumo" hoverable>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${kpi.color}-500 to-${kpi.color}-600 flex items-center justify-center`}>
                <User className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-orx-text-muted">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className={`text-xs ${kpi.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {kpi.trend}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}