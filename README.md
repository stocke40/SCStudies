# SCStudies

This repository contains [Sierra Chart Advanced Custom Studies](https://www.sierrachart.com/index.php?page=doc/AdvancedCustomStudyInterfaceAndLanguage.php).

## What is Sierra Chart?

[Sierra Chart](https://www.sierrachart.com/) is a professional desktop trading and charting platform for the financial markets, supporting connectivity by various exchanges and backend trading platform services.

## What is a study?

A study is a graph or chart that one can superimpose on top of a chart of a security or derivative.  Examples of studies could be a simple moving average, bollinger bands, or volume weighted average price (VWAP).  Sierra Chart includes many common and popular studies, but allows for the development of custom studies by Sierra Chart users and third party developers.

This repo currently contains only one set of custom studies, CrystalPalaceStudies.  More studies may be included in this repo in the future.

Studies are packaged in Windows DLLs, and one DLL may contain multiple studies.

## CrystalPalaceStudies

The CrystalPalaceStudies DLL contains custom Sierra Chart studies that have been developed by u/CrystalPalacePirate, an r/thewallstreet sub-reddit contributor.

Currently, the CrystalPalaceStudies DLL contains the following custom studies:

- DailyStandardDevs

### DailyStandardDevs

DailyStandardDevs plots daily standard deviations based on IV around the prior day's settlement for an instrument.

These levels often serve as short-term support and resistance and can be handy to help time short term trades.

The DailyStandardDevs study calculates [-3...3] standard deviations in 0.5 increments. By default, only [-2...2] are plotted.

## Building

See [Building CrystalPalaceStudies](./CPSBuild.md) for more information on building the CrystalPalaceStudies Sierra Chart Advanced Custom Study.

## Deploying

See [Deploying CrystalPalaceStudies](./CPSDeploy.md) for more information on deploying the CrystalPalaceStudies Sierra Chart Advanced Custom Study.
