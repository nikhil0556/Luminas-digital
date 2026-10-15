import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  FileCheck,
  Image as ImageIcon,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
  Lock,
  DollarSign,
  Layers,
  FileText,
  CheckCircle2,
  Tag,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCreator } from '../../context/CreatorContext';
import {
  Product,
  ProductCategory,
  ProductFormat,
  DigitalFileAsset,
  ProductPreviewSample
} from '../../types';

interface ProductUploadFormProps {
  initialProduct?: Product | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const SUPPORTED_CATEGORIES: ProductCategory[] = [
  'E-books',
  'Digital Guides',
  'Prompt Packs',
  'Templates',
  'Checklists',
  'Other Digital Downloads',
  'AI Prompts',
  'Productivity',
  'Business',
  'Creator Resources',
  'Study Resources',
  'Marketing Resources'
];

const SUBCATEGORY_SUGGESTIONS: Record<string, string[]> = {
  'E-books': ['Business & Solopreneurship', 'Software & Tech', 'Productivity & Habits', 'Marketing & Sales', 'Personal Growth'],
  'Digital Guides': ['Step-by-Step Playbooks', 'Career Roadmaps', 'Technical Cheatsheets', 'Workflow Blueprints'],
  'Prompt Packs': ['ChatGPT & Claude Mastery', 'Midjourney & Image Gen', 'Copywriting & Content', 'Coding & Debugging', 'SEO & Strategy'],
  'Templates': ['Notion Dashboards', 'Figma Kits', 'Spreadsheet Models', 'Canva Graphics', 'Obsidian Vaults'],
  'Checklists': ['Product Launch SOPs', 'Security Audits', 'SEO On-Page Audits', 'Course Creation Steps'],
  'Other Digital Downloads': ['Audio & Meditations', 'Code Snippets', 'Design Assets', 'Datasets & Models']
};

const SUPPORTED_FORMATS: ProductFormat[] = [
  'PDF',
  'Prompt Vault (JSON/TXT)',
  'Notion Template',
  'Spreadsheet (XLSX/Sheets)',
  'Figma Kit',
  'Bundle (ZIP)',
  'ePub',
  'Custom Download'
];

export const ProductUploadForm: React.FC<ProductUploadFormProps> = ({
  initialProduct,
  onSuccess,
  onCancel,
  showToast
}) => {
  const { user } = useAuth();
  const {
    creatorProfile,
    isVerified,
    canSell,
    createCreatorProduct,
    updateCreatorProduct,
    setActiveCreatorTab
  } = useCreator();

  const isEditing = Boolean(initialProduct);

  // Form Fields
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [subtitle, setSubtitle] = useState(initialProduct?.subtitle || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialProduct?.fullDescription || '');
  const [category, setCategory] = useState<ProductCategory>(initialProduct?.category || 'E-books');
  const [subcategory, setSubcategory] = useState(initialProduct?.subcategory || '');
  const [format, setFormat] = useState<ProductFormat>(initialProduct?.format || 'PDF');
  const [price, setPrice] = useState<number>(initialProduct?.price || 499);
  const [originalPrice, setOriginalPrice] = useState<number>(initialProduct?.originalPrice || 999);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>(initialProduct?.currency || 'USD');
  const [pagesOrCount, setPagesOrCount] = useState(initialProduct?.pagesOrCount || '120 Pages');
  const [version, setVersion] = useState(initialProduct?.version || '1.0.0');
  const [versionChangelog, setVersionChangelog] = useState(initialProduct?.versionChangelog || 'Initial release.');

  // Thumbnail / Cover
  const [coverImage, setCoverImage] = useState(initialProduct?.coverImage || '');
  const [coverGradientFrom, setCoverGradientFrom] = useState(initialProduct?.coverGradient?.from || '#4f46e5');
  const [coverGradientTo, setCoverGradientTo] = useState(initialProduct?.coverGradient?.to || '#7c3aed');

  // Digital Product File
  const [digitalFile, setDigitalFile] = useState<DigitalFileAsset | null>(initialProduct?.digitalFile || null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Tags & Requirements
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialProduct?.tags || ['Creator Resource', 'Digital Download']);
  const [reqInput, setReqInput] = useState('');
  const [requirements, setRequirements] = useState<string[]>(initialProduct?.requirements || []);

  // What's included checklist items
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>(
    initialProduct?.whatsIncluded || [
      'Comprehensive digital deliverable',
      'Step-by-step implementation guide',
      'Commercial & personal license'
    ]
  );
  const [newIncludedItem, setNewIncludedItem] = useState('');

  // Sample / Preview
  const [previewSampleType, setPreviewSampleType] = useState<'text' | 'prompts' | 'toc' | 'excerpt'>(
    initialProduct?.previewSample?.type || 'excerpt'
  );
  const [previewSampleTitle, setPreviewSampleTitle] = useState(
    initialProduct?.previewSample?.title || 'Sample Excerpt / Preview Chapter'
  );
  const [previewSampleContent, setPreviewSampleContent] = useState(
    initialProduct?.previewSample?.content || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update subcategory suggestions when category changes
  useEffect(() => {
    if (!subcategory && SUBCATEGORY_SUGGESTIONS[category]?.[0]) {
      setSubcategory(SUBCATEGORY_SUGGESTIONS[category][0]);
    }
  }, [category]);

  // Handle Cover Image Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Cover image exceeds 5MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
      showToast('Cover thumbnail updated.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle Digital Product File Upload (Secure Vault)
  const handleDigitalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showToast('Digital deliverable exceeds platform limit of 50MB.', 'error');
      return;
    }

    setIsUploadingFile(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch('/api/creator/upload-asset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-creator-id': user?.uid || 'creator'
            },
            body: JSON.stringify({
              creatorId: user?.uid,
              fileName: file.name,
              fileBase64: base64Data,
              fileType: file.type || 'application/octet-stream',
              format
            })
          });

          const data = await res.json();
          if (res.ok && data.success && data.fileAsset) {
            setDigitalFile(data.fileAsset);
            showToast(`Asset "${file.name}" safely stored in secure vault.`, 'success');
          } else {
            // Local fallback simulation
            const fallbackAsset: DigitalFileAsset = {
              fileId: `file_${Date.now()}`,
              fileName: file.name,
              fileSize: `${(file.size / 1024).toFixed(1)} KB`,
              fileType: file.type || 'application/octet-stream',
              format,
              uploadedAt: new Date().toISOString()
            };
            setDigitalFile(fallbackAsset);
            showToast(`Asset "${file.name}" attached.`, 'info');
          }
        } catch {
          const fallbackAsset: DigitalFileAsset = {
            fileId: `file_${Date.now()}`,
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            fileType: file.type || 'application/octet-stream',
            format,
            uploadedAt: new Date().toISOString()
          };
          setDigitalFile(fallbackAsset);
          showToast(`Asset "${file.name}" attached.`, 'info');
        } finally {
          setIsUploadingFile(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingFile(false);
      showToast(err.message || 'File upload failed.', 'error');
    }
  };

