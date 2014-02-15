desc 'Generate site from Travis CI and publish site to GitHub Pages'
task :travis do
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
