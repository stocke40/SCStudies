# SCStudies
Sierra Chart Advanced Custom Studies

# Building
It is possible to do remote builds and local builds of Sierra Chart Advanced Custom Studies.

## Remote
Remote builds are executed remotely on Sierra Chart servers and all you need is your study source.  This is the quickest way to get going.  However, with remote builds, most of your #includes will be stripped, so if you trying to do anything out of the ordinary, it may not work.

## Local
Sierra Chart provides local build instructons here: https://www.sierrachart.com/index.php?page=doc/AdvancedCustomStudyInterfaceAndLanguage.php#StepByStepInstructions.  You should read and understand their documentation before working with this repo.  However, their instructions assume that you are using the SierraChart GUI to perform local builds, and furthermore are using Visual C++.  The rest of this README.md attempts to highlight the differences between using this repo and the recommended process in SierraCharts. 

We keep our source in a github repo, run our local builds on Windows, and we mostly use Miscrosoft Visual Studio Code as our preferred IDE.  We chose to install [MinGW-w64](https://sourceforge.net/projects/mingw-w64/) to get the gcc toolchain.  Alternatively, one could choose Microsoft Visual C++, for example. 

### Steps to manually build
Currently, our build process is manual.  We may look into using [make](https://www.gnu.org/software/make/) in the future, and/or [Github actions](https://docs.github.com/en/actions), and/or [Jenkins](https://www.jenkins.io/).  For now, it is manual.

In a terminal window, navigate to the /tgt directory:

```
stocke@MSI MINGW64 ~/gitrepos/SCStudies (main)
$ cd tgt
```
#### Compile the source
Compile the source with gcc:
```
stocke@MSI MINGW64 ~/gitrepos/SCStudies/tgt (main)
$ gcc -c ../src/CrystalPalaceStudies.cpp
In file included from C:\SierraChart\ACS_Source\scstructures.h:101,
                 from C:\SierraChart\ACS_Source\sierrachart.h:22,
                 from ../src/CrystalPalaceStudies.cpp:1:
C:\SierraChart\ACS_Source\scdatetime.h:130:52: warning: overflow in conversion from 'long long int' to 'time_t' {aka 'long int'} changes value from '-2209161600' to '2085805696' [-Woverflow]
  = std::chrono::system_clock::from_time_t(-25569ll * 86400ll);
                                           ~~~~~~~~~^~~~~~~~~
```
#### Build the DLL
Next, you will need to build the DLL, or [Dynamic-link Library](https://en.wikipedia.org/wiki/Dynamic-link_library).  Here, you can find more information on [Building and Using DLLs](https://cygwin.com/cygwin-ug-net/dll.html).  
```
stocke@MSI MINGW64 ~/gitrepos/SCStudies/tgt (main)
$ gcc -shared -o CrystalPalaceStudies.dll CrystalPalaceStudies.o
CrystalPalaceStudies.o:CrystalPalaceStudies.cpp:(.text+0xb49): undefined reference to `std::ios_base::Init::~Init()'
CrystalPalaceStudies.o:CrystalPalaceStudies.cpp:(.text+0xb6a): undefined reference to `std::ios_base::Init::Init()'
CrystalPalaceStudies.o:CrystalPalaceStudies.cpp:(.eh_frame$_ZNSt6chrono3_V212system_clock11from_time_tEl+0x13): undefined reference to `__gxx_personality_v0'
collect2.exe: error: ld returned 1 exit status

stocke@MSI MINGW64 ~/gitrepos/SCStudies/tgt (main)
$ 
```

### Manual deploy 
The output of the current manual build process goes to the /tgt directory.  After building, the resulting .dll must be copied to the SierraCharts /Data directory. 

NOTE: Any Sierra Chart user can use this study (without performing a local or remote build) by simply copying the [.dll](https://en.wikipedia.org/wiki/Dynamic-link_library) file to the Data Files Folder in their copy of Sierra Chart.

Note that the resulting DLL file is included in the repo on github.  This is for convenience.  However, this is dependant upon the version of headers, etc. and the version of Sierra Chart present on the building machine at the time of the build, so YMMV.  If you have problems with the DLL in the repo in your copy of Sierra Chart, we recommend that you take the .cpp source in this repo and perform your own build, either [remote](https://www.sierrachart.com/index.php?page=doc/AdvancedCustomStudyInterfaceAndLanguage.php#StepByStepInstructions) or local.  


