# frozen_string_literal: true

require "json"

module GeneratedOgImage
  POST_WIDTH = 2400
  POST_HEIGHT = 1260
  MANIFEST_PATH = File.expand_path("../assets/og/posts/.manifest.json", __dir__)

  def self.image_versions
    @image_versions ||= JSON.parse(File.read(MANIFEST_PATH)).fetch("images")
  end

  def self.assign_post_image(post)
    return if post.data.key?("image")

    slug = post.basename_without_ext.sub(/\A\d{4}-\d{2}-\d{2}-/, "")
    version = image_versions.fetch(slug)[0, 8]
    post.data["image"] = {
      "path" => "/assets/og/posts/#{slug}.png?v=#{version}",
      "width" => POST_WIDTH,
      "height" => POST_HEIGHT,
    }
  end
end

Jekyll::Hooks.register :posts, :pre_render do |post|
  GeneratedOgImage.assign_post_image(post)
end
