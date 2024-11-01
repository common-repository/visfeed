<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}

function visfeed_delete_plugin() {
	global $wpdb;

	delete_option( 'visfeed_Plugin_options' );

	
	$table_name = $wpdb->prefix . "Visfeed";

	$wpdb->query( "DROP TABLE IF EXISTS $table_name" );
}

visfeed_delete_plugin();

?>