import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MessageCircle,
  Mail,
  Book,
  HelpCircle,
  ExternalLink,
  Lightbulb,
  Shield,
  CreditCard,
  Settings,
  User,
  Zap,
  ArrowLeft,
} from "lucide-react";

const HelpFAQ: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const faqCategories = [
    {
      id: "all",
      label: "All Topics",
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: "getting-started",
      label: "Getting Started",
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      id: "account",
      label: "Account & Billing",
      icon: <User className="w-4 h-4" />,
    },
    { id: "features", label: "Features", icon: <Zap className="w-4 h-4" /> },
    {
      id: "privacy",
      label: "Privacy & Security",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: "technical",
      label: "Technical",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const faqs = [
    {
      category: "getting-started",
      question: "How do I get started with ChatNova?",
      answer:
        "Getting started is easy! Simply create an account, and you can begin chatting immediately. Type your questions or requests in the chat box, and ChatNova will respond. You can ask about anything from writing help to coding assistance to general knowledge questions.",
    },
    {
      category: "getting-started",
      question: "What can I use ChatNova for?",
      answer:
        "ChatNova can help with a wide variety of tasks including writing and editing, coding and programming, research and analysis, creative brainstorming, language translation, math and problem-solving, and much more. It's designed to be a versatile AI assistant for both personal and professional use.",
    },
    {
      category: "features",
      question: "What's the difference between GPT-3.5 and GPT-4?",
      answer:
        "GPT-4 is our most advanced model, offering improved reasoning, better code generation, more accurate responses, and enhanced creative capabilities. GPT-4 can also process images and has a larger context window. GPT-3.5 is faster and available to all users, while GPT-4 requires a ChatGPT Plus subscription.",
    },
    {
      category: "features",
      question: "Can ChatNova browse the internet?",
      answer:
        "ChatNova Plus subscribers have access to Browse with Bing, which allows ChatNova to search the internet for current information and provide up-to-date responses. Free users have access to training data up to April 2024.",
    },
    {
      category: "features",
      question: "How do I upload files to ChatNova?",
      answer:
        "ChatNova Plus subscribers can upload various file types including documents, images, and code files. Simply click the attachment icon in the chat input area and select your file. ChatNova can analyze, summarize, edit, and work with your uploaded content.",
    },
    {
      category: "account",
      question: "How much does ChatNova cost?",
      answer:
        "ChatNova offers a free tier with access to GPT-3.5. ChatNova Plus costs $20/month and includes access to GPT-4, faster response times, priority access, and additional features like Browse with Bing and Advanced Data Analysis.",
    },
    {
      category: "account",
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your ChatNova Plus subscription at any time through your account settings. Go to 'Manage my subscription' and select 'Cancel plan'. You'll continue to have access to Plus features until the end of your current billing period.",
    },
    {
      category: "account",
      question: "Can I get a refund?",
      answer:
        "We generally don't provide refunds for monthly subscriptions, but we evaluate refund requests on a case-by-case basis. If you're experiencing technical issues or billing errors, please contact our support team for assistance.",
    },
    {
      category: "privacy",
      question: "How is my data used to train ChatNova?",
      answer:
        "By default, conversations may be used to improve our models. However, ChatNova Plus, Team, and Enterprise users can opt out of having their data used for training. You can control this setting in your account preferences.",
    },
    {
      category: "privacy",
      question: "Is my conversation data secure?",
      answer:
        "We take data security seriously. Conversations are encrypted in transit and at rest. We have strict access controls and regularly audit our security practices. Enterprise customers get additional security features and compliance certifications.",
    },
    {
      category: "privacy",
      question: "Can I delete my conversation history?",
      answer:
        "Yes, you can delete individual conversations or clear your entire chat history. Go to Settings > Data Controls to manage your conversation history. Deleted conversations cannot be recovered.",
    },
    {
      category: "technical",
      question: "Why is ChatNova slow or unavailable?",
      answer:
        "High demand can sometimes cause slower response times or temporary unavailability. ChatNova Plus subscribers get priority access during peak times. If you're experiencing persistent issues, try refreshing the page or checking our status page.",
    },
    {
      category: "technical",
      question: "What should I do if ChatNova gives incorrect information?",
      answer:
        "While ChatNova is highly capable, it can sometimes provide inaccurate information. Always verify important information from authoritative sources. You can help improve ChatNova by providing feedback on responses using the thumbs up/down buttons.",
    },
    {
      category: "technical",
      question: "Are there usage limits?",
      answer:
        "Free users have access to ChatNova with some usage limitations during peak times. ChatNova Plus users get priority access and higher usage limits. GPT-4 has specific message caps (50 messages every 3 hours) to ensure availability for all Plus users.",
    },
  ];

  const supportResources = [
    {
      title: "User Guide",
      description: "Complete guide to using ChatNova effectively",
      icon: <Book className="w-6 h-6" />,
      link: "#",
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: <Mail className="w-6 h-6" />,
      link: "#",
    },
    {
      title: "Community Forum",
      description: "Connect with other ChatNova users",
      icon: <MessageCircle className="w-6 h-6" />,
      link: "#",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            Help & FAQ
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and get help with using ChatNova
            effectively.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Help Resources */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {supportResources.map((resource, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {resource.icon}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{resource.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {resource.description}
                    </CardDescription>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* FAQ Categories */}
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {faqCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-1 text-xs"
              >
                {category.icon}
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* FAQ Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              {filteredFaqs.length} question
              {filteredFaqs.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1 text-xs">
                          {
                            faqCategories.find((cat) => cat.id === faq.category)
                              ?.label
                          }
                        </Badge>
                        <span className="flex-1">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pt-0 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No questions found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or browse different
                  categories.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Still need help?
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Our support team is here to
              help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Join Community
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpFAQ;
