import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Crown, ArrowLeft } from "lucide-react";

const UpgradePlan: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Chatboot Plus",
      price: "$20",
      period: "per month",
      description: "For power users who need more capabilities",
      popular: true,
      features: [
        "Access to GPT-4",
        "Faster response times",
        "Priority access during peak times",
        "Access to advanced features",
        "Up to 50 messages every 3 hours for GPT-4",
        "Browse with Bing",
        "Advanced data analysis",
        "File uploads",
      ],
      icon: <Zap className="w-6 h-6" />,
      buttonText: "Upgrade to Plus",
      buttonVariant: "default" as const,
    },
    {
      name: "Chatboot Team",
      price: "$25",
      period: "per user/month",
      description: "For teams that need to collaborate",
      popular: false,
      features: [
        "Everything in Plus",
        "Higher message caps",
        "Team workspace",
        "Admin controls",
        "Early access to new features",
        "Data excluded from training",
        "Secure team collaboration",
        "Bulk member management",
      ],
      icon: <Star className="w-6 h-6" />,
      buttonText: "Upgrade to Team",
      buttonVariant: "outline" as const,
    },
    {
      name: "Chatboot Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For organizations with advanced needs",
      popular: false,
      features: [
        "Everything in Team",
        "Unlimited high-speed GPT-4",
        "Advanced admin controls",
        "SSO and domain verification",
        "Analytics dashboard",
        "Priority support",
        "Custom data retention",
        "Advanced security features",
      ],
      icon: <Crown className="w-6 h-6" />,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/chat")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upgrade to unlock more powerful AI capabilities, faster responses,
            and advanced features to enhance your Chatboot experience.
          </p>
        </div>

        {/* Current Plan Info */}
        <div className="mb-8">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                Current Plan: Chatboot Free
              </CardTitle>
              <CardDescription>
                You're currently using the free version of Chatboot with access
                to GPT-3.5
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${plan.popular ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">
                    /{plan.period}
                  </span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">
                What happens if I cancel my subscription?
              </h3>
              <p className="text-muted-foreground text-sm">
                You'll continue to have access to your plan's features until the
                end of your billing period, then revert to the free version.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                will be reflected in your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Is there a student discount?
              </h3>
              <p className="text-muted-foreground text-sm">
                We offer educational discounts for eligible students and
                institutions. Contact support for more information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards and PayPal. Enterprise
                customers can also pay by invoice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlan;
