import crypto from 'crypto';

export function generateSignature(body: any, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    // Optimization: avoid stringify if already string
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    hmac.update(data);
    return hmac.digest('hex');
}

export function verifySignature(req: import('next').NextApiRequest, secret: string): boolean {
    const signature = req.headers['x-client-signature'] as string;
    if (!signature) {
        return false;
    }

    const expectedSignature = generateSignature(req.body, secret);

    // Safety check for timingSafeEqual: buffers must have same length
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedSignatureBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
}
