def rst2html
  xs = %w(rst2html rst2html.py)
  xs = xs.map {|x| `which #{x}`.chomp}.delete_if {|x| x == ""}
  r  = xs[0]
  r || (raise "rst2html not found")
end

desc "Builds mpv's manual"
task :build_mpv_manual do
  if File.exists?('mpv')
    system "cd mpv && git pull origin master"
  else
    system "git clone https://github.com/mpv-player/mpv.git mpv"
  end
  [
    rst2html,
    '--template=rst2html_template',
    'mpv/DOCS/man/mpv.rst',
    'source/manual/_mpv.html.erb'
  ].join(' ')
end

desc 'Generate site from Travis CI and publish site to GitHub Pages'
task :travis => :build_mpv_manual do
  # use public URL for clone
  system "git clone https://github.com/mpv-player/mpv-player.git build"
  system "bundle exec middleman build"
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
