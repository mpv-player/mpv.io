mpv.io
======

Overview
--------

This repository is the source code to our website running at http://mpv.io.
The website is hosted with GitHub Pages, and the compiled version is available
on [this repository](https://github.com/mpv-player/mpv-player.github.io).

The compiled version is automatically created and committed by Github Actions when
changes are pushed to the master of this repository.

Contributing
------------

To contribute you have these possibilities
- Fork this website, make your changes and send pull requests.
  - If you find errors but are unable to contribute then please [open a issue](https://github.com/mpv-player/mpv.io/issues/new).
- Note: Changes to https://mpv.io/manual/master/ can be contributed in the mpv repo under this folder: https://github.com/mpv-player/mpv/tree/master/DOCS/man

Setup a local development environment
-------------------------------------

The website is created using a static website generator called
[Middleman](http://middlemanapp.com/). Here's what you need to do to get a
copy of the website running on your local machine.

- Optional: have ``rbenv`` or ``rvm`` installed. These tools will automatically
  select the correct version of ruby based on the ``.ruby-version`` file in
  our project root. Alternatively you can use any system Ruby that is > 2.3.
- ``gem install bundler -v 1.17.3``
- ``bundle _1.17.3_ install``
- ``rbenv rehash`` only if using ``rbenv``
- ``[bundle exec] middleman server``
- See the website running at: http://localhost:4567/
