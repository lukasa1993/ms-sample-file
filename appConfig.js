import healthcheck from 'maikai';
import metalogger  from 'metalogger';
import morgan      from 'morgan';

import external from './lib/routes/external/index.js';
import internal from './lib/routes/internal/index.js';

const log = metalogger();

function serviceRoutes(app) {
  app.use(healthcheck().express());
  app.use('/internal', internal);
  app.use('/external', external);
}

function setupErrorHandling(app) {
  // Custom formatting for error responses.
  app.use((err, req, res, next) => {
    if (err) {
      const out = {};
      if (err.isJoi || err.type === 'validation') { //validation error. No need to log these
        out.errors = err.details;
        res.status(400).json(out);
        return;
      } else {
        log.error(err);
        if (process.env.NODE_ENV === 'production') {
          out.errors = ['Internal server error'];
        } else {
          out.errors = [err.toString()];
        }
        res.status(500).json(out);
        return;
      }
    }
    return next();
  });
}

export default async function (app, callback) {
  morgan.token('clientaddr', req => req.headers['x-forwarded-for'] || req.connection.remoteAddress);
  app.use(morgan(':clientaddr :method :url :status :response-time ms - :res[content-length]', { skip: req => req.originalUrl === '/health' }));
  serviceRoutes(app);
  setupErrorHandling(app);

  if (typeof callback === 'function') {
    callback(app);
  }
};
