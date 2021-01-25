#include "C:\SierraChart\ACS_Source\sierrachart.h"	//Fully-quaidfied path may be required for local builds
//#include "sierrachart.h" 							//unqualified path should be OK for remote builds, all other includes are stripped for remote builds
#include <stdio.h>
SCDLLName("CrystalPalace Studies")
/*
The CrystalPalaceStudies DLL contains custom studies for SierraChart trading systems.
These studies have been developed by u/CrystalPalacePirate, an r/thewallstreet sub-reddit contributor.

See https://www.sierrachart.com/index.php?page=doc/AdvancedCustomStudyInterfaceAndLanguage.php 
for more information about Sierra Chart Advanced Custom Studies. 
*/

SCSFExport scsf_DailyStandardDevs(SCStudyInterfaceRef sc)
{
	/*
	DailyStandardDevs plots daily standard deviations based on IV around the prior day's settlement for an instrument.
	These levels often serve as short-term support and resistance and can be handy to help time short term trades.

	It calculates [-3...3] standard deviations in 0.5 increments. By default, only [-2...2] are plotted.
	*/

	if (sc.SetDefaults)
	{
		//Setting Study Defaults
		sc.GraphName = "Daily Standard Deviations";
		sc.GraphRegion = 0;
		sc.AutoLoop = 1; 


		//Subgraph Definition and Default Settings
		sc.Subgraph[0].Name = "+3.0 Sigma";
		sc.Subgraph[0].DrawStyle = DRAWSTYLE_IGNORE;
		sc.Subgraph[0].PrimaryColor = RGB (255,255,255);
		
		sc.Subgraph[1].Name = "+2.5 Sigma";
		sc.Subgraph[1].DrawStyle = DRAWSTYLE_IGNORE;
		sc.Subgraph[1].PrimaryColor = RGB (255,255,255);
		
		sc.Subgraph[2].Name = "+2.0 Sigma";
		sc.Subgraph[2].DrawStyle = DRAWSTYLE_LINE;
		sc.Subgraph[2].PrimaryColor = RGB (0,230,0);
		
		sc.Subgraph[3].Name = "+1.5 Sigma";
		sc.Subgraph[3].DrawStyle = DRAWSTYLE_LINE;
		sc.Subgraph[3].LineStyle = LINESTYLE_DASH;
		sc.Subgraph[3].PrimaryColor = RGB (17,255,17);
		
		sc.Subgraph[4].Name = "+1.0 Sigma";
		sc.Subgraph[4].DrawStyle = DRAWSTYLE_DASH;
		sc.Subgraph[4].LineStyle = LINESTYLE_DASH;
		sc.Subgraph[4].PrimaryColor = RGB (100,255,100);
		
		sc.Subgraph[5].Name = "+0.5 Sigma";
		sc.Subgraph[5].DrawStyle = DRAWSTYLE_DASH;
		sc.Subgraph[5].LineStyle = LINESTYLE_DASHDOT;
		sc.Subgraph[5].PrimaryColor = RGB (185,255,185);
		
		sc.Subgraph[6].Name = "Prior Settlement";
		sc.Subgraph[6].DrawStyle = DRAWSTYLE_LINE;
		sc.Subgraph[6].LineWidth = 10;
		sc.Subgraph[6].PrimaryColor = RGB (221,226,227);
		
		sc.Subgraph[7].Name = "-0.5 Sigma";
		sc.Subgraph[7].DrawStyle = DRAWSTYLE_DASH;
		sc.Subgraph[7].LineStyle = LINESTYLE_DASHDOT;
		sc.Subgraph[7].PrimaryColor = RGB (255,200,200);
		
		sc.Subgraph[8].Name = "-1.0 Sigma";
		sc.Subgraph[8].DrawStyle = DRAWSTYLE_DASH;
		sc.Subgraph[8].LineStyle = LINESTYLE_DASH;
		sc.Subgraph[8].PrimaryColor = RGB (255,132,132);
		
		sc.Subgraph[9].Name = "-1.5 Sigma";
		sc.Subgraph[9].DrawStyle = DRAWSTYLE_LINE;
		sc.Subgraph[9].LineStyle = LINESTYLE_DASH;
		sc.Subgraph[9].PrimaryColor = RGB (255,32,32);
		
		sc.Subgraph[10].Name = "-2.0 Sigma";
		sc.Subgraph[10].DrawStyle = DRAWSTYLE_LINE;
		sc.Subgraph[10].PrimaryColor = RGB (255,0,0);
		
		sc.Subgraph[11].Name = "-2.5 Sigma";
		sc.Subgraph[11].DrawStyle = DRAWSTYLE_IGNORE;
		sc.Subgraph[11].PrimaryColor = RGB (255,255,255);
		
		sc.Subgraph[12].Name = "-3.0 Sigma";
		sc.Subgraph[12].DrawStyle = DRAWSTYLE_IGNORE;
		sc.Subgraph[12].PrimaryColor = RGB (255,255,255);
		
		//Input Definition
		sc.Input[0].Name = "Settlement [Format: 3397.50]";
		sc.Input[0].SetFloat(0.0000f);
		
		sc.Input[1].Name = "Implied Volatility [Format: 0.2125]";
		sc.Input[1].SetFloat(0.0000f);
		return;
	}
	
	//Get input parameters
	float settlement = sc.Input[0].GetFloat();				//Prior day settlement level/price
	float impliedVolatility = sc.Input[1].GetFloat();		//Implied Volatility
	
	//Calculate one STDEV above the settlement price/level
	float dev = ( impliedVolatility / sqrt(252.00)) * settlement;
			
	//Plot STDEV lines around settlement.  These levels, coupled with VWAP, often\
	  provide short-term resistance and support.
	sc.Subgraph[0][sc.Index] = settlement + 3.0 * dev;
	sc.Subgraph[1][sc.Index] = settlement + 2.5 * dev;
	sc.Subgraph[2][sc.Index] = settlement + 2.0 * dev;
	sc.Subgraph[3][sc.Index] = settlement + 1.5 * dev;
	sc.Subgraph[4][sc.Index] = settlement + 1.0 * dev;
	sc.Subgraph[5][sc.Index] = settlement + 0.5 * dev;
	sc.Subgraph[6][sc.Index] = settlement;
	sc.Subgraph[7][sc.Index] = settlement - 0.5 * dev;
	sc.Subgraph[8][sc.Index] = settlement - 1.0 * dev;
	sc.Subgraph[9][sc.Index] = settlement - 1.5 * dev;
	sc.Subgraph[10][sc.Index] = settlement - 2.0 * dev;
	sc.Subgraph[11][sc.Index] = settlement - 2.5 * dev;
	sc.Subgraph[12][sc.Index] = settlement - 3.0 * dev;
	
}