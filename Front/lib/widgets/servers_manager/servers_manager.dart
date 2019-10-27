import 'package:dockeroid/logic/preferences.dart';
import 'package:dockeroid/logic/server_config.dart';
import 'package:flutter/material.dart';

import '../../main.dart';
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
		this.currentConfigId = Preferences.getServerConfigId();
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
									return ListView(
										children: servers.map((serverConfig) => GestureDetector(
											onTapUp: (tapInfos){
												ServerFormModal.openForm(context, () => setState(() {
													this.serverConfigs = ServerConfig.getServerConfigs();
													Scaffold
														.of(context)
														.showSnackBar(SnackBar(content: Text('Server updated')));
												}), serverConfig);
											},
											onDoubleTap: (){
												Preferences.setServerConfig(serverConfig);
												setState(() {
													this.currentConfigId = Future.value(serverConfig.id);
												});
											},
											onLongPressStart: (longPressInfos){
												return showMenu(
													items: <PopupMenuEntry>[
														PopupMenuItem(
															value: 'delete',
															child: FlatButton(
																onPressed: () async {
																	Navigator.pop(context);
																	Scaffold
																		.of(context)
																		.showSnackBar(SnackBar(content: Text('Server removed')));
																	print('Removing config with id ${serverConfig.id}');
																	await serverConfig.remove();
																	setState(() {
																		this.serverConfigs = ServerConfig.getServerConfigs();
																	});
																},
																child: Row(
																	children: <Widget>[
																		Icon(Icons.delete),
																		Text("Delete")])))],
													context: context,
													// From https://stackoverflow.com/a/54714628/4839162
													position: RelativeRect.fromRect(
														longPressInfos.globalPosition & Size(40, 40), // smaller rect, the touch area
														// From https://stackoverflow.com/a/52319524/4839162
														Offset.zero & MediaQuery.of(context).size// Bigger rect, the entire screen
													),
													);
											},
											child: ListTile(
												title: Text(defaultCondifId == serverConfig.id ?
													serverConfig.label + ' (default)' :
													serverConfig.label),
												subtitle: Text(serverConfig.resolve()),
												leading: CircleAvatar(
													child: Text(serverConfig.label
														.splitMapJoin(
															RegExp(r'(?:^|\W)(\w)'),
															onMatch: (m) => m.group(1)[0].toUpperCase(),
															onNonMatch: (m) => ''),
													style: defaultCondifId == serverConfig.id ?
														TextStyle(fontWeight: FontWeight.bold) :
														null,)),
												trailing: Icon(Icons.edit)))).toList());
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
