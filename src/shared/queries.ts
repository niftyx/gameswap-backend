import gql from "graphql-tag";

const userFragment = gql`
  fragment userFragment on users {
    id
    address
    name
    custom_url
    image_url
    header_image_url
    bio
    twitter_username
    twitter_verified
    twitch_username
    facebook_username
    youtube_username
    instagram_username
    tiktok_username
    personal_site
    create_time_stamp
    update_time_stamp
  }
`;

const collectionFragment = gql`
  fragment collectionFragment on collections {
    id
    address
    name
    symbol
    image_url
    total_supply
    total_minted
    total_burned
    block
    is_private
    is_verified
    is_premium
    is_featured
    owner_id
    description
    create_time_stamp
    update_time_stamp
  }
`;

const assetHistoryFragment = gql`
  fragment assetHistoryFragment on asset_histories {
    id
    tx_hash
    asset_id
    owner_id
    erc20
    erc20_amount
    timestamp
  }
`;

const collectionHistoryFragment = gql`
  fragment collectionHistoryFragment on collection_histories {
    id
    tx_hash
    collection_id
    owner_id
    timestamp
  }
`;

const assetFragment = gql`
  fragment assetFragment on assets {
    id
    name
    version
    image_url
    custom_url
    header_image_url
    category_id
    description
    platform
    is_verified
    is_premium
    is_featured
    create_time_stamp
    update_time_stamp
    owner_id
  }
`;

const gameFragment = gql`
  fragment gameFragment on games {
    id
    name
    version
    image_url
    custom_url
    header_image_url
    category_id
    description
    platform
    is_verified
    is_premium
    is_featured
    create_time_stamp
    update_time_stamp
    owner_id
  }
`;

export const insertAccount = gql`
  mutation ($user: users_insert_input!) {
    insert_users(objects: [$user]) {
      affected_rows
      returning {
        ...userFragment
      }
    }
  }
  ${userFragment}
`;

export const upsertAccount = gql`
  mutation ($user: users_insert_input!) {
    insert_users(objects: [$user], on_conflict: { constraint: id }) {
      affected_rows
      returning {
        ...userFragment
      }
    }
  }
  ${userFragment}
`;

export const updateAccount = gql`
  mutation ($id: String!, $changes: users_set_input!) {
    update_users(where: { id: { _eq: $id } }, _set: $changes) {
      affected_rows
      returning {
        ...userFragment
      }
    }
  }
  ${userFragment}
`;

export const selectAccountByUserId = gql`
  query ($id: String!) {
    users(where: { id: { _eq: $id } }) {
      ...userFragment
    }
  }
  ${userFragment}
`;

// asset_history

export const queryAssetHistoryByHash = gql`
  query ($tx_hash: String!) {
    asset_histories(where: { tx_hash: { _eq: $tx_hash } }) {
      ...assetHistoryFragment
    }
  }
  ${assetHistoryFragment}
`;

export const updateAssetHistoryById = gql`
  mutation ($changes: asset_histories_set_input!, $id: String!) {
    update_asset_histories(where: { id: { _eq: $id } }, _set: $changes) {
      ...assetHistoryFragment
      affected_rows
    }
  }
  ${assetHistoryFragment}
`;

export const deleteAllAssetHistory = gql`
  mutation {
    delete_asset_histories(where: {}) {
      affected_rows
    }
  }
`;

export const insertAssetHistories = gql`
  mutation ($asset_histories_data: [asset_histories_insert_input!]!) {
    insert_asset_histories(object: $asset_histories_data) {
      ...assetHistoryFragment
      affected_rows
    }
  }
  ${assetHistoryFragment}
`;

// asset
export const deleteAllAssets = gql`
  mutation {
    delete_assets(where: {}) {
      affected_rows
    }
  }
`;

export const insertAssets = gql`
  mutation ($assets_data: [assets_insert_input!]!) {
    insert_assets(object: $assets_data) {
      ...assetFragment
      affected_rows
    }
  }
  ${assetFragment}
`;

export const updateAssetByAssetId = gql`
  mutation ($changes: assets_set_input!, $id: String!) {
    update_assets(where: { id: { _eq: $id } }, _set: $changes) {
      ...assetFragment
      affected_rows
    }
  }
  ${assetFragment}
`;

export const queryAssetsByAssetIdAndCollectionId = gql`
  query ($asset_id: String!, $collection_id: String!) {
    assets(
      where: {
        _and: {
          asset_id: { _eq: $asset_id }
          collection_id: { _eq: $collection_id }
        }
      }
    ) {
      ...assetFragment
    }
  }
  ${assetFragment}
`;

export const queryAssetsByContentIdAndOwnerId = gql`
  query ($content_id: String!, $owner_id: String!) {
    assets(
      where: {
        _and: { content_id: { _eq: $content_id }, owner_id: { _eq: $owner_id } }
      }
    ) {
      ...assetFragment
    }
  }
  ${assetFragment}
`;

// collection_history
export const deleteAllCollectionHistory = gql`
  mutation {
    delete_collection_histories(where: {}) {
      affected_rows
    }
  }
`;

export const insertCollectionHistories = gql`
  mutation ($collection_histories_data: [collection_histories_insert_input!]!) {
    insert_collection_histories(object: $collection_histories_data) {
      ...collectionHistoryFragment
      affected_rows
    }
  }
  ${collectionHistoryFragment}
`;

// collection
export const selectCollectionsForSync = gql`
  query ($limit: Int!, $offset: Int!) {
    collections(offset: $offset, limit: $limit) {
      address
      block
    }
  }
`;

export const deleteAllCollections = gql`
  mutation {
    delete_collections(where: {}) {
      affected_rows
    }
  }
`;

export const insertCollections = gql`
  mutation ($collections_data: [collections_insert_input!]!) {
    insert_collections(object: $collections_data) {
      ...collectionFragment
      affected_rows
    }
  }
  ${collectionFragment}
`;

export const selectCollectionByCollectionId = gql`
  query ($id: String!) {
    collections(where: { id: { _eq: $id } }) {
      ...collectionFragment
    }
  }
  ${collectionFragment}
`;

export const updateCollectionByCollectionId = gql`
  mutation ($changes: collections_set_input!, $id: String!) {
    update_collections(where: { id: { _eq: $id } }, _set: $changes) {
      ...collectionFragment
      affected_rows
    }
  }
  ${collectionFragment}
`;

// games
export const deleteAllGames = gql`
  mutation {
    delete_games(where: {}) {
      affected_rows
    }
  }
`;

export const insertGames = gql`
  mutation ($games_data: [games_insert_input!]!) {
    insert_games(objects: $games_data) {
      affected_rows
      returning {
        ...gameFragment
      }
    }
  }
  ${gameFragment}
`;

export const selectGamesById = gql`
  query ($id: String!) {
    games(where: { id: { _eq: $id } }) {
      ...gameFragment
    }
  }
  ${gameFragment}
`;

export const updateGameById = gql`
  mutation ($changes: games_set_input!, $id: String!) {
    update_games(where: { id: { _eq: $id } }, _set: $changes) {
      ...gameFragment
      affected_rows
    }
  }
  ${gameFragment}
`;

// custom-url
export const queryUsersAndGamesByCustomUrl = gql`
  query ($url: String!) {
    users(where: { custom_url: { _eq: $url } }) {
      id
    }
    games(where: { custom_url: { _eq: $url } }) {
      id
    }
  }
`;
