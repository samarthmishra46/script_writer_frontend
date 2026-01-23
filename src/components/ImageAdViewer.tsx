import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Image, CheckCircle, Copy, Loader2, Send, Sparkles, X, Target, Lightbulb } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface CompetitorInsights {
  competitor_name?: string;
  top_hooks?: string[];
  top_ctas?: string[];
  common_visuals?: string[];
  tone_and_style?: string;
  extra_thoughts?: string;
}

interface ImageVariation {
  styleKey: string;
  styleName: string;
  imageUrl: string;
  originalUrl: string;
  prompt?: string;
  marketingAngle?: string;
  creativeApproach?: string;
  enhancedPrompt?: string;
}

interface ViewImageAdData {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    brand_name: string;
    product: string;
    adType: string;
    whyItWorksSummary?: string;
    competitorInsights?: CompetitorInsights;
    [key: string]: unknown;
  };
  brand_name: string;
  product: string;
  whyItWorksSummary?: string;
  competitorInsights?: CompetitorInsights;
  campaign?: {
    theme: string;
    headline: string;
    body_copy: string;
    call_to_action: string;
    image_description: string;
    message_to_the_world: string;
  };
  imageUrl?: string;
  videoUrl?: string;
  imageVariations?: ImageVariation[];
  totalGenerated?: number;
  hasProductImages?: boolean;
  hasImage?: boolean;
  hasVideo?: boolean;
  platform?: string;
  visual_style?: string;
  color_scheme?: string;
  image_format?: string;
}

interface ImageAdViewerProps {
  imageAd: ViewImageAdData;
  onNewAd?: () => void;
  backButtonPath?: string;
  backButtonText?: string;
  headerTitle?: string;
  onImageAdUpdate?: (updatedImageAd: ViewImageAdData) => void;
}

