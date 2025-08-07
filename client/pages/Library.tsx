import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  BookOpen,
  FileText,
  Image,
  Brain,
  Globe,
  Download,
  Share2,
  MoreHorizontal,
  Calendar,
  Tag,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Chat, FileAttachment, ChatModel } from "@shared/types";

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [pdfs, setPdfs] = useState<FileAttachment[]>([]);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all uploaded files and models
  useEffect(() => {
    const fetchLibraryData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        // Get all uploaded files (PDFs)
        const filesResponse = await apiService.getAllFiles();
        if (filesResponse.success && filesResponse.data) {
          // Filter for PDF files only
          const pdfFiles = filesResponse.data.filter(
            (file) => file.type === "application/pdf",
          );
          setPdfs(pdfFiles);
        }

        // Get available models
        const modelsResponse = await apiService.getModels();
        if (modelsResponse.success && modelsResponse.data) {
          setModels(modelsResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch library data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibraryData();
  }, [user?.id]);

  // Convert data to library items format
  const libraryItems = [
    // PDF documents
    ...pdfs.map((pdf) => ({
      id: pdf.id,
      title: pdf.name,
      description: `PDF document uploaded on ${new Date(pdf.uploadedAt).toLocaleDateString()}`,
      type: "document" as const,
      category: "Documents",
      date: pdf.uploadedAt,
      size: `${(pdf.size / 1024).toFixed(1)} KB`,
      icon: <FileText className="w-5 h-5" />,
      tags: ["pdf", "document"],
      downloadUrl: pdf.url,
      badge: "PDF",
    })),
    // AI Models
    ...models.map((model) => ({
      id: model.id,
      title: model.name,
      description: model.description,
      type: "model" as const,
      category: "AI Models",
      date: new Date().toISOString(), // Models don't have dates, use current
      size: model.isAvailable ? "Available" : "Unavailable",
      icon:
        model.id === "cloud" ? (
          <Globe className="w-5 h-5" />
        ) : (
          <Brain className="w-5 h-5" />
        ),
      tags: ["ai", "model", model.category],
      badge: model.isAvailable ? "Available" : "Offline",
      enabled: model.isAvailable,
    })),
  ];

  const typeFilters = [
    { key: "all", label: "All Items", icon: <BookOpen className="w-4 h-4" /> },
    {
      key: "document",
      label: "Documents",
      icon: <FileText className="w-4 h-4" />,
    },
    { key: "model", label: "Models", icon: <Brain className="w-4 h-4" /> },
  ];

  const filteredItems = libraryItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesType = activeTab === "all" || item.type === activeTab;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "model":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "design":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const handleDownload = (item: any) => {
    if (item.downloadUrl) {
      const link = document.createElement("a");
      link.href = item.downloadUrl;
      link.download = item.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Your Library
          </h1>
          <p className="text-lg text-muted-foreground">
            Organize and access all your saved content, templates, and resources
            in one place.
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
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
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

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Content Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {item.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={getTypeColor(item.type)}
                          >
                            {item.type}
                          </Badge>
                          {item.badge && (
                            <Badge variant="outline" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {item.size}
                          </span>
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
                        {item.type === "document" && item.downloadUrl && (
                          <DropdownMenuItem
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        )}
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
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
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
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms or filters."
                : activeTab === "document"
                  ? "No PDF documents found. Upload PDF files to see them here."
                  : activeTab === "model"
                    ? "No models available. Check your configuration."
                    : "Your library is empty. Start uploading files to see content here."}
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
          <Button
            size="lg"
            className="rounded-full shadow-lg"
            onClick={() => navigate("/chat")}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Start Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Library;
