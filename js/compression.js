// compression.js
// Utilitas kompresi gambar untuk foto validasi parameter di Turbine Logsheet Pro
// Dirancang agar ringan, cepat, dan cocok untuk perangkat mobile

/**
 * Opsi default kompresi yang direkomendasikan untuk foto logsheet
 * - Resolusi maks 1280px (cukup tajam untuk inspeksi, tidak terlalu besar)
 * - Kualitas 0.78 (balance bagus antara ukuran & kejelasan)
 */
const DEFAULT_OPTIONS = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.78,
  type: 'image/jpeg'          // jpeg biasanya paling kompatibel & ukuran kecil
};

/**
 * Mengompresi gambar dari data URL (base64)
 * @param {string} base64Image - string "data:image/...;base64,..."
 * @param {Object} [customOptions] - override opsi default
 * @returns {Promise<{ dataUrl: string, originalSizeKB: number, compressedSizeKB: number, reductionPercent: number, width: number, height: number }>}
 */
export async function compressImage(base64Image, customOptions = {}) {
  if (typeof base64Image !== 'string' || !base64Image.startsWith('data:image')) {
    throw new Error('Input harus berupa data URL gambar yang valid');
  }

  const options = { ...DEFAULT_OPTIONS, ...customOptions };

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      let w = img.width;
      let h = img.height;

      // Pertahankan aspect ratio
      if (w > h) {
        if (w > options.maxWidth) {
          h = Math.round(h * (options.maxWidth / w));
          w = options.maxWidth;
        }
      } else {
        if (h > options.maxHeight) {
          w = Math.round(w * (options.maxHeight / h));
          h = options.maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Gagal mendapatkan 2D context dari canvas'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      const compressedDataUrl = canvas.toDataURL(options.type, options.quality);

      // Hitung ukuran dalam KB
      const originalKB = Math.round((base64Image.length * 3) / 4 / 1024);
      const compressedKB = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      const reduction = originalKB > 0 ? Math.round(((originalKB - compressedKB) / originalKB) * 100) : 0;

      // Logging ringkas (bisa dihapus di production jika tidak diperlukan)
      console.log(
        `[compression] ${originalKB} KB → ${compressedKB} KB ` +
        `(-${reduction}%) | ${w}×${h} | quality=${options.quality}`
      );

      resolve({
        dataUrl: compressedDataUrl,
        originalSizeKB: originalKB,
        compressedSizeKB: compressedKB,
        reductionPercent: reduction,
        width: w,
        height: h
      });
    };

    img.onerror = () => reject(new Error('Gagal memuat gambar untuk kompresi'));

    img.src = base64Image;
  });
}

/**
 * Kompresi langsung dari objek File (biasa dipakai setelah <input type="file"> atau kamera)
 * @param {File} file 
 * @param {Object} [options] 
 * @returns {Promise<Object>} sama seperti compressImage + info file tambahan
 */
export async function compressFile(file, options = {}) {
  if (!(file instanceof File)) {
    throw new Error('Parameter harus berupa objek File');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const result = await compressImage(reader.result, options);
        resolve({
          ...result,
          originalFileName: file.name,
          mimeType: file.type,
          lastModified: file.lastModified,
          originalFileSizeKB: Math.round(file.size / 1024)
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Helper: hitung ukuran base64 dalam KB (untuk validasi sebelum upload)
 * @param {string} base64 
 * @returns {number}
 */
export function getBase64SizeInKB(base64) {
  if (typeof base64 !== 'string' || base64.length < 20) return 0;
  return Math.round((base64.length * 3) / 4 / 1024);
}

/**
 * Contoh opsi alternatif yang bisa dipakai di tempat tertentu
 */
export const COMPRESS_PRESETS = {
  // Untuk preview cepat di layar (lebih kecil lagi)
  preview: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.70
  },
  // Untuk upload ke server (kualitas lebih tinggi sedikit)
  upload: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82
  }
};

export default {
  compressImage,
  compressFile,
  getBase64SizeInKB,
  DEFAULT_OPTIONS,
  COMPRESS_PRESETS
};
