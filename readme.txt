=== Visfeed ===
Contributors: rickgonzalez
link: http://ownerfeed.com/
Tags: Vacation Rental booking, Reservations, Payment Platform, Stripe, scheduling, confirmations, appointment setting, tour, sharing economy, hosting platform
Requires at least: 3.0.1
Tested up to: 4.7.5
Stable tag: 1_4
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Calendar booking, E-sign and payment processing for rental properties or anything that can be rented daily or hourly.

== Description ==

This plugin allows you to set up a booking website that can manage Stripe payments and several different booking workflows.  Visfeed supports instant bookings as well as managed requests to book.  

Additional support can be found at http://www.ownerfeed.com/visfeed-documentation/

Hosted resources can include rental properties, or anything that can be booked daily or hourly.  Visfeed displays the resource's availability calendar and allows a customer to book time with the resource, accept agreements, make booking requests and process payments via the Stripe network.

The Visfeed plugin is targeted at creators of Wordpress sites that are designed to promote a bookable resource such as a vacation property.  Users of the plug-in first need to create an account on Visbridge.com where they are able to add their property and information required for the booking.  Visbridge.com has a large number of useful calendar syncing features, confirmation settings and hosted property agreements.  In addition, users are able to create and connect a Stripe account for processing booking payments within their Wordpress site.




== Installation ==


This section describes how to install the plugin and get it working.

If you’re interested in seeing the plugin’s interactions prior to creating an account, you can email rick@ownerfeed.com and I’ll send you a sample calendar account to review.


1. Create an ownerfeed account on www.ownerfeed.com.  There is a $10/month fee for each property or resource.
2. Add booking agreements, welcome letters, recommendations and confirmation information.
3. Create a new, or connect your existing, Stripe account via the ownerfeed.com settings area.  This is required if you want to use the automated payment part of the workflows.  Ownerfeed charges a .85% fee for transactions on top of Stripe’s normal fee of 2.9% + $0.30.
4. Upload the plugin files to the `/wp-content/plugins/Visfeed` directory, or install the plugin through the WordPress plugins screen directly.
5. Activate the plugin through the 'Plugins' screen in WordPress.
6. Use the Settings->Visfeed screen to configure the plugin’s global settings.
7. Add the visfeed_cal shortcode to the pages where you would like to create bookings.

Below are the configuration options for Visfeed.



Two major work flows:
[visfeed_cal requestflownum=1 or 2]


*Instant booking flow*
requestflownum drives one of two major workflows for the booking.  The first flow, (requestflownum=1) displays the resource’s availability calendar, allows for date/time selection, presents an agreement with e-sign capability and then immediately requests payment.  This is considered Visfeed’s instant booking option.  The flow creates a customer for the owner with the data input, and sends communication to both parties upon processing of the payment.


*Request to book flow*
The second flow (requestflownum=2) also displays the resource’s availability calendar, but when the user makes a selection on the calendar, a request form is created and sent to the owner, which does not immediately process payment.  The owner receives an email with the option to approve the request.  If approved, the platform sends an email to the requestor and then allows them to complete the agreement and payment with an automated return to the page.


The Visited plugin has two major settings areas:


*Global Settings* for establishing options related to the user’s account and general connection information are configured via the general settings menu under the Visfeed menu option.  Here users can set general settings such as their user id, company name and email.  The global settings generally do not change from resource to resource.


*Property Settings* for establishing options related to the individual property or resources are configured as part of the plugin’s shortcode, visfeed_cal.  In this manner, it is easy to create many different properties as a part of a single site.  There are a large number of settings options that can be managed at the shortcode level.   The table below outlines the settings available via the visfeed_cal shortcode.  To really understand the power of the plugin, we’ll examine in some detail one of the primary ones - requestflownum.




**Other settings that are available to the shortcode**:


units = “hours” or “nights”  - default “nights”


costperunit = #in US dollars


property_id = available via ownerfeed account,


calcolor =  “#16a085”            
                   
