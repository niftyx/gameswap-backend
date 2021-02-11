import { subgraphUtils } from "../utils/subgraph_utils";

export class SubGraphService {
  private readonly _httpUri: string;
  private readonly _wsUri: string;

  constructor(httpUri: string, wsUri: string) {
    this._httpUri = httpUri;
    this._wsUri = wsUri;
  }

  async getOwnerFromAssetContentId(contentId: string): Promise<string> {
    const query = `query GetBrowseAssets($skip: Int!, $first: Int!) {
        assets(where:{currentOwner_not:"0x0000000000000000000000000000000000000000"},first: $first, skip: $skip) {
        id
        assetId
        assetURL
        createTimeStamp
        updateTimeStamp
        currentOwner {
            address
        }
        token {
            address
        }
        }
    }
    `;
    const result = await subgraphUtils.fetchQuery(
      query,
      { contentId },
      this._httpUri
    );
    console.log(result, this._wsUri);
    return "";
  }
}
