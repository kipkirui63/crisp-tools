import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Check, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';
import { subscriptions } from '../lib/api';

interface PricingPlan {
  id: string;
  name: string;
  icon: typeof Sparkles;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
  gradient: string;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Sparkles,
    price: 9,
    credits: 500,
    gradient: 'from-slate-500 to-slate-600',
    features: [
      '500 generation credits',
      'Access to all 9 tools',
      'Basic AI models',
      'Standard support',
      'Download in HD',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    price: 29,
    credits: 2000,
    popular: true,
    gradient: 'from-cyan-500 to-blue-500',
    features: [
      '2,000 generation credits',
      'Access to all 9 tools',
      'Premium AI models',
      'Priority support',
      'Download in 4K',
      'Batch processing',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    price: 99,
    credits: 10000,
    gradient: 'from-purple-500 to-pink-500',
    features: [
      '10,000 generation credits',
      'Access to all 9 tools',
      'All premium models',
      'Dedicated support',
      'Download in 8K',
      'Batch processing',
      'API access',
      'Custom integrations',
    ],
  },
];

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [processing, setProcessing] = useState(false);
  const { user, refreshProfile } = useAuth();

  const handlePurchase = async () => {
    if (!user) return;

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    setProcessing(true);

    try {
      const { data, error } = await subscriptions.purchase(selectedPlan as 'starter' | 'pro' | 'enterprise');

      if (error) {
        throw new Error(error);
      }

      await refreshProfile();
    } catch (err: any) {
      console.error('Purchase error:', err);
      alert(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-cyan-500/50">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Choose Your Plan</h1>
          <p className="text-xl text-slate-400">
            Select a plan to unlock the full power of Crisp AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-cyan-500 bg-slate-800/80 shadow-xl shadow-cyan-500/20 scale-105'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80'
                } ${plan.popular ? 'md:scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.gradient} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{plan.credits.toLocaleString()} credits</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-cyan-400" />
                      </div>
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-cyan-500/5 pointer-events-none"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Selected Plan</h3>
              <p className="text-slate-400">
                {plans.find((p) => p.id === selectedPlan)?.name} -{' '}
                {plans.find((p) => p.id === selectedPlan)?.credits.toLocaleString()} credits
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                ${plans.find((p) => p.id === selectedPlan)?.price}
              </div>
              <div className="text-sm text-slate-400">billed monthly</div>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={processing}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 text-lg"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                Complete Purchase
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-400 mt-4">
            Secure checkout powered by Crisp AI. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