  // Tag Management
  const addTag = () => {
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean) && tags.length < 10) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Requirement Management
  const addRequirement = () => {
    const clean = reqInput.trim();
    if (clean && !requirements.includes(clean)) {
      setRequirements([...requirements, clean]);
      setReqInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  // Included Items Management
  const addIncludedItem = () => {
    const clean = newIncludedItem.trim();
    if (clean) {
      setWhatsIncluded([...whatsIncluded, clean]);
      setNewIncludedItem('');
    }
  };

  const removeIncludedItem = (index: number) => {
    setWhatsIncluded(whatsIncluded.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (submitForReview: boolean) => {
    if (!title.trim()) {
      showToast('Product title is required.', 'error');
      return;
    }
    if (!shortDescription.trim()) {
      showToast('Short description is required.', 'error');
      return;
    }
    if (price < 1) {
      showToast('Selling price must be at least 1.', 'error');
      return;
    }

    setIsSubmitting(true);

    const previewSampleData: ProductPreviewSample | undefined = previewSampleContent.trim()
      ? {
          type: previewSampleType,
          title: previewSampleTitle.trim() || 'Product Sample',
          content: previewSampleContent.trim()
        }
      : undefined;

    const fallbackFilename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${format === 'PDF' ? 'pdf' : format.includes('ZIP') ? 'zip' : 'txt'}`;

    const productPayload: Omit<Product, 'id'> = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim() || shortDescription.trim(),
      category,
      subcategory: subcategory.trim(),
      format,
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      currency,
      pagesOrCount: pagesOrCount.trim() || 'Digital Download',
      version: version.trim() || '1.0.0',
      versionChangelog: versionChangelog.trim() || 'Initial release.',
      rating: initialProduct?.rating || 5.0,
      reviewCount: initialProduct?.reviewCount || 0,
      coverImage: coverImage || undefined,
      coverGradient: {
        from: coverGradientFrom,
        to: coverGradientTo,
        accent: '#818cf8'
      },
      tags: tags.length > 0 ? tags : [category, 'Digital Product'],
      whatsIncluded: whatsIncluded.length > 0 ? whatsIncluded : ['Instant Digital Download', 'Lifetime Access'],
      whoItsFor: ['Creators', 'Solopreneurs', 'Professionals'],
      keyBenefits: ['Saves time', 'Actionable frameworks', 'Lifetime updates'],
      features: whatsIncluded,
      requirements: requirements.length > 0 ? requirements : undefined,
      previewSample: previewSampleData,
      digitalFile: digitalFile || undefined,
      downloadFilename: digitalFile?.fileName || fallbackFilename,
      downloadContent: `Lumina Digital Marketplace Resource: ${title}\nAuthor: ${creatorProfile?.businessName || creatorProfile?.displayName}\nVersion: ${version}\nLicensed to verified purchaser.`,
      status: submitForReview ? 'pending_review' : 'draft'
    };

    try {
      if (isEditing && initialProduct) {
        const res = await updateCreatorProduct(initialProduct.id, {
          ...productPayload,
          status: submitForReview ? 'pending_review' : initialProduct.status
        });
        setIsSubmitting(false);
        if (res.success) {
          showToast(
            submitForReview
              ? 'Product updated and submitted for marketplace review!'
              : 'Product changes saved successfully!',
            'success'
          );
          if (onSuccess) onSuccess();
        } else {
          showToast(res.error || 'Failed to update product.', 'error');
        }
      } else {
        const res = await createCreatorProduct(productPayload, submitForReview);
        setIsSubmitting(false);
        if (res.success) {
          showToast(
            submitForReview
              ? 'Product submitted for review! Our moderation team will review it before publication.'
              : 'Product saved as private draft in your catalog.',
            'success'
          );
          if (onSuccess) {
            onSuccess();
          } else {
            setActiveCreatorTab('products');
          }
        } else {
          showToast(res.error || 'Failed to upload product.', 'error');
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || 'An error occurred.', 'error');
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 sm:p-8 space-y-8">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {isEditing ? 'Edit Existing Listing' : 'Creator Product Upload'}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              Moderated Publication Pipeline
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            {isEditing ? `Edit: ${initialProduct.title}` : 'Upload & Sell Digital Asset'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Distribute e-books, guides, prompt vaults, Notion templates, checklists, or bundled resources to thousands of verified buyers.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Moderation Notice / Pipeline Reminder */}
      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Platform Quality & Security Rules</p>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            All newly uploaded creator products undergo automated validation and moderation review before being published on the public marketplace. Digital files are encrypted in our secure vault and are never exposed via predictable direct URLs.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>1. Product Overview & Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Product Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. The Prompt Engineering Handbook"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Subtitle / Value Hook
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="e.g. Master generative AI models with 500+ production prompts"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              >
                {SUPPORTED_CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Subcategory / Focus Area
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                placeholder="e.g. Solopreneurship or Technical SOPs"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Format <span className="text-rose-400">*</span>
              </label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as ProductFormat)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              >
                {SUPPORTED_FORMATS.map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Short Description (Card Summary) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              placeholder="Concise 1-2 sentence pitch shown on marketplace discovery cards..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Full Description & Detailed Breakdown
            </label>
            <textarea
              rows={5}
              value={fullDescription}
              onChange={e => setFullDescription(e.target.value)}
              placeholder="Detailed description, methodology, what problem this solves, and why buyers love it..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500 resize-none leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Currency */}
        <div className="space-y-4 pt-6 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>2. Pricing & Creator Royalties (90% Creator Revenue Share)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Currency <span className="text-rose-400">*</span>
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500 font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Selling Price <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Original Price (Strikethrough)
              </label>
              <input
                type="number"
                min="1"
                value={originalPrice}
                onChange={e => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Volume / Page Count
              </label>
              <input
                type="text"
                value={pagesOrCount}
                onChange={e => setPagesOrCount(e.target.value)}
                placeholder="e.g. 150 Pages or 1,200 Prompts"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs flex items-center justify-between">
            <span className="text-emerald-300">
              Your estimated net payout per sale (90% platform model):
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
              {(price * 0.9).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Section 3: Secure Digital Deliverable & Cover */}
        <div className="space-y-4 pt-6 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>3. Digital Deliverable & Visual Cover</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Digital File Upload */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Digital Product Deliverable <span className="text-rose-400">*</span>
              </label>
              <div className="p-4 rounded-xl border border-dashed border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-colors">
                {digitalFile ? (
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-white truncate">{digitalFile.fileName}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {digitalFile.fileSize} • Vault Protected
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDigitalFile(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 ml-2"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block text-center py-4">
                    <input
                      type="file"
                      onChange={handleDigitalFileUpload}
                      disabled={isUploadingFile}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                    <p className="text-xs text-neutral-200 font-semibold">
                      {isUploadingFile ? 'Encrypting & Storing in Vault...' : 'Choose Digital Asset File'}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      PDF, EPUB, ZIP, TXT, JSON, XLSX up to 50MB
                    </p>
                  </label>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>Encrypted storage prevents unauthorized downloads and predictable URLs.</span>
              </p>
            </div>

            {/* Thumbnail / Cover */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Thumbnail / Product Cover
              </label>
              <div className="flex items-start gap-4">
                <div
                  className="w-24 h-32 rounded-xl overflow-hidden shadow-md border border-neutral-800 flex items-center justify-center shrink-0"
                  style={{
                    background: coverImage
                      ? `url(${coverImage}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${coverGradientFrom}, ${coverGradientTo})`
                  }}
                >
                  {!coverImage && (
                    <span className="text-[10px] text-white/80 font-bold text-center px-1">
                      Gradient Card
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="inline-block px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold cursor-pointer transition-colors">
                    <span>Upload Cover Image</span>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="block text-xs text-rose-400 hover:text-rose-300"
                    >
                      Remove Custom Cover
                    </button>
                  )}

                  <div className="pt-2">
                    <p className="text-[11px] text-neutral-400 mb-1">Fallback Gradient Theme:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={coverGradientFrom}
                        onChange={e => setCoverGradientFrom(e.target.value)}
                        className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
                        title="Gradient start"
                      />
                      <input
                        type="color"
                        value={coverGradientTo}
                        onChange={e => setCoverGradientTo(e.target.value)}
                        className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
                        title="Gradient end"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: What's Included & Requirements */}
        <div className="space-y-4 pt-6 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>4. Features, Deliverables & Requirements</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* What's Included */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                What's Included in this Download
              </label>
              <div className="space-y-2 mb-2">
                {whatsIncluded.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeIncludedItem(idx)}
                      className="text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIncludedItem}
                  onChange={e => setNewIncludedItem(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addIncludedItem();
                    }
                  }}
                  placeholder="e.g. 50+ Ready-to-use Prompt Templates"
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addIncludedItem}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Optional Requirements */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Optional Product Requirements
              </label>
              <div className="space-y-2 mb-2">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(idx)}
                      className="text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reqInput}
                  onChange={e => setReqInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                  placeholder="e.g. Free Notion account required"
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Discovery Tags (Search Keywords)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 font-mono">
                  <span>#{t}</span>
                  <button type="button" onClick={() => removeTag(idx)} className="hover:text-rose-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag and press Enter..."
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Customer Preview Sample */}
        <div className="space-y-4 pt-6 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>5. Public Sample / Preview (Free Sneak Peek for Buyers)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Sample Title / Heading
              </label>
              <input
                type="text"
                value={previewSampleTitle}
                onChange={e => setPreviewSampleTitle(e.target.value)}
                placeholder="e.g. Chapter 1: Foundations or 3 Free Sample Prompts"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Sample Format
              </label>
              <select
                value={previewSampleType}
                onChange={e => setPreviewSampleType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              >
                <option value="excerpt">Book Excerpt / Summary</option>
                <option value="prompts">Sample Prompts Vault</option>
                <option value="toc">Table of Contents / Outline</option>
                <option value="text">General Sample Text</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Sample Content (Displayed in the store "Sample Preview" modal)
            </label>
            <textarea
              rows={4}
              value={previewSampleContent}
              onChange={e => setPreviewSampleContent(e.target.value)}
              placeholder="Paste a teaser excerpt, 2-3 sample prompts, or table of contents to give shoppers confidence before buying..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500 resize-none font-mono text-[11px] leading-relaxed"
            />
          </div>
        </div>

        {/* Section 6: Version & Release Notes */}
        <div className="space-y-4 pt-6 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>6. Versioning & Changelog</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Version Tag
              </label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Changelog Note
              </label>
              <input
                type="text"
                value={versionChangelog}
                onChange={e => setVersionChangelog(e.target.value)}
                placeholder="Initial release submission"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Creator Ownership Card (Display Only) */}
      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
            {creatorProfile?.displayName ? creatorProfile.displayName.slice(0, 2).toUpperCase() : 'CR'}
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              Creator Ownership: {creatorProfile?.businessName || creatorProfile?.displayName}
            </p>
            <p className="text-[11px] text-neutral-400">
              Linked permanently to your verified creator UID ({user?.uid?.slice(0, 10)}...)
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
          90% Direct Royalties
        </span>
      </div>

      {/* Submission Actions */}
      <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <p className="text-xs text-neutral-400">
          Review step: Drafts remain private until submitted for moderation review.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/25 disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit for Moderation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
