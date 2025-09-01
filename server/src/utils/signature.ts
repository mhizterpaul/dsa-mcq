import crypto from 'crypto';

const clientSecret = process.env.CLIENT_SECRET || 'default-secret';

export function generateSignature(body: any): string {
    const hmac = crypto.createHmac('sha256', clientSecret);
    hmac.update(JSON.stringify(body));
    return hmac.digest('hex');
}

export function verifySignature(req: import('next').NextApiRequest): boolean {
    const signature = req.headers['x-client-signature'] as string;
    if (!signature) {
        return false;
    }

    const expectedSignature = generateSignature(req.body);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
