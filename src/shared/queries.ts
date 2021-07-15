import gql from "graphql-tag";

/**
 * fragment with all fields of user
 */
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

/**
 * fragment with all fields of collection
 */
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
    game_id
    description
    create_time_stamp
    update_time_stamp
  }
`;

/**
 * fragment with all fields of assetHistory
 */
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

/**
 * fragment with all fields of collectionHistory
 */
const collectionHistoryFragment = gql`
  fragment collectionHistoryFragment on collection_histories {
    id
    tx_hash
    collection_id
    owner_id
    timestamp
  }
`;

/**
 * fragment with all fields of asset
 */
const assetFragment = gql`
  fragment assetFragment on assets {
    id
    asset_id
    asset_url
    collection_id
    content_id
    creator_id
    create_time_stamp
    update_time_stamp
    owner_id
  }
`;

/**
 * fragment with all fields of game
 */
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

/**
 * mutation to insert one user
 * @param user {user_insert_input}
 *
 */
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

/**
 * mutation to create or update user
 * @param user {user_insert_input}
 *
 */
export const upsertAccount = gql`
  mutation ($user: users_insert_input!) {
    insert_users(objects: [$user], on_conflict: { constraint: users_pkey }) {
      affected_rows
      returning {
        ...userFragment
      }
    }
  }
  ${userFragment}
`;

/**
 * mutation to update user
 * @param user {user_insert_input}
 *
 */
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

/**
 * query to get user with id
 * @param id {String}   UserId
 */
export const selectAccountByUserId = gql`
  query ($id: String!) {
    users(where: { id: { _eq: $id } }) {
      ...userFragment
    }
  }
  ${userFragment}
`;

/**
 * query to get asset history with txHash
 * @param tx_hash {String}   Transaction Hash
 *
 */
export const queryAssetHistoryByHash = gql`
  query ($tx_hash: String!) {
    asset_histories(where: { tx_hash: { _eq: $tx_hash } }) {
      ...assetHistoryFragment
    }
  }
  ${assetHistoryFragment}
`;

/**
 * mutation to update asset history with id
 * @param id {String}   asset history id
 * @param changes {asset_histories_set_input} fields to change
 */
export const updateAssetHistoryById = gql`
  mutation ($changes: asset_histories_set_input!, $id: String!) {
    update_asset_histories(where: { id: { _eq: $id } }, _set: $changes) {
      returning {
        ...assetHistoryFragment
      }
      affected_rows
    }
  }
  ${assetHistoryFragment}
`;

/**
 * mutation to delete all asset histories
 */
export const deleteAllAssetHistory = gql`
  mutation {
    delete_asset_histories(where: {}) {
      affected_rows
    }
  }
`;

/**
 * mutation to insert asset histories
 * @param asset_histories_data {asset_histories_insert_input[]}
 */
export const insertAssetHistories = gql`
  mutation ($asset_histories_data: [asset_histories_insert_input!]!) {
    insert_asset_histories(objects: $asset_histories_data) {
      returning {
        ...assetHistoryFragment
      }
      affected_rows
    }
  }
  ${assetHistoryFragment}
`;

/**
 * mutation to delete all assets
 */
export const deleteAllAssets = gql`
  mutation {
    delete_assets(where: {}) {
      affected_rows
    }
  }
`;

/**
 * mutation to insert assets
 * @param assets_data {assets_insert_input[]}
 */
export const insertAssets = gql`
  mutation ($assets_data: [assets_insert_input!]!) {
    insert_assets(objects: $assets_data) {
      returning {
        ...assetFragment
      }
      affected_rows
    }
  }
  ${assetFragment}
`;

/**
 * mutation to update asset by id
 * @param id {string} id of an asset item
 * @param changes {assets_set_input}
 */
export const updateAssetByAssetId = gql`
  mutation ($changes: assets_set_input!, $id: String!) {
    update_assets(where: { id: { _eq: $id } }, _set: $changes) {
      returning {
        ...assetFragment
      }
      affected_rows
    }
  }
  ${assetFragment}
`;

/**
 * query to list assets by assetId and collectionId
 * @param asset_id {string} assetId
 * @param collection_id {string} collectionId
 */
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

/**
 * query to list assets by contentId and ownerId
 * @param content_id {string} assetId
 * @param owner_id {string} owner id (id of a user)
 */
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

/**
 * mutation to remove all collection history
 */
export const deleteAllCollectionHistory = gql`
  mutation {
    delete_collection_histories(where: {}) {
      affected_rows
    }
  }
`;

/**
 * mutation to insert collection histories
 * @param collection_histories_data {collection_histories_insert_input[]} array of collection history data
 */
export const insertCollectionHistories = gql`
  mutation ($collection_histories_data: [collection_histories_insert_input!]!) {
    insert_collection_histories(objects: $collection_histories_data) {
      returning {
        ...collectionHistoryFragment
      }
      affected_rows
    }
  }
  ${collectionHistoryFragment}
`;

/**
 * query to list collections by pagination
 * @param limit {Int}
 * @param offset {Int}
 */
export const selectCollectionsForSync = gql`
  query ($limit: Int!, $offset: Int!) {
    collections(offset: $offset, limit: $limit) {
      address
      block
    }
  }
`;

/**
 * mutation to delete all collections
 */
export const deleteAllCollections = gql`
  mutation {
    delete_collections(where: {}) {
      affected_rows
    }
  }
`;

/**
 * mutation to insert collections
 * @param collections_data {collections_insert_input[]}   collections array
 */
export const insertCollections = gql`
  mutation ($collections_data: [collections_insert_input!]!) {
    insert_collections(objects: $collections_data) {
      affected_rows
      returning {
        ...collectionFragment
      }
    }
  }
  ${collectionFragment}
`;

/**
 * query to selection collection by id
 * @param id {String}   collection id
 */
export const selectCollectionByCollectionId = gql`
  query ($id: String!) {
    collections(where: { id: { _eq: $id } }) {
      ...collectionFragment
    }
  }
  ${collectionFragment}
`;

/**
 * mutation to update collection by id
 * @param id {String}   collection id
 * @param changes {collections_set_input} collection fields to update
 */
export const updateCollectionByCollectionId = gql`
  mutation ($changes: collections_set_input!, $id: String!) {
    update_collections(where: { id: { _eq: $id } }, _set: $changes) {
      affected_rows
      returning {
        ...collectionFragment
      }
    }
  }
  ${collectionFragment}
`;

/**
 * mutation to delete all games
 */
export const deleteAllGames = gql`
  mutation {
    delete_games(where: {}) {
      affected_rows
    }
  }
`;

/**
 * mutation to insert games
 * @param games_data {games_insert_input[]}   games array
 */
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

/**
 * query to select game by Id
 * @param id {String}   gameId
 */
export const selectGamesById = gql`
  query ($id: String!) {
    games(where: { id: { _eq: $id } }) {
      ...gameFragment
    }
  }
  ${gameFragment}
`;

/**
 * mutation to update game by Id
 * @param id {String}   gameId
 * @param changes {games_set_input} game fields
 */
export const updateGameById = gql`
  mutation ($changes: games_set_input!, $id: String!) {
    update_games(where: { id: { _eq: $id } }, _set: $changes) {
      returning {
        ...gameFragment
      }
      affected_rows
    }
  }
  ${gameFragment}
`;

/**
 * query to list users and games with custom-url
 * @param url {String}   customUrl
 */
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

/**
 * mutation to delete all relations between games and collections
 */
export const deleteAllGamesCollectionsRelations = gql`
  mutation {
    delete_games_collections_relations(where: {}) {
      affected_rows
    }
  }
`;
