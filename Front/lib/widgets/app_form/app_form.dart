import 'dart:convert';

import 'package:dockeroid/logic/app_descriptor.dart';
import 'package:dockeroid/logic/server_config.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart';

class AppFormWidget extends StatefulWidget {
	final ServerConfig currentConfig;

	AppFormWidget(this.currentConfig, {Key key}) : super(key: key);

	@override
	_AppFormWidgetState createState() => _AppFormWidgetState();
}

class _AppFormWidgetState extends State<AppFormWidget> {
	AppDescriptor _currentAppDescriptor;
	String _version;

	static String appDescriptorToString(AppDescriptor descriptor){
		return descriptor.name + '%%' + descriptor.type.toString() + '%%' + json.encode(descriptor.versions);
	}

	Future<List<AppDescriptor>> _listApps() async {
		final targetUri = this.widget.currentConfig.uri.resolve('app/list');
		print(targetUri.toString());
		final response = await get(targetUri);
		print(response.body);
		if(response.statusCode >= 200 && response.statusCode < 400){
			final entries = json.decode(response.body) as List<dynamic>;
			return entries.map((entry) => AppDescriptor.fromJson(entry)).toList();
		} else {
			throw new ClientException('Received invalid code ${response.statusCode}', targetUri);
		}
	}
	
	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(
				title: Text("Start app")),
			body: Center(child: FutureBuilder(
				builder: (context, AsyncSnapshot<List<AppDescriptor>> snapshot){
					switch (snapshot.connectionState) {
						case ConnectionState.none:
							return Text('Press button to start.');
						case ConnectionState.active:
						case ConnectionState.waiting:
							return Text('Fetching apps...');
						case ConnectionState.done:
							if (snapshot.hasError) {
								return Text('Error: ${snapshot.error}');
							}

							final Map<String, AppDescriptor> appDescriptors = snapshot.data.fold({}, (acc, appDescriptor){
								final appKey = _AppFormWidgetState.appDescriptorToString(appDescriptor);
								if(acc.containsKey(appKey)){
									throw new Error();
								}
								acc[appKey] = appDescriptor;
								return acc;
							});
							return Column(
								children: <Widget>[
									Text('App'),
									DropdownButton(
										items: [
											DropdownMenuItem(value: '', child: Text('Please select')),
											...appDescriptors.entries
												.map((appDescriptorKvp) => DropdownMenuItem(value: appDescriptorKvp.key, child: Text(appDescriptorKvp.value.name))),
										],
										onChanged: (appDesc) => this.setState((){
											if(appDesc == ''){
												this._currentAppDescriptor = null;	
												this._version = null;
											} else {
												this._currentAppDescriptor = appDescriptors[appDesc];
												this._version = this._currentAppDescriptor.versions.last;
											}
										}),
										value: this._currentAppDescriptor == null ? '' :_AppFormWidgetState.appDescriptorToString(this._currentAppDescriptor)),
									Text('Version'),
									DropdownButton(
										items: this._currentAppDescriptor?.versions?.map((v) => DropdownMenuItem(value: v, child: Text(v)))?.toList(),
										onChanged: (version) => this.setState((){
											this._version = version;
										}),
										value: this._version),
									RaisedButton(
										onPressed: this._currentAppDescriptor != null && this._version != null ? () async {
											final targetUrl = this.widget.currentConfig.resolve('docker/start/${this._currentAppDescriptor.name}/${this._version}');
											print(targetUrl);
											final response = await get(targetUrl);
											print(response.body);
											if(response.statusCode < 200 || response.statusCode >= 400){
												throw new Error();
											}
											// TODO: Parse response & print new app id to the snackbar
										} : null,
										child: Text('Start app'))
								]);
					}

					throw Error();
				},
				future: 
				// Future.value([
				// 	AppDescriptor('Foo', EAppType.Docker, ['0.0.1', '0.1.0']),
				// 	AppDescriptor('Bar', EAppType.Docker, ['1.0.0', '2.0.0']),
				// ])
				this._listApps(),
			)));
	}
}
