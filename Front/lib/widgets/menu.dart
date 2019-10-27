import 'package:dockeroid/logic/server_config.dart';
import 'package:flutter/material.dart';

import '../main.dart';
import 'servers_manager/servers_manager.dart';

class Menu extends StatelessWidget {
	final ServerConfig serverConfig;
	final void Function(ServerConfig) setServer;

	Menu(this.serverConfig, this.setServer);

	List<Widget> listServers(BuildContext context, List<ServerConfig> servers){
		return <Widget>[
			Text("Favourite servers"),
			...servers.map((server)=> InkWell(
				child: Container(
					color: this.serverConfig == server ? redColor : null,
					child: Padding(
						padding: EdgeInsets.all(8),
						child: Text(server.label),
					),
				),
				onTap: () => this.setServer(server),
			)),
			InkWell(
				child: Row(
					children: <Widget>[
						Icon(Icons.settings),
						Text("Manage favourite servers")
					],
				),
				onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => ServerManagerWidget())),
			),
		];
	}

	@override
	Widget build(BuildContext context) {
		return Drawer(
			child: FutureBuilder(future: ServerConfig.getServerConfigs(), builder: (context, AsyncSnapshot<List<ServerConfig>> snapshot){
				switch (snapshot.connectionState) {
					case ConnectionState.none:
						return Text('Press button to start.');
					case ConnectionState.active:
					case ConnectionState.waiting:
						return Text('Awaiting result...');
					case ConnectionState.done:
						if (snapshot.hasError) {
							return Text('Error: ${snapshot.error}');
						}

						return Column(
							mainAxisSize: MainAxisSize.max,
							crossAxisAlignment: CrossAxisAlignment.stretch,
							children: <Widget>[
								Divider(),
								...this.listServers(context, snapshot.data),
								Divider(),
								InkWell(
									child: Row(
										children: <Widget>[
											Icon(Icons.restore_page),
											Text("Reset database")
										]),
									onTap: () async {
										print('Reseting databases');
										await ServerConfig.dropDatabase();
										await ServerConfig.createDatabase();
									})]);
				}
			}));
	}
}
