<?php
/*
Plugin Name: Visfeed
Plugin URI:  http://www.visbridge.com
Description: Resource calendar availability and payments for vacation rentals and more.
Version:     1.2.2
Author:      Visbridge
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html


Visfeed is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.
 
Visfeed is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License
along with {Plugin Name}. If not, see {License URI}.
*/
//A great explanation and pattern for WP plugin
//http://www.presscoders.com/wordpress-settings-api-explained/
//
// Specify Hooks/Filters
register_activation_hook(__FILE__, 'visfeed_add_defaults_fn');

add_action('admin_init', 'visfeed_options_init_fn' );
add_action('admin_menu', 'visfeed_options_add_page_fn');
add_action( 'wp_enqueue_scripts', 'add_visfeed_scripts' );
add_shortcode( 'visfeed_cal', 'visfeed_calendar_func' );

// Define default option settings on activation
function visfeed_add_defaults_fn() {
	$tmp = get_option('visfeed_Plugin_options');
        if(($tmp['visfeed_RestoreDef_chk1']=='on')||(!is_array($tmp))) {
		$arr = array("visfeed_Token_text_string" => "go to visbridge.com", "visfeed_Ownerid_text_string" => "263","visfeed_Instructbox_id"=> "#bookingRequest", "visfeed_bookingrequestInstruct_text" => "Click and drag to create a single booking request. On mobile, touch and hold to select, rotate to change views.","visfeed_bookingdialogText_text" => "This Request will be processed immediately and a confirmation will be sent to your mobile phone.","visfeed_bookingdialogCompleteText_text" => "Your confirmation will be texted to you along with your door access code.", "visfeed_RestoreDef_chk1" => "on","visfeed_CalendarDiv_chk" => "on","visfeed_InstructDiv_chk" => "on","visfeed_InstructPicker_chk" => "on", "visfeed_stripe_data_name" => "Visbridge","visfeed_stripe_data_image" => "http://image location for your logo","visfeed_Confirmation_BusName" => "Visbridge", "visfeed_Confirmation_Email_from" => "admin@visbridge.com" );
		update_option('visfeed_Plugin_options', $arr);
       }
       
}



// Register our settings. Add the settings section, and settings fields
function visfeed_options_init_fn(){
	register_setting('visfeed_plugin_options_grp', 'visfeed_Plugin_options', 'plugin_options_validate' );
	add_settings_section('main_section', 'Main Settings', 'visfeed_section_text_fn', __FILE__);
	
        
        add_settings_field('visfeed_Token_text_string', 'Unique Token', 'visfeed_setting3_string_fn', __FILE__, 'main_section');
	add_settings_field('visfeed_Ownerid_text_string', 'Owner ID', 'visfeed_setting4_string_fn', __FILE__, 'main_section');
	add_settings_field('visfeed_Instructbox_id', 'Instruction box ID', 'visfeed_setting10_string_fn', __FILE__, 'main_section');
	
        add_settings_field('visfeed_CalendarDiv_chk', 'Load Default Calendar div', 'visfeed_setting_chk3_fn', __FILE__, 'main_section');
        add_settings_field('visfeed_InstructDiv_chk', 'Load Default Instructions div', 'visfeed_setting_chk4_fn', __FILE__, 'main_section');
        add_settings_field('visfeed_InstructPicker_chk', 'Include Manual date picker', 'visfeed_setting_chk5_fn', __FILE__, 'main_section');
        
        
        add_settings_field('visfeed_bookingrequestInstruct_text', 'Booking Request Instructions', 'visfeed_setting_textarea1_fn', __FILE__, 'main_section');
        add_settings_field('visfeed_bookingdialogText_text', 'Booking Dialog', 'visfeed_setting_textarea2_fn', __FILE__, 'main_section');
        add_settings_field('visfeed_bookingdialogCompleteText_text', 'Booking Complete', 'visfeed_setting_textarea3_fn', __FILE__, 'main_section');
        add_settings_field('visfeed_paymentInstruct_text', 'Payment Instructions', 'visfeed_setting_textarea4_fn', __FILE__, 'main_section');
        
        
        //add_settings_field('visfeed_CSSLoad_chk', 'Load Default CSS', 'visfeed_setting_chk2_fn', __FILE__, 'main_section');
	add_settings_field('visfeed_RestoreDef_chk1', 'Restore Defaults Upon Reactivation?', 'visfeed_setting_chk1_fn', __FILE__, 'main_section');
        
        add_settings_field('visfeed_stripe_data_name', 'Business Name', 'visfeed_setting5_string_fn', __FILE__, 'main_section');
	add_settings_field('visfeed_stripe_data_image', 'Stripe Image URL', 'visfeed_setting6_string_fn', __FILE__, 'main_section');
	add_settings_field('visfeed_Confirmation_BusName', 'Confirmation From:', 'visfeed_setting7_string_fn', __FILE__, 'main_section');
	add_settings_field('visfeed_Confirmation_Email_from', 'Business Email', 'visfeed_setting8_string_fn', __FILE__, 'main_section');
	
        
}

