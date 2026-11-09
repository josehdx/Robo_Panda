import { NextRequest, NextResponse } from 'next/server';
import { generateQRDataURL, QROptions } from '@/lib/server/qr-encoder';

interface ConvertRequestBody {
  text?: string;
  options?: QROptions;
}

export async function POST(req: NextRequest) {
  try {
    let body: ConvertRequestBody;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    const { text, options } = body;

    // Validate text input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json(
        { error: "Validation failed: 'text' field is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // Call server-side QR generator
    const dataUrl = await generateQRDataURL(text, options);

    return NextResponse.json(
      {
        success: true,
        dataUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/convert:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json(
      { error: `Failed to generate QR code: ${message}` },
      { status: 500 }
    );
  }
}