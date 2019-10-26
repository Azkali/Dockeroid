import 'package:flutter/material.dart';

import '../main.dart';
import 'servers_manager/servers_manager.dart';

class Menu extends StatelessWidget {
	@override
	Widget build(BuildContext context) {
		return Drawer(
			child: Column(
				children: <Widget>[
					Divider(),
					Text("Favourite servers"),
					InkWell(
						child: Text("http://10.0.2.2:3000"),
						onTap: () => globalState.baseUrl = "http://10.0.2.2:3000",
					),
					InkWell(
						child: Row(
							children: <Widget>[
								Icon(Icons.settings),
								Text("Manage favourite servers")
							],
						),
						onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => ServerManagerWidget())),
					),
					Divider(),
				],
			),
		);
	}
}
