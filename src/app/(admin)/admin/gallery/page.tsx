'use client';

import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Image as ImageIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

interface GalleryImageRecord {
  id: string;
  imageUrl: string;
  publicId: string | null;
  alt: string;
  caption: string | null;
  row: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New Image Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [row, setRow] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Deletion modal state
  const [imageToDelete, setImageToDelete] = useState<GalleryImageRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/admin/gallery');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.images)) {
        setImages(data.images);
      } else {
        setError(data.error || 'Failed to fetch gallery images.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    setError(null);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', 'gallery');

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.media?.url) {
        throw new Error(data.error || 'Failed to upload image file.');
      }

      setImageUrl(data.media.url);
      setAlt(file.name.replace(/\.[^/.]+$/, ''));
      setSuccess('Image file uploaded successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleCreateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Please provide an image URL or upload an image file.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl.trim(),
          alt: alt.trim() || 'THALF Client Moment',
          caption: caption.trim() || null,
          row,
          sortOrder,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add gallery image.');
      }

      setSuccess('Gallery image added successfully.');
      setTimeout(() => setSuccess(null), 3000);
      setImageUrl('');
      setAlt('');
      setCaption('');
      setShowAddForm(false);
      fetchGalleryImages();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateImage = async (id: string, updates: Partial<GalleryImageRecord>) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update image.');
      }

      setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
    } catch (err: any) {
      setError(err.message || 'Failed to update gallery image.');
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/admin/gallery/${imageToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete image.');
      }

      setSuccess('Gallery image removed successfully.');
      setTimeout(() => setSuccess(null), 3000);
      setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
      setImageToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Error deleting image.');
    } finally {
      setIsDeleting(false);
    }
  };

  const row1Images = images.filter(img => img.row === 1);
  const row2Images = images.filter(img => img.row === 2);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Homepage Marquee</span>
          <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
            Client Photo Gallery
          </h1>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#2D1B18] text-[#F3EFE6] text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#2D1B18] transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? 'Close Form' : '+ Add Client Photo'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-red-900">X</button>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 border border-green-300 text-green-800 text-xs font-semibold flex items-center space-x-2">
          <Check className="h-4 w-4 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Image Drawer / Card */}
      {showAddForm && (
        <form onSubmit={handleCreateImage} className="bg-[#FAF8F5] border-2 border-[#C5A059] p-6 shadow-lux space-y-4">
          <h3 className="text-sm font-bold uppercase text-[#2D1B18] tracking-wider flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-[#C5A059]" />
            <span>Upload New Client Gallery Photo</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* File Upload or URL */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-dark/70">Image Source (File Upload or Direct URL):</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="https://cloudinary.com/... or paste image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 p-2.5 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold font-mono"
                  required
                />
                <label className="px-3 py-2.5 bg-gold text-dark text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-gold/90 transition-colors whitespace-nowrap flex items-center space-x-1">
                  <UploadCloud className="h-4 w-4 mr-1" />
                  <span>{uploadingFile ? 'Uploading...' : 'Browse'}</span>
                  <input type="file" accept="image/*" disabled={uploadingFile} onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {imageUrl && (
                <div className="h-24 w-36 relative border border-parchment bg-dark/5 overflow-hidden mt-2">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Alt & Caption */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Alt Text (Accessibility):</label>
                <input
                  type="text"
                  placeholder="e.g. Client celebration with THALF Royal Gift Box"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="w-full p-2.5 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Caption / Moment Description (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Shared at Diwali Corporate Gala"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2.5 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Row & Sort Order */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Marquee Row Placement:</label>
              <select
                value={row}
                onChange={(e) => setRow(Number(e.target.value))}
                className="w-full p-2.5 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
              >
                <option value={1}>Row 1 (Scrolls Left →)</option>
                <option value={2}>Row 2 (Scrolls Right ←)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Display Sort Order (Number):</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full p-2.5 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-parchment text-dark text-xs font-bold uppercase hover:bg-parchment transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-dark text-cream text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-dark transition-colors"
            >
              {submitting ? 'Adding to Gallery...' : 'Save Gallery Image'}
            </button>
          </div>
        </form>
      )}

      {/* Gallery Render List */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-dark/50">Loading gallery photos...</div>
      ) : images.length === 0 ? (
        <div className="p-12 text-center bg-cream border border-parchment space-y-3">
          <ImageIcon className="h-10 w-10 text-gold mx-auto" />
          <p className="font-serif text-lg text-dark">No Client Gallery Images Found</p>
          <p className="text-xs text-dark/60 max-w-md mx-auto">
            Upload real client photos above to populate the homepage continuous marquee gallery. The homepage will remain clean and hidden until photos are added.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Row 1 Section */}
          <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4">
            <div className="flex items-center justify-between border-b border-parchment pb-3">
              <h2 className="text-sm font-bold uppercase text-dark tracking-wider flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-gold rounded-full" />
                <span>ROW 1 — Left Marquee ({row1Images.length} Photos)</span>
              </h2>
              <span className="text-[10px] font-mono text-dark/50">Continuous Left Scroll</span>
            </div>

            {row1Images.length === 0 ? (
              <p className="text-xs text-dark/50 italic py-4">No images assigned to Row 1.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {row1Images.map((img) => (
                  <GalleryImageCard
                    key={img.id}
                    image={img}
                    onUpdate={handleUpdateImage}
                    onDelete={() => setImageToDelete(img)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Row 2 Section */}
          <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4">
            <div className="flex items-center justify-between border-b border-parchment pb-3">
              <h2 className="text-sm font-bold uppercase text-dark tracking-wider flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-dark rounded-full" />
                <span>ROW 2 — Right Marquee ({row2Images.length} Photos)</span>
              </h2>
              <span className="text-[10px] font-mono text-dark/50">Continuous Right Scroll</span>
            </div>

            {row2Images.length === 0 ? (
              <p className="text-xs text-dark/50 italic py-4">No images assigned to Row 2.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {row2Images.map((img) => (
                  <GalleryImageCard
                    key={img.id}
                    image={img}
                    onUpdate={handleUpdateImage}
                    onDelete={() => setImageToDelete(img)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!imageToDelete}
        title="Remove Client Photo"
        description={imageToDelete ? `Are you sure you want to delete this gallery photo?` : ''}
        confirmLabel="Delete Photo"
        isDestructive={true}
        isProcessing={isDeleting}
        onConfirm={handleDeleteImage}
        onCancel={() => setImageToDelete(null)}
      />
    </div>
  );
}

function GalleryImageCard({
  image,
  onUpdate,
  onDelete,
}: {
  image: GalleryImageRecord;
  onUpdate: (id: string, updates: Partial<GalleryImageRecord>) => void;
  onDelete: () => void;
}) {
  const [altText, setAltText] = useState(image.alt);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className={`border p-3 space-y-3 relative transition-all ${
      image.isActive ? 'bg-white border-parchment shadow-sm' : 'bg-parchment/30 border-dashed border-dark/30 opacity-60'
    }`}>
      <div className="relative aspect-[4/3] bg-dark/5 border border-parchment overflow-hidden">
        <img src={image.imageUrl} alt={image.alt} className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-dark/80 text-cream text-[9px] font-mono font-bold">
          Sort #{image.sortOrder}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <label className="text-[9px] font-bold uppercase text-dark/60 block">Alt Text:</label>
          <div className="flex items-center space-x-1 mt-0.5">
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="flex-1 p-1 bg-cream border border-parchment text-[11px] focus:outline-none focus:border-gold"
            />
            {altText !== image.alt && (
              <button
                onClick={async () => {
                  setIsSaving(true);
                  await onUpdate(image.id, { alt: altText });
                  setIsSaving(false);
                }}
                disabled={isSaving}
                className="p-1 bg-dark text-cream hover:bg-gold hover:text-dark"
                title="Save Alt Text"
              >
                <Save className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-parchment/60">
          <div>
            <label className="text-[9px] font-bold uppercase text-dark/60 block">Row:</label>
            <select
              value={image.row}
              onChange={(e) => onUpdate(image.id, { row: Number(e.target.value) })}
              className="w-full p-1 bg-cream border border-parchment text-[11px]"
            >
              <option value={1}>Row 1</option>
              <option value={2}>Row 2</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase text-dark/60 block">Sort Order:</label>
            <input
              type="number"
              value={image.sortOrder}
              onChange={(e) => onUpdate(image.id, { sortOrder: Number(e.target.value) })}
              className="w-full p-1 bg-cream border border-parchment text-[11px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-parchment/60">
          <button
            onClick={() => onUpdate(image.id, { isActive: !image.isActive })}
            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
              image.isActive ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            {image.isActive ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
            <span>{image.isActive ? 'Active' : 'Disabled'}</span>
          </button>

          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
            title="Delete Photo"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
