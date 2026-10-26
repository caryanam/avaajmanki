import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  Heart,
  Briefcase,
  Sprout,
  Home,
  TrendingUp,
  BookOpen,
  Trophy,
  Film,
  Users,
  MoreHorizontal,
  CloudUpload,
  Check,
  Pencil,
  AlertCircle,
  ArrowRight,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage, getLanguageCode, normalizeLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiClient } from '../../services/apiClient.js';
import { apiTopicService } from '../../services/apiTopicService.js';
import { apiCommentService } from '../../services/apiCommentService.js';
import { getMediaUrl } from '../../config/env.js';
import { CANONICAL_TOPICS } from '../../utils/topicMetadata.js';
import { getCustomTopics, saveCustomTopic } from '../../utils/topicUtils.js';

// Approved 10 Category Options (5 cols x 2 rows on Desktop)
const CATEGORY_OPTIONS = [
  {
    id: 'LOVE',
    label: 'Love',
    icon: Heart,
    iconColor: '#F50057',
    iconBg: '#FFE8F0',
    backendParentTopic: 'FEELINGS',
    emoji: '❤️',
  },
  {
    id: 'LIFE_WORK',
    label: 'Life & Work',
    icon: Briefcase,
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
    backendParentTopic: 'LIFE_WORK',
    emoji: '💼',
  },
  {
    id: 'MENTAL_HEALTH',
    label: 'Mental Health',
    icon: Sprout,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    backendParentTopic: 'FEELINGS',
    emoji: '🌱',
  },
  {
    id: 'FAMILY',
    label: 'Family',
    icon: Home,
    iconColor: '#EA580C',
    iconBg: '#FFEDD5',
    backendParentTopic: 'PARENTING',
    emoji: '🏠',
  },
  {
    id: 'PERSONAL_GROWTH',
    label: 'Personal Growth',
    icon: TrendingUp,
    iconColor: '#BE123C',
    iconBg: '#FFE4E6',
    backendParentTopic: 'EXPRESSION',
    emoji: '📈',
  },
  {
    id: 'EDUCATION',
    label: 'Education',
    icon: BookOpen,
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
    backendParentTopic: 'EDUCATION',
    emoji: '🎓',
  },
  {
    id: 'MOTIVATION',
    label: 'Motivation',
    icon: Trophy,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    backendParentTopic: 'EXPRESSION',
    emoji: '🏆',
  },
  {
    id: 'RELATIONSHIPS',
    label: 'Relationships',
    icon: Film,
    iconColor: '#9333EA',
    iconBg: '#F3E8FF',
    backendParentTopic: 'RELATIONSHIPS',
    emoji: '💞',
  },
  {
    id: 'FRIENDSHIP',
    label: 'Friendship',
    icon: Users,
    iconColor: '#0D9488',
    iconBg: '#CCFBF1',
    backendParentTopic: 'FEELINGS',
    emoji: '🤝',
  },
  {
    id: 'OTHERS',
    label: 'Others',
    icon: MoreHorizontal,
    iconColor: '#64748B',
    iconBg: '#F1F5F9',
    backendParentTopic: 'GENERAL',
    emoji: '✨',
  },
];

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Header Decorative Art matching reference screenshot: upright pink feather quill + pink chat bubble with 3 dots
function HeaderDecorativeArt() {
  return (
    <div className="ct-header-art" aria-hidden="true">
      <svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pink Chat Bubble */}
        <rect x="18" y="14" width="34" height="22" rx="9" fill="url(#ct-bubble-grad)" />
        <path d="M24 35L21 41L29 36H24Z" fill="#F50057" />
        <circle cx="28" cy="25" r="1.8" fill="#FFFFFF" />
        <circle cx="35" cy="25" r="1.8" fill="#FFFFFF" />
        <circle cx="42" cy="25" r="1.8" fill="#FFFFFF" />

        {/* Upright Elegant Feather / Quill */}
        <g transform="translate(48, 4)">
          <path
            d="M8 38C10 32 16 20 22 8C20 16 23 23 25 31C21 34 14 37 8 38Z"
            fill="url(#ct-feather-grad)"
          />
          <path
            d="M8 38C6 32 4 22 2 12C7 17 8 26 10 35L8 38Z"
            fill="#FF80AB"
            opacity="0.85"
          />
          <path
            d="M8 38C13 26 18 16 22 8"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>

        {/* Sparkles */}
        <path d="M12 10L13 7L14 10L17 11L14 12L13 15L12 12L9 11Z" fill="#F50057" opacity="0.65" />
        <path d="M78 12L79 9L80 12L83 13L80 14L79 17L78 14L75 13Z" fill="#AE17B5" opacity="0.55" />
        <circle cx="74" cy="26" r="1.5" fill="#F50057" opacity="0.5" />

        <defs>
          <linearGradient id="ct-bubble-grad" x1="18" y1="14" x2="52" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF3264" />
            <stop offset="1" stopColor="#F50057" />
          </linearGradient>
          <linearGradient id="ct-feather-grad" x1="8" y1="38" x2="25" y2="8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F50057" />
            <stop offset="1" stopColor="#FF66A1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Upload Dropzone Illustration matching reference: overlapping pink photo frames with plus badge
function DropzoneArt() {
  return (
    <div className="ct-upload-illus" aria-hidden="true">
      <svg width="64" height="46" viewBox="0 0 64 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Back photo frame (tilted slightly left) */}
        <g transform="rotate(-8 18 20)">
          <rect x="4" y="6" width="32" height="25" rx="4" fill="#FFFFFF" stroke="#FCE4EC" strokeWidth="1.2" />
          <rect x="7" y="9" width="26" height="15" rx="2" fill="#FFE8F0" />
        </g>
        {/* Front photo frame */}
        <g transform="rotate(4 30 22)">
          <rect x="14" y="8" width="34" height="26" rx="4" fill="#FFFFFF" stroke="#F8A5C6" strokeWidth="1.4" />
          <rect x="17" y="11" width="28" height="16" rx="2" fill="#FFD6EA" />
          {/* Mountains */}
          <path d="M19 25L24 19L29 25H19Z" fill="#F50057" opacity="0.8" />
          <path d="M27 25L31 21L36 25H27Z" fill="#F50057" opacity="0.5" />
          <circle cx="34" cy="15" r="2" fill="#FF80AB" />
        </g>
        {/* Plus Badge */}
        <circle cx="44" cy="34" r="7.5" fill="#F50057" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M44 30.5V37.5M40.5 34H47.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function TopicCreateModal({ isOpen, onClose, onCreated }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { t, currentLanguage } = useLanguage();

  const isEnglish = !currentLanguage || normalizeLanguage(currentLanguage) === 'English';
  const getUiText = useCallback(
    (key, defaultText) => (isEnglish ? defaultText : t(key, defaultText)),
    [isEnglish, t]
  );

  const [name, setName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('LOVE');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [serverImageUrl, setServerImageUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [existingTopicNames, setExistingTopicNames] = useState(new Set());
  const [errors, setErrors] = useState({});

  const modalRef = useRef(null);
  const nameInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch existing topics to detect duplicates
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const names = new Set();

    Object.values(CANONICAL_TOPICS).forEach((ct) => {
      if (ct.name) names.add(ct.name.trim().toLowerCase());
    });

    try {
      const customs = getCustomTopics();
      if (Array.isArray(customs)) {
        customs.forEach((c) => {
          const cName = typeof c === 'string' ? c : (c.name || c.id || '');
          if (cName) names.add(cName.trim().toLowerCase());
        });
      }
    } catch {
      // ignore
    }

    apiTopicService.getTopics().then((serverTopics) => {
      if (!active || !Array.isArray(serverTopics)) return;
      serverTopics.forEach((st) => {
        if (st.name) names.add(st.name.trim().toLowerCase());
      });
      setExistingTopicNames(names);
    }).catch(() => {
      if (active) setExistingTopicNames(names);
    });

    return () => {
      active = false;
    };
  }, [isOpen]);

  // Lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 120);

    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form helper
  const resetForm = useCallback(() => {
    setName('');
    setSelectedCategoryId('LOVE');
    setDescription('');
    setImageFile(null);
    setImagePreview('');
    setServerImageUrl('');
    setErrors({});
    setIsSubmitting(false);
    setIsUploading(false);
  }, []);

  // Real-time duplicate name check
  const handleNameChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_NAME_LENGTH) {
      setName(val);
      if (errors.name) {
        setErrors((prev) => ({ ...prev, name: null }));
      }
      const trimmed = val.trim().toLowerCase();
      if (trimmed && existingTopicNames.has(trimmed)) {
        setErrors((prev) => ({
          ...prev,
          name: t('topicDuplicateError', 'A topic with this name already exists. Choose a unique name.'),
        }));
      }
    }
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(val);
      if (errors.description) {
        setErrors((prev) => ({ ...prev, description: null }));
      }
    }
  };

  // Image validation and upload handler
  const processImageFile = async (file) => {
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: getUiText('invalidImageType', 'Unsupported file type. Please upload a PNG, JPG, or WebP image.'),
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        image: getUiText('imageTooLarge', 'Image file is too large. Maximum file size is 5MB.'),
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: null }));
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 20000,
      });
      const uploadedUrl = response.data?.data?.imageUrl || response.data?.imageUrl || '';
      setServerImageUrl(uploadedUrl);
    } catch (err) {
      console.warn('[TopicCreateModal] Image upload warning:', err?.message || err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleFileDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleFileDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview('');
    setServerImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors((prev) => ({ ...prev, image: null }));
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const newErrors = {};

    if (!trimmedName) {
      newErrors.name = getUiText('topicNameRequired', 'Topic name is required.');
    } else if (existingTopicNames.has(trimmedName.toLowerCase())) {
      newErrors.name = getUiText('topicDuplicateError', 'A topic with this name already exists. Choose a unique name.');
    }

    if (!trimmedDesc) {
      newErrors.description = getUiText('topicDescRequired', 'Topic description is required.');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedCategory = CATEGORY_OPTIONS.find((c) => c.id === selectedCategoryId) || CATEGORY_OPTIONS[0];

    setIsSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        label: trimmedName,
        parentTopic: selectedCategory.backendParentTopic,
        icon: selectedCategory.emoji,
        description: trimmedDesc || null,
        imageUrl: serverImageUrl || null,
        createdByUsername: currentUser?.username || '@anonymous',
      };

      const createdTopic = await apiTopicService.createTopic(payload);

      if (!createdTopic || (!createdTopic.id && !createdTopic.name)) {
        throw new Error(getUiText('topicCreateFailed', 'Unable to create this topic. Server returned no topic ID.'));
      }

      const topicId = createdTopic.id || createdTopic.name;
      const coverToStore = createdTopic.imageUrl || serverImageUrl || imagePreview || null;

      if (coverToStore) {
        try {
          const existingCovers = JSON.parse(localStorage.getItem('mka_topic_covers') || '{}');
          existingCovers[String(topicId)] = coverToStore;
          existingCovers[String(trimmedName).toLowerCase()] = coverToStore;
          if (createdTopic.name) existingCovers[String(createdTopic.name).toLowerCase()] = coverToStore;
          if (createdTopic.label) existingCovers[String(createdTopic.label).toLowerCase()] = coverToStore;
          localStorage.setItem('mka_topic_covers', JSON.stringify(existingCovers));
        } catch {
          // safe ignore
        }
      }

      const finalTopic = {
        ...createdTopic,
        id: topicId,
        name: createdTopic.label || createdTopic.name || trimmedName,
        parentTopic: createdTopic.parentTopic || selectedCategory.backendParentTopic,
        icon: createdTopic.icon || selectedCategory.emoji,
        description: createdTopic.description || trimmedDesc || null,
        createdByUsername: createdTopic.createdByUsername || currentUser?.username || '@anonymous',
        createdAt: createdTopic.createdAt || new Date().toISOString(),
        imageUrl: coverToStore,
      };

      try {
        saveCustomTopic(trimmedName, selectedCategory.emoji, currentUser?.username);
      } catch {
        // safe ignore
      }

      addToast(getUiText('topicCreatedSuccess', 'Topic created successfully!'), 'success');
      resetForm();
      onClose();

      // Dispatch global event for instant UI cache invalidation across open views
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mka:topicCreated', { detail: finalTopic }));
      }

      onCreated?.(finalTopic);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || getUiText('topicCreateFailed', 'Unable to create this topic.');
      addToast(errorMsg, 'error');
      setErrors((prev) => ({ ...prev, submit: errorMsg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    !errors.name &&
    !isSubmitting &&
    !isUploading;

  return (
    <div
      className="ct-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="ct-modal-card"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ct-modal-title"
        aria-describedby="ct-modal-subtitle"
      >
        {/* Header Section */}
        <div className="ct-modal-header">
          <div className="ct-header-left">
            <div className="ct-header-icon-badge" aria-hidden="true">
              <Pencil size={20} strokeWidth={2.4} />
            </div>
            <div className="ct-header-text">
              <h2 id="ct-modal-title" className="ct-header-title">
                {getUiText('createTopicTitle', 'Create a New Topic')}
              </h2>
              <p id="ct-modal-subtitle" className="ct-header-subtitle">
                {getUiText('createTopicSubtitle', 'Start a conversation and build a community around your interests.')}
              </p>
            </div>
          </div>

          <div className="ct-header-right">
            <HeaderDecorativeArt />
            <button
              type="button"
              className="ct-header-close-btn"
              onClick={onClose}
              aria-label={getUiText('close', 'Close')}
            >
              <X size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Modal Form Wrap */}
        <form onSubmit={handleSubmit} noValidate className="ct-modal-form">
          {/* Scrollable Form Steps Body */}
          <div className="ct-modal-body">
            {/* Step 1: Topic Name */}
            <div className="ct-step-block">
              <div className="ct-step-num" aria-hidden="true">1</div>
              <div className="ct-step-content">
                <div className="ct-step-header-row">
                  <div className="ct-step-label-wrap">
                    <label htmlFor="ct-topic-name" className="ct-step-label">
                      {getUiText('topicName', 'Topic Name')} <span className="ct-required-star">*</span>
                    </label>
                    <span className="ct-step-sublabel">
                      {getUiText('topicNameHelper', 'Give your topic a clear and simple name.')}
                    </span>
                  </div>
                  <span className="ct-char-counter">
                    {name.length}/{MAX_NAME_LENGTH}
                  </span>
                </div>

                <div className={`ct-input-box ${errors.name ? 'has-error' : ''}`}>
                  <Pencil size={15} className="ct-input-icon" aria-hidden="true" />
                  <input
                    id="ct-topic-name"
                    ref={nameInputRef}
                    type="text"
                    className="ct-input-field"
                    placeholder={getUiText('topicNamePlaceholder', 'E.g. Coping with Anxiety, College Life Stories, Finding Motivation...')}
                    value={name}
                    onChange={handleNameChange}
                    maxLength={MAX_NAME_LENGTH}
                    autoComplete="off"
                    required
                  />
                </div>

                {errors.name ? (
                  <div className="ct-error-msg" role="alert">
                    <AlertCircle size={14} /> {errors.name}
                  </div>
                ) : (
                  <div className="ct-step-note">
                    {getUiText('topicNameNote', 'Keep it short, relevant and easy to understand.')}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Category Selection */}
            <div className="ct-step-block">
              <div className="ct-step-num" aria-hidden="true">2</div>
              <div className="ct-step-content">
                <div className="ct-step-header-row">
                  <div className="ct-step-label-wrap">
                    <span className="ct-step-label">
                      {getUiText('selectCategory', 'Category')} <span className="ct-required-star">*</span>
                    </span>
                    <span className="ct-step-sublabel">
                      {getUiText('categoryHelper', 'Choose the category that best fits your topic.')}
                    </span>
                  </div>
                </div>

                <div
                  className="ct-category-grid"
                  role="radiogroup"
                  aria-label={getUiText('selectCategory', 'Select a Category')}
                >
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const IconComponent = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        data-selected={isSelected}
                        className={`ct-category-tile ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedCategoryId(cat.id);
                          }
                        }}
                      >
                        {isSelected && (
                          <div className="ct-category-check-badge" aria-hidden="true">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div
                          className="ct-category-icon-wrap"
                          style={{
                            backgroundColor: cat.iconBg,
                            color: cat.iconColor,
                          }}
                          aria-hidden="true"
                        >
                          <IconComponent size={18} strokeWidth={2.2} />
                        </div>
                        <span className="ct-category-label">{cat.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Topic Description */}
            <div className="ct-step-block">
              <div className="ct-step-num" aria-hidden="true">3</div>
              <div className="ct-step-content">
                <div className="ct-step-header-row">
                  <div className="ct-step-label-wrap">
                    <label htmlFor="ct-topic-desc" className="ct-step-label">
                      {getUiText('topicDescription', 'Topic Description')} <span className="ct-required-star">*</span>
                    </label>
                    <span className="ct-step-sublabel">
                      {getUiText('topicDescHelper', "Explain what this topic is about, what people can discuss, and why it's meaningful.")}
                    </span>
                  </div>
                </div>

                <div className={`ct-textarea-box ${errors.description ? 'has-error' : ''}`}>
                  <Pencil size={15} className="ct-input-icon" style={{ marginTop: 2 }} aria-hidden="true" />
                  <textarea
                    id="ct-topic-desc"
                    rows={2}
                    className="ct-textarea-field"
                    placeholder={getUiText(
                      'topicDescPlaceholder',
                      'Share more details about your topic, what kind of discussions it can include, and why it matters...'
                    )}
                    value={description}
                    onChange={handleDescriptionChange}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    required
                  />
                </div>

                <div className="ct-step-header-row" style={{ marginTop: -2 }}>
                  {errors.description ? (
                    <div className="ct-error-msg" role="alert">
                      <AlertCircle size={14} /> {errors.description}
                    </div>
                  ) : <div />}
                  <span className="ct-char-counter">
                    {description.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4: Cover Image Upload (Optional) */}
            <div className="ct-step-block">
              <div className="ct-step-num" aria-hidden="true">4</div>
              <div className="ct-step-content">
                <div className="ct-step-header-row">
                  <div className="ct-step-label-wrap">
                    <span className="ct-step-label">
                      {getUiText('coverImageOptional', 'Cover Image (Optional)')}
                    </span>
                    <span className="ct-step-sublabel">
                      {getUiText('coverImageHelper', 'Add a cover image to make your topic more attractive and easy to recognize.')}
                    </span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processImageFile(file);
                  }}
                />

                {imagePreview ? (
                  <div className="ct-upload-preview-card">
                    <img
                      src={imagePreview.startsWith('blob:') ? imagePreview : getMediaUrl(imagePreview)}
                      alt={getUiText('coverPreview', 'Cover image preview')}
                      className="ct-upload-preview-bg"
                    />
                    <div className="ct-upload-preview-overlay" />
                    <div className="ct-upload-preview-info">
                      <span className="ct-upload-preview-name">
                        {imageFile?.name || 'Selected Cover Image'}
                      </span>
                      <span className="ct-upload-preview-status">
                        {isUploading
                          ? getUiText('uploadingWait', 'Uploading image...')
                          : getUiText('imageReady', 'Image ready for publication')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ct-upload-remove-btn"
                      onClick={handleRemoveImage}
                      aria-label={getUiText('removeImage', 'Remove image')}
                    >
                      <Trash2 size={13} /> {getUiText('remove', 'Remove')}
                    </button>
                  </div>
                ) : (
                  <div
                    className={`ct-upload-dropzone ${isDragOver ? 'drag-active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleFileDragOver}
                    onDragLeave={handleFileDragLeave}
                    onDrop={handleFileDrop}
                    tabIndex={0}
                    role="button"
                    aria-label={getUiText('uploadCoverImage', 'Upload cover image')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <DropzoneArt />

                    <div className="ct-upload-instruction">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CloudUpload size={17} style={{ color: 'var(--ct-muted)' }} />
                        <span className="ct-upload-main-text">
                          {getUiText('dragDropOrBrowse', 'Drag and drop an image here, or ')}
                          <span className="ct-upload-click-link">{getUiText('clickToBrowse', 'click to upload')}</span>
                        </span>
                      </div>
                      <span className="ct-upload-hint">
                        {getUiText('recommendedSpecs', 'PNG, JPG or WebP (Recommended size: 1200 × 400)')}
                      </span>
                    </div>
                  </div>
                )}

                {errors.image && (
                  <div className="ct-error-msg" role="alert">
                    <AlertCircle size={14} /> {errors.image}
                  </div>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="ct-error-msg" role="alert" style={{ marginTop: 4 }}>
                <AlertCircle size={15} /> {errors.submit}
              </div>
            )}
          </div>

          {/* Footer Section - Pinned at bottom with soft decorative wave */}
          <div className="ct-modal-footer">
            <div className="ct-footer-wave" aria-hidden="true">
              <svg viewBox="0 0 140 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <path d="M0 48V16C28 10 46 28 82 20C118 12 132 36 140 48H0Z" fill="#FFEBF4" opacity="0.8" />
                <path d="M0 48V28C22 22 40 36 68 30C96 24 116 40 126 48H0Z" fill="#FFD6EA" opacity="0.65" />
              </svg>
            </div>

            <div className="ct-footer-actions">
              <button
                type="button"
                className="ct-btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {getUiText('cancel', 'Cancel')}
              </button>

              <button
                type="submit"
                className="ct-btn-submit"
                disabled={!isFormValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="ct-btn-spinner" />
                    <span>{getUiText('creatingTopic', 'Creating...')}</span>
                  </>
                ) : (
                  <>
                    <span>{getUiText('createTopicAction', 'Create Topic')}</span>
                    <ArrowRight size={15} strokeWidth={2.4} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
