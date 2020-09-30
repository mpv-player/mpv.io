mpv.io
======

[![Build Status](https://travis-ci.org/mpv-player/mpv.io.png?branch=master)](https://travis-ci.org/mpv-player/mpv.io)

Overview About my website
--------

This repository is the source code to our website running at http://mpv.io.
The website is hosted with GitHub Pages, and the compiled version is available
on [this repository](https://github.com/mpv-player/mpv-player.github.io).

The compiled version is automatically created and committed by TravisCI when
changes are pushed to the master of this repository.

Contributing
------------

To contribute you can just fork this website, make your changes and send pull
requests. If you find errors but are unable to contribute
[open a issue](https://github.com/mpv-player/mpv.io/issues/new).

Setup a local development environment
-------------------------------------

The website is created using a static website generator called
[Middleman](http://middlemanapp.com/). Here's what you need to do to get a
copy of the website running on your local machine.

- Optional: have ``rbenv`` or ``rvm`` installed. These tools will automatically
  select the correct version of ruby based on the ``.ruby-version`` file in
  our project root. Alternatively you can use any system Ruby that is > 1.9.
- ``gem install bundler``
- ``bundle install``
- ``rbenv rehash`` only if using ``rbenv``
- ``[bundle exec] middleman server``
- See the website running at: http://localhost:4567/
