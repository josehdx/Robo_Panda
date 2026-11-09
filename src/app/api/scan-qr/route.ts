import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import jsQR from 'jsqr';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;

    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid form submission. Expected multipart/form-data.' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;

    // Validate file existence
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: "Validation failed: 'file' field is required." },
        { status: 400 }
      );
    }

    // Validate MIME type (basic safeguard against non-image uploads)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: `Validation failed: File type '${file.type}' is not a supported image.` },
        { status: 400 }
      );
    }

    // Convert Web File stream to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Normalize image to raw 4-channel RGBA pixels using Sharp
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Decode QR code from raw pixel matrix
    const pixelArray = new Uint8ClampedArray(data.buffer);
    const decodedResult = jsQR(pixelArray, info.width, info.height);

    if (!decodedResult) {
      return NextResponse.json(
        { error: 'No readable QR code found in the provided image.' },
        { status: 422 } // Unprocessable Entity: image valid, but QR absent
      );
    }

    return NextResponse.json(
      {
        success: true,
        text: decodedResult.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/scan-qr:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json(
      { error: `Failed to process image: ${message}` },
      { status: 500 }
    );
  }
}