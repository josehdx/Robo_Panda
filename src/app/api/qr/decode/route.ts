import { NextRequest, NextResponse } from 'next/server';
import { decodeQRCode } from '@/lib/server/qr-decoder';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert the web File object into a Node.js Buffer for Sharp
    const buffer = Buffer.from(await file.arrayBuffer());
    const decodedText = await decodeQRCode(buffer);

    if (!decodedText) {
      return NextResponse.json(
        { error: 'No QR code found in the image' },
        { status: 404 }
      );
    }

    return NextResponse.json({ text: decodedText });
  } catch (error) {
    console.error('QR Decode API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}