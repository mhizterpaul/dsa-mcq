import type { NextApiRequest, NextApiResponse } from 'next';
import { handleOAuthExchange } from '../../../../utils/oauth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return await handleOAuthExchange('x', req, res);
}
