import QRCode from 'qrcode';

/** Transparent PNG QR (no background) for a student profile URL. */
export async function generateTransparentQrDataUrl(
  profileUrl: string,
  size = 512,
): Promise<string> {
  return QRCode.toDataURL(profileUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: size,
    color: {
      dark: '#000000ff',
      light: '#00000000', // fully transparent background
    },
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function qrFilename(name: string, rollNo: string): string {
  const safe = `${name}-${rollNo}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `qr-${safe || 'student'}.png`;
}
