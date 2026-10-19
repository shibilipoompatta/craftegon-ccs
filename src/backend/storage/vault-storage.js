/**
 * CraftEgon CCS - Private Vault Storage Manager
 * Isolates uploaded files in quarantine and clean storage vaults with zero public HTTP access.
 * Pure Node.js built-ins.
 */

const fs = require('node:fs');
const path = require('node:path');

class VaultStorage {
  constructor(options = {}) {
    this.isInMemory = options.isInMemory || false;
    this.memoryFiles = new Map(); // storagePath -> Buffer
    this.baseDir = options.baseDir || path.resolve(__dirname, '../../../.vault');

    if (!this.isInMemory) {
      this._ensureDirectories();
    }
  }

  _ensureDirectories() {
    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    } catch (e) {
      // Fallback to in-memory if directory creation fails in restricted environments
      this.isInMemory = true;
    }
  }

  _resolveDiskPath(storagePath) {
    // Prevent directory traversal
    const safePath = path.normalize(storagePath).replace(/^(\.\.[\/\\])+/, '');
    return path.join(this.baseDir, safePath);
  }

  async saveQuarantine(storagePath, buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('INVALID_PAYLOAD: Storage payload must be a Buffer');
    }

    if (this.isInMemory) {
      this.memoryFiles.set(storagePath, Buffer.from(buffer));
      return { storagePath, bytesWritten: buffer.length };
    }

    const diskPath = this._resolveDiskPath(storagePath);
    const parentDir = path.dirname(diskPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    await fs.promises.writeFile(diskPath, buffer);
    return { storagePath, bytesWritten: buffer.length };
  }

  async promoteToClean(quarantinePath, cleanPath) {
    if (this.isInMemory) {
      const buf = this.memoryFiles.get(quarantinePath);
      if (!buf) {
        throw new Error(`VAULT_ERROR: Quarantined file not found: ${quarantinePath}`);
      }
      this.memoryFiles.set(cleanPath, buf);
      this.memoryFiles.delete(quarantinePath);
      return { cleanPath };
    }

    const srcDisk = this._resolveDiskPath(quarantinePath);
    const destDisk = this._resolveDiskPath(cleanPath);

    if (!fs.existsSync(srcDisk)) {
      throw new Error(`VAULT_ERROR: Quarantined file not found on disk: ${srcDisk}`);
    }

    const destDir = path.dirname(destDisk);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Atomic move
    await fs.promises.rename(srcDisk, destDisk);
    return { cleanPath };
  }

  async readFile(storagePath) {
    if (this.isInMemory) {
      const buf = this.memoryFiles.get(storagePath);
      if (!buf) return null;
      return Buffer.from(buf);
    }

    const diskPath = this._resolveDiskPath(storagePath);
    if (!fs.existsSync(diskPath)) {
      return null;
    }

    return await fs.promises.readFile(diskPath);
  }

  async deleteFile(storagePath) {
    if (this.isInMemory) {
      const existed = this.memoryFiles.has(storagePath);
      this.memoryFiles.delete(storagePath);
      return existed;
    }

    const diskPath = this._resolveDiskPath(storagePath);
    if (fs.existsSync(diskPath)) {
      await fs.promises.unlink(diskPath);
      return true;
    }
    return false;
  }

  async purgeQuarantined(quarantinePath) {
    return await this.deleteFile(quarantinePath);
  }

  reset() {
    this.memoryFiles.clear();
  }
}

// Global default vault storage instance
const defaultVaultStorage = new VaultStorage({ isInMemory: true });

module.exports = {
  VaultStorage,
  defaultVaultStorage
};
