import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:dockeroid/logic/app_descriptor.dart';
import 'package:dockeroid/logic/app_info.dart';
import 'package:dockeroid/logic/server_config.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../main.dart';
import 'app_form/app_form.dart';
import 'menu.dart';

class StatusWidget extends StatefulWidget {
	StatusWidget({Key key}) : super(key: key);

	@override
	_StatusWidgetState createState() => _StatusWidgetState();
}

class _StatusWidgetState extends State<StatusWidget> {
	static final String currentConfigKey = 'currentConfig';

	String endpoint = '/docker/list';
	List<AppInfo> _apps = [];
	bool loading = false;
	Timer timer;
	ServerConfig currentConfig;

	@override
	void initState() {
		super.initState();

		SharedPreferences.getInstance().then((prefs) async {
			final configId = prefs.getInt(_StatusWidgetState.currentConfigKey) ?? null;
			if(configId != null){
				setState(() {
					this.loading = true;
				});
				print('Restoring server config $configId');
				final config = await ServerConfig.findConfig(configId);
				if(config != null){
					setState(() {
						this.currentConfig = config;
					});
				} else {
					print('Server config $configId restoration failed, clear the preference');
					await prefs.remove(_StatusWidgetState.currentConfigKey);
				}
			}
		});
	}

	Future<List<AppInfo>> _fetchCurrentContainers(BuildContext context) async  {
		this.setState((){
			this.loading = true;
		});
		final response = await _get(context, 'docker/list');
		final entries = json.decode(response.body) as Map<String, dynamic>;
		return entries.entries.map((entry) => AppInfo.fromJson(entry.key, entry.value)).toList();
	}

	Future<Response> _get(BuildContext context, String url) async {
		try {
			final response = await get(this.currentConfig.resolve(url));
			return response;
		} on SocketException catch (e) {
			Scaffold.of(context).showSnackBar(SnackBar(content:Text('An errror occured')));

			return null;
		}
	}

	void _resetTimerRefresh(BuildContext context){
		this.timer?.cancel();
		this.timer = Timer.periodic(Duration(seconds: 15), (Timer t) => this._updateCurrentContainers(context));
	}

	Future<List<AppInfo>> _updateCurrentContainers(BuildContext context) async {
		final apps = await this._fetchCurrentContainers(context);
		this._resetTimerRefresh(context);
		this.setState((){
			this._apps = apps;
			this.loading = false;
		});
		return apps;
	}
	
	Future<void> _stopApp(BuildContext context, AppInfo appInfo) async {
		this.setState((){
			this.loading = true;
		});
		try {
			await _get(context, 'docker/stop/${appInfo.key}');
		} on SocketException catch(e) {
			Scaffold.of(context).showSnackBar(SnackBar(content:Text('An errror occured')));
		}
		this.setState((){
			this.loading = false;
		});
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
					Center(child: this.loading ? InkWell(
						child: CircularProgressIndicator(
							backgroundColor: Colors.blue,
						),
					) : Builder(builder: (context) => InkWell(
						child: Icon(Icons.refresh),
						onTap: () => this._updateCurrentContainers(context),
					))),
					SizedBox(width: 10),
				],

			),
			body: Builder(builder: (context) => Center(
				// Center is a layout widget. It takes a single child and positions it
				// in the middle of the parent.
				child: this.currentConfig == null ?
					Text('Please select a server from the menu') :
					FutureBuilder(
						future: this._updateCurrentContainers(context),
						builder: (context, snapshot){
							// Save the context for http query fails notifications
							this._resetTimerRefresh(context);
							return ListView.builder(
								itemBuilder: (context, i){

									// Get the app of the iteration
									final runningAppInfos = this._apps[i];
									final key = Key(runningAppInfos.key);
									return Dismissible(
										key: key,
										onDismissed: (direction) async {
											if(direction == DismissDirection.endToStart){
												print('Killing app ${runningAppInfos.appName}');
												await this._stopApp(context, runningAppInfos);
												await this._updateCurrentContainers(context);
											}
										},
										child: Row(
											children: [
												Text(runningAppInfos.appName, style: TextStyle(fontSize: 25),),
												Text(runningAppInfos.version),
												Text(runningAppInfos.type == EAppType.Docker ? "Docker" : 'Unknown')]),
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
														child: Text('Stop the app', style: TextStyle(color: Colors.white))),
													Icon(Icons.cancel, color: Colors.white,)
												])));
								},
								itemCount: this._apps.length);
						}))),
			floatingActionButton: FloatingActionButton(
				onPressed: this.currentConfig == null ? null : () => Navigator.push(context, MaterialPageRoute(builder: (context) => AppFormWidget(this.currentConfig))),
				tooltip: 'Increment',
				child: Icon(Icons.add)),
			drawer: Menu(this.currentConfig, (server) async {
				setState((){
					this.currentConfig = server;
				});
				final prefs = await SharedPreferences.getInstance();
				prefs.setInt(_StatusWidgetState.currentConfigKey, server.id);
			}));
	}

	@override
	void dispose() {
		this.timer?.cancel();
		super.dispose();
	}
}
