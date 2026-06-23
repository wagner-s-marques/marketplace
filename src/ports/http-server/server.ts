import express, { type Express, type Router } from "express";

export class Server {
  readonly app: Express;

  constructor(routers: Router[]) {
    this.app = express();

    this.app.get("/status", (_req, res) => {
      res.status(204).end();
    });

    for (const router of routers) {
      this.app.use(router);
    }
  }

  listen(port: number, cb: () => void): void {
    this.app.listen(port, cb);
  }
}
