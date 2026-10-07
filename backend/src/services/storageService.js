const path = require('path');
const fs = require('fs');

/**
 * Storage Service Interface
 * Modular architecture enabling easy switch between Local Disk Storage
 * and AWS S3 / Cloud Object Storage without changing application controllers.
 */
class LocalStorageProvider {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file) {
    // Return relative URL that Express static route serves
    const fileUrl = `/uploads/${file.filename}`;
    return {
      url: fileUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  async deleteFile(fileUrl) {
    try {
      if (!fileUrl) return;
      const filename = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (err) {
      console.error(`[StorageService] Error deleting file ${fileUrl}:`, err.message);
    }
  }
}

/**
 * S3 Storage Provider stub ready for production plug-in
 */
class S3StorageProvider {
  constructor() {
    // S3 client initialization would happen here when AWS credentials exist
  }

  async saveFile(file) {
    // e.g. Upload buffer / stream to S3 bucket
    throw new Error('S3 storage provider not configured. Use local storage for development.');
  }

  async deleteFile(fileUrl) {
    // e.g. Delete object from S3
  }
}

const getStorageProvider = () => {
  const providerType = process.env.UPLOAD_STORAGE_TYPE || 'local';
  if (providerType === 's3') {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
};

const storageProvider = getStorageProvider();

module.exports = {
  saveFile: (file) => storageProvider.saveFile(file),
  deleteFile: (fileUrl) => storageProvider.deleteFile(fileUrl)
};
