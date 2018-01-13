def rst2html
  xs = %w(rst2html rst2html.py)
  xs = xs.map {|x| `which #{x}`.chomp}.delete_if {|x| x == ""}
  r  = xs[0]
  r || (raise "rst2html not found")
end

desc "Builds mpv's manual"
task :build_mpv_manual do
  unless File.exists?('mpv')
    system "git clone https://github.com/mpv-player/mpv.git mpv"
  end
  system("cd mpv && git checkout master && git pull origin master")
  system([
    rst2html,
    '--template=rst2html_template',
    '--strip-elements-with-class=contents',
    '--no-toc-backlinks',
    'mpv/DOCS/man/mpv.rst',
    'source/manual/_master.html.erb'
  ].join(' '))

  system("echo $(cd mpv && git tag -l --contains $(git tag -l --contains $(git rev-list --tags --max-count=1 | head -c16) | tail -1 | head -c16)) > source/manual/_stable_version.html.erb")
  system("cd mpv && git checkout $(git tag -l --contains $(git tag -l --contains $(git rev-list --tags --max-count=1 | head -c16) | tail -1 | head -c16))")
  system([
    rst2html,
    '--template=rst2html_template',
    '--strip-elements-with-class=contents',
    '--no-toc-backlinks',
    'mpv/DOCS/man/mpv.rst',
    'source/manual/_stable.html.erb'
  ].join(' '))
end

desc "Builds mpv's getting started guide"
task :build_mpv_getting_started do
  system([
     rst2html,
     '--template=rst2html_template',
     'source/guides/getting-started.rst',
     'source/guides/_getting-started.html.erb'
     ].join(' '))
end

desc 'Generate site from Travis CI and publish site to GitHub Pages'
task :travis => [:build_mpv_manual, :build_mpv_getting_started] do
  # use public URL for clone
  system "git clone https://github.com/mpv-player/mpv-player.git build"
  system "bundle exec middleman build --verbose"
  system "cd build && git config user.name 'nadeko'"
  system "cd build && git config user.email 'nadeko@travis'"
  system 'cd build && git config credential.helper "store --file=.git/credentials"'
  File.open('build/.git/credentials', 'w') do |f|
    f.write("https://#{ENV['GH_TOKEN']}:@github.com")
  end
  system [
    "cd build",
    "git add -A .",
    "git commit -m 'travis autodeploy #{ENV['TRAVIS_COMMIT_RANGE']}'",
    "git push origin master" ].join(" && ")
  File.delete 'build/.git/credentials'
end
