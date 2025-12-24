// functions/market/marketSchemas.js

// Market koleksiyonları (global ürün tanımları)
const MARKET_COLLECTIONS = {
  frame: "market_items_frames",
  svga: "market_items_svga",
};

// Kullanıcı inventory alt koleksiyonları
const INVENTORY_COLLECTIONS = {
  frame: "inventory_frames",
  svga: "inventory_svga",
};

// Kullanıcı profilinde aktif item alanları
const ACTIVE_FIELDS = {
  frame: "activeAvatarFrame",
  svga: "activeEnterEffect",
};

function assertValidItemType(itemType) {
  if (!MARKET_COLLECTIONS[itemType]) {
    const err = new Error("INVALID_ITEM_TYPE");
    err.code = "INVALID_ITEM_TYPE";
    throw err;
  }
}

module.exports = {
  MARKET_COLLECTIONS,
  INVENTORY_COLLECTIONS,
  ACTIVE_FIELDS,
  assertValidItemType,
};
