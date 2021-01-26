# Building CrystalPalaceStudies

It is possible to do remote builds and local builds of Sierra Chart Advanced Custom Studies.

## Remote

Remote builds are executed remotely on Sierra Chart servers and all you need is your study source.  This is the quickest way to get going.  However, with remote builds, most of your #includes will be stripped, so if you trying to do anything out of the ordinary, it may not work.

## Local

Sierra Chart provides local build instructons [here](https://www.sierrachart.com/index.php?page=doc/AdvancedCustomStudyInterfaceAndLanguage.php#StepByStepInstructions).  You should read and understand their documentation before working with this repo.  However, their instructions assume that you are using the SierraChart GUI to perform local builds, and furthermore are using Visual C++.  The rest of this README.md attempts to highlight the differences between using this repo and the recommended process in SierraCharts.

We keep our source in a github repo, run our local builds on Windows, and we mostly use Miscrosoft Visual Studio Code as our preferred IDE.  We chose to install [MinGW-w64](https://sourceforge.net/projects/mingw-w64/) to get the gcc toolchain.  Alternatively, one could choose Microsoft Visual C++, for example.

### Steps to perform a local build using non-Sierra Chart build environment

Currently, our build process is manual.  We may look into using [CMake](https://cmake.org/), [make](https://www.gnu.org/software/make/), [Github actions](https://docs.github.com/en/actions), and/or [Jenkins](https://www.jenkins.io/) in the future.  For now, the build is manual.

In a terminal window, navigate to the /tgt directory:

```Shell
stocke@MSI MINGW64 ~/gitrepos/SCStudies (main)
$ cd tgt
```

#### Compile the source

See the [64-bit compile options](https://www.sierrachart.com/index.php?page=doc/AdvancedCustomStudyInterfaceAndLanguage.php#RemoteCompilerParameters) from the Sierra Chart documentation.  

Compile the source with g++:

```Shell
stocke@MSI MINGW64 ~/gitrepos/SCStudies/tgt (main)
$ x86_64-w64-mingw32-g++ \
  -D _WIN64 \
  -U NOMINMAX \
  -march=x86-64 \
  -mtune=x86-64 \
  -O2 \
  -shared \
  -static \
  -static-libgcc \
  -static-libstdc++ \
  -s \
  -fno-rtti \
  -fno-exceptions \
  -std=gnu++11 \
  ../src/CrystalPalaceStudies_2217.cpp \
  -o CrystalPalaceStudies_2217_64.dll \
  -Wno-deprecated
```
