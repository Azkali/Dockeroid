import 'dart:async';
import 'dart:convert';

import 'package:dockeroid/logic/app_info.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../main.dart';
import 'menu.dart';

class StatusWidget extends StatefulWidget {
	StatusWidget({Key key}) : super(key: key);

	@override
	_StatusWidgetState createState() => _StatusWidgetState();
}

class _StatusWidgetState extends State<StatusWidget> {
	String endpoint = '/docker/list';
	List<AppInfo> _apps = [];
	bool loading = false;
	Timer timer;

	_StatusWidgetState(){
		this._resetTimerRefresh();
	}

	Future<List<AppInfo>> _fetchCurrentContainers() async  {
		this.setState((){
			this.loading = true;
		});
		await new Future.delayed(const Duration(seconds: 2));
		final response = await http.get('${globalState.baseUrl}/docker/list');
		final entries = json.decode(response.body) as Map<String, dynamic>;
		return entries.entries.map((entry) => AppInfo.fromJson(entry.key, entry.value)).toList();
	}

	void _resetTimerRefresh(){
		this.timer?.cancel();
		this.timer = Timer.periodic(Duration(seconds: 15), (Timer t) => this._updateCurrentContainers());
	}

	Future<void> _updateCurrentContainers() async {
		final apps = await this._fetchCurrentContainers();
		this._resetTimerRefresh();
		this.setState((){
			this._apps = apps;
			this.loading = false;
		});
	}
	
	Future<void> _stopApp(AppInfo appInfo) async {
		this.setState((){
			this.loading = true;
		});
		await http.get('${globalState.baseUrl}/docker/stop/${appInfo.key}');
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
				title: Text("Currently running applications"),
				actions: <Widget>[
					Center(child: this.loading ? InkWell(
						child: CircularProgressIndicator(
							backgroundColor: Colors.blue,
						),
					) : InkWell(
						child: Icon(Icons.refresh),
						onTap: () => this._updateCurrentContainers(),
					)),
					SizedBox(width: 10),
				],

			),
			body: Center(
				// Center is a layout widget. It takes a single child and positions it
				// in the middle of the parent.
				child: ListView.builder(
					itemBuilder: (context, i){
						final runningAppInfos = this._apps[i];
						final key = Key(runningAppInfos.key);
						return Dismissible(
							key: key,
							onDismissed: (direction) async {
								print('Dismissed: $i, $direction');
								if(direction == DismissDirection.endToStart){
									print('Killing app ${runningAppInfos.appName}');
									await this._stopApp(runningAppInfos);
									await this._updateCurrentContainers();
								}
							},
							child: Row(
								children: [
									Text(runningAppInfos.appName, style: TextStyle(fontSize: 25),),
									Text(runningAppInfos.version),
									Text(runningAppInfos.type == EAppType.Docker ? "Docker" : 'Unknown'),
								],
							),
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
									],
								),
							),
						);
					},
					itemCount: this._apps.length,
				),
			),
			floatingActionButton: FloatingActionButton(
				onPressed: () => print('Pressed'),
				tooltip: 'Increment',
				child: Icon(Icons.add),
			), // This trailing comma makes auto-formatting nicer for build methods.
			drawer: Menu(),
		);
	}

	@override
	void dispose() {
		this.timer?.cancel();
		super.dispose();
	}
}
