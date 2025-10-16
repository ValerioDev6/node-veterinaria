import { UploadedFile } from 'express-fileupload';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { envs } from '../../config/envs';
import { UuidAdapter } from '../../config/uui.adapter';
import { CustomError } from '../../shared/errors/custom-error';

// Definir __filename y __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class FileService {
  private checkFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  async uploadSingle(
    file: UploadedFile,
    folder = 'uploads',
    validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif'],
  ): Promise<{ fileName: string; fileUrl: string }> {
    try {
      // Verify file extension
      const fileExtension = file.mimetype.split('/').at(1) ?? '';
      if (!validExtensions.includes(fileExtension)) {
        throw CustomError.badRequest(`Invalid extension: ${fileExtension}`);
      }

      // Create destination directory if it doesn't exist
      const destination = join(__dirname, '../../../', folder);
      this.checkFolder(destination);

      // Generate unique filename
      const fileName = `${UuidAdapter.v4()}.${fileExtension}`;
      const filePath = join(destination, fileName);

      // Move file to destination
      await file.mv(filePath);

      // Generate file URL
      const fileUrl = `${envs.BASE_URL}/${folder}/${fileName}`;
      return { fileName, fileUrl };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw CustomError.internalServe('Error uploading file');
    }
  }

  // Helper method to extract filename from URL
  getFilePathFromUrl(fileUrl: string): string | null {
    try {
      // Extract the path after the BASE_URL
      const urlObj = new URL(fileUrl);
      // Get the pathname part of the URL
      return urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      return null;
    }
  }

  async deleteFileFromUrl(fileUrl: string): Promise<boolean> {
    try {
      const relativePath = this.getFilePathFromUrl(fileUrl);
      if (!relativePath) return false;

      const filePath = join(__dirname, '../../../', relativePath);
      console.log('Attempting to delete old image:', filePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Old image successfully deleted');
        return true;
      } else {
        console.log('Old image not found at path:', filePath);
        return false;
      }
    } catch (error) {
      console.error('Error deleting file from URL:', error);
      return false;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw CustomError.internalServe('Error deleting file');
    }
  }
}
