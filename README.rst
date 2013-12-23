mpv.io
======

This repository is used to generate our static website that is then deployed
to the ``gh-pages`` branch and serveddirectly by GitHub.

Setup a development environment
-------------------------------

- Optional: have ``rbenv`` or ``rvm`` installed. These tools will automatically
  select the correct version of ruby based on the ``.ruby-version`` file in
  our project root. Alternatively you can use any system Ruby that is > 1.9.
- ``pip install docutils`` needed to render the guides in reStructured Text
- ``gem install bundler``
- ``bundle install``
- ``rbenv rehash`` only if using ``rbenv``
- ``[bundle exec] middleman server``
- See the website running at: http://localhost:4567/
