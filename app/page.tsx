"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import ReactMarkdown from 'react-markdown'
import {
  Search,
  LinkIcon,
  Settings,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  RefreshCw,
  Eye,
  Edit,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  ExternalLink,
  Plus,
  X,
  Upload,
  Wand2,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface StreamEvent {
  event: string
  data: {
    research?: string
    outline?: string
    content?: string
    factChecked?: string
    humanizedContent?: string
    seoOptimized?: string
    metadata?: string
    imageInstructions?: string
    usage?: {
      input_tokens: number
      output_tokens: number
      model: string
      estimated_cost: number
    }
    error?: string
  }
}

interface SocialLink {
  title: string
  url: string
}

interface FormData {
  keyword: string
  url: string
  title: string
  tone: string
  style: string
  length: string
  targetAudience: string
  language: string
  category: string
  geoFocus: string
  targetWordCount: string
  readingLevel: string
  authorName: string
  publicationDate: string
  includeImages: boolean
  includeMetadata: boolean
  includeSubtopics: boolean
  externalLinking: boolean
  internalLinking: boolean
  csvFile: File | null
  socialLinks: SocialLink[]
  customInstructions: string
  seoFocus: boolean
  factCheck: boolean
  humanize: boolean
  socialMediaOptimization: boolean
  includeTrendingTopics: boolean
  competitorAnalysis: boolean
  contentFreshness: string
  imageStyle: string
  apiKey: string
}

export default function EntertainmentNewsGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedContent, setGeneratedContent] = useState("")
  const [activeTab, setActiveTab] = useState("input")
  const [streamedEvents, setStreamedEvents] = useState<StreamEvent[]>([])

  // Form state
  const [formData, setFormData] = useState<FormData>({
    keyword: "",
    url: "",
    title: "",
    tone: "professional",
    style: "news",
    length: "medium",
    targetAudience: "general",
    language: "english",
    category: "breaking-news",
    geoFocus: "global",
    targetWordCount: "",
    readingLevel: "high-school",
    authorName: "",
    publicationDate: "",
    includeImages: true,
    includeMetadata: true,
    includeSubtopics: true,
    externalLinking: true,
    internalLinking: false,
    csvFile: null,
    socialLinks: [],
    customInstructions: "",
    seoFocus: true,
    factCheck: true,
    humanize: true,
    socialMediaOptimization: false,
    includeTrendingTopics: false,
    competitorAnalysis: false,
    contentFreshness: "week",
    imageStyle: "professional",
    apiKey: "",
  })

  const handleGenerate = async () => {
    // Switch to preview tab
    setActiveTab("preview")
  }

  const startGeneration = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedContent("")
    setStreamedEvents([])
    setActiveTab("output") // Switch to output tab when generation starts

    const loadingToast = toast.loading("Starting article generation...")

    try {
      // Prepare payload for API call
      const payload = {
        // Primary inputs
        keyword: formData.keyword,
        url: formData.url,
        title: formData.title,

        // Article settings
        tone: formData.tone,
        style: formData.style,
        length: formData.length,
        targetAudience: formData.targetAudience,
        language: formData.language,

        // Advanced settings
        category: formData.category,
        geoFocus: formData.geoFocus,
        targetWordCount: formData.targetWordCount ? Number.parseInt(formData.targetWordCount) : null,
        readingLevel: formData.readingLevel,
        authorName: formData.authorName,
        publicationDate: formData.publicationDate,

        // AI features
        includeImages: formData.includeImages,
        includeMetadata: formData.includeMetadata,
        includeSubtopics: formData.includeSubtopics,
        factCheck: formData.factCheck,
        humanize: formData.humanize,
        seoFocus: formData.seoFocus,

        // Linking options
        externalLinking: formData.externalLinking,
        internalLinking: formData.internalLinking,
        followUpLinks: formData.socialLinks,

        // Content optimization
        socialMediaOptimization: formData.socialMediaOptimization,
        includeTrendingTopics: formData.includeTrendingTopics,
        competitorAnalysis: formData.competitorAnalysis,
        contentFreshness: formData.contentFreshness,
        imageStyle: formData.imageStyle,

        // Custom instructions
        customInstructions: formData.customInstructions,

        // API configuration
        apiKey: formData.apiKey,
      }

      console.log("Starting generation with payload:", payload)

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorData.error}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Failed to get reader from response body")
      }

      const decoder = new TextDecoder()
      let eventCount = 0
      const totalExpectedEvents = 8

      // Manual parsing instead of using createParser
      let buffer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          console.log("Stream completed")
          toast.dismiss(loadingToast)
          toast.success("Article generation complete!")
          setGenerationProgress(100)
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || "" // Keep the last incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.substring(7).trim()
            console.log("Event type:", eventType)

            // Skip the completion event - don't process it
            if (eventType === "complete") {
              console.log("Skipping completion event")
              continue
            }
          } else if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim()
            if (dataStr === "" || dataStr === "{}") continue

            try {
              const data = JSON.parse(dataStr)
              console.log("Parsed data:", data)

              // Skip empty data objects
              if (Object.keys(data).length === 0) {
                console.log("Skipping empty data object")
                continue
              }

              // Find the event type from the data structure
              let eventType = "unknown"
              let content = ""

              if (data.research) {
                eventType = "research-complete"
                content = data.research
              } else if (data.outline) {
                eventType = "outline-complete"
                content = data.outline
              } else if (data.content) {
                eventType = "content-complete"
                content = data.content
              } else if (data.factChecked) {
                eventType = "fact-check-complete"
                content = data.factChecked
              } else if (data.humanizedContent) {
                eventType = "humanize-complete"
                content = data.humanizedContent
              } else if (data.seoOptimized) {
                eventType = "seo-complete"
                content = data.seoOptimized
              } else if (data.metadata) {
                eventType = "metadata-complete"
                content = data.metadata
              } else if (data.imageInstructions) {
                eventType = "images-complete"
                content = data.imageInstructions
              } else {
                // Skip unknown events with no meaningful content
                console.log("Skipping unknown event with no content")
                continue
              }

              console.log("Processing event:", eventType, "with content length:", content.length)

              // Update events
              setStreamedEvents((prev) => {
                const existingEventIndex = prev.findIndex((e) => e.event === eventType)
                if (existingEventIndex > -1) {
                  const updatedEvents = [...prev]
                  updatedEvents[existingEventIndex].data = data
                  return updatedEvents
                } else {
                  return [...prev, { event: eventType, data }]
                }
              })

              // Update progress
              eventCount++
              const progress = Math.min((eventCount / totalExpectedEvents) * 100, 100)
              setGenerationProgress(progress)

              // Update generated content with priority order
              if (eventType === "seo-complete" && data.seoOptimized) {
                console.log("Setting SEO optimized content")
                setGeneratedContent(data.seoOptimized)
              } else if (eventType === "humanize-complete" && data.humanizedContent) {
                console.log("Setting humanized content")
                setGeneratedContent(data.humanizedContent)
              } else if (eventType === "fact-check-complete" && data.factChecked) {
                console.log("Setting fact-checked content")
                setGeneratedContent(data.factChecked)
              } else if (eventType === "content-complete" && data.content) {
                console.log("Setting base content")
                setGeneratedContent(data.content)
              }

              // Update toast
              toast.loading(`Processing: ${eventType.replace("-", " ")}`, { id: loadingToast })
            } catch (e) {
              console.error("Error parsing event data:", e, "Data:", dataStr)
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error generating article:", error)
      toast.dismiss(loadingToast)
      toast.error(`Failed to generate article: ${error.message}`)
      setGeneratedContent(`Error: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { title: "", url: "" }],
    }))
  }

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }))
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      toast.success("Content copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy content")
    }
  }

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData.keyword.replace(/\s+/g, "-")}-article.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Content downloaded!")
  }

  const getEventDisplayData = (event: StreamEvent) => {
    const { data } = event

    switch (event.event) {
      case "research-complete":
        return data?.research || "Research data not available"
      case "outline-complete":
        return data?.outline || "Outline data not available"
      case "content-complete":
        return data?.content || "Content data not available"
      case "fact-check-complete":
        return data?.factChecked || "Fact-check data not available"
      case "humanize-complete":
        return data?.humanizedContent || "Humanized content not available"
      case "seo-complete":
        return data?.seoOptimized || "SEO content not available"
      case "metadata-complete":
        return data?.metadata || "Metadata not available"
      case "images-complete":
        return data?.imageInstructions || "Image instructions not available"
      default:
        return JSON.stringify(data)|| "No data available"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Entertainment News Article Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate comprehensive, humanized entertainment articles with AI-powered research, fact-checking, and SEO
            optimization
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={!isGenerating ? setActiveTab : undefined} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="input" className="flex items-center gap-2" disabled={isGenerating}>
              <Edit className="w-4 h-4" />
              Input & Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2" disabled={isGenerating}>
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="output" className="flex items-center gap-2" disabled={isGenerating}>
              <FileText className="w-4 h-4" />
              Generated Article
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Input Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Primary Input
                    </CardTitle>
                    <CardDescription>Enter your keyword or URL to generate an entertainment article</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="keyword">Keyword</Label>
                        <Input
                          id="keyword"
                          placeholder="e.g., Marvel movies 2024"
                          value={formData.keyword}
                          onChange={(e) => setFormData((prev) => ({ ...prev, keyword: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="url">URL (Optional)</Label>
                        <Input
                          id="url"
                          placeholder="https://example.com/article"
                          value={formData.url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title (Auto-generated if empty)</Label>
                      <Input
                        id="title"
                        placeholder="Leave empty for AI-generated title"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Article Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Article Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tone</Label>
                        <Select
                          value={formData.tone}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, tone: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="humorous">Humorous</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Style</Label>
                        <Select
                          value={formData.style}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, style: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="news">News Article</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="analysis">Analysis</SelectItem>
                            <SelectItem value="listicle">Listicle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Article Length</Label>
                        <Select
                          value={formData.length}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, length: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short (500-800 words)</SelectItem>
                            <SelectItem value="medium">Medium (800-1500 words)</SelectItem>
                            <SelectItem value="long">Long (1500-2500 words)</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive (2500+ words)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select
                          value={formData.targetAudience}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, targetAudience: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Public</SelectItem>
                            <SelectItem value="fans">Entertainment Fans</SelectItem>
                            <SelectItem value="industry">Industry Professionals</SelectItem>
                            <SelectItem value="critics">Critics & Reviewers</SelectItem>
                            <SelectItem value="youth">Young Adults</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Advanced Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Article Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breaking-news">Breaking News</SelectItem>
                            <SelectItem value="celebrity">Celebrity News</SelectItem>
                            <SelectItem value="movies">Movies</SelectItem>
                            <SelectItem value="tv-shows">TV Shows</SelectItem>
                            <SelectItem value="music">Music</SelectItem>
                            <SelectItem value="gaming">Gaming</SelectItem>
                            <SelectItem value="streaming">Streaming</SelectItem>
                            <SelectItem value="awards">Awards & Events</SelectItem>
                            <SelectItem value="industry">Industry News</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Geographic Focus</Label>
                        <Select
                          value={formData.geoFocus}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, geoFocus: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="europe">Europe</SelectItem>
                            <SelectItem value="asia">Asia</SelectItem>
                            <SelectItem value="local">Local/Regional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Target Word Count</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 1200"
                          value={formData.targetWordCount}
                          onChange={(e) => setFormData((prev) => ({ ...prev, targetWordCount: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reading Level</Label>
                        <Select
                          value={formData.readingLevel}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, readingLevel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="elementary">Elementary</SelectItem>
                            <SelectItem value="middle-school">Middle School</SelectItem>
                            <SelectItem value="high-school">High School</SelectItem>
                            <SelectItem value="college">College</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author-name">Author Name</Label>
                      <Input
                        id="author-name"
                        placeholder="e.g., John Smith"
                        value={formData.authorName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, authorName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publication-date">Publication Date</Label>
                      <Input
                        id="publication-date"
                        type="datetime-local"
                        value={formData.publicationDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, publicationDate: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Linking Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      Linking Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="external-linking"
                        checked={formData.externalLinking}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, externalLinking: checked as boolean }))
                        }
                      />
                      <Label htmlFor="external-linking">Enable External Linking (Automatic via AI)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="internal-linking"
                        checked={formData.internalLinking}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, internalLinking: checked as boolean }))
                        }
                      />
                      <Label htmlFor="internal-linking">Enable Internal Linking</Label>
                    </div>
                    {formData.internalLinking && (
                      <div className="space-y-2">
                        <Label htmlFor="csv-upload">Upload CSV for Internal Links</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".csv"
                            className="flex-1"
                            onChange={(e) => setFormData((prev) => ({ ...prev, csvFile: e.target.files?.[0] || null }))}
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      Social Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.socialLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Link title"
                          value={link.title}
                          onChange={(e) => {
                            const newLinks = [...formData.socialLinks]
                            newLinks[index].title = e.target.value
                            setFormData((prev) => ({ ...prev, socialLinks: newLinks }))
                          }}
                        />
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...formData.socialLinks]
                            newLinks[index].url = e.target.value
                            setFormData((prev) => ({ ...prev, socialLinks: newLinks }))
                          }}
                        />
                        <Button variant="outline" size="sm" onClick={() => removeSocialLink(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addSocialLink} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Social Link
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Sidebar */}
              <div className="space-y-6">
                {/* AI Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-images"
                        checked={formData.includeImages}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, includeImages: checked as boolean }))
                        }
                      />
                      <Label htmlFor="include-images">Generate Images</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-metadata"
                        checked={formData.includeMetadata}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, includeMetadata: checked as boolean }))
                        }
                      />
                      <Label htmlFor="include-metadata">Generate Metadata</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-subtopics"
                        checked={formData.includeSubtopics}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, includeSubtopics: checked as boolean }))
                        }
                      />
                      <Label htmlFor="include-subtopics">Extract Subtopics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fact-check"
                        checked={formData.factCheck}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, factCheck: checked as boolean }))
                        }
                      />
                      <Label htmlFor="fact-check">Fact Check</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="humanize"
                        checked={formData.humanize}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, humanize: checked as boolean }))
                        }
                      />
                      <Label htmlFor="humanize">Humanize Content</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seo-focus"
                        checked={formData.seoFocus}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, seoFocus: checked as boolean }))
                        }
                      />
                      <Label htmlFor="seo-focus">SEO Optimization</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Model Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Model Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key *</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={formData.apiKey}
                        onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                      />
                      <p className="text-xs text-gray-500">Your API key is used securely and not stored</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="portuguese">Portuguese</SelectItem>
                          <SelectItem value="dutch">Dutch</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                          <SelectItem value="korean">Korean</SelectItem>
                          <SelectItem value="chinese">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Optimization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Content Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="social-media-optimization"
                        checked={formData.socialMediaOptimization}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, socialMediaOptimization: checked as boolean }))
                        }
                      />
                      <Label htmlFor="social-media-optimization">Optimize for Social Media Sharing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trending-topics"
                        checked={formData.includeTrendingTopics}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, includeTrendingTopics: checked as boolean }))
                        }
                      />
                      <Label htmlFor="trending-topics">Include Trending Topics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="competitor-analysis"
                        checked={formData.competitorAnalysis}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, competitorAnalysis: checked as boolean }))
                        }
                      />
                      <Label htmlFor="competitor-analysis">Competitor Analysis</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Content Freshness</Label>
                      <Select
                        value={formData.contentFreshness}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, contentFreshness: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">Last 24 hours</SelectItem>
                          <SelectItem value="week">Last week</SelectItem>
                          <SelectItem value="month">Last month</SelectItem>
                          <SelectItem value="quarter">Last 3 months</SelectItem>
                          <SelectItem value="any">Any time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Image Style Preference</Label>
                      <Select
                        value={formData.imageStyle}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, imageStyle: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="artistic">Artistic</SelectItem>
                          <SelectItem value="candid">Candid</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="behind-scenes">Behind the Scenes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      Custom Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Add any specific instructions for the AI..."
                      value={formData.customInstructions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customInstructions: e.target.value }))}
                      rows={4}
                    />
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!formData.apiKey || (!formData.keyword && !formData.url) || isGenerating}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Article
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Article Preview
                </CardTitle>
                <CardDescription>
                  Review your input and settings. Click "Confirm and Generate" to start the process.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Keyword</Label>
                    <Badge variant="secondary">{formData.keyword || "Not set"}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tone</Label>
                    <Badge variant="outline">{formData.tone}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Style</Label>
                    <Badge variant="outline">{formData.style}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Length</Label>
                    <Badge variant="outline">{formData.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Target Audience</Label>
                    <Badge variant="outline">{formData.targetAudience}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Language</Label>
                    <Badge variant="outline">{formData.language}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Enabled Features</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.includeImages && <Badge className="bg-green-100 text-green-800">Images</Badge>}
                    {formData.includeMetadata && <Badge className="bg-blue-100 text-blue-800">Metadata</Badge>}
                    {formData.includeSubtopics && <Badge className="bg-purple-100 text-purple-800">Subtopics</Badge>}
                    {formData.factCheck && <Badge className="bg-orange-100 text-orange-800">Fact Check</Badge>}
                    {formData.humanize && <Badge className="bg-pink-100 text-pink-800">Humanize</Badge>}
                    {formData.seoFocus && <Badge className="bg-indigo-100 text-indigo-800">SEO</Badge>}
                    {formData.externalLinking && (
                      <Badge className="bg-yellow-100 text-yellow-800">External Links</Badge>
                    )}
                    {formData.internalLinking && <Badge className="bg-red-100 text-red-800">Internal Links</Badge>}
                    {formData.socialLinks.length > 0 && (
                      <Badge className="bg-blue-100 text-blue-800">Social Links</Badge>
                    )}
                  </div>
                </div>

                <Button onClick={startGeneration} disabled={isGenerating} className="w-full h-12 text-lg" size="lg">
                  {isGenerating ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5 mr-2" />
                  )}
                  {isGenerating ? "Generating..." : "Confirm and Generate"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Output Tab */}
          <TabsContent value="output" className="space-y-6">
            {/* Debug Info */}
            {process.env.NODE_ENV === "development" && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Debug Info</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div>Events received: {streamedEvents.length}</div>
                  <div>Generated content length: {generatedContent.length}</div>
                  <div>Is generating: {isGenerating.toString()}</div>
                  <div>Progress: {generationProgress}%</div>
                </CardContent>
              </Card>
            )}

            {streamedEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isGenerating ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isGenerating ? "Generating Your Article" : "Generation Complete"}
                  </CardTitle>
                  {isGenerating && (
                    <CardDescription>Streamed events are displayed below as they are received.</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {isGenerating && <Progress value={generationProgress} className="w-full" />}
                  <div className="text-sm text-gray-600">
                    <Accordion type="single" collapsible className="w-full">
                      {streamedEvents.map((event, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {event.event?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
                                "Unknown Event"}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <strong>Event Type:</strong> {event.event || "Unknown"}
                                </div>
                                <div>
                                  <strong>Status:</strong> <span className="text-green-600">Complete</span>
                                </div>
                              </div>

                              {event.data.usage && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                  <div>
                                    <strong>Input Tokens:</strong> {event.data.usage.input_tokens.toLocaleString()}
                                  </div>
                                  <div>
                                    <strong>Output Tokens:</strong> {event.data.usage.output_tokens.toLocaleString()}
                                  </div>
                                  <div>
                                    <strong>Model:</strong> {event.data.usage.model}
                                  </div>
                                  <div>
                                    <strong>Estimated Cost:</strong> ${event.data.usage.estimated_cost.toFixed(6)}
                                  </div>
                                </div>
                              )}

                              <div className="pt-2 border-t">
                                <strong>Response:</strong>
                                <div className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-y-auto">
                                  <ReactMarkdown>
                                    {getEventDisplayData(event)}
                                  </ReactMarkdown>
                                </div>
                              </div>

                              {event.data.error && (
                                <div className="pt-2 border-t">
                                  <strong className="text-red-600">Error:</strong>
                                  <div className="text-red-600">{event.data.error}</div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            )}

            {generatedContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Article
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.ceil(generatedContent.split(" ").length / 200)} min read
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formData.targetAudience} audience
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {generatedContent.split(" ").length} words
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadContent}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full rounded border p-4">
                    <div className="prose max-w-none">
                      <ReactMarkdown>
                        {generatedContent}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {!isGenerating && !generatedContent && streamedEvents.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Article Generated Yet</h3>
                  <p className="text-gray-600 mb-4">Go back to the input tab and generate your first article</p>
                  <Button onClick={() => setActiveTab("input")}>Go to Input</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