// Add sub page to the Settings Menu
function visfeed_options_add_page_fn() {
	add_options_page('Visfeed Options', 'Visfeed Options', 'administrator', __FILE__, 'visfeed_options_page_fn');
}

// ************************************************************************************************************

// Callback functions

// Section HTML, displayed before the first option
function  visfeed_section_text_fn() {
	echo '<p>The following are Visfeed global defaults.  Please see shortcodes parameters to change settings for each calendar you add.</p>';
        echo '<p>To create your unique token and Owner ID, please create an account at Visbridge.com.</p>';
        echo '<a href="https://www.visbridge.com/Gpres/register" target="_blank">Register for a resource calendar</a>';
        
        
}




// TEXTBOX - Name: visfeed_Plugin_options[visfeed_Token_text_string]
function visfeed_setting3_string_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<input id='visfeed_Token_text_string' name='visfeed_Plugin_options[visfeed_Token_text_string]' size='30' type='text' value='{$options['visfeed_Token_text_string']}' />";
}

// TEXTBOX - Name: visfeed_Plugin_options[visfeed_Ownerid_text_string]
function visfeed_setting4_string_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<input id='visfeed_Ownerid_text_string' name='visfeed_Plugin_options[visfeed_Ownerid_text_string]' size='20' type='text' value='{$options['visfeed_Ownerid_text_string']}' />";
}


// TEXTBOX - Name: visfeed_Plugin_options[visfeed_Ownerid_text_string]
function visfeed_setting10_string_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<input id='visfeed_Instructbox_id' name='visfeed_Plugin_options[visfeed_Instructbox_id]' size='20' type='text' value='{$options['visfeed_Instructbox_id']}' />";
}


// CHECKBOX - Name: visfeed_Plugin_options[visfeed_RestoreDef_chk1]
function visfeed_setting_chk1_fn() {
	$options = get_option('visfeed_Plugin_options');
	if($options['visfeed_RestoreDef_chk1']) { $checked = ' checked="checked" '; }
	echo "<input ".$checked." id='visfeed_plugin_chk1' name='visfeed_Plugin_options[visfeed_RestoreDef_chk1]' type='checkbox' />";
}

// CHECKBOX - Name: visfeed_Plugin_options[visfeed_CSSLoad_chk]
//function visfeed_setting_chk2_fn() {
//	$options = get_option('visfeed_Plugin_options');
//	if($options['visfeed_CSSLoad_chk']) { $checked = ' checked="checked" '; }
//	echo "<input ".$checked." id='visfeed_plugin_chk2' name='visfeed_Plugin_options[visfeed_CSSLoad_chk]' type='checkbox' />";
//}


// CHECKBOX - Name: visfeed_Plugin_options[visfeed_CalendarDiv_chk]
function visfeed_setting_chk3_fn() {
	$options = get_option('visfeed_Plugin_options');
	if($options['visfeed_CalendarDiv_chk']) { $checked = ' checked="checked" '; }
	echo "<input ".$checked." id='visfeed_plugin_chk3' name='visfeed_Plugin_options[visfeed_CalendarDiv_chk]' type='checkbox' />";
}

