import 'server-only';
import QRCode from 'qrcode';

export interface QROptions {
  /**
   * Error resistance level. Higher levels allow the QR to be readable even if partially covered/damaged,
   * but produce a denser code. 
   * L (7%), M (15%), Q (25%), H (30%)
   */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Size of the quiet zone around the QR code. Default is 4. */
  margin?: number;
  /** Output width in pixels. */
  width?: number;
  /** Colors for the QR code */
  color?: {
    /** Foreground color in hex/rgba (e.g., '#000000', '#000000ff') */
    dark?: string;
    /** Background color in hex/rgba (e.g., '#ffffff', '#00000000' for transparent) */
    light?: string;
  };
}

/**
 * Validates the input text before passing it to the encoder.
 */
function validateInput(text: string) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new Error('QR generation failed: Input text cannot be empty or invalid.');
  }
  
  // The maximum alphanumeric capacity of a Version 40 QR code with 'L' error correction is 4296 characters.
  if (text.length > 4000) {
    throw new Error('QR generation failed: Input text exceeds maximum length capacity.');
  }
}

/**
 * Helper to map custom QROptions to the library's expected configuration object.
 */
function buildConfig(options?: QROptions): QRCode.QRCodeToDataURLOptions {
  return {
    errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
    margin: options?.margin ?? 4,
    width: options?.width,
    color: options?.color,
  };
}

/**
 * Generates a base64 PNG Data URL for the provided text.
 * Ideal for passing directly to <img src="..." /> on the client.
 */
export async function generateQRDataURL(text: string, options?: QROptions): Promise<string> {
  validateInput(text);
  
  try {
    return await QRCode.toDataURL(text, buildConfig(options));
  } catch (error) {
    console.error('Failed to generate QR Data URL:', error);
    throw new Error('An internal error occurred while encoding the Data URL.');
  }
}

/**
 * Generates a raw SVG string for the provided text.
 * Ideal for vector rendering or high-quality print downloads.
 */
export async function generateQRSVG(text: string, options?: QROptions): Promise<string> {
  validateInput(text);
  
  try {
    return await QRCode.toString(text, { 
      ...buildConfig(options), 
      type: 'svg' 
    });
  } catch (error) {
    console.error('Failed to generate QR SVG:', error);
    throw new Error('An internal error occurred while encoding the SVG markup.');
  }
}