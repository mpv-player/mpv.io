---
title: Technical overview
doctype: devel-guide
icon: terminal
abstract: "This should be the starting place for people who want to
          contribute to mpv or just about anyone interested in mpv's
          internals and architecture."
order: 10
---

The following is a code map that should give you a general high level idea
of how the various parts of mpv collaborate for the playback of some media file.

``player/*.c:``
~~~~~~~~~~~~~~~

Essentially makes up the player applications, including the main() function
and the playback loop. Generally, it accesses all other subsystems, initializes
them, and pushes data between them during playback.

The structure is as follows (as of commit ``e13c05366557cb``):

- ``main()``:

  - basic initializations (e.g. ``init_libav()`` and more)
  - pre-parse command line (verbosity level, config file locations)
  - load config files: ``parse_cfgfiles()``
  - parse command line, add files from the command line to playlist:
    ``m_config_parse_mp_command_line()``
  - check help options, etc. possibly exit: ``handle_help_options()``
  - call ``play_files()`` function that works down the playlist:

    - run idle loop (``idle_loop()``), until there are files in the
      playlist or an exit command was given (slave mode only)
    - actually load and play a file in ``play_current_file()``:

      - run all the dozens of functions to load the file and
        initialize playback
      - run a small loop that does normal playback, until the file is
        done or a slave command terminates playback
        (on each iteration, ``run_playloop()`` is called, which is rather
        big and complicated - it decodes some audio and video on
        each frame, waits for input, etc.)
      - uninitialize playback

    - determine next entry on the playlist to play
    - loop, or exit if no next file or quit is requested
      (see ``enum stop_play_reason``)

  - call ``exit_player_with_rc()``

Things worth saying about the playback core:

- the currently played tracks are in sh_video and sh_audio
- the timeline stuff is used only with MKV ordered chapters (and some other
  minor features: cue, edl)
- most state is in MPContext (mp_core.h), which is not available to the
  subsystems
- the other subsystems rarely call back into the frontend, and the frontend
  polls them instead (probably a good thing)

I like to call the ``player/*.c`` files the "frontend".

``talloc.h & talloc.c:``
~~~~~~~~~~~~~~~~~~~~~~~~

Hierarchical memory manager copied from Samba. It's like a ``malloc()`` with
more features. Most importantly, each talloc allocation can have a parent,
and if the parent is free'd, all children will be free'd as well. The
parent is an arbitrary talloc allocation. It's either set by the allocation
call by passing a talloc parent, usually as first argument to the allocation
function. It can also be set or reset later by other calls (at least
``talloc_steal()``). A talloc allocation that is used as parent is often called
a "talloc context".

Lots of code still uses ``malloc()`` proper, and you should be careful what
type of allocation you're dealing with when returning or free'ing an
allocation. (Needless to say, ``talloc_free()`` and ``free()`` are completely
different things.)

The copy in mpv has been modified to abort on OOM conditions. An
allocation call will never return NULL.

One very useful feature of talloc is fast tracking of memory leaks. ("Fast"
as in it doesn't require valgrind.) You can enable it by passing the option
``--leak-report`` as first parameter, or better, setting the
``MPV_LEAK_REPORT`` environment variable to "1".

This will list all unfree'd allocations on exit.

Documentation for talloc can be found `here
<http://git.samba.org/?p=samba.git;a=blob;f=lib/talloc/talloc.h;hb=HEAD>`_.

.. note::
  Unlike tcmalloc, jemalloc, etc., talloc() is not actually a malloc
  replacement. It works on top of system malloc and provides additional
  features that are supposed to make memory management easier.

.. warning::
  Actually, we're not using talloc anymore. talloc in mpv has been
  replaced by a custom re-implementation (TA in ta/). It provides
  some talloc emulation (just the parts needed by mpv). We will get
  rid of the talloc emulation later and use TA natively.
  (See ta/README for details.)

``player/command.c:``
~~~~~~~~~~~~~~~~~~~~~

This contains the implementation for slave commands and properties.
Properties are essentially dynamic variables changed by certain commands.
This is basically responsible for all user commands, like initiating
seeking, switching tracks, etc. It calls into other ``player/*.c`` files,
where most of the work is done, but also calls other parts of mpv.

``player/core.h:``
~~~~~~~~~~~~~~~~~~

Data structures and function prototypes for most of ``player/*.c``. They are
usually not accessed by other parts of mpv for the sake of modularization.

.. note::
  There are lots of global variables floating around everywhere
  else. This is an ongoing transition, and eventually there should be no
  global variables anymore.

``options/options.h, options/options.c:``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``options.h`` contains the global option ``struct MPOpts``. The option
declarations (option names, types, and ``MPOpts`` offsets for the option parser)
are in ``options.c``. Most default values for options and ``MPOpts`` are in
``mp_default_opts`` at the end of ``options.c``.

``MPOpts`` is unfortunately quite monolithic, and virtually accessed by
everything. But some components (like video outputs and video filters) have
their own sub-option tables separate from ``MPOpts``.

The actual option parser is spread over ``m_option.c``, ``m_config.c``, and
``parser-mpcmd.c``, and uses the option table in ``options.c``.

``input/input.c:``
~~~~~~~~~~~~~~~~~~

This translates keyboard input coming from libvo and other sources (such
as remote control devices like Apple IR or slave mode commands) to the
key bindings listed in the user's (or the built-in) ``input.conf`` and turns
them into items of type ``struct mp_cmd``. These commands are queued, and read
by ``playloop.c``. They get pushed with ``run_command()`` to ``command.c``.

.. note::
  Keyboard input and slave mode input are essentially the same things. Just
  looking at ``input.conf`` should make this clear. (The other direction of
  slave mode communication, mpv to application, consists of random
  ``mp_msg()`` calls all over the code in all parts of the player.)

``common/msg.h:``
~~~~~~~~~~~~~~~~~

All terminal output should go through ``mp_msg()``.

``stream/*:``
~~~~~~~~~~~~~

File input is implemented here. ``stream.h/.c`` provides a simple stream based
interface (like reading a number of bytes at a given offset). mpv can
also play from http streams and such, which is implemented here.

E.g. if mpv sees "http://something" on the command line, it will pick
stream_lavf.c based on the prefix, and pass the rest of the filename to it.

Some stream inputs are quite special: stream_dvd.c turns DVDs into mpeg
streams (DVDs are actually a bunch of vob files etc. on a filesystem),
stream_tv.c provides TV input including channel switching.

Some stream inputs are just there to invoke special demuxers, like
``stream_mf.c``. (Basically to make the prefix "mf://" do something special.)

``cache.c`` is a caching wrapper around streams implementations, needed for
smooth network playback.

``demux/:``
~~~~~~~~~~~

Demuxers split data streams into audio/video/sub streams, which in turn
are split in packets. Packets (see demux_packet.h) are mostly byte chunks
tagged with a playback time (PTS). These packets are passed to the decoders.

Most demuxers have been removed from this fork, and the only important and
"actual" demuxers left are ``demux_mkv.c`` and ``demux_lavf.c`` (uses ``libavformat``).
There are some pseudo demuxers like ``demux_cue.c``, which exist only to invoke
other frontend code (``tl_cue.c`` in this case).

The main interface is in ``demux.h``. The stream headers are in ``stheader.h``.
There is a stream header for each audio/video/sub stream, and each of them
holds codec information about the stream and other information.

``video/:``
~~~~~~~~~~~

This contains several things related to audio/video decoding, as well as
video filters.

``mp_image.h`` and ``img_format.h`` define how mpv stores decoded video frames
internally.

``video/decode/:``
~~~~~~~~~~~~~~~~~~

``vd_*.c`` are video decoders (There's only ``vd_lavc.c`` left.).
``dec_video.c/vd.c`` handle most of connecting the frontend with the actual
decoder.

``video/filter/:``
~~~~~~~~~~~~~~~~~~

``vf_*.c`` and ``vf.c`` form the video filter chain. They are fed by the video
decoder, and output the filtered images to the VOs though ``vf_vo.c``. By
default, no video filters (except vf_vo) are used. vf_scale is automatically
inserted if the video output can't handle the video format used by the
decoder.

``video/out/:``
~~~~~~~~~~~~~~~

Video output. They also create GUI windows and handle user input. In most
cases, the windowing code is shared among VOs, like ``x11_common.c`` for X11
and ``w32_common.c`` for Windows. The VOs stand between frontend and windowing
code. vo_opengl can pick a windowing system at runtime, e.g. the same binary
can provide both X11 and Cocoa support on macOS.

VOs can be reconfigured at runtime. A ``config()`` call can change the video
resolution and format, without destroying the window.

vo_vdpau and vo_opengl should be taken as reference.

``audio/:``
~~~~~~~~~~~

``format.h/format.c`` define the uncompressed audio formats. (As well as some
compressed formats used for spdif.)

``audio/decode/:``
~~~~~~~~~~~~~~~~~~

``ad_*.c`` and ``dec_audio.c/ad.c` handle audio decoding. ``ad_lavc.c`` is the
decoder using ffmpeg. ``ad_spdif.c`` is not really a decoder, but is used for
compressed audio passthrough.

``audio/filter/:``
~~~~~~~~~~~~~~~~~~

Audio filter chain. af_lavrresample is inserted if any form of conversion
between audio formats is needed. (``af_convert24.c`` and ``af_convertsignendian.c``
are also used for some formats not directly supported by FFmpeg.)

``audio/out/:``
~~~~~~~~~~~~~~~

Audio outputs.

Unlike VOs, AOs can't be reconfigured on a format change. Without
``--gapless-audio``, even playing a new file will close and re-open the audio
device.

Note that mpv synchronizes the video to the audio. That's the reason
why buggy audio drivers can have a bad influence on playback quality.

``sub/:``
~~~~~~~~~

Contains subtitle and OSD rendering.

``sub.c/.h`` is actually the OSD code. It queries ``dec_sub.c`` to retrieve
decoded/rendered subtitles. ``osd_libass.c`` is the actual implementation of
the OSD text renderer (which uses libass, and takes care of all the tricky
fontconfig/freetype API usage and text layouting).

Subtitle loading is now in demux/ instead. ``demux_libass.c`` wraps loading
.ass subtitles via libass. ``demux_lavf.c`` loads most subtitle types via
FFmpeg. ``demux_subreader.c`` is the old MPlayer code. It's used as last
fallback, or to handle some text subtitle types on Libav. (It also can
load UTF-16 encoded subtitles without requiring the use of ``-subcp``.)
``demux_subreader.c`` should eventually go away (maybe).

the subtitles are passed to ``dec_sub.c`` and the subtitle decoders in ``sd_*.c``
as they are demuxed. All text subtitles are rendered by ``sd_ass.c``. If text
subtitles are not in the ASS format, subtitle converters are inserted, for
example ``sd_srt.c`` which is used to convert SRT->ASS. ``sd_srt.c`` is also
used as general converter for text->ASS (to prevent interpretation of text as
ASS tags).

Text subtitles can be preloaded, in which case they are read fully as soon
as the subtitle is selected, and then effectively stored in an ASS_Track.
It's used for external text subtitles, and required to make codepage
detection as well as timing postprocessing work. (Timing postprocessing
removes tiny gaps or overlaps between subtitle events.)

``player/timeline/:``
~~~~~~~~~~~~~~~~~~~~~

A timeline is the abstraction used by ``loadfile.c`` to combine several files
into one seemingly linear video. It's mainly used for ordered chapters
playback. The high level code to find and load other files containing the
segments for playing an ordered chapters file is in ``tl_matroska.c``.

``etc/:``
~~~~~~~~~

The file ``input.conf`` is actually integrated into the mpv binary by the
build system. It contains the default keybindings.
