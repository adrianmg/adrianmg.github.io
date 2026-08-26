# frozen_string_literal: true

module GeneratedOgImage
  POST_WIDTH = 2400
  POST_HEIGHT = 1260

  def self.assign_post_image(post)
    return if post.data.key?("image")

    slug = post.basename_without_ext.sub(/\A\d{4}-\d{2}-\d{2}-/, "")
    post.data["image"] = {
      "path" => "/assets/og/posts/#{slug}.png",
      "width" => POST_WIDTH,
      "height" => POST_HEIGHT,
    }
  end
end

Jekyll::Hooks.register :posts, :pre_render do |post|
  GeneratedOgImage.assign_post_image(post)
end
