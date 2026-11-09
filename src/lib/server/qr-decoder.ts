import 'server-only';
import jsQR from 'jsqr';
import sharp from 'sharp';

/**
 * Decodes a QR code from a raw image buffer (e.g., from a file upload).
 * 
 * @param imageBuffer The binary buffer of the uploaded image (JPEG, PNG, WebP, etc.)
 * @returns A promise resolving to the decoded string, or null if no QR code is found.
 */
export async function decodeQRCode(imageBuffer: Buffer): Promise<string | null> {
  try {
    // 1. Use Sharp to normalize the image and extract raw RGBA pixel data
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha() // Guarantees 4 channels (Red, Green, Blue, Alpha) per pixel
      .raw()         // Outputs uncompressed raw pixel data
      .toBuffer({ resolveWithObject: true });

    // 2. jsQR expects a Uint8ClampedArray, which we create from the Sharp buffer
    const pixelArray = new Uint8ClampedArray(data.buffer);

    // 3. Scan the image matrix for a QR code
    const decodedResult = jsQR(pixelArray, info.width, info.height);

    if (decodedResult) {
      return decodedResult.data;
    }

    // Return null if the image doesn't contain a readable QR code
    return null;
  } catch (error) {
    console.error('Failed to decode QR code:', error);
    throw new Error('Image processing failed. Ensure the file is a valid image.');
  }
}