// CHECKBOX - Name: visfeed_Plugin_options[visfeed_InstructDiv_chk]
function visfeed_setting_chk4_fn() {
	$options = get_option('visfeed_Plugin_options');
	if($options['visfeed_InstructDiv_chk']) { $checked = ' checked="checked" '; }
	echo "<input ".$checked." id='visfeed_plugin_chk4' name='visfeed_Plugin_options[visfeed_InstructDiv_chk]' type='checkbox' />";
}
// CHECKBOX - Name: visfeed_Plugin_options[visfeed_InstructDiv_chk]
function visfeed_setting_chk5_fn() {
	$options = get_option('visfeed_Plugin_options');
	if($options['visfeed_InstructPicker_chk']) { $checked = ' checked="checked" '; }
	echo "<input ".$checked." id='visfeed_plugin_chk5' name='visfeed_Plugin_options[visfeed_InstructPicker_chk]' type='checkbox' />";
}



////////Instructions////////////////

// TEXTAREA - Name: plugin_options[visfeed_bookingrequestInstruct_text]
function visfeed_setting_textarea1_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<textarea id='visfeed_bookingrequestInstruct_text' name='visfeed_Plugin_options[visfeed_bookingrequestInstruct_text]' rows='7' cols='50' type='textarea'>{$options['visfeed_bookingrequestInstruct_text']}</textarea>";
}

// TEXTAREA - Name: plugin_options[visfeed_bookingrequestInstruct_text]
function visfeed_setting_textarea2_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<textarea id='visfeed_bookingrequestInstruct_text' name='visfeed_Plugin_options[visfeed_bookingdialogText_text]' rows='7' cols='50' type='textarea'>{$options['visfeed_bookingdialogText_text']}</textarea>";
}

// TEXTAREA - Name: plugin_options[visfeed_bookingdialogCompleteText_text]
function visfeed_setting_textarea3_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<textarea id='visfeed_bookingdialogCompleteText_text' name='visfeed_Plugin_options[visfeed_bookingdialogCompleteText_text]' rows='7' cols='50' type='textarea'>{$options['visfeed_bookingdialogCompleteText_text']}</textarea>";
}

// TEXTAREA - Name: plugin_options[visfeed_paymentInstruct_text]
function visfeed_setting_textarea4_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<textarea id='visfeed_paymentInstruct_text' name='visfeed_Plugin_options[visfeed_paymentInstruct_text]' rows='7' cols='50' type='textarea'>{$options['visfeed_paymentInstruct_text']}</textarea>";
}



///////////////////////////////////
// TEXTBOX - Name: visfeed_Plugin_options[visfeed_stripe_data_name]
function visfeed_setting5_string_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<input id='visfeed_stripe_data_name' name='visfeed_Plugin_options[visfeed_stripe_data_name]' size='40' type='text' value='{$options['visfeed_stripe_data_name']}' />";
}

// TEXTBOX - Name: visfeed_Plugin_options[visfeed_stripe_data_image]
function visfeed_setting6_string_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<input id='visfeed_stripe_data_image' name='visfeed_Plugin_options[visfeed_stripe_data_image]' size='40' type='text' value='{$options['visfeed_stripe_data_image']}' />";
}
// TEXTBOX - Name: visfeed_Plugin_options[visfeed_Confirmation_BusName]
function visfeed_setting7_string_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<input id='visfeed_Confirmation_BusName' name='visfeed_Plugin_options[visfeed_Confirmation_BusName]' size='40' type='text' value='{$options['visfeed_Confirmation_BusName']}' />";
}

// TEXTBOX - Name: visfeed_Plugin_options[visfeed_Confirmation_Email_from]
function visfeed_setting8_string_fn() {
	$options = get_option('visfeed_Plugin_options');
	echo "<input id='visfeed_Confirmation_Email_from' name='visfeed_Plugin_options[visfeed_Confirmation_Email_from]' size='40' type='text' value='{$options['visfeed_Confirmation_Email_from']}' />";
}





