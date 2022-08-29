import { Router } from 'express';
import metalogger from 'metalogger';
import S3         from '../../modules/s3/index.js';

const router = Router({ mergeParams: true });

const log = metalogger();
const s3  = new S3();

router.put('/create', async (req, res) => {
  log.info('create s3 pre-signed post');
  try {
    res.json(await s3.upload({ user_id: req.body.user_id }));
  } catch (e) {
    res.sendStatus(409);
  }
});

export default router;
