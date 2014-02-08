activate :automatic_image_sizes
activate :directory_indexes
activate :livereload

helpers do
  def installation_path
    "/installation"
  end

  def guides_path
    "/guides"
  end

  def getting_started_path
    "/guides/getting-started"
  end

  def bug_reports_path
    "/guides/bug-reports"
  end

  def community_path
    "/community"
  end

  def github_path
    "https://github.com/mpv-player/mpv"
  end

  def twitter_path
    "https://twitter.com/mpv_player"
  end

  def issues_path
    "https://github.com/mpv-player/mpv/issues"
  end

  def package_row(title, url, icon=:globe)
    content_tag(:tr, class: 'package-row') do
      content_tag(:td, title) +
      content_tag(:td) do
        link_to url do
          content_tag(:i, "", class: "fa fa-#{icon}") +
          content_tag(:span, url)
        end
      end
    end
  end

  def fetch_guides(doctype=nil)
    query = sitemap
    query = query.where(:doctype.equal => doctype) if doctype.present?
    query.order_by(:order).all
  end

  def guide_path(guide, ext=".rst")
    File.join(guides_path, File.basename(guide.path, ext))
  end

  def render_rst(guide)
    # guide.render removes the middleman front matter and returns the actual
    # content since '.rst' is not a registered template engine within middleman
    GitHub::Markup.render(guide.path, guide.render)
  end
end

ready do
  fetch_guides.each do |guide|
    proxy guide_path(guide) + "/index.html", "guides/show.html", locals: {guide: guide}
  end
end

set :css_dir,    'stylesheets'
set :js_dir,     'javascripts'
set :fonts_dir,  "fonts"
set :images_dir, 'images'

configure :build do
  activate :minify_css
  activate :minify_javascript
  activate :asset_hash
end
