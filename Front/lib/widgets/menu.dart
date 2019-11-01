import 'package:dockeroid/logic/server_config.dart';
import 'package:flutter/material.dart';

import 'servers_manager/servers_manager.dart';

class Menu extends StatelessWidget {
	final ServerConfig serverConfig;
	final void Function(ServerConfig) setServer;

	Menu(this.serverConfig, this.setServer);

	List<Widget> listServers(BuildContext context, List<ServerConfig> servers){
		return <Widget>[
			ListTile(title: Text("Favourite servers")),
			...servers.map((server)=> InkWell(
				child: ListTile(
					dense: true,
					selected: this.serverConfig == server,
					title: Text(server.label)),
				onTap: () => this.setServer(server))),
			ListTile(
				leading: Icon(Icons.settings),
				title: Text("Manage favourite servers"),
				onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => ServerManagerWidget())))];
	}

	@override
	Widget build(BuildContext context) {
		return Drawer(
			child: Column(
				mainAxisSize: MainAxisSize.max,
				children: [
					ListView(
						padding: EdgeInsets.zero,
						shrinkWrap: true,
						children: [
							DrawerHeader(
								child: Text('Drawer Header'),
								decoration: BoxDecoration(
									color: Theme.of(context).accentColor)),

							FutureBuilder(future: ServerConfig.getServerConfigs(), builder: (context, AsyncSnapshot<List<ServerConfig>> snapshot){
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
											mainAxisSize: MainAxisSize.min,
											crossAxisAlignment: CrossAxisAlignment.stretch,
											children: this.listServers(context, snapshot.data));
								}

								throw new Error();
							})]),
					

							Expanded(
								child: Align(
									alignment: FractionalOffset.bottomCenter,
									child: Padding(
										padding: EdgeInsets.only(bottom: 10.0),
										child: ListTile(
											leading: Icon(Icons.restore_page),
											title: Text("Reset database"),
											onTap: () async {
												print('Reseting databases');
												await ServerConfig.dropDatabase();
												await ServerConfig.createDatabase();
											}
										))))]));
	}
}
