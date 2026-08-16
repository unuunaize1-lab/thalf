'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, Star, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Loader2 } from 'lucide-react';

export interface GalleryItem {
  id: string;
  url: string;
  publicId?: string;
  alt?: string;
  isDefault: boolean;
  order: number;
}

interface ProductMediaGalleryProps {
  productId: string;
  images: GalleryItem[];
  onChange: (updatedImages: GalleryItem[]) => void;
}

export function ProductMediaGallery({ productId, images, onChange }: ProductMediaGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);

    try {
      const updatedList = [...images];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', productId || 'new-product');
        formData.append('altText', file.name.split('.')[0] || 'Product Image');

        const res = await fetch('/api/v1/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.image) {
          updatedList.push({
            id: data.image.id,
            url: data.image.url,
            publicId: data.image.publicId,
            alt: data.image.alt,
            isDefault: data.image.isDefault,
            order: data.image.order,
          });
        } else {
          setErrorMessage(data.error || 'Failed to upload image.');
        }
      }

      onChange(updatedList);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading media file.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    const updated = images.map((img) => ({
      ...img,
      isDefault: img.id === imageId,
    }));
    onChange(updated);

    if (productId && !productId.startsWith('thalf-')) {
      try {
        await fetch(`/api/v1/admin/media/${imageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SET_PRIMARY', productId }),
        });
      } catch (err) {
        setErrorMessage('Failed to set primary image on server.');
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const remaining = images.filter((img) => img.id !== imageId);
    if (remaining.length > 0 && !remaining.some((img) => img.isDefault)) {
      remaining[0].isDefault = true;
    }
    onChange(remaining);

    if (productId && !productId.startsWith('thalf-')) {
      try {
        await fetch(`/api/v1/admin/media/${imageId}?productId=${productId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        setErrorMessage('Failed to delete image on server.');
      }
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    const list = [...images];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    const reordered = list.map((img, i) => ({ ...img, order: i }));
    onChange(reordered);

    if (productId && !productId.startsWith('thalf-')) {
      try {
        await fetch(`/api/v1/admin/media/${list[0].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'REORDER',
            productId,
            orders: reordered.map((img) => ({ id: img.id, order: img.order })),
          }),
        });
      } catch (err) {
        setErrorMessage('Failed to reorder images on server.');
      }
    }
  };

  return (
    <div className="space-y-3 bg-parchment/30 p-4 border border-parchment">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-dark/70 flex items-center">
          <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-gold" /> Cloudinary Media Gallery
        </span>
        <label className="cursor-pointer px-3 py-1.5 bg-dark text-gold hover:bg-gold hover:text-dark text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center space-x-1">
          {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
          <span>{uploading ? 'Uploading...' : '+ Upload Asset'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {errorMessage && (
        <div className="p-2 text-[10px] bg-red-100 text-red-800 border border-red-200">
          {errorMessage}
        </div>
      )}

      {images.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-dark/20 bg-cream/50 space-y-1">
          <ImageIcon className="h-6 w-6 text-dark/30 mx-auto" />
          <p className="text-xs text-dark/60 font-medium">No Product Images Uploaded</p>
          <p className="text-[9px] text-dark/40">Upload JPEG, PNG, WebP or AVIF images up to 10MB.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              className={`relative border p-1 bg-cream group transition-all ${
                img.isDefault ? 'border-gold ring-1 ring-gold shadow-md' : 'border-parchment'
              }`}
            >
              <div className="relative aspect-square bg-dark/10 overflow-hidden">
                <Image src={img.url} alt={img.alt || 'Product Image'} fill className="object-cover" />
                {img.isDefault && (
                  <span className="absolute top-1 left-1 bg-gold text-dark font-bold uppercase text-[8px] tracking-wider px-1.5 py-0.5">
                    Primary
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-parchment/60 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(img.id)}
                  title={img.isDefault ? 'Current Primary' : 'Set as Primary Image'}
                  className={`p-1 ${img.isDefault ? 'text-gold' : 'text-dark/40 hover:text-gold'}`}
                >
                  <Star className={`h-3.5 w-3.5 ${img.isDefault ? 'fill-gold' : ''}`} />
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-0.5 text-dark/40 hover:text-dark disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-0.5 text-dark/40 hover:text-dark disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="p-0.5 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
