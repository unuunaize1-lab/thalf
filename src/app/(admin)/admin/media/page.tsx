'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, UploadCloud, Copy, Check, Trash2, Search } from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: string;
  createdAt: string;
}

const MOCK_MEDIA: MediaAsset[] = [
  {
    id: 'med-1',
    filename: 'date-chocolate.jpeg',
    url: '/images/choclates/date-chocolate.jpeg',
    mimeType: 'image/jpeg',
    size: '55 KB',
    createdAt: '2026-08-17',
  },
  {
    id: 'med-2',
    filename: 'dates-chocolate.jpeg',
    url: '/images/choclates/dates-chocolate.jpeg',
    mimeType: 'image/jpeg',
    size: '47 KB',
    createdAt: '2026-08-17',
  },
  {
    id: 'med-3',
    filename: 'kunafa-pistachio.jpeg',
    url: '/images/choclates/kunafa-pistachio.jpeg',
    mimeType: 'image/jpeg',
    size: '47 KB',
    createdAt: '2026-08-17',
  },
  {
    id: 'med-4',
    filename: 'lollypop.jpeg',
    url: '/images/choclates/lollypop.jpeg',
    mimeType: 'image/jpeg',
    size: '47 KB',
    createdAt: '2026-08-17',
  },
  {
    id: 'med-5',
    filename: 'rock-chocolate.jpeg',
    url: '/images/choclates/rock-chocolate.jpeg',
    mimeType: 'image/jpeg',
    size: '54 KB',
    createdAt: '2026-08-17',
  },
];

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/admin/media');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.media)) {
        setMediaList(data.media);
      } else {
        setError(data.error || 'Failed to fetch media assets.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMedia();
  }, []);

  const filteredMedia = mediaList.filter(m =>
    m.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', 'general');

        const res = await fetch('/api/v1/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }
      }
      await fetchMedia();
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = (id: string) => {
    setMediaToDelete(id);
  };

  const confirmDeleteMedia = async () => {
    if (!mediaToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/admin/media/${mediaToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete media asset.');
      }

      await fetchMedia();
      setMediaToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Error deleting media asset.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Asset Vault</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          Media Library
        </h1>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-red-900">X</button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="bg-cream border-2 border-dashed border-parchment p-8 text-center space-y-3 relative hover:border-gold transition-colors">
        <UploadCloud className="h-10 w-10 text-gold mx-auto" />
        <div>
          <p className="text-xs font-bold uppercase text-dark">Drag & Drop Product Imagery or Brand Assets</p>
          <span className="text-[10px] text-dark/50 block mt-1">Supports PNG, JPG, WEBP up to 10MB</span>
        </div>
        <label className="inline-flex items-center px-4 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-gold/90 transition-colors shadow-sm">
          {uploading ? 'Uploading Asset...' : 'Browse File Explorer'}
          <input type="file" multiple accept="image/*" disabled={uploading} onChange={handleUploadFiles} className="hidden" />
        </label>
      </div>

      {/* Search */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search media files by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
          />
        </div>
        <span className="text-[10px] font-bold uppercase text-dark/60">{filteredMedia.length} Assets</span>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-dark/60">
          Loading Media Vault Assets...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-dark/60">
          No media assets found matching search query.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map(m => (
            <div key={m.id} className="bg-cream border border-parchment p-3 shadow-lux space-y-2 group relative flex flex-col justify-between">
              <div className="h-28 bg-dark/10 border border-parchment flex items-center justify-center overflow-hidden relative">
                <img
                  src={m.url}
                  alt={m.filename}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="font-serif text-dark/40 font-bold text-xs absolute inset-0 flex items-center justify-center -z-10">
                  THALF Asset
                </span>
              </div>

              <div>
                <p className="text-xs font-serif font-bold text-dark truncate" title={m.filename}>{m.filename}</p>
                <span className="text-[9px] font-mono text-dark/50 block">{m.size}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-parchment/40">
                <button
                  onClick={() => handleCopyUrl(m.id, m.url)}
                  className="p-1 text-dark/60 hover:text-gold transition-colors flex items-center text-[9px] font-bold uppercase"
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-green-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" /> Copy URL
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  title="Permanently Delete Media Asset"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!mediaToDelete}
        title="Delete Media Asset"
        description="Are you sure you want to permanently delete this media asset from the library? This action cannot be undone."
        confirmLabel="Permanently Delete"
        isDestructive={true}
        isProcessing={isDeleting}
        onConfirm={confirmDeleteMedia}
        onCancel={() => setMediaToDelete(null)}
      />
    </div>
  );
}