corediscount1 - 6 = 0 These are pricing discounts which can be expressed as a number such as 25 = 25% discount.  Discounts are placed on the number of units,  for example, discount2 on 2 or more days and discount3 on 3 or more.  The default for all discounts is 0 which would apply the per unit price regardless of the number of units.
                  
ics_usedirect = 0 or 1  - default 0 means that the availability calendar comes automatically from ownerfeed.com.  If 1 is set, the program expects an external source for the availability calendar.


ics_name = “” - name of external calendar file - the default is empty because the program uses the ownerfeed.com default booking calendar, which has many advantages.


Visfeed uses fullcalendar, an open source calendar created by Adam Shaw.  The calendar has many customizable features, and Visfeed exposes some of these via the shortcode.


calendar_view_string = “agendaWeek,agendaDay”
calendar_view_default = “agendaWeek”  
These settings set the calendar to present as a weekly or daily view.  The obvious default for vacation rentals is “month”; however, Visfeed does support hourly and half hourly bookings as well, where the above settings are more appropriate.




Shortcode Examples:
[visfeed_cal units="nights" calendar_view_string="month" calendar_view_default="month" requestflownum=1 costperunit=500 property_id=114]


[visfeed_cal units="hours" calendar_view_string="agendaWeek,agendaDay" calendar_view_default="agendaWeek" requestflownum=2 costperunit=40 property_id=115]



== Frequently Asked Questions ==


= How are payments managed on Visfeed? =


Ownerfeed is a Stripe connect provider, which means that the you as the Stripe account owner are responsible for managing refunds and transfers to your account.  By opening and connecting your Stripe account with Visbridge, we are able to control the booking flow and present the payment screens when necessary, but you are the owner of the Stripe account with full access to the Stripe dashboard with account credentials.


= Can I use my Stripe account for other things? =


Absolutely. Stripe is kinda cool like that.  It’s your Stripe account.  Visbridge’s additional fees are only issued when we facilitate the booking.




= Is there a trial period for Ownerfeed? =


Currently there is a 30 day trial period.

= Can I customize the Visfeed flows or UI? =


Yes! There’s a limited number of customizations that you can perform through the shortcode and global settings.  The plugin uses a file called visfeed.js which is open source.


== Screenshots ==

1. Setting up an account on ownerfeed.com creates your unique token for the plugin.  Ownerfeed.com is also where you manage your mobile confirmations and calendar syncing.
2. The second screen shot shows a month view of the availability calendar.
3. After clicking and dragging to create a booking, the user is presented with a custom booking agreement.
4. The fourth screen shot demonstrates a customizable payment collection screen that operates on the Stripe network.
5. The fifth screen shot shows one of the two main flows for processing booking requests - either instant booking or as this one shows a request that is emailed to the owner.
6. The sixth screen shot shows the booking calendar in the hour view configuration which is great for appointment setting.
7  The last screen shot shows the booking calendar in the week view.  All views of the calendar are bookable by simply clicking and dragging.




== Changelog ==

= 1.4 =
* Change backend to point to ownerfeed.com
* Stability updates for instant ics writing
* New management features enabled on ownerfeed.com
= 1.2.2 =
* ics write re-tries
* Reduced sql memory usage from connection pool 
* Adding extended renter/guest application
* Adding new deposit fee to quote
* Adding new cleaning fee to quote
* Adding new tax fee to quote
* Removing default month,day week button as it's selected already
* Adding button to launch date time - from/too modal - improve date and time entry and allow to go past a current month.
* Integrated as an option http://eonasdan.github.io/bootstrap-datetimepicker
* Made manual_entry locks not send code string in email       
* Standardize Check-in/out times 2PM and 11AM - added setting
* Added post render routine to distort nightly bookings
* Added new conflict checking for nightly bookings
= 1.2 =
* Introduction as a Wordpress plugin.
* Added ability to have a non-instant booking request.
= 1.1 =
Initial javascript introduction for hourly bookings




== Upgrade Notice ==

This must take update points to a new backend on ownerfeed.com with greater stability and new management features.