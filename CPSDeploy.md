# Deploying CrystalPalaceStudies

## Manual deploy

The output of the current manual build process goes to the /tgt directory.  After building, the resulting .dll must be copied to the SierraCharts /Data directory.

NOTE: Any Sierra Chart user can use this study (without performing a local or remote build) by simply copying the [.dll](https://en.wikipedia.org/wiki/Dynamic-link_library) file to the Data Files Folder in their copy of Sierra Chart.

Note that the resulting DLL file is included in the repo on github.  This is for convenience.  However, the compiled DLL is dependant upon the version of headers, etc. and the version of Sierra Chart present on the building machine at the time of the build, so YMMV.  

Also, see the [DLL Loading Management](https://www.sierrachart.com/SupportBoard.php?ThreadID=59423) support thread on the Sierra charts website.  It appears as though the DLL naming and loading changed with version 2216 of Sierra Charts.  Furthermore, version 2217 seems to have introduced an incompatible upgrade.  Finally, reading this support thread seems to foreshadow more changes to this process in upcoming versions of Sierra Charts.

As of SC version 2217, here is the naming convention expected for the DLL name:
    [DLLName]_[optional_4_digit_numeric_version][optional _64 suffix].dll

The 4 digit numeric version indicates that this advanced study is intended for users of Sierra Chart at that version or higher.  For example, the file name *CrystalPalaceStudies_2217_64.dll*, is intended for Sierra Charts versions 2217 and higher.  Also note that the *_2217* portion must be specified in the SCDLLName() argument in the source, whereas the optional *_64* suffix does not.  

If you have problems using the pre-compiled DLL in your copy of Sierra Chart, we recommend that you take the .cpp source in this repo and perform your own build, either [remote](https://www.sierrachart.com/index.php?page=doc/AdvancedCustomStudyInterfaceAndLanguage.php#StepByStepInstructions) or local.  
