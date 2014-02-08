require 'capistrano/ext/multistage'

set :application,    "mpv.io"
set :ssh_options,    :forward_agent => true
set :use_sudo,       false
set :keep_releases,  3

set :copy_local_tar, ENV['tar'] || 'tar'
set :scm,            :none
set :repository,     './build'
set :deploy_via,     :copy
