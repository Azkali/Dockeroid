import 'package:dockeroid/logic/docker_app_info.dart';

import 'app_descriptor.dart';

class AppInfo {
	final String key;
	final String appName;
	final String version;
	final EAppType type;
	final AppDescriptor appDescriptor;

	const AppInfo({this.key, this.type, this.appName, this.version, this.appDescriptor});

	factory AppInfo.fromJson(String key, dynamic content){
		final type = content['type'];

		switch(type){
			case "docker":
				return new DockerAppInfo(key: key, appName: content['appName'], image: content['image'], type: EAppType.Docker, version: content['version']);
		}
	}
}
