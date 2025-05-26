import { 
    buildResearchPrompt, 
    buildOutlinePrompt, 
    buildContentPrompt, 
    buildMetadataPrompt,
    buildImagePrompt,
    buildSEOPrompt,
    buildFactCheckPrompt,
    buildHumanizePrompt
  } from "@/lib/prompts";
  
  export default function steps(body: any, NextResponse: any) {
    const pipeline = [];
  
    // Step 1: Research & Topic Analysis (Always included)
    pipeline.push({
      inputBuilder: (results: Record<string, any>) => {
        return JSON.stringify({
          keyword: body.keyword,
          url: body.url,
          geoFocus: body.geoFocus,
          targetAudience: body.targetAudience,
          category: body.category,
          includeTrendingTopics: body.includeTrendingTopics,
          competitorAnalysis: body.competitorAnalysis,
          contentFreshness: body.contentFreshness,
          customInstructions: body.customInstructions
        });
      },
      prompt: buildResearchPrompt(body),
      resultKey: "research",
      eventName: "research-complete"
    });
  
    // Step 2: Article Outline Generation (Always included)
    pipeline.push({
      inputBuilder: (results: Record<string, any>) => {
        return JSON.stringify({
          research: results.research,
          keyword: body.keyword,
          title: body.title,
          targetWordCount: body.targetWordCount,
          includeSubtopics: body.includeSubtopics,
          readingLevel: body.readingLevel,
          style: body.style
        });
      },
      prompt: buildOutlinePrompt(body),
      resultKey: "outline",
      eventName: "outline-complete"
    });
  
    // Step 3: Content Generation (Always included)
    pipeline.push({
      inputBuilder: (results: Record<string, any>) => {
        return JSON.stringify({
          research: results.research,
          outline: results.outline,
          keyword: body.keyword,
          title: body.title || "Auto-generated",
          tone: body.tone,
          style: body.style,
          length: body.length,
          targetAudience: body.targetAudience,
          readingLevel: body.readingLevel,
          authorName: body.authorName,
          publicationDate: body.publicationDate,
          externalLinking: body.externalLinking,
          internalLinking: body.internalLinking,
          customInstructions: body.customInstructions
        });
      },
      prompt: buildContentPrompt(body),
      resultKey: "content",
      eventName: "content-complete"
    });
  
    // Step 4: Fact Checking (Conditional)
    if (body.factCheck) {
      pipeline.push({
        inputBuilder: (results: Record<string, any>) => {
          return JSON.stringify({
            content: results.content,
            research: results.research,
            keyword: body.keyword
          });
        },
        prompt: buildFactCheckPrompt(body),
        resultKey: "factChecked",
        eventName: "fact-check-complete"
      });
    }
  
    // Step 5: Content Humanization (Conditional)
    if (body.humanize) {
      pipeline.push({
        inputBuilder: (results: Record<string, any>) => {
          const contentToHumanize = body.factCheck ? results.factChecked : results.content;
          return JSON.stringify({
            content: contentToHumanize,
            tone: body.tone,
            targetAudience: body.targetAudience,
            readingLevel: body.readingLevel
          });
        },
        prompt: buildHumanizePrompt(body),
        resultKey: "humanizedContent",
        eventName: "humanize-complete"
      });
    }
  
    // Step 6: SEO Optimization (Conditional)
    if (body.seoFocus) {
      pipeline.push({
        inputBuilder: (results: Record<string, any>) => {
          let finalContent = results.content;
          if (body.factCheck) finalContent = results.factChecked;
          if (body.humanize) finalContent = results.humanizedContent;
          
          return JSON.stringify({
            content: finalContent,
            keyword: body.keyword,
            targetAudience: body.targetAudience,
            geoFocus: body.geoFocus,
            socialMediaOptimization: body.socialMediaOptimization
          });
        },
        prompt: buildSEOPrompt(body),
        resultKey: "seoOptimized",
        eventName: "seo-complete"
      });
    }
  
    // Step 7: Metadata Generation (Conditional)
    if (body.includeMetadata) {
      pipeline.push({
        inputBuilder: (results: Record<string, any>) => {
          let finalContent = results.content;
          if (body.seoFocus) finalContent = results.seoOptimized;
          else if (body.humanize) finalContent = results.humanizedContent;
          else if (body.factCheck) finalContent = results.factChecked;
          
          return JSON.stringify({
            content: finalContent,
            keyword: body.keyword,
            title: body.title,
            targetAudience: body.targetAudience,
            category: body.category,
            authorName: body.authorName,
            publicationDate: body.publicationDate
          });
        },
        prompt: buildMetadataPrompt(body),
        resultKey: "metadata",
        eventName: "metadata-complete"
      });
    }
  
    // Step 8: Image Generation Instructions (Conditional)
    if (body.includeImages) {
      pipeline.push({
        inputBuilder: (results: Record<string, any>) => {
          let finalContent = results.content;
          if (body.seoFocus) finalContent = results.seoOptimized;
          else if (body.humanize) finalContent = results.humanizedContent;
          else if (body.factCheck) finalContent = results.factChecked;
          
          return JSON.stringify({
            content: finalContent,
            outline: results.outline,
            keyword: body.keyword,
            imageStyle: body.imageStyle,
            targetAudience: body.targetAudience
          });
        },
        prompt: buildImagePrompt(body),
        resultKey: "imageInstructions",
        eventName: "images-complete"
      });
    }
  
    return pipeline;
  }