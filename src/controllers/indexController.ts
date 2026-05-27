import type { Request, Response } from 'express';

export class IndexController {
  public home(req: Request, res: Response) {
    res.send('Agora com uma organização de pastas profissional! 🚀');
  }
}

export default new IndexController();
