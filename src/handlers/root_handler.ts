import * as express from "express";

export const rootHandler = (_req: express.Request, res: express.Response) => {
  res.send({
    message: "This is the root of the Gameswap backend",
  });
};
