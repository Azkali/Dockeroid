import 'package:dockeroid/logic/server_config.dart';
import 'package:dockeroid/widgets/app_form/app_selector.dart';
import 'package:flutter/material.dart';

import 'theme.dart';
import './widgets/status.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
	// This widget is the root of your application.
	@override
	Widget build(BuildContext context) {
		return MaterialApp(
			title: 'Flutter Demo',
			theme: theme,
			home: StatusWidget());
			// home: AppSelector(ServerConfig('My server', Uri(host: '10.0.2.2', port: 4000, scheme: 'http')), (app){
			// 	print('Selected app ${app.name}');
			// }));
	}
}
