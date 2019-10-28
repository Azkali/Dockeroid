import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:dockeroid/logic/app_descriptor.dart';
import 'package:dockeroid/logic/app_info.dart';
import 'package:dockeroid/logic/preferences.dart';
import 'package:dockeroid/logic/server_config.dart';
import 'package:dockeroid/logic/utils.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../main.dart';
import 'app_form/app_form.dart';
import 'list_with_context_menu.dart';
import 'menu.dart';

class StatusWidget extends StatefulWidget {
	StatusWidget({Key key}) : super(key: key);

	@override
	_StatusWidgetState createState() => _StatusWidgetState();
}

class _StatusWidgetState extends State<StatusWidget> {
	Timer _timer;
	List<AppInfo> _lastApps;
	Future<List<AppInfo>> _appsFuture;
	Future<ServerConfig> _serverConfigFuture = Preferences().getServerConfig();

	@override
	void initState() {
		super.initState();

		Preferences().on(Preferences.serverConfigChanged, this, (event, data){
			setState(() {
				this._serverConfigFuture = Future.value(event.eventData);
				this._appsFuture = null;
			});
		});
	}

	void _refreshApps([bool doSetState = true]){
		if(doSetState){
			setState(() => this._refreshApps(false));
		} else {
			this._appsFuture = this._serverConfigFuture.then((config) async {
				await Future.delayed(Duration(seconds: 2));
				return AppInfo.fetch(config);
			});
		}
	}

	void _resetTimerRefresh(){
		this._timer?.cancel();
		this._timer = Timer.periodic(Duration(seconds: 15), (Timer t) => this._refreshApps());
	}

	Widget _drawApps(BuildContext context, List<AppInfo> apps, ServerConfig serverConfig){
		return ListWithContextMenu<AppInfo>( apps ?? [],
			itemsWidgetFactory: (app) => ListTile(
				title: Row(
					crossAxisAlignment: CrossAxisAlignment.end,
					children: [
						Text(app.appName),
						SizedBox(width: 5),
						Text(app.key, style: TextStyle(
							color: Theme.of(context).disabledColor,
							fontSize: 12))]),
				leading: CircleAvatar(child: app.icon != null ?
					NetworkImage(app.icon) : 
					Text(getInitials(app.appName))),
				subtitle: Row(
						children: [
							Text('Version '),
							Chip(label: Text(app.version)),
							SizedBox(width: 8),
							Text('Type '),
							Chip(label: Text(getAppTypeLabel(app.type)))])),
			menuItemsFactory: (app) => [
				PopupMenuItem(
					value: 'stop',
					child: FlatButton(
						onPressed: () async {
							Navigator.pop(context);
							print('Stopping app ${app.key}');
							await app.stop(serverConfig);
							this._refreshApps();
						},
						child: Row(
							children: <Widget>[
								Icon(Icons.stop),
								Text("Stop")])))]);
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
				title: Text("Running apps"),
				actions: <Widget>[
					FlatButton(child: Icon(Icons.refresh), onPressed: this._refreshApps)]),
			body: Builder(builder: (context) => Center(
				// Center is a layout widget. It takes a single child and positions it
				// in the middle of the parent.
				child: FutureBuilder(
					future: this._serverConfigFuture,
					builder: (context, snapshot){
						if(snapshot.connectionState != ConnectionState.done){
							return CircularProgressIndicator();
						}

						if(snapshot.data == null){
							return Text('Please select a server.');
						} else {
							this._resetTimerRefresh();
							this._refreshApps(false);

							final ServerConfig serverConfig = snapshot.data;
							return FutureBuilder(
								future: this._appsFuture,
								builder: (context, snapshot){
									if(snapshot.connectionState != ConnectionState.done){
										if(this._lastApps != null){
											return Column(
												mainAxisSize: MainAxisSize.max,
												children: [
													Container(child: LinearProgressIndicator(), height: 10),
													Expanded(child: this._drawApps(context, this._lastApps, serverConfig))]);
										} else {
											return CircularProgressIndicator();
										}
									}

									if(snapshot.hasError){
										return Text('Oops, an error occured. ${snapshot.error.toString()}');
									} else if(snapshot.data == null){
										this._lastApps = null;
										return Text('Oops');
									} else {
										// Save the context for http query fails notifications

										final apps = snapshot.data as List<AppInfo>;
										this._lastApps = apps;
										return this._drawApps(context, apps, serverConfig);
									}
								});
						}}))),
			floatingActionButton: FloatingActionButton(
				onPressed: () async {
					final config = await this._serverConfigFuture;
					Navigator.push(context, MaterialPageRoute(builder: (context) => AppFormWidget(config)));
				},
				tooltip: 'Increment',
				child: Icon(Icons.add)),
			drawer: FutureBuilder(
				future: this._serverConfigFuture,
				builder: (context, snapshot){
					if(snapshot.connectionState != ConnectionState.done){
						return CircularProgressIndicator();
					} else {
						return Menu(snapshot.data, (server) async {
							setState((){
								this._serverConfigFuture = Future.value(server);
							});
							await Preferences().setServerConfig(server);
						});
					}
				}));
	}

	@override
	void dispose() {
		this._timer?.cancel();
		super.dispose();
	}
}
