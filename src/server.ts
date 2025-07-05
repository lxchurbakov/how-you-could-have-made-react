import express from 'express';

import { route, catchErrors } from 'lib/express-utils';

const router = express.Router();

router.get('/api/v1/ping', route(async (req) => {
    return 'pong';
}));

router.use(catchErrors);

export default router;
