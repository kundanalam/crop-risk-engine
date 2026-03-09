import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Sprout, 
  CloudRain, 
  Droplets, 
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Info,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle2,
  MessageSquare,
  X,
  Send,
  Bot,
  User
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type RiskLevel = 'Low' | 'Medium' | 'High';

interface AssessmentResult {
  score: number;
  level: RiskLevel;
  recommendation: string;
  explanation: string;
  contributions: { name: string; value: number }[];
}

interface FormData {
  crop: string;
  rainfall: string;
  temperature: string;
  soilMoisture: string;
  farmArea: string;
}

// --- Components ---

const Card = ({ children, className, id }: { children: React.ReactNode; className?: string; id?: string; key?: React.Key }) => (
  <div id={id} className={cn("bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  id,
  type = 'button'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  id?: string;
  type?: 'button' | 'submit';
}) => {
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100"
  };

  return (
    <button 
      id={id}
      type={type}
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, options, id }: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  options?: string[];
  id: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    {options ? (
      <select 
        id={id}
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-600"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input 
        id={id}
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-600"
        placeholder="Enter value"
      />
    )}
  </div>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Hello! I am AgriBot. How can I help you with your crop insurance risk assessment today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are AgriBot, an expert assistant for the Multi-Factor Crop Insurance Risk Assessment Engine. You help farmers understand their risk scores, explain factors like soil health, rainfall, and temperature, and provide guidance on insurance plans. Keep your answers professional, helpful, and focused on agricultural risk management.",
        },
      });

      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I'm sorry, I couldn't process that. Please try again." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-bold">AgriBot Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-emerald-700 p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm",
                    msg.role === 'user' 
                      ? "bg-emerald-600 text-white rounded-tr-none" 
                      : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your risk..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90",
          isOpen ? "bg-slate-900 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<'home' | 'form' | 'results'>('home');
  const [formData, setFormData] = useState<FormData>({
    crop: 'Wheat',
    rainfall: '500',
    temperature: '25',
    soilMoisture: '50',
    farmArea: '10'
  });
  const [scenario, setScenario] = useState<string>('Normal');
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAssess = async (currentScenario = scenario) => {
    setLoading(true);
    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, scenario: currentScenario })
      });
      const data = await response.json();
      setResult(data);
      setStep('results');
    } catch (error) {
      console.error("Assessment failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioChange = (newScenario: string) => {
    setScenario(newScenario);
    handleAssess(newScenario);
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('home')}>
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">AgriGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-emerald-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
          </div>
          <Button variant="outline" className="hidden sm:flex" onClick={() => setStep('form')}>
            New Assessment
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center py-12 md:py-24"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-100">
                <Activity className="w-4 h-4" />
                Next-Gen Agricultural Risk Intelligence
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl">
                Secure Your Harvest with <span className="text-emerald-600">Data-Driven</span> Risk Assessment
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-2xl leading-relaxed">
                Our Multi-Factor Engine evaluates soil health, climate exposure, and irrigation reliability to provide precise insurance recommendations for your farm.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button id="start-btn" className="px-10 py-4 text-lg" onClick={() => setStep('form')}>
                  Start Risk Assessment <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" className="px-10 py-4 text-lg">
                  View Case Studies
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
                {[
                  { icon: Sprout, title: "Soil Analysis", desc: "Evaluate nutrient levels and soil stability factors." },
                  { icon: CloudRain, title: "Climate Modeling", desc: "Predict impact of regional weather patterns." },
                  { icon: Droplets, title: "Irrigation Audit", desc: "Assess water source reliability and efficiency." }
                ].map((feature, i) => (
                  <Card key={i} className="p-8 text-left hover:border-emerald-200 transition-colors group">
                    <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-50 transition-colors">
                      <feature.icon className="text-slate-600 group-hover:text-emerald-600 w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-slate-500">{feature.desc}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="p-8 md:p-12">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2">Farm Profile</h2>
                  <p className="text-slate-500">Provide details about your agricultural operation to begin the assessment.</p>
                </div>
                
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleAssess(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      id="crop-input"
                      label="Crop Type" 
                      value={formData.crop} 
                      onChange={(val) => setFormData({...formData, crop: val})} 
                      options={['Wheat', 'Corn', 'Rice', 'Vegetables', 'Fruits']}
                    />
                    <Input 
                      id="rainfall-input"
                      label="Rainfall (mm)" 
                      value={formData.rainfall} 
                      onChange={(val) => setFormData({...formData, rainfall: val})} 
                    />
                    <Input 
                      id="temperature-input"
                      label="Temperature (°C)" 
                      value={formData.temperature} 
                      onChange={(val) => setFormData({...formData, temperature: val})} 
                    />
                    <Input 
                      id="moisture-input"
                      label="Soil Moisture (%)" 
                      value={formData.soilMoisture} 
                      onChange={(val) => setFormData({...formData, soilMoisture: val})} 
                    />
                  </div>
                  <Input 
                    id="area-input"
                    label="Farm Area (Acres)" 
                    value={formData.farmArea} 
                    onChange={(val) => setFormData({...formData, farmArea: val})} 
                  />
                  
                  <div className="pt-4 flex gap-4">
                    <Button id="submit-btn" type="submit" className="flex-1 py-4" onClick={() => {}}>
                      {loading ? "Analyzing..." : "Generate Risk Report"}
                    </Button>
                    <Button variant="outline" onClick={() => setStep('home')}>Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 'results' && result && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="p-8 flex flex-col items-center justify-center text-center lg:col-span-1">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Score</h3>
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-100"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={552.9}
                        strokeDashoffset={552.9 - (552.9 * result.score) / 100}
                        className={cn(
                          "transition-all duration-1000 ease-out",
                          result.score > 70 ? "text-rose-500" : result.score > 40 ? "text-amber-500" : "text-emerald-500"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black">{result.score}</span>
                      <span className="text-xs font-bold text-slate-400">OUT OF 100</span>
                    </div>
                  </div>
                  <div className={cn(
                    "mt-6 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider",
                    result.level === 'High' ? "bg-rose-50 text-rose-600" : result.level === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {result.level} Risk Level
                  </div>
                </Card>

                <Card className="p-8 lg:col-span-2 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-emerald-500/20 p-2 rounded-lg">
                        <ShieldCheck className="text-emerald-400 w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold">Recommended Insurance</h3>
                    </div>
                    <h2 className="text-4xl font-black mb-4 text-emerald-400">{result.recommendation}</h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl">
                      {result.explanation}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-emerald-500 hover:bg-emerald-400 border-none">Apply Now</Button>
                      <Button variant="outline" className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800">Download Policy Details</Button>
                    </div>
                  </div>
                  {/* Decorative background element */}
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
                </Card>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Factor Contributions */}
                <Card className="p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                      Risk Factor Contributions
                    </h3>
                    <div className="text-xs text-slate-400 font-medium">WEIGHTED SCORING</div>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.contributions} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                          {result.contributions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Scenario Simulator */}
                <Card className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Scenario Simulator
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Test how environmental changes affect your risk.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {['Normal', 'Drought', 'Rainfall Reduction', 'Pest Outbreak'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleScenarioChange(s)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group",
                          scenario === s 
                            ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200" 
                            : "bg-white border-slate-200 hover:border-emerald-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            scenario === s ? "bg-emerald-500" : "bg-slate-300"
                          )} />
                          <span className={cn(
                            "font-medium",
                            scenario === s ? "text-emerald-900" : "text-slate-600"
                          )}>{s}</span>
                        </div>
                        {scenario === s && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Scenarios simulate extreme events. A <strong>Drought</strong> increases climate risk by 15%, while a <strong>Pest Outbreak</strong> adds a 20% flat risk penalty to the crop factor.
                    </p>
                  </div>
                </Card>
              </div>

              {/* Explainability Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-emerald-600" />
                    Risk Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.contributions}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {result.contributions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {result.contributions.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs font-medium text-slate-600">{c.name}: {c.value}%</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Risk Trend Analysis
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: 'Normal', score: result.score - 10 },
                        { name: 'Current', score: result.score },
                        { name: 'Max Risk', score: 100 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-slate-500 mt-4 italic">
                    * This trend shows how your current risk compares to baseline and worst-case scenarios.
                  </p>
                </Card>
              </div>

              <div className="flex justify-center pt-8">
                <Button variant="outline" className="px-8" onClick={() => setStep('form')}>
                  Back to Assessment
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-800">AgriGuard</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Empowering farmers with advanced risk assessment tools to ensure sustainable agriculture and financial security.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Risk Engine</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Insurance Plans</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">API Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs">
          © 2026 AgriGuard Risk Assessment Engine. All rights reserved.
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
