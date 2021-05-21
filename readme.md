# Description

Gameswap-backend

- scans the events on Avalanche Network, get collections/assets/exchange information and write on database. (similar to thegraph)
- store accounts/games

It provides APIS for:

- Create/Read/Update games
- Create/Read/Update accounts
- Get collections
- Get assets

# Configuration

- Go to "src/custom/contract-addresses/src/addresses.json" and add the latest niftyx-protocol addresses
- ENV
  1. CHAIN_ID: 43113 for Avalanche Fuji Testnet
  2. ETHEREUM_RPC_URL: https://api.avax-test.network/ext/bc/C/rpc (for testnet)
  3. FEE_RECIPIENT_ADDRESS:
  4. POSTGRES_URI: Posgres Connection url (e.g: postgresql://test@localhost:5432/test)
  5. CONTENT_SECRET_KEY: used to encrypt content data
  6. ERC721FACTORY_CONTRACT: contract address of gameswap nft factory contract
  7. ERC721FACTORY_CONTRACT_BLOCK
  8. EXCHANGE_CONTRACT_BLOCK: start block of niftyx-protocol exchange contract
  9. HTTP_PORT

# How to run

1. git clone ...
2. add .env
3. yarn build
4. yarn db:migrate
5. yarn start:assetsSync (sync all data from avalanche blocks)
6. yarn start (start service)

# other

- Collection url data format

  1. imageUrl
  2. description
  3. gameIds

- Asset url data format (to support opensea)
  1. description
  2. name
  3. image
  4. attributes
  5. others ...

# Runners

1. http_service_runner: handle http services
2. sync_assets_runner: scan events on Avalanche blocks and write assets/collections/exchange information to db

# Services

1. account_service: Handle database services related to accounts
2. asset_history_service: Handle database services related to asset history
3. asset_service: Handle database services related to assets
4. collection_history_service: Handle database services related to collection history
5. collection_service: Handle database services related to collections
6. common_service: Handle content encryption/decryption
7. erc721_service: Sync all assets of a certain ERC721 contract
8. exchange_service: Sync all 0x exchange events on Avalanche Block and write data
9. factory_service: Sync all collections on Avalanche
10. game_service: Handle database services related to games
11. healthcheck_service: To check if backend is healthy (not important here)
