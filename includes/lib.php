<?php

function heib_sanitize_lab($data){
	if(is_array($data)){
		foreach($data as $key => $val){
			$data[$key] = heib_sanitize_lab($val);
		}
	} else {
		$data = stripslashes($data);
	}
	//stripslashes
	return $data;
}