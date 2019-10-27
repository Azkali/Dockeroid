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

								final servers = snapshot.data;
								return ListView.builder(
									itemBuilder: (context, i){
										final serverConfig = servers[i];
										final key = Key(serverConfig.label);
										return Dismissible(
											key: key,
											onDismissed: (direction) async {
												print('Dismissed: $i, $direction');
												if(direction == DismissDirection.endToStart){
													print('Deleting server config ${serverConfig.label}');
													await serverConfig.remove();
												} else if(direction == DismissDirection.startToEnd){
													await ServerFormModal.openForm(context, serverConfig);
												}
											},
											child: Column(
												children: [
													Text(serverConfig.label),
													Row(
														children: [
															Text(serverConfig.resolve()),
														])]),
											background: Container(),
											secondaryBackground: Container(
												//padding: const EdgeInsets.only(right: 12),
												alignment: Alignment.centerRight,
												color: redColor,
												child: Row(
													mainAxisSize: MainAxisSize.min,
													children: const <Widget>[
														Padding(
															padding: const EdgeInsets.only(right: 8),
															child: Text('Stop the app', style: TextStyle(color: Colors.white))
														),
														Icon(Icons.cancel, color: Colors.white,)
													])));
									},
									itemCount: servers.length,
								);
						}
						return null; // unreachable
					}))),
			floatingActionButton: Builder(
				builder: (context) => FloatingActionButton(
					onPressed: () => ServerFormModal.openForm(context),
					tooltip: 'Add a server config',
					child: Icon(Icons.add),
				)));
	}
}
