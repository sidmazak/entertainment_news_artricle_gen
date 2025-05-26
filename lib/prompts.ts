// Research & Topic Analysis Prompt
export function buildResearchPrompt(body: any): string {
    return `# Research & Topic Analysis Task
  
  ## Primary Context
  - **Keyword/Topic**: "${body.keyword}"
  - **URL Reference**: ${body.url || "No URL provided"}
  - **Article Category**: ${body.category}
  - **Geographic Focus**: ${body.geoFocus}
  - **Target Audience**: ${body.targetAudience}
  
  ## Research Requirements
  ${body.includeTrendingTopics ? "✅ **Include trending topics and current discussions**" : ""}
  ${body.competitorAnalysis ? "✅ **Perform competitor content analysis**" : ""}
  ${body.contentFreshness === "Last week" ? "✅ **Focus on very recent developments (last 7 days)**" : 
    body.contentFreshness === "Last month" ? "✅ **Include recent developments (last 30 days)**" : 
    "✅ **Include current and relevant information**"}
  
  ## Custom Instructions
  ${body.customInstructions ? `**Special Requirements**: ${body.customInstructions}` : "No additional requirements"}
  
  ## Expected Output Format
  Provide comprehensive research in **markdown format** including:
  
  ### 📊 Topic Overview
  - Core concepts and definitions
  - Current relevance and importance
  - Key statistics and data points
  
  ### 🔍 Market/Industry Analysis
  ${body.competitorAnalysis ? `
  - Competitor content analysis
  - Content gaps and opportunities
  - Unique angles to explore
  ` : ""}
  
  ### 📈 Trending Aspects
  ${body.includeTrendingTopics ? `
  - Current trending subtopics
  - Social media discussions
  - Recent news and developments
  ` : ""}
  
  ### 🎯 Audience Insights
  - Target audience pain points
  - Preferred content formats
  - Key questions they're asking
  
  ### 💡 Content Opportunities
  - Unique angles to explore
  - Potential controversies or debates
  - Expert opinions to include
  
  **Input Data**: The research context will be provided as JSON input.`;
  }
  
  // Article Outline Generation Prompt
  export function buildOutlinePrompt(body: any): string {
    const wordCountGuidance = body.targetWordCount ? 
      `Target word count: ${body.targetWordCount} words` : 
      `Length preference: ${body.length}`;
  
    return `# Article Outline Generation Task
  
  ## Content Parameters
  - **Style**: ${body.style}
  - **Reading Level**: ${body.readingLevel}
  - **${wordCountGuidance}**
  - **Include Subtopics**: ${body.includeSubtopics ? "Yes" : "No"}
  
  ## Outline Requirements
  Create a comprehensive article outline in **markdown format** that includes:
  
  ### 📝 Article Structure
  
  #### Title Suggestions
  ${!body.title ? "- Generate 3-5 compelling title options" : `- Main title: "${body.title}"`}
  - SEO-optimized variants
  - Social media friendly versions
  
  #### Content Sections
  1. **Introduction** (Hook, context, preview)
  2. **Main Content Sections** (3-7 sections based on research)
     ${body.includeSubtopics ? "- Include relevant subtopics for each section" : ""}
     - Key points for each section
     - Supporting evidence needed
  3. **Conclusion** (Summary, call-to-action)
  
  #### Content Enhancement Elements
  - Quote opportunities
  - Statistics to include
  - Examples and case studies
  - Visual content suggestions
  
  ### 🎯 Section Details
  For each main section, provide:
  - **Objective**: What this section achieves
  - **Key Points**: 3-5 main points to cover
  - **Word Count Estimate**: Approximate words per section
  - **Engagement Elements**: Questions, examples, or interactive elements
  
  **Input Data**: Research data and parameters will be provided as JSON input.`;
  }
  
  // Main Content Generation Prompt
  export function buildContentPrompt(body: any): string {
    const linkingInstructions = [];
    if (body.externalLinking) linkingInstructions.push("Include relevant external links");
    if (body.internalLinking) linkingInstructions.push("Suggest internal linking opportunities");
  
    return `# Article Content Generation Task
  
  ## Content Specifications
  - **Tone**: ${body.tone}
  - **Style**: ${body.style}
  - **Length**: ${body.length}
  - **Target Audience**: ${body.targetAudience}
  - **Reading Level**: ${body.readingLevel}
  - **Author**: ${body.authorName || "Not specified"}
  - **Publication Date**: ${body.publicationDate || "Current date"}
  
  ## Content Requirements
  ${linkingInstructions.length > 0 ? `
  ### 🔗 Linking Strategy
  ${linkingInstructions.map(instruction => `- ${instruction}`).join('\n')}
  ` : ""}
  
  ### ✍️ Writing Guidelines
  - Write in **${body.tone.toLowerCase()}** tone
  - Target **${body.readingLevel.toLowerCase()}** reading level
  - Optimize for **${body.targetAudience.toLowerCase()}** audience
  - Follow **${body.style.toLowerCase()}** format standards
  
  ## Custom Requirements
  ${body.customInstructions ? `**Special Instructions**: ${body.customInstructions}` : "Standard article format"}
  
  ## Expected Output
  Generate a complete, well-structured article in **markdown format** including:
  
  ### 📰 Article Header
  - Compelling headline
  - Subheadline (if appropriate)
  - Author byline and date
  
  ### 📖 Article Body
  - Engaging introduction with hook
  - Well-structured main content following the outline
  - Smooth transitions between sections
  - Supporting evidence and examples
  - Engaging conclusion with clear takeaways
  
  ### 🎨 Content Enhancements
  - Strategic use of headers (H2, H3, H4)
  - Bullet points and numbered lists where appropriate
  - Bold and italic text for emphasis
  - Block quotes for important information
  ${body.externalLinking ? "- Relevant external links with [anchor text](URL) format" : ""}
  ${body.internalLinking ? "- Internal link suggestions marked as [Internal: anchor text]" : ""}
  
  **Input Data**: Research, outline, and content parameters provided as JSON input.`;
  }
  
  // Fact Checking Prompt
  export function buildFactCheckPrompt(body: any): string {
    return `# Fact Checking & Accuracy Verification Task
  
  ## Verification Requirements
  Thoroughly fact-check the provided content for:
  
  ### 🔍 Accuracy Assessment
  - **Statistical Claims**: Verify all numbers, percentages, and data points
  - **Date Accuracy**: Confirm all dates and timelines
  - **Attribution**: Check quotes, citations, and source references
  - **Technical Details**: Verify technical information and specifications
  
  ### 📊 Source Validation
  - Identify claims that need stronger sources
  - Flag potentially outdated information
  - Suggest authoritative sources for unverified claims
  - Check for potential bias or misinformation
  
  ## Output Format
  Provide **markdown formatted** response with:
  
  ### ✅ Verified Content
  - Corrected version of the article
  - All factual inaccuracies addressed
  - Updated statistics and data points
  
  ### ⚠️ Fact Check Notes
  - List of corrections made
  - Sources needed for unverified claims
  - Confidence level for each major claim
  - Suggestions for additional verification
  
  ### 📚 Source Recommendations
  - Authoritative sources to cite
  - Additional research needed
  - Expert opinions to seek
  
  **Input Data**: Original content and research context provided as JSON input.`;
  }
  
  // Content Humanization Prompt
  export function buildHumanizePrompt(body: any): string {
    return `# Content Humanization Task
  
  ## Humanization Goals
  Transform the content to be more:
  - **Natural and conversational**
  - **Engaging and relatable**
  - **Authentic and personal**
  - **Varied in sentence structure**
  
  ## Target Parameters
  - **Tone**: ${body.tone}
  - **Audience**: ${body.targetAudience}
  - **Reading Level**: ${body.readingLevel}
  
  ## Humanization Techniques
  Apply these improvements:
  
  ### 🗣️ Conversational Elements
  - Use active voice over passive voice
  - Include rhetorical questions
  - Add transitional phrases
  - Incorporate casual expressions (where appropriate)
  
  ### 🎭 Engagement Boosters
  - Add personal anecdotes or examples
  - Include reader-directed questions
  - Use storytelling elements
  - Vary sentence lengths and structures
  
  ### 🎨 Natural Flow
  - Improve paragraph transitions
  - Balance formal and informal language
  - Add personality without losing professionalism
  - Include emotional connections
  
  ## Expected Output
  Provide **markdown formatted** humanized content that:
  - Maintains all factual accuracy
  - Preserves the original structure
  - Enhances readability and engagement
  - Feels naturally written by a human expert
  
  **Input Data**: Content to humanize and audience parameters provided as JSON input.`;
  }
  
  // SEO Optimization Prompt
  export function buildSEOPrompt(body: any): string {
    return `# SEO Optimization Task
  
  ## SEO Parameters
  - **Primary Keyword**: "${body.keyword}"
  - **Target Audience**: ${body.targetAudience}
  - **Geographic Focus**: ${body.geoFocus}
  ${body.socialMediaOptimization ? "- **Social Media Optimization**: Required" : ""}
  
  ## SEO Requirements
  
  ### 🎯 Keyword Optimization
  - Natural integration of primary keyword
  - LSI (Latent Semantic Indexing) keywords
  - Long-tail keyword variations
  - Avoid keyword stuffing
  
  ### 📱 Technical SEO Elements
  - Optimize headers (H1, H2, H3 hierarchy)
  - Meta description suggestions
  - URL slug recommendations
  - Image alt text suggestions
  
  ${body.socialMediaOptimization ? `
  ### 📱 Social Media Optimization
  - Social media friendly headlines
  - Shareable quotes and statistics
  - Platform-specific adaptations
  - Hashtag recommendations
  ` : ""}
  
  ## Expected Output
  Provide **markdown formatted** SEO-optimized content including:
  
  ### 📝 Optimized Article
  - SEO-enhanced version of the content
  - Strategic keyword placement
  - Improved headers and structure
  - Meta information suggestions
  
  ### 🔍 SEO Recommendations
  - **Title Tags**: 3-5 optimized title options
  - **Meta Description**: Compelling 150-160 character descriptions
  - **URL Slug**: SEO-friendly URL suggestions
  - **Keywords**: Primary and secondary keyword list
  - **Internal Linking**: Strategic internal link opportunities
  
  ### 📊 Performance Predictions
  - Expected search intent match
  - Competitiveness assessment
  - Ranking potential analysis
  
  **Input Data**: Content and SEO parameters provided as JSON input.`;
  }
  
  // Metadata Generation Prompt
  export function buildMetadataPrompt(body: any): string {
    return `# Metadata Generation Task
  
  ## Content Information
  - **Primary Keyword**: "${body.keyword}"
  - **Title**: ${body.title || "Auto-generated"}
  - **Category**: ${body.category}
  - **Author**: ${body.authorName || "Not specified"}
  - **Publication Date**: ${body.publicationDate || "Current date"}
  - **Target Audience**: ${body.targetAudience}
  
  ## Metadata Requirements
  Generate comprehensive metadata in **JSON format**:
  
  ### 🏷️ Basic Metadata
  - Article title variations
  - Meta descriptions (multiple options)
  - Keywords and tags
  - Category classifications
  
  ### 📊 SEO Metadata
  - Open Graph tags
  - Twitter Card data
  - Schema.org markup suggestions
  - Canonical URL recommendations
  
  ### 📱 Social Media Metadata
  - Platform-specific titles
  - Social media descriptions
  - Hashtag suggestions
  - Share-optimized snippets
  
  ### 📈 Analytics Tags
  - Content categories
  - Audience segments
  - Topic classifications
  - Performance tracking tags
  
  ## Expected Output Format
  {
    "basic": {
      "title": "Primary title",
      "titleVariations": ["Alt title 1", "Alt title 2"],
      "metaDescription": "Primary meta description",
      "metaDescriptionVariations": ["Alt description 1"],
      "keywords": ["keyword1", "keyword2"],
      "tags": ["tag1", "tag2"],
      "category": "Article category",
      "author": "Author name",
      "publishDate": "Publication date"
    },
    "seo": {
      "openGraph": {},
      "twitterCard": {},
      "schema": {},
      "canonical": "URL"
    },
    "social": {
      "hashtags": ["#hashtag1", "#hashtag2"],
      "shareSnippets": {}
    },
    "analytics": {
      "contentType": "article",
      "audienceSegment": "target audience",
      "topics": ["topic1", "topic2"]
    }
  }  
  **Input Data**: Final content and metadata parameters provided as JSON input.`;
  }
  
  // Image Generation Instructions Prompt
  export function buildImagePrompt(body: any): string {
    return `# Image Generation Instructions Task
  
  ## Image Parameters
  - **Style Preference**: ${body.imageStyle}
  - **Target Audience**: ${body.targetAudience}
  - **Primary Keyword**: "${body.keyword}"
  
  ## Image Requirements
  Generate detailed instructions for creating images that:
  
  ### 🎨 Visual Style
  - Match **${body.imageStyle.toLowerCase()}** aesthetic
  - Appeal to **${body.targetAudience.toLowerCase()}** audience
  - Maintain brand consistency
  - Follow current design trends
  
  ### 📱 Technical Specifications
  - Multiple format suggestions (hero image, thumbnails, social media)
  - Optimal dimensions for different platforms
  - Color palette recommendations
  - Typography suggestions (if text overlay needed)
  
  ## Expected Output
  Provide **markdown formatted** image creation guide:
  
  ### 🖼️ Image Concepts
  For each major section of the article:
  1. **Image Description**: Detailed visual concept
  2. **Style Notes**: Specific style requirements
  3. **Elements to Include**: Key visual elements
  4. **Mood/Tone**: Emotional impression
  5. **Technical Specs**: Size, format, quality requirements
  
  ### 🎯 Featured Image
  - **Hero Image Concept**: Main article image description
  - **Alt Text**: SEO-optimized alt text
  - **Caption**: Engaging image caption
  - **Placement**: Optimal position in article
  
  ### 📱 Social Media Adaptations
  - Platform-specific image variations
  - Quote cards and infographics
  - Thumbnail optimizations
  - Share-friendly formats
  
  ### 🔧 Production Notes
  - Stock photo alternatives
  - Custom illustration requirements
  - Brand guideline compliance
  - Accessibility considerations
  
  **Input Data**: Article content, outline, and image parameters provided as JSON input.`;
  }