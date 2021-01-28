import { WSClient, WSOpts } from "@0x/mesh-rpc-client";

export class MeshClient extends WSClient {
  constructor(
    public readonly websocketURI: string,
    public readonly httpURI?: string,
    websocketOpts?: WSOpts
  ) {
    super(websocketURI, websocketOpts);
  }
}