const ImageAdViewer: React.FC<ImageAdViewerProps> = ({ 
  imageAd, 
  onNewAd, 
  backButtonPath = '/dashboard',
  backButtonText = 'Back to Dashboard',
  headerTitle = 'Image Ad Viewer',
  onImageAdUpdate
}) => {
  const navigate = useNavigate();
  const [selectedImageModal, setSelectedImageModal] = useState<ImageVariation | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationPrompt, setRegenerationPrompt] = useState('');
  const [showRegenerationModal, setShowRegenerationModal] = useState(false);
  const [currentRegeneratingImage, setCurrentRegeneratingImage] = useState<ImageVariation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localImageAd, setLocalImageAd] = useState<ViewImageAdData>(imageAd);
  const [showBrief, setShowBrief] = useState(false);

  const metadataSummary = localImageAd.metadata?.campaignSummary as Record<string, unknown> | undefined;
  const metadataWhyItWorks =
    typeof metadataSummary?.['why_it_works'] === 'string'
      ? (metadataSummary['why_it_works'] as string)
      : typeof metadataSummary?.['whyItWorks'] === 'string'
      ? (metadataSummary['whyItWorks'] as string)
      : '';
  const metadataSuccessRate =
    typeof metadataSummary?.['success_rate'] === 'string'
      ? (metadataSummary['success_rate'] as string)
      : typeof metadataSummary?.['successRate'] === 'string'
      ? (metadataSummary['successRate'] as string)
      : undefined;

  const whyItWorksText =
    localImageAd?.whyItWorksSummary ||
    (localImageAd?.metadata?.whyItWorksSummary as string | undefined) ||
    metadataWhyItWorks;

  const totalVariations = localImageAd.imageVariations?.length || 0;
  const successRate =
    (localImageAd as { successRate?: string }).successRate ||
    (localImageAd.metadata?.successRate as string | undefined) ||
    metadataSuccessRate ||
    (totalVariations > 0 || localImageAd.imageUrl ? '100%' : '0%');
  const createdAtDisplay = new Date(localImageAd.createdAt).toLocaleString();
  const platformDisplay =
    localImageAd.platform || (localImageAd.metadata?.platform as string | undefined) || 'instagram';
  const visualStyle =
    localImageAd.visual_style || (localImageAd.metadata?.visual_style as string | undefined) || 'modern';
  const colorScheme =
    localImageAd.color_scheme || (localImageAd.metadata?.color_scheme as string | undefined) || 'brand-colors';
  const hasProductReference =
    (localImageAd as { hasProductReference?: boolean }).hasProductReference ??
    Boolean(localImageAd.metadata?.hasProductReference);
  const galleryItems: ImageVariation[] = localImageAd.imageVariations?.length
    ? localImageAd.imageVariations
    : localImageAd.imageUrl
    ? [
        {
          styleKey: 'legacy',
          styleName: 'Primary Image',
          imageUrl: localImageAd.imageUrl,
          originalUrl: localImageAd.imageUrl,
          prompt: 'Legacy generated image',
        },
      ]
    : [];
  const totalImages = galleryItems.length;
  const whyItWorksCopy =
    whyItWorksText ||
    'This campaign blends conversion-focused visuals, social proof, and narrative angles to meet the audience across awareness, consideration, and purchase touchpoints.';
  const isAiSummary = Boolean(whyItWorksText);
  const imagesLabel = totalImages === 1 ? 'creative' : 'creatives';

  const platformLabel = `${platformDisplay.toUpperCase()} • ${visualStyle}`;
  const paletteLabel = `Palette: ${colorScheme}`;
  const referenceLabel = hasProductReference ? 'Product imagery applied' : 'Conceptual generation';

  const handleCopyContent = async () => {
    if (!localImageAd) return;

    try {
      await navigator.clipboard.writeText(localImageAd.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDownloadImage = (imageVariation: ImageVariation) => {
    const link = document.createElement('a');
    link.href = imageVariation.imageUrl;
    link.download = `${localImageAd?.brand_name}-${localImageAd?.product}-${imageVariation.styleName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenImageModal = (imageVariation: ImageVariation) => {
    setSelectedImageModal(imageVariation);
  };

  const handleCloseImageModal = () => {
    setSelectedImageModal(null);
  };

  const handleRegenerateImage = async () => {
    if (!currentRegeneratingImage) return;
    
    if (!regenerationPrompt.trim()) {
      alert('Please enter a regeneration prompt');
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to regenerate images');
        return;
      }

      console.log('🔄 Starting image regeneration...', {
        adId: localImageAd?._id,
        originalImage: currentRegeneratingImage.imageUrl,
        prompt: regenerationPrompt
      });

      const response = await fetch(buildApiUrl('api/image-ads/regenerate-image'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adId: localImageAd?._id,
          original_image_url: currentRegeneratingImage.imageUrl,
          custom_prompt: regenerationPrompt,
          original_style_key: currentRegeneratingImage.styleKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to regenerate image');
      }

      if (data.success && data.regenerated_image) {
        // Add the new image to the current imageVariations
        const newImageVariation: ImageVariation = {
          styleKey: data.regenerated_image.styleKey,
          styleName: data.regenerated_image.styleName,
          imageUrl: data.regenerated_image.imageUrl,
          originalUrl: data.regenerated_image.originalUrl,
          prompt: data.regenerated_image.customPrompt
        };

        // Update the imageAd state to include the new image
        const updatedImageAd = {
          ...localImageAd,
          imageVariations: localImageAd.imageVariations 
            ? [...localImageAd.imageVariations, newImageVariation]
            : [newImageVariation],
          totalGenerated: data.total_images
        };

        setLocalImageAd(updatedImageAd);
        
        // Notify parent component if callback provided
        if (onImageAdUpdate) {
          onImageAdUpdate(updatedImageAd);
        }

        // Close the modal and clear form
        setShowRegenerationModal(false);
        setRegenerationPrompt('');
        setCurrentRegeneratingImage(null);

        alert('🎉 Image regenerated successfully! The new image has been added to your collection.');
      } else {
        throw new Error('No regenerated image returned');
      }

    } catch (error) {
      console.error('Image regeneration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate image');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleShowRegenerationForm = (imageVariation: ImageVariation) => {
    console.log('🔧 Showing regeneration modal for:', imageVariation.styleName);
    setCurrentRegeneratingImage(imageVariation);
    setRegenerationPrompt('');
    setShowRegenerationModal(true);
  };

  const handleCloseRegenerationModal = () => {
    setShowRegenerationModal(false);
    setCurrentRegeneratingImage(null);
    setRegenerationPrompt('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => navigate(backButtonPath)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {backButtonText}
          </button>
          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">{headerTitle}</span>
            <h1 className="text-3xl font-bold text-gray-900 text-left md:text-right">{localImageAd.title}</h1>
            <p className="text-sm text-gray-500">Generated {createdAtDisplay}</p>
          </div>
          <div className="flex items-center gap-3">
            {onNewAd && (
              <button
                onClick={onNewAd}
                className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Create New Campaign
              </button>
            )}
            {localImageAd.content && (
              <button
                onClick={handleCopyContent}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy brief
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <section className="mt-8 bg-white border border-slate-100 rounded-2xl shadow-lg p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">Why it works</p>
                  {isAiSummary && (
                    <span className="text-xs font-medium text-purple-500 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                      AI generated insight
                    </span>
                  )}
                </div>
                <p className="mt-3 text-lg leading-relaxed text-gray-900">{whyItWorksCopy}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                <p className="text-xs uppercase tracking-wider text-slate-500">Creatives generated</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{totalImages}</p>
                <p className="text-xs text-slate-500">{imagesLabel}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                <p className="text-xs uppercase tracking-wider text-slate-500">Success rate</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{successRate || '—'}</p>
                <p className="text-xs text-slate-500">AI delivery</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                <p className="text-xs uppercase tracking-wider text-slate-500">Channel & style</p>
                <p className="mt-2 text-base font-medium text-slate-900">{platformLabel}</p>
                <p className="text-xs text-slate-500">{paletteLabel}</p>
              </div>
              <div className="rounded-xl bg-purple-50 px-4 py-3 border border-purple-200">
                <p className="text-xs uppercase tracking-wider text-purple-600">Call to Action</p>
                <p className="mt-2 text-base font-bold text-purple-900">
                  {(localImageAd.metadata?.call_to_action as string) || 
                   (localImageAd.metadata?.callToAction as string) ||
                   (localImageAd.campaign?.call_to_action) ||
                   'Shop Now'}
                </p>
                <p className="text-xs text-purple-600">Displayed on images</p>
              </div>
            </div>
          </div>

          {localImageAd.content && (
            <div className="mt-6">
              <button
                onClick={() => setShowBrief((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
              >
                {showBrief ? 'Hide campaign brief' : 'View campaign brief'}
              </button>
              {showBrief && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {localImageAd.content}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Competitor Insights Section */}
        {(localImageAd.competitorInsights || localImageAd.metadata?.competitorInsights) && (
          <section className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-purple-900">Competitor Intelligence</h3>
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 border border-purple-300 px-2.5 py-1 rounded-full">
                    Meta Ads Analysis
                  </span>
                </div>
                <p className="mt-1 text-sm text-purple-700">
                  Insights gathered from analyzing competitor ads to help differentiate your campaign.
                </p>
              </div>
            </div>

            {(() => {
              const insights = localImageAd.competitorInsights || localImageAd.metadata?.competitorInsights;
              if (!insights) return null;
              
              return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {insights.competitor_name && (
                    <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-purple-500 mb-2">Competitor Analyzed</p>
                      <p className="text-lg font-semibold text-gray-900">{insights.competitor_name}</p>
                    </div>
                  )}
                  
                  {insights.top_hooks && insights.top_hooks.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-purple-500 mb-2 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" /> Top Hooks Used
                      </p>
                      <ul className="space-y-1">
                        {insights.top_hooks.slice(0, 4).map((hook, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{hook}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {insights.top_ctas && insights.top_ctas.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-purple-500 mb-2">Common CTAs</p>
                      <div className="flex flex-wrap gap-2">
                        {insights.top_ctas.slice(0, 5).map((cta, i) => (
                          <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {cta}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {insights.common_visuals && insights.common_visuals.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-purple-500 mb-2">Visual Patterns</p>
                      <ul className="space-y-1">
                        {insights.common_visuals.slice(0, 4).map((visual, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{visual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {insights.tone_and_style && (
                    <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm md:col-span-2">
                      <p className="text-xs uppercase tracking-wider text-purple-500 mb-2">Tone & Style</p>
                      <p className="text-sm text-gray-700">{insights.tone_and_style}</p>
                    </div>
                  )}
                  
                  {insights.extra_thoughts && (
                    <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm md:col-span-2 lg:col-span-3">
                      <p className="text-xs uppercase tracking-wider text-purple-500 mb-2">Strategic Insights</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{insights.extra_thoughts}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        )}

        <section className="mt-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Creative gallery</h2>
              <p className="text-sm text-gray-600">
                {totalImages > 0
                  ? `Explore ${totalImages} ${imagesLabel} crafted for ${localImageAd.brand_name}.`
                  : 'No creatives generated yet.'}
              </p>
            </div>
          </div>

          {totalImages > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((variation) => (
                <div
                  key={variation.styleKey}
                  className="group bg-white rounded-2xl shadow-lg border border-slate-100 hover:border-purple-300 transition-all overflow-hidden"
                >
                  <div
                    className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                    onClick={() => handleOpenImageModal(variation)}
                  >
                    <img
                      src={variation.imageUrl}
                      alt={`${localImageAd.brand_name} ${localImageAd.product} - ${variation.styleName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm font-semibold">View full size</p>
                      <p className="text-xs text-white/80">Click to open</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{variation.styleName}</h3>
                        {(variation.creativeApproach || variation.marketingAngle) && (
                          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                            {variation.creativeApproach || variation.marketingAngle}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {variation.marketingAngle || variation.prompt || 'AI generated visual concept.'}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleOpenImageModal(variation)}
                        className="flex-1 rounded-lg border border-purple-200 text-purple-600 text-sm font-medium py-2 hover:bg-purple-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleShowRegenerationForm(variation)}
                        className="flex-1 rounded-lg bg-purple-600 text-white text-sm font-medium py-2 hover:bg-purple-700 transition-colors"
                      >
                        Regenerate
                      </button>
                      <button
                        onClick={() => handleDownloadImage(variation)}
                        className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                        title="Download image"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <Image className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <p className="text-gray-600">No images available for this campaign yet.</p>
            </div>
          )}
        </section>
      </div>

      {/* Regeneration Modal - Full Screen */}
      {showRegenerationModal && currentRegeneratingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full h-full max-w-7xl mx-auto p-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4">
              <h3 className="text-2xl font-bold text-gray-900">Regenerate Image with Custom Prompt</h3>
              <button
                onClick={handleCloseRegenerationModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                disabled={isRegenerating}
              >
                <X className="h-8 w-8" />
              </button>
            </div>
            
            {/* Main Content - Split Screen */}
            <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0">
              {/* Left Side - Original Image */}
              <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Original Image</h4>
                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                  <img 
                    src={currentRegeneratingImage.imageUrl}
                    alt={currentRegeneratingImage.styleName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                {/* Image Details */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900">{currentRegeneratingImage.styleName}</h5>
                  <p className="text-sm text-gray-600 mt-1">{localImageAd.brand_name} - {localImageAd.product}</p>
                  {currentRegeneratingImage.prompt && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Original Prompt:</p>
                      <p className="text-xs text-gray-600 bg-white p-2 rounded border italic">
                        "{currentRegeneratingImage.prompt}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Regeneration Form */}
              <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Create New Variation</h4>
                
                {/* Instructions */}
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-medium text-purple-900 mb-2">💡 Regeneration Tips:</h5>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Describe specific changes you want to make</li>
                    <li>• Mention colors, lighting, mood, or style changes</li>
                    <li>• Add or remove elements from the scene</li>
                    <li>• Change the background or setting</li>
                  </ul>
                </div>

                {/* Regeneration Form */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Describe Your Changes
                  </label>
                  <textarea
                    value={regenerationPrompt}
                    onChange={(e) => setRegenerationPrompt(e.target.value)}
                    placeholder="Example: Make the background sunset orange, add soft lighting, change the mood to more dramatic, add shadows..."
                    className="flex-1 w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base leading-relaxed"
                    autoFocus
                    disabled={isRegenerating}
                  />
                  
                  {/* Character count */}
                  <div className="mt-2 text-right">
                    <span className={`text-sm ${regenerationPrompt.length > 200 ? 'text-red-500' : 'text-gray-500'}`}>
                      {regenerationPrompt.length}/500 characters
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleRegenerateImage}
                    disabled={isRegenerating || !regenerationPrompt.trim()}
                    className="flex-1 flex items-center justify-center px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg"
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        Generating New Image...
                      </>
                    ) : (
                      <>
                        <Send className="h-6 w-6 mr-3" />
                        Generate New Image
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCloseRegenerationModal}
                    disabled={isRegenerating}
                    className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

                {/* Progress indicator when generating */}
                {isRegenerating && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center text-blue-700">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <span className="text-sm font-medium">
                        AI is creating your new image variation. This may take 30-60 seconds...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Click outside to close (only when not regenerating) */}
          {!isRegenerating && (
            <div 
              className="absolute inset-0 -z-10" 
              onClick={handleCloseRegenerationModal}
            />
          )}
        </div>
      )}

      {/* Image Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImageModal.imageUrl}
              alt={selectedImageModal.styleName}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Modal Controls */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => handleDownloadImage(selectedImageModal)}
                className="bg-white bg-opacity-90 backdrop-blur-sm text-gray-700 p-3 rounded-full hover:bg-white transition-all shadow-lg"
                title="Download Image"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={handleCloseImageModal}
                className="bg-white bg-opacity-90 backdrop-blur-sm text-gray-700 p-3 rounded-full hover:bg-white transition-all shadow-lg"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{selectedImageModal.styleName}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {localImageAd.brand_name} - {localImageAd.product}
              </p>
            </div>
          </div>
          
          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={handleCloseImageModal}
          />
        </div>
      )}
    </div>
  );
};

export default ImageAdViewer;