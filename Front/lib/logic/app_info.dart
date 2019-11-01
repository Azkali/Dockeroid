import 'dart:convert';

import 'package:dockeroid/logic/docker_app_info.dart';
import 'package:dockeroid/logic/server_config.dart';
import 'package:http/http.dart';

import 'app_descriptor.dart';
import 'net_utils.dart';

class AppInfo {
	final String key;
	final String icon;
	final String appName;
	final String version;
	final EAppType type;
	final AppDescriptor appDescriptor;

	const AppInfo({this.key, this.type, this.appName, this.version, this.appDescriptor, this.icon});

	factory AppInfo.fromJson(String key, dynamic content){
		final type = content['type'];

		switch(type){
			case "docker":
				return new DockerAppInfo(key: key, appName: content['appName'], image: content['image'], type: EAppType.Docker, version: content['version']);
		}

		throw Error();
	}


	static Future<List<AppInfo>> fetch(ServerConfig server) async  {
		return httpGetServer<List<AppInfo>>(
			server,
			'docker/list',
			transform: (entries) => (entries as Map<String, dynamic>).entries.map((entry) => AppInfo.fromJson(entry.key, entry.value)).toList());
	}

	Future<void> stop(ServerConfig server) async {
		return httpGetServer<void>(server, 'docker/stop/${this.key}');
	}
}
