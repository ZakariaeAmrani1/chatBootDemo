import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  Image, 
  Code, 
  Download,
  Share2,
  MoreHorizontal,
  Calendar,
  Tag
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Library: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const libraryItems = [
    {
      id: "1",
      title: "Marketing Campaign Strategy",
      description: "Comprehensive plan for Q4 marketing initiatives including social media, email campaigns, and content strategy.",
      type: "document",
      category: "Marketing",
      date: "2024-01-15",
      size: "2.3 MB",
      icon: <FileText className="w-5 h-5" />,
      tags: ["strategy", "marketing", "planning"]
    },
    {
      id: "2", 
      title: "React Component Library",
      description: "Collection of reusable React components with TypeScript definitions and Storybook documentation.",
      type: "code",
      category: "Development",
      date: "2024-01-12",
      size: "854 KB",
      icon: <Code className="w-5 h-5" />,
      tags: ["react", "typescript", "components"]
    },
    {
      id: "3",
      title: "Brand Identity Guidelines",
      description: "Complete brand guidelines including logo usage, color palette, typography, and visual style principles.",
      type: "design",
      category: "Design",
      date: "2024-01-10",
      size: "5.1 MB",
      icon: <Image className="w-5 h-5" />,
      tags: ["branding", "design", "guidelines"]
    },
    {
      id: "4",
      title: "Project Management Playbook",
      description: "Best practices and templates for managing software development projects from inception to deployment.",
      type: "document",
      category: "Management",
      date: "2024-01-08",
      size: "1.7 MB",
      icon: <BookOpen className="w-5 h-5" />,
      tags: ["project management", "templates", "processes"]
    },
    {
      id: "5",
      title: "API Documentation Template",
      description: "Standardized template for documenting REST APIs with examples, authentication, and error handling.",
      type: "document",
      category: "Development",
      date: "2024-01-05",
      size: "943 KB",
      icon: <FileText className="w-5 h-5" />,
      tags: ["api", "documentation", "template"]
    },
    {
      id: "6",
      title: "User Research Findings",
      description: "Compiled insights from user interviews, surveys, and usability testing sessions for product improvements.",
      type: "document",
      category: "Research",
      date: "2024-01-03",
      size: "3.2 MB",
      icon: <FileText className="w-5 h-5" />,
      tags: ["research", "users", "insights"]
    }
  ];

  const categories = ["All", "Marketing", "Development", "Design", "Management", "Research"];
  const typeFilters = [
    { key: "all", label: "All Items", icon: <BookOpen className="w-4 h-4" /> },
    { key: "document", label: "Documents", icon: <FileText className="w-4 h-4" /> },
    { key: "code", label: "Code", icon: <Code className="w-4 h-4" /> },
    { key: "design", label: "Design", icon: <Image className="w-4 h-4" /> }
  ];

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = activeTab === "all" || item.type === activeTab;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "code": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "design": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Your Library
          </h1>
          <p className="text-lg text-muted-foreground">
            Organize and access all your saved content, templates, and resources in one place.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          {/* Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              {typeFilters.map((filter) => (
                <TabsTrigger 
                  key={filter.key} 
                  value={filter.key}
                  className="flex items-center gap-2"
                >
                  {filter.icon}
                  <span className="hidden sm:inline">{filter.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.size}</span>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-sm mb-4 line-clamp-3">
                  {item.description}
                </CardDescription>

                <div className="space-y-3">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <span>{item.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 
                "Try adjusting your search terms or filters." :
                "Your library is empty. Start saving content to see it here."
              }
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="fixed bottom-6 right-6">
          <Button size="lg" className="rounded-full shadow-lg">
            <BookOpen className="w-5 h-5 mr-2" />
            Add to Library
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Library;
