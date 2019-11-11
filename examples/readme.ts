import * as express from 'express';
import { capture, recoverFromRequest } from '..';

const router = capture(express.Router());
router.get('/foo/:bar', (req, res) => res.status(200).json({ status: 'ok' }));

const app = express();

app.use((req, res, next) => {
  next();
  console.log(recoverFromRequest(req).path);
});

capture(app).use('/api', router);

app.listen(8080, () => console.log('http://localhost:8080/api/foo/tato'));
