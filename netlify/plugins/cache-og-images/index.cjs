const GENERATED_IMAGES = "assets/og/posts";

module.exports = {
  onPreBuild: async ({ utils }) => {
    await utils.cache.restore(GENERATED_IMAGES);
  },
  onPostBuild: async ({ utils }) => {
    await utils.cache.save(GENERATED_IMAGES);
  },
};
