## express-capture-route

Capture route definitions, and reconstruct the original route.

Wrap your `Router` and `express()` calls in `capture`, and it will
annotate the objects such that it can recover the original path,
through multiple layers of `router` and mounted sub-apps.

## Example

See also [examples/readme.ts](examples/readme.ts): `npm run example`

```typescript
import * as express from 'express';
import { capture, recoverFromHandler, recoverFromRequest } from 'express-capture-route';
const router = capture(express.Router());
router.get('/foo/:bar', foo);

const app = express();
app.use(someMiddleWare);
capture(app).use('/api', router);

recoverFromHandler(foo).path === ['/api', '/foo/:bar'];

// or, with some `onFinished` middleware
app.use((req, res, next) => {
  next();
  recoverFromRequest(req).path;
});
```
