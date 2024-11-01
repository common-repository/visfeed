/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * 
 * What this will do is take an input of a Visbridge master ics 
 * or any ics for that matter
 * and create a feed for the fullcalendar on the page
 * 
 * Written by Rick Gonzalez
 * I stand on the shoulders of giants
 *
 *This Javascript program uses the following opensource and reuse is subject to their respective licenses
 * fullcalendar.io
 * moment.js
 * jquery
 * stripe
 * twitter bootstrap
 *
 *Although the Visbridge platform and data services are proprietary , the user experience - What's left of
 *the following code that I may have actually written - is licensed to you as opensource under : GPLv2 or later
 *License URI: http://www.gnu.org/licenses/gpl-2.0.html  with the mandate that all dirivative works are published under
 *the same license.
 * 
 * Version 1.2 with enhancements for
 * 
 * create request only flow
 * Expose monthly view as option for availability calendars
 * Expose increment as option for bookings
 * !wrap as wordpress plugin* 
 * 
 *   Previous versions  
 * Version 1.1 with attempted fixes for 
 * - calendar repaint offsett issue - may upgrate to 2.9 and ensure css is updated too  - didn't fix
 * - Race condition - check for conflict just before booking
 * 
 * - Added StripeRequestAuto - to bypass pay buttons
 * - longPressDelay: 350, change made for touch responsiveness 
 * - added the ability to resize request events and recalculate pricing
 
 * 
 */


/* String formatting, you might want to remove this if you already use it.
 * Example:
 * 
 * var location = 'World';
 * alert('Hello {0}'.format(location));
 */
String.prototype.format = function() {
  var s = this,
      i = arguments.length;

  while (i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  }
  return s;
};

