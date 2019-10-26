import 'package:flutter/material.dart';

import './widgets/status.dart';
import 'logic/app_global_state.dart';

void main() => runApp(MyApp());

const redColor = Color(0xFFD25454);
/* Colors
Green/blue: 85CCAD
Cyan: 8CF1FF
Dark turquoise: 1A5D66
Red: D25454
Pink: FF8CC5
*/

final globalState = AppGlobalState();

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
	return MaterialApp(
	  title: 'Flutter Demo',
	  theme: ThemeData(
		// This is the theme of your application.
		//
		// Try running your application with "flutter run". You'll see the
		// application has a blue toolbar. Then, without quitting the app, try
		// changing the primarySwatch below to Colors.green and then invoke
		// "hot reload" (press "r" in the console where you ran "flutter run",
		// or simply save your changes to "hot reload" in a Flutter IDE).
		// Notice that the counter didn't reset back to zero; the application
		// is not restarted.
		primarySwatch: MaterialColor(
			Color.fromRGBO(133, 204, 173, 1).value,
			{
				50: Color.fromRGBO(133, 204, 173, 0.95),
				100: Color.fromRGBO(133, 204, 173, 0.9),
				200: Color.fromRGBO(133, 204, 173, 0.8),
				300: Color.fromRGBO(133, 204, 173, 0.7),
				400: Color.fromRGBO(133, 204, 173, 0.6),
				500: Color.fromRGBO(133, 204, 173, 0.5),
				600: Color.fromRGBO(133, 204, 173, 0.4),
				700: Color.fromRGBO(133, 204, 173, 0.3),
				800: Color.fromRGBO(133, 204, 173, 0.2),
				900: Color.fromRGBO(133, 204, 173, 0.1),
			}
		),
	  ),
	  home: StatusWidget(),
	);
  }
}
