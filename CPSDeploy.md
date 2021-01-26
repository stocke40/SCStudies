# Deploying CrystalPalaceStudies

## Manual deploy

The output of the current manual build process goes to the /tgt directory.  After building, the resulting .dll must be copied to the SierraCharts /Data directory.

NOTE: Any Sierra Chart user can use this study (without performing a local or remote build) by simply copying the [.dll](https://en.wikipedia.org/wiki/Dynamic-link_library) file to the Data Files Folder in their copy of Sierra Chart.

(Rewrite this given the loading issues)

Note that the resulting DLL file is included in the repo on github.  This is for convenience.  However, the compiled DLL is dependant upon the version of headers, etc. and the version of Sierra Chart present on the building machine at the time of the build, so YMMV.  If you have problems using the pre-compiled DLL in your copy of Sierra Chart, we recommend that you take the .cpp source in this repo and perform your own build, either [remote](https://www.sierrachart.com/index.php?page=doc/AdvancedCustomStudyInterfaceAndLanguage.php#StepByStepInstructions) or local.  
