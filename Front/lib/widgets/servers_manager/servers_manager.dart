import 'package:dockeroid/logic/preferences.dart';
import 'package:dockeroid/logic/server_config.dart';
import 'package:dockeroid/logic/utils.dart';
import 'package:flutter/material.dart';

import '../list_with_context_menu.dart';
import 'server_form_modal.dart';

class ServerManagerWidget extends StatefulWidget {
	ServerManagerWidget({Key key}) : super(key: key);

	@override
	_ServerManagerWidgetState createState() => _ServerManagerWidgetState();
}

class _ServerManagerWidgetState extends State<ServerManagerWidget> {
	Future<List<ServerConfig>> serverConfigs;
	Future<int> currentConfigId;

	@override
	void initState() {
		super.initState();
		this.serverConfigs = ServerConfig.getServerConfigs();
		this.currentConfigId = Preferences().getServerConfig().then((config) => config?.id);
	}

	@override
	Widget build(BuildContext context) {
		// This method is rerun every time setState is called, for instance as done
		// by the _incrementCounter method above.
		//
		// The Flutter framework has been optimized to make rerunning build methods
		// fast, so that you can just rebuild anything that needs updating rather
		// than having to individually change instances of widgets.
		return Scaffold(
			appBar: AppBar(
				// Here we take the value from the MyHomePage object that was created by
				// the App.build method, and use it to set our appbar title.
				title: Text("Servers"),
				actions: <Widget>[
				],

			),
			body: Builder(
				builder: (context) => Center(
					child: FutureBuilder(
						future: Future.wait([this.serverConfigs, this.currentConfigId]),
						builder: (context, AsyncSnapshot<List<dynamic>> snapshot){
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


									final servers = snapshot.data[0] as List<ServerConfig>;
									final defaultCondifId = snapshot.data[1] as int;
									return ListWithContextMenu<ServerConfig>(servers,
										itemsWidgetFactory: (server) => ListTile(
												title: Text(defaultCondifId == server.id ?
													server.label + ' (default)' :
													server.label),
												subtitle: Text(server.resolve()),
												leading: CircleAvatar(
													child: Text(
														getInitials(server.label),
														style: defaultCondifId == server.id ?
															TextStyle(fontWeight: FontWeight.bold) :
															null)),
												trailing: Icon(Icons.edit)),
										menuItemsFactory: (server) => [
											PopupMenuItem(
												value: 'delete',
												child: FlatButton(
													onPressed: () async {
														Navigator.pop(context);
														Scaffold
															.of(context)
															.showSnackBar(SnackBar(content: Text('Server removed')));
														print('Removing config with id ${server.id}');
														await server.remove();
														setState(() {
															this.serverConfigs = ServerConfig.getServerConfigs();
														});
													},
													child: Row(
														children: <Widget>[
															Icon(Icons.delete),
															Text("Delete")])))],
										onTap: (server, tapInfos){
											ServerFormModal.openForm(context, () async {
												Scaffold
													.of(context)
													.showSnackBar(SnackBar(content: Text('Server updated')));
												setState(() {
													this.serverConfigs = ServerConfig.getServerConfigs();
												});
												await Preferences().getServerConfig();
											}, server);
										},
										onDoubleTap: (server){
											Preferences().setServerConfig(server);
											setState(() {
												this.currentConfigId = Future.value(server.id);
											});
										});
							}
							return null; // unreachable
					}))),
			floatingActionButton: Builder(
				builder: (context) => FloatingActionButton(
					onPressed: () => ServerFormModal.openForm(context, () => setState(() {
						this.serverConfigs = ServerConfig.getServerConfigs();
						Scaffold
							.of(context)
							.showSnackBar(SnackBar(content: Text('Server saved')));
					})),
					tooltip: 'Add a server config',
					child: Icon(Icons.add),
				)));
	}
}
