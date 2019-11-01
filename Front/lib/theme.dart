
import 'package:flutter/material.dart';

const greenBlueColor = Color(0xFF85CCAD);
const cyanColor = Color(0xFF8CF1FF);
const darkTurquoiseColor = Color(0xFF1A5D66);
const redColor = Color(0xFFD25454);
const pinkColor = Color(0xFFFF8CC5);

Map<int, Color> _generatePalette(Color color){
	return Map.fromEntries([50,100,200,300,400,500,600,700,800,900]
		.map((shade) => MapEntry(shade, Color.fromRGBO(color.red, color.green, color.blue, 1.0 - (shade / 1000.0)))));
}

MaterialColor _generateMaterialColor(Color color){
	return MaterialColor(
		color.value,
		_generatePalette(color)
	);
}

final theme = ThemeData(
	// This is the theme of your application.
	//
	// Try running your application with "flutter run". You'll see the
	// application has a blue toolbar. Then, without quitting the app, try
	// changing the primarySwatch below to Colors.green and then invoke
	// "hot reload" (press "r" in the console where you ran "flutter run",
	// or simply save your changes to "hot reload" in a Flutter IDE).
	// Notice that the counter didn't reset back to zero; the application
	// is not restarted.
	primarySwatch: _generateMaterialColor(greenBlueColor),
);
