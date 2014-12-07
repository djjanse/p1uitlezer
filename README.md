p1uitlezer
==========

Read the P1 port of a smart meter and write to CSV

The node.js script is analoguous to that of GE Janssen's script: http://gejanssen.com/howto/Slimme-meter-uitlezen/index.html

You can buy a P1 converter cable via: https://sites.google.com/site/nta8130p1smartmeter/webshop

Heatpump 
========

Eventually I will combine the smart meter data with my heatpump data.
The heatpump has a datafile available via it's web interface at: http://<heatpump-ip-address>/proclog

This dta-files can be read by OpenDTA:
* OpenDTA: http://sourceforge.net/projects/opendta/

To compile install the following deps:
* Compile deps:  sudo yum install qt-devel qt-config qwt-devel