// Display the admin options page
function visfeed_options_page_fn() {
?>
	<div class="wrap">
		<div class="icon32" id="icon-options-general"><br></div>
		<h2>Visfeed Options Page</h2>
		Visfeed requires some basic settings to connect to the host provider and access your Visbridge account.
		<form action="options.php" method="post">
		<?php settings_fields('visfeed_plugin_options_grp'); ?>
		<?php do_settings_sections(__FILE__); ?>
		<p class="submit">
			<input name="Submit" type="submit" class="button-primary" value="<?php esc_attr_e('Save Changes'); ?>" />
		</p>
		</form>
	</div>
<?php
}

// Validate user data for some/all of your input fields
function plugin_options_validate($input) {
	// Check our textbox option field contains no HTML tags - if so strip them out
	$input['visfeed_ServiceURL_text_string'] =  wp_filter_nohtml_kses($input['visfeed_ServiceURL_text_string']);	
	return $input; // return validated input
}



/**********************************************************************************/ 



function add_visfeed_scripts() {
        $options = get_option('visfeed_Plugin_options');
        
        wp_enqueue_script( 'moment', plugins_url( '/js/moment.min.js', __FILE__ ), array ('jquery'),false, false);
        wp_enqueue_script( 'fullcalendar',plugins_url( '/js/fullcalendar.js', __FILE__ ), array (),false, false);
        
        wp_enqueue_style( 'fullcalendarbase', plugins_url( '/css/fullcalendar.css', __FILE__ ), array (),false, 'all');
        wp_enqueue_style( 'fullcalendarPrintcss', plugins_url( '/css/fullcalendar.print.css', __FILE__ ), array (),false, 'print');
        wp_enqueue_style( 'visfeed-localcss', plugins_url( '/css/visfeed.css', __FILE__ ), array (),false, false);
       
        
        wp_enqueue_script( 'bootstrap-js',plugins_url( '/js/bootstrap.min.js', __FILE__ ), array (),'3.3.7', true);
        wp_enqueue_script( 'visfeed',plugins_url( '/js/visfeed_1_4.js', __FILE__ ), array (),false, false);
        wp_enqueue_script( 'datetimepicker',plugins_url( '/js/bootstrap-datetimepicker.js', __FILE__ ), array (),false, false);
        wp_enqueue_style( 'bootstrap-css', plugins_url( '/css/bootstrap.min.css', __FILE__ ), array (),false, false);
        wp_enqueue_style( 'datetimepicker-css', plugins_url( '/css/bootstrap-datetimepicker.css', __FILE__ ), array (),false, false);
        
        
        
        }

/**********************************************************************************/ 

