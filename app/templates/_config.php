<?php

global $project;
$project = 'mysite';

require_once('conf/ConfigureFromEnv.php');

// Set the site locale
i18n::set_locale('en_GB');

// Editor options

HtmlEditorConfig::get('cms')->setButtonsForLine(1, 'formatselect', 'styleselect', 'bold', 'italic', 'underline', 'separator', 'bullist', 'numlist', 'separator', 'outdent', 'indent', 'separator', 'image', 'sslink', 'undo', 'redo', 'pastetext', 'code');
HtmlEditorConfig::get('cms')->setButtonsForLine(2);
HtmlEditorConfig::get('cms')->setButtonsForLine(3);
HtmlEditorConfig::get('cms')->setOption('paste_text_sticky', TRUE);
HtmlEditorConfig::get('cms')->setOption('theme_advanced_blockformats', 'p,h2,h3,h4,blockquote', TRUE);
HtmlEditorConfig::get('cms')->setOption('theme_advanced_styles', 'Lede=lede');

// Improve GD image resample quality.

GD::set_default_quality(80);

// Add LiveReload if on dev.

if (Director::isDev()) {
	Requirements::javascript('http://localhost:35729/livereload.js?snipver=1');
}
