<!DOCTYPE html>
<html lang="$ContentLocale" class="no-js">
	<head>

		<% base_tag %>

		<title><% if $MetaTitle %>$MetaTitle &raquo;<% else_if $Title %>$Title &raquo;<% end_if %> $SiteConfig.Title</title>

		<% if MetaDescription %><meta name="description" content="$MetaDescription" /><% end_if %>

		<meta charset="utf-8" />

		<meta http-equiv="X-UA-Compatible" content="IE=edge" />

		<meta name="HandheldFriendly" content="True" />
		<meta name="MobileOptimized" content="320" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta http-equiv="cleartype" content="on" />

		<link rel="stylesheet" type="text/css" href="$ThemeDir/css/style.min.css" />

		$MetaTags(false)
	</head>
	<body>

		<% include PageHead %>

		$Layout

		<% include PageFoot %>

	</body>
</html>
