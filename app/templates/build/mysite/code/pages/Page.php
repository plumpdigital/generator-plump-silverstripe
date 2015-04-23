<?php

class Page extends SiteTree {

	/**
	 *    Auto-generates the most appropriate CMS field type for
	 *    the specified data field.
	 *
	 *    @param string fieldName Name of the data field.
	 *    @param string title Title for the field, defaults to being auto-generated.
	 */
	protected function scaffoldField($fieldName, $title = NULL) {
		$dbObject = $this->dbObject($fieldName);
		if ($dbObject == NULL) {
			throw new Exception("Cannot scaffold field $fieldName", 1);
		}
		return $dbObject->scaffoldFormField($title);
	}

}

class Page_Controller extends ContentController {

	public function init() {
		parent::init();
		Requirements::css("{$this->ThemeDir()}/css/style.min.css", 'screen,projection');
		Requirements::javascript("{$this->ThemeDir()}/js/main.min.js");
	}

}