/**********************************************************************************/ 


   
 function visfeed_calendar_func($atts) {
    
  //Settings from the global options page   
  $options = get_option('visfeed_Plugin_options');
    $token = $options['visfeed_Token_text_string']; 
    $Ownerid = $options['visfeed_Ownerid_text_string']; 
    //$Loadcss = $options['visfeed_CSSLoad_chk']; 
    $LoadCalbox = $options['visfeed_CalendarDiv_chk']; 
    $LoadInstructbox = $options['visfeed_InstructDiv_chk']; 
    $LoadDtPicker = $options['visfeed_InstructPicker_chk'];
    $requestBoxid=$options['visfeed_Instructbox_id'];
    $requestInstruct = $options['visfeed_bookingrequestInstruct_text']; 
    $dialogText = $options['visfeed_bookingdialogText_text']; 
    $dialogComplete = $options['visfeed_bookingdialogCompleteText_text']; 
    $dialogpaymentInstruct = $options['visfeed_paymentInstruct_text']; 
    
    $stripeImage = $options['visfeed_stripe_data_image']; 
    $stripeName = $options['visfeed_stripe_data_name']; 
    
    $ConfirmationBusName =  $options['visfeed_Confirmation_BusName']; 
    $ConfirmationEmailFrom =  $options['visfeed_Confirmation_Email_from']; 
    
  //Settings for each shortcode instance 
    
  //Holy Crap man! these variables need to be lower case or they don't work!! No CaMel case! that was about 4 hours of my life not well spent.
    $atts = shortcode_atts(
		array(
                    'property_id' => 125,
                    'property_description' => 'property description',
                    'costperunit' => 1,
                    'requestflownum' => 1,
                    'bookingrequestbuttext' => 'Next',
                    'calcolor' => '#16a085',
                    'corediscount1' => 0,
                    'corediscount2' => 0,
                    'corediscount3' => 0,
                    'corediscount4' => 0,
                    'corediscount5' => 0,
                    'corediscount6' => 0,
                    'specialadditive' => 0,
                    'units' => 'hours',
                    'ics_usedirect' => 0,
                    'ics_name' => 'loc263_125',
                    'calendar_view_string' => 'agendaWeek,agendaDay',
                    'calendar_view_default' => 'agendaWeek',
                    'caltheming' => 0,
                    'calpressdelay' => 175,
                    'businesshours' => 0, //m-f 9am-5pm if set to 1
                    'booking_application' => 1,
                    'deposit_first' => 0,
                    'taxfee'=> 0
                  
                    ), $atts, 'visfeed_cal' );

         
       ?>
           
           
           
            <script>
                
               //var myserviceURL =  ''; 
              
              // var myresourceURL =  ''; 
              
              // var myvisfeedURL = ''; 
              
               var mytoken =  '<?php echo $token; ?>'; 
               var myownerid =  '<?php echo $Ownerid; ?>'; 
              // var myloadcss =  '<?php echo $Loadcss; ?>'; 
               
               var myloadcalbox =  '<?php echo $LoadCalbox; ?>'; 
               var myloadinstructbox =  '<?php echo $LoadInstructbox; ?>'; 
               var myloaddatepicker = '<?php echo $LoadDtPicker; ?>'; 
               
               var myload_bootstrap = false;
               
               var myload_fullcalendar = false;  
               var myload_visfeed = false;       
               
               //if(myloadcss === 'on'){
                       // myload_bootstrap = true; //now always enqueing bootstrap v1.2.2
                       // myload_fullcalendar = true;
                      //  myload_visfeed = true;
                   // }
               
               
               //Below is the divs for the calendar component and instructions
               var myloadcal = false;
               var myloadinst = false;
               var myloadpicker = false;
               
                    if(myloadcalbox === 'on'){
                        myloadcal = true;
                    }
                    if(myloadinstructbox === 'on'){
                        myloadinst = true;
                    }
                    if(myloaddatepicker === 'on'){
                        myloadpicker = true;
                    }
               
               var mypropertyid = <?php echo $atts['property_id']; ?>;
               var mypropertydescription = '<?php echo $atts['property_description']; ?>';
               var myunits = '<?php echo $atts['units']; ?>';
               var mycostperunit = <?php echo $atts['costperunit']; ?>;
               var myRequestflownumber = <?php echo $atts['requestflownum']; ?>;
               
               var mybookingRequestButText = '<?php echo $atts['bookingrequestbuttext'];?>';
               var mycalcolor = '<?php echo $atts['calcolor'];?>';
               var mycorediscount1 = <?php echo $atts['corediscount1']; ?>;
               var mycorediscount2 = <?php echo $atts['corediscount2']; ?>;
               var mycorediscount3 = <?php echo $atts['corediscount3']; ?>;
               var mycorediscount4 = <?php echo $atts['corediscount4']; ?>;
               var mycorediscount5 = <?php echo $atts['corediscount5']; ?>;
               var mycorediscount6 = <?php echo $atts['corediscount6']; ?>;
               var myspecialAdditive = <?php echo $atts['specialadditive']; ?>;
               var mycalpressdelay = <?php echo $atts['calpressdelay']; ?>;
               
               var myics_useDirect = <?php echo $atts['ics_usedirect']; ?>;
               var myicsbool = false;
                if(myics_useDirect > 0 ){
                   myicsbool = true; 
                }
                    
               var mycaltheming = <?php echo $atts['caltheming']; ?>;
               var mycalthemingbool = false;
                if(mycaltheming > 0 ){
                   mycalthemingbool = true; 
                }     
                    
                    
                    
               var myics_name = '<?php echo $atts['ics_name']; ?>';
               var mycalendar_view_string = '<?php echo $atts['calendar_view_string']; ?>';
               var mycalendar_view_default = '<?php echo $atts['calendar_view_default']; ?>';
               
               var myrequestbox = '<?php echo $requestBoxid; ?>';
               var myrequestInstructs = '<?php echo $requestInstruct; ?>'; 
               var mydialogText = '<?php echo $dialogText; ?>'; 
               var mydialogComplete = '<?php echo $dialogComplete; ?>';
               var mypaymentInstruct = '<?php echo $dialogpaymentInstruct; ?>';
              
              
               var mystripe_image = '<?php echo $stripeImage; ?>';
               var mystripe_name = '<?php echo $stripeName; ?>';
               
               var myConfBusName = '<?php echo $ConfirmationBusName; ?>';
               var myConfEmail = '<?php echo $ConfirmationEmailFrom; ?>';
               
               var mybusinesshours = <?php echo $atts['businesshours']; ?>;
                var mybizhourbool = false;
                if(mybusinesshours > 0 ){
                   mybizhourbool = true; 
                }     
               
               var mytaxfee = <?php echo $atts['taxfee']; ?>;
               
               var mybooking_application = <?php echo $atts['booking_application']; ?>;
               var mydeposit_first = <?php echo $atts['deposit_first']; ?>;
                 
               
                 jQuery(document).ready(function($) {
                        $.visfeed({
                           
                  /*global*/ownerid: myownerid,//pull from global
                            propertyid: mypropertyid,
                            property_description: mypropertydescription,
                            usertoken: mytoken,//pull from global
                            costperunit:mycostperunit,
                            units:myunits,
                            bookingRequestButText: mybookingRequestButText,
                            calcolor: mycalcolor,
                            calpressdelay: mycalpressdelay,
                  /*global*///serviceURL: myserviceURL, //pull from global
                            //resourceURL:myresourceURL,//must stay guestavo.com
                            //visfeedURL:myvisfeedURL,
                            corediscount1:mycorediscount1,
                            corediscount2:mycorediscount2,        //corediscount2 - apply on  1.5 hours i.e. 8.5% on each hour
                            corediscount3:mycorediscount3,       //apply on two hours i.e. 12.5% on each hour
                            corediscount4:mycorediscount4,        //apply on 3 hours  i.e. 25% on each hour
                            corediscount5:mycorediscount5,         // 33% on each 
                            corediscount6:mycorediscount6,        //38% on each hour
                            specialAdditive:myspecialAdditive,
                            requestflownum: myRequestflownumber,
                            
                  /*global*/stripe_data_name:mystripe_name,
                  /*global*/stripe_data_image: mystripe_image,
                            //Confirmation Parameters ****************************************
                  /*global*/Confirmation_BusName: myConfBusName,
                  /*global*/Confirmation_Email_from: myConfEmail,
                            bookingRequestArea: myrequestbox,
                            bookingrequestInstruct: myrequestInstructs,
                            bookingdialogText: mydialogText,
                            bookingdialogCompleteText: mydialogComplete,
                            paymentrequestInstruct:mypaymentInstruct,

                            calendarthemeing:mycalthemingbool,

                            calendar_view_string: mycalendar_view_string,
                            calendar_view_default: mycalendar_view_default,
                            ics_useDirect: myicsbool,
                            ics_name: myics_name,

                            //Agreement Parameters ****************************************
                            Agreement_required: true,
                            AgreementAccept1Butid:"ElectroAccept",
                            AgreementAccept2Butid:"TermsAgree",
                            AgreementButtonText:"Agree",
                            AgreementTitile:"Terms and Conditions",
                            Agreement_RequireInfo:true,
                            //Request vs. Straight thru instant booking flow choices ******

                           
                           //Loading of js and css
                           Load_Bootstrap: myload_bootstrap,
                           Load_fullcalendar: myload_fullcalendar,
                           Load_visfeed: myload_visfeed,
                           Load_Picker: false,
                           Load_Stripe: true,
                           
                           Load_calendarbox: myloadcal,
                           Load_instructionbox: myloadinst,
                           Load_datepicker: myloadpicker,
                           
                           businesshours: mybizhourbool,
                           booking_application: mybooking_application,
                           deposit_first: mydeposit_first,
                           taxfee: mytaxfee
                          //To use a specific ics feed set ics_useDirect to true and 
                          //pass ics_name - file ics_url_stub: already points to default calendar folder
                          
                            
                          });
                    });
            </script>
       <?php
        
   }

