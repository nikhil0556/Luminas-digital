import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SecureVaultItem {
  fileId: string;
  creatorId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  format: string;
  storageKey: string;
  checksum: string;
  uploadedAt: string;
}

export class SecureFileVault {
  private static instance: SecureFileVault;
  private vaultDir: string;
  private metaFilePath: string;
  private index: Map<string, SecureVaultItem> = new Map();

  private constructor() {
    this.vaultDir = path.join(process.cwd(), 'server', 'data', 'vault');
    this.metaFilePath = path.join(this.vaultDir, '_vault_metadata.json');

    if (!fs.existsSync(this.vaultDir)) {
      fs.mkdirSync(this.vaultDir, { recursive: true });
    }

    this.loadIndex();
  }

  public static getInstance(): SecureFileVault {
    if (!SecureFileVault.instance) {
      SecureFileVault.instance = new SecureFileVault();
    }
    return SecureFileVault.instance;
  }

  private loadIndex() {
    try {
      if (fs.existsSync(this.metaFilePath)) {
        const raw = fs.readFileSync(this.metaFilePath, 'utf-8');
        const list: SecureVaultItem[] = JSON.parse(raw);
        for (const item of list) {
          this.index.set(item.fileId, item);
        }
      }
    } catch (err) {
      console.warn('[SecureVault] Error reading vault index:', err);
    }
  }

  private saveIndex() {
    try {
      const list = Array.from(this.index.values());
      fs.writeFileSync(this.metaFilePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('[SecureVault] Error saving vault index:', err);
    }
  }

  /**
   * Stores an uploaded digital file into the encrypted/protected vault.
   * Internal filename uses an unguessable crypto random UUID.
   */
  public storeFile(params: {
    creatorId: string;
    originalFileName: string;
    buffer: Buffer;
    fileType?: string;
    format?: string;
  }): SecureVaultItem {
    const fileId = `file_${crypto.randomUUID()}`;
    const storageKey = `vault_${crypto.randomBytes(24).toString('hex')}`;
    const filePath = path.join(this.vaultDir, storageKey);

    fs.writeFileSync(filePath, params.buffer);

    const checksum = crypto.createHash('sha256').update(params.buffer).digest('hex');
    const bytes = params.buffer.length;
    const formattedSize =
      bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

    const item: SecureVaultItem = {
      fileId,
      creatorId: params.creatorId,
      fileName: params.originalFileName,
      fileSize: formattedSize,
      fileType: params.fileType || 'application/octet-stream',
      format: params.format || 'PDF',
      storageKey,
      checksum,
      uploadedAt: new Date().toISOString()
    };

    this.index.set(fileId, item);
    this.saveIndex();

    return item;
  }

  public getFileMetadata(fileId: string): SecureVaultItem | null {
    return this.index.get(fileId) || null;
  }

  /**
   * Retrieves the raw file buffer from the vault.
   * Must ONLY be called after verifying customer purchase or creator ownership.
   */
  public getFileContent(fileId: string): { buffer: Buffer; meta: SecureVaultItem } | null {
    const meta = this.index.get(fileId);
    if (!meta) return null;

    const filePath = path.join(this.vaultDir, meta.storageKey);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    return { buffer, meta };
  }
}