!function($) {
  $.visfeed = function(options) {
      mytimeout = 0;
      RUNNING_TOTAL_HOURS = 0;
      PAYMENTJUMP = 0;
    var self = this;
    var settings = {
      
      //ics_url: '/opt/glassfish4/glassfish/domains/domain1/applications/User_Files/',
      ics_url_stub: '/opt/glassfish4/glassfish/domains/domain1/applications/Media-Files/Calendars/',
      ics_useDirect: false,
      ics_name: '',
      calpressdelay: 175,
      ownerid: 0,
      propertyid: 0,
      property_description: "Basic property description",
      upmeemail:'rick@guestavo.com',
      usertoken: 'stringwithabunchofcrap',
      serviceURL:'https://www.visbridge.com/',
      resourceURL:'https://www.guestavo.com/',//must stay guestavo.com
      visfeedURL:'https://www.visbridge.com/',
      calcolor: '#16a085',
      bookingRequestArea: '#bookingRequest', //div for request space
      Request_Heading: 'Selection Instructions',
      bookingRequestButid1: 'Requestbut1',
      bookingRequestButid2: 'Requestbut2', 
      bookingRequestButid3: 'Requestbut3', 
      bookingRequestButText1: 'Next',
      bookingRequestButText2: 'Cancel',
      bookingRequestButText3: 'Make Payment',
     
      
      units:'hours', //nights
      
      //Cost Calculation Parameters
     // costpernight:200,  //dollars
    //  costperhour: 40,   //dollars
      costperunit:100,
      corediscount1:0,
      corediscount2:0,// 8.5,        //corediscount2 - apply on  1.5 hours i.e. 8.5% on each hour
      corediscount3:0,// 12.5,       //apply on two hours i.e. 12.5% on each hour
      corediscount4:0,// 25,        //apply on 3 hours  i.e. 25% on each hour
      corediscount5:0,// 33,         // 33% on each 
      corediscount6:0,// 38,        //38% on each hour
      specialAdditive:0,        //A fixed flat percent applied on top
                                
      
      //Stripe Parameters ****************************************** 
      stripe_container: '#stripebox',
      
     //stripe_data_key:'pk_live_jGCSsfkM5EHllMABAuwbbo46',// 'pk_test_UahNdRFPPFvb5c5K6Hu1wESV','pk_live_jGCSsfkM5EHllMABAuwbbo46'
      stripe_data_key:'pk_live_jGCSsfkM5EHllMABAuwbbo46',// 'pk_test_UahNdRFPPFvb5c5K6Hu1wESV','pk_live_jGCSsfkM5EHllMABAuwbbo46'
      //**Test
      stripe_data_amount:"2000",
      stripe_data_name:'Visbridge',
      stripe_data_description:'booking',
      stripe_data_image: 'https://www.guestavo.com/Vcontent/resources/images/vb_square_s.png',
      
      bookingrequestInstruct: 'Click and drag to create a single booking request. On mobile, touch and hold to select, rotate to change views.',
      bookingdialogText: 'Please fill in the following information required to complete your booking request.',
      bookingdialogCompleteText:'Your request has been sent and will be processed within 24 hours.  Please check your email for responses and be sure to reply promptly.',
      paymentrequestInstruct: 'Follow the instructions to complete your booking agreement and payment.',
     
      //bookingdialogCompleteText: 'Your confirmation will be texted to you along with your door access code.',
              
      calendarthemeing:false,
      
      //Agreement Parameters ****************************************
      Agreement_required: true,
      AgreementAccept1Butid:"ElectroAccept",
      AgreementAccept2Butid:"TermsAgree",
      AgreementButtonText:"Agree",
      AgreementTitile:"Terms and Conditions",
      Agreement_RequireInfo:true,
      //Request vs. Straight thru instant booking flow choices ******
      //setting for rental properties that drives an email request to owenr
      //1 = instant booking, 2 is a send a request flow
      requestflownum: 1,
      jumpbackURL:"http://www.visbridge.com/plugintest/",
      
      
       //Confirmation Parameters ****************************************
      Confirmation_BusName: "Visbridge",
      Confirmation_Email_from: "admin@visbridge.com",
      
     //Loading of js and css
     Load_Bootstrap: true,
     Load_Stripe: true,
     Load_fullcalendar: true,
     Load_visfeed: true,
     
     Load_calendarbox: false,
     Load_instructionbox: false,
     
     //Calendar settings
     calendar_view_string: 'month',//'agendaWeek,agendaDay',
     calendar_view_default: 'month'//'agendaWeek'
     
     
    };    
    //loc559-121.ics
    
    $.extend(settings, options);

    
      
   
    ////////BOOTSTRAP/////////
    if(settings.Load_Bootstrap){
      var bootstrap_script = document.createElement('script');
        bootstrap_script.src = settings.resourceURL + 'Booker/bootstrap.min.js';
        bootstrap_script.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(bootstrap_script); 
    
     
      var link4 = document.createElement('link');
        link4.href = settings.resourceURL + 'Booker/bootstrap.min.css';
        link4.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(link4);
    }

   //<meta name="viewport" content="width=device-width, initial-scale=1">
    ////////STRIPE/////////
  
    //  
    if(settings.Load_Stripe){
      var stripe_script = document.createElement('script');
        stripe_script.src = "https://checkout.stripe.com/checkout.js";
        stripe_script.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(stripe_script); 
     
     
      var link5 = document.createElement('link');
        link5.href = 'https://checkout.stripe.com/v3/checkout/button.css';
        link5.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(link5);
    }
   
      ////////FULL CALENDAR CSS///////// 
     if(settings.Load_fullcalendar){ 
       var link = document.createElement('link');
        link.href = settings.resourceURL + 'Booker/fullcalendar.css';
        link.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(link);
        
      var link2 = document.createElement('link');
        link2.href = settings.resourceURL + 'Booker/fullcalendar.print.css';
        link2.rel = 'stylesheet';
        link2.media = 'print';
        document.getElementsByTagName('head')[0].appendChild(link2);
    }
    ////////VISFEED CSS/////////
        if(settings.Load_visfeed){
            var link3 = document.createElement('link');
            link3.href = settings.resourceURL + 'Booker/visfeed.css';
            link3.rel = 'stylesheet';
            document.getElementsByTagName('head')[0].appendChild(link3);
        }
    
      
     if(settings.Load_instructionbox){
       var myinstructbox = '<div id="bookingRequest" class = "booking_Request"></div>';
       $('#main').append(myinstructbox);
      }
    if(settings.Load_calendarbox){
       var mycaldivbox = '<div id="calendar" class = "viscalendar"></div>';
       $('#main').append(mycaldivbox);
      }
   
       
        

    var visfeed = {
      init: function () {
         SIMPLETOKEN = (settings.ownerid + ":" +  settings.propertyid + ":" + settings.usertoken);
         this.setupicsCalFeed();
      }, 


      //this to call first function - read ics
      setupicsCalFeed: function() {
          
          if (settings.ics_useDirect){
              MYICSFILE = (settings.ics_url_stub + settings.ics_name);
              MYICSFILENAME = (settings.ics_name);
              this.setCal();
          }else{
          MYICSFILE = (settings.ics_url_stub + "loc" +  settings.ownerid + "-" + settings.propertyid + ".ics");
          MYICSFILENAME = ("loc" + settings.ownerid + "-" + settings.propertyid + ".ics" );
          this.setCal();
      }
      },


     
      //set up div for calendar
      // -> script entry point to be on document onready
      // Fullcalendar is looking for a div called calendar 
      //
      setCal: function() {
       var self = this;  
       MYNUMBER_OF_HOURS = 0;
       
       
       $('#calendar').fullCalendar({
           header: {
				left: 'prev,next today',
				center: 'title',
				right: settings.calendar_view_string
			},
			defaultDate: Date.now(),
                        defaultView: settings.calendar_view_default,
			eventLimit: false, // allow "more" link when too many events
                        slotEventOverlap: false,
                        slotDuration:'00:30:00',
                        selectable: true,
                        selectHelper: true,
                        selectOverlap:false,
                        theme: settings.calendarthemeing,
			longPressDelay: settings.calpressdelay,
                        
                        select: function(start, end) {
				var title = "Request";//title = prompt('Event Title:');
				var eventData;
				if (title) {
					eventData = {
						title: title,
						start: start,
						end: end,
                                                editable: true,
                                                overlap: false,
                                                id: 'Visfeed_Request'
					};
					$('#calendar').fullCalendar('renderEvent', eventData, true); 
                                        
                                //do something amazing here - they've added a title now send it on!
                                     
                                //Request to have only one booking at a time per discount (7/11/2016)
                                if(RUNNING_TOTAL_HOURS > 0){
                                   alert("You may only book one reservation at a time.");
                                    self.CancelRequest();
                                    RUNNING_TOTAL_HOURS = 0;
                                     //the following clean off excess bookings 
                                     $('#calendar').fullCalendar( 'gotoDate', 6/11/2016 );
                                     $('#calendar').fullCalendar( 'today');
                                 return;
                                }//This would just cancel any existing quotes when the user selected more?
                                ////////////////////////////////////////////////////////////////////
                                
                                      BOOKING_START = (start);
                                      BOOKING_END = (end);
                                      MYNUMBER_OF_HOURS = ((start.diff(end, 'hours', true)) * -1);  
                                      MYNUMBER_OF_NIGHTS = (MYNUMBER_OF_HOURS/24);  
                                      RUNNING_TOTAL_HOURS = RUNNING_TOTAL_HOURS + MYNUMBER_OF_HOURS;
                                      //MYCHARGE = (MYNUMBER_OF_HOURS * settings.costperhour);
                                      
                                        if (settings.units === 'hours'){
                                            self.EstablishQuote(RUNNING_TOTAL_HOURS,settings.costperunit,"complexa");
                                        } else if (settings.units === 'nights'){
                                           self.EstablishQuote(MYNUMBER_OF_NIGHTS,settings.costperunit,"complexa");  
                                        }
                                     
                                      
                                      
				}
				$('#calendar').fullCalendar('unselect');
			},
                        eventResize: function(event) {

                                      RUNNING_TOTAL_HOURS = 0;
                                      BOOKING_START = (event.start);
                                      BOOKING_END = (event.end);
                                      MYNUMBER_OF_HOURS = ((event.start.diff(event.end, 'hours', true)) * -1); 
                                      MYNUMBER_OF_NIGHTS = (MYNUMBER_OF_HOURS/24);  
                                      RUNNING_TOTAL_HOURS = RUNNING_TOTAL_HOURS + MYNUMBER_OF_HOURS;
                                      
                                        if (settings.units === 'hours'){
                                            self.EstablishQuote(RUNNING_TOTAL_HOURS,settings.costperunit,"complexa");
                                        } else if (settings.units === 'nights'){
                                           self.EstablishQuote(MYNUMBER_OF_NIGHTS,settings.costperunit,"complexa");  
                                        }
                          
                        },
                        eventDrop: function(event) {

                                      RUNNING_TOTAL_HOURS = 0;
                                      BOOKING_START = (event.start);
                                      BOOKING_END = (event.end);
                                      MYNUMBER_OF_HOURS = ((event.start.diff(event.end, 'hours', true)) * -1); 
                                      MYNUMBER_OF_NIGHTS = (MYNUMBER_OF_HOURS/24);  
                                      RUNNING_TOTAL_HOURS = RUNNING_TOTAL_HOURS + MYNUMBER_OF_HOURS;
                                      
                                        if (settings.units === 'hours'){
                                            self.EstablishQuote(RUNNING_TOTAL_HOURS,settings.costperunit,"complexa");
                                        } else if (settings.units === 'nights'){
                                           self.EstablishQuote(MYNUMBER_OF_NIGHTS,settings.costperunit,"complexa");  
                                        }
                          
                        },
                        
                events: function(start, end, timezone, callback) {
                    $.ajax({
                      // /vfeed-web/webresources
                        url: settings.serviceURL + 'vfeed-web/webresources/CalendarEvents',
                        headers: { 'X-Auth-Token': SIMPLETOKEN },

                        data: JSON.stringify({property_id:settings.propertyid, CalSource:MYICSFILE, CalName:MYICSFILENAME}),  
                        processData:'false',
                        contentType:'application/json',
                        dataType:"json", // set recieving type - JSON in case of a question
                        type:'POST', // set sending HTTP Request type
                        async:false, 

                         success: function(doc) {
                            
                          var myextevents = [];
                          for (var j in doc.events) {
                                      myextevents.push({
                                         title:"Reserved",    //doc.events[j].title,
                                         start: doc.events[j].start,
                                         end: doc.events[j].end,
                                         id: doc.events[j].id,
                                         editable: false,
                                         overlap: false,
                                         description: doc.events[j].description,
                                         phone: doc.events[j].phone,
                                         email: doc.events[j].email,
                                         className:settings.ics_name,     //doc.events[i].classname,//mapped from source e.g. HomeAway, airbnbn...
                                         color:settings.calcolor, //blue
                                         textColor:'white'

                                        });  
                                     // MYTEMP = (doc.events[i].start + " " + doc.events[i].end + " " + doc.events[i].id + "," + doc.events[i].title + " " );
                                     // alert(MYTEMP);
                                  }  
                             callback(myextevents);
                             },

                         error: function() {
                              alert('there was an error while fetching external events!');
                         }

                        });// $.ajax for events fetch
                }
               
            });
  
    // the calendar is added and events populated, now add booking request button
           
 
 
        this.EstablishLayout();
 
 
    /////////////////////
 
      },

      RequestBuilder: function() {
       $(settings.bookingRequestArea).empty();
      },


     CustomerLookup: function(){
         
            MYOWNERID = settings.ownerid;
            //One more layer of security would be to validate the data request 
            //parameters against what's in the token.  This is to be done when the 
            //service has ownerid as part of the request.
          
            MYCUSTOMERFNAME = null;
            MYCUSTOMERLNAME = null;
            MYCUSTOMERPHONE = null;
            MYUSERID = null;
            
            NEEDTOREGISTERUSER = false;  
          
        
        REQUESTID = getUrlVars()["requestid"]; 
       

        //This can take either the email from the page or as a query parameter 
         var myselector = $(".upme-user_email").children(".upme-field-value");
         var emailresult = $(myselector).text();
         
         if(emailresult){
          MYCUSTOMEREMAIL = emailresult;
         }else {
          MYCUSTOMEREMAIL = getUrlVars()["email"]; 
          }
         
           MYLOCALCUSTOMERID = getUrlVars()["customerid"];
            
            //MYLOCALCUSTERID can be used to establish if the customer
            //is eligible for special rates
            
            if(typeof MYCUSTOMEREMAIL !== 'undefined'){
               //perform lookup for visbridge registration
                $.ajax({
                            url: settings.serviceURL + 'vfeed-web/webresources/User/fromEmail',
                            headers: { 'X-Auth-Token': SIMPLETOKEN },
                            //jQuery.get( url [, data ] [, success ] [, dataType ] )
                            data: {email: MYCUSTOMEREMAIL, ownerid:MYOWNERID},
                            processData: 'false',
                            //contentType:'application/json',
                            dataType: "json", // set recieving type - "json" 
                            type: 'GET', // set sending HTTP Request type
                            async: false,
                            success: function (result) {  
                                
                                //If the person isn't registered as a user in Visbridge,
                                 //this will still return successful so during esign, I need 
                                 //to create a new user.
                                if (!result){
                                  NEEDTOREGISTERUSER = true;  
                                }else{
                                 MYCUSTOMERFNAME = result.fName;
                                 MYCUSTOMERLNAME = result.lName;
                                 MYCUSTOMERPHONE = result.mobile;
                                 MYUSERID = result.GuestId;
                             }
                                 
                                 
                                
                            }, //end of a non error result for an existing required agreement
                            error: function () { // if error occured
                                alert("error getting visbridge owner customer");
                                return;
                            }
                        });
                 } 
                
             else if(typeof REQUESTID !== 'undefined'){
                   PAYMENTJUMP = 1;
                   
                    $.ajax({
                            url: settings.serviceURL + 'vfeed-web/webresources/User/fromRequest',
                            headers: { 'X-Auth-Token': SIMPLETOKEN },
                            //jQuery.get( url [, data ] [, success ] [, dataType ] )
                            data: {requestid:REQUESTID},
                            processData: 'true',
                            //contentType:'application/json',
                            dataType: "json", // set recieving type - "json" 
                            type: 'GET', // set sending HTTP Request type
                            async: false,
                            success: function (result) {  
                                
                                //If the person isn't registered as a user in Visbridge,
                                 //this will still return successful so during esign, I need 
                                 //to create a new user.
                                if (!result){
                                  NEEDTOREGISTERUSER = true;  
                                }else{
                                 MYCUSTOMERFNAME = result.fName;
                                 MYCUSTOMERLNAME = result.lName;
                                 MYCUSTOMERPHONE = result.mobile;
                                 MYUSERID = result.GuestId;
                             }
                                 
                                 
                                
                            }, //end of a non error result for an existing required agreement
                            error: function () { // if error occured
                                alert("error getting visbridge owner customer");
                                return;
                            }
                        });
                   
                   
                   
                 }
         
                else{
                   //  alert('No values for customer!');
                     //we didn't even try to send an email - so just register if we can
                      NEEDTOREGISTERUSER = true;  //it may be true here although they may already be registered, we just weren't told
                 }


                function getUrlVars()
                {
                    var vars = [], hash;
                    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
                    for(var i = 0; i < hashes.length; i++)
                    {
                        hash = hashes[i].split('=');
                        vars.push(hash[0]);
                        vars[hash[0]] = hash[1];
                    }
                    return vars;
                }
                

        },

        
      


      EstablishLayout: function() {
        var self = this;
          
          
       if(settings.calendar_view_default === 'agendaWeek'){   
          
            $(window).resize(function() {
              if(this.resizeTO) clearTimeout(this.resizeTO);
              this.resizeTO = setTimeout(function() {
                $(this).trigger('resizeEnd');
           }, 500);
          });  
            $(window).bind('resizeEnd', function() {
                //do something, window hasn't changed size in 500ms
                if($(this).width() < 500){
                  $('#calendar').fullCalendar( 'changeView', 'agendaDay' );
                  $('#calendar').fullCalendar('option', 'height', 420);
                }else if ($(this).width() >= 500){
                   $('#calendar').fullCalendar( 'changeView', 'agendaWeek' ); 
                }
            });  
    
            if($(window).width() < 500){
                  $('#calendar').fullCalendar( 'changeView', 'agendaDay' );
                  $('#calendar').fullCalendar('option', 'height', 420);
              }else{
                 $('#calendar').fullCalendar('option', 'height', 600); 
              }
       }
        
        
        self.CustomerLookup();
        
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
        //For customers coming back with an approved request
        
        if (PAYMENTJUMP === 1){
            $(settings.bookingRequestArea).empty();
            $(settings.bookingRequestArea).append('<h2 id="booking-heading">' + settings.Request_Heading + '</h2>');
            var myInstructions = '<div id="myinstructdiv" >' + 
                                '<p>' + settings.paymentrequestInstruct + '</p>' +
                                '</div>';
                $(settings.bookingRequestArea).append(myInstructions); 
                var QuoteButtonTable = '<table class="vb-buttonbox" style="width:60%"><tr class="vb-buttonrow"><td class="vb-buttoncell" id=nextbutter></td><td class="vb-buttoncell" id=cancelbutter></td></tr></table>';
                $(settings.bookingRequestArea).append(QuoteButtonTable); 
                       
                var mynext = '<button id="' + settings.bookingRequestButid3 + '" class="stripe-button-el" >' +  '<span style="display: block; min-height: 30px;">' +  settings.bookingRequestButText3 + '</span>' + '</button>' ;
                var mycancel = '<button id="' + settings.bookingRequestButid2 + '" class="stripe-button-el" >' +  '<span style="display: block; min-height: 30px;">' +  settings.bookingRequestButText2 + '</span>' + '</button>';         
                $('#nextbutter').append(mynext);            
                $('#cancelbutter').append(mycancel);  
        
                //set the eventlistener after the ajax successful request.
            
            ////////////////
         
             
               serviceurl = settings.serviceURL + 'vfeed-web/webresources/User/Request';
      
              //REQUESTID is set in previous customer lookup
              //Need MYPROPID,MYOWNERID BOOKING_START, BOOKING_END, MYTOTALPRICE(PENNIES)
              //Need to fix running_total_hours -- needs to be running total units
               $.ajax({
                url: serviceurl, 
                headers: { 'X-Auth-Token': SIMPLETOKEN },
               // data: email, subject(Reservation), content, link ?? maybe returned from prev call  
                data: {request_id: REQUESTID},
                processData:'true',
                dataType:"json", // set recieving type - JSON
                type:'GET', // set sending HTTP Request type 
                //async:false, 
                    //Request(int user_id, String min_dt_time, String max_dt_time, int property_id, int num_adults,int num_children, String request_pets, String request_info, int price_quote ) {
                    success: function(result) {              
                        MYPROPID = result.property_id;
                        var bookingstart = result.min_dt_time;
                        var C_IN_date = new Date(bookingstart);
                        var j = $.fullCalendar.moment.utc(C_IN_date);
                        BOOKING_START = j;
                         mystartdate =  j.format("YYYY-MM-DD"); //m.format("MM/DD/YYYY");
                         mystarttime =  j.format("hh:mm:ss");
           
                        
                        var bookingend = result.max_dt_time;
                        var C_OUT_date = new Date(bookingend);
                        var k = $.fullCalendar.moment.utc(C_OUT_date);
                        BOOKING_END = k;
                        myenddate =  k.format("YYYY-MM-DD");
                        myendtime =  k.format("hh:mm:ss");
                        MYTOTALPENNIES = result.price_quote;
                        MYTOTALPRICE = (MYTOTALPENNIES/100);
                        MYTOTALPRICE = MYTOTALPRICE.toFixed(2).replace(/./g, function(c, i, a) {
                            return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
                        }); 
                        
                    // alert("This is the jump in: Prop_id =" + MYPROPID + "Booking Start = " + BOOKING_START + " Booking End = " + BOOKING_END + " and price quote = $" + MYTOTALPRICE );
                    //go to agreement!
                    //Clicking to accept the quote
                            document.getElementById(settings.bookingRequestButid3).addEventListener("click", function(){
                                self.EstablishAgreement();
                            });

                            document.getElementById(settings.bookingRequestButid2).addEventListener("click", function(){
                                //quote cancel
                                self.CancelRequest();
                            });
                        
                        
                        
                        self.EstablishAgreement();
                        
                    },
                      error: function(result) { // if error occured
                       alert("error getting approved request for request id" + REQUESTID);
                     }
                });
       }
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

        else {
        
            $(settings.bookingRequestArea).empty();
            $(settings.bookingRequestArea).append('<h2 id="booking-heading">' + settings.Request_Heading + '</h2>');
            var myInstructions = '<div id="myinstructdiv" >' + 
                                '<p>' + settings.bookingrequestInstruct + '</p>' +
                                '</div>';
            $(settings.bookingRequestArea).append(myInstructions); 
       
      }
        
          
          //This bit of code helps reset the calendar if it's being loaded by the client and we don't 
          //control window timing - a bit of a hack but finally works.
          $(window).load(function() {
          $('#calendar').fullCalendar( 'gotoDate', 6/11/2015 );
          $('#calendar').fullCalendar( 'today');
          });  
      },


////////////////////////////////////////////////////////////////////////////////////////
//After setting calendar, customer and layout... this called from setcal -> select


    EstablishQuote: function(numberofunits,priceperunit,pricingmodel) {
        var self = this;
     
        
        var uniqid = Date.now();
        MYRSVTOKEN = settings.propertyid + "-" + uniqid;
        /////////////////////////////////
        
        var mydiscount_ammount = 0;
        var myunits = numberofunits;
        var mydiscount_ammount = 0;
        
        if (myunits <= 1){
                mydiscount_ammount = settings.corediscount1;
            }  else if (myunits === 1.5){
                mydiscount_ammount = settings.corediscount2;
            }else if (myunits === 2){
                mydiscount_ammount = settings.corediscount3;
            } else if (myunits === 2.5){
                mydiscount_ammount = settings.corediscount3;    
            } else if (myunits === 3){
                mydiscount_ammount = settings.corediscount4;
            } else if (myunits >= 3.5 && myunits < 6 ){
                mydiscount_ammount = settings.corediscount4;
            } else if (myunits === 6){
                mydiscount_ammount = settings.corediscount5;
            }else if (myunits >= 6.5 && myunits < 12 ){
                mydiscount_ammount = settings.corediscount5;
            } else if (myunits >= 12){
                mydiscount_ammount = settings.corediscount6;
            }
        
        
        //discount is applied per unit
        var discountperunit = 0;
        var mypriceperunit = 0;
         MYTOTALPRICE = 0;
        var test_priceperunit = 1.00;//priceperhour
        discountperunit = (priceperunit * (mydiscount_ammount / 100));
        //var result = (mydiscount_ammount / 100) * 10000;
        mypriceperunit = (priceperunit - discountperunit);
       
       
       //if units is hours then mytotalprice = mypriceperhour*number of hours...
       //if units is nights then mytotalprice = mypricepernight * number of nights or hours/24 ?
       
       
        MYTOTALPRICE = (mypriceperunit * numberofunits);
      
        
      
        //conditionally apply special discount
       
      if (MYLOCALCUSTOMERID !== null){
             if (settings.specialAdditive > 0) {
                MYTOTALPRICE = MYTOTALPRICE - (MYTOTALPRICE * (settings.specialAdditive/100));
            }
      }
       ////////////////////////////// 
       
      //  alert ("pennies = " + MYTOTALPENNIES);
        
        MYTOTALPRICE = MYTOTALPRICE.toFixed(2).replace(/./g, function(c, i, a) {
            return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
         }); 
        
        MYTOTALPENNIES = (MYTOTALPRICE*100);
        
        ////The booking variables------------------
        var user_start = BOOKING_START;
        var user_end = BOOKING_END;
        var C_IN_date = new Date(user_start);
        var C_OUT_date = new Date(user_end);
        
        var m = $.fullCalendar.moment.utc(C_IN_date);
        var n = $.fullCalendar.moment.utc(C_OUT_date);
           mystartdate =  m.format("YYYY-MM-DD"); //m.format("MM/DD/YYYY");
           mystarttime =  m.format("hh:mm");
           mystartcombo = m.format();
           myenddate =  n.format("YYYY-MM-DD");
           myendtime =  n.format("hh:mm");
           myendcombo = n.format();
        //////// ----------------------   
        
        
        $(settings.bookingRequestArea).empty();
        $(settings.bookingRequestArea).append('<h2 id="booking-heading">' + settings.Request_Heading + '</h2>');

         var QuoteButtonTable = '<table class="vb-buttonbox" style="width:60%"><tr class="vb-buttonrow"><td class="vb-buttoncell" id=nextbutter></td><td class="vb-buttoncell" id=cancelbutter></td></tr></table>';
    
      
        var mycontrols = '<div id="mycontroldiv" data-role="controlgroup" data-type="horizontal">' + 
                            '<p>' + "The number of " + settings.units + " you are booking is: " + numberofunits + '</p>' +
                            '<p>' + "The Cost for this booking will be: $" + MYTOTALPRICE + '</p>' +
                        '</div>';
        
        $(settings.bookingRequestArea).append(mycontrols); 
        $(settings.bookingRequestArea).append(QuoteButtonTable); 
                 
       var mynext = '<button id="' + settings.bookingRequestButid1 + '" class="stripe-button-el" >' +  '<span style="display: block; min-height: 30px;">' +  settings.bookingRequestButText1 + '</span>' + '</button>' ;
       var mycancel = '<button id="' + settings.bookingRequestButid2 + '" class="stripe-button-el" >' +  '<span style="display: block; min-height: 30px;">' +  settings.bookingRequestButText2 + '</span>' + '</button>';         
                 
         $('#nextbutter').append(mynext);            
         $('#cancelbutter').append(mycancel);  
        
        
        
        
        //Clicking to accept the quote
        document.getElementById(settings.bookingRequestButid1).addEventListener("click", function(){
            
          
            if(settings.requestflownum > 1){
               self.EstablishBookingRequest(); 
            }else
             self.EstablishAgreement();
        });
        
        document.getElementById(settings.bookingRequestButid2).addEventListener("click", function(){
            //quote cancel
            self.CancelRequest();
        });
        
        
        
      },
// $('#calendar').fullCalendar( 'removeEvents' [, 'Visfeed_Request' ] )

CancelRequest: function() {
    $('#calendar').fullCalendar('removeEvents','Visfeed_Request' );
    RUNNING_TOTAL_HOURS = 0;
    MYTOTALPRICE = 0;
    this.EstablishLayout();
    
},




//This is for the flow where a request is sent to the owner
 EstablishBookingRequest: function() {
  var self = this;
  
 
  
  //var bookinginfo = ("From: " +  mystartdate + " at: "  + mystarttime + " To: "  +  myenddate + " at: "  +  myendtime);
          
                 var requestmodal = '<div class="modal fade" id="RequestModal" tabindex="-1" role="dialog">' +
                                  '<div class="modal-dialog">'+
                                  '<div class="modal-content">'+
                                  
                                  '<div class="modal-header">'+
                                  '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                                  '<h4 class="modal-title">'+ "Booking Request" + '</h4>' +
                                   '<p id="propr_description">' + settings.property_description + '</p>'+
                                   '<p id="propr_from">' + "From: " + mystartdate + " at " + mystarttime + '</p>'+
                                   '<p id="propr_to">' + "To: " + myenddate+ " at " + myendtime + '</p>'+
                                   '<p id="propr_price">' + "Price Quote: $" + MYTOTALPRICE +  '</p>'+
                                  '</div>' +
                                   
                               '<div class="modal-body">'+
                                  
                                    '<p>' + settings.bookingdialogText + '</p>'+
                                    '<br>'+'</br>'+
                                    
                                    '<div class="Row">'+
                                    '<div class="col-sm-5">' +
                                       '<label for="InputFN2">First Name</label>' +
                                        '<input type="text" class="form-control" id="InputFN2" placeholder="First">'+
                                     '</div><!-- /.col-sm-5 -->' +
                                    '<div class="col-sm-5">'+
                                        '<label for="InputLN2">Last Name</label>' +
                                        '<input type="text" class="form-control" id="InputLN2" placeholder="Last">'+
                                     '</div><!-- /.col-sm-5 -->'+
                                   '</div><!-- /.row -->'+
                                    
                                    '<div class="Row">'+
                                    '<div class="col-sm-5">' +
                                       '<label for="InputEmail2">Email address</label>' +
                                        '<input type="email" class="form-control" id="InputEmail2" placeholder="Email">'+
                                     '</div><!-- /.col-sm-5 -->' +
                                    '<div class="col-sm-5">'+
                                        '<label for="InputMobile2">Mobile Number</label>' +
                                        '<input type="tel" class="form-control" id="InputPhone2" placeholder="555 555 5555">'+
                                     '</div><!-- /.col-sm-5 -->'+
                                    '</div><!-- /.row -->'+
                                 //  '</form>' +
                                   
                                   '<br>'+'</br>'+
                                     
                                      '<div class="Row">'+
                                            '<br>'+'</br>'+ //just create spce
                                      '</div>'+
                                      
                                       '<br>'+'</br>'+
                                         ////////////////        
                                        '<div class="Row">'+
                                         '<br>'+'</br>'+ //just create spce
                                                '<div class="col-sm-2">'+ 
                                                     '<label for="InputNumAdults">Number of Adults</label>' +    
                                                   '<input type="number" class="form-control" id="InputNumAdults" placeholder="Number of adults">' +
                                                '</div>' + 
                                        '</div>' +         
                                         
                                        '<div class="Row">'+
                                                '<div class="col-sm-2">'+ 
                                                    '<label for="InputNumKids">Number of Children</label>' +    
                                                  '<input type="number" class="form-control" id="InputNumKids" placeholder="Number of Children (12 and under)">' +
                                                '</div>' +  
                                        '</div>' +  
                                        
                                        '<br>'+'</br>'+
                                     
                                      '<div class="Row">'+
                                            '<br>'+'</br>'+ //just create spce
                                      '</div>'+
                                      
                                       '<br>'+'</br>'+
                                         ////////////////  
                                        
                                        '<div class="Row">'+
                                              '<div class="checkbox">' +
                                                '<label>' +
                                                 '<input type="checkbox" id="Inputchk2" value="">'+
                                                 ' Check if you plan to bring pets' +
                                                '</label>' +
                                              '</div>' +
                                         '</div>'+ //row     
                                            
                                        '<div class="Row">'+
                                              '<label for="InputExtra">Additional Info</label>' +  
                                              '<textarea class="form-control" id="InputExtra" rows="3"></textarea>' +
                                          '</div>'+ //row
                                ////////////
                                      
                                      '<div class="Row">'+
                                            '<br>'+'</br>'+ //just create spce
                                      '</div>'+
                                      
                                       '<br>'+'</br>'+
                                         ////////////////  
                                '<div class="Row">'+
                                            '<div class="col-sm-3">'+ 
                                              '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
                                            '</div>' +
                                           '<div class="col-sm-3">'+ 
                                              '<button type="button" class="btn btn-primary" id = "'+ "sendrequestbut" +'">Send Request</button>'+
                                            '</div>'+ 
                                            '<br>'+'</br>'+
                                       '</div>'+
                                       
                                    '</div>'+ //body
                              
                                 
                              '</div><!-- /.modal-content -->'+
                            '</div><!-- /.modal-dialog -->'+
                          '</div><!-- /.modal -->';

                            $('body').append(requestmodal);
                            
                     
                           if (MYCUSTOMEREMAIL !== null){
                               $('#InputEmail2').val(MYCUSTOMEREMAIL);
                           } 
                           if (MYCUSTOMERFNAME !== null){
                               $('#InputFN2').val(MYCUSTOMERFNAME);
                           } 
                           if (MYCUSTOMERLNAME !== null){
                               $('#InputLN2').val(MYCUSTOMERLNAME);
                           } 
                           if (MYCUSTOMERPHONE  !== null){
                               $('#InputPhone2').val(MYCUSTOMERPHONE);
                           } 
                   
                            //Clicking to send a booking request
                            document.getElementById('sendrequestbut').addEventListener("click", function(){
                                
                                self.SendBookingRequest();
                            });
                            
                            $('#RequestModal').modal('show');
                             $('#RequestModal').on('show.bs.modal', function (event) {
                              var modal = $(this);
                                modal.find('#propr_description').text(settings.property_description);
                                modal.find('#propr_from').text("From: " + mystartdate + " at " + mystarttime);
                                modal.find('#propr_to').text("To: " + myenddate+ " at " + myendtime );
                                modal.find('#propr_price').text("Price Quote: $" + MYTOTALPRICE);
                             });
                            
                            

      },


 SendBookingRequest: function() {
  var self = this;
  //call a service to send data to owner
     if(NEEDTOREGISTERUSER === true){
        //validate that fields are filled in
        //post a new user
        MYCUSTOMEREMAIL = $('#InputEmail2').val();
        MYCUSTOMERFNAME = $('#InputFN2').val();                     
        MYCUSTOMERLNAME = $('#InputLN2').val();
        MYCUSTOMERPHONE = $('#InputPhone2').val();
        
        
        
        
        //verify/Sanitize Phone number and email
      if(!valid_phonenumber(MYCUSTOMERPHONE)){
           alert("Phone number needs to be in the xxx-xxx-xxxx format");
           return;
      }
     
     if(!valid_email(MYCUSTOMEREMAIL)){
           alert("Please ensure email is in the correct format, address@domain.xxxx");
           return;
      }
      ///////////////////////////////////
        
        
        var myownerid = settings.ownerid;  
        var user_owner = myownerid;
        
        var user_fnm = MYCUSTOMERFNAME;
        var user_lnm = MYCUSTOMERLNAME;
        var user_mobile = MYCUSTOMERPHONE.toString();
        var user_email = MYCUSTOMEREMAIL;
        var NowDate = new Date();
        var user_userid = 0; //this user isn't created yet but the data needs to be there

        serviceurl2 = settings.serviceURL + 'vfeed-web/webresources/User/Register';
            $.ajax({
            url: serviceurl2, 
            headers: { 'X-Auth-Token': SIMPLETOKEN },
            //headers: { 'X-Auth-Token': MYTOKEN },

            data: JSON.stringify({Userid: user_userid, fName: user_fnm, lName: user_lnm, mobile: user_mobile,dateadded: NowDate, email: user_email, Owner_id: user_owner}),  
                                //int Userid,String fName, String lName,String mobile, String dateadded, String email, int Owner_id,int SESSAME_ID, String Code, String Durration, String min_time, String max_time, String Created_time

            processData:'false',
            contentType:'application/json',
            dataType:"json", // set recieving type - JSON in case of a question
            type:'POST', // set sending HTTP Request type
            async:false, 
            success: function(results) {             
                   //alert("New Visitor added");
                
                MYUSERID = results.newkey;
                NEEDTOREGISTERUSER = false;
                
                },
                error: function(results) { // if error occured
                    alert("error adding Customer");
                    return;
                 }
            });

       
       } 
        
        REQUEST_PETS = "No";
        REQUEST_NUM_ADULTS = $('#InputNumAdults').val();
        REQUEST_NUM_CHILDREN = $('#InputNumKids').val();
        REQUEST_EXTRA = $('#InputExtra').val();
        
     if($('#Inputchk2').prop('checked')){
         REQUEST_PETS = "Yes";
        }else{
         REQUEST_PETS = "No";
        }
    
        var mystartstring = (mystartdate + " at " + mystarttime );
        var myendstring = (myenddate + " at " + myendtime);
       serviceurl3 = settings.serviceURL + 'vfeed-web/webresources/User/Request';
            $.ajax({
            url: serviceurl3, 
            headers: { 'X-Auth-Token': SIMPLETOKEN },
            //headers: { 'X-Auth-Token': MYTOKEN },
            
            data: JSON.stringify({user_id:  MYUSERID, min_dt_time: mystartcombo, max_dt_time: myendcombo, property_id: settings.propertyid,num_adults: REQUEST_NUM_ADULTS, num_children: REQUEST_NUM_CHILDREN, request_pets: REQUEST_PETS, request_info: REQUEST_EXTRA, price_quote: MYTOTALPENNIES}),  
                                //int Userid,String fName, String lName,String mobile, String dateadded, String email, int Owner_id,int SESSAME_ID, String Code, String Durration, String min_time, String max_time, String Created_time
            processData:'false',
            contentType:'application/json',
            dataType:"json", // set recieving type - JSON in case of a question
            type:'POST', // set sending HTTP Request type
            async:false, 
            success: function(results) {             
                MYREQUESTID = results.newkey;
                MYREQUESTRAND = results.name;
                NEEDTOREGISTERUSER = false;
                //prep for sending email to owner with request 
                    serviceurl6 = settings.serviceURL + 'vfeed-web/webresources/User/OwnerEmailFromProperty';

                                $.ajax({
                                url: serviceurl6,
                                headers: { 'X-Auth-Token': SIMPLETOKEN },
                                //jQuery.get( url [, data ] [, success ] [, dataType ] )
                                data: {Property_id: settings.propertyid},
                                processData: 'true',
                                //contentType:'application/json',
                                dataType: "json", // set recieving type - "json" 
                                type: 'GET', // set sending HTTP Request type
                                async: false,
                                        success: function (result) {
                                            //should have email
                                          OWNEREMAIL = result.name; 
                                            
                                            //mylinkbase will serve as the approval request - post request id and answer
                                            var mylinkbase = (settings.serviceURL + 'vfeed-web/webresources/User/Approval');
                                            var myencoded_desc = encodeURIComponent(settings.property_description);
                                            serviceurl = settings.resourceURL +'mailmaid/webresources/Sender/Generalemail';
                                          
                                                     var mycontent = MYREQUESTID + "," + user_fnm + "," + user_lnm + "," + user_mobile + "," + user_email  + "," + REQUEST_NUM_ADULTS + "," + REQUEST_NUM_CHILDREN + "," +  REQUEST_PETS + "," + REQUEST_EXTRA + "," + mystartstring + "," + myendstring + "," + settings.propertyid + "," + MYTOTALPENNIES + "," + settings.jumpbackURL + "?requestid=" + MYREQUESTID + "." + MYREQUESTRAND + "," + myencoded_desc;
                                                        $.ajax({
                                                            url: serviceurl, 
                                                            //headers: { 'X-Auth-Token': SIMPLETOKEN },
                                                           // data: email, subject(Reservation), content, link ?? maybe returned from prev call  
                                                            data: {email: OWNEREMAIL ,subject: "Booking Request", content:mycontent, link:mylinkbase},
                                                            processData:'true',
                                                            dataType:"json", // set recieving type - JSON
                                                            type:'GET', // set sending HTTP Request type 
                                                            //async:false, 

                                                                success: function(result) { // callback method for further manipulations             
                                                                return false;
                                                                },
                                                                  error: function(result) { // if error occured
                                                                   alert("error Sending email to owner");
                                                                 }
                                                            });


                                           },
                                        error: function () { // if error occured getting Email
                                            // $('#prop_box1').append("</ul>");
                                            alert("error getting Owner Email");
                                            return;
                                        }
                               });
               
                },
                error: function(results) { // if error occured
                    alert("error adding Request");
                    return;
                 }
            });



            $(settings.bookingRequestArea).empty();
            $(settings.bookingRequestArea).append('<h2 id="thanks-heading">' + "Thanks!" + '</h2>');
            var myInstructions = '<div id="myinstructdiv" >' + 
                                '<p>' + settings.bookingdialogCompleteText + '</p>' +
                                '</div>';
            $(settings.bookingRequestArea).append(myInstructions); 



      $('#RequestModal').modal('hide');
     
            function valid_phonenumber(inputtxt) {
                    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                   return phoneno.test(inputtxt);
            }  

            function valid_email(inputemail){
                var myemail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return myemail.test(inputemail);
            }  

   
      },

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

 EstablishAgreement: function() {
  var self = this;
   
   
        
    if (settings.Agreement_required) {
       //Make the ajax call for the property's agreement
       
                     $.ajax({
                            url: settings.serviceURL + 'vfeed-web/webresources/User/Agreement',
                            headers: { 'X-Auth-Token': SIMPLETOKEN },
                            //jQuery.get( url [, data ] [, success ] [, dataType ] )
                            data: {Property_id: settings.propertyid},
                            processData: 'false',
                            //contentType:'application/json',
                            dataType: "json", // set recieving type - "json" 
                            type: 'GET', // set sending HTTP Request type
                            async: false,
                            success: function (result) {  
                                 MYAGREEMENT = result.Agreement;
                                
                                if (MYAGREEMENT !== null) {  //There is a required agreement
                                
                             //  $('#AgreementModalheader').html("");
                              // $('#AgreementModal').html("");
                              // alert("yo i'm in the success part of agrement" + MYTOTALPRICE);
                              // $('#AgreementModal').empty();
                               
                                AGREEMENTMODAL = '<div class="modal fade" id="AgreementModal" tabindex="-1" role="dialog">' +
                                  '<div class="modal-dialog">'+
                                  '<div class="modal-content">'+
                                  
                                  '<div class="modal-header" id="AgreementModalheader">'+
                                  '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                                  '<h4 class="modal-title">'+ settings.AgreementTitile + '</h4>' +
                                   '<p id="prop_description">' + settings.property_description + '</p>'+
                                   '<p id="prop_from">' + "From: " + mystartdate + " at " + mystarttime + '</p>'+
                                   '<p id="prop_to">' + "To: " + myenddate+ " at " + myendtime + '</p>'+
                                   '<p id="prop_price">' + "Price Quote: $" + MYTOTALPRICE +  '</p>'+
                                  '</div>' +
                                // alert("This is the jump in: Prop_id =" + MYPROPID + "Booking Start = " + BOOKING_START + " Booking End = " + BOOKING_END + " and price quote = " + MYTOTALPRICE );
                       
                               '<div class="modal-body">'+
                                   
                                  '<div class="Row">'+
                                    '<div class="col-sm-5">' +
                                       '<label for="InputFN1">First Name</label>' +
                                        '<input type="text" class="form-control" id="InputFN1" placeholder="First">'+
                                     '</div><!-- /.col-sm-5 -->' +
                                    '<div class="col-sm-5">'+
                                        '<label for="InputLN1">Last Name</label>' +
                                        '<input type="text" class="form-control" id="InputLN1" placeholder="Last">'+
                                     '</div><!-- /.col-sm-5 -->'+
                                   '</div><!-- /.row -->'+
                                    
                                    '<div class="Row">'+
                                    '<div class="col-sm-5">' +
                                       '<label for="InputEmail1">Email address</label>' +
                                        '<input type="email" class="form-control" id="InputEmail1" placeholder="Email">'+
                                     '</div><!-- /.col-sm-5 -->' +
                                    '<div class="col-sm-5">'+
                                        '<label for="InputMobile1">Mobile Number</label>' +
                                        '<input type="tel" class="form-control" id="InputPhone1" placeholder="555 555 5555">'+
                                     '</div><!-- /.col-sm-5 -->'+
                                    '</div><!-- /.row -->'+
                                 //  '</form>' +
                                   
                                   '<br>'+'</br>'+
                                     
                                      '<div class="Row">'+
                                            '<br>'+'</br>'+ //just create spce
                                      '</div>'+
                                      
                                      '<div class="Row">'+
                                            '<div class="col-sm-3">'+ 
                                              '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
                                            '</div>' +
                                            '<div class="col-sm-3">'+ 
                                              '<button type="button" class="btn btn-primary" id = "'+ settings.AgreementAccept1Butid +'">Agree</button>'+
                                            '</div>'+ 
                                            '<div class="col-sm-6">'+
                                            '<div class="checkbox">' +
                                              '<label>' +
                                                '<input type="checkbox" id="EsignBox"> Agree to electronic signature' +
                                              '</label>' +
                                            '</div>' +
                                          '</div>' +  
                                            '<br>'+'</br>'+
                                       '</div>'+
                                                 
                                        '<div class="Row">'+
                                         '<br>'+'</br>'+ //just create spce
                                        '</div>'+
                                                
                                    '</div>'+ //body
                              
                                  '<div class="modal-body">'+
                                    '<p>' + MYAGREEMENT + '</p>'+
                                //'<form class="form-inline">' + 
                                
                                  '</div>'+//footer
                              '</div><!-- /.modal-content -->'+
                            '</div><!-- /.modal-dialog -->'+
                          '</div><!-- /.modal -->';

                            $('body').append(AGREEMENTMODAL);
                            
                     
                           if (MYCUSTOMEREMAIL !== null){
                               $('#InputEmail1').val(MYCUSTOMEREMAIL);
                           } 
                           if (MYCUSTOMERFNAME !== null){
                               $('#InputFN1').val(MYCUSTOMERFNAME);
                           } 
                           if (MYCUSTOMERLNAME !== null){
                               $('#InputLN1').val(MYCUSTOMERLNAME);
                           } 
                           if (MYCUSTOMERPHONE  !== null){
                               $('#InputPhone1').val(MYCUSTOMERPHONE);
                           } 
                             
                            //Clicking to Agree to agreement
                            document.getElementById(settings.AgreementAccept1Butid).addEventListener("click", function(){
                               self.AcceptElectronicAgreement();
                            });
                            
                            jQuery('#AgreementModal').modal('show');

                             $('#AgreementModal').on('show.bs.modal', function (event) {
                              var modal = $(this);
                                modal.find('#prop_description').text(settings.property_description);
                                modal.find('#prop_from').text("From: " + mystartdate + " at " + mystarttime);
                                modal.find('#prop_to').text("To: " + myenddate+ " at " + myendtime );
                                modal.find('#prop_price').text("Price Quote: $" + MYTOTALPRICE);
                             });


                                }else { //There first result was null and there is no agreement on file
                                    return;
                                }
                              //} 
                                
                            }, //end of a non error result for an existing required agreement
                            error: function () { // if error occured
                                alert("error getting agreement");
                                return;
                            }
                        });
                           
                        //  document.getElementById(settings.AgreementAccept2Butid).addEventListener("click", function(){
                        //      self.AgreeToRentalTerms();
                        //  });

            }else{ //no agreement required by setting
                self.StripeRequest();  
            } 

            
      },






AcceptElectronicAgreement: function(){
    var self = this;

    //
    // I've already looked up for a user in Visbridge upon startup based on email
    // I previously set a global flag for need to register user
    // Now if needed I'll post a user 
    // the bottom line is I need a user record to send a confirmation to anyway
  
  
    if(NEEDTOREGISTERUSER === true){
        //validate that fields are filled in
        //post a new user
        MYCUSTOMEREMAIL = $('#InputEmail1').val();
        MYCUSTOMERFNAME = $('#InputFN1').val();                     
        MYCUSTOMERLNAME = $('#InputLN1').val();
        MYCUSTOMERPHONE = $('#InputPhone1').val();
        
        //verify/Sanitize Phone number and email
      if(!valid_phonenumber(MYCUSTOMERPHONE)){
           alert("Phone number needs to be in the xxx-xxx-xxxx format");
           return;
      }
     
     if(!valid_email(MYCUSTOMEREMAIL)){
           alert("Please ensure email is in the correct format, address@domain.xxxx");
           return;
      }
      
        ///////////////////////////////////
        
        
        var myownerid = settings.ownerid;  
        var user_owner = myownerid;
        
        var user_fnm = MYCUSTOMERFNAME;
        var user_lnm = MYCUSTOMERLNAME;
        var user_mobile = MYCUSTOMERPHONE.toString();
        var user_email = MYCUSTOMEREMAIL;
        var NowDate = new Date();
        var user_userid = 0; //this user isn't created yet but the data needs to be there

        serviceurl2 = settings.serviceURL + 'vfeed-web/webresources/User/Register';
            $.ajax({
            url: serviceurl2, 
            headers: { 'X-Auth-Token': SIMPLETOKEN },
            data: JSON.stringify({Userid: user_userid, fName: user_fnm, lName: user_lnm, mobile: user_mobile,dateadded: NowDate, email: user_email, Owner_id: user_owner}),  
                                //int Userid,String fName, String lName,String mobile, String dateadded, String email, int Owner_id,int SESSAME_ID, String Code, String Durration, String min_time, String max_time, String Created_time

            processData:'false',
            contentType:'application/json',
            dataType:"json", // set recieving type - JSON in case of a question
            type:'POST', // set sending HTTP Request type
            async:false, 
            success: function(results) {             
                   //alert("New Visitor added");
                
                MYUSERID = results.newkey;
                NEEDTOREGISTERUSER = false;
                return;
                },
                error: function(results) { // if error occured
                    alert("error adding Customer");
                    return;
                 }
            });

       
       } 
   
     var esigned = document.getElementById("EsignBox").checked;
     
     if(esigned === true){   
    
                
           
                MYSIG = (MYCUSTOMERFNAME + " " + MYCUSTOMERLNAME);

                serviceurl = settings.serviceURL + 'vfeed-web/webresources/User/Signature';
                $.ajax({
                   url: serviceurl,
                    headers: { 'X-Auth-Token': SIMPLETOKEN },
                    data: JSON.stringify({property_id: settings.propertyid, user_id: MYUSERID, Agreement: MYAGREEMENT, signature: MYSIG, address1: (settings.propertyid).toString()}), // serialized data to send on server

                    processData: 'false',
                    contentType: 'application/json',
                    dataType: "json", // set recieving type - JSON in case of a question
                    type: 'POST', // set sending HTTP Request type
                    async: false,
                    success: function (results) { // callback method for further manipulations             
                         $('#agreebox_crit').empty();
                     return;
                    },
                    error: function (results) { // if error occured
                        alert("error");
                        return;
                    }
                });

            //validate signature and go to payments
             $('#AgreementModal').modal('hide');
            //reset signature values
            document.getElementById("EsignBox").checked=false;
            self.Checkbooking(); //call checkbooking
       }
     
     
 function valid_phonenumber(inputtxt) {
        var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
       return phoneno.test(inputtxt);
}  
  
function valid_email(inputemail){
    var myemail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return myemail.test(inputemail);
}  
  
  
  
     
     
},

 StripeRequest: function() {
        var self = this;
        
        $(settings.bookingRequestArea).empty();
        $(settings.bookingRequestArea).append('<h2 id="booking-heading">' + settings.Request_Heading + '</h2>');
        var myInstructions = '<div id="myinstructdiv" >' + 
                            '<p>Thanks! To complete your booking, please choose the payment button below and follow instructions.</p>' +
                            '</div>';
        $(settings.bookingRequestArea).append(myInstructions);  
        
     var buttontable = '<table class="vb-buttonbox" style="width:60%"><tr><td class="vb-buttoncell" id=stripebutter></td><td class="vb-buttoncell" id=stripecancelbutter></td></tr></table>';
        
        //var buttontable = '<div id=buttonrow1><div id=stripebutter></div><div id=stripecancelbutter></div></div>';
               
               $(settings.bookingRequestArea).append("<br>");  
               $(settings.bookingRequestArea).append(buttontable); 
       
        var vbuybutton =  '<button id="' + "visfeedbuy"+ '" class="stripe-button-el" >' +  '<span style="display: block; min-height: 30px;">' + "Pay with card" + '</span>' + '</button>' ;
        var mycancelbutton =  '<button id="' + "stripecancelbut1"+ '" class="stripe-button-el" >' +  '<span style="display: block; min-height: 30px;">' + "Cancel" + '</span>' + '</button>' ;

        $('#stripecancelbutter').append(mycancelbutton); 
        $('#stripebutter').append(vbuybutton); 

        var myimage = (settings.stripe_data_image);
        
        
        document.getElementById('visfeedbuy').addEventListener("click", function(){
                           handler.open({
                                         name: settings.stripe_data_name,
                                         description: RUNNING_TOTAL_HOURS + " Total hours",
                                         amount: (MYTOTALPRICE * 100),
                                         'data-email': MYCUSTOMEREMAIL,
                                         image: myimage,
                                         locale: 'auto',
                                         key: settings.stripe_data_key
                                         
                                       });
                                // e.preventDefault();
                     });
     
     document.getElementById('stripecancelbut1').addEventListener("click", function(){
                      self.CancelRequest();
                  });
       ///changing from simple to custom! 
       ////////////////////////////////////////////////////////////// 
      
     var handler = StripeCheckout.configure({
                   
                   token: function(token) {
                     // You can access the token ID with `token.id`
                     //  alert("some stuff here?" + token.email + " and id is: " + token.id + " amount: " + token.amount );
         //post payment //////////////////////////////////////
                     var user_start = BOOKING_START;
                     var C_IN_date = new Date(user_start);
                     var j = $.fullCalendar.moment.utc(C_IN_date);
                     var mystartdatetime =  j.format(); //m.format("MM/DD/YYYY");
                     var mydatapack = (MYRSVTOKEN + "," + mystartdatetime + "," + settings.propertyid );  
                  
                  
                  
                   var myammount = MYTOTALPRICE * 100;
                                                //'/Sesamebot-web/webresources/User/Payment'
                                                //'/Visfeed/webresources/Stripe/Payment'
                   serviceurl2 = settings.serviceURL + 'vfeed-web/webresources/Stripe/Payment';
                                   $.ajax({
                                     url: serviceurl2,
                                     headers: { 'X-Auth-Token': SIMPLETOKEN, 'Vb-Datapack':mydatapack },
                                    
                                     data: JSON.stringify({token:token.id, ammount:myammount, tokentype:"card",stripeEmail:MYCUSTOMEREMAIL,ownerid:MYOWNERID}),  // serialized data to send on server
                                     processData:'false',
                                     contentType:'application/json',
                                     dataType:"json", // set recieving type - JSON in case of a question
                                     type:'POST', // set sending HTTP Request type
                                     async:false, 
                                     success: function(results) { // callback method for further manipulations             
                                         //
                                         $(settings.bookingRequestArea).empty();
                                         $(settings.bookingRequestArea).append('<h2 id="booking-heading">' + "Thank you for your payment." + '</h2>');
                                         
                                         myInstructions = '<div id="myinstructdiv" >' + 
                                        '<p>' + settings.bookingdialogCompleteText + '</p>' +
                                        '</div>';
                                        $(settings.bookingRequestArea).append(myInstructions);
                                
                                         //checkbooking looks for last minute changes and then calls processbooking
                                         self.Processbooking();
                                
                                         return;
                                         },
                                         error: function(results) { // if error occured
                                             alert("system error posting payment - maybe nothing wrong with card");
                                             return;
                                          }
                                     });
                               }
                             });

                  
      },
 
 StripeRequestAuto: function() {
        //This was requested by client - to go directly to stripe interface after agreement signature
     
        var self = this;
        var myimage = (settings.stripe_data_image);
        
       
           
        var handler = StripeCheckout.configure({
                   
                   token: function(token) {
                     // You can access the token ID with `token.id`
                     //
                     //
                     var user_start = BOOKING_START;
                     var C_IN_date = new Date(user_start);
                     var j = $.fullCalendar.moment.utc(C_IN_date);
                     var mystartdatetime =  j.format(); //m.format("MM/DD/YYYY");
                     var mydatapack = (MYRSVTOKEN + "," + mystartdatetime + "," + settings.propertyid );    
                   
                   var myammount = MYTOTALPRICE * 100;
                                                //'/Sesamebot-web/webresources/User/Payment'
                                                //'/Visfeed/webresources/Stripe/Payment'
                   serviceurl2 = settings.serviceURL + 'vfeed-web/webresources/Stripe/Payment';
                                   $.ajax({
                                     url: serviceurl2, 
                                     headers: { 'X-Auth-Token': SIMPLETOKEN, 'Vb-Datapack':mydatapack },
                                     data: JSON.stringify({token:token.id, ammount:myammount, tokentype:"card",stripeEmail:MYCUSTOMEREMAIL,ownerid:MYOWNERID}),  // serialized data to send on server
                                     processData:'false',
                                     contentType:'application/json',
                                     dataType:"json", // set recieving type - JSON in case of a question
                                     type:'POST', // set sending HTTP Request type
                                     async:false, 
                                     success: function(results) { // callback method for further manipulations             
                                         //
                                         $(settings.bookingRequestArea).empty();
                                         $(settings.bookingRequestArea).append('<h2 id="booking-heading">' + "Thank you for your payment." + '</h2>');
                                         
                                         myInstructions = '<div id="myinstructdiv" >' + 
                                        '<p>' + settings.bookingdialogCompleteText + '</p>' +
                                        '</div>';
                                        $(settings.bookingRequestArea).append(myInstructions);
                                        
                                         //checkbooking looks for last minute changes and then calls processbooking
                                         self.Processbooking();
                                
                                         return;
                                         },
                                         error: function(results) { // if error occured
                                             alert("system error posting payment - maybe nothing wrong with card");
                                             return;
                                          }
                                     });
                               }
                             });
    var go = AutoPay();
    
         
     function AutoPay() {
                           handler.open({
                                         name: settings.stripe_data_name,
                                         description: RUNNING_TOTAL_HOURS + " Total hours",
                                         amount: (MYTOTALPRICE * 100),
                                         'data-email': MYCUSTOMEREMAIL,
                                         image: myimage,
                                         locale: 'auto',
                                         key: settings.stripe_data_key
                                         
                                       });
                                // e.preventDefault();
                     };
     
      
     
                  
      },
 
 
 
 
 Checkbooking: function() {
    //Durring payment processing  - Check to see if a booking exists with the same start date/time first
    //this is a fail safe to prevent douple bookings as we don't know how long 
    //a person might have waited before commiting the booking.
    //
        var self = this;
        
        MYPROPID = settings.propertyid;
        var user_start = BOOKING_START;
        var user_end = BOOKING_END;
        var C_IN_date = new Date(user_start);
        var C_OUT_date = new Date(user_end);
        
        var MYCHECKIN_DATE = GetDatePart(C_IN_date);
        var MYCHECKOUT_DATE = GetDatePart(C_OUT_date);
        
        var MYCHECKIN_TIME = GetTimePart(C_IN_date);
        var MYCHECKOUT_TIME = GetTimePart(C_OUT_date);
        var NowDate = new Date();
     
     
     serviceurl6 = settings.serviceURL + 'vfeed-web/webresources/CalendarEvents/Conflicts';
                                             
                                             $.ajax({
                                            url: serviceurl6,
                                            headers: { 'X-Auth-Token': SIMPLETOKEN },
                                            data: JSON.stringify({user_id: 0, title: "", user_lname: "", user_mobile_phone: "", user_email: "", durration:20, min_time:MYCHECKIN_TIME, max_time:MYCHECKOUT_TIME, end:MYCHECKOUT_DATE, start:MYCHECKIN_DATE,created_time:NowDate,property_id:MYPROPID}),  // serialized data to send on server
                                                                //int Userid,String fName, String lName,String mobile, String dateadded, String email, int Owner_id,int SESSAME_ID, String Code, String Durration, String min_time, String max_time, String Created_time

                                            processData:'false',
                                            contentType:'application/json',
                                            dataType:"json", // set recieving type - JSON in case of a question
                                            type:'POST', // set sending HTTP Request type
                                            async:false, 
                                            success: function(results) {
                                                 //if results(conflict > 0) then alert and send to beginning
                                                 var myresult = results.newkey;
                                                 if (myresult > 0){
                                                    alert("Another booking was recently confirmed that conflicts with this one. It was likely in process during the time of your selection. Please try another time slot."); 
                                                    self.CancelRequest();
                                                    }else{
                                                 
                                                    //Test Mode - for general testing in testmode, set the
                                                    //self.StripeRequestAuto() to self.ProcessBooking to bypass
                                                    //charges against production
                                                    
                                                    //self.Processbooking(); 
                                                     self.StripeRequestAuto(); 
                                                     
                                                    }
                                                },
                                             error: function () { // if error occured getting access type
                                                 // $('#prop_box1').append("</ul>");
                                                 alert("error assessing conflicts.");
                                                 
                                                 self.StripeRequestAuto(); 
                                             }
                                            });//Door Access type and info Ajax calls 


        function GetDatePart(date) {
            var str = '';
            var year, month,day;
            year = date.getUTCFullYear();
            month = date.getUTCMonth() + 1;
            month = month < 10 ? '0' + month : month;
            day = date.getUTCDate();
            day = day < 10 ? '0' + day : day;
        
            str += year + '-' + month + '-' + day;

            return str;
        }


        function GetTimePart(date) {
            var str2 = '';
            var hour, min, secs;
            hour = date.getUTCHours();
            hour = hour < 10 ? '0' + hour : hour;
            min = date.getUTCMinutes();
            min = min < 10 ? '0' + min : min;
            secs = date.getUTCSeconds();
            secs = secs < 10 ? '0' + secs : secs;
            str2 += hour + ':' + min + ':' + secs;
            
            return str2;
        }  

 },
 
 
 
 //Here is the booking //
 
 Processbooking: function() {
    
      var self = this;
      
        var user_fnm = MYCUSTOMERFNAME;
        var user_lnm = MYCUSTOMERLNAME;
        var user_mobile = MYCUSTOMERPHONE;
        var user_email = MYCUSTOMEREMAIL;
        var user_userid = MYUSERID;
        var user_durration = '20';  //Durration should be on permanent codes "all wednesdays"
        MYPROPID = settings.propertyid;
        MYCURRENTCODE = '';
        var user_start = BOOKING_START;
        var user_end = BOOKING_END;
        var C_IN_date = new Date(user_start);
        var C_OUT_date = new Date(user_end);
        
        var m = $.fullCalendar.moment.utc(C_IN_date);
        var n = $.fullCalendar.moment.utc(C_OUT_date);
           mystartdate =  m.format("YYYY-MM-DD"); //m.format("MM/DD/YYYY");
           mystarttime =  m.format("HH:mm:ss");
           mystartcombo = m.format();
           myenddate =  n.format("YYYY-MM-DD");
           myendtime =  n.format("HH:mm:ss");
           myendcombo = n.format();
        //var MYCHECKIN_DATE = GetDatePart(C_IN_date);
       // var MYCHECKOUT_DATE = GetDatePart(C_OUT_date);
        
       // var MYCHECKIN_TIME = GetTimePart(C_IN_date);
      //  var MYCHECKOUT_TIME = GetTimePart(C_OUT_date);
      
      
        var NowDate = new Date();
        
     //--> Add booking to the database
        //but check to see if a booking exists with the same start date/time first
        //this is a fail safe to prevent douple bookings as we don't know how long 
        //a person might have waited befor commiting the booking.
        //We have to look for same start times, but pottentially someone could book over the whole day
        //what we really need is to see if there's a conflict??
     
        serviceurl2 = settings.serviceURL + 'vfeed-web/webresources/User/Booking';
            $.ajax({
            url: serviceurl2, 
            headers: { 'X-Auth-Token': SIMPLETOKEN },
           
            data: JSON.stringify({user_id: user_userid, title: user_fnm, user_lname: user_lnm, user_mobile_phone: user_mobile, user_email: user_email, durration:user_durration, min_time:mystarttime, max_time:myendtime, end:myenddate, start:mystartdate,created_time:NowDate,property_id:MYPROPID}),  // serialized data to send on server
                                //int Userid,String fName, String lName,String mobile, String dateadded, String email, int Owner_id,int SESSAME_ID, String Code, String Durration, String min_time, String max_time, String Created_time

            processData:'false',
            contentType:'application/json',
            dataType:"json", // set recieving type - JSON in case of a question
            type:'POST', // set sending HTTP Request type
            async:false, 
            success: function(doc) {             

               var myevents = [];
                          for (var i in doc.events) {
                                   //id,allday,start,end,title,description,durration,phone,email 
                                    myevents.push({
                                         id: doc.events[i].id,
                                         allday:"",
                                         start: doc.events[i].start,
                                         end: doc.events[i].end,
                                         title: doc.events[i].title,
                                         description: "",
                                         durration: "",
                                         phone:"",
                                         email:""
                                        });  
                                     
                                  }  
     
      //--> Write out the iCal          
                MYTOKEN = settings.ownerid + ":" + settings.propertyid;
                             serviceurl3 = settings.serviceURL + 'vfeed-web/webresources/User/ICal'; //+ "?Property_id = " + MYPROPID + "&Owner_id = " + settings.ownerid
                                $.ajax({
                                    url: serviceurl3, 
                                    headers: { 'X-Auth-Token': SIMPLETOKEN, 'Vb-Datapack': MYTOKEN},
                                   
                                   // headers: { 'Property_id': MYPROPID,'Owner_id':settings.ownerid  },
                                    data: JSON.stringify(myevents),  

                                    processData:'false',
                                    contentType:'application/json',
                                    dataType:"json", // set recieving type - JSON in case of a question
                                    type:'POST', // set sending HTTP Request type
                                    async:true, 
                                    //A successful booking and update
                                success: function(resp) { 
                                   var myresult = resp.newkey;
                                   //alert(myresult);
                             //--> Create the lock code based on access type   //!! Here you have to create a confirmation too! *********************************       
                                        //********************************************************************************   
                                   //Validate A successful file write
                                    if (myresult === 1){
                                         
                                            //get lock pref and settings first
                                            serviceurl6 = settings.serviceURL + 'vfeed-web/webresources/User/Accesstype';
                                                mystartdate =  m.format("MM/DD/YYYY");
                                                mystarttime =  m.format("HH:mm a");
                                                myenddate =  n.format("MM/DD/YYYY");
                                                myendtime =  n.format("HH:mm a");
                                                mycurrentcode = "";
                                                
                                             $.ajax({
                                             url: serviceurl6,

                                             headers: { 'X-Auth-Token': SIMPLETOKEN },
                                             //jQuery.get( url [, data ] [, success ] [, dataType ] )
                                             data: {Property_id: MYPROPID},
                                             processData: 'true',
                                             //contentType:'application/json',
                                             dataType: "json", // set recieving type - "json" 
                                             type: 'GET', // set sending HTTP Request type
                                             async: false,
                                             success: function (doc) {
                                                 for (var i in doc.prefs) {
                                                    MY_CURRENT_ACCESS_TYPE = doc.prefs[i].prefsetting;
                                                    mylockModel = doc.prefs[i].prefparm1;
                                                    mylockSerial = doc.prefs[i].preflocal;
                                                    mylockuser = doc.prefs[i].prefparm2;
                                                    mylockpw = doc.prefs[i].prefparm3;
                                                    }
                                                },
                                             error: function () { // if error occured getting access type
                                                 // $('#prop_box1').append("</ul>");
                                                 alert("error getting Access preference");
                                             }
                                            });//Door Access type and info Ajax calls 

                                            //get code - The lock knows it's in eastern time zone so just pass time as entered!!
                                            //here we might have more lock types in the future.
                                            
                      
                                            var go = GetErentalCode(mylockuser, mylockpw, mylockModel, mylockSerial, mystartdate,myenddate,mystarttime,myendtime,user_fnm);
                                          //  alert(MYCURRENTCODE);
                                          //********************************************************************************   
                                          
                                           var user_Reservation_id = MYRSVTOKEN;//(settings.ownerid + "-" + user_userid); //this is kinda dumb - should include property and date??

                                            //mystarttime =  GetTimePretty(C_IN_date);
                                           // myendtime =  GetTimePretty(C_OUT_date);
                                           mystarttime =  m.format("h:mm a");
                                           myendtime =  n.format("h:mm a"); 
                                           
                                            serviceurl12 = settings.serviceURL + 'vfeed-web/webresources/User/Confirmation';
                                            $.ajax({
                                               url: serviceurl12,
                                               headers: { 'X-Auth-Token': SIMPLETOKEN },
                                               data: JSON.stringify({Userid: user_userid, fName: user_fnm, lName: user_lnm, mobile: user_mobile,dateadded: NowDate, email: user_email, Owner_id: settings.ownerid,Reservation_ID:user_Reservation_id,Code:MYCURRENTCODE,AC_type:MY_CURRENT_ACCESS_TYPE, Durration:user_durration, min_time: mystarttime, max_time: myendtime, max_date:myenddate, min_date:mystartdate,Created_time:NowDate,property_id:MYPROPID}),  

                                               processData:'false',
                                               contentType:'application/json',
                                               dataType:"json", // set recieving type - JSON in case of a question
                                               type:'POST', // set sending HTTP Request type
                                               async:true, 

                                                   success: function(result) {          
                                                     //  alert ('Text Confirmation Sent');
                                                     var mynewlink = result.name;
                                                     serviceurl = settings.resourceURL +'mailmaid/webresources/Sender/GeneralemailMP';
                                                     var mycontent = user_fnm + "," + user_Reservation_id + "," + mystartdate + "," + mystarttime  + "," + myenddate + "," + myendtime + "," + MYCURRENTCODE + "," + mystartcombo + "," + myendcombo + "," + settings.Confirmation_BusName + "," + settings.Confirmation_Email_from;
                                                        $.ajax({
                                                            url: serviceurl,
                                                           // headers: { 'X-Auth-Token': SIMPLETOKEN },
                                                            data: {email: user_email ,subject: "Reservation", content:mycontent, link:mynewlink},
                                                            processData:'true',
                                                            dataType:"json", // set recieving type - JSON
                                                            type:'GET', // set sending HTTP Request type 
                                                            //async:false, 

                                                             success: function(result) { // callback method for further manipulations             
                                                                  
                                                                },
                                                                  error: function(result) { // if error occured
                                                                  //  alert("error on sending of email");
                                                                 }
                                                            });
                                                      
                                                       return;

                                                     },
                                                     error: function() { // if error occured
                                                        // $('#prop_box1').append("</ul>");
                                                       alert ('Error sending confirmation');
                                                      }
                                                }); 
                                           
                                           
                                       }else{
                                           alert("There was a problem scheduling your booking. Please try another time.");
                                       }
                                       
                                    },//successful creation of ical

                                    error: function() {
                                         alert('error writing stupid local ics files!');
                                    } //error for ical creation

                                   });//ajax for icals
                
                return;
                
                }, // end of success at creating the booking 
                error: function(results) { // if error occured
                    alert("error adding event");
                    return;
                 } //end of error creating booking
            }); //end of creating a booking
    
    
        
        
        
        function GetErentalCode(mylockuser, mylockpw, mylockModel, mylockSerial, mystartdate,myenddate,mystarttime,myendtime,myguestfname) {
            serviceurl99 = settings.serviceURL + 'vfeed-web/webresources/User/AccessCode';
            var mycurrentcode = '';
               $.ajax({
                   url: serviceurl99,
                   headers: { 'X-Auth-Token': SIMPLETOKEN },
                  // headers: { 'X-Auth-Token': MYTOKEN },
                   //jQuery.get( url [, data ] [, success ] [, dataType ] )
                   //String lockModel, String serial, String min_date, String max_date,String min_time, String max_time, String fname,String createdTime ) {
                   data: JSON.stringify({username:mylockuser,userpw: mylockpw,lockModel:mylockModel,serial:mylockSerial,min_date: mystartdate,max_date:myenddate,min_time:mystarttime,max_time:myendtime,fname:myguestfname,createdTime: Date.now()}),
                   processData: 'false',
                   contentType:'application/json',
                   dataType:"json", // set recieving type - JSON in case of a question
                   type: 'POST', // set sending HTTP Request type
                   async: false,
                   success: function (result) {
                         if (result !== null){
                                 MYCURRENTCODE = result.name;
                               return;
                          }
                    },
                   error: function () { // if error occured
                       // $('#prop_box1').append("</ul>");
                       alert("Error creating door code for confirmation");
                   }
               });
               }

        }
 
 
 
   
    };
    $('#calendar').fullCalendar('render');
    visfeed.init();
    
  };
}(window.jQuery);


