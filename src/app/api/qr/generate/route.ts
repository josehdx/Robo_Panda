import { NextRequest, NextResponse } from 'next/server';
import { generateQRDataURL } from '@/lib/server/qr-encoder';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, options } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text payload is required' },
        { status: 400 }
      );
    }

    // Use the updated function name here
    const qrDataUrl = await generateQRDataURL(text, options);
    
    return NextResponse.json({ dataUrl: qrDataUrl });
  } catch (error) {
    console.error('QR Generation API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}