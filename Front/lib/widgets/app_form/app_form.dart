import 'dart:convert';

import 'package:dockeroid/logic/app_descriptor.dart';
import 'package:dockeroid/logic/net_utils.dart';
import 'package:dockeroid/logic/server_config.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart';

class AppFormWidget extends StatefulWidget {
	final ServerConfig currentConfig;
	final void Function(BuildContext formScreen) onAppStarted;

	AppFormWidget(this.currentConfig, this.onAppStarted, {Key key}) : super(key: key);

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
									Padding(
										padding: EdgeInsets.all(8.0),
										child: Table(
											columnWidths: {0: IntrinsicColumnWidth(), 1: FixedColumnWidth(5), 2: FlexColumnWidth()},
											defaultVerticalAlignment: TableCellVerticalAlignment.middle,
											children: [
												TableRow(children: [
													Text('App'),
													SizedBox(width: 5),
													DropdownButton(
														isExpanded: true,
														items: [
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
														hint: Text('Please select'),
														value: this._currentAppDescriptor == null ? null :_AppFormWidgetState.appDescriptorToString(this._currentAppDescriptor))]),
												TableRow(children: [
													Text('Version'),
													SizedBox(width: 5),
													DropdownButton(
														isExpanded: true,
														items: this._currentAppDescriptor?.versions?.map((v) => DropdownMenuItem(value: v, child: Text(v)))?.toList(),
														onChanged: (version) => this.setState((){
															this._version = version;
														}),
														hint: Text('Select an app first'),
														value: this._version)])]))]);
					}

					throw Error();
				},
				future: 
				// Future.value([
				// 	AppDescriptor('Foo', EAppType.Docker, ['0.0.1', '0.1.0']),
				// 	AppDescriptor('Bar', EAppType.Docker, ['1.0.0', '2.0.0']),
				// ])
				this._listApps(),
			)),
			floatingActionButton: Builder(builder: (context) => FloatingActionButton(
				onPressed: this._currentAppDescriptor != null && this._version != null ? () async {
					try{
						print(await httpGet(this.widget.currentConfig, 'docker/start/${this._currentAppDescriptor.name}/${this._version}'));

						this.widget.onAppStarted(context);
					} catch(e){
						print('fail: ${e.toString()}');
						Widget snackWidget;
						if(e is DockeroidClientException){
							print(e.body);
							if(e.body.contains('port is already allocated')){
								snackWidget = SnackBar(content: Text('The port is already allocated.'));
							} else {
								snackWidget = SnackBar(content: Text('The server had an unknown error.'));
							}
						} else {
							snackWidget = SnackBar(content: Text('An unknown even occured.'));
						}
						Scaffold.of(context).showSnackBar(snackWidget);
					}
				} : null,
				tooltip: 'Start',
				child: Icon(Icons.play_arrow))));
	}
}
