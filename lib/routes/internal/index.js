import { Router } from 'express';
import metalogger from 'metalogger';
import S3         from '../../modules/s3/index.js';

const router = Router({ mergeParams: true });
const log    = metalogger();
const s3     = new S3();

router.put('/upload', async (req, res) => {
  log.info('create s3 pre-signed post');
  res.json(await s3.upload({ user_id: req.body.user_id }));
});

router.get('/:key', async (req, res) => {
  log.info('url for', req.params.key);
  res.send(await s3.get(req.params.key));
});

export default router;
