activate :automatic_image_sizes
activate :directory_indexes
activate :livereload

config[:sass_assets_paths] << Bootstrap.stylesheets_path

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
    "/bug-reports"
  end

  def community_path
    "/community"
  end

  def manual_path
    "/manual"
  end

  def manual_master_path
    "/manual/master"
  end

  def manual_stable_path
    "/manual/stable"
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

  def nav_class(path)
    if /^#{path}/ =~ current_page.url
      {:class => 'selected'}
    else
      {}
    end
  end

  def homepage?
    current_page.url == "/"
  end

  def package_row(title, url, icon=:globe)
    partial("package-row", locals: { title: title, url: url, icon: icon })
  end

  def fetch_pages(doctype=nil)
    query = sitemap
    query = query.where(:doctype.equal => doctype) if doctype.present?
    query.order_by(:order).all
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